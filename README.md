# Daft CSS

A semantic-first CSS framework with [shadcn/ui](https://ui.shadcn.com)-quality aesthetics. Style raw HTML — no JavaScript, no required utility classes, no JSX components.

## Who is this for?

Daft CSS is for developers who want:

- **Beautiful defaults** without writing CSS or utility classes
- **Semantic HTML** that just works (`<button>` looks good, no classes needed)
- **Zero required JavaScript** for native interactions like popovers, accordions, and dropdowns
- **A tiny footprint** — one ~68 KB minified file

The idea is a tiny dependency that makes your app look polished out of the box, with a hierarchical variable system you can tweak from one root knob to per-component overrides.

Daft follows Pico's semantic syntax: native elements, ARIA states, roles, and small data attributes are the component API. The difference is visual: Daft gives that Pico-like authoring model a shadcn/ui-inspired aesthetic.

## Principles

- **Semantic HTML first.** Native elements (`<button>`, `<article>`, `<dialog>`, `<details>`) ship styled. You shouldn't need a class to get a polished result.
- **A few well-chosen classes, not a utility framework.** A small set of variant classes (`.secondary`, `.outline`, `.ghost`) and layout helpers (`.container`, `.grid`) for the cases native HTML can't express. This is not Tailwind — it's the minimum vocabulary on top of HTML.
- **shadcn/ui aesthetics, simpler internals.** We borrow shadcn's visual language because it's clean and tunable, but we don't borrow its variable graph. Daft's tokens form a tier system (root → scale → component) where most values derive from a handful of knobs at the top.
- **Connected by default, overridable when you need it.** Tweak `--spacing` and every component breathes differently. Tweak `--card-radius` to round just cards. The chain is the feature; you only break it when the value genuinely needs to differ.
- **No required JavaScript.** Dropdowns, accordions, tooltips, and non-modal overlays use CSS and native HTML APIs. True modal dialogs use the platform's `showModal()` method.
- **Modern CSS only.** `light-dark()`, OKLCH, nesting, `color-mix()`, Popover, `@starting-style`. No polyfills, no fallbacks. The result is smaller, cleaner, and easier to read than the cross-browser layers older frameworks carry.

## How is it different?

### vs Pico CSS

Both style semantic HTML, but Daft targets app UIs over content sites and ships a more modern aesthetic.

|  | Daft CSS | [Pico CSS](https://picocss.com) |
|--|----------|----------|
| Size (minified) | **~68 KB** | 83 KB |
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
| Total size | **~68 KB** | 823 KB (618 KB CSS + 205 KB JS) |
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

## Blocks

Blocks are copy-pasteable page sections composed from Daft primitives: landing heroes, feature grids, FAQ accordions, pricing cards, app shells, dashboards, settings forms, and docs sections.

Use blocks before writing custom layout CSS. They are the middle layer between individual components and full examples.

See the visual reference at [`docs/blocks/`](docs/blocks/) and the agent reference at [`skills/daftcss/references/blocks.md`](skills/daftcss/references/blocks.md).

## Components

### Buttons

```html
<button>Primary</button>
<button class="secondary">Secondary</button>
<button class="outline">Outline</button>
<button class="ghost">Ghost</button>
<button class="destructive">Destructive</button>
<button disabled aria-busy="true">Loading</button>
<a class="button" href="/checkout">Checkout</a>
<a class="button secondary" href="#schedule">Explore the program</a>
```

Use `.button` only for prominent navigational links that need button appearance. It preserves native anchor semantics; do not add `role="button"` for styling. Variant and size classes work when combined with `.button`. Links have no native disabled state, so Daft does not define a disabled `.button` anchor.

Daft provides an icon pattern, not an icon library. Put `.icon` on an icon-only square control, give the control an accessible name, and place an official inline SVG directly inside it. For icon plus text, use an ordinary control without `.icon`; the same direct-child SVG sizing and flex gap apply.

```html
<button class="icon ghost" type="button" aria-label="Search">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">
    <path d="m21 21-4.34-4.34"/>
    <circle cx="11" cy="11" r="8"/>
  </svg>
</button>
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

Use exact official Lucide path data retrieved from [lucide.dev](https://lucide.dev) or an official Lucide package. Do not approximate paths or substitute emoji or Unicode glyphs. Daft has no Lucide dependency; framework users may render official Lucide components as the direct SVG child.

### Forms

```html
<form>
  <label>Email <input type="email"></label>
  <label>Password <input type="password"></label>
  <label><input type="checkbox" role="switch"> Remember me</label>
  <button type="submit">Sign In</button>
</form>
```

`<input>` and `<select>` accept the same `.small` / `.large` modifiers as `<button>`:

```html
<input class="small" placeholder="Compact">
<input class="large" placeholder="Roomy">
<select class="large"><option>One</option></select>
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

When a card needs a compact title and subtitle, use `<hgroup>` with direct real heading and supporting paragraph children. It is optional when a heading alone is enough. The heading keeps its semantic level; cards render the pair at 18px and 14px. A sibling element (badge, action) floats right automatically.

Use `<article class="plain">` for a semantic article that should follow normal document flow without Daft's card background, border, radius, shadow, padding, or compact card header/footer layout. Ordinary `<article>` elements remain automatic cards.

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

### Badges

```html
<span class="badge">Featured</span>
<span class="badge secondary">Pending</span>
<span class="badge outline">Active</span>
<span class="badge ghost">Metadata</span>
<span class="badge destructive">Failed</span>
```

Badges use the same static surface recipes as buttons, but are presentational and noninteractive. They have one canonical 20px pill size: choose at most one variant, keep the text meaningful without color, and use a real button or link for actions. For v1 compatibility, deprecated `.success` maps to `.outline`, `.warning` maps to `.secondary`, and old badge size classes render at the canonical size.

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

### Dialogs

For a no-JavaScript, light-dismiss overlay, combine `<dialog>` with the Popover API. This pattern is non-modal: it does not make the rest of the page inert or contain focus.

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

For a true modal interaction, use a regular `<dialog>` and open it with `showModal()`. Dialogs default to a 24rem maximum width and use `--card-padding`. Override `--modal-max-width` on an application selector when a particular dialog needs more room; viewport constraints remain in effect. The dialog is the surface: use an optional direct `<header>`, direct flow content or a direct `<form>`, and a direct `<footer>` or one inside that form. Forms have no dialog-specific container styling.

Migration: `<dialog><article>…</article></dialog>` remains supported in v1; remove the `<article>` tags.

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

Ordinary navigation wraps safely on narrow screens:

```html
<nav>
  <ul><li><strong>Brand</strong></li></ul>
  <ul>
    <li><a href="#">About</a></li>
    <li><a href="#" aria-current="page">Docs</a></li>
    <li><button>Sign Up</button></li>
  </ul>
</nav>
```

For a sticky top bar, opt into one responsive Popover-backed link list. The list stays horizontal on desktop and opens as a panel below 768px, with native light dismiss and Escape and no JavaScript:

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

This is specifically a single-row sticky top-navigation pattern, not arbitrary trigger anchoring. If you customize the bar height, set `--top-nav-height` to its actual height. If a mobile popover is open during a resize to desktop, it is restyled into the desktop position but remains natively open in the top layer until dismissed.

For a location trail, use a named navigation landmark with a plain-text final item:

```html
<nav aria-label="breadcrumb">
  <ul>
    <li><a href="#">Home</a></li>
    <li><a href="#">Services</a></li>
    <li>Current</li>
  </ul>
</nav>
```

### Sidebar

Place `aside.sidebar` as a direct child of `body`. Its canonical structure is an optional direct `header`, a required direct `nav`, and an optional direct `footer`. Header and footer have full-width separators and remain visible; only the nav scrolls. A nav-only sidebar is also supported. Add `popover` and a `.sidebar-toggle` button for a mobile slide-out drawer. No JavaScript is required beyond native popover behavior.

```html
<body>
  <aside id="sidebar" class="sidebar" popover aria-label="Workspace navigation">
    <header><strong>Acme</strong></header>
    <nav>
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
    <section><!-- page content --></section>
  </main>
</body>
```

By default, the sidebar is a persistent desktop rail and a native Popover drawer on mobile; its `.sidebar-toggle` is shown only on mobile. Add `.drawer` (`class="sidebar drawer"`) to make it a native hidden drawer at every width: the same `.sidebar-toggle` is shown at every width, the page layout does not shift, and no JavaScript is needed. A visible-by-default, stateful desktop collapse is not provided because it requires application state and JavaScript. Override `--aside-width` to change the width.

### Avatar

A round container for initials, an image, or an SVG icon.

```html
<span class="avatar">KS</span>
<span class="avatar small">KS</span>
<span class="avatar large">KS</span>

<span class="avatar"><img src="/avatars/kai.jpg" alt=""></span>
```

### Groups

`role="group"` normally joins direct controls as segmented buttons or fields. A simple horizontal group with one eligible text-like input, only `svg`/`code`/`samp`/`kbd`/`span`/`output` addons, and at most one button-like action becomes a full-width unified field shell; `form role="search"` supports the same shape for a direct text or search input. Keep labels and helper text outside that shell. For toggle buttons or segmented controls, mark the selected button with `aria-pressed="true"`; reserve `aria-current` for a genuinely current navigation or item state.

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

Add `.small` or `.large` to size supported direct controls and addon segments:

```html
<div role="group" class="large">
  <select><option>npm</option></select>
  <input placeholder="package">
  <button>Install</button>
</div>
```

### Tooltips

Apply tooltips to focusable controls so keyboard users can reveal them. Tooltip text is a visual enhancement, not a substitute for an accessible name.

```html
<button data-tooltip="Save changes">Save</button>
<button aria-label="Help" data-tooltip="Help" data-placement="right">?</button>
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
| Text size | `.text-xs` `.text-sm` `.text-base` `.text-lg` `.text-xl` `.text-2xl` `.text-3xl` `.text-4xl` `.text-5xl` `.text-6xl` |
| Font weight | `.font-normal` `.font-medium` `.font-semibold` `.font-bold` |
| Text align | `.text-left` `.text-center` `.text-right` |
| Truncate | `.truncate` |
| Visibility | `.hidden` `.invisible` `.sr-only` `.no-print` `.hidden-mobile` `.hidden-desktop` |
| Display | `.flex` `.flex-col` |
| Layout primitives | `.cluster` `.stack` |
| Flex align | `.items-center` `.justify-center` `.justify-between` `.justify-end` |
| Flex slack | `.grow` |
| Gap | `.gap-1` `.gap-2` `.gap-3` `.gap-4` `.gap-6` `.gap-8` |
| Width | `.w-full` |
| Max width | `.max-w-xs` `.max-w-sm` `.max-w-md` `.max-w-lg` `.max-w-xl` `.max-w-2xl` `.max-w-3xl` |
| Max height | `.max-h-xs` `.max-h-sm` `.max-h-md` `.max-h-lg` `.max-h-xl` `.max-h-2xl` `.max-h-3xl` |
| Margin | `.m-0` `.mx-auto` `.mt-4` `.mt-6` `.mt-8` `.mt-16` `.mt-24` `.mb-4` `.mb-6` `.mb-8` `.my-4` `.mt-auto` `.mb-auto` `.ml-auto` `.mr-auto` |
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
npm run build        # Build daft.css and daft.min.css
npm run watch        # Watch and rebuild expanded CSS on changes
npm run dev          # Serve documentation locally
npm run check        # Validate generated CSS, docs, and skill links
npm test             # Run cross-browser regressions and automated accessibility checks
npm run test:browser # Run regressions in Chromium, Firefox, and WebKit
npm run test:a11y    # Check all docs pages in light and dark themes
```

## License

MIT
