# Daft CSS — Reference

Loaded on demand. Use this when SKILL.md isn't enough.

## CSS Layer Order

Cascade priority (later wins):
```
tokens → reset → base → layout → content → forms → components → slides → utilities
```

## Design Tokens

### Tier 0 — Root knobs

| Variable | Default | Controls |
|---|---|---|
| `--spacing` | `1rem` | Base spacing unit, all spacing derives from this |
| `--radius` | `0.625rem` | Brand radius anchor (= `--radius-lg`) |
| `--component-height` | `2rem` | Buttons, inputs, dropdowns, selects |
| `--font-size-base` | `1rem` | Body font size, type scale derives from this |
| `--line-height` | `1.5` | Body line height |
| `--transition` | `150ms` | Default transition duration |
| `--font-sans` | system stack | Default font family |
| `--font-mono` | system mono stack | Code font family |

### Tier 0 — Semantic colors

All values use `light-dark()` and respect `color-scheme`.

| Variable | Light | Dark |
|---|---|---|
| `--background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` |
| `--popover` | `oklch(1 0 0)` | `oklch(0.269 0 0)` |
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `--accent` | derived from `--muted` | derived from `--muted` |
| `--secondary` | derived from `--muted` | derived from `--muted` |
| `--destructive` | red 27° | red 22° |
| `--success` | green 145° | green 145° |
| `--warning` | amber 70° | amber 80° |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` |
| `--ring` | mid-gray | mid-gray |

Foreground pairs (`--primary-foreground`, `--destructive-foreground`, etc.) auto-compute via OKLCH contrast when supported.

### Tier 1 — Scales (derived)

**Spacing:** `--spacing-xs` (0.25rem), `--spacing-sm` (0.5rem), `--spacing-md` (0.75rem), `--spacing` (1rem), `--spacing-lg` (1.5rem), `--spacing-xl` (2rem)

**Section gap:** `--section-gap` (= `--spacing-xl`) — vertical margin between top-level `<section>` landmarks. Override at `:root` for landing-style pages (e.g. `clamp(5rem, 10vw, 9rem)`).

**Radius:** `--radius-sm` (0.6r), `--radius-md` (0.8r), `--radius-lg` (=r), `--radius-xl` (1.4r), `--radius-full` (9999px)

**Text:** `--text-xs` (0.75rem), `--text-sm` (0.875rem), `--text-base` (1rem), `--text-lg` (1.125rem), `--text-xl` (1.25rem), `--text-2xl` (1.5rem), `--text-3xl` (1.875rem), `--text-4xl` (2.25rem), `--text-5xl` (3rem), `--text-6xl` (3.5rem)

**Weight:** `--font-normal` (400), `--font-medium` (500), `--font-semibold` (600), `--font-bold` (700), `--font-extrabold` (800)

**Transitions:** `--transition-fast` (~100ms), `--transition` (150ms), `--transition-slow` (300ms), `--transition-default` (with ease)

**Shadows:** `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`

**Component heights:** `--component-height-sm` (1.75rem), `--component-height` (2rem), `--component-height-lg` (2.25rem)

### Tier 2 — Component tokens

| Variable | Default | Notes |
|---|---|---|
| `--button-radius` | `--radius-lg` | |
| `--input-radius` | `--radius-lg` | |
| `--card-radius` | `--radius-xl` | |
| `--modal-radius` | `--radius-lg` | |
| `--dropdown-radius` | `--radius-md` | |
| `--tooltip-radius` | `--radius-md` | |
| `--badge-radius` | `--radius-md` | not a pill |
| `--progress-radius` | `--radius-full` | |
| `--button-shadow` | `none` | |
| `--card-shadow` | `--shadow-xs` | |
| `--dropdown-shadow` | `--shadow-md` | |
| `--modal-shadow` | `--shadow-lg` | |
| `--button-height` | `--component-height` | |
| `--button-height-sm` | `--component-height-sm` | |
| `--button-height-lg` | `--component-height-lg` | |
| `--input-height` | `--component-height` | |
| `--input-height-sm` | `--component-height-sm` | |
| `--input-height-lg` | `--component-height-lg` | |
| `--control-size` | `1rem` | checkbox, radio, range thumb |
| `--switch-width` | `2rem` | |
| `--switch-height` | `1.25rem` | |
| `--switch-thumb` | `1rem` | |
| `--aside-width` | `clamp(14rem, 20vw, 20rem)` | sidebar column width |

### Focus state

- `--ring`: focus ring color
- `--focus-ring-width`: `3px`
- `--focus-ring-opacity`: `50%`

All focusable elements get a 3px outline-color ring with the `--ring` token at 50% opacity.

---

## Components

### Buttons
```html
<button>Primary</button>
<button class="secondary">Secondary</button>
<button class="outline">Outline</button>
<button class="ghost">Ghost</button>
<button class="destructive">Destructive</button>
<button class="link">Link-style</button>

<button class="small">Small</button>
<button class="large">Large</button>
<button class="icon">⚙</button>
<button class="full-width">Full Width</button>

<button aria-busy="true">Loading</button>
<button disabled>Disabled</button>
<button aria-current="true">Active</button>
```

Variants can combine: `.outline.secondary`, `.ghost.destructive`, etc.

### Inputs / forms
```html
<form>
  <label>Email <input type="email" required></label>
  <label>Password <input type="password"></label>
  <label><input type="checkbox" role="switch"> Remember me</label>
  <small>Helper text under input</small>
  <input type="email" aria-invalid="true">  <!-- error state -->
  <input type="email" aria-invalid="false"> <!-- valid state -->
  <button type="submit">Sign In</button>
</form>
```

Wrapping inputs in labels handles spacing automatically. `aria-invalid` switches border to destructive/success colors. Required field indicator: a `*` is auto-appended to the label when the input is `required`.

Special inputs:
- `<input type="search">` — pill-shaped; inside a `role="group"` it also makes the whole cluster pill
- `<input type="checkbox" role="switch">` — toggle switch (no class needed)
- `<input type="file">` — styled drop zone
- `<input type="color">`, `range`, `date`, `time` — all styled

Sizes — `<input>` and `<select>` mirror the button modifiers:
```html
<input class="small" placeholder="Compact">
<input class="large" placeholder="Roomy">
<select class="large"><option>One</option></select>
```

### Card
```html
<article>
  <header>Card Title</header>
  <p>Card content...</p>
  <footer>
    <button>Action</button>
  </footer>
</article>
```

Card with title + subtitle — wrap the heading and lead paragraph in `<hgroup>`. A sibling element (badge, action) floats right.
```html
<article>
  <header>
    <hgroup>
      <strong>Sprint 14</strong>
      <p>Ends Friday. Cut release branch next.</p>
    </hgroup>
    <span class="badge">12 / 18</span>
  </header>
  …
</article>
```

Nested articles get a muted background. Wrapping an article in `<a>` makes it a clickable card.

### Modal

Daft's no-JavaScript modal uses the native Popover API.

```html
<button popovertarget="my-modal">Open</button>
<dialog id="my-modal" popover>
  <article>
    <header>
      <button aria-label="Close" popovertarget="my-modal"></button>
      <strong>Title</strong>
    </header>
    <p>Body content</p>
    <footer>
      <button class="secondary" popovertarget="my-modal">Cancel</button>
      <button>Confirm</button>
    </footer>
  </article>
</dialog>
```

ESC and click-outside close automatically.

Bare `<dialog>` (opened via `showModal()`) is also styled as a card — wrap content in `<article>` only when you want the full header/footer/close-button layout.

### Sidebar

```html
<body>
  <aside id="sidebar" class="sidebar" popover>
    <nav>
      <ul>
        <li class="label">Section Label</li>
        <li><a href="#" aria-current="page">Active link</a></li>
        <li><a href="#">Regular link</a></li>
      </ul>
    </nav>
  </aside>

  <header class="container-fluid">
    <nav>
      <ul>
        <li><button class="ghost icon sidebar-toggle"
                    popovertarget="sidebar"
                    aria-label="Open menu">☰</button></li>
        <li><strong>App</strong></li>
      </ul>
    </nav>
  </header>

  <main class="container-fluid">
    <section>...page content...</section>
  </main>
</body>
```

Desktop (≥768px): fixed left column, with placement defining whether it spans the full viewport height or starts below the top header/nav. Mobile: hidden by default, slides in as a drawer when the `.sidebar-toggle` button is clicked. The button auto-hides on desktop.

### Accordion
```html
<details>
  <summary>Click to expand</summary>
  <p>Hidden content revealed.</p>
</details>

<!-- Button-styled summary -->
<details>
  <summary role="button" class="secondary">Toggle</summary>
  <p>Content</p>
</details>
```

### Dropdown
```html
<details class="dropdown">
  <summary class="ghost">Menu</summary>
  <ul>
    <li><a href="#">Option 1</a></li>
    <li><a href="#">Option 2</a></li>
  </ul>
</details>
```

Summary uses the same variants as buttons: `.secondary`, `.outline`, `.ghost`, `.destructive`, `.small`, `.large`.

### Tree
```html
<ul class="tree">
  <li>
    <details open>
      <summary>src</summary>
      <ul>
        <li>
          <details>
            <summary>components</summary>
            <ul>
              <li><a href="#">button.css</a></li>
              <li><a href="#" aria-current="page">tree.css</a></li>
            </ul>
          </details>
        </li>
        <li><a href="#">daft.css</a></li>
      </ul>
    </details>
  </li>
  <li><a href="#">README.md</a></li>
</ul>
```

Folders are `<details>`/`<summary>` (native open/close). Files are `<a>` inside `<li>`. Mark the active file with `aria-current="page"` (or `.active`). Override `--tree-indent` on `.tree` to change the per-level indent step (defaults to `var(--spacing-md)`).

### Navigation
```html
<nav>
  <ul>
    <li><strong>Brand</strong></li>
  </ul>
  <ul>
    <li><a href="#">About</a></li>
    <li><a href="#" aria-current="page">Docs</a></li>
    <li><button>Sign Up</button></li>
  </ul>
</nav>
```

Two `<ul>`s = left and right groups. Mobile: stacks and centers.

Breadcrumb (standalone `<ul>` — no nav landmark, safe to nest inside `<nav>`):
```html
<ul aria-label="Breadcrumb">
  <li><a href="/">Home</a></li>
  <li><a href="/docs">Docs</a></li>
  <li>Page</li>
</ul>
```

### Tooltips
```html
<span data-tooltip="Tooltip text">Hover me</span>
<button data-tooltip="Help" data-placement="right">?</button>
```

`data-placement` values: `top` (default), `bottom`, `left`, `right`.

### Tables
```html
<table>
  <thead>
    <tr><th>Name</th><th>Status</th></tr>
  </thead>
  <tbody>
    <tr><td>Alice</td><td><span class="badge success">Active</span></td></tr>
    <tr><td>Bob</td><td><span class="badge warning">Pending</span></td></tr>
  </tbody>
</table>

<table class="striped">…</table>
```

Sortable column indicator: `<th aria-sort="ascending">` or `"descending"`.

### Badges
```html
<span class="badge">Primary</span>
<span class="badge secondary">Secondary</span>
<span class="badge success">Active</span>
<span class="badge warning">Pending</span>
<span class="badge destructive">Failed</span>
<span class="badge outline">Outline</span>
<span class="badge small">Small</span>
<span class="badge large">Large</span>
```

Combine: `.outline.success`, `.outline.destructive`, etc.

### Groups
```html
<!-- Button group -->
<div role="group">
  <button class="outline">Day</button>
  <button class="outline" aria-current="true">Week</button>
  <button class="outline">Month</button>
</div>

<!-- Vertical button group -->
<div role="group" class="vertical">
  <button class="outline">First</button>
  <button class="outline">Second</button>
</div>

<!-- Search form -->
<form role="search">
  <input type="search" placeholder="Search…">
  <button type="submit">Search</button>
</form>

<!-- Addon group: select + code/input -->
<div role="group">
  <select><option>CDN</option><option>npm</option></select>
  <code>npm install daftcss</code>
</div>

<div role="group">
  <select><option>+1</option><option>+44</option></select>
  <input type="tel" placeholder="555-0100">
</div>
```

`role="group"` joins adjacent controls into a single pill. Variants: `.vertical`, `.full-width`. Sizes: `.small`, `.large` — applied to the group, they cascade to every child (button, input, select). When a child is `<input type="search">`, the cluster takes the fully-rounded pill aesthetic — same as `role="search"`. When a child is a display element (`<code>`, `<samp>`, `<kbd>`, `<span>`, `<output>`), the group switches to addon mode: one outer border, internal hairlines, last child fills, a leading `<select>` gets a muted addon background.

### Avatar
```html
<span class="avatar">KS</span>
<span class="avatar small">JD</span>
<span class="avatar large"><img src="/me.jpg" alt=""></span>
<span class="avatar"><svg>…</svg></span>
```

Round container sized to `--component-height`. Wraps initials, images, or SVGs. Variants: `.small`, `.large`.

### Alert
```html
<div role="alert">
  <strong>Error</strong>
  <p>Something went wrong.</p>
</div>
<div role="status">
  <strong>Heads up</strong>
  <p>Neutral notice.</p>
</div>
```

`role="alert"` = destructive tint, `role="status"` = neutral tint. No class variants.

### Progress
```html
<progress value="64" max="100"></progress>
<progress value="64" max="100" class="success"></progress>
<progress value="64" max="100" class="warning"></progress>
<progress value="64" max="100" class="destructive"></progress>
<progress></progress> <!-- indeterminate -->
```

### Layout

**Container:** `<main class="container">` (max-width centered) or `.container-fluid` (full-width with edge padding).

**Grid:** One primitive.

**`.grid`** — `<div class="grid">` makes direct children equal columns (3 children → 3 cols). A child with `.span-N` (N = 2, 3, 4) claims N tracks instead of 1. Spans are weights, not Bootstrap columns: in a 2-child grid, `.span-2` on one child gives a 1:2 ratio (3 total tracks). Stacks to 1 col below 768px. For multi-row layouts use multiple grids — one per row.

```html
<!-- 2:1 ratio -->
<div class="grid">
  <aside>Nav</aside>
  <main class="span-2">Content</main>
</div>
```

**Aside:** see Sidebar above.

### Slides

`<body class="deck">` turns every direct-child `<section>` into a slide. Each slide auto-fits the viewport at the deck's aspect ratio (default 16:9), establishes a CSS container, and inherits Daft tokens. Layouts compose with `.grid` + `.span-N` — no slide-specific layout vocabulary.

```html
<body class="deck">
  <section class="title">
    <h1>Title</h1>
    <p>Subtitle</p>
  </section>

  <section>
    <h2>Heading sits above the grid</h2>
    <div class="grid">
      <div>Left column</div>
      <figure><img src="…"></figure>
    </div>
  </section>

  <section class="quote">
    <blockquote>Pull quote.</blockquote>
    <cite>— Source</cite>
  </section>

  <section class="full"><img src="…"></section>
  <section class="code"><pre><code>…</code></pre></section>
</body>
```

**Role modifiers** (one per slide): `.title` (centered hero), `.quote` (pull quote), `.full` (edge-to-edge media), `.code` (large `<pre>`).

**Positional modifier**: `.center` (vertically center the slide's flow).

**Weighted slide grids** use Daft's regular grid spans:
```html
<section>
  <h2>Wide left, narrow right</h2>
  <div class="grid">
    <div class="span-2">…</div>
    <figure>…</figure>
  </div>
</section>
```

**Speaker notes** — `<aside class="notes">` is hidden everywhere; reserved markup for a future presenter mode.

**Tokens** (Tier 0): `--slide-aspect` (`calc(16/9)`), `--slide-padding` (`5cqi`), `--slide-text` (`2.2cqi`), `--slide-text-scale` (`1`), `--slide-bg` (`var(--background)`), `--slide-gap` (`2rem`).

**Theming**: deck follows OS preference by default. Pin with `<html data-theme="dark|light">` or per-slide `<section data-theme="…">`.

**PDF export**: open in a modern browser, `⌘P` → Save as PDF. The `@page` rule sets 16:9 paper. Disable Headers/Footers in the print dialog.

Full reference: [SLIDES.md](../../SLIDES.md).

---

## Utility Classes

Daft is NOT a utility framework. This is a small, opinionated set.

### Text color
`.muted` (muted-foreground). Also `a.secondary` for muted links.

### Text size
`.text-xs` `.text-sm` `.text-base` `.text-lg` `.text-xl` `.text-2xl` `.text-3xl` `.text-4xl` `.text-5xl` `.text-6xl`

### Font weight
`.font-normal` `.font-medium` `.font-semibold` `.font-bold`

### Text align
`.text-left` `.text-center` `.text-right`

### Truncate / overflow
`.truncate` (ellipsis), `.overflow-auto`, `.overflow-hidden`

### Visibility
`.hidden`, `.invisible`, `.sr-only`, `.no-print`, `.hidden-mobile`, `.hidden-desktop` (responsive variants hide at < 768px or ≥ 768px respectively)

### Display / flex
`.flex`, `.flex-col`, `.items-center`, `.justify-center`, `.justify-between`, `.justify-end`

### Gap
`.gap-1` (0.25rem), `.gap-2` (0.5rem), `.gap-3` (0.75rem), `.gap-4` (1rem), `.gap-6` (1.5rem), `.gap-8` (2rem)

### Layout primitives
`.cluster` — wrapping row, center-aligned, spacing-sm gap (button toolbars, tag rows).
`.stack` — column with default spacing gap (form fields, vertical lists).

### Width / margin / padding
`.w-full`, `.m-0`, `.mx-auto`, `.mt-4`, `.mt-6`, `.mt-8`, `.mt-16`, `.mt-24`, `.mb-4`, `.mb-6`, `.mb-8`, `.my-4`, `.p-0`, `.p-4`, `.p-6`
Auto margins (great for pushing things in flex): `.mt-auto`, `.mb-auto`, `.ml-auto`, `.mr-auto`

### Max width / max height
`.max-w-xs` (20rem), `.max-w-sm` (24rem), `.max-w-md` (28rem), `.max-w-lg` (32rem), `.max-w-xl` (36rem), `.max-w-2xl` (42rem), `.max-w-3xl` (48rem)
`.max-h-xs` (12rem), `.max-h-sm` (16rem), `.max-h-md` (20rem), `.max-h-lg` (24rem), `.max-h-xl` (32rem), `.max-h-2xl` (40rem), `.max-h-3xl` (48rem)

### Radius
`.rounded-none`, `.rounded-sm`, `.rounded` (md), `.rounded-lg`, `.rounded-xl`, `.rounded-full`

### Border / bg
`.border` (all sides), `.border-t` / `.border-r` / `.border-b` / `.border-l` (single side), `.border-none`, `.bg-card`, `.bg-muted`, `.bg-transparent`

### Shadow
`.shadow-none`, `.shadow-sm`, `.shadow` (md), `.shadow-lg`

### Glass
`.glass` — translucent background + backdrop blur. Pairs well with `.sticky` headers.

### Position / interaction
`.sticky`, `.cursor-pointer`, `.cursor-not-allowed`, `.pointer-events-none`, `.select-none`

### Animation
`.transition`, `.transition-none`, `.animate-spin`, `.animate-pulse`

---

## Theming

### Dark mode

Auto-follows system preference. Override:
```html
<html data-theme="dark">
<html data-theme="light">

<!-- Theme islands (per-element) -->
<article data-theme="dark">Always dark</article>
```

### Recoloring

```css
:root {
  --primary: oklch(0.5 0.22 295);  /* purple */
}
```

Foreground colors auto-contrast — no need to also set `--primary-foreground` unless you want to override.

### Resizing the whole system

```css
:root {
  --spacing: 1.25rem;        /* loosens everything */
  --radius: 0.375rem;        /* tighter corners */
  --font-size-base: 0.9375rem; /* denser type */
}
```

### Per-component overrides

```css
:root {
  --button-radius: var(--radius-full);  /* pill buttons */
  --card-radius: var(--radius-lg);
  --card-shadow: none;
}
```

---

## Browser support

Requires modern browsers for `light-dark()`, OKLCH, CSS nesting, `color-mix()`, Popover API, `@starting-style`:
- Chrome 123+
- Firefox 129+
- Safari 18+

No polyfills, no fallbacks.
