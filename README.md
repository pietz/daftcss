# Daft CSS

A semantic-first CSS framework with [shadcn/ui](https://ui.shadcn.com)-quality aesthetics. Style raw HTML — no JavaScript, no required utility classes, no JSX components.

## Who is this for?

Daft CSS is for developers who want:

- **Beautiful defaults** without writing CSS or utility classes
- **Semantic HTML** that just works (`<button>` looks good, no classes needed)
- **Zero JavaScript** for interactive components like modals, accordions, and dropdowns
- **A tiny footprint** — one ~56 KB minified file

The idea is a tiny dependency that makes your app look polished out of the box, with a hierarchical variable system you can tweak from one root knob to per-component overrides.

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
| Size (minified) | **~56 KB** | 83 KB |
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
| Total size | **~56 KB** | 823 KB (618 KB CSS + 205 KB JS) |
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
<link rel="stylesheet" href="https://unpkg.com/daft-css/dist/daft.min.css">
```

Or install via npm:

```bash
npm install daft-css
```

```js
import 'daft-css/dist/daft.min.css';
```

Then write semantic HTML:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <link rel="stylesheet" href="https://unpkg.com/daft-css/dist/daft.min.css">
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

```html
<div class="grid">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
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
  --radius: 0.5rem;     /* Controls all border radii */
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
