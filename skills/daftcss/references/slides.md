# Slides

Load this reference when creating or editing an HTML-native presentation deck with Daft.

## Authoring approach

Plan the story and dominant visual evidence for each slide before choosing markup. Vary composition according to the content rather than cycling through a fixed set of layouts.

Daft supplies the semantic substrate, proportional slide type, ordinary components, tokens, and print behavior. Start with those foundations, then add intentional deck-specific CSS when the design calls for it. A presentation is not limited to Daft's built-in role classes.

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

The role classes are optional presentation effects, not a required taxonomy:

- `.title`: centered title-slide composition
- `.quote`: large pull quote
- `.full`: edge-to-edge direct image or video
- `.code`: enlarged code presentation

Start with an ordinary semantic `<section>`. Add a role only when its behavior matches the content. Use `.center` independently when ordinary slide content should center vertically.

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

`.span-2`, `.span-3`, and `.span-4` are weights, not fixed columns. Use regular Daft layout primitives when they express the composition clearly; use scoped deck CSS when they do not.

## Custom deck styling

Set deck-wide character with tokens first, then put bespoke composition in a stylesheet loaded after Daft and scoped to `.deck` or a named deck class. Custom CSS is a normal part of art-directed deck work, not a framework failure.

Prefer a small set of recurring semantic selectors over per-slide utility chains or a new slide DSL. Normal flow and grid suit most content; positioning is valid for intentional overlays, annotations, and spatial diagrams. Inline SVG is appropriate for custom charts and diagrams when the surrounding HTML or an accessible name carries their meaning.

Do not invent Daft classes that the library does not provide. A deck-local class is application CSS, not a new framework API.

## Media

```html
<section class="full">
  <img src="system-map.png" alt="Services and their data flows">
</section>
```

A direct `<img>` or `<video>` in a full slide fills the slide and crops with `object-fit: cover`. Although a direct `<figure>` receives the full-slide frame, its child media is not automatically made full-bleed. Use a direct media child, or add deck CSS for a captioned full-bleed figure. Provide meaningful alternative text unless the same information is fully expressed in adjacent slide content.

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
| `--slide-padding` | automatic | Optional fixed-length override for internal spacing |
| `--slide-padding-scale` | `1` | Per-deck or per-slide multiplier for proportional padding |
| `--slide-text` | automatic | Optional fixed-length override for base text |
| `--slide-text-scale` | `1` | Per-deck or per-slide multiplier for proportional type |
| `--slide-bg` | `var(--background)` | Slide surface |
| `--slide-gap` | `2rem` | Gap between slides in browser view |

Override tokens on `:root`, `.deck`, or an individual slide rather than rebuilding the proportional typography. Use `--slide-padding-scale` and `--slide-text-scale` to retain fitted-slide proportions; reserve `--slide-padding` and `--slide-text` for intentional fixed-length overrides.

## Themes

The deck follows system preference. Pin the whole deck or create a theme island:

```html
<html data-theme="dark">
<section data-theme="light">...</section>
```

## Visual review

Before delivery:

1. Render every slide at the target aspect ratio.
2. Check clipping, overflow, contrast, and unintended type shrinking.
3. Check that hierarchy and composition serve the content rather than repeating mechanically.
4. Compare against the accepted visual direction or reference and iterate.
5. Verify print output as well as the browser view.

## PDF export

Use the browser print dialog and save as PDF. Daft's `@page` rule sets the configured aspect ratio and removes browser-view gaps and shadows. Disable browser headers and footers, enable background graphics, and use the deck's page size.

## Common mistakes

- Do not use a nonexistent `.card` class; cards remain semantic `<article>` elements.
- Do not put the heading inside the grid unless it should occupy a grid track.
- Do not invent a layout taxonomy when ordinary HTML and scoped CSS express the design.
- Do not use tiny document-scale text; let the container-relative slide scale work.
- Do not treat hidden speaker notes as an implemented presenter view.
