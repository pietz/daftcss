# Slides

Load this reference when creating or editing an HTML-native presentation deck with Daft.

## Basic deck

`<body class="deck">` turns each direct-child `<section>` into a slide:

```html
<body class="deck">
  <section class="title">
    <h1>Quarterly Review</h1>
    <p>What changed and what comes next</p>
  </section>

  <section>
    <h2>Three priorities</h2>
    <div class="grid">
      <article>Reliability</article>
      <article>Growth</article>
      <article>Efficiency</article>
    </div>
  </section>
</body>
```

Slides inherit the normal Daft token system and compose with the normal `.grid`, `.span-N`, `.cluster`, and `.stack` primitives.

## Slide roles

Use at most one primary role class per slide:

- `.title`: centered title-slide composition
- `.quote`: large pull quote
- `.full`: edge-to-edge direct image or video
- `.code`: enlarged code presentation

Use `.center` as an independent positional modifier when ordinary slide content should center vertically.

## Grid composition

Keep a slide heading outside its grid because the slide itself is already a flex column:

```html
<section>
  <h2>Wide content with context</h2>
  <div class="grid">
    <div class="span-2">Primary content</div>
    <aside>Context</aside>
  </div>
</section>
```

`.span-2`, `.span-3`, and `.span-4` are weights, not fixed columns. Avoid slide-specific layout classes when regular Daft layout primitives work.

## Media

```html
<section class="full">
  <img src="system-map.png" alt="Services and their data flows">
</section>
```

A direct `<img>` or `<video>` in a full slide fills the slide and crops with `object-fit: cover`. A `<figure>` is not currently made cover-sized by `.full`; use a direct media child for this role. Provide meaningful alternative text unless the same information is fully expressed in adjacent slide content.

## Speaker notes

```html
<section>
  <h2>Launch plan</h2>
  <aside class="notes">Pause here for questions.</aside>
</section>
```

`.notes` is hidden in the rendered deck and print output. It reserves semantic markup for notes; Daft does not currently provide presenter mode.

## Tokens

| Token | Default | Purpose |
|---|---|---|
| `--slide-width` | `16` | Print width ratio |
| `--slide-height` | `9` | Print height ratio |
| `--slide-aspect` | calculated | Screen aspect ratio |
| `--slide-padding` | `5cqi` | Internal slide spacing |
| `--slide-text` | `2.2cqi` | Base slide text |
| `--slide-text-scale` | `1` | Per-deck or per-slide type multiplier |
| `--slide-bg` | `var(--background)` | Slide surface |
| `--slide-gap` | `2rem` | Gap between slides in browser view |

Override tokens on `:root`, `.deck`, or an individual slide rather than rebuilding the proportional typography.

## Themes

The deck follows system preference. Pin the whole deck or create a theme island:

```html
<html data-theme="dark">
<section data-theme="light">...</section>
```

## PDF export

Use the browser print dialog and save as PDF. Daft's `@page` rule sets the configured aspect ratio and removes browser-view gaps and shadows. Disable browser headers and footers.

## Common mistakes

- Do not use a nonexistent `.card` class; cards remain semantic `<article>` elements.
- Do not put the heading inside the grid unless it should occupy a grid track.
- Do not hand-position text with absolute coordinates.
- Do not use tiny document-scale text; let the container-relative slide scale work.
- Do not treat hidden speaker notes as an implemented presenter view.
