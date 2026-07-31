import {
  Activity,
  Boxes,
  ChevronRight,
  CircleGauge,
  Clock3,
  CloudCog,
  Copy,
  Ellipsis,
  GitBranch,
  LayoutDashboard,
  PanelLeft,
  Plus,
  Rocket,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  SquareTerminal,
  Users,
  X,
  createIcons,
} from "lucide"

import {
  filterDeployments,
  filters,
  kpis,
  type Deployment,
  type DeploymentFilter,
  type DeploymentStatus,
  type Environment,
} from "./scenario-data"

const iconSet = {
  Activity,
  Boxes,
  ChevronRight,
  CircleGauge,
  Clock3,
  CloudCog,
  Copy,
  Ellipsis,
  GitBranch,
  LayoutDashboard,
  PanelLeft,
  Plus,
  Rocket,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  SquareTerminal,
  Users,
  X,
}

let activeFilter: DeploymentFilter = "all"
let activeEnvironment: Environment = "Production"
let searchQuery = ""

function statusClass(status: DeploymentStatus) {
  if (status === "Failed") return "badge destructive"
  if (status === "Building") return "badge secondary"
  return "badge outline"
}

function renderMetricCards() {
  const container = document.querySelector<HTMLElement>("#metric-grid")
  if (!container) return
  const metricIcons = ["rocket", "clock-3", "circle-gauge"]
  container.innerHTML = kpis
    .map(
      (kpi, index) => `
        <article class="metric-card">
          <div class="metric-heading">
            <small>${kpi.label}</small>
            <i data-lucide="${metricIcons[index]}" aria-hidden="true"></i>
          </div>
          <p class="metric-value">${kpi.value}</p>
          <div class="metric-meta">
            <span class="badge ${kpi.tone === "success" ? "outline" : "secondary"}">${kpi.change}</span>
            <small class="muted text-xs">${kpi.detail}</small>
          </div>
        </article>
      `,
    )
    .join("")
}

function rowMarkup(deployment: Deployment, index: number) {
  return `
    <tr>
      <td class="service-cell">
        <strong>${deployment.service}</strong>
        <small>${deployment.release} · ${deployment.environment}</small>
      </td>
      <td><span class="${statusClass(deployment.status)}">${deployment.status}</span></td>
      <td class="wide-column"><code>${deployment.commit}</code></td>
      <td class="owner-column">${deployment.actor}</td>
      <td class="duration-column">${deployment.duration}</td>
      <td class="text-right muted">${deployment.deployed}</td>
      <td class="actions-cell">
        <details class="dropdown" name="deployment-actions"${index >= 2 ? ' data-placement="top"' : ""}>
          <summary class="ghost icon" aria-label="Actions for ${deployment.service}">
            <i data-lucide="ellipsis" aria-hidden="true"></i>
          </summary>
          <ul dir="rtl">
            <li class="label">${deployment.service}</li>
            <li role="separator"></li>
            <li><a href="#"><i data-lucide="activity" aria-hidden="true"></i>View deployment</a></li>
            <li><a href="#"><i data-lucide="rotate-ccw" aria-hidden="true"></i>Redeploy</a></li>
            <li><a href="#"><i data-lucide="copy" aria-hidden="true"></i>Copy commit SHA</a></li>
          </ul>
        </details>
      </td>
    </tr>
  `
}

function renderDeployments() {
  const tbody = document.querySelector<HTMLTableSectionElement>("#deployment-rows")
  if (!tbody) return
  const visible = filterDeployments(activeFilter, searchQuery)
  tbody.innerHTML = visible.length
    ? visible.map(rowMarkup).join("")
    : '<tr class="empty-row"><td colspan="7">No deployments match this search.</td></tr>'
  createIcons({ icons: iconSet })
}

function renderFilters() {
  const group = document.querySelector<HTMLElement>("#deployment-filters")
  if (!group) return
  group.innerHTML = filters
    .map(
      (filter) => `
        <button type="button" class="outline" data-filter="${filter.value}" aria-pressed="${filter.value === activeFilter}">
          ${filter.label}
        </button>
      `,
    )
    .join("")
  group.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-filter]")
    if (!button) return
    activeFilter = button.dataset.filter as DeploymentFilter
    group.querySelectorAll("button").forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    )
    renderDeployments()
  })
}

function initializeDialog() {
  const dialog = document.querySelector<HTMLDialogElement>("#deployment-dialog")
  const form = document.querySelector<HTMLFormElement>("#deployment-form")
  const status = document.querySelector<HTMLElement>("#queued-status")
  if (!dialog || !form || !status) return

  document.querySelector("#open-deployment-dialog")?.addEventListener("click", () => dialog.showModal())
  document.querySelector("#cancel-deployment")?.addEventListener("click", () => dialog.close())
  dialog.querySelector('[aria-label="Close"]')?.addEventListener("click", () => dialog.close())

  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const message = status.querySelector("p")
    if (message) {
      message.textContent = `Checkout API will deploy to ${activeEnvironment} after verification.`
    }
    status.hidden = false
    dialog.close()
  })

  form.querySelector("#environment-group")?.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button")
    if (!button) return
    activeEnvironment = button.textContent?.trim() as Environment
    button.parentElement?.querySelectorAll("button").forEach((item) => {
      const selected = item === button
      item.setAttribute("aria-pressed", String(selected))
      item.classList.toggle("outline", !selected)
    })
  })
}

function applyTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return
  if (event.data?.type !== "comparison:set-theme") return
  if (event.data.theme === "light" || event.data.theme === "dark") {
    applyTheme(event.data.theme)
  }
})

const deploymentSearch = document.querySelector<HTMLInputElement>("#daft-search")

deploymentSearch?.addEventListener("input", (event) => {
  searchQuery = (event.currentTarget as HTMLInputElement).value
  renderDeployments()
})

deploymentSearch?.form?.addEventListener("submit", (event) => event.preventDefault())
document.querySelector<HTMLFormElement>("#release-lookup-form")?.addEventListener("submit", (event) => event.preventDefault())

document.querySelector<HTMLButtonElement>("#clear-daft-search")?.addEventListener("click", () => {
  if (!deploymentSearch) return
  deploymentSearch.value = ""
  searchQuery = ""
  renderDeployments()
  deploymentSearch.focus()
})

document.addEventListener("click", (event) => {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href="#"]')
  if (link) event.preventDefault()
})

renderMetricCards()
renderFilters()
renderDeployments()
initializeDialog()
createIcons({ icons: iconSet })
