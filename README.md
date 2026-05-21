# Daft CSS

A semantic-first CSS framework with [shadcn/ui](https://ui.shadcn.com)-quality aesthetics. Style raw HTML — no JavaScript, no required utility classes, no JSX components.

## Who is this for?

Daft CSS is for developers who want:

- **Beautiful defaults** without writing CSS or utility classes
- **Semantic HTML** that just works (`<button>` looks good, no classes needed)
- **Zero JavaScript** for interactive components like modals, accordions, and dropdowns
- **A tiny footprint** — one ~55 KB minified file

The idea is a tiny dependency that makes your app look polished out of the box, with a hierarchical variable system you can tweak from one root knob to per-component overrides.

Daft follows Pico's semantic syntax: native elements, ARIA states, roles, and small data attributes are the component API. The difference is visual: Daft gives that Pico-like authoring model a shadcn/ui-inspired aesthetic.

## Principles

- **Semantic HTML first.** Native elements (`<button>`, `<article>`, `<dialog>`, `<details>`) ship styled. You shouldn't need a class to get a polished result.
- **A few well-chosen classes, not a utility framework.** A small set of variant classes (`.secondary`, `.outline`, `.ghost`) and layout helpers (`.container`, `.grid`) for the cases native HTML can't express. This is not Tailwind — it's the minimum vocabulary on top of HTML.
- **shadcn/ui aesthetics, simpler internals.** We borrow shadcn's visual language because it's clean and tunable, but we don't borrow its variable graph. Daft's tokens form a tier system (root → scale → component) where most values derive from a handful of knobs at the top.
- **Connected by default, overridable when you need it.** Tweak `--spacing` and every component breathes differently. Tweak `--card-radius` to round just cards. The chain is the feature; you only break it when the value genuinely needs to differ.
- **No JavaScript.** Modals, dropdowns, accordions, tooltips — all CSS and native HTML APIs (`<dialog>`, popover, `<details>`).
- **Modern CSS only.** `light-dark()`, OKLCH, nesting, `color-mix()`, Popover, `@starting-style`. No polyfills, no fallbacks. The result is smaller, cleaner, and easier to read than the cross-browser layers older frameworks carry.

## How is it different?

### vs Pico CSS

Both style semantic HTML, but Daft targets app UIs over content sites and ships a more modern aesthetic.

|  | Daft CSS | [Pico CSS](https://picocss.com) |
|--|----------|----------|
| Size (minified) | **~55 KB** | 83 KB |
| Aesthetics | shadcn/ui | Pico |
| Focus | App UIs | Landing pages |
| Source | CSS | SCSS |
| Dark mode | Native `light-dark()` | Separate stylesheet |
| Color system | OKLCH | HSL |
| Extras | Tooltips, dropdowns, button groups, badges | — |

Daft is **not** a drop-in replacement for Pico — variable names and class variants differ.

### vs Franken UI / Franken Style

[Franken UI](https://franken-ui.dev) ports shadcn/ui to vanilla HTML — great idea, similar goal. Here's how we differ:

|  | Daft CSS | Franken Style |
|--|----------|---------------|
| Total size | **~55 KB** | 823 KB (618 KB CSS + 205 KB JS) |
| JavaScript | None | Required |
| Approach | Semantic HTML | Utility classes (Tailwind) |
| HTML footprint | Small, native | Large, verbose |

**Code comparison — a simple card:**

```html
<!-- Daft CSS -->
<article>
  <header>Card Title</header>
  <p>Card content goes here.</p>
  <footer>
    <button>Action</button>
  </footer>
</article>
```

```html
<!-- Franken UI -->
<div class="uk-card uk-card-default">
  <div class="uk-card-header">
    <h3 class="uk-card-title">Card Title</h3>
  </div>
  <div class="uk-card-body">
    <p>Card content goes here.</p>
  </div>
  <div class="uk-card-footer">
    <button class="uk-button uk-button-primary">Action</button>
  </div>
</div>
```

50% smaller HTML footprint, no JavaScript, and just 1/16th the total dependency size.

## Quick Start

Add one line to your HTML:

```html
<link rel="stylesheet" href="https://unpkg.com/daftcss@1/dist/daft.min.css">
```

Or install via npm:

```bash
npm install daftcss
```

```js
import 'daftcss/dist/daft.min.css';
```

Then write semantic HTML:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <link rel="stylesheet" href="https://unpkg.com/daftcss@1/dist/daft.min.css">
    <title>My App</title>
  </head>
  <body>
    <main class="container">
      <h1>Hello DAFT CSS</h1>
      <p>Start building with semantic HTML.</p>
      <button>Get Started</button>
    </main>
  </body>
</html>
```

## Components

### Buttons

```html
<button>Primary</button>
<button class="secondary">Secondary</button>
<button class="outline">Outline</button>
<button class="ghost">Ghost</button>
<button class="destructive">Destructive</button>
<button aria-busy="true">Loading</button>
```

### Forms

```html
<form>
  <label>Email <input type="email"></label>
  <label>Password <input type="password"></label>
  <label><input type="checkbox" role="switch"> Remember me</label>
  <button type="submit">Sign In</button>
</form>
```

### Cards

```html
<article>
  <header>Card Title</header>
  <p>Card content...</p>
  <footer>
    <button>Action</button>
  </footer>
</article>
```

### Accordion

```html
<details>
  <summary>Click to expand</summary>
  <p>Hidden content revealed.</p>
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

<details class="dropdown">
  <summary class="ghost">Ghost menu</summary>
  <ul>...</ul>
</details>
```

### Tree

Compact, IDE-style file tree. Folders use native `<details>`/`<summary>` for open/close; files are `<a>` links inside `<li>` for clickable rows. The chevron alone differentiates folders from files. Override `--tree-indent` to change the per-level indent step.

```html
<ul class="tree">
  <li>
    <details open>
      <summary>src</summary>
      <ul>
        <li><a href="#">daft.css</a></li>
        <li><a href="#" aria-current="page">tree.css</a></li>
      </ul>
    </details>
  </li>
  <li><a href="#">README.md</a></li>
</ul>
```

### Modal

```html
<button popovertarget="my-modal">Open Modal</button>
<dialog id="my-modal" popover>
  <article>
    <header>
      <button aria-label="Close" popovertarget="my-modal"></button>
      <strong>Modal Title</strong>
    </header>
    <p>Modal content here.</p>
    <footer>
      <button class="secondary" popovertarget="my-modal">Cancel</button>
      <button>Confirm</button>
    </footer>
  </article>
</dialog>
```

### Alerts

```html
<div role="alert">
  <strong>Payment failed</strong>
  <p>Your card could not be charged.</p>
</div>

<div role="status">
  <strong>Sync in progress</strong>
  <p>We are updating your workspace.</p>
</div>
```

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

### Sidebar

Place `<aside class="sidebar">` as a direct child of `<body>`. Put it before the top header/nav for a full-height rail, or after the top header/nav when the rail should sit below it. Add the `popover` attribute and a `.sidebar-toggle` button for a mobile slide-out drawer — no JavaScript.

```html
<body>
  <aside id="sidebar" class="sidebar" popover>
    <nav>
      <ul>
        <li class="label">Overview</li>
        <li><a href="#" aria-current="page">Dashboard</a></li>
        <li><a href="#">Reports</a></li>
      </ul>
    </nav>
  </aside>

  <header class="container-fluid">
    <nav>
      <ul>
        <li>
          <button class="ghost icon sidebar-toggle"
                  popovertarget="sidebar"
                  aria-label="Open menu">☰</button>
        </li>
        <li><strong>Admin</strong></li>
      </ul>
    </nav>
  </header>

  <main class="container-fluid">
    <section>
      <!-- page content -->
    </section>
  </main>
</body>
```

The `.sidebar-toggle` button auto-hides on desktop (≥768px). On mobile it opens the sidebar as a drawer via the native Popover API. Override `--aside-width` to change the column width.

### Avatar

A round container for initials, an image, or an SVG icon.

```html
<span class="avatar">KS</span>
<span class="avatar small">KS</span>
<span class="avatar large">KS</span>

<span class="avatar"><img src="/avatars/kai.jpg" alt=""></span>
```

### Groups

`role="group"` joins adjacent controls — buttons, inputs, or addons — into a single pill. Add a `<code>`/`<samp>`/`<kbd>`/`<span>`/`<output>` child to render it as a muted display addon; the last child fills the remaining width.

```html
<div role="group">
  <select><option>CDN</option><option>npm</option></select>
  <code>npm install daftcss</code>
</div>

<div role="group">
  <input type="search" placeholder="Search">
  <button>Go</button>
</div>
```

### Tooltips

```html
<span data-tooltip="Tooltip text">Hover me</span>
<button data-tooltip="Help" data-placement="right">?</button>
```

### Tables

```html
<table>
  <thead>
    <tr><th>Name</th><th>Status</th></tr>
  </thead>
  <tbody>
    <tr><td>Alice</td><td>Active</td></tr>
    <tr><td>Bob</td><td>Pending</td></tr>
  </tbody>
</table>
```

### Grid

One primitive, no breakpoint matrix.

**`.grid`** — direct children become equal columns. The child count is the column count. Stacks to a single column below 768px.

```html
<div class="grid">
  <div>A</div>
  <div>B</div>
  <div>C</div>
</div>
```

Add `.span-2`, `.span-3`, or `.span-4` to a child to claim more tracks (spans are weights, not Bootstrap columns — they add to the total). For a 2:1 ratio, use a two-child grid with `.span-2` on one child:

```html
<div class="grid">
  <aside>Nav</aside>
  <main class="span-2">Content</main>
</div>
```

For a different follow-up row, close the grid and start another one. For fixed-width sidebar + fluid content layouts, use the body-level `<aside class="sidebar">` app shell pattern.

## Utility Classes

For when semantic HTML alone isn't enough. Daft ships a tiny utility escape hatch: roughly the 10% of Tailwind-style classes that cover the boring 90% of layout glue. Use them for composition gaps, not for designing components from scratch. If a utility starts defining visual identity, prefer semantic HTML, component variants, or tokens instead.

| Group | Classes |
|---|---|
| Text color | `.muted` |
| Text size | `.text-xs` `.text-sm` `.text-base` `.text-lg` `.text-xl` `.text-2xl` `.text-3xl` `.text-4xl` |
| Font weight | `.font-normal` `.font-medium` `.font-semibold` `.font-bold` |
| Text align | `.text-left` `.text-center` `.text-right` |
| Truncate | `.truncate` |
| Visibility | `.hidden` `.invisible` `.sr-only` `.no-print` |
| Display | `.flex` `.flex-col` |
| Layout primitives | `.cluster` `.stack` |
| Flex align | `.items-center` `.justify-center` `.justify-between` `.justify-end` |
| Gap | `.gap-1` `.gap-2` `.gap-3` `.gap-4` `.gap-6` `.gap-8` |
| Width | `.w-full` |
| Margin | `.m-0` `.mx-auto` `.mt-4` `.mb-4` `.my-4` `.mt-auto` `.mb-auto` `.ml-auto` `.mr-auto` |
| Padding | `.p-0` `.p-4` `.p-6` |
| Overflow | `.overflow-auto` `.overflow-hidden` |
| Radius | `.rounded-none` `.rounded-sm` `.rounded` `.rounded-lg` `.rounded-xl` `.rounded-full` |
| Border | `.border` `.border-t` `.border-r` `.border-b` `.border-l` `.border-none` |
| Background | `.bg-card` `.bg-muted` `.bg-transparent` |
| Shadow | `.shadow-none` `.shadow-sm` `.shadow` `.shadow-lg` |
| Position | `.sticky` `.glass` |
| Cursor | `.cursor-pointer` `.cursor-not-allowed` |
| Interaction | `.pointer-events-none` `.select-none` |
| Transition | `.transition` `.transition-none` |
| Animation | `.animate-spin` `.animate-pulse` |

If you find yourself reaching for utilities that aren't here, that's a signal to either lean on a semantic element you might be overlooking — or, if it's a real gap, open an issue.

## Slides

Daft includes a small slide layer for building presentation decks from semantic HTML. Mark `<body class="deck">` and every direct-child `<section>` becomes a slide. Layouts reuse Daft's `.grid` and `.span-N`; PDF export runs through the browser's print dialog. The full reference lives in [SLIDES.md](SLIDES.md).

```html
<body class="deck">
  <section class="title"><h1>My deck</h1></section>
  <section>
    <h2>Heading</h2>
    <div class="grid">
      <div>Left</div>
      <figure><img src="..."></figure>
    </div>
  </section>
</body>
```

## Theming

### Dark Mode

Follows system preference automatically. Override with `data-theme`:

```html
<html data-theme="dark">

<!-- Or theme islands -->
<article data-theme="dark">Always dark</article>
```

### CSS Variables

Daft CSS uses a hierarchical variable system designed to give you both simplicity and granularity.

**1. Root variables** — A small set of core values that control the entire design system. Change one, and everything adapts:

```css
:root {
  --spacing: 1rem;      /* Controls all spacing throughout the app */
  --radius: 0.625rem;   /* Controls all border radii */
  --primary: oklch(0.5 0.22 295);  /* Primary brand color (default is neutral) */
}
```

The system automatically handles derived concerns — for example, button text color adjusts based on whether the primary color is light or dark.

**2. Scale variables** — Root values cascade into scales. Decrease `--spacing` and all spacing shrinks proportionally:

```css
--spacing-sm   /* 0.5rem  — derived from --spacing */
--spacing      /* 1rem    — the base */
--spacing-lg   /* 1.5rem  — derived from --spacing */
```

**3. Component variables** — For fine-grained control, override individual components without affecting others:

```css
:root {
  --button-radius: var(--radius-full);  /* Pill-shaped buttons */
  --card-radius: var(--radius-lg);      /* Slightly rounded cards */
  --card-shadow: none;                   /* Flat cards (no elevation) */
}
```

This tree structure gives you the best of both worlds: change a few root variables for a quick redesign, or drill down into component-specific tokens when you need precise control.

## Browser Support

Requires modern browsers for native support of `light-dark()`, OKLCH colors, CSS nesting, `color-mix()`, the Popover API, and `@starting-style`:

- Chrome 123+
- Firefox 129+
- Safari 18+

## Development

```bash
npm run build    # Build daft.css and daft.min.css
npm run watch    # Watch and rebuild on changes
npm run dev      # Serve examples locally
```

## License

MIT
