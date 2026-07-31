# Sidebar

## Purpose and semantic contract

`<aside class="sidebar">` is a body-level application sidebar, not a general nested panel. By default, it is a persistent fixed left rail on desktop and a hidden native Popover drawer on mobile. Its `.sidebar-toggle` is shown only on mobile.

## Drawer mode

Add `.drawer` (`class="sidebar drawer"`) to make the sidebar a native hidden drawer at every width. The same `.sidebar-toggle` is shown at every width, the page layout does not shift, and no JavaScript is needed. A visible-by-default, stateful desktop collapse is not provided because it requires application state and JavaScript.

## Basic example

```html
<body>
  <aside id="sidebar" class="sidebar" popover aria-label="Workspace navigation">
    <header><strong>Acme</strong></header>
    <nav aria-label="Workspace">
      <ul>
        <li class="label">Workspace</li>
        <li><a href="/overview" aria-current="page">Overview</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
    </nav>
    <footer><small>Signed in as Kai</small></footer>
  </aside>

  <header class="container-fluid">
    <button class="ghost icon sidebar-toggle"
            popovertarget="sidebar" aria-label="Open menu"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg></button>
    <strong>Admin</strong>
  </header>
  <main class="container-fluid">…</main>
</body>
```

## Markup requirements

- The selector is `body > aside.sidebar`: make the aside a direct child of `<body>`. A nested `.sidebar` does not receive this component layout.
- Give a mobile drawer an `id`, the `popover` attribute, and an invoker with `popovertarget` set to that id. A bare `popover` is an auto popover.
- Use the canonical direct-child order: optional `<header>`, required `<nav>`, optional `<footer>`. Header and footer have full-width separators; only the nav scrolls. A nav-only sidebar is supported.
- Put sidebar navigation in `<nav><ul><li>…</li></ul></nav>`. Links must be direct children of their list items.
- Use `.label` as a direct child of the sidebar nav, or on a list item. A `strong` inside a list item also acts as a section label.
- Use `.container-fluid` on direct shifted headers and main content. It retains consistent horizontal gutters beside the fixed rail. A breakpoint-sized `.container` uses full-viewport breakpoints and loses its automatic left margin when the rail shifts it, so it can touch the sidebar.

## Variants and options

- **Full-height rail:** put the sidebar before the top `header` or `nav`. It begins at the viewport top; following body-level `header`, `nav`, `main`, and `footer` shift right.
- **Top nav over content:** put a direct top `header` or `nav` first and the sidebar immediately after it. Daft uses `--top-nav-height` for an element with `.top-nav`; other headers use `calc(var(--component-height) + var(--spacing))`. For a taller or wrapped custom header, override `--sidebar-offset-top` on the sidebar to its actual height; `main` and `footer` still shift right.
- Direct sidebar `header` and `footer` remain visible while the direct `nav` provides the scrolling region.
- By default, `.sidebar-toggle` is hidden at widths of 768px and above, including when it is directly inside an `li`; with `.sidebar.drawer`, it remains shown at every width.
- The mobile drawer, and `.sidebar.drawer` at all widths, is at most `min(--aside-width, 85vw)` wide and uses the popover backdrop.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

`--aside-width`, `--sidebar-offset-top`, `--top-nav-height`, `--spacing`, `--spacing-xs`, `--spacing-sm`, `--spacing-lg`, `--text-sm`, `--font-medium`, `--muted`, `--modal-overlay`, `--blur`, `--transition-slow`, and `--ease-default`.

## Behavior and accessibility

- By default, at 768px and above the sidebar is a fixed left rail. Its direct `nav` is independently scrollable while an optional header and footer remain visible. Its placement in the body determines its top offset as described above.
- By default, below 768px it is `display: none` until `aside.sidebar[popover]:popover-open`. With `.sidebar.drawer`, that hidden-until-open Popover behavior applies at every width, so the page layout does not shift. The open popover is fixed, scrollable, and slides in from the left; its backdrop is dimmed and blurred.
- With the bare `popover` attribute, this is an auto popover: the browser supports the invoker, Escape dismissal, and light dismissal. It is not a modal dialog: background content is not made inert and focus is not trapped.
- The aside is a complementary landmark. Label it when needed to distinguish it from other complementary regions; label its nav when multiple navigation landmarks exist. Give the icon-only toggle an `aria-label`.

## Composition

Use the sidebar with body-level `header`, `nav`, `main`, and `footer` siblings. Inside the sidebar, use the optional direct `header`, required direct `nav`, and optional direct `footer` composition. The toggle can live wherever the mobile header needs it, provided its `popovertarget` matches the sidebar id.

## Common mistakes

- Do not put `.sidebar` inside `<main>` or a card and expect the rail or drawer behavior.
- Do not omit `popover` and expect a mobile toggle to reveal the sidebar.
- Do not replace the native popover drawer with a custom JavaScript drawer for this pattern.
- Do not add a second toggle class for drawer mode; use the same `.sidebar-toggle`.
- Do not use an unlabeled icon-only `.sidebar-toggle`.
- Do not expect a visible-by-default, stateful desktop collapse; that requires application state and JavaScript.
- Do not use `.container` as the direct shifted application canvas; use `.container-fluid` so both edges retain horizontal breathing room.
