# Content and Documentation Blocks

Load this reference for documentation headers, changelogs, comparison tables, and copyable code surfaces.

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
      <strong>Version x.y.z</strong>
      <span class="badge outline">Latest</span>
      <p>Release date</p>
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
<div class="overflow-auto" role="region" tabindex="0" aria-label="Scrollable feature comparison">
  <table>
    <thead>
      <tr><th>Capability</th><th>Daft</th><th>Custom CSS</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>Semantic forms</td>
        <td><span class="badge outline">Built in</span></td>
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
