# Daft CSS

A semantic-first, utility-second CSS framework. Inspired by and backwards compatible with [Pico CSS](https://picocss.com), with visual aesthetics based on [shadcn/ui](https://ui.shadcn.com). Built for modern browsers only.

## Features

- **Semantic HTML** - Style elements directly without classes
- **Pico CSS Compatible** - Same HTML patterns and class names
- **shadcn/ui Aesthetics** - Modern, clean design with neutral colors
- **CSS Variables** - Hierarchical system for easy theming
- **Dark Mode** - Automatic via `prefers-color-scheme` or manual via `data-theme`
- **Modern CSS** - OKLCH colors, CSS nesting, `focus-visible`, `color-mix()`
- **Lightweight** - ~63KB minified, no JavaScript required

## Quick Start

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <link rel="stylesheet" href="daft.min.css">
    <title>My App</title>
  </head>
  <body>
    <main class="container">
      <h1>Hello Daft CSS!</h1>
      <p>Start building with semantic HTML.</p>
      <button>Get Started</button>
    </main>
  </body>
</html>
```

## Installation

### NPM

```bash
npm install daft-css
```

```js
import 'daft-css/dist/daft.min.css';
```

### CDN

```html
<link rel="stylesheet" href="https://unpkg.com/daft-css/dist/daft.min.css">
```

## Components

### Layout

```html
<!-- Centered container -->
<main class="container">...</main>

<!-- Full-width container -->
<main class="container-fluid">...</main>

<!-- Auto-layout grid -->
<div class="grid">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

### Buttons

```html
<button>Primary</button>
<button class="secondary">Secondary</button>
<button class="contrast">Contrast</button>
<button class="outline">Outline</button>
<button class="ghost">Ghost</button>
<button class="destructive">Destructive</button>
<button disabled>Disabled</button>
<button aria-busy="true">Loading</button>
```

### Forms

```html
<form>
  <label for="email">Email</label>
  <input type="email" id="email" placeholder="Enter email">
  <small>We'll never share your email.</small>

  <label>
    <input type="checkbox" role="switch">
    Accept terms
  </label>

  <button type="submit">Submit</button>
</form>
```

### Cards

```html
<article>
  <header>
    <strong>Card Title</strong>
    <p>Subtitle</p>
  </header>
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
  <p>Hidden content here.</p>
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
<dialog id="modal">
  <article>
    <header>
      <button aria-label="Close" rel="prev"></button>
      <p><strong>Modal Title</strong></p>
    </header>
    <p>Modal content...</p>
    <footer>
      <button class="secondary">Cancel</button>
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

## Theming

### Dark Mode

Daft CSS automatically follows system preference. Override with:

```html
<!-- Force light -->
<html data-theme="light">

<!-- Force dark -->
<html data-theme="dark">

<!-- Theme islands -->
<article data-theme="dark">Always dark</article>
```

### CSS Variables

Customize the design by overriding CSS variables:

```css
:root {
  /* Colors */
  --primary: oklch(0.5 0.2 260);
  --radius-md: 0.75rem;
  --spacing: 1.5rem;

  /* Pico compatibility */
  --pico-primary: var(--primary);
}
```

### Key Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `--background` | Page background | `oklch(1 0 0)` |
| `--foreground` | Text color | `oklch(0.145 0 0)` |
| `--primary` | Primary action color | `oklch(0.205 0 0)` |
| `--muted` | Muted backgrounds | `oklch(0.97 0 0)` |
| `--border` | Border color | `oklch(0.922 0 0)` |
| `--radius-md` | Default border radius | `0.5rem` |
| `--spacing` | Base spacing unit | `1rem` |

## Development

```bash
# Install dependencies
npm install

# Build CSS
npm run build

# Watch for changes
npm run watch

# Serve demo
npm run dev
```

## Browser Support

Daft CSS targets modern browsers only:

- Chrome 100+
- Firefox 100+
- Safari 15+
- Edge 100+

## License

MIT
