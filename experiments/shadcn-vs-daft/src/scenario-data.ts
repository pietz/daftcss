export type Environment = "Production" | "Preview"
export type DeploymentStatus = "Healthy" | "Building" | "Failed"
export type DeploymentFilter = "all" | "production" | "preview" | "failed"

export type Deployment = {
  service: string
  release: string
  environment: Environment
  status: DeploymentStatus
  commit: string
  actor: string
  duration: string
  deployed: string
}

export const deployments: Deployment[] = [
  {
    service: "Checkout API",
    release: "rel-2025.06.18-3",
    environment: "Production",
    status: "Healthy",
    commit: "8f42a91",
    actor: "Maya Chen",
    duration: "2m 14s",
    deployed: "4 min ago",
  },
  {
    service: "Web storefront",
    release: "rel-2025.06.18-2",
    environment: "Production",
    status: "Healthy",
    commit: "3c91bd8",
    actor: "Eli Brooks",
    duration: "3m 08s",
    deployed: "18 min ago",
  },
  {
    service: "Billing worker",
    release: "pr-1842",
    environment: "Preview",
    status: "Building",
    commit: "b076df2",
    actor: "Noor Patel",
    duration: "1m 36s",
    deployed: "31 min ago",
  },
  {
    service: "Search index",
    release: "rel-2025.06.18-1",
    environment: "Production",
    status: "Failed",
    commit: "d91ae07",
    actor: "Maya Chen",
    duration: "48s",
    deployed: "47 min ago",
  },
  {
    service: "Admin console",
    release: "pr-1837",
    environment: "Preview",
    status: "Healthy",
    commit: "46f80ce",
    actor: "Eli Brooks",
    duration: "2m 51s",
    deployed: "1 hr ago",
  },
  {
    service: "Identity gateway",
    release: "rel-2025.06.17-7",
    environment: "Production",
    status: "Healthy",
    commit: "a51c443",
    actor: "Noor Patel",
    duration: "1m 59s",
    deployed: "2 hr ago",
  },
]

export const filters: { value: DeploymentFilter; label: string }[] = [
  { value: "all", label: "All 6" },
  { value: "production", label: "Production 4" },
  { value: "preview", label: "Preview 2" },
  { value: "failed", label: "Failed 1" },
]

export const kpis = [
  {
    label: "Successful deploys",
    value: "24",
    change: "+14%",
    detail: "Across production and preview",
    tone: "success",
  },
  {
    label: "Median lead time",
    value: "6m 42s",
    change: "−1m 18s",
    detail: "Commit to healthy production",
    tone: "success",
  },
  {
    label: "Change failure rate",
    value: "4.2%",
    change: "Within target",
    detail: "Target below 5%",
    tone: "neutral",
  },
] as const

export function filterDeployments(filter: DeploymentFilter, query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  return deployments.filter((deployment) => {
    const matchesFilter =
      filter === "all" ||
      deployment.environment.toLowerCase() === filter ||
      (filter === "failed" && deployment.status === "Failed")
    const searchable = Object.values(deployment).join(" ").toLowerCase()
    return matchesFilter && (!normalizedQuery || searchable.includes(normalizedQuery))
  })
}
