# Daft Blocks

Blocks are reusable page sections made from Daft primitives. When building UI with Daft, choose the closest block before inventing a custom layout.

Workflow:
1. Pick the closest block.
2. Compose semantic HTML.
3. Use Daft utilities.
4. Customize root tokens if needed.
5. Write custom CSS only as a last resort.

Core rules:
- Use `<section>`, `<header>`, `<hgroup>`, `<article>`, `<form>`, `<details>`, `<ul class="tree">`, `table`, and `role="group"`.
- Use `.container`, `.container-fluid`, `.grid`, `.span-*`, `.cluster`, `.stack`, `.text-center`, `.max-w-*`, `.mt-*`, `.mb-*`, `.badge`, `.muted`.
- Do not invent `.hero-card`, `.feature-card`, `.terminal-window`, `.custom-button`, `.btn`, `.row`, `.col`, or Tailwind-like classes.
- Do not hand-roll grids when `.grid` works.
- Do not use inline styles.
- Do not add decorative screenshots, fake terminal windows, or generic app mockups unless the product specifically needs them.

For landing pages, start from: Centered Landing Hero, Feature Grid, Final CTA, FAQ, and Pricing Cards.

## Centered Landing Hero

Use for product homepages and signup pages.

Rules:
- Use `section.text-center.mt-24`.
- Use `h1.text-6xl.mx-auto.max-w-2xl`.
- Use `p.muted.mx-auto.max-w-xl` for subtitle.
- Use `.cluster.justify-center` for badges and actions.
- Do not write custom hero CSS unless explicitly requested.

Skeleton:
```html
<section class="text-center mt-24">
  <div class="cluster justify-center mb-4">
    <span class="badge outline">Open files</span>
    <span class="badge outline">No build</span>
    <span class="badge outline">No JS</span>
  </div>
  <h1 class="text-6xl mx-auto max-w-2xl">Your headline here.</h1>
  <p class="muted mx-auto max-w-xl">One paragraph explaining the product in concrete terms.</p>
  <div class="cluster justify-center mt-8">
    <a href="#" role="button">Start free</a>
    <a href="#" role="button" class="outline">View docs</a>
  </div>
</section>
```

Mistakes:
- Do not wrap the hero in `.hero-card`.
- Do not add background blobs, fake screenshots, or terminal mockups by default.
- Do not use `.btn-primary`; use a real `<button>` or `[role="button"]`.

## Reservation Hero

Use when the main action is claiming a name, joining a waitlist, or submitting an email.

Rules:
- Keep the form in `role="group"`.
- Use a label or `aria-label` for the input.
- Keep the group constrained with `.max-w-xl.mx-auto`.

Skeleton:
```html
<section class="text-center mt-16">
  <span class="badge">Private beta</span>
  <h1 class="text-5xl mx-auto max-w-2xl">Reserve your workspace name.</h1>
  <p class="muted mx-auto max-w-xl">Claim a public handle before launch.</p>
  <div role="group" class="mx-auto max-w-xl mt-8">
    <span>daft.dev/</span>
    <input type="text" placeholder="workspace" aria-label="Workspace name">
    <button>Reserve</button>
  </div>
</section>
```

Mistakes:
- Do not use inline width styles on the input.
- Do not build a custom input/button wrapper when `role="group"` exists.

## Feature Grid

Use for marketing features, benefits, capabilities, and product pillars.

Rules:
- Use a centered section header.
- Use `.grid` with one `<article>` per feature.
- Keep feature titles short and concrete.

Skeleton:
```html
<header class="text-center mx-auto max-w-xl mb-8">
  <p class="label">Features</p>
  <h2>Everything is just HTML.</h2>
  <p class="muted">Use article cards in a grid.</p>
</header>
<div class="grid">
  <article>
    <span class="badge outline">01</span>
    <h3>Semantic defaults</h3>
    <p>Buttons, forms, tables, cards, and dialogs render without wrappers.</p>
  </article>
  <article>...</article>
  <article>...</article>
</div>
```

Mistakes:
- Do not create `.feature-card`.
- Do not use custom CSS grid declarations.

## How-It-Works Steps

Use for onboarding, setup, process, and workflow sections.

Rules:
- Use `.grid`.
- Use badges for step numbers.
- Prefer 3 to 4 steps.

Skeleton:
```html
<header class="mx-auto max-w-xl text-center mb-8">
  <p class="label">Workflow</p>
  <h2>Three steps from blank page to UI.</h2>
</header>
<div class="grid">
  <article>
    <span class="badge">1</span>
    <h3>Link the CSS</h3>
    <p>Add one stylesheet to the document head.</p>
  </article>
  <article>...</article>
  <article>...</article>
</div>
```

Mistakes:
- Do not draw custom timelines unless the user asked for a timeline.
- Do not use div-only step cards.

## FAQ Accordion

Use for common questions, objections, and support content.

Rules:
- Use native `<details>` and `<summary>`.
- Keep it in `.max-w-2xl.mx-auto` for readable line length.
- Open only the first item by default, if any.

Skeleton:
```html
<section class="max-w-2xl mx-auto">
  <header class="text-center mb-8">
    <p class="label">FAQ</p>
    <h2>Questions before you start?</h2>
  </header>
  <details open>
    <summary>Does this require JavaScript?</summary>
    <p>No. Daft components use native HTML whenever possible.</p>
  </details>
  <details>
    <summary>Can I change the visual style?</summary>
    <p>Yes. Change root CSS variables.</p>
  </details>
</section>
```

Mistakes:
- Do not implement an accordion with JavaScript.
- Do not invent `.accordion-item`.

## Final CTA

Use near the end of landing pages and docs pages.

Rules:
- Keep it short.
- Use an `<article>` when the CTA should have a card surface.
- Use `.cluster.justify-center` for actions.

Skeleton:
```html
<section class="text-center">
  <article>
    <h2>Ready to build without a component stack?</h2>
    <p class="muted mx-auto max-w-xl">Start with semantic HTML.</p>
    <footer class="cluster justify-center">
      <a href="#" role="button">Get started</a>
      <a href="#" role="button" class="outline">Read docs</a>
    </footer>
  </article>
</section>
```

Mistakes:
- Do not add decorative background CSS.
- Do not use vague copy like "supercharge your workflow" without specifics.

## Pricing Cards

Use for simple SaaS pricing and plan comparison.

Rules:
- Use `.grid` with `<article>` cards.
- Use badges for plan labels like "Popular".
- Use a table instead if detailed comparison matters more than plan cards.

Skeleton:
```html
<header class="text-center mx-auto max-w-xl mb-8">
  <p class="label">Pricing</p>
  <h2>Start small, upgrade when needed.</h2>
</header>
<div class="grid">
  <article>
    <header>
      <strong>Starter</strong>
      <p>For prototypes and small sites.</p>
    </header>
    <p class="text-4xl"><strong>$0</strong> <small class="muted">/mo</small></p>
    <ul>
      <li>One project</li>
      <li>Community support</li>
    </ul>
    <footer><a href="#" role="button" class="outline">Start</a></footer>
  </article>
  <article>...</article>
</div>
```

Mistakes:
- Do not create `.pricing-card`.
- Do not use nested cards.

## Sticky Top Nav App Shell

Use for simple apps, admin pages, and tools without deep navigation.

Rules:
- Use `<nav class="sticky glass">`.
- Put primary links in a `<ul>`.
- Put page content in `<main class="container">` or `.container-fluid`.

Skeleton:
```html
<nav class="sticky glass">
  <ul><li><strong>Workspace</strong></li></ul>
  <ul>
    <li><a href="#" aria-current="page">Projects</a></li>
    <li><a href="#">Team</a></li>
    <li><button class="ghost icon" aria-label="Settings">⚙</button></li>
  </ul>
</nav>
<main class="container">
  <hgroup>
    <h1>Projects</h1>
    <p>Manage active workspaces.</p>
  </hgroup>
</main>
```

Mistakes:
- Do not build custom nav flex CSS.
- Do not use buttons for navigation links.

## Sidebar App Shell

Use for dense apps with persistent navigation.

Rules:
- Use body-level `<aside class="sidebar">`.
- Add `popover` and a `.sidebar-toggle` button for mobile.
- Put the sidebar before or after the top header depending on desired desktop placement.

Skeleton:
```html
<aside id="sidebar" class="sidebar" popover>
  <nav>
    <ul>
      <li class="label">Workspace</li>
      <li><a href="#" aria-current="page">Overview</a></li>
      <li><a href="#">Files</a></li>
      <li><a href="#">Settings</a></li>
    </ul>
  </nav>
</aside>
<header class="container-fluid">
  <nav>
    <ul>
      <li><button class="ghost icon sidebar-toggle" popovertarget="sidebar" aria-label="Open menu">☰</button></li>
      <li><strong>Workspace</strong></li>
    </ul>
  </nav>
</header>
<main class="container-fluid">...</main>
```

Mistakes:
- Do not put `.sidebar` inside `<main>`.
- Do not create a custom drawer with JavaScript.

## Workspace Browser

Use for file explorers, project browsers, and split workspaces.

Rules:
- Use `.grid`.
- Use `<ul class="tree">` for hierarchy.
- Use `.span-2` or `.span-3` for the main pane.

Skeleton:
```html
<div class="grid">
  <article>
    <header>
      <strong>Files</strong>
      <button class="ghost small">New</button>
    </header>
    <ul class="tree">
      <li>
        <details open>
          <summary>docs</summary>
          <ul><li><a href="#" aria-current="page">index.html</a></li></ul>
        </details>
      </li>
    </ul>
  </article>
  <article class="span-2">...</article>
</div>
```

Mistakes:
- Do not hand-roll tree indentation.
- Do not use nested cards for every file.

## Dashboard Stat Cards

Use for small metric summaries.

Rules:
- Use `.grid`.
- Use one `<article>` per metric.
- Use `.badge.success`, `.badge.warning`, or `.badge.outline` for status.

Skeleton:
```html
<div class="grid">
  <article>
    <small class="muted">Revenue</small>
    <p class="text-4xl m-0"><strong>$42.8k</strong></p>
    <span class="badge success">+12%</span>
  </article>
  <article>...</article>
  <article>...</article>
</div>
```

Mistakes:
- Do not color plain text manually.
- Do not add chart decorations unless real data needs them.

## Settings Form

Use for profile, workspace, billing, and preference pages.

Rules:
- Use `<form class="stack max-w-xl">`.
- Wrap controls in `<label>`.
- Use `role="group"` for combined controls.
- Use `role="switch"` for binary toggles.

Skeleton:
```html
<form class="stack max-w-xl">
  <hgroup>
    <h2>Workspace settings</h2>
    <p>Use labels, fieldsets, and grouped controls.</p>
  </hgroup>
  <label>Workspace name <input type="text" value="Acme Studio"></label>
  <label>Public URL
    <div role="group">
      <span>daft.dev/</span>
      <input type="text" value="acme">
    </div>
  </label>
  <label><input type="checkbox" role="switch" checked> Allow public sharing</label>
  <footer class="cluster justify-end">
    <button class="outline" type="button">Cancel</button>
    <button type="submit">Save</button>
  </footer>
</form>
```

Mistakes:
- Do not use placeholder text as the only label.
- Do not use divs instead of labels.

## Empty State

Use when a list, project, or workspace has no content yet.

Rules:
- Use `.text-center.max-w-md.mx-auto`.
- Include one primary action.
- Optionally include one secondary action.

Skeleton:
```html
<section class="text-center max-w-md mx-auto">
  <span class="badge outline">No files</span>
  <h2>Create your first page.</h2>
  <p class="muted">Start with a block, then replace the copy.</p>
  <div class="cluster justify-center">
    <button>Create page</button>
    <button class="outline">Import HTML</button>
  </div>
</section>
```

Mistakes:
- Do not add illustration placeholders by default.
- Do not include more than two actions.

## Status Panel

Use for persistent system messages, warnings, and workflow state.

Rules:
- Use `role="status"` for neutral/polite information.
- Use `role="alert"` for destructive or urgent information.
- Put title in `<strong>` and body in `<p>`.

Skeleton:
```html
<div class="stack">
  <div role="status">
    <strong>Deployment queued</strong>
    <p>The production build will start after the current preview finishes.</p>
  </div>
  <div role="alert">
    <strong>Payment failed</strong>
    <p>Update your billing method before the next renewal.</p>
  </div>
</div>
```

Mistakes:
- Do not create `.alert-success` or `.toast-card`.
- Do not use color alone for state.

## Documentation Section Header

Use at the top of docs pages and major reference sections.

Rules:
- Use `<header class="mb-8">`.
- Use `.label` for category text.
- Use badges for metadata.

Skeleton:
```html
<header class="mb-8">
  <p class="label">Guides</p>
  <h1>Installation</h1>
  <p class="muted max-w-2xl">Use this pattern at the top of docs pages.</p>
  <div class="cluster">
    <span class="badge outline">5 min</span>
    <span class="badge outline">No build tools</span>
  </div>
</header>
```

Mistakes:
- Do not make every docs header a marketing hero.
- Do not center long technical content by default.

## Changelog List

Use for releases, updates, and timelines.

Rules:
- Use `.stack`.
- Use one `<article>` per release.
- Put version/date/status in `<header>`.

Skeleton:
```html
<div class="stack">
  <article>
    <header>
      <strong>Version 1.13.2</strong>
      <span class="badge success">Latest</span>
      <p>May 2026</p>
    </header>
    <ul>
      <li>Added tree views and sidebar improvements.</li>
      <li>Expanded utility coverage for layouts.</li>
    </ul>
  </article>
  <article>...</article>
</div>
```

Mistakes:
- Do not draw a custom timeline unless chronology is central.
- Do not put release metadata in unstructured divs.

## Comparison Table

Use for feature comparison and decision support.

Rules:
- Use a real `<table>`.
- Wrap wide tables in `.overflow-auto`.
- Use badges for strong statuses.

Skeleton:
```html
<div class="overflow-auto">
  <table>
    <thead>
      <tr><th>Capability</th><th>Daft</th><th>Custom CSS</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>Semantic forms</td>
        <td><span class="badge success">Built in</span></td>
        <td>Manual selectors</td>
      </tr>
    </tbody>
  </table>
</div>
```

Mistakes:
- Do not fake tables with grid cards.
- Do not hide important comparison data in prose.

## Code Snippet Card

Use for install commands, API examples, and copyable setup snippets.

Rules:
- Use `<article>`.
- Put language or status in a badge.
- Use `<pre><code>`.

Skeleton:
```html
<article>
  <header>
    <strong>Install from CDN</strong>
    <span class="badge outline">HTML</span>
  </header>
  <pre><code>&lt;link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/daftcss@1/dist/daft.min.css"&gt;</code></pre>
  <footer>
    <small class="muted">Paste this into the document head.</small>
  </footer>
</article>
```

Mistakes:
- Do not create `.terminal-window`.
- Do not add fake window controls unless the product specifically needs a terminal aesthetic.
