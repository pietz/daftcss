# Daft CSS Documentation

A semantic-first CSS framework with [shadcn/ui](https://ui.shadcn.com)-quality aesthetics. Style raw HTML — no JavaScript, no required utility classes, no JSX components.

## Overview

Daft CSS styles semantic HTML elements directly—no classes required for basic styling. Write clean HTML and get beautiful, responsive components automatically.

**Key Features:**
- Semantic HTML styling (buttons, inputs, tables work out of the box)
- Light/dark mode with automatic system preference detection
- Modern CSS (OKLCH colors, `light-dark()`, CSS nesting)
- Minimal footprint (~68 KB minified)

**Browser Support:** Chrome 123+, Firefox 129+, Safari 18+

## Getting Started

### Installation

```html
<link rel="stylesheet" href="daft.min.css">
```

Or via npm:

```bash
npm install daftcss
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

## Blocks

Blocks are reusable page sections composed from Daft primitives. Use them before inventing custom page layouts.

- Landing: centered hero, reservation hero, feature grid, how-it-works, FAQ, final CTA, pricing cards
- Application: top-nav shell, sidebar shell, workspace browser, dashboard stats, settings form, empty state, status panel
- Content/docs: section header, changelog list, comparison table, code snippet card

See `docs/blocks/` for visual examples and `skills/daftcss/references/blocks.md` for agent-facing skeletons.

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

### Theme islands

`data-theme` is not limited to `<html>`. Apply it to any element to flip a subtree to the opposite theme. Descendants inherit the local `color-scheme`, and every color token wrapped in `light-dark()` resolves against it — no overrides needed.

```html
<!-- Dark hero on an otherwise light page -->
<section data-theme="dark">
  <h1>Ship faster</h1>
  <p>Semantic HTML, no utility soup.</p>
  <button>Get started</button>
</section>

<!-- Light callout inside a dark page -->
<article data-theme="light">
  Read the docs
</article>
```

Use it for inverted heroes, alternating landing sections, or a single callout that needs to stand out from the surrounding page.

### CSS Variables

Customize the design system by overriding root variables:

```css
:root {
  --spacing: 1rem;        /* Base spacing unit */
  --radius: 0.5rem;       /* Border radius */
  --font-size-base: 1rem; /* Base font size */
  --transition: 150ms;    /* Animation duration */
  --component-height: 2rem; /* Button/input height */
  --section-gap: var(--spacing-xl); /* Vertical margin between <section> landmarks */
}
```

**Section gap** — override `--section-gap` at `:root` for landing-style pages, e.g. `--section-gap: clamp(5rem, 10vw, 9rem)`. Default (2rem) is tuned for app/dashboard layouts.

**Color Tokens (shadcn/ui naming):**

| Variable | Description |
|----------|-------------|
| `--background` | Page background |
| `--foreground` | Default text color |
| `--primary` | Primary action color (default: neutral near-black/near-white) |
| `--secondary` | Secondary button background |
| `--accent` | Solid accent components and hover/selected surfaces |
| `--accent-foreground` | Auto-contrasting text on accent surfaces; may be overridden explicitly |
| `--muted` | Subtle/inert background (disabled inputs, inline `<code>`, `<kbd>`) |
| `--code-background` | `<pre>` block surface (slightly darker than `--muted` in dark mode) |
| `--muted-foreground` | Muted text |
| `--destructive` | Error/danger color |
| `--destructive-foreground` | Text on destructive backgrounds |
| `--success` | Success color |
| `--success-foreground` | Text on success backgrounds |
| `--warning` | Warning color |
| `--warning-foreground` | Text on warning backgrounds |
| `--border` | Border color |
| `--card` | Card background |
| `--popover` | Dropdown / popover background (defaults to `--card`; override independently) |

`--accent`, `--secondary`, and `--muted` share the same default value but are exposed as separate knobs so you can retune solid accent components and hover/selected surfaces, secondary buttons, and disabled surfaces independently. `--accent-foreground` derives a neutral near-white or near-black from an opaque `--accent` using relative OKLCH; an explicit declaration overrides it. This minor release replaces the previous `var(--foreground)` default, so custom accents can visibly change existing accent-powered hover/selected text. Set `--accent-foreground: var(--foreground)` to retain the former behavior. Scoped accent overrides must redeclare the foreground pair, and translucent accents need an explicit opaque foreground plus contrast testing over their actual backgrounds.

**Component Shadows:**

Each elevated component has its own shadow token. Set any to `none` to flatten that component, or override globally for a flat or extra-lifted feel.

| Variable | Default | Used by |
|----------|---------|---------|
| `--button-shadow` | `none` | Buttons, button-styled accordion summaries |
| `--card-shadow` | `var(--shadow-xs)` | `<article>` cards |
| `--dropdown-shadow` | `var(--shadow-md)` | `<details class="dropdown">` menus |
| `--modal-shadow` | `var(--shadow-lg)` | `<dialog>` surfaces |

```css
/* Flatten cards globally */
:root {
  --card-shadow: none;
}

/* Or replace with a specific elevation */
:root {
  --card-shadow: var(--shadow-md);
}
```

**Card Spacing:**

| Variable | Default | Purpose |
|----------|---------|---------|
| `--card-padding` | `var(--spacing)` | Space between a card edge and its content |
| `--card-gap` | `var(--spacing)` | Separation from a card header or footer to its body |

Dialogs use `--card-padding`; their `--modal-max-width` default is `24rem`.

Override card spacing tokens together for compact cards, or independently when outer padding and internal section rhythm should differ.

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

One primitive. No breakpoint matrix.

**`.grid`** — direct children become equal columns. Three children → three columns; five children → five columns. The child count is the column count. Below 768px, the grid stacks to a single column.

```html
<div class="grid">
  <article>One</article>
  <article>Two</article>
  <article>Three</article>
</div>
```

A child with `.span-N` (N = 2, 3, or 4) claims N tracks instead of one. Spans are *weights*, not Bootstrap-style fixed columns — a 2-child grid with one `.span-2` becomes a 1:2 ratio (3 total tracks). For a 2:1 layout:

```html
<div class="grid">
  <aside>Nav</aside>
  <main class="span-2">Content</main>
</div>
```

For a multi-row layout, use multiple grids — one per row. The layout reads top-to-bottom and each row is independent.

### Sidebar

Add `.sidebar` to a direct child `<aside>` of `<body>` to create an app sidebar. Its canonical direct-child structure is an optional `<header>`, required `<nav>`, and optional `<footer>`. Header and footer have full-width separators and remain visible; the nav is the only scrolling region. A nav-only sidebar remains supported. On desktop (≥ 768px), placement defines the layout. On mobile, pair it with `popover` and a `.sidebar-toggle` button for a slide-out drawer with no JavaScript.

```html
<aside id="sidebar" class="sidebar" popover aria-label="Workspace navigation">
  <header><strong>Acme</strong></header>
  <nav aria-label="Workspace">
    <ul>
      <li class="label">Overview</li>
      <li><a href="#" aria-current="page">Dashboard</a></li>
      <li><a href="#">Reports</a></li>
    </ul>
  </nav>
  <footer><small>Signed in as Kai</small></footer>
</aside>

<header class="container-fluid">
  <button class="ghost icon sidebar-toggle"
          popovertarget="sidebar"
          aria-label="Open menu"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg></button>
  <strong>Admin</strong>
</header>

<main class="container-fluid">
  <hgroup>
    <h1>Page Title</h1>
    <p>Subtitle</p>
  </hgroup>
</main>
```

By default, the sidebar is a persistent desktop rail and a native Popover drawer on mobile; its `.sidebar-toggle` is shown only on mobile. Add `.drawer` (`class="sidebar drawer"`) to make it a native hidden drawer at every width: the same `.sidebar-toggle` is shown at every width, the page layout does not shift, and no JavaScript is needed. A visible-by-default, stateful desktop collapse is not provided because it requires application state and JavaScript. The native Popover API handles open/close, Escape, click-outside behavior, focus management, and the backdrop.

**Custom width**

Override the sidebar width with `--aside-width`:

```css
:root {
  --aside-width: 14rem;  /* narrower */
}
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
<p class="label">Eyebrow label</p>
```

### Heading Groups

Use `<hgroup>` only for a compact heading and subtitle, not when a heading alone is enough. Its direct children are a real `<h1>`–`<h6>` and supporting `<p>`; it keeps the heading level, uses a 4px internal gap and muted subtitle, and retains normal document spacing around the group. Cards and dialogs contextually render the pair at 18px and 14px; slides retain their responsive slide typography.

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

Buttons are styled automatically. Use `<button>` or a button-type `<input>` for actions; use `<a href>` for navigation. Add `.button` only when a prominent navigation link needs button appearance; this preserves native link semantics without `role="button"`. For toggle buttons and segmented controls, use `aria-pressed="true"` to identify the selected state. Reserve `aria-current` for a genuinely current navigation or item state.

### Basic Button

```html
<button>Primary Button</button>
<button type="reset">Reset Button</button>
<a href="#">Navigation link</a>
<a class="button" href="/checkout">Checkout</a>
<a class="button secondary" href="#schedule">Explore the program</a>
```

### Variants

```html
<button>Primary</button>
<button class="accent">Accent</button>
<button class="secondary">Secondary</button>
<button class="outline">Outline</button>
<button class="ghost">Ghost</button>
<button class="link">Link</button>
<button class="destructive">Destructive</button>
```

Bare buttons remain primary; there is no `.primary` class. Across Daft, `.accent` means non-status brand emphasis. It is supported by the button family (including `.button` links and button-styled summaries), badges, and progress—no other components or elements. On buttons it is mutually exclusive with `.secondary`, `.destructive`, `.outline`, `.ghost`, and `.link`; an established surface variant wins if classes are accidentally combined. Size, icon, full-width, group, disabled/busy, and selected-state composition remains supported.

### Sizes

```html
<button class="small">Small</button>
<button>Default</button>
<button class="large">Large</button>
```

### Icons and Icon Buttons

Daft provides an icon pattern, not an icon library. `.icon` belongs on an icon-only control and makes that control square. Give the control an accessible name with `aria-label`, then place an official SVG directly inside it with `aria-hidden="true"` when the control supplies the name.

```html
<button class="icon" type="button" aria-label="Menu">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">
    <path d="M4 5h16"/>
    <path d="M4 12h16"/>
    <path d="M4 19h16"/>
  </svg>
</button>
```

For icon plus text, use an ordinary control without `.icon`. Direct-child SVGs inherit `currentColor`, size to `--icon-size`, and use the control's existing gap.

```html
<button type="button">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">
    <path d="m21 21-4.34-4.34"/>
    <circle cx="11" cy="11" r="8"/>
  </svg>
  Search
</button>
```

Use exact official Lucide path data retrieved from [lucide.dev](https://lucide.dev) or an official Lucide package. Do not approximate icons or substitute emoji or Unicode glyphs. Daft has no Lucide dependency; framework users may render official Lucide components as direct children of controls.

### Full Width

```html
<button class="full-width">Full Width Button</button>
```

### Disabled State

Use the native `disabled` attribute when a form control must not be operable:

```html
<button disabled>Disabled</button>
```

`aria-disabled="true"` communicates a state to assistive technology and receives Daft's disabled styling on button controls, but it does not prevent keyboard activation or form submission. If a custom control uses it, application code must suppress the control's behavior. Links have no native disabled state, so Daft does not provide a disabled `.button` anchor variant; omit an unavailable link or render non-interactive text.

### Loading State

`aria-busy` reports a loading state but does not disable a control. Combine it with `disabled` when activation must be prevented:

```html
<button disabled aria-busy="true">Loading...</button>
```

### Accent support matrix

| Surface | Support and meaning |
|---|---|
| Buttons, button-type inputs, button roles, `.button` links, button-styled summaries | Solid accent action or trigger |
| Badges | Branded category, featured label, or accent emphasis |
| Progress | Branded task progress without status meaning |
| Inputs/choices/validation, alerts/status/loaders, cards/dialogs/tooltips, navigation/tree/accordions, tables/avatars, content/layout/utilities | No `.accent`; native state/role or the component's non-color-variant contract owns presentation |

This is a semantic component variant, not a generic background or text-color utility.

---

## Forms

Form elements are styled automatically with semantic HTML. Standalone sibling controls and input groups receive compact row spacing; direct form children use the roomier form rhythm. Controls nested inside labels or groups defer spacing to their container.

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
<input type="month">
<input type="week">
<input type="color">
<input type="file">
```

Date, time, datetime-local, month, and week share the same calendar-picker treatment — the native picker indicator is muted at rest and intensifies on hover. `type="color"` renders as a clickable swatch sitting inside the framework's border, radius, and `--input-background` surface, so it stays aligned with adjacent text inputs in a stack or `role="group"`. The native file-selector button keeps its secondary surface while matching the inset size, padding, and edge spacing of an input-group action.

### Sizes

`<input>` and `<select>` accept the same size modifiers as `<button>`:

```html
<input class="small" placeholder="Compact">
<input placeholder="Default">
<input class="large" placeholder="Roomy">

<select class="large"><option>Choose…</option></select>
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

An adjacent or following `<small>` automatically picks up the destructive or primary color so helper text matches the state.

### Indeterminate Checkbox

`<input type="checkbox">` picks up an indeterminate style — same primary fill as `:checked`, but with a horizontal bar instead of a check — when its DOM `indeterminate` property is true. This must be set from JavaScript (`el.indeterminate = true`); HTML has no attribute for it. Common use: a "select all" header checkbox that reflects a partial child selection.

```html
<label><input type="checkbox" id="select-all"> Select all</label>
<script>
  document.getElementById('select-all').indeterminate = true;
</script>
```

### Required Fields

Required fields automatically show a decorative asterisk. Wrapping labels place it before their contents so it stays clear of full-width controls, multiline choice text, and nested help text; separate labels keep a suffix marker:

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

Use `<article>` for cards. When a semantic article should remain ordinary document content instead, add `.plain`; this opts that article out of the card surface, padding, compact typography, header/footer layout, and other card-only presentation. The class has no Daft meaning on non-article elements.

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

**Optional title + subtitle pair:** use `<hgroup>` with direct real heading and supporting paragraph children when a card needs both. The heading keeps its semantic level; card titles render at 18px and subtitles at 14px. A sibling element inside `<header>` (badge, action button) floats to the right automatically.

```html
<article>
  <header>
    <hgroup>
      <h3>Sprint 14</h3>
      <p>Ends Friday. Cut release branch next.</p>
    </hgroup>
    <span class="badge">12 / 18</span>
  </header>
  …
</article>
```

**Plain document article:**

```html
<article class="plain">
  <header><h2>Field report</h2><p>Published 20 May 2025</p></header>
  <p>Long-form narrative content follows normal document flow.</p>
  <footer>Filed under Research</footer>
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

### Badge

Use `<span class="badge">` for a short inline status, category, count, or label alongside text, headings, or table cells.

```html
<span class="badge">New</span>
```

**Variants:**

```html
<span class="badge">Featured</span>
<span class="badge accent">Branded</span>
<span class="badge secondary">Pending</span>
<span class="badge outline">Active</span>
<span class="badge ghost">Metadata</span>
<span class="badge destructive">Failed</span>
```

Badges share button static surface recipes, including `.accent`, but remain presentational and noninteractive: they are not buttons or links. Choose at most one optional variant, keep the text meaningful without color, and use a real control for actions. Every badge uses the canonical 20px pill size; there are no badge size or shape variants. For v1 compatibility, deprecated `.success` maps to `.outline`, `.warning` maps to `.secondary`, and old badge size classes render at the canonical size.

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

Dropdown summaries use the same styling and variants as buttons, including the solid `.accent` treatment:

```html
<details class="dropdown">
  <summary class="accent">Actions</summary>
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

### Tree

Compact, IDE-style file tree. Folders use `<details>`/`<summary>` for native open/close; files are `<a>` inside `<li>` for clickable rows. The chevron alone differentiates folders from files — no icons required.

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

**Active state:** Add `aria-current="page"` (preferred, accessible) or `.active` to the file link to highlight the current selection.

**Customize indent:** Override `--tree-indent` on the `.tree` root to change the per-level indent step. Defaults to `var(--spacing-md)`.

```html
<ul class="tree" style="--tree-indent: 1.25rem">…</ul>
```

### Dialogs

#### Popover dialog

For a no-JavaScript, light-dismiss overlay, combine `<dialog>` with the Popover API:

```html
<button popovertarget="help-dialog">Open Help</button>

<dialog id="help-dialog" popover aria-label="Help">
  <header>
    <button aria-label="Close" popovertarget="help-dialog"
            popovertargetaction="hide">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
           viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true">
        <path d="M18 6 6 18"/>
        <path d="m6 6 12 12"/>
      </svg>
    </button>
    <strong>Help</strong>
  </header>
  <p>Supporting information goes here.</p>
</dialog>
```

The Popover API provides light dismiss, Escape-key dismissal, and a backdrop without JavaScript. It is deliberately non-modal: the page does not become inert and focus is not contained. Do not use this pattern for a blocking decision.

#### Modal dialog

Use a regular `<dialog>` opened with `showModal()` when the rest of the page must become inert. Daft also styles this platform-native modal path:

```html
<dialog id="alert-dialog" aria-label="Migration status">
  <p><strong>Heads up</strong></p>
  <p>Migration finished with 3 warnings.</p>
  <button onclick="this.closest('dialog').close()">OK</button>
</dialog>
<button onclick="document.getElementById('alert-dialog').showModal()">Open</button>
```

The dialog is the surface: use an optional direct `<header>`, direct flow content or a direct `<form>`, and a direct `<footer>` or one inside that form. Dialogs default to a 24rem maximum width and use `--card-padding`. Override `--modal-max-width` on an application selector when a particular dialog needs more room; viewport constraints remain in effect. Forms have no dialog-specific container styling.

Migration: `<dialog><article>…</article></dialog>` remains supported in v1; remove the `<article>` tags.

### Navigation

**Horizontal Nav:**

Ordinary navigation remains horizontal and wraps safely on narrow screens. A list link may contain a direct inline SVG followed by its text; Daft aligns the icon and text with the standard gap and sizes the SVG with `--icon-size`.

```html
<nav>
  <strong>Brand</strong>
  <ul>
    <li><a href="/" aria-current="page"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
```

**Responsive Sticky Top Nav:**

Opt in with one Popover-backed link list. Below 768px, the icon-only trigger opens that same list as a panel beneath the sticky bar. The browser supplies light dismiss and Escape behavior without JavaScript.

```html
<nav class="top-nav sticky glass" aria-label="Primary">
  <ul><li><a href="/"><strong>Brand</strong></a></li></ul>
  <button class="top-nav-toggle ghost icon" type="button"
          popovertarget="primary-menu" aria-label="Toggle primary navigation">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <path d="M4 5h16"/>
      <path d="M4 12h16"/>
      <path d="M4 19h16"/>
    </svg>
  </button>
  <ul id="primary-menu" class="top-nav-menu" popover>
    <li><a href="/projects">Projects</a></li>
    <li><a href="/team">Team</a></li>
  </ul>
</nav>
```

This pattern is for a single-row sticky top bar, not an arbitrarily placed trigger. Set `--top-nav-height` when customizing the bar height. If an open mobile menu crosses the desktop breakpoint, CSS places it with the desktop links, but CSS cannot clear the native top-layer state; dismiss it with Escape or light dismiss.

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
<progress value="60" max="100" class="accent"></progress>
<progress value="60" max="100" class="secondary"></progress>
<progress value="60" max="100" class="success"></progress>
<progress value="60" max="100" class="warning"></progress>
<progress value="60" max="100" class="destructive"></progress>
```

Use `.accent` for branded task emphasis without status meaning. Use at most one progress color class; communicate success, warning, or failure in text rather than color alone.

**With Label:**

```html
<label>
  Uploading...
  <progress value="45" max="100"></progress>
</label>
```

### Alert

Use `role="alert"` for assertive/error messages and `role="status"` for polite/informational ones. The role drives the styling — no class needed.

```html
<div role="alert">
  <strong>Payment failed</strong>
  <p>Your card could not be charged. Try another payment method.</p>
</div>

<div role="status">
  <strong>Sync in progress</strong>
  <p>We are updating your workspace.</p>
</div>
```

`role="alert"` renders with a destructive (red) tint; `role="status"` renders neutral. The first `<strong>` is the title, the following `<p>` is the body — both are optional.

### Avatar

A round container sized to match form controls. Wrap initials, an `<img>`, or an inline `<svg>`.

```html
<span class="avatar">KS</span>
<span class="avatar"><img src="/me.jpg" alt=""></span>
<span class="avatar"><svg viewBox="0 0 24 24">…</svg></span>
```

**Sizes:**

```html
<span class="avatar small">XS</span>
<span class="avatar">MD</span>
<span class="avatar large">LG</span>
```

The default size tracks `--component-height` so avatars align with buttons and inputs in toolbars.

### Tooltip

Use `data-tooltip` on a focusable control so both pointer and keyboard users can reveal it:

```html
<button data-tooltip="Save changes">Save</button>
```

Tooltip text rendered by CSS is a visual enhancement, not a reliable accessible name or description. Keep meaningful visible text, or provide an accessible name for an icon-only control:

```html
<button aria-label="Help" data-tooltip="Help" data-placement="right">?</button>
```

`data-placement` accepts `top` (default), `bottom`, `left`, or `right`.

### Group

Use `role="group"` for related button or field controls. Button-only and non-qualifying groups retain joined, segmented borders:

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
  <button class="outline" aria-pressed="true">Day</button>
  <button class="outline">Week</button>
  <button class="outline">Month</button>
</div>
```

**Input Group:**

```html
<div role="group" aria-label="Message composer">
  <button class="icon ghost" type="button" aria-label="Attach file">
    <svg aria-hidden="true"><!-- paperclip --></svg>
  </button>
  <input type="text" aria-label="Message" placeholder="Write a message">
  <button class="icon ghost" type="button" aria-label="Dictate message">
    <svg aria-hidden="true"><!-- microphone --></svg>
  </button>
  <button type="button">Send</button>
</div>
```

**Search Form:**

```html
<form role="search">
  <input type="search" placeholder="Search...">
  <button type="submit">Search</button>
</form>
```

A non-`fieldset`, non-vertical group with exactly one direct eligible text-like input, only direct `svg`/`code`/`samp`/`kbd`/`span`/`output` addons, and any number of direct button-like actions becomes a full-width unified field shell. Actions can appear before or after the input. A `form role="search"` supports that shape only for a direct text or search input. The shell owns border, background, focus, and validation; labels and helper text stay outside it. Other shapes, including selects, textareas, extra inputs, nested groups, fieldsets, vertical groups, and helper text, stay segmented. See the Groups reference for the complete contract and accessibility guidance.

**Sized Group:**

Adding `.small` or `.large` sizes supported direct controls and addon segments:

```html
<div role="group" class="large">
  <select><option>npm</option></select>
  <input placeholder="package">
  <button>Install</button>
</div>
```

**Vertical Group:**

```html
<div role="group" class="vertical">
  <button class="outline">First</button>
  <button class="outline">Second</button>
  <button class="outline">Third</button>
</div>
```

**Addon Group:**

A non-qualifying addon composition remains segmented. In a qualifying field shell, `svg`, `code`, `samp`, `kbd`, `span`, and `output` are allowed as direct noninteractive addons, and they sit inside the shell.

```html
<!-- CDN snippet picker -->
<div role="group">
  <select><option>CDN</option><option>npm</option></select>
  <code>npm install daftcss</code>
</div>

<!-- Country code + phone -->
<div role="group">
  <select><option>+1</option><option>+44</option></select>
  <input type="tel" placeholder="555-0100">
</div>
```

### Loading States

Use `aria-busy="true"` for loading indicators:

```html
<!-- aria-busy reports loading; disabled prevents another activation -->
<button disabled aria-busy="true">Saving...</button>

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

### Muted Text

```html
<p class="muted">Muted text</p>
```

**Button-looking Links:**

```html
<a href="#" class="button secondary">Secondary navigation CTA</a>
```

Variant classes alone do not change ordinary links.

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

<!-- Responsive — Daft's mobile breakpoint is 768px -->
<div class="hidden-mobile">Visible only on desktop</div>
<div class="hidden-desktop">Visible only on mobile</div>
```

### Layout Utilities

```html
<div class="flex">Flexbox</div>
<div class="flex flex-col">Flex column</div>
<div class="flex items-center">Vertically centered</div>
<div class="flex justify-center">Horizontally centered</div>
<div class="flex justify-between">Space between</div>

<!-- Gap scale mirrors --spacing-*: xs/sm/md/default/lg/xl -->
<div class="flex gap-1">Extra-small gap (0.25rem)</div>
<div class="flex gap-2">Small gap (0.5rem)</div>
<div class="flex gap-3">Medium gap (0.75rem)</div>
<div class="flex gap-4">Default gap (1rem)</div>
<div class="flex gap-6">Large gap (1.5rem)</div>
<div class="flex gap-8">Extra-large gap (2rem)</div>

<div class="w-full">Full width</div>

<!-- .grow marks the cell that absorbs a row's leftover space.
     Without it, a long child wraps the row instead of shrinking. -->
<div class="cluster">
  <span class="avatar small">MJ</span>
  <span class="truncate grow">Customer cannot export invoices to QuickBooks</span>
  <span class="badge">Open</span>
</div>

<!-- Max width scale (centered columns, narrow text blocks) -->
<div class="max-w-xs">20rem</div>
<div class="max-w-sm">24rem</div>
<div class="max-w-md">28rem</div>
<div class="max-w-lg">32rem</div>
<div class="max-w-xl">36rem</div>
<div class="max-w-2xl">42rem</div>
<div class="max-w-3xl">48rem</div>

<!-- Max height scale (scrollable regions — pair with .overflow-auto) -->
<pre class="max-h-xs overflow-auto">12rem</pre>
<pre class="max-h-sm overflow-auto">16rem</pre>
<pre class="max-h-md overflow-auto">20rem</pre>
<pre class="max-h-lg overflow-auto">24rem</pre>
<pre class="max-h-xl overflow-auto">32rem</pre>
<pre class="max-h-2xl overflow-auto">40rem</pre>
<pre class="max-h-3xl overflow-auto">48rem</pre>
```

**Composite layout primitives** — compose the flex atoms above into common patterns:

```html
<!-- Wrapping row with small gap, vertically centered. Use for toolbars, tag rows. -->
<div class="cluster">
  <button>Save</button>
  <button class="secondary">Cancel</button>
  <span class="muted">3 changes pending</span>
</div>

<!-- Vertical stack with default gap. Use for forms, card columns, list items. -->
<div class="stack">
  <input placeholder="Email">
  <input type="password" placeholder="Password">
  <button>Sign in</button>
</div>
```

### Spacing

```html
<div class="m-0">No margin</div>
<div class="mt-4">Margin top (1rem)</div>
<div class="mt-6">Margin top (1.5rem)</div>
<div class="mt-8">Margin top (2rem)</div>
<div class="mt-16">Margin top (4rem)</div>
<div class="mt-24">Margin top (6rem)</div>
<div class="mb-4">Margin bottom (1rem)</div>
<div class="mb-6">Margin bottom (1.5rem)</div>
<div class="mb-8">Margin bottom (2rem)</div>
<div class="my-4">Margin vertical</div>

<!-- Auto-margin helpers — push items inside flex/grid -->
<div class="flex flex-col">
  <header>Top</header>
  <footer class="mt-auto">Pushed to the bottom</footer>
</div>
<div class="flex">
  <span>Left</span>
  <span class="ml-auto">Pushed to the right</span>
</div>

<div class="p-0">No padding</div>
<div class="p-4">Default padding</div>
<div class="p-6">Large padding</div>
```

### Borders & Radius

```html
<div class="border">Border on all sides</div>
<div class="border-t">Top border only</div>
<div class="border-r">Right border only</div>
<div class="border-b">Bottom border only</div>
<div class="border-l">Left border only</div>
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

## Slides

Daft ships an optional slide layer for HTML-native presentation decks. Apply `class="deck"` to `<body>` and every direct-child `<section>` becomes a slide; layouts compose from the same `.grid` and `.span-N` primitives used everywhere else in Daft. PDF export goes through the browser's print dialog — no tooling required.

```html
<body class="deck">
  <section class="title"><h1>Quarterly review</h1></section>
  <section>
    <h2>Heading</h2>
    <div class="grid">
      <div>Left</div>
      <figure><img src="…"></figure>
    </div>
  </section>
</body>
```

See [SLIDES.md](SLIDES.md) for the full reference (role modifiers, weighted grids, tokens, PDF tips).

---

## Accessibility

Daft CSS is built with accessibility in mind:

- **Semantic HTML**: Uses proper elements for meaning
- **ARIA attributes**: `aria-busy`, `aria-invalid`, `aria-current`, `aria-pressed`, `role="switch"`, etc.
- **Focus indicators**: Clear `:focus-visible` styles
- **Color contrast**: The default palette targets WCAG 2.1 AA text contrast; verify contrast after overriding theme tokens
- **Screen reader support**: `.sr-only` class for hidden labels

---

## Semantic HTML Cheat Sheet

Daft styles these elements directly — no classes needed for basic usage:

| Feature | Syntax |
|---------|--------|
| Card | `<article>` |
| Plain document article | `<article class="plain">` |
| Button | `<button>`, button-type `<input>` |
| Popover dialog | `<dialog popover>` (non-modal) |
| Modal dialog | `<dialog>` opened with `showModal()` |
| Accordion | `<details>` |
| Dropdown | `<details class="dropdown">` |
| Switch | `<input type="checkbox" role="switch">` |
| Loading | `aria-busy="true"` |
| Validation | `aria-invalid="true|false"` |
| Selected toggle | `aria-pressed="true"` |
| Active nav | `aria-current="page"` |
| Tooltip | `data-tooltip="text"` |
| Grid | `.grid` |
| Container | `.container` |

---

## Build Commands

```bash
npm run build        # Build CSS to dist/ and docs/dist/
npm run watch        # Watch and rebuild expanded CSS on changes
npm run dev          # Local documentation server
npm run check        # Validate generated CSS, docs, and skill links
npm test             # Run cross-browser regressions and automated accessibility checks
npm run test:browser # Run regressions in Chromium, Firefox, and WebKit
npm run test:a11y    # Check all docs pages in light and dark themes
```
