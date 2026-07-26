# Tables

## Purpose and semantic contract

Use native `<table>` markup for data whose rows and columns need to be read in relation to each other. Every table is styled without a class: it is full width, uses collapsed borders, `--text-sm`, and tabular numerals.

## Basic example

```html
<table>
  <caption>Project status</caption>
  <thead>
    <tr><th scope="col">Project</th><th scope="col">Status</th></tr>
  </thead>
  <tbody>
    <tr><td>Daft CSS</td><td><span class="badge success">Active</span></td></tr>
    <tr><td>Website</td><td><span class="badge warning">Pending</span></td></tr>
  </tbody>
</table>
```

## Markup requirements

- Use `<thead>`, `<tbody>`, and `<tfoot>` when those sections exist.
- Use `<th>` for headers. Add `scope="col"` or `scope="row"` where it clarifies header relationships.
- Use `<caption>` for a table title when one is needed. Daft places it below the table.
- Use a table only for tabular data, not page layout.

## Variants and options

### Striped rows

Add `.striped` to the table. Odd rows in its `<tbody>` receive a muted tint; their hover tint is stronger.

```html
<table class="striped">…</table>
```

### Sort-state indicator

`th[aria-sort]` receives a pointer cursor and a trailing indicator. `ascending` shows `↑`; `descending` shows `↓`.

```html
<th scope="col" aria-sort="ascending">Name</th>
```

This is styling only. It does not sort data or create a keyboard interaction. Implement sorting separately and keep `aria-sort` synchronized with the actual state.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

- `--spacing`, `--spacing-sm`, `--spacing-md`, `--spacing-xs`
- `--text-sm`, `--font-medium`
- `--border`, `--border-width`
- `--muted`, `--muted-foreground`
- `--transition-default`

## Behavior and accessibility

- Body rows have a muted hover surface; the final body row has no bottom border.
- Header and footer sections receive separating borders. Footer cells use muted, medium-weight text.
- `aria-sort` belongs on the relevant column or row header and communicates state, but CSS does not add sorting behavior.
- For a sortable header, provide a real control and keyboard behavior as appropriate. Do not use a cursor change as the only affordance.

## Composition

Wrap a wide table in `.overflow-auto` for scrolling, or place it directly in a `<figure>`; `figure:has(> table)` scrolls horizontally. In either wrapper, the table's bottom margin is removed.

```html
<div class="overflow-auto" tabindex="0" aria-label="Scrollable project status table">
  <table class="striped">…</table>
</div>
```

Badges compose naturally in cells for short statuses.

## Common mistakes

- Using a table for visual layout.
- Omitting headers or their scopes when headers are needed to understand cells.
- Assuming all tables scroll responsively. Only `.overflow-auto` and a `<figure>` directly containing the table provide overflow handling.
- Making a scrollable wrapper unreachable by keyboard when it has no focusable descendants.
- Adding `aria-sort` without implementing and reflecting a real sort state.
- Expecting `.striped` to stripe header or footer rows.
