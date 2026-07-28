# Cards

## Purpose and semantic contract

Use `<article>` for a self-contained, independently meaningful unit such as a post, result, product, or dashboard item. Daft styles every article as a card. Do not use a generic `div.card`.

## Basic example

```html
<article>
  <header><strong>Release 1.15</strong></header>
  <p>Improved native dialog and form-control treatment.</p>
  <footer><button type="button">Read notes</button></footer>
</article>
```

## Markup requirements

- Use direct-child `<header>` for the card heading and optional supporting text.
- Use direct-child `<footer>` for actions or metadata that follows the body.
- For a title and subtitle, put an appropriately leveled `<h1>`–`<h6>` and `<p>` in `<hgroup>` inside the header. An `hgroup` must contain a real heading; do not substitute `<strong>`.

```html
<article>
  <header>
    <hgroup>
      <h3>Sprint 14</h3>
      <p>Ends Friday. Cut the release branch next.</p>
    </hgroup>
    <span class="badge">12 / 18</span>
  </header>
  <p>Card content.</p>
</article>
```

With an `hgroup`, the header lays out its direct children across the row, so place a badge or action beside the group.

## Variants and options

- A nested `<article>` becomes a muted, borderless, shadowless sub-card.
- `article[aria-busy="true"]` reserves at least 8rem of height and renders Daft's loading spinner.
- Wrap an article in an anchor when the entire self-contained card navigates. Do not put other interactive controls inside that linked card.

```html
<a href="/releases/1-15">
  <article>
    <header><strong>Release 1.15</strong></header>
    <p>Read the release notes.</p>
  </article>
</a>
```

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

- `--card`, `--card-foreground`, `--border`
- `--card-radius`, `--card-shadow`
- `--card-padding`, `--card-gap`
- `--spacing`, `--spacing-sm`, `--spacing-lg`
- `--text-lg`, `--text-sm`, `--line-height-sm`, `--muted-foreground`

## Behavior and accessibility

`aria-busy` marks the article as being updated; use concise visible status text when users need more context. A linked card preserves inherited text color, removes link decoration, changes border color on hover, and gives the wrapping anchor visible keyboard focus.

## Composition

- A direct card child of `.grid` has no bottom margin, so grid cells align.
- Use a footer with its default flex row and small gap for related actions.

## Common mistakes

- Do not use `<div class="card">`; use `<article>`.
- Do not nest interactive controls inside a card wrapped by an anchor. Avoid nested interactive elements.
- Do not use an article solely as a spacing wrapper. Reserve it for a self-contained content unit.
- Do not recreate the header layout with arbitrary wrappers when `<header>`, `<hgroup>`, and `<footer>` express it.
