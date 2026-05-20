# Daft CSS — Slides

A thin slide layer that turns semantic HTML into a presentation deck. Each `<section>` is one slide. Layouts compose from Daft's existing primitives (`.grid`, `.span-N`, `.card`, `.cluster`, `.stack`, …). No JavaScript. Export to PDF via the browser's print dialog.

## Quick start

```html
<!doctype html>
<html>
<head>
  <link rel="stylesheet" href="daft.min.css">
</head>
<body class="deck">

  <section class="title">
    <h1>My deck</h1>
    <p>Subtitle</p>
  </section>

  <section>
    <h2>Just write HTML</h2>
    <p>Headings, lists, code — anything Daft styles works here.</p>
  </section>

</body>
</html>
```

Mark `<body class="deck">` once and every direct-child `<section>` becomes a slide. That's the whole API.

A complete demo lives at [`examples/slides.html`](examples/slides.html).

## Role modifiers

Add one class to a `<section>` to change its role:

| Class       | Use for                                              |
|-------------|------------------------------------------------------|
| *(none)*    | Default. Top-aligned single column.                  |
| `title`     | Cover / opener. Centered, larger heading.            |
| `quote`     | Centered pull quote with optional `<cite>`.          |
| `full`      | Edge-to-edge image / video / figure.                 |
| `code`      | Code-focused. Larger `<pre>` font.                   |

Plus one positional modifier that composes with any role:

| Class     | Effect                                  |
|-----------|-----------------------------------------|
| `center`  | Vertically center the slide's content.  |

## Layouts — use Daft, not new vocabulary

Slides reuse Daft's `.grid` system. For a slide with a heading and a column layout, keep the heading as a sibling of the grid (the slide `<section>` is already a vertical flex column).

```html
<!-- Even 2-column grid — heading above, body below -->
<section>
  <h2>Heading</h2>
  <div class="grid">
    <div>Left column</div>
    <div>Right column</div>
  </div>
</section>

<!-- Weighted 2:1 grid via span-2 on one child -->
<section>
  <h2>Wide left, narrow right</h2>
  <div class="grid">
    <div class="span-2">Two-thirds</div>
    <figure><img src="..."></figure>
  </div>
</section>

<!-- 1:3 — span-3 on one child of a 2-child grid -->
<section>
  <div class="grid">
    <div>Sliver</div>
    <div class="span-3">Three-quarters</div>
  </div>
</section>

<!-- 3 tiles -->
<section>
  <div class="grid">
    <article class="card">…</article>
    <article class="card">…</article>
    <article class="card">…</article>
  </div>
</section>
```

Anything Daft offers — `.stack`, `.cluster`, `.card`, `.glass`, buttons, badges, alerts, tables — works inside a slide. There are no slide-specific equivalents.

## Theming

The deck defaults to the operating system's color scheme. Override on `<html>` to pin the whole deck, or on any element to pin a single slide:

```html
<html>                                            <!-- follows OS preference -->
<html data-theme="dark">                          <!-- whole deck dark -->
<html data-theme="light">                         <!-- whole deck light -->
<section class="quote" data-theme="light">        <!-- one slide, light -->
```

PDF export captures whichever theme is active at print time — toggle your OS appearance before `⌘P` to choose.

### Adjust type scale

```css
:root { --slide-text-scale: 1.1; }          /* 10 % bigger across all slides */

section.dense { --slide-text-scale: 0.85; } /* per-slide override */
```

### Change aspect ratio

```css
:root { --slide-aspect: calc(4 / 3); }   /* 4:3 */
:root { --slide-aspect: 1; }             /* square (social) */
:root { --slide-aspect: calc(9 / 16); }  /* portrait */
```

### Slide tokens

| Variable              | Default              | Purpose                              |
|-----------------------|----------------------|--------------------------------------|
| `--slide-aspect`      | `calc(16 / 9)`       | Slide aspect ratio.                  |
| `--slide-padding`     | `5cqi`               | Inner padding (scales with slide).   |
| `--slide-text`        | `2.2cqi`             | Base body text size.                 |
| `--slide-text-scale`  | `1`                  | User multiplier for all text.        |
| `--slide-bg`          | `var(--background)`  | Slide background.                    |
| `--slide-gap`         | `2rem`               | Gap between stacked slides on screen.|

## PDF export

The primary export path is the browser's print dialog — no tooling required.

1. Open the deck in a modern browser
2. `⌘P` / `Ctrl+P`
3. **Save as PDF**

In the print dialog, check:

- **Margins** → None
- **Headers and footers** → off (Chrome adds URL + page numbers by default)
- **Background graphics** → on (the CSS forces this via `print-color-adjust: exact`)
- **Paper size** → Default (the deck's `@page` rule sets it to 16:9 / `16in × 9in`)

## Speaker notes

Markup is reserved for a future presenter mode:

```html
<section>
  <h2>Visible</h2>
  <aside class="notes">Hidden everywhere — for the speaker only.</aside>
</section>
```

`<aside class="notes">` is hidden on both screen and print. A presenter view can light it up later via a URL parameter or external surface.

## What this is not (yet)

- **No keyboard navigation.** Use scroll. A small JS nav layer may come later.
- **No transitions.** Intentional — dense / technical decks read better without them.
- **No slide counter or progress indicator.** Trivial to add via CSS counters; deferred.

## When you don't want slide styling

Slides target only `<body class="deck">`. A regular Daft page without that class is unaffected — slide CSS adds nothing to the visual output of non-deck markup.
