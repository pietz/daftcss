# Dropdown

## Purpose and semantic contract

Use `<details class="dropdown">` for a compact disclosure whose list is visually positioned as a floating menu. It is a native details disclosure, not a Popover API element and not an ARIA menu widget.

## Basic example

```html
<details class="dropdown">
  <summary class="ghost">Actions</summary>
  <ul>
    <li class="label">Project</li>
    <li><a href="/edit">Edit</a></li>
    <li><a href="/duplicate">Duplicate</a></li>
    <li role="separator"></li>
    <li><a href="/archive">Archive</a></li>
  </ul>
</details>
```

## Markup requirements

- Use `<details class="dropdown">` with a first-child `<summary>` trigger and a direct-child `<ul>` menu.
- Put each menu entry in an `<li>`. Direct child `<a>` and `<label>` elements receive the menu-item styling. A direct child SVG before its text is sized with `--icon-size` and kept beside the label.
- Use `<li class="label">` for a noninteractive section label and `<li role="separator"></li>` for a visual separator.
- A summary with only an icon needs an accessible name, for example `aria-label="More actions"`.

## Variants and options

- The summary uses the same button selectors as a button. Supported classes include `.secondary`, `.outline`, `.ghost`, `.destructive`, `.small`, `.large`, and `.icon`.
- `.icon` removes the dropdown's added chevron. Use it only where the icon itself clearly conveys a menu, and give it an accessible name.
- Add `dir="rtl"` to the menu `<ul>` to right-align it. The rule resets its text direction to LTR, so use this alignment option only for an LTR menu.
- A dropdown inside `nav` is right-aligned automatically.
- Labels containing checkbox or radio inputs are supported without their usual label bottom margin.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

`--spacing-xs`, `--spacing-sm`, `--text-sm`, `--icon-size`, `--icon-chevron`, `--popover`, `--popover-foreground`, `--accent`, `--accent-foreground`, `--border`, `--border-width`, `--dropdown-radius`, `--dropdown-shadow`, and `--transition-default`.

## Behavior and accessibility

- The summary natively toggles the parent `details` element; `[open]` rotates the chevron. The list is absolutely positioned under the trigger with a minimum width of `10rem` and a z-index of `50`.
- Opening is animated in. No closing animation is defined because closed details content is not rendered.
- This pattern does **not** use the Popover API. It has no native light dismissal, no guaranteed Escape dismissal, no top-layer placement, and no focus management beyond native details behavior.
- Keep a list of ordinary links as a list. Do not add `role="menu"` or menu-item roles unless you also implement the ARIA menu keyboard interaction model.

## Composition

Use in a nav, toolbar, card header, or beside a contextual action. For a light-dismissible overlay with native Popover API behavior, use a popover dialog or the mobile [Sidebar](sidebar.md), not this dropdown.

## Common mistakes

- Do not use `popover`, `popovertarget`, or `:popover-open` for this component.
- Do not expect clicking outside the dropdown to close it.
- Do not omit `.dropdown`; ordinary details are styled as accordions.
- Do not put the menu list outside the details or make menu entries non-list children.
