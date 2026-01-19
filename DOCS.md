# Daft CSS Documentation

A semantic-first CSS framework combining [Pico CSS](https://picocss.com) compatibility with [shadcn/ui](https://ui.shadcn.com) aesthetics.

## Overview

Daft CSS styles semantic HTML elements directly—no classes required for basic styling. Write clean HTML and get beautiful, responsive components automatically.

**Key Features:**
- Semantic HTML styling (buttons, inputs, tables work out of the box)
- Light/dark mode with automatic system preference detection
- Modern CSS (OKLCH colors, `light-dark()`, CSS nesting)
- Minimal footprint (~49KB unminified)

**Browser Support:** Chrome 123+, Firefox 120+, Safari 18+

## Getting Started

### Installation

```html
<link rel="stylesheet" href="daft.min.css">
```

Or via npm:

```bash
npm install daft-css
```

### Basic Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="daft.min.css">
  <title>My App</title>
</head>
<body>
  <header>
    <nav class="container">
      <strong>Brand</strong>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
      </ul>
    </nav>
  </header>
  <main class="container">
    <h1>Hello World</h1>
    <p>Your content here.</p>
  </main>
</body>
</html>
```

---

## Theming

### Color Scheme

Daft CSS automatically detects system preference for light or dark mode. Override with the `data-theme` attribute:

```html
<!-- Force light mode -->
<html data-theme="light">

<!-- Force dark mode -->
<html data-theme="dark">
```

### CSS Variables

Customize the design system by overriding root variables:

```css
:root {
  --spacing: 1rem;        /* Base spacing unit */
  --radius: 0.5rem;       /* Border radius */
  --font-size-base: 1rem; /* Base font size */
  --transition: 150ms;    /* Animation duration */
  --component-height: 2.25rem; /* Button/input height */
}
```

**Color Tokens (shadcn naming):**

| Variable | Description |
|----------|-------------|
| `--background` | Page background |
| `--foreground` | Default text color |
| `--primary` | Primary action color |
| `--muted` | Muted backgrounds |
| `--muted-foreground` | Muted text |
| `--destructive` | Error/danger color |
| `--success` | Success color |
| `--warning` | Warning color |
| `--border` | Border color |
| `--card` | Card background |

---

## Layout

### Container

Centered content with responsive max-widths:

```html
<main class="container">
  <p>Content is centered and responsive.</p>
</main>
```

Use `.container-fluid` for full-width with padding:

```html
<div class="container-fluid">
  <p>Full width with responsive padding.</p>
</div>
```

### Grid

Auto-layout grid that adapts to child count:

```html
<div class="grid">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

The grid automatically creates 1-6 equal columns based on the number of children. On mobile, columns stack vertically.

**Column Spanning:**

Use `.span-2`, `.span-3`, or `.span-4` to make items span multiple columns:

```html
<div class="grid">
  <div class="span-3">Takes 3/4 width</div>
  <div>Takes 1/4 width</div>
</div>
```

The grid automatically adjusts its column count when spans are present. For example, 2 children with one having `.span-3` creates a 4-column grid.

**Full-width Item:**

```html
<div class="grid">
  <div>Normal</div>
  <div>Normal</div>
  <div data-span="full">Full width row</div>
</div>
```

### Landmarks

Use semantic HTML elements for page structure:

```html
<body>
  <header>Site header</header>
  <main>Primary content</main>
  <aside>Sidebar</aside>
  <footer>Site footer</footer>
</body>
```

---

## Typography

All typography is styled automatically. No classes needed.

### Headings

```html
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6</h6>
```

### Heading Groups

```html
<hgroup>
  <h1>Main Title</h1>
  <p>Subtitle or description</p>
</hgroup>
```

### Text Elements

```html
<p>Regular paragraph text.</p>
<p><strong>Bold text</strong> and <em>italic text</em>.</p>
<p><a href="#">Links are styled</a> automatically.</p>
<p><mark>Highlighted text</mark> for emphasis.</p>
<p><small>Small print</small> for fine print.</p>
<p><del>Deleted</del> and <ins>inserted</ins> text.</p>
<p><abbr title="Abbreviation">ABBR</abbr> with tooltip.</p>
```

### Blockquote

```html
<blockquote>
  <p>A wise quote goes here.</p>
  <footer>— Attribution</footer>
</blockquote>
```

### Lists

```html
<ul>
  <li>Unordered item</li>
  <li>Another item</li>
</ul>

<ol>
  <li>Ordered item</li>
  <li>Another item</li>
</ol>

<dl>
  <dt>Term</dt>
  <dd>Definition</dd>
</dl>
```

---

## Buttons

Buttons are styled automatically. Use `<button>`, `<input type="submit">`, or `<a role="button">`.

### Basic Button

```html
<button>Primary Button</button>
<button type="reset">Reset Button</button>
<a href="#" role="button">Link Button</a>
```

### Variants

```html
<button>Primary</button>
<button class="secondary">Secondary</button>
<button class="contrast">Contrast</button>
<button class="outline">Outline</button>
<button class="ghost">Ghost</button>
<button class="link">Link</button>
<button class="destructive">Destructive</button>
```

**Outline Combinations:**

```html
<button class="outline">Outline</button>
<button class="outline secondary">Outline Secondary</button>
<button class="outline contrast">Outline Contrast</button>
```

### Sizes

```html
<button class="small">Small</button>
<button>Default</button>
<button class="large">Large</button>
```

### Icon Button

```html
<button class="icon" aria-label="Menu">☰</button>
<button class="icon small" aria-label="Close">×</button>
```

### Full Width

```html
<button class="full-width">Full Width Button</button>
```

### Disabled State

```html
<button disabled>Disabled</button>
<button aria-disabled="true">Also Disabled</button>
```

### Loading State

```html
<button aria-busy="true">Loading...</button>
```

---

## Forms

Form elements are styled automatically with semantic HTML.

### Text Inputs

```html
<label>
  Email
  <input type="email" placeholder="you@example.com">
</label>

<label>
  Message
  <textarea placeholder="Your message..."></textarea>
</label>
```

### Input Types

All standard input types are supported:

```html
<input type="text" placeholder="Text">
<input type="email" placeholder="Email">
<input type="password" placeholder="Password">
<input type="url" placeholder="URL">
<input type="tel" placeholder="Phone">
<input type="number" placeholder="Number">
<input type="search" placeholder="Search...">
<input type="date">
<input type="time">
<input type="datetime-local">
<input type="color">
<input type="file">
```

### Select

```html
<label>
  Country
  <select>
    <option value="">Select...</option>
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
  </select>
</label>

<!-- Multiple select -->
<select multiple>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Checkbox & Radio

```html
<label>
  <input type="checkbox">
  Accept terms
</label>

<label>
  <input type="radio" name="plan" checked>
  Free Plan
</label>
<label>
  <input type="radio" name="plan">
  Pro Plan
</label>
```

### Switch

Use `role="switch"` on a checkbox:

```html
<label>
  <input type="checkbox" role="switch">
  Enable notifications
</label>

<label>
  <input type="checkbox" role="switch" checked>
  Dark mode
</label>
```

### Range Slider

```html
<label>
  Volume
  <input type="range" min="0" max="100" value="50">
</label>
```

### Helper Text

```html
<label>
  Password
  <input type="password">
</label>
<small>Must be at least 8 characters.</small>
```

### Validation States

Use `aria-invalid` for validation:

```html
<!-- Invalid -->
<label>
  Email
  <input type="email" aria-invalid="true">
</label>
<small>Please enter a valid email.</small>

<!-- Valid -->
<label>
  Username
  <input type="text" aria-invalid="false">
</label>
<small>Username is available!</small>
```

### Required Fields

Required fields automatically show an asterisk:

```html
<label>
  Email
  <input type="email" required>
</label>
```

### Fieldset

```html
<fieldset>
  <legend>Personal Information</legend>
  <label>
    Name
    <input type="text">
  </label>
  <label>
    Email
    <input type="email">
  </label>
</fieldset>
```

### Disabled Forms

```html
<fieldset disabled>
  <legend>Disabled Form</legend>
  <input type="text" placeholder="Cannot edit">
  <button>Cannot click</button>
</fieldset>
```

---

## Components

### Card

Use `<article>` for cards:

```html
<article>
  <header>
    <strong>Card Title</strong>
    <p>Subtitle or description</p>
  </header>
  <p>Card content goes here.</p>
  <footer>
    <button>Action</button>
  </footer>
</article>
```

**Clickable Card:**

```html
<a href="/details">
  <article>
    <strong>Click me</strong>
    <p>This entire card is clickable.</p>
  </article>
</a>
```

**Loading Card:**

```html
<article aria-busy="true"></article>
```

### Table

```html
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Role</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john@example.com</td>
      <td>Admin</td>
    </tr>
    <tr>
      <td>Jane Smith</td>
      <td>jane@example.com</td>
      <td>User</td>
    </tr>
  </tbody>
</table>
```

**Striped Table:**

```html
<table class="striped">
  <!-- ... -->
</table>
```

**Sortable Columns:**

```html
<th aria-sort="ascending">Name</th>
<th aria-sort="descending">Date</th>
```

**Responsive Table:**

```html
<figure class="overflow-auto">
  <table><!-- wide table --></table>
</figure>
```

### Accordion

Use `<details>` and `<summary>`:

```html
<details>
  <summary>Click to expand</summary>
  <p>Hidden content revealed on click.</p>
</details>

<details open>
  <summary>Already open</summary>
  <p>This starts expanded.</p>
</details>
```

### Dropdown

Use `<details class="dropdown">`:

```html
<details class="dropdown">
  <summary>Options</summary>
  <ul>
    <li><a href="#">Edit</a></li>
    <li><a href="#">Duplicate</a></li>
    <li><a href="#">Delete</a></li>
  </ul>
</details>
```

**Button-styled Dropdown:**

```html
<details class="dropdown">
  <summary role="button">Actions</summary>
  <ul>
    <li><a href="#">Option 1</a></li>
    <li><a href="#">Option 2</a></li>
  </ul>
</details>
```

**Right-aligned Menu:**

```html
<details class="dropdown">
  <summary>Menu</summary>
  <ul dir="rtl">
    <li><a href="#">Aligns right</a></li>
  </ul>
</details>
```

**Dropdown with Checkboxes:**

```html
<details class="dropdown">
  <summary>Filter</summary>
  <ul>
    <li><label><input type="checkbox"> Option A</label></li>
    <li><label><input type="checkbox"> Option B</label></li>
  </ul>
</details>
```

### Modal

Use native `<dialog>` element:

```html
<dialog id="modal">
  <article>
    <header>
      <strong>Modal Title</strong>
      <button aria-label="Close" onclick="this.closest('dialog').close()"></button>
    </header>
    <p>Modal content here.</p>
    <footer>
      <button class="secondary" onclick="this.closest('dialog').close()">Cancel</button>
      <button>Confirm</button>
    </footer>
  </article>
</dialog>

<button onclick="document.getElementById('modal').showModal()">Open Modal</button>
```

**Body Scroll Lock:**

Add `modal-is-open` class to `<html>` when modal opens:

```js
const modal = document.getElementById('modal');

modal.addEventListener('open', () => {
  document.documentElement.classList.add('modal-is-open');
});

modal.addEventListener('close', () => {
  document.documentElement.classList.remove('modal-is-open');
});
```

### Navigation

**Horizontal Nav:**

```html
<nav>
  <strong>Brand</strong>
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
```

**Nav with Buttons:**

```html
<nav>
  <strong>Logo</strong>
  <ul>
    <li><a href="#">Features</a></li>
    <li><a href="#">Pricing</a></li>
    <li><button class="secondary">Sign In</button></li>
    <li><button>Get Started</button></li>
  </ul>
</nav>
```

**Vertical Nav (Sidebar):**

```html
<aside>
  <nav>
    <strong>Dashboard</strong>
    <ul>
      <li><a href="#" aria-current="page">Overview</a></li>
      <li><a href="#">Analytics</a></li>
      <li><a href="#">Settings</a></li>
    </ul>
  </nav>
</aside>
```

**Breadcrumb:**

```html
<nav aria-label="breadcrumb">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li>Current Page</li>
  </ul>
</nav>
```

### Progress

```html
<progress value="70" max="100"></progress>
```

**Indeterminate:**

```html
<progress></progress>
```

**Variants:**

```html
<progress value="60" max="100"></progress>
<progress value="60" max="100" class="secondary"></progress>
<progress value="60" max="100" class="success"></progress>
<progress value="60" max="100" class="warning"></progress>
<progress value="60" max="100" class="destructive"></progress>
```

**With Label:**

```html
<label>
  Uploading...
  <progress value="45" max="100"></progress>
</label>
```

### Tooltip

Use `data-tooltip` attribute:

```html
<span data-tooltip="This is helpful information">Hover me</span>
```

**Placement:**

```html
<span data-tooltip="Top" data-placement="top">Top</span>
<span data-tooltip="Bottom" data-placement="bottom">Bottom</span>
<span data-tooltip="Left" data-placement="left">Left</span>
<span data-tooltip="Right" data-placement="right">Right</span>
```

**On Buttons:**

```html
<button data-tooltip="Save your changes">Save</button>
```

### Group

Use `role="group"` for button groups and input groups:

**Button Group:**

```html
<div role="group">
  <button class="outline">Left</button>
  <button class="outline">Center</button>
  <button class="outline">Right</button>
</div>
```

**Segmented Control:**

```html
<div role="group">
  <button class="outline" aria-current="true">Day</button>
  <button class="outline">Week</button>
  <button class="outline">Month</button>
</div>
```

**Input Group:**

```html
<div role="group">
  <input type="text" placeholder="Search...">
  <button>Go</button>
</div>
```

**Search Form:**

```html
<form role="search">
  <input type="search" placeholder="Search...">
  <button type="submit">Search</button>
</form>
```

**Vertical Group:**

```html
<div role="group" class="vertical">
  <button class="outline">First</button>
  <button class="outline">Second</button>
  <button class="outline">Third</button>
</div>
```

### Loading States

Use `aria-busy="true"` for loading indicators:

```html
<!-- Button loading -->
<button aria-busy="true">Saving...</button>

<!-- Card loading -->
<article aria-busy="true"></article>

<!-- Inline loading -->
<span aria-busy="true">Loading data...</span>
```

---

## Utilities

### Sticky Header

Add the `.sticky` class for sticky positioning:

```html
<header class="sticky">
  <nav class="container">
    <strong>Brand</strong>
    <ul>
      <li><a href="#">Link</a></li>
    </ul>
  </nav>
</header>
```

### Color Classes

**Text Colors:**

```html
<p class="muted">Muted text</p>
<p class="primary">Primary color</p>
<p class="destructive">Destructive/error</p>
<p class="success">Success</p>
<p class="warning">Warning</p>
```

**Link Variants:**

```html
<a href="#" class="secondary">Secondary link</a>
<a href="#" class="contrast">Contrast link</a>
```

### Text Utilities

```html
<p class="text-left">Left aligned</p>
<p class="text-center">Center aligned</p>
<p class="text-right">Right aligned</p>

<p class="font-normal">Normal weight</p>
<p class="font-medium">Medium weight</p>
<p class="font-semibold">Semibold weight</p>
<p class="font-bold">Bold weight</p>

<p class="text-sm">Small text</p>
<p class="text-base">Base text</p>
<p class="text-lg">Large text</p>
<p class="text-xl">Extra large text</p>
```

### Visibility

```html
<span class="sr-only">Screen reader only</span>
<div class="hidden">Completely hidden</div>
<div class="invisible">Invisible but takes space</div>
```

### Layout Utilities

```html
<div class="flex">Flexbox</div>
<div class="flex flex-col">Flex column</div>
<div class="flex items-center">Vertically centered</div>
<div class="flex justify-center">Horizontally centered</div>
<div class="flex justify-between">Space between</div>
<div class="flex gap-2">Small gap</div>
<div class="flex gap-4">Default gap</div>
<div class="w-full">Full width</div>
```

### Spacing

```html
<div class="m-0">No margin</div>
<div class="mt-4">Margin top</div>
<div class="mb-4">Margin bottom</div>
<div class="my-4">Margin vertical</div>

<div class="p-0">No padding</div>
<div class="p-4">Default padding</div>
<div class="p-6">Large padding</div>
```

### Borders & Radius

```html
<div class="border">Has border</div>
<div class="border-none">No border</div>
<div class="rounded">Default radius</div>
<div class="rounded-lg">Large radius</div>
<div class="rounded-full">Full radius (circle)</div>
```

### Backgrounds

```html
<div class="bg-muted">Muted background</div>
<div class="bg-card">Card background</div>
<div class="bg-transparent">Transparent</div>
```

### Shadows

```html
<div class="shadow-none">No shadow</div>
<div class="shadow-sm">Small shadow</div>
<div class="shadow">Default shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
```

### Interactions

```html
<div class="cursor-pointer">Pointer cursor</div>
<div class="cursor-not-allowed">Not allowed cursor</div>
<div class="pointer-events-none">No pointer events</div>
<div class="select-none">Text not selectable</div>
```

### Transitions & Animations

```html
<div class="transition">Smooth transitions</div>
<div class="transition-none">No transitions</div>
<div class="animate-spin">Spinning element</div>
<div class="animate-pulse">Pulsing element</div>
```

### Print

```html
<div class="no-print">Hidden when printing</div>
```

---

## Accessibility

Daft CSS is built with accessibility in mind:

- **Semantic HTML**: Uses proper elements for meaning
- **ARIA attributes**: `aria-busy`, `aria-invalid`, `aria-current`, `role="switch"`, etc.
- **Focus indicators**: Clear `:focus-visible` styles
- **Color contrast**: WCAG 2.1 compliant color combinations
- **Screen reader support**: `.sr-only` class for hidden labels

---

## Pico CSS Compatibility

Daft CSS is largely compatible with Pico CSS markup. Key patterns:

| Feature | Syntax |
|---------|--------|
| Card | `<article>` |
| Button | `<button>`, `<a role="button">` |
| Modal | `<dialog>` |
| Accordion | `<details>` |
| Dropdown | `<details class="dropdown">` |
| Switch | `<input type="checkbox" role="switch">` |
| Loading | `aria-busy="true"` |
| Validation | `aria-invalid="true/false"` |
| Active nav | `aria-current="page"` |
| Tooltip | `data-tooltip="text"` |
| Grid | `.grid` |
| Container | `.container` |

---

## Differences from Pico CSS

While compatible with Pico CSS patterns, Daft CSS includes several enhancements:

1. **shadcn/ui Aesthetics**: Modern, minimal design language
2. **OKLCH Colors**: Perceptually uniform color system
3. **Button Variants**: Additional `.ghost`, `.link`, and `.destructive` variants
4. **Progress Variants**: Color variants for progress bars
5. **Utility Classes**: Extended utility class system
6. **Sticky Utility**: Opt-in `.sticky` class for fixed headers
7. **Modern CSS**: Uses `light-dark()`, CSS nesting, `color-mix()`

---

## Build Commands

```bash
npm run build   # Build CSS to dist/
npm run watch   # Watch for changes
npm run dev     # Local dev server
```
