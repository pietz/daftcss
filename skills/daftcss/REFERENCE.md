# Daft CSS — Reference

Loaded on demand. Use this when SKILL.md isn't enough.

## CSS Layer Order

Cascade priority (later wins):
```
tokens → reset → base → layout → content → forms → components → utilities
```

## Design Tokens

### Tier 0 — Root knobs

| Variable | Default | Controls |
|---|---|---|
| `--spacing` | `1rem` | Base spacing unit, all spacing derives from this |
| `--radius` | `0.625rem` | Brand radius anchor (= `--radius-lg`) |
| `--component-height` | `2.25rem` | Buttons, inputs, dropdowns, selects |
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
| `--destructive` | red 27° | red 22° |
| `--success` | green 145° | green 145° |
| `--warning` | amber 70° | amber 80° |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` |
| `--ring` | mid-gray | mid-gray |

Foreground pairs (`--primary-foreground`, `--destructive-foreground`, etc.) auto-compute via OKLCH contrast when supported.

### Tier 1 — Scales (derived)

**Spacing:** `--spacing-xs` (0.25rem), `--spacing-sm` (0.5rem), `--spacing-md` (0.75rem), `--spacing` (1rem), `--spacing-lg` (1.5rem), `--spacing-xl` (2rem)

**Radius:** `--radius-sm` (r−4px), `--radius-md` (r−2px), `--radius-lg` (=r), `--radius-xl` (r+4px), `--radius-full` (9999px)

**Text:** `--text-xs` (0.75rem), `--text-sm` (0.875rem), `--text-base` (1rem), `--text-lg` (1.125rem), `--text-xl` (1.25rem), `--text-2xl` (1.5rem), `--text-3xl` (1.875rem), `--text-4xl` (2.25rem)

**Weight:** `--font-normal` (400), `--font-medium` (500), `--font-semibold` (600), `--font-bold` (700), `--font-extrabold` (800)

**Transitions:** `--transition-fast` (~100ms), `--transition` (150ms), `--transition-slow` (300ms), `--transition-default` (with ease)

**Shadows:** `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`

**Component heights:** `--component-height-sm` (2rem), `--component-height` (2.25rem), `--component-height-lg` (2.5rem)

### Tier 2 — Component tokens

| Variable | Default | Notes |
|---|---|---|
| `--button-radius` | `--radius-md` | |
| `--input-radius` | `--radius-md` | |
| `--card-radius` | `--radius-xl` | |
| `--modal-radius` | `--radius-lg` | |
| `--dropdown-radius` | `--radius-md` | |
| `--tooltip-radius` | `--radius-md` | |
| `--badge-radius` | `--radius-md` | not a pill |
| `--progress-radius` | `--radius-full` | |
| `--button-shadow` | `--shadow-xs` | |
| `--card-shadow` | `--shadow-xs` | |
| `--dropdown-shadow` | `--shadow-md` | |
| `--modal-shadow` | `--shadow-lg` | |
| `--button-height` | `--component-height` | |
| `--input-height` | `--component-height` | |
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
- `<input type="search">` — pill-shaped
- `<input type="checkbox" role="switch">` — toggle switch (no class needed)
- `<input type="file">` — styled drop zone
- `<input type="color">`, `range`, `date`, `time` — all styled

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

Card with subtitle:
```html
<article>
  <header>
    <strong>Title</strong>
    <p>Subtitle / description</p>
  </header>
  …
</article>
```

Nested articles get a muted background. Wrapping an article in `<a>` makes it a clickable card.

### Modal
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

Use the native Popover API. ESC and click-outside close automatically.

### Sidebar
```html
<body>
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
    <aside id="sidebar" class="sidebar" popover>
      <nav>
        <ul>
          <li><strong>Section Label</strong></li>
          <li><a href="#" aria-current="page">Active link</a></li>
          <li><a href="#">Regular link</a></li>
        </ul>
      </nav>
    </aside>
    <section>...page content...</section>
  </main>
</body>
```

Desktop (≥768px): fixed full-height left column, body padded right by `--aside-width`. Mobile: hidden by default, slides in as a drawer when the `.sidebar-toggle` button is clicked. The button auto-hides on desktop.

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
  <summary>Menu</summary>
  <ul>
    <li><a href="#">Option 1</a></li>
    <li><a href="#">Option 2</a></li>
  </ul>
</details>
```

Summary can have `role="button"` for a button-styled trigger.

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

Breadcrumb variant:
```html
<nav aria-label="breadcrumb">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/docs">Docs</a></li>
    <li>Page</li>
  </ul>
</nav>
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

**Grid:** Three tiers of control.

1. **Auto-count** — `<div class="grid">` sizes columns from child count (2–6). Mobile collapses to 1 col.
2. **Explicit** — add `.cols-N` (2–6) to lock the column count at all sizes. Opts out of auto-counting.
3. **Responsive** — combine with `.cols-md-N`, `.cols-lg-N`, `.cols-xl-N` (mobile-first cumulative). Children use `.span-N` (2–6) plus breakpoint variants `.span-md-N` / `.span-lg-N` / `.span-xl-N`, and `.span-full` / `.span-md-full` etc. for row-wide items.

Breakpoints: `md` ≥768px, `lg` ≥1024px, `xl` ≥1280px.

```html
<div class="grid cols-2 cols-lg-4">
  <article class="span-lg-2">Featured</article>
  <article>A</article>
  <article>B</article>
  <article>C</article>
</div>
```

**Aside:** see Sidebar above.

---

## Utility Classes

Daft is NOT a utility framework. This is a small, opinionated set.

### Text color
`.muted` (muted-foreground), `.primary` (skipping buttons/badges/progress), `.success`, `.warning`, `.destructive`. Also `a.secondary` for muted-link.

### Text size
`.text-xs` `.text-sm` `.text-base` `.text-lg` `.text-xl` `.text-2xl` `.text-3xl` `.text-4xl`

### Font weight
`.font-normal` `.font-medium` `.font-semibold` `.font-bold`

### Text align
`.text-left` `.text-center` `.text-right`

### Truncate / overflow
`.truncate` (ellipsis), `.overflow-auto`, `.overflow-hidden`

### Visibility
`.hidden`, `.invisible`, `.sr-only`, `.no-print`

### Display / flex
`.flex`, `.flex-col`, `.items-center`, `.justify-center`, `.justify-between`, `.justify-end`

### Gap
`.gap-2` (0.5rem), `.gap-4` (1rem)

### Width / margin / padding
`.w-full`, `.m-0`, `.mx-auto`, `.mt-4`, `.mb-4`, `.my-4`, `.p-0`, `.p-4`, `.p-6`

### Radius
`.rounded-none`, `.rounded-sm`, `.rounded` (md), `.rounded-lg`, `.rounded-xl`, `.rounded-full`

### Border / bg
`.border`, `.border-none`, `.bg-card`, `.bg-muted`, `.bg-transparent`

### Shadow
`.shadow-none`, `.shadow-sm`, `.shadow` (sm), `.shadow-md`, `.shadow-lg`

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
