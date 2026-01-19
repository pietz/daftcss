# Daft CSS

A semantic-first CSS framework that combines the developer experience of [Pico CSS](https://picocss.com) with the modern aesthetics of [shadcn/ui](https://ui.shadcn.com).

## Who is this for?

DAFT CSS is for developers who want:

- **Beautiful defaults** without writing CSS or utility classes
- **Semantic HTML** that just works (`<button>` looks good, no classes needed)
- **Zero JavaScript** for interactive components like modals, accordions, and dropdowns
- **A tiny footprint** — just one 51 KB file - 40% smaller than Pico CSS

The idea is to have a tiny dependency that makes your app look great without writing any CSS, while providing a flexible variable system to customize to your needs.

## How is it different?

### vs Pico CSS

Daft CSS is a **drop-in replacement** for Pico CSS with the same semantic HTML approach. The differences:

|  | Daft CSS | Pico CSS |
|--|----------|----------|
| Size (minified) | **51 KB** | 83 KB |
| Aesthetics | shadcn/ui | Pico |
| Focus | App UIs | landing pages |
| Source | CSS | SCSS |
| Dark mode | Native `light-dark()` | separate mode |
| Color system | OKLCH | HSL |
| More components | Tooltips, dropdowns, button groups | — |

Same HTML, better looks, smaller file, more features.

### vs Franken UI / Franken Style

[Franken UI](https://franken-ui.dev) ports shadcn/ui to vanilla HTML — great idea, similar goal. Here's how we differ:

|  | Daft CSS | Franken Style |
|--|----------|---------------|
| Total size | **50 KB** | 823 KB (618 KB CSS + 205 KB JS) |
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

Rapidly customize the design by overriding core variables:

```css
:root {
  --primary: oklch(55% 0.25 265);  /* Different primary color */
  --radius: 1rem;                  /* Make corners rounder */
  --spacing: 0.75rem;              /* Condense spacing */
}
```

## Browser Support

Requires modern browsers for native support of `light-dark()`, OKLCH colors, CSS nesting, and Popover API:

- Chrome 123+
- Firefox 120+
- Safari 18+

## Development

```bash
npm run build    # Build daft.css and daft.min.css
npm run watch    # Watch and rebuild on changes
npm run dev      # Serve demo locally
```

## License

MIT
