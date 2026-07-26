# Navigation

## Purpose and semantic contract

Use `<nav>` for a major set of navigation links. Daft CSS lays out its direct list groups horizontally and lets both the bar and its lists wrap when space is limited. It does not turn mobile navigation into a stacked menu or clip overflowing items.

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
- Breadcrumbs must be a `<ul aria-label="Breadcrumb">`; the attribute match is case-insensitive. Use list items in trail order.

## Variants and options

- Two `<ul>` groups are distributed to opposite sides when room permits. More groups are valid but are not a documented layout convention.
- `nav strong` is styled as a brand label. Wrap it in a link when it should navigate.
- A dropdown inside a nav has its menu right-aligned automatically. See [Dropdown](dropdown.md).
- For a current breadcrumb link, use `aria-current` with any value except `false`; it becomes non-clickable. The final breadcrumb item is emphasized.
- Change `--breadcrumb-divider` to replace the default `›` separator.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

`--spacing`, `--spacing-xs`, `--spacing-sm`, `--text-sm`, `--text-lg`, `--font-medium`, `--font-semibold`, `--line-height`, `--radius-sm`, `--breadcrumb-divider`, and `--muted-foreground`.

## Behavior and accessibility

- `<nav>` remains a navigation landmark. Use `aria-label` or `aria-labelledby` to distinguish it from other navigation landmarks.
- `aria-current="page"` communicates the current destination. It does not otherwise change standard nav-link styling.
- The nav and its lists use `flex-wrap: wrap`; narrow layouts form additional rows. They are not changed to a vertical stack and have no overflow clipping rule.
- Breadcrumb links have a minimum 24 CSS pixel block size for WCAG 2.2 target sizing.
- The breadcrumb uses `aria-label` as its accessible label. Its generated separator is visual CSS content, not a separate link.

## Composition

Place a nav in a `header`, or use a `nav` directly as a page landmark. A breadcrumb list can be placed in page content or inside an existing nav without adding another nav landmark. Use the body-level [Sidebar](sidebar.md) for persistent application navigation.

## Common mistakes

- Do not replace the lists with unstructured inline links when the content is a navigation set.
- Do not add custom mobile rules that stack, hide, or horizontally clip nav items unless that is an intentional application-specific design.
- Do not use a `<button>` for a destination or an `<a>` for an in-page action.
- Do not wrap the documented breadcrumb list in another `<nav>` just to get its styling.
