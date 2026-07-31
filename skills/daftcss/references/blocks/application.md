# Application Blocks

Load this reference for product shells, workspace navigation, dashboards, settings, empty states, and operational status.

## Sticky Top Nav App Shell

Use for simple apps, admin pages, and tools without deep navigation.

Rules:
- Use `<nav class="top-nav sticky glass">`.
- Use one `.top-nav-menu[popover]` link list for desktop and mobile.
- Point an accessible, icon-only `.top-nav-toggle` at that list.
- Put page content in `<main class="container">` or `.container-fluid`.

Skeleton:
```html
<nav class="top-nav sticky glass" aria-label="Primary">
  <ul><li><strong>Workspace</strong></li></ul>
  <button class="top-nav-toggle ghost icon" type="button"
          popovertarget="workspace-menu" aria-label="Toggle primary navigation">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <path d="M4 5h16"/>
      <path d="M4 12h16"/>
      <path d="M4 19h16"/>
    </svg>
  </button>
  <ul id="workspace-menu" class="top-nav-menu" popover>
    <li><a href="#" aria-current="page">Projects</a></li>
    <li><a href="#">Team</a></li>
    <li><button class="ghost icon" aria-label="Settings"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg></button></li>
  </ul>
</nav>
<main class="container">
  <hgroup>
    <h1>Projects</h1>
    <p>Manage active workspaces.</p>
  </hgroup>
</main>
```

Mistakes:
- Do not build custom nav flex CSS.
- Do not duplicate links for separate desktop and mobile menus.
- Do not use this viewport-positioned pattern away from the sticky top bar.
- Do not use buttons for navigation links.

## Sidebar App Shell

Use for dense apps with persistent navigation.

Rules:
- Use body-level `<aside class="sidebar">` with an optional direct `<header>`, required direct `<nav>`, and optional direct `<footer>`.
- Header and footer have full-width separators and remain visible; the nav is the only scrolling region. A nav-only sidebar is supported.
- By default, add `popover` and the same `.sidebar-toggle` button for the native mobile drawer; desktop remains a persistent rail and the toggle is mobile-only.
- Add `.drawer` to make it a native hidden drawer at every width: the same toggle is shown at every width, the page layout does not shift, and no JavaScript is needed. A visible-by-default, stateful desktop collapse requires application state and JavaScript, so Daft does not provide it.
- Put the sidebar before or after the top header depending on desired desktop placement.
- Use `.container-fluid` for the shifted header and main canvas so they retain consistent gutters beside the rail.

Skeleton:
```html
<aside id="sidebar" class="sidebar" popover aria-label="Workspace navigation">
  <header><strong>Workspace</strong></header>
  <nav aria-label="Workspace">
    <ul>
      <li class="label">Workspace</li>
      <li><a href="#" aria-current="page">Overview</a></li>
      <li><a href="#">Files</a></li>
      <li><a href="#">Settings</a></li>
    </ul>
  </nav>
  <footer><small>Signed in as Kai</small></footer>
</aside>
<header class="container-fluid">
  <button class="ghost icon sidebar-toggle" popovertarget="sidebar" aria-label="Open menu"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg></button>
  <strong>Workspace</strong>
</header>
<main class="container-fluid">...</main>
```

Mistakes:
- Do not put `.sidebar` inside `<main>`.
- Do not use `.container` for the shifted application canvas; its viewport breakpoints do not account for the rail.
- Do not create a custom drawer with JavaScript or a second drawer-toggle class.

## Workspace Browser

Use for file explorers, project browsers, and split workspaces.

Rules:
- Use `.grid`.
- Use `<ul class="tree">` for hierarchy.
- Use `.span-2` or `.span-3` for the main pane.

Skeleton:
```html
<div class="grid">
  <article>
    <header>
      <strong>Files</strong>
      <button class="ghost small">New</button>
    </header>
    <ul class="tree">
      <li>
        <details open>
          <summary>docs</summary>
          <ul><li><a href="#" aria-current="page">index.html</a></li></ul>
        </details>
      </li>
    </ul>
  </article>
  <article class="span-2">...</article>
</div>
```

Mistakes:
- Do not hand-roll tree indentation.
- Do not use nested cards for every file.

## Dashboard Stat Cards

Use for small metric summaries.

Rules:
- Use `.grid`.
- Use one `<article>` per metric.
- Use `.badge.success`, `.badge.warning`, or `.badge.outline` for status.

Skeleton:
```html
<div class="grid">
  <article>
    <small class="muted">Revenue</small>
    <p class="text-4xl m-0"><strong>$42.8k</strong></p>
    <span class="badge success">+12%</span>
  </article>
  <article>...</article>
  <article>...</article>
</div>
```

Mistakes:
- Do not color plain text manually.
- Do not add chart decorations unless real data needs them.

## Settings Form

Use for profile, workspace, billing, and preference pages.

Rules:
- Use `<form class="stack max-w-xl">`.
- Wrap controls in `<label>`.
- Use `role="group"` for combined controls.
- Use `role="switch"` for binary toggles.

Skeleton:
```html
<form class="stack max-w-xl">
  <hgroup>
    <h2>Workspace settings</h2>
    <p>Use labels, fieldsets, and grouped controls.</p>
  </hgroup>
  <label>Workspace name <input type="text" name="workspace" value="Acme Studio"></label>
  <label for="public-url">Public URL</label>
  <div role="group">
    <span>daft.dev/</span>
    <input id="public-url" type="text" name="slug" value="acme">
  </div>
  <label><input type="checkbox" role="switch" checked> Allow public sharing</label>
  <footer class="cluster justify-end">
    <button class="outline" type="button">Cancel</button>
    <button type="submit">Save</button>
  </footer>
</form>
```

Mistakes:
- Do not use placeholder text as the only label.
- Do not use divs instead of labels.

## Empty State

Use when a list, project, or workspace has no content yet.

Rules:
- Use `.text-center.max-w-md.mx-auto`.
- Include one primary action.
- Optionally include one secondary action.

Skeleton:
```html
<section class="text-center max-w-md mx-auto">
  <span class="badge outline">No files</span>
  <h2>Create your first page.</h2>
  <p class="muted">Start with a block, then replace the copy.</p>
  <div class="cluster justify-center">
    <button>Create page</button>
    <button class="outline">Import HTML</button>
  </div>
</section>
```

Mistakes:
- Do not add illustration placeholders by default.
- Do not include more than two actions.

## Status Panel

Use for persistent system messages, warnings, and workflow state.

Rules:
- Use `role="status"` for neutral/polite information.
- Use `role="alert"` for destructive or urgent information.
- Put title in `<strong>` and body in `<p>`.

Skeleton:
```html
<div class="stack">
  <div role="status">
    <strong>Deployment queued</strong>
    <p>The production build will start after the current preview finishes.</p>
  </div>
  <div role="alert">
    <strong>Payment failed</strong>
    <p>Update your billing method before the next renewal.</p>
  </div>
</div>
```

Mistakes:
- Do not create `.alert-success` or `.toast-card`.
- Do not use color alone for state.
