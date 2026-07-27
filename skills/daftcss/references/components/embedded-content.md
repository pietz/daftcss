# Embedded Content

## Purpose and semantic contract

Daft styles native media and embedded-document elements without component classes: images, figures, pictures, video, audio, iframes, and inline SVG. Choose the element for the content's meaning, then supply its native text alternative, caption, or label.

## Basic example

```html
<figure>
  <img src="revenue-chart.png" alt="Revenue increased 18% from January to June">
  <figcaption>Monthly revenue, 2026</figcaption>
</figure>

<video controls>
  <source src="demo.mp4" type="video/mp4">
  <track kind="captions" src="demo-en.vtt" srclang="en" label="English" default>
</video>

<iframe src="report.html" title="Quarterly performance report"></iframe>
```

## Markup requirements

### Image, figure, and picture

- Use `<img>` for an image. Give meaningful images concise, equivalent `alt` text; use `alt=""` for decorative images.
- Use `<figure>` for self-contained media that is referenced or needs a caption. Put `<figcaption>` directly inside it; Daft centers it below direct-child images, pictures, video, or iframes.
- Use `<picture>` only when choosing image sources for viewport, resolution, or format. Put `<source>` elements before its required `<img>` fallback, and put the `alt` on that `<img>`.

```html
<picture>
  <source media="(min-width: 48rem)" srcset="chart-wide.webp">
  <img src="chart-narrow.webp" alt="Revenue increased each month from January to June">
</picture>
```

### Video and audio

- Add `controls` unless media is intentionally non-user-controlled. Avoid autoplaying audio.
- Provide captions with `<track kind="captions">` for prerecorded video with audio, and provide transcripts for audio and video when appropriate.
- Supply fallback text inside the media element for browsers that cannot play it.

### Iframe and SVG

- Give every iframe a concise, descriptive `title` that identifies the embedded content or purpose. Do not use its URL or generic text such as "iframe".
- Use inline `<svg>` for an icon or graphic. Name meaningful SVG with `role="img"` and a `<title>` or `aria-label`; mark decorative SVG `aria-hidden="true"`. For interface icons, use exact official Lucide paths from lucide.dev or an official package rather than approximations, emoji, or Unicode glyphs; Daft itself has no icon dependency.

## Variants and options

Daft provides no embedded-content variants or classes.

- `img` is responsive by default: `max-width: 100%`, automatic height, and `--radius-md` corners.
- `picture` is block-level; its child image receives the normal image treatment.
- `video` has `max-width: 100%`, automatic height, and `--radius-lg` corners.
- `audio` is full width.
- `iframe` has a bordered, `--radius-lg` frame and `max-width: 100%`.
- A direct `img`, `picture > img`, `video`, or `iframe` in a figure uses `--radius-lg` corners.
- `svg:not([fill])` inherits `currentColor`; an SVG without a `width` gets a `1em` square default. A `fill` attribute prevents Daft from overriding that fill.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

- `--radius-md` applies to images.
- `--radius-lg` applies to figure media, video, and iframes.
- `--border` and `--border-width` frame iframes.
- `--spacing` sets figure vertical margins; `--spacing-sm` separates captions.
- `--text-sm` and `--muted-foreground` style figcaptions.

## Behavior and accessibility

Media semantics come from HTML, not Daft styling. Responsive sizing does not create a text alternative, captions, transcript, iframe title, or SVG name. Ensure embedded third-party content is usable with keyboard and assistive technology. Consider an iframe's privacy, permissions, and focus order before embedding it.

## Composition

Use a figure and caption when the caption provides context for a chart, screenshot, photo, or embedded report. A figure containing a table gains horizontal overflow while the table itself has no extra margin. Use standalone images or media when they are part of surrounding prose rather than a self-contained referenced item.

## Common mistakes

- Omitting `alt`, or using a filename as alternative text.
- Using `<figure>` merely for visual spacing when there is no self-contained media relationship.
- Omitting captions or transcripts for media that needs them.
- Embedding an iframe without a descriptive `title`.
- Assuming SVG is automatically accessible because it is visible.
- Adding invented classes such as `.responsive-video`, `.media-card`, or `.embed`.
