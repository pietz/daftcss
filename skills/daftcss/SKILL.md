---
name: daftcss
description: Write UIs with Daft CSS — a semantic-first CSS framework that styles raw HTML with no required classes and no JavaScript. Use this skill when the user mentions Daft CSS or daftcss, when editing HTML for a project that imports daft.css or daft.min.css, or when the user asks to build a UI with semantic HTML, no-JS components, or shadcn-style aesthetics without JSX.
---

# Daft CSS

A small CSS framework that ships shadcn/ui-quality aesthetics on raw HTML. No utility-class soup, no JSX, no JavaScript.

## Page-building workflow

1. **Choose the closest block first.** For full pages, start from [BLOCKS.md](BLOCKS.md) before inventing layout.
2. **Compose semantic HTML.** Use sections, headers, hgroups, articles, forms, tables, details, dialogs, nav, aside, and footer.
3. **Use Daft utilities.** Reach for `.container`, `.container-fluid`, `.grid`, `.span-*`, `.cluster`, `.stack`, `.text-center`, `.max-w-*`, `.mt-*`, `.mb-*`, `.badge`, `.muted`, and `role="group"`.
4. **Customize root tokens if needed.** Change `--spacing`, `--radius`, `--primary`, type scale, and semantic colors at `:root`.
5. **Write custom CSS only as a last resort.** If a Daft block or utility can do it, do not add bespoke CSS.

For landing pages, start from the landing hero, feature grid, CTA, FAQ, and pricing blocks in [BLOCKS.md](BLOCKS.md).

## Installing Daft CSS

Add to `<head>`:

```html
<link rel="stylesheet" href="https://unpkg.com/daftcss@1/dist/daft.min.css">
```

## Core principles — do not violate

1. **Use semantic HTML.** `<button>`, `<article>`, `<dialog>`, `<details>`, `<aside>`, `<nav>`, `<form>` are styled by default. Don't wrap them in divs.
2. **No inline styles, no custom CSS** unless absolutely required. If you reach for `style=""`, stop and look for a Daft utility class or pattern first.
3. **No JavaScript for components.** Modals use `<dialog popover>`. Accordions use `<details>`. Dropdowns use `<details class="dropdown">`. Tooltips use `data-tooltip`. Mobile menus use the Popover API.
4. **Customize via CSS variables**, not by overriding selectors. The token hierarchy is root → scales → component. Most apps only ever touch root knobs (`--spacing`, `--radius`, `--primary`).

## Component idioms

**Button variants** — classes on `<button>`:
- default = primary | `.secondary` | `.outline` | `.ghost` | `.destructive` | `.link`
- sizes: `.small` | `.large` | `.icon` | `.full-width`

**Card** = `<article>` with optional `<header>` and `<footer>`. No class. For title + subtitle, wrap them in `<hgroup>` inside `<header>`; sibling badges/actions float right.

**Modal** = Daft's no-JavaScript modal uses the native Popover API: `<dialog popover>` with `<article>` inside. Trigger via `<button popovertarget="dialog-id">`. Bare `<dialog>` + `showModal()` also renders as a card.

**Sidebar** = body-level `<aside class="sidebar">`. Put it before the top header/nav for a full-height rail, or after the top header/nav when the rail should sit below it. Add `popover` attribute + `<button class="ghost icon sidebar-toggle" popovertarget="sidebar">` for a mobile drawer.

**Accordion** = `<details>` + `<summary>`. No class.

**Dropdown** = `<details class="dropdown">` containing `<summary>` and `<ul>`. The `<summary>` uses button styling and accepts button variants like `.secondary`, `.outline`, `.ghost`, `.destructive`, `.small`, `.large`.

**Tree** = `<ul class="tree">` with nested `<ul>`s. Folders are `<li><details><summary>name</summary><ul>…</ul></details></li>`. Files are `<li><a href="…">name</a></li>`. Mark the current file with `aria-current="page"`. Override `--tree-indent` for tighter/looser indentation.

**Tooltip** = `data-tooltip="text"` attribute on any element. Optional `data-placement="top|bottom|left|right"`.

**Switch** = `<input type="checkbox" role="switch">`. Just the role.

**Badge** = `<span class="badge">`. Variants: `.secondary`, `.success`, `.warning`, `.destructive`, `.outline`.

**Avatar** = `<span class="avatar">KS</span>` for initials, or wrap an `<img>` / `<svg>`. Sizes: `.small`, `.large`.

**Group** = `<div role="group">` joins adjacent controls into one pill (buttons, inputs, or mixed). Add a `<code>`/`<samp>`/`<kbd>`/`<span>`/`<output>` child to render it as a muted addon; a leading `<select>` also gets the muted addon background. Last child fills. A group containing `<input type="search">` automatically takes the fully-rounded pill aesthetic — identical to `role="search"`. Add `.small` or `.large` to the group and the size cascades to every child (button, input, select).

**Cluster** = `<div class="cluster">` — wrapping row, center-aligned, small gap. Use for button toolbars, tag rows, header trailing items.

**Stack** = `<div class="stack">` — column with default gap. Use for vertical groups of fields, cards, list items.

**Alert** = `<div role="alert">` (assertive, destructive tint) or `<div role="status">` (polite, neutral tint). Inner `<strong>` is the title, `<p>` is the body. No class variants.

**Grid** = `<div class="grid">` — direct children become equal columns (3 children → 3 cols). A child with `.span-N` (N = 2, 3, 4) claims more tracks (spans are weights, adding to the total). Stacks to 1 col below 768px. For multi-row layouts use multiple grids.

**Container** = `<main class="container">` (max-width) or `.container-fluid` (full-width with edge padding).

**Slides** = `<body class="deck">`, then each direct-child `<section>` is a slide. Roles: `.title`, `.quote`, `.full`, `.code`. Column layouts use the same Daft `.grid` + `.span-N` primitive; there is no slide-specific column layout. For "heading + columns", keep the heading outside the grid (slide section is already a flex column). Speaker notes go in `<aside class="notes">` (hidden by default). Export to PDF with the browser's print dialog. See [SLIDES.md](../../SLIDES.md) for the full reference.

**Form** = `<label>Field <input></label>`. Wrapping inputs in labels handles spacing automatically. Add `aria-invalid="true"` for error state. `<input>` and `<select>` accept `.small` / `.large` size modifiers (same as `<button>`).

## Status semantics

For muted supporting text, use `.muted`. For status meaning, prefer semantic badges, alerts, or progress variants (`.success`, `.warning`, `.destructive`) instead of coloring plain text.

## Theming

Dark mode follows system preference automatically. Override with `<html data-theme="dark">` or per-element `data-theme="light|dark"` for theme islands.

Retune the design with a small set of root CSS variables — examples:
```css
:root {
  --spacing: 1.25rem;        /* spacious everything */
  --radius: 0.375rem;        /* tighter corners */
  --primary: oklch(0.5 0.22 295);  /* purple primary */
}
```

## Common mistakes to avoid

- ❌ `<div class="card">…</div>` → use `<article>`
- ❌ `<button class="btn btn-primary">…</button>` (Bootstrap-style) → just `<button>`
- ❌ `.hero-card`, `.feature-card`, `.terminal-window`, `.custom-button` → use Daft blocks and primitives
- ❌ `<button style="background: blue">` → override a CSS variable
- ❌ Tailwind classes (`.bg-blue-500`, `.p-4`, etc.) → not supported
- ❌ Recreating Tailwind/Bootstrap patterns → Daft is semantic HTML plus small utilities
- ❌ JavaScript modal/dropdown libraries → use `<dialog popover>` / `<details>`
- ❌ Adding a class to every element → Daft expects bare semantic HTML
- ❌ Hand-rolled grids → use `<div class="grid">` and `.span-*`
- ❌ Inline styles → use utilities or root tokens
- ❌ Decorative screenshots/terminal mockups by default → add them only when the product specifically needs them
- ❌ Custom CSS for layout that could use `<div class="grid">`, `.cluster`, `.stack`, or container utilities

## When you need more detail

- [BLOCKS.md](BLOCKS.md) — page-section recipes for landing pages, app shells, dashboards, forms, docs sections, and content blocks.
- [REFERENCE.md](REFERENCE.md) — full component catalog, complete CSS variable system, utility-class list, cascade layer order.
- [THEMING.md](THEMING.md) — load this when the user wants to retheme Daft: match a brand, change feel ("sharper", "softer", "denser"), build a custom palette, or set up a branded dark mode. Tier-0 / Tier-2 recipes and anti-patterns.
