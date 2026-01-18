# Pico CSS v2.1.1 Cheatsheet

A comprehensive reference for Pico CSS - the minimal CSS framework for semantic HTML.

---

## Installation

### CDN (Recommended)
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
```

---

## Starter Template

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
    <title>Hello world!</title>
  </head>
  <body>
    <main class="container">
      <h1>Hello world!</h1>
    </main>
  </body>
</html>
```

---

## Layout

### Container

```html
<!-- Centered container with max-width -->
<main class="container">
  ...
</main>

<!-- Full-width fluid container -->
<main class="container-fluid">
  ...
</main>
```

**Breakpoints:**
| Breakpoint | Width |
|------------|-------|
| sm | ≥576px |
| md | ≥768px |
| lg | ≥1024px |
| xl | ≥1280px |
| xxl | ≥1536px |

### Landmarks & Section

Use semantic landmarks. Pico adds sensible spacing for these blocks.

```html
<body>
  <header class="container">
    <nav>
      <ul><li><strong>Acme</strong></li></ul>
      <ul><li><a href="#">Docs</a></li></ul>
    </nav>
  </header>
  
  <main class="container">
    <section>
      <h2>Section</h2>
      <p>Content with responsive margin-bottom...</p>
    </section>
  </main>
  
  <footer class="container">
    <small>© 2026</small>
  </footer>
</body>
```

### Grid

Auto-layout columns that collapse on small screens (`<768px`).

```html
<div class="grid">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

<!-- Grid with cards -->
<section class="grid">
  <article>Column A</article>
  <article>Column B</article>
  <article>Column C</article>
</section>
```

### Overflow Auto

Use `.overflow-auto` to enable horizontal scrolling for wide content.

```html
<div class="overflow-auto">
  <table>
    <thead><tr><th>Wide</th><th>Table</th><th>Header</th></tr></thead>
    <tbody><tr><td>1</td><td>2</td><td>3</td></tr></tbody>
  </table>
</div>

<!-- Also works with figure for tables -->
<figure>
  <table>...</table>
</figure>
```

---

## Typography

### Headings

```html
<h1>Heading 1</h1>  <!-- 2rem -->
<h2>Heading 2</h2>  <!-- 1.75rem -->
<h3>Heading 3</h3>  <!-- 1.5rem -->
<h4>Heading 4</h4>  <!-- 1.25rem -->
<h5>Heading 5</h5>  <!-- 1.125rem -->
<h6>Heading 6</h6>  <!-- 1rem -->

<!-- Heading group with muted subtitle -->
<hgroup>
  <h2>Main Heading</h2>
  <p>Subtitle text is muted</p>
</hgroup>
```

### Text Elements

```html
<p>Paragraph text</p>
<small>Small text (0.875em)</small>
<strong>Bold text</strong>
<em>Italic/emphasis text</em>
<u>Underlined text</u>
<del>Deleted text</del>
<ins>Inserted text</ins>
<mark>Highlighted text</mark>
<abbr title="Abbreviation">abbr</abbr>
<kbd>Keyboard input</kbd>
<code>Inline code</code>
<samp>Sample output</samp>
<sub>Subscript</sub>
<sup>Superscript</sup>
```

### Horizontal Rule

```html
<hr>
```

### Blockquote

```html
<blockquote>
  "Quote text here."
  <footer>
    <cite>— Author Name</cite>
  </footer>
</blockquote>
```

### Code Blocks

```html
<pre><code>function hello() {
  console.log("Hello, World!");
}</code></pre>
```

### Lists

```html
<!-- Unordered -->
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

<!-- Ordered -->
<ol>
  <li>Item 1</li>
  <li>Item 2</li>
</ol>

<!-- Definition -->
<dl>
  <dt>Term</dt>
  <dd>Definition</dd>
</dl>
```

---

## Links

```html
<!-- Default link -->
<a href="#">Primary link</a>

<!-- Secondary link -->
<a href="#" class="secondary">Secondary link</a>

<!-- Contrast link -->
<a href="#" class="contrast">Contrast link</a>

<!-- Active page in navigation -->
<nav>
  <ul>
    <li><a href="#">Home</a></li>
    <li><a href="#" aria-current="page">Docs</a></li>
  </ul>
</nav>
```

---

## Buttons

### Basic Buttons

```html
<button>Primary Button</button>
<button class="secondary">Secondary</button>
<button class="contrast">Contrast</button>
```

### Outline Buttons

```html
<button class="outline">Primary Outline</button>
<button class="outline secondary">Secondary Outline</button>
<button class="outline contrast">Contrast Outline</button>
```

### Disabled State

```html
<button disabled>Disabled</button>
```

### Role Button

```html
<!-- Any element as button -->
<div role="button" tabindex="0">Div as button</div>
<a href="#" role="button">Link as button</a>
```

### Form Buttons

```html
<input type="submit" value="Submit">
<input type="button" value="Button">
<input type="reset" value="Reset">  <!-- Secondary style by default -->
```

---

## Tables

```html
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Role</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Ada</td>
      <td>Engineer</td>
      <td>Active</td>
    </tr>
    <tr>
      <td>Sam</td>
      <td>Designer</td>
      <td>Paused</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td colspan="3">Footer</td>
    </tr>
  </tfoot>
</table>

<!-- Striped table -->
<table class="striped">
  ...
</table>
```

---

## Forms

### Overview

- Inputs are `width: 100%` by default
- Use `<label>` + `for`/`id` or wrap input inside label
- Helper text: `<small>` below an element
- Validation states via `aria-invalid="true|false"`

### Basic Form

```html
<form>
  <label for="email">Email</label>
  <input id="email" type="email" placeholder="Email" aria-describedby="email-help" autocomplete="email">
  <small id="email-help">We'll never share your email.</small>

  <input type="submit" value="Subscribe">
</form>

<!-- Alternative: label wrapping input -->
<form>
  <label>
    First name
    <input type="text" name="first_name" placeholder="First name" autocomplete="given-name">
  </label>
  <button type="submit">Submit</button>
</form>
```

### Input Types

```html
<input type="text" placeholder="Text" aria-label="Text">
<input type="email" placeholder="Email" aria-label="Email" autocomplete="email">
<input type="password" placeholder="Password" aria-label="Password">
<input type="number" placeholder="Number" aria-label="Number">
<input type="tel" placeholder="Phone" aria-label="Phone">
<input type="url" placeholder="URL" aria-label="URL">
<input type="search" placeholder="Search" aria-label="Search">  <!-- Rounded by default -->
<input type="date" aria-label="Date">
<input type="time" aria-label="Time">
<input type="datetime-local" aria-label="Date and time">
<input type="month" aria-label="Month">
<input type="week" aria-label="Week">
<input type="color" aria-label="Color">
<input type="file" aria-label="File">

<!-- Validation states -->
<input type="text" value="Valid" aria-invalid="false">
<input type="text" value="Invalid" aria-invalid="true">
```

### Textarea

```html
<textarea name="bio" placeholder="Write a short bio..." aria-label="Bio"></textarea>

<!-- Validation states -->
<textarea aria-invalid="false">Valid</textarea>
<textarea aria-invalid="true">Invalid</textarea>
```

### Select

```html
<select name="favorite" aria-label="Favorite cuisine" required>
  <option selected disabled value="">Choose…</option>
  <option>Italian</option>
  <option>Japanese</option>
  <option>Indian</option>
</select>

<!-- Multiple select -->
<select multiple>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Checkboxes

```html
<fieldset>
  <legend>Preferences</legend>

  <label>
    <input type="checkbox" name="news" checked>
    Receive news
  </label>

  <label aria-disabled="true">
    <input type="checkbox" name="disabled" disabled>
    Disabled option
  </label>
</fieldset>

<!-- Indeterminate state via JavaScript -->
<!-- checkbox.indeterminate = true; -->
```

### Radio Buttons

```html
<fieldset>
  <legend>Plan</legend>

  <label>
    <input type="radio" name="plan" checked>
    Basic
  </label>

  <label>
    <input type="radio" name="plan">
    Pro
  </label>
</fieldset>
```

### Switch

```html
<label>
  <input name="terms" type="checkbox" role="switch">
  I agree to the Terms
</label>

<label>
  <input name="opt-in" type="checkbox" role="switch" checked>
  Receive updates
</label>
```

### Range Slider

```html
<label>
  Volume
  <input type="range" min="0" max="100" value="50">
</label>
```

### Disabled Form Elements

```html
<input type="text" disabled>
<select disabled>...</select>
<textarea disabled></textarea>

<!-- Disable entire fieldset -->
<fieldset disabled>
  ...
</fieldset>
```

### Form with Grid

```html
<form>
  <fieldset class="grid">
    <input type="text" placeholder="Username" aria-label="Username">
    <input type="password" placeholder="Password" aria-label="Password">
    <button type="submit">Login</button>
  </fieldset>
</form>
```

---

## Components

### Accordion

Use semantic `<details>` / `<summary>`. Use the same `name="…"` on multiple `<details>` to keep only one open.

```html
<!-- Basic accordion -->
<details>
  <summary>Accordion Title</summary>
  <p>Hidden content here.</p>
</details>

<!-- Open by default -->
<details open>
  <summary>Open Accordion</summary>
  <p>Visible content.</p>
</details>

<!-- Single open (only one at a time) -->
<details name="faq" open>
  <summary>Question 1</summary>
  <p>Answer...</p>
</details>
<hr>
<details name="faq">
  <summary>Question 2</summary>
  <p>Answer...</p>
</details>

<!-- Button style -->
<details>
  <summary role="button">Button Accordion</summary>
  <p>Content</p>
</details>

<!-- Button variants -->
<details>
  <summary role="button" class="secondary">Secondary</summary>
  <p>Content</p>
</details>
<details>
  <summary role="button" class="outline">Outline</summary>
  <p>Content</p>
</details>
<details>
  <summary role="button" class="outline contrast">Outline Contrast</summary>
  <p>Content</p>
</details>
```

### Card

A "card" is a semantic `<article>`. Add `<header>` / `<footer>` for sections.

```html
<article>
  I'm a card!
</article>

<!-- Card with header and footer -->
<article>
  <header><strong>Header</strong></header>
  Body content...
  <footer><small>Footer</small></footer>
</article>
```

### Dropdown

Use `<details class="dropdown">` with `<summary>` + `<ul>` as direct children.

```html
<!-- Basic dropdown -->
<details class="dropdown">
  <summary>Dropdown</summary>
  <ul>
    <li><a href="#">Solid</a></li>
    <li><a href="#">Liquid</a></li>
    <li><a href="#">Gas</a></li>
  </ul>
</details>

<!-- Button dropdown -->
<details class="dropdown">
  <summary role="button">Dropdown Button</summary>
  <ul>
    <li><a href="#">Action 1</a></li>
    <li><a href="#">Action 2</a></li>
  </ul>
</details>

<!-- Right-aligned dropdown (in nav) -->
<details class="dropdown">
  <summary>Account</summary>
  <ul dir="rtl">
    <li><a href="#">Profile</a></li>
    <li><a href="#">Settings</a></li>
    <li><a href="#">Logout</a></li>
  </ul>
</details>

<!-- Dropdown with radio/checkbox (custom select) -->
<details class="dropdown">
  <summary>Select option...</summary>
  <ul>
    <li><label><input type="radio" name="opt"> Option 1</label></li>
    <li><label><input type="radio" name="opt"> Option 2</label></li>
  </ul>
</details>

<!-- Validation state -->
<details class="dropdown" aria-invalid="true">
  <summary>Invalid dropdown</summary>
  <ul>...</ul>
</details>
```

### Group

Use `role="group"` to stack form elements/buttons horizontally. Use `role="search"` for search-styled groups.

```html
<!-- Button group -->
<div role="group">
  <button>One</button>
  <button aria-current="true">Active</button>
  <button class="secondary">Three</button>
</div>

<!-- Search form group -->
<form role="search">
  <input type="search" name="search" placeholder="Search">
  <input type="submit" value="Search">
</form>

<!-- Input + button group -->
<form>
  <fieldset role="group">
    <input type="email" name="email" placeholder="Email" autocomplete="email">
    <input type="submit" value="Subscribe">
  </fieldset>
</form>
```

### Loading

Add `aria-busy="true"` to show a loading indicator.

```html
<!-- Loading article -->
<article aria-busy="true"></article>

<!-- Loading text -->
<span aria-busy="true">Generating your link…</span>

<!-- Loading button -->
<button aria-busy="true">Loading...</button>

<!-- Just spinner (empty button) -->
<button aria-busy="true" aria-label="Please wait…"></button>
```

### Modal

Use native `<dialog>` with an `<article>` for content. Add/remove the `open` attribute to toggle.

```html
<dialog open>
  <article>
    <header>
      <button aria-label="Close" rel="prev"></button>
      <p><strong>Modal Title</strong></p>
    </header>
    <p>Modal content goes here.</p>
    <footer>
      <button class="secondary">Cancel</button>
      <button>Confirm</button>
    </footer>
  </article>
</dialog>
```

**Utility classes (add to `<html>`):**
- `.modal-is-open` — prevents background scroll/interactions
- `.modal-is-opening` — opening animation
- `.modal-is-closing` — closing animation

```html
<html class="modal-is-open modal-is-opening">
  ...
</html>
```

**JavaScript to toggle modal:**
```javascript
const dialog = document.querySelector('dialog');
dialog.showModal();  // Open
dialog.close();      // Close
```

### Nav

Navbar uses semantic `<nav>` with one or more `<ul>` lists; items align horizontally.

```html
<!-- Basic navbar -->
<nav>
  <ul>
    <li><strong>Acme Corp</strong></li>
  </ul>
  <ul>
    <li><a href="#">About</a></li>
    <li><a href="#">Services</a></li>
    <li><a href="#" aria-current="page">Products</a></li>
  </ul>
</nav>

<!-- With button -->
<nav>
  <ul>
    <li><strong>Brand</strong></li>
  </ul>
  <ul>
    <li><a href="#">About</a></li>
    <li><button>Sign Up</button></li>
  </ul>
</nav>

<!-- With dropdown -->
<nav>
  <ul>
    <li><strong>Brand</strong></li>
  </ul>
  <ul>
    <li>
      <details class="dropdown">
        <summary>Account</summary>
        <ul dir="rtl">
          <li><a href="#">Profile</a></li>
          <li><a href="#">Settings</a></li>
          <li><a href="#">Logout</a></li>
        </ul>
      </details>
    </li>
  </ul>
</nav>

<!-- Vertical nav (in aside) -->
<aside>
  <nav>
    <ul>
      <li><a href="#">Link 1</a></li>
      <li><a href="#">Link 2</a></li>
      <li><a href="#">Link 3</a></li>
    </ul>
  </nav>
</aside>

<!-- Breadcrumb -->
<nav aria-label="breadcrumb">
  <ul>
    <li><a href="#">Home</a></li>
    <li><a href="#">Services</a></li>
    <li>Design</li>
  </ul>
</nav>

<!-- Custom breadcrumb divider -->
<nav aria-label="breadcrumb" style="--pico-nav-breadcrumb-divider: '/';">
  ...
</nav>
```

### Progress

```html
<!-- Determinate -->
<progress value="50" max="100"></progress>

<!-- Indeterminate -->
<progress></progress>
```

### Tooltip

Use `data-tooltip="…"` on almost any element. Placement via `data-placement` (default is top).

```html
<!-- Basic tooltip -->
<span data-tooltip="Tooltip text">Hover me</span>

<!-- On a link -->
<p>Tooltip on a <a href="#" data-tooltip="Tooltip">link</a></p>

<!-- On inline element -->
<p>Tooltip on <em data-tooltip="Tooltip">inline element</em></p>

<!-- Tooltip positions -->
<span data-tooltip="Top tooltip" data-placement="top">Top</span>
<span data-tooltip="Bottom tooltip" data-placement="bottom">Bottom</span>
<span data-tooltip="Left tooltip" data-placement="left">Left</span>
<span data-tooltip="Right tooltip" data-placement="right">Right</span>

<!-- On button -->
<button data-tooltip="Tooltip" data-placement="right">Button</button>
```

---

## Light/Dark Mode

Pico automatically follows user preference (`prefers-color-scheme`). You can force a scheme globally or locally with `data-theme`.

### Automatic (Recommended)

Add to `<head>`:
```html
<meta name="color-scheme" content="light dark">
```

### Force Document Theme

```html
<html data-theme="light">
<!-- or -->
<html data-theme="dark">
```

### Force Component Theme (Theme "Islands")

Apply `data-theme` to individual components for mixed themes:

```html
<article data-theme="light">
  <h2>Light card in a dark page</h2>
  <p>This card stays light regardless of page theme.</p>
</article>
```

### Theme-Aware Custom Styles

Some custom elements may need explicit background/text colors to inherit scheme variables:

```css
section {
  background-color: var(--pico-background-color);
  color: var(--pico-color);
}
```

### Toggle with JavaScript

```javascript
// Get current theme
const theme = document.documentElement.getAttribute('data-theme');

// Set theme
document.documentElement.setAttribute('data-theme', 'dark');
document.documentElement.setAttribute('data-theme', 'light');

// Remove to use auto
document.documentElement.removeAttribute('data-theme');
```

### Theme Toggle Example

```html
<button id="theme-toggle">Toggle Theme</button>

<script>
  const toggle = document.getElementById('theme-toggle');
  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
  });
</script>
```

---

## CSS Variables Worth Tweaking

Pico exposes 130+ CSS custom properties. Set globally on `:root`, or per-theme using `[data-theme="light"]` / `[data-theme="dark"]`.

### Global Layout & Sizing

```css
:root {
  /* Borders */
  --pico-border-radius: 0.25rem;
  --pico-border-width: 0.0625rem;
  --pico-outline-width: 0.125rem;
  
  /* Transitions */
  --pico-transition: 0.2s ease-in-out;
  
  /* Spacing */
  --pico-spacing: 1rem;
  --pico-typography-spacing-vertical: 1rem;
  --pico-block-spacing-vertical: var(--pico-spacing);
  --pico-block-spacing-horizontal: var(--pico-spacing);
  
  /* Grid */
  --pico-grid-column-gap: var(--pico-spacing);
  --pico-grid-row-gap: var(--pico-spacing);
  
  /* Form elements */
  --pico-form-element-spacing-vertical: 0.75rem;
  --pico-form-element-spacing-horizontal: 1rem;
  
  /* Nav */
  --pico-nav-element-spacing-vertical: 1rem;
  --pico-nav-element-spacing-horizontal: 0.5rem;
  --pico-nav-link-spacing-vertical: 0.5rem;
  --pico-nav-link-spacing-horizontal: 0.5rem;
  --pico-nav-breadcrumb-divider: ">";
}
```

### Typography

```css
:root {
  --pico-font-family: system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, 
                      Cantarell, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  --pico-font-size: 100%;
  --pico-line-height: 1.5;
  --pico-font-weight: 400;
  --pico-text-underline-offset: 0.1rem;
}
```

### Core Colors (Theme Variables)

These are the "big knobs" for theming:

```css
/* Global primary color */
:root {
  --pico-primary: #0172ad;
  --pico-primary-background: #0172ad;
  --pico-primary-hover: #015887;
  --pico-primary-hover-background: #02659a;
  --pico-primary-focus: rgba(2, 154, 232, 0.5);
  --pico-primary-inverse: #fff;
}

/* Per-theme overrides */
[data-theme="light"],
:root:not([data-theme="dark"]) {
  --pico-background-color: #fff;
  --pico-color: #373c44;
  --pico-muted-color: #646b79;
  --pico-muted-border-color: #e7eaef;
  
  /* Secondary */
  --pico-secondary: #5d6b89;
  --pico-secondary-background: #525f7a;
  --pico-secondary-hover: #48536b;
  
  /* Contrast */
  --pico-contrast: #181c25;
  --pico-contrast-background: #181c25;
  --pico-contrast-hover: #000;
  
  /* Cards */
  --pico-card-background-color: #fff;
  --pico-card-border-color: #e7eaef;
  --pico-card-sectioning-background-color: #fbfbfc;
  
  /* Forms */
  --pico-form-element-background-color: #fbfbfc;
  --pico-form-element-border-color: #cfd5e2;
  --pico-form-element-active-border-color: var(--pico-primary);
  
  /* Validation */
  --pico-form-element-valid-border-color: #4c9a89;
  --pico-form-element-invalid-border-color: #b7696a;
}

[data-theme="dark"] {
  --pico-background-color: #13161e;
  --pico-color: #c2c7d0;
  --pico-muted-color: #7b8495;
  --pico-muted-border-color: #202632;
  
  /* Primary adjustments for dark */
  --pico-primary: #01aaff;
  --pico-primary-hover: #79c0ff;
  
  /* Cards */
  --pico-card-background-color: #181c25;
  --pico-card-sectioning-background-color: #1a1e28;
  
  /* Forms */
  --pico-form-element-background-color: #1c212b;
  --pico-form-element-border-color: #2a3140;
}
```

### Component-Specific Variables

```css
:root {
  /* Accordion */
  --pico-accordion-border-color: var(--pico-muted-border-color);
  --pico-accordion-active-summary-color: var(--pico-primary-hover);
  
  /* Card */
  --pico-card-box-shadow: var(--pico-box-shadow);
  
  /* Dropdown */
  --pico-dropdown-background-color: #fff;
  --pico-dropdown-border-color: #eff1f4;
  --pico-dropdown-hover-background-color: #eff1f4;
  
  /* Modal */
  --pico-modal-overlay-backdrop-filter: blur(0.375rem);
  
  /* Progress */
  --pico-progress-background-color: #dfe3eb;
  --pico-progress-color: var(--pico-primary-background);
  
  /* Switch */
  --pico-switch-background-color: #bfc7d9;
  --pico-switch-checked-background-color: var(--pico-primary-background);
  --pico-switch-color: #fff;
  
  /* Tooltip */
  --pico-tooltip-background-color: var(--pico-contrast-background);
  --pico-tooltip-color: var(--pico-contrast-inverse);
  
  /* Range */
  --pico-range-thumb-color: var(--pico-secondary-background);
  --pico-range-thumb-active-color: var(--pico-primary-background);
  
  /* Breadcrumb */
  --pico-nav-breadcrumb-divider: "›";
}
```

---

## Quick Customization Recipe

```css
/* Custom theme example */
:root {
  /* Make it rounder */
  --pico-border-radius: 1rem;
  
  /* Increase spacing */
  --pico-spacing: 1.5rem;
  
  /* Custom font */
  --pico-font-family: "Inter", system-ui, sans-serif;
  
  /* Softer shadows */
  --pico-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Change primary color */
[data-theme="light"], :root:not([data-theme="dark"]) {
  --pico-primary: #6366f1;
  --pico-primary-hover: #4f46e5;
  --pico-primary-background: #6366f1;
  --pico-primary-hover-background: #4f46e5;
}
```

---

## Kitchen Sink Example

A quick reference page with all major components:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <title>Kitchen Sink</title>
</head>
<body>
  <main class="container">
    <nav>
      <ul><li><strong>Kitchen Sink</strong></li></ul>
      <ul><li><a href="#" aria-current="page">Home</a></li></ul>
    </nav>

    <h1>Title</h1>
    <p><a href="#" data-tooltip="Tooltip">Link</a> and <button class="secondary">Button</button></p>

    <section class="grid">
      <article>
        <header><strong>Card</strong></header>
        <p>Card body...</p>
        <footer><small>Footer</small></footer>
      </article>

      <article>
        <form>
          <label>Email <input type="email" placeholder="Email"></label>
          <fieldset role="group">
            <input type="search" placeholder="Search">
            <input type="submit" value="Go">
          </fieldset>

          <label><input type="checkbox" role="switch"> Switch</label>
          <label>Range <input type="range" min="0" max="100" value="50"></label>

          <progress value="39" max="100"></progress>
        </form>
      </article>
    </section>

    <details class="dropdown">
      <summary role="button">Dropdown</summary>
      <ul><li><a href="#">Item</a></li></ul>
    </details>

    <div class="overflow-auto">
      <table>
        <thead><tr><th>A</th><th>B</th><th>C</th></tr></thead>
        <tbody><tr><td>1</td><td>2</td><td>3</td></tr></tbody>
      </table>
    </div>

    <article aria-busy="true"></article>
  </main>
</body>
</html>
```

---

## Resources

- **Official Website:** https://picocss.com
- **Documentation:** https://picocss.com/docs
- **GitHub:** https://github.com/picocss/pico
- **Examples:** https://picocss.com/examples
- **NPM:** https://www.npmjs.com/package/@picocss/pico

---

*Last updated for Pico CSS v2.1.1*
