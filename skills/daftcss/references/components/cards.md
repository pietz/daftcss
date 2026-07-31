# Cards

## Purpose and semantic contract

Use `<article>` for a self-contained, independently meaningful unit such as a post, result, product, or dashboard item. Daft styles articles as cards by default. Add `.plain` to an article when it should remain a normal document article without card presentation. Do not use a generic `div.card`.

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
- When a card needs a compact title and subtitle, put direct real heading and supporting paragraph children in `<hgroup>` inside the header. It is optional when a heading alone is enough. The heading keeps its semantic level; cards render titles at 18px and subtitles at 14px.

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

- `<article class="plain">` keeps article semantics while opting out of the card surface, padding, compact header and footer choreography, nested-card treatment, linked-card behavior, and card-specific loading height. Its headings, paragraphs, header, and footer follow normal document flow. `.plain` is not a global reset and has no Daft meaning on other elements.
- A nested `<article>` becomes a muted, borderless, shadowless sub-card.

```html
<article class="plain">
  <header>
    <h2>A long-form report</h2>
    <p>Published 20 May 2025</p>
  </header>
  <p>Ordinary document content follows.</p>
  <footer>Filed under Research</footer>
</article>
```
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

- Images intentionally have no universal external margin. Add an existing spacing utility where the composition needs one, for example `<img class="mb-4" src="/release.jpg" alt="Release team at work">` before a card header.
- A direct card child of `.grid` has no bottom margin, and Grid equalizes the cards' outer heights. When footers must also align at the bottom, make each card `article.flex.flex-col` and its footer `footer.mt-auto`.
- Use a footer with its default flex row and small gap for related actions.

```html
<div class="grid">
  <article class="flex flex-col">
    <header><strong>Starter</strong></header>
    <p>For personal projects.</p>
    <footer class="mt-auto"><button>Choose Starter</button></footer>
  </article>
  <article class="flex flex-col">
    <header><strong>Team</strong></header>
    <p>For teams that need shared projects and access controls.</p>
    <footer class="mt-auto"><button>Choose Team</button></footer>
  </article>
</div>
```

## Common mistakes

- Do not use `<div class="card">`; use `<article>`.
- Do not nest interactive controls inside a card wrapped by an anchor. Avoid nested interactive elements.
- Do not use an article solely as a spacing wrapper. Reserve it for a self-contained content unit; use `article.plain` for narrative articles that should not look like UI cards.
- Do not recreate the header layout with arbitrary wrappers when `<header>`, `<hgroup>`, and `<footer>` express it.
