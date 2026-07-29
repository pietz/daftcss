# Navigation

## Purpose and semantic contract

Use `<nav>` for a major set of navigation links. Daft CSS lays out its direct list groups horizontally and lets both the bar and its lists wrap when space is limited. This wrapping remains the safe semantic default.

For a sticky navigation bar at the top of the viewport, `.top-nav-menu` and `.top-nav-toggle` provide an opt-in responsive pattern. One link list stays in normal horizontal layout on desktop and becomes a native Popover panel below 768px. Choose this pattern when ordinary wrapping would be unacceptable. The behavior needs no JavaScript and does not duplicate links.

Use a named `<nav aria-label="breadcrumb">` landmark with a direct `<ul>` for a location trail. This is Daft's canonical breadcrumb syntax and matches Pico CSS 2.1.1.

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
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <path d="M4 5h16"/>
      <path d="M4 12h16"/>
      <path d="M4 19h16"/>
    </svg>
  </button>
  <ul id="primary-menu" class="top-nav-menu" popover>
    <li><a href="/projects">Projects</a></li>
    <li><a href="/team">Team</a></li>
  </ul>
</nav>

<nav aria-label="breadcrumb">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/docs">Docs</a></li>
    <li>Navigation</li>
  </ul>
</nav>
```

## Markup requirements

- Put each nav group in a direct `<ul>` child of `<nav>`. A list directly inside a direct `.container` or `.container-fluid` child is also matched.
- Put each item in an `<li>`. Direct links, `[role="link"]`, controls, and `strong` receive the intended navigation treatment.
- Use `<a>` for navigation and a real `<button>` for an action. Add an accessible name to every navigation landmark when the page has more than one.
- For the responsive pattern, put `.top-nav` on the sticky top `<nav>`, then give the one link list an `id`, `.top-nav-menu`, and `popover`. Point an icon-only `.top-nav-toggle` button at that id with `popovertarget` and give it an `aria-label`.
- Keep the trigger outside `.top-nav-menu` so it remains available while that list is closed. Use a restrained inline SVG with `aria-hidden="true"`; do not rely on a text glyph or visible “Menu” label.
- Breadcrumbs use `<nav aria-label="breadcrumb"><ul>…</ul></nav>` with the list as the nav's direct child. The `aria-label` match is case-insensitive. Use list items in trail order and plain text for the current page; `aria-current` is not required.
- The older bare `<ul aria-label="Breadcrumb">` syntax remains styled for backward compatibility, but is not the recommended markup.

## Variants and options

- Two `<ul>` groups are distributed to opposite sides when room permits. More groups are valid but are not a documented layout convention.
- `nav strong` is styled as a brand label. Wrap it in a link when it should navigate.
- A dropdown inside a nav has its menu right-aligned automatically. Inside an open mobile `.top-nav-menu`, it expands in the panel instead. See [Dropdown](dropdown.md).
- Set `--top-nav-height` to the actual sticky bar height if you customize it beyond Daft's default single row. The mobile panel uses this value to sit below the bar because the supported-browser baseline does not include CSS Anchor Positioning.
- The final breadcrumb item is emphasized. Use plain text for the current page. Existing current breadcrumb links with `aria-current` (except `false`) remain non-clickable for backward compatibility.
- Change `--breadcrumb-divider` to replace the default `›` separator.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

`--spacing`, `--spacing-xs`, `--spacing-sm`, `--spacing-lg`, `--text-sm`, `--text-lg`, `--font-medium`, `--font-semibold`, `--line-height`, `--radius-sm`, `--dropdown-radius`, `--dropdown-shadow`, `--top-nav-height`, `--popover`, `--popover-foreground`, `--border`, `--breadcrumb-divider`, and `--muted-foreground`.

## Behavior and accessibility

- `<nav>` remains a navigation landmark. The breadcrumb's `aria-label="breadcrumb"` gives its landmark an accessible name; use a distinct name for other navigation landmarks.
- `aria-current="page"` communicates a current link when a current destination remains a link. The canonical breadcrumb instead uses plain text for its final item.
- Ordinary navs and their lists use `flex-wrap: wrap`; narrow layouts form additional rows. They are not changed to a vertical stack and have no overflow clipping rule.
- Below 768px, a `.top-nav-menu[popover]` is hidden while closed and becomes a fixed, scrollable panel beneath the sticky top bar while open. At 768px and above, the same list participates in the normal horizontal nav layout and `.top-nav-toggle` is hidden.
- A bare `popover` is an auto popover. The browser manages trigger state, Escape dismissal, and light dismiss. It remains non-modal: background content is not inert and focus is not trapped.
- If the viewport grows while the mobile menu is open, CSS restyles the still-open top-layer list to match the desktop bar. The native open state cannot be cleared with CSS, so it remains in the top layer until Escape, light dismiss, or another auto popover closes it.
- Breadcrumb links have a minimum 24 CSS pixel block size for WCAG 2.2 target sizing.
- The breadcrumb nav uses `aria-label` as its accessible name. Its generated separator is visual CSS content, not a separate link.

## Composition

Place a nav in a `header`, or use a nav directly as a page landmark. Use the responsive pattern only for a sticky top navigation bar: it positions the panel from the viewport and the known bar height, not from an arbitrary trigger. A breadcrumb nav can be placed in page content. Do not nest it inside another nav. Use the body-level [Sidebar](sidebar.md) for persistent application navigation.

Pagination keeps the ordinary semantic list and link markup. Center that specific navigation explicitly with `.justify-center`, mark the current destination, and retain Daft's link padding for adequate targets. This does not change the alignment of ordinary navigation.

```html
<nav class="justify-center" aria-label="Pagination">
  <ul>
    <li><a href="?page=1">Previous</a></li>
    <li><a href="?page=1">1</a></li>
    <li><a href="?page=2" aria-current="page">2</a></li>
    <li><a href="?page=3">3</a></li>
    <li><a href="?page=3">Next</a></li>
  </ul>
</nav>
```

## Common mistakes

- Do not replace the lists with unstructured inline links when the content is a navigation set.
- Do not add custom mobile rules that stack, hide, or horizontally clip ordinary nav items unless that is an intentional application-specific design.
- Do not duplicate the top navigation links into separate desktop and mobile lists.
- Do not use `.top-nav-menu` for an arbitrary contextual popover or claim it anchors to its trigger. It is a viewport-positioned sticky top-navigation pattern.
- Do not use a `<button>` for a destination or an `<a>` for an in-page action.
- Do not omit the named `<nav>` wrapper from new breadcrumb markup or nest the breadcrumb nav inside another nav.
