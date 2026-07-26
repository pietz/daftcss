# Accordion

## Purpose and semantic contract

Use native `<details>` and `<summary>` for a disclosure or accordion item. Daft CSS styles ordinary details as bordered accordion rows. The browser, not JavaScript, owns the open state through the `open` attribute.

## Basic example

```html
<details>
  <summary>What is Daft CSS?</summary>
  <p>A semantic-first CSS framework.</p>
</details>

<details>
  <summary role="button" class="secondary">Show advanced options</summary>
  <p>Additional settings appear here.</p>
</details>
```

## Markup requirements

- Use `<details>` with its `<summary>` as the first child. Only the first summary is the native disclosure control.
- Put revealed content after the summary. Daft CSS adds bottom padding to direct non-summary children.
- Add the boolean `open` attribute when an item should start expanded.
- Do not add `.dropdown` to an accordion. That class selects the distinct [Dropdown](dropdown.md) pattern.

## Variants and options

- A plain summary has an underline on hover, a chevron, and primary-colored text while open.
- `summary[role="button"]` is the button-styled summary variant. Apply button classes such as `.secondary`, `.outline`, `.ghost`, `.destructive`, `.small`, or `.large` when needed.
- A details element containing a button-styled summary loses the ordinary bottom border and uses `--spacing` below the item.
- The open chevron rotates 180 degrees.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

`--spacing`, `--spacing-sm`, `--spacing-md`, `--font-medium`, `--primary`, `--border`, `--border-width`, `--icon-size`, `--icon-chevron`, `--transition-default`, `--ring`, `--outline-width`, `--outline-offset`, and `--radius-sm`.

## Behavior and accessibility

- `<summary>` is a native keyboard-operable disclosure control. Activating it toggles the parent `details` element and updates its `open` state.
- The native semantics communicate expanded or collapsed state. Do not maintain a separate `aria-expanded` attribute or a parallel JavaScript state for a normal details disclosure.
- The summary has a visible `:focus-visible` outline. Keep its text descriptive rather than relying on the decorative CSS chevron.
- Multiple ordinary details can be open at once. This component does not add an exclusive-open accordion behavior.

## Composition

Place sequential details in an article, section, FAQ, or form-help area. Use a button-styled summary only when its stronger visual affordance is appropriate. Use a [Tree](tree.md) for nested file-like hierarchy, which deliberately overrides accordion styling.

## Common mistakes

- Do not build this disclosure with a div, click handler, and custom ARIA state.
- Do not put interactive controls inside a summary unless their interaction is intentionally part of toggling the disclosure; nested interactive controls make the native trigger harder to use.
- Do not use `role="button"` merely to make an ordinary summary accessible. It is the documented styling hook for the button presentation.
- Do not expect opening one item to close its siblings.
