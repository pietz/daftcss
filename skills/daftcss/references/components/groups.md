# Groups

## Purpose and semantic contract

Use `role="group"` to identify a related set of controls and visually join its direct children. The group is inline-sized by default. Give it an accessible name when the relationship is not already clear from nearby visible text or a `<legend>`.

Daft also shares much of the cluster styling with `[role="search"]`, but that role is for a search landmark, not a generic control group.

## Basic example

```html
<div role="group" aria-label="Time range">
  <button class="outline">Day</button>
  <button class="outline" aria-pressed="true">Week</button>
  <button class="outline">Month</button>
</div>
```

## Markup requirements

- Put `role="group"` on the container and place segments as direct children.
- Use native controls where possible. `role="group"` provides grouping semantics, not button or selection behavior.
- Use `aria-pressed="true"` for a selected toggle or segmented-control button. Keep `aria-current` for a genuinely current navigation or item state.
- Use `<fieldset role="group">` for a full-width field grouping; retain a `<legend>` when it names the form controls.
- Use `<form role="search">` for a search form, not `role="group"` merely to obtain the visual treatment.

## Variants and options

### Layout

- `.full-width` makes a `role="group"` flex and `width: 100%`.
- `.vertical` stacks direct children and joins their top and bottom corners.
- `[role="search"]` is `display: flex`; it does not receive the `role="group"`-only `.vertical` or `.full-width` rules.

### Sizes

Apply `.small` or `.large` to a `role="group"`. They cascade to direct Daft buttons, button-like elements, text inputs, selects, and addon segments. They do not guarantee a size change for arbitrary children, textareas, or controls outside those selectors.

### Search shape

`[role="search"]` and a `role="group"` with a direct `input[type="search"]` set `--input-radius` and `--button-radius` to `--radius-full`, giving the cluster its pill shape.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

- `--radius-md`, `--radius-full`
- `--border-width`
- `--input-radius`, `--input-height`, `--input-height-sm`, `--input-height-lg`
- `--button-radius`, `--button-height`, `--button-height-sm`, `--button-height-lg`
- `--spacing-sm`, `--spacing-md`, `--spacing-lg`
- `--input`, `--muted`, `--muted-foreground`

## Behavior and accessibility

All direct children of either `[role="group"]` or `[role="search"]` flex and lose their bottom margin. Their adjacent corners are squared, regardless of child element type.

Border overlap is narrower in scope: it applies only to direct `button`, submit/button inputs, `[role="button"]`, `input`, `select`, and `code`, `samp`, `kbd`, `span`, or `output` segments. Direct `<select>` elements size to content; direct buttons do not flex-grow. Focused direct children rise above siblings, as do direct selected/current buttons, so their borders and focus ring remain visible.

A group does not implement selection, roving focus, keyboard navigation, form submission, or state management. Supply those behaviors when the controls need them.

## Composition

Use `code`, `samp`, `kbd`, `span`, or `output` as direct addon segments. Daft renders them as non-editable input-shaped segments with a muted background.

```html
<div role="group" class="full-width" aria-label="Install command">
  <select aria-label="Package manager"><option>npm</option></select>
  <code>install daftcss</code>
  <button>Copy</button>
</div>
```

## Common mistakes

- Using a `.group` class. The selector is `[role="group"]`.
- Nesting segments and expecting the inner children to join. The styling targets direct children.
- Giving every `role="group"` the same behavior as a toolbar, radio group, or tab list.
- Using `role="search"` for any generic input-and-button pair.
- Expecting arbitrary direct elements to receive border overlap, addon treatment, or group sizing.
