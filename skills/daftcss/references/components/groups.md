# Groups

## Purpose and semantic contract

Use `role="group"` to identify related controls. Give the group an accessible name when nearby visible text does not already identify the relationship. `role="group"` provides grouping semantics, not selection or toolbar behavior.

Daft has two visual modes:

- **Segmented groups:** Button-only groups and every non-qualifying group retain joined, segmented borders. This is the default.
- **Field shells:** A deliberately simple input composition becomes one full-width field surface. The shell rules below are the complete contract.

Use `<form role="search">` for a search landmark, not `role="group"` merely to obtain a visual treatment.

## Segmented groups

Place the participating controls directly in the group. Button-only groups are the common case. `.full-width` makes a `role="group"` flex and width `100%`; `.vertical` stacks its direct segments. `<fieldset role="group">` remains a full-width segmented grouping, with a `<legend>` when it names related controls.

```html
<div role="group" aria-label="Time range">
  <button class="outline">Day</button>
  <button class="outline" aria-pressed="true">Week</button>
  <button class="outline">Month</button>
</div>
```

Use `aria-pressed="true"` for a selected toggle or segmented-control button. Reserve `aria-current` for a genuinely current navigation or item state.

Apply `.small` or `.large` to a `role="group"` to size its supported direct controls and addon segments. `input[type="search"]` gives a horizontal cluster its pill radius.

## Adaptive field shells

A non-`fieldset`, non-`.vertical` `role="group"` becomes a full-width unified field shell only when it has exactly one direct eligible text-like input and no other direct children except:

- `svg`, `code`, `samp`, `kbd`, `span`, or `output` addons
- At most one `button`, `[role="button"]`, or `a.button` action

Eligible group inputs are an omitted or empty type, or `text`, `search`, `email`, `url`, `tel`, or `password`. A `form[role="search"]` can use the same simple shape, but its sole direct input must be `text` or `search` (including omitted or empty type).

```html
<div role="group" aria-label="Invite member">
  <svg aria-hidden="true"><!-- search icon --></svg>
  <input type="email" aria-label="Email address">
  <button type="button">Invite</button>
</div>

<form role="search">
  <input type="search" name="query" aria-label="Search documentation">
  <button type="submit">Search</button>
</form>
```

The shell owns its border, background, radius, `:focus-within`, and input validation presentation. Its input is transparent and borderless; allowed addons sit inside the surface; its optional action is inset. The action remains its own keyboard-focusable control.

The following do **not** qualify and stay segmented: direct `select`, `textarea`, `label`, `legend`, `fieldset`, nested group, hidden or unsupported input, a second input, a second action, helper `<p>` or `<small>`, native input action, a fieldset wrapper, or a vertical group. Any other unlisted direct child also keeps the group segmented. In segmented mode, addons are separate muted segments rather than shell content.

Keep visible labels and helper or error text outside a field shell. Name the input with a visible `<label for>` where practical, or with `aria-label`/`aria-labelledby`; connect outside help text with `aria-describedby`. Name a `role="group"` too when its relationship needs a label.

A disabled input changes the shell's input state but does not disable an enabled sibling action. Clicking unused shell space does not focus the input. Daft adds no JavaScript behavior: it does not implement selection, roving focus, keyboard navigation, submission, or state management.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. This component primarily uses:

- `--radius-md`, `--radius-full`
- `--border-width`
- `--input-radius`, `--input-height`, `--input-height-sm`, `--input-height-lg`
- `--button-radius`, `--button-height`, `--button-height-sm`, `--button-height-lg`
- `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`
- `--input`, `--input-background`, `--muted`, `--muted-foreground`

## Common mistakes

- Using a `.group` class. The selector is `[role="group"]`.
- Nesting controls and expecting the inner children to join or qualify for a shell.
- Putting a label, helper text, select, or extra action inside a shell and expecting it to remain unified.
- Using `role="search"` for a generic input-and-button pair.
- Expecting a group to supply application interaction behavior.
