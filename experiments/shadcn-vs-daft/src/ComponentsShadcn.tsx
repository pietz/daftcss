import { useState } from "react"
import {
  Archive,
  Check,
  CircleHelp,
  Copy,
  Ellipsis,
  PanelTopOpen,
  Plus,
  Search,
  X,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/shadcn/components/ui/avatar"
import { Badge } from "@/shadcn/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shadcn/components/ui/breadcrumb"
import { Button } from "@/shadcn/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shadcn/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shadcn/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shadcn/components/ui/dropdown-menu"
import { Input } from "@/shadcn/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/shadcn/components/ui/input-group"
import { Label } from "@/shadcn/components/ui/label"
import { Progress } from "@/shadcn/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shadcn/components/ui/table"
import { Textarea } from "@/shadcn/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shadcn/components/ui/tooltip"

function CatalogDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="outline"><PanelTopOpen data-icon="inline-start" />Open dialog</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Share component catalog</DialogTitle><DialogDescription>Copy a stable reference link for this comparison.</DialogDescription></DialogHeader>
        <p className="text-sm">Anyone with the link can open the catalog in their browser.</p>
        <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button>Copy link</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ComponentsShadcn() {
  const [range, setRange] = useState("Week")
  const [alertEnabled, setAlertEnabled] = useState(true)

  return (
    <TooltipProvider>
      <main className="shadcn-catalog" aria-labelledby="catalog-title">
        <header className="shadcn-catalog-header">
          <div><p>shadcn/ui</p><h1 id="catalog-title">Component catalog</h1><span>Composed from the pinned Radix Nova snapshot.</span></div>
          <Badge variant="outline">Reference</Badge>
        </header>

        <section aria-labelledby="type-title"><header className="section-heading"><h2 id="type-title">Typography &amp; content</h2><p>The document scale alongside representative reading content.</p></header><div className="shadcn-grid">
          <div className="span-5 shadcn-type-scale"><h1>Heading one</h1><h2>Heading two</h2><h3>Heading three</h3><h4>Heading four</h4><h5>Heading five</h5><h6>Heading six</h6></div>
          <div className="span-7 shadcn-prose"><h3>Prose</h3><p>shadcn compositions pair a utility layer with generated components. This paragraph includes an <a href="#content-example">inline link</a>, <strong>strong emphasis</strong>, and <code>inline code</code>.</p><blockquote>“A small semantic vocabulary can still make an interface feel deliberate.”</blockquote><div className="shadcn-grid"><ul className="span-6"><li>Composable building blocks</li><li>Native document structure</li></ul><ol className="span-6"><li>Choose a component</li><li>Compose the page</li></ol></div><pre><code>{'const release = "v1.20.1";\nconsole.log(release);'}</code></pre></div>
        </div></section>

        <section aria-labelledby="actions-title"><header className="section-heading"><h2 id="actions-title">Actions &amp; identity</h2><p>Buttons, status labels, avatars, and joined controls.</p></header><div className="shadcn-grid">
          <div className="span-7"><h3>Buttons</h3><div className="catalog-actions"><Button>Save changes</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button><Button variant="ghost">Ghost</Button><Button variant="destructive">Delete</Button><Button variant="link">Learn more</Button></div><div className="catalog-actions"><Button size="sm">Small</Button><Button><Plus data-icon="inline-start" />Create item</Button><Button size="lg">Large action</Button><Button size="icon" variant="ghost" aria-label="Search"><Search /></Button><Button size="icon" variant="outline" aria-label="Copy link"><Copy /></Button><Button disabled>Disabled</Button><Button disabled><span className="shadcn-spinner" aria-hidden="true" />Saving</Button></div></div>
          <div className="span-5"><h3>Badges &amp; avatars</h3><div className="catalog-actions"><Badge>Default</Badge><Badge variant="secondary">Draft</Badge><Badge variant="outline">Review</Badge><Badge variant="outline" className="catalog-success">Healthy</Badge><Badge variant="secondary">Pending</Badge><Badge variant="destructive">Failed</Badge></div><div className="catalog-actions"><Avatar size="sm"><AvatarFallback>MC</AvatarFallback></Avatar><Avatar><AvatarFallback>JL</AvatarFallback></Avatar><Avatar size="lg"><AvatarFallback>AS</AvatarFallback></Avatar><span className="text-sm text-muted-foreground">Assigned reviewers</span></div></div>
          <div className="span-12"><h3>Joined group &amp; input group</h3><div className="catalog-actions"><div className="shadcn-button-group" role="group" aria-label="Preview range">{["Day", "Week", "Month"].map((item) => <Button key={item} type="button" variant={range === item ? "default" : "outline"} onClick={() => setRange(item)} aria-pressed={range === item}>{item}</Button>)}</div><InputGroup className="max-w-sm"><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput aria-label="Search components" placeholder="Search components" /><InputGroupAddon align="inline-end"><InputGroupButton aria-label="Clear search"><X /></InputGroupButton></InputGroupAddon></InputGroup></div></div>
        </div></section>

        <section aria-labelledby="surfaces-title"><header className="section-heading"><h2 id="surfaces-title">Surfaces &amp; feedback</h2><p>Cards, live messages, progress, and loading states.</p></header><div className="shadcn-grid">
          <Card className="span-6"><CardHeader><CardTitle>Release readiness</CardTitle><CardDescription>One planned change is awaiting review.</CardDescription></CardHeader><CardContent>Review the affected service before publishing the release note.</CardContent><CardFooter className="gap-2"><Button variant="outline">View details</Button><Button>Approve</Button></CardFooter></Card>
          <Card size="sm" className="span-6"><CardHeader><CardTitle>Compact card</CardTitle><CardDescription>Low-detail summary surface.</CardDescription></CardHeader><CardContent className="flex items-center gap-2"><Badge variant="outline" className="catalog-success">Synced</Badge><span className="text-muted-foreground">Updated just now</span></CardContent></Card>
          <div className="span-6 catalog-status" role="status"><Check /><div><strong>Changes saved</strong><p>Your draft is available to collaborators.</p></div></div>
          <div className="span-6 catalog-alert" role="alert"><CircleHelp /><div><strong>Publishing blocked</strong><p>Fix the validation issue before continuing.</p></div></div>
          <Card size="sm" className="span-6"><CardHeader><CardTitle>Progress</CardTitle></CardHeader><CardContent><Progress value={72} aria-label="Migration progress: 72 percent" /><small>72% complete</small></CardContent></Card>
          <Card size="sm" className="span-6"><CardHeader><CardTitle>Loading</CardTitle></CardHeader><CardContent><div className="catalog-loading" aria-busy="true"><span className="shadcn-spinner" aria-hidden="true" />Refreshing usage data</div></CardContent></Card>
        </div></section>

        <section aria-labelledby="forms-title"><header className="section-heading"><h2 id="forms-title">Forms</h2><p>Text controls, choices, validation, and native ranges.</p></header><div className="shadcn-grid">
          <form className="span-6 shadcn-form" onSubmit={(event) => event.preventDefault()}><div><Label htmlFor="shadcn-catalog-name">Project name</Label><Input id="shadcn-catalog-name" defaultValue="Component catalog" /></div><div><Label htmlFor="shadcn-catalog-role">Role</Label><select id="shadcn-catalog-role" defaultValue="Editor"><option>Editor</option><option>Viewer</option><option>Owner</option></select></div><div><Label htmlFor="shadcn-catalog-notes">Notes</Label><Textarea id="shadcn-catalog-notes" defaultValue="Keep the release notes focused and readable." /></div><footer><Button variant="outline" type="reset">Reset</Button><Button type="submit">Save settings</Button></footer></form>
          <form className="span-6 shadcn-form" onSubmit={(event) => event.preventDefault()}><div><Label htmlFor="shadcn-catalog-email">Email address</Label><Input id="shadcn-catalog-email" type="email" defaultValue="missing-domain" aria-invalid="true" aria-describedby="shadcn-catalog-email-help" /><small id="shadcn-catalog-email-help" className="catalog-error-text">Enter a complete email address.</small></div><div><Label htmlFor="shadcn-catalog-slug">Valid slug</Label><Input id="shadcn-catalog-slug" defaultValue="release-notes" /></div><fieldset><legend>Notifications</legend><label><input type="checkbox" defaultChecked />Email summaries</label><label><input type="checkbox" role="switch" checked={alertEnabled} onChange={(event) => setAlertEnabled(event.target.checked)} />Enable release alerts</label><label><input type="radio" name="shadcn-digest" defaultChecked />Daily digest</label><label><input type="radio" name="shadcn-digest" />Weekly digest</label></fieldset><div><Label htmlFor="shadcn-catalog-volume">Alert volume</Label><input id="shadcn-catalog-volume" type="range" min="0" max="100" defaultValue="65" /></div></form>
        </div></section>

        <section aria-labelledby="data-title"><header className="section-heading"><h2 id="data-title">Data &amp; navigation</h2><p>Table density alongside ordinary navigation patterns.</p></header><div className="shadcn-grid">
          <Card className="span-7 overflow-hidden"><CardHeader><CardTitle>Table</CardTitle></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Owner</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell className="font-medium">Checkout API</TableCell><TableCell>Maya Chen</TableCell><TableCell><Badge variant="outline" className="catalog-success">Healthy</Badge></TableCell><TableCell>2 min ago</TableCell></TableRow><TableRow><TableCell className="font-medium">Auth gateway</TableCell><TableCell>Jordan Lee</TableCell><TableCell><Badge variant="secondary">Deploying</Badge></TableCell><TableCell>8 min ago</TableCell></TableRow><TableRow><TableCell className="font-medium">Asset worker</TableCell><TableCell>Ava Stone</TableCell><TableCell><Badge variant="destructive">Failed</Badge></TableCell><TableCell>21 min ago</TableCell></TableRow></TableBody></Table></CardContent><CardHeader className="border-t"><CardTitle>Compact table</CardTitle></CardHeader><CardContent className="p-0"><Table className="catalog-compact-table"><TableHeader><TableRow><TableHead>Branch</TableHead><TableHead>Build</TableHead><TableHead>Result</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>main</TableCell><TableCell>#821</TableCell><TableCell>Passed</TableCell></TableRow><TableRow><TableCell>release</TableCell><TableCell>#820</TableCell><TableCell>Passed</TableCell></TableRow></TableBody></Table></CardContent></Card>
          <div className="span-5"><h3>Navigation</h3><nav className="shadcn-nav" aria-label="Project navigation"><a href="#overview" aria-current="page">Overview</a><a href="#activity">Activity</a><a href="#settings">Settings</a></nav><Breadcrumb className="mt-5"><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="#workspace">Workspace</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink href="#projects">Projects</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Component catalog</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb><h3 className="mt-6">Tree</h3><ul className="shadcn-tree"><li><details open><summary>src</summary><ul><li><details open><summary>components</summary><ul><li><a href="#button">button.tsx</a></li><li><a href="#catalog" aria-current="page">catalog.tsx</a></li></ul></details></li><li><a href="#entry">main.tsx</a></li></ul></details></li><li><a href="#readme">README.md</a></li></ul></div>
        </div></section>

        <section aria-labelledby="interactive-title"><header className="section-heading"><h2 id="interactive-title">Disclosure &amp; overlays</h2><p>Native details, menus, dialogs, and focused help.</p></header><div className="shadcn-grid">
          <Card className="span-6"><CardHeader><CardTitle>Accordion</CardTitle></CardHeader><CardContent className="shadcn-accordion"><details open><summary>What is included?</summary><p>Ordinary application and content surfaces, without sidebar or slides.</p></details><details><summary>How are the panes isolated?</summary><p>Each rendering lives in its own same-origin iframe.</p></details></CardContent></Card>
          <Card className="span-6"><CardHeader><CardTitle>Dropdown &amp; dialog</CardTitle></CardHeader><CardContent className="catalog-actions"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline"><Ellipsis data-icon="inline-start" />Actions</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuLabel>Catalog actions</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem><Copy />Duplicate</DropdownMenuItem><DropdownMenuItem><Archive />Archive</DropdownMenuItem></DropdownMenuContent></DropdownMenu><CatalogDialog /><Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" aria-label="Catalog help"><CircleHelp /></Button></TooltipTrigger><TooltipContent>Catalog help</TooltipContent></Tooltip></CardContent></Card>
          <Card className="span-6"><CardHeader><CardTitle>Embedded content</CardTitle></CardHeader><CardContent><figure className="shadcn-figure"><img alt="Abstract release timeline with three stages" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='320' viewBox='0 0 640 320'%3E%3Crect width='640' height='320' fill='%23e4e4e7'/%3E%3Cpath d='M70 240 L220 150 L360 190 L530 65' fill='none' stroke='%2318181b' stroke-width='14' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='70' cy='240' r='14' fill='%2318181b'/%3E%3Ccircle cx='220' cy='150' r='14' fill='%2318181b'/%3E%3Ccircle cx='360' cy='190' r='14' fill='%2318181b'/%3E%3Ccircle cx='530' cy='65' r='14' fill='%2318181b'/%3E%3C/svg%3E" /><figcaption>Release completion rate, last four windows.</figcaption></figure></CardContent></Card>
          <Card className="span-6"><CardHeader><CardTitle>Embedded document</CardTitle></CardHeader><CardContent><iframe className="shadcn-iframe" title="Release note preview" srcDoc={'<!doctype html><html><body style="font:14px system-ui;padding:16px;color:#18181b"><strong>Release note preview</strong><p>A contained native iframe surface.</p></body></html>'} /></CardContent></Card>
        </div></section>
      </main>
    </TooltipProvider>
  )
}
