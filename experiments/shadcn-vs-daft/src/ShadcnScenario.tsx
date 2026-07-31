import { useMemo, useState } from "react"
import {
  Activity,
  Boxes,
  Check,
  ChevronRight,
  CircleGauge,
  Clock3,
  CloudCog,
  Copy,
  Ellipsis,
  GitBranch,
  LayoutDashboard,
  Plus,
  Rocket,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  TerminalSquare,
  Users,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/shadcn/components/ui/avatar"
import { Badge } from "@/shadcn/components/ui/badge"
import { Button } from "@/shadcn/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shadcn/components/ui/dropdown-menu"
import { Input } from "@/shadcn/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/shadcn/components/ui/input-group"
import { Label } from "@/shadcn/components/ui/label"
import { Progress } from "@/shadcn/components/ui/progress"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/shadcn/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shadcn/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/components/ui/tabs"
import { Textarea } from "@/shadcn/components/ui/textarea"
import { TooltipProvider } from "@/shadcn/components/ui/tooltip"
import {
  filterDeployments,
  filters,
  kpis,
  type DeploymentFilter,
  type DeploymentStatus,
  type Environment,
} from "@/scenario-data"

const navigation = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Deployments", icon: Rocket },
  { label: "Services", icon: Boxes },
  { label: "Environments", icon: CloudCog },
  { label: "Team access", icon: Users },
]

function StatusBadge({ status }: { status: DeploymentStatus }) {
  if (status === "Failed") return <Badge variant="destructive">Failed</Badge>
  if (status === "Building") return <Badge variant="secondary">Building</Badge>
  return <Badge variant="outline">Healthy</Badge>
}

function DeploymentDialog({ onQueued }: { onQueued: (environment: Environment) => void }) {
  const [open, setOpen] = useState(false)
  const [environment, setEnvironment] = useState<Environment>("Production")

  function submitDeployment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onQueued(environment)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus data-icon="inline-start" />
          New deployment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submitDeployment} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>New deployment</DialogTitle>
            <DialogDescription>
              Promote a release to the selected environment.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="shadcn-service">Service</Label>
            <Input id="shadcn-service" defaultValue="Checkout API" />
          </div>

          <fieldset className="grid gap-2">
            <Label asChild>
              <legend>Environment</legend>
            </Label>
            <div className="flex gap-2">
              {(["Production", "Preview"] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  variant={environment === option ? "default" : "outline"}
                  aria-pressed={environment === option}
                  onClick={() => setEnvironment(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="shadcn-branch">Release target</Label>
              <span className="text-xs text-muted-foreground">Official Input Group</span>
            </div>
            <InputGroup>
              <InputGroupAddon>
                <GitBranch />
                <InputGroupText>acme/checkout ·</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput id="shadcn-branch" defaultValue="release/2025-06-18" />
            </InputGroup>
            <p className="text-xs text-muted-foreground">Repository and release branch</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="shadcn-notes">Release notes</Label>
            <Textarea
              id="shadcn-notes"
              defaultValue="Promote checkout resilience fixes after canary verification."
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Queue deployment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ShadcnScenario() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<DeploymentFilter>("all")
  const [queued, setQueued] = useState<Environment | null>(null)
  const visibleDeployments = useMemo(
    () => filterDeployments(filter, query),
    [filter, query],
  )

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="offcanvas">
          <SidebarHeader className="border-b p-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <TerminalSquare />
                    </span>
                    <span className="grid flex-1 text-left leading-tight">
                      <span className="font-semibold">Acme Cloud</span>
                      <span className="text-xs text-muted-foreground">Release workspace</span>
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Operations</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.active}
                        tooltip={item.label}
                      >
                        <a href="#" onClick={(event) => event.preventDefault()}>
                          <item.icon />
                          <span>{item.label}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Audit log">
                      <a href="#" onClick={(event) => event.preventDefault()}>
                        <ShieldCheck />
                        <span>Audit log</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Settings">
                      <a href="#" onClick={(event) => event.preventDefault()}>
                        <Settings />
                        <span>Settings</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <button type="button" className="w-full">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">MC</AvatarFallback>
                    </Avatar>
                    <span className="grid flex-1 text-left leading-tight">
                      <span className="font-semibold">Maya Chen</span>
                      <span className="text-xs text-muted-foreground">Platform lead</span>
                    </span>
                    <ChevronRight />
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="min-w-0">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <SidebarTrigger />
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="hidden text-muted-foreground sm:inline">Acme Cloud</span>
              <ChevronRight className="hidden size-3.5 text-muted-foreground sm:block" />
              <span className="truncate font-medium">Release Operations</span>
            </div>
            <Badge variant="outline" className="ml-auto hidden sm:inline-flex">Live</Badge>
            <Avatar className="size-7 md:hidden">
              <AvatarFallback>MC</AvatarFallback>
            </Avatar>
          </header>

          <main className="flex min-w-0 flex-1 flex-col gap-5 p-4 md:p-6">
            <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Production workspace
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">Release Operations</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Monitor service health and coordinate production changes.
                </p>
              </div>
              <DeploymentDialog onQueued={setQueued} />
            </section>

            {queued && (
              <Card role="status" className="border-emerald-500/30 bg-emerald-500/5">
                <CardContent className="flex items-start gap-3 p-4">
                  <Check className="mt-0.5 size-4 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium">Deployment queued</p>
                    <p className="text-sm text-muted-foreground">
                      Checkout API will deploy to {queued} after verification.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <section className="grid gap-3 md:grid-cols-3" aria-label="Release metrics">
              {kpis.map((kpi, index) => (
                <Card key={kpi.label}>
                  <CardHeader className="gap-1 pb-2">
                    <div className="flex items-center justify-between gap-3">
                      <CardDescription>{kpi.label}</CardDescription>
                      {index === 0 ? <Rocket className="size-4 text-muted-foreground" /> : index === 1 ? <Clock3 className="size-4 text-muted-foreground" /> : <CircleGauge className="size-4 text-muted-foreground" />}
                    </div>
                    <CardTitle className="text-2xl">{kpi.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={kpi.tone === "success" ? "outline" : "secondary"}>{kpi.change}</Badge>
                      <span className="text-xs text-muted-foreground">{kpi.detail}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>

            <Card>
              <CardHeader className="gap-4 border-b">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <CardTitle>Deployments</CardTitle>
                    <CardDescription>Latest changes across all release environments.</CardDescription>
                  </div>
                  <div className="w-full max-w-sm">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <Label htmlFor="shadcn-search" className="sr-only">Search deployments</Label>
                      <span className="ml-auto text-[11px] text-muted-foreground">Official Input Group</span>
                    </div>
                    <InputGroup>
                      <InputGroupAddon><Search /></InputGroupAddon>
                      <InputGroupInput
                        id="shadcn-search"
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search service, commit, or owner…"
                      />
                    </InputGroup>
                  </div>
                </div>
                <Tabs value={filter} onValueChange={(value) => setFilter(value as DeploymentFilter)}>
                  <TabsList variant="line" aria-label="Filter deployments">
                    {filters.map((item) => (
                      <TabsTrigger key={item.value} value={item.value}>{item.label}</TabsTrigger>
                    ))}
                  </TabsList>
                  {filters.map((item) => (
                    <TabsContent
                      key={item.value}
                      value={item.value}
                      forceMount
                      hidden={filter !== item.value}
                      className="sr-only"
                    >
                      Deployment table filtered to {item.label}.
                    </TabsContent>
                  ))}
                </Tabs>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Commit</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Deployed</TableHead>
                      <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleDeployments.map((deployment) => (
                      <TableRow key={`${deployment.service}-${deployment.release}`}>
                        <TableCell>
                          <div className="font-medium">{deployment.service}</div>
                          <div className="text-xs text-muted-foreground">{deployment.release} · {deployment.environment}</div>
                        </TableCell>
                        <TableCell><StatusBadge status={deployment.status} /></TableCell>
                        <TableCell className="font-mono text-xs">{deployment.commit}</TableCell>
                        <TableCell>{deployment.actor}</TableCell>
                        <TableCell>{deployment.duration}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{deployment.deployed}</TableCell>
                        <TableCell className="w-10">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon-sm" variant="ghost" aria-label={`Actions for ${deployment.service}`}>
                                <Ellipsis />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{deployment.service}</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem><Activity />View deployment</DropdownMenuItem>
                              <DropdownMenuItem><RotateCcw />Redeploy</DropdownMenuItem>
                              <DropdownMenuItem><Copy />Copy commit SHA</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {visibleDeployments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                          No deployments match this search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>Release health</CardTitle>
                    <CardDescription>24 of 25 deploys completed without rollback.</CardDescription>
                  </div>
                  <Badge variant="outline">96% healthy</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Progress value={96} aria-label="Release health: 96 percent" />
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  <div><span className="text-muted-foreground">Window</span><p className="font-medium">Last 24 hours</p></div>
                  <div><span className="text-muted-foreground">Rollback budget</span><p className="font-medium">1 remaining</p></div>
                  <div><span className="text-muted-foreground">Next freeze</span><p className="font-medium">Friday, 16:00 UTC</p></div>
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
