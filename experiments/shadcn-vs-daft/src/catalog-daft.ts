import {
  Archive,
  CircleHelp,
  Copy,
  Ellipsis,
  PanelTopOpen,
  Plus,
  Search,
  X,
  createIcons,
} from "lucide"

createIcons({ icons: { Archive, CircleHelp, Copy, Ellipsis, PanelTopOpen, Plus, Search, X } })

const dialog = document.querySelector<HTMLDialogElement>("#catalog-dialog")
document.querySelector("#open-catalog-dialog")?.addEventListener("click", () => dialog?.showModal())
document.querySelector("#close-catalog-dialog")?.addEventListener("click", () => dialog?.close())
document.querySelector("#dismiss-catalog-dialog")?.addEventListener("click", () => dialog?.close())

document.querySelector<HTMLButtonElement>("#clear-catalog-filter")?.addEventListener("click", () => {
  const input = document.querySelector<HTMLInputElement>("#catalog-filter")
  if (!input) return
  input.value = ""
  input.focus()
})

document.addEventListener("click", (event) => {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
  if (link) event.preventDefault()
})

function applyTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin || event.data?.type !== "comparison:set-theme") return
  if (event.data.theme === "light" || event.data.theme === "dark") applyTheme(event.data.theme)
})

function reportHeight() {
  const content = document.querySelector("main")
  const height = content ? Math.ceil(content.getBoundingClientRect().bottom + window.scrollY) : document.body.scrollHeight
  window.parent.postMessage(
    { type: "comparison:height", height },
    window.location.origin,
  )
}

new ResizeObserver(reportHeight).observe(document.body)
window.addEventListener("load", reportHeight)
requestAnimationFrame(reportHeight)
