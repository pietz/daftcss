# Sidebar

## Purpose and semantic contract

`<aside class="sidebar">` is a body-level application sidebar, not a general nested panel. On desktop it is a fixed left rail. On mobile it is hidden unless it is an open native popover, where it becomes a left-side drawer.

## Basic example

```html
<body>
  <aside id="sidebar" class="sidebar" popover aria-label="Workspace navigation">
    <nav aria-label="Workspace">
      <ul>
        <li class="label">Workspace</li>
        <li><a href="/overview" aria-current="page">Overview</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
    </nav>
  </aside>

  <header class="container-fluid">
    <nav aria-label="Application">
      <ul>
        <li><button class="ghost icon sidebar-toggle"
                    popovertarget="sidebar" aria-label="Open menu">☰</button></li>
        <li><strong>Acme</strong></li>
      </ul>
    </nav>
  </header>
  <main class="container-fluid">…</main>
</body>
```

## Markup requirements

- The selector is `body > aside.sidebar`: make the aside a direct child of `<body>`. A nested `.sidebar` does not receive this component layout.
- Give a mobile drawer an `id`, the `popover` attribute, and an invoker with `popovertarget` set to that id. A bare `popover` is an auto popover.
- Put sidebar navigation in `<nav><ul><li>…</li></ul></nav>`. Links must be direct children of their list items.
- Use `.label` as a direct child of the sidebar nav, or on a list item. A `strong` inside a list item also acts as a section label.

## Variants and options

- **Full-height rail:** put the sidebar before the top `header` or `nav`. It begins at the viewport top; following body-level `header`, `nav`, `main`, and `footer` shift right.
- **Top nav over content:** put a direct top `header` or `nav` first and the sidebar immediately after it. Daft offsets the rail by `calc(var(--component-height) + var(--spacing))`, which matches the default single-row top navigation. For a taller or wrapped header, override `--sidebar-offset-top` on `body` to its actual height; `main` and `footer` still shift right.
- `.sidebar-toggle` is hidden at widths of 768px and above, including when it is directly inside an `li`.
- The mobile drawer is at most `min(--aside-width, 85vw)` wide and uses the popover backdrop.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

`--aside-width`, `--sidebar-offset-top`, `--spacing`, `--spacing-xs`, `--spacing-sm`, `--spacing-lg`, `--text-sm`, `--font-medium`, `--muted`, `--modal-overlay`, `--blur`, `--transition-slow`, and `--ease-default`.

## Behavior and accessibility

- At 768px and above, the sidebar is a fixed, independently scrollable left rail. Its placement in the body determines its top offset as described above.
- Below 768px, it is `display: none` until `aside.sidebar[popover]:popover-open`. The open popover is fixed, scrollable, and slides in from the left; its backdrop is dimmed and blurred.
- With the bare `popover` attribute, this is an auto popover: the browser supports the invoker, Escape dismissal, and light dismissal. It is not a modal dialog: background content is not made inert and focus is not trapped.
- The aside is a complementary landmark. Label it when needed to distinguish it from other complementary regions; label its nav when multiple navigation landmarks exist. Give the icon-only toggle an `aria-label`.

## Composition

Use the sidebar with body-level `header`, `nav`, `main`, and `footer` siblings. The same semantic nav rules apply inside it. The toggle can live wherever the mobile header needs it, provided its `popovertarget` matches the sidebar id.

## Common mistakes

- Do not put `.sidebar` inside `<main>` or a card and expect the rail or drawer behavior.
- Do not omit `popover` and expect a mobile toggle to reveal the sidebar.
- Do not replace the native popover drawer with a custom JavaScript drawer for this pattern.
- Do not use an unlabeled icon-only `.sidebar-toggle`.
