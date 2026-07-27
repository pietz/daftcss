# Navigation

## Purpose and semantic contract

Use `<nav>` for a major set of navigation links. Daft CSS lays out its direct list groups horizontally and lets both the bar and its lists wrap when space is limited. This wrapping remains the safe semantic default.

For a sticky navigation bar at the top of the viewport, `.top-nav-menu` and `.top-nav-toggle` provide an opt-in responsive pattern. One link list stays in normal horizontal layout on desktop and becomes a native Popover panel below 768px. The behavior needs no JavaScript and does not duplicate links.

Use the standalone breadcrumb list for a location trail. It deliberately is not a second `<nav>` landmark.

## Basic example

```html
<nav aria-label="Primary">
  <ul>
    <li><strong>Acme</strong></li>
  </ul>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/docs" aria-current="page">Docs</a></li>
    <li><button>Sign up</button></li>
  </ul>
</nav>

<!-- Opt-in responsive sticky top navigation -->
<nav class="top-nav sticky glass" aria-label="Primary">
  <ul><li><a href="/"><strong>Acme</strong></a></li></ul>
  <button class="top-nav-toggle ghost icon" type="button"
          popovertarget="primary-menu" aria-label="Toggle primary navigation">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16"/>
    </svg>
  </button>
  <ul id="primary-menu" class="top-nav-menu" popover>
    <li><a href="/projects">Projects</a></li>
    <li><a href="/team">Team</a></li>
  </ul>
</nav>

<ul aria-label="Breadcrumb">
  <li><a href="/">Home</a></li>
  <li><a href="/docs">Docs</a></li>
  <li aria-current="page">Navigation</li>
</ul>
```

## Markup requirements

- Put each nav group in a direct `<ul>` child of `<nav>`. A list directly inside a direct `.container` or `.container-fluid` child is also matched.
- Put each item in an `<li>`. Direct links, `[role="link"]`, controls, and `strong` receive the intended navigation treatment.
- Use `<a>` for navigation and a real `<button>` for an action. Add an accessible name to every navigation landmark when the page has more than one.
- For the responsive pattern, put `.top-nav` on the sticky top `<nav>`, then give the one link list an `id`, `.top-nav-menu`, and `popover`. Point an icon-only `.top-nav-toggle` button at that id with `popovertarget` and give it an `aria-label`.
- Keep the trigger outside `.top-nav-menu` so it remains available while that list is closed. Use a restrained inline SVG with `aria-hidden="true"`; do not rely on a text glyph or visible “Menu” label.
- Breadcrumbs must be a `<ul aria-label="Breadcrumb">`; the attribute match is case-insensitive. Use list items in trail order.

## Variants and options

- Two `<ul>` groups are distributed to opposite sides when room permits. More groups are valid but are not a documented layout convention.
- `nav strong` is styled as a brand label. Wrap it in a link when it should navigate.
- A dropdown inside a nav has its menu right-aligned automatically. Inside an open mobile `.top-nav-menu`, it expands in the panel instead. See [Dropdown](dropdown.md).
- Set `--top-nav-height` to the actual sticky bar height if you customize it beyond Daft's default single row. The mobile panel uses this value to sit below the bar because the supported-browser baseline does not include CSS Anchor Positioning.
- For a current breadcrumb link, use `aria-current` with any value except `false`; it becomes non-clickable. The final breadcrumb item is emphasized.
- Change `--breadcrumb-divider` to replace the default `›` separator.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

`--spacing`, `--spacing-xs`, `--spacing-sm`, `--spacing-lg`, `--text-sm`, `--text-lg`, `--font-medium`, `--font-semibold`, `--line-height`, `--radius-sm`, `--dropdown-radius`, `--dropdown-shadow`, `--top-nav-height`, `--popover`, `--popover-foreground`, `--border`, `--breadcrumb-divider`, and `--muted-foreground`.

## Behavior and accessibility

- `<nav>` remains a navigation landmark. Use `aria-label` or `aria-labelledby` to distinguish it from other navigation landmarks.
- `aria-current="page"` communicates the current destination. It does not otherwise change standard nav-link styling.
- Ordinary navs and their lists use `flex-wrap: wrap`; narrow layouts form additional rows. They are not changed to a vertical stack and have no overflow clipping rule.
- Below 768px, a `.top-nav-menu[popover]` is hidden while closed and becomes a fixed, scrollable panel beneath the sticky top bar while open. At 768px and above, the same list participates in the normal horizontal nav layout and `.top-nav-toggle` is hidden.
- A bare `popover` is an auto popover. The browser manages trigger state, Escape dismissal, and light dismiss. It remains non-modal: background content is not inert and focus is not trapped.
- If the viewport grows while the mobile menu is open, CSS restyles the still-open top-layer list to match the desktop bar. The native open state cannot be cleared with CSS, so it remains in the top layer until Escape, light dismiss, or another auto popover closes it.
- Breadcrumb links have a minimum 24 CSS pixel block size for WCAG 2.2 target sizing.
- The breadcrumb uses `aria-label` as its accessible label. Its generated separator is visual CSS content, not a separate link.

## Composition

Place a nav in a `header`, or use a `nav` directly as a page landmark. Use the responsive pattern only for a sticky top navigation bar: it positions the panel from the viewport and the known bar height, not from an arbitrary trigger. A breadcrumb list can be placed in page content or inside an existing nav without adding another nav landmark. Use the body-level [Sidebar](sidebar.md) for persistent application navigation.

## Common mistakes

- Do not replace the lists with unstructured inline links when the content is a navigation set.
- Do not add custom mobile rules that stack, hide, or horizontally clip ordinary nav items unless that is an intentional application-specific design.
- Do not duplicate the top navigation links into separate desktop and mobile lists.
- Do not use `.top-nav-menu` for an arbitrary contextual popover or claim it anchors to its trigger. It is a viewport-positioned sticky top-navigation pattern.
- Do not use a `<button>` for a destination or an `<a>` for an in-page action.
- Do not wrap the documented breadcrumb list in another `<nav>` just to get its styling.
