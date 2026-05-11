---
name: daftcss
description: Write UIs with Daft CSS — a semantic-first CSS framework that styles raw HTML with no required classes and no JavaScript. Use this skill when the user mentions Daft CSS or daftcss, when editing HTML for a project that imports daft.css or daft.min.css, or when the user asks to build a UI with semantic HTML, no-JS components, or shadcn-style aesthetics without JSX.
---

# Daft CSS

A small CSS framework that ships shadcn/ui-quality aesthetics on raw HTML. No utility-class soup, no JSX, no JavaScript.

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

**Card** = `<article>` with optional `<header>` and `<footer>`. No class.

**Modal** = `<dialog popover>` with `<article>` inside. Trigger via `<button popovertarget="dialog-id">`.

**Sidebar** = `<aside class="sidebar">` as direct child of `<main>`. Add `popover` attribute + `<button class="ghost icon sidebar-toggle" popovertarget="sidebar">` for a mobile drawer.

**Accordion** = `<details>` + `<summary>`. No class.

**Dropdown** = `<details class="dropdown">` containing `<summary>` and `<ul>`.

**Tooltip** = `data-tooltip="text"` attribute on any element. Optional `data-placement="top|bottom|left|right"`.

**Switch** = `<input type="checkbox" role="switch">`. Just the role.

**Badge** = `<span class="badge">`. Variants: `.secondary`, `.success`, `.warning`, `.destructive`, `.outline`.

**Alert** = `<div role="alert">` (assertive, destructive tint) or `<div role="status">` (polite, neutral tint). Inner `<strong>` is the title, `<p>` is the body. No class variants.

**Grid** = `<div class="grid">` auto-sizes columns from child count (2–6). For explicit control add `.cols-N`; for responsive add `.cols-md-N` / `.cols-lg-N` / `.cols-xl-N`. Children can use `.span-N` and `.span-md-N` / `.span-lg-N` / `.span-xl-N` (plus `.span-full`).

**Container** = `<main class="container">` (max-width) or `.container-fluid` (full-width with edge padding).

**Form** = `<label>Field <input></label>`. Wrapping inputs in labels handles spacing automatically. Add `aria-invalid="true"` for error state.

## Status semantics

For status-meaning on text, badges, or progress: use `.success` | `.warning` | `.destructive` | `.muted`. These map to the matching CSS color tokens and work in both light and dark mode automatically.

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
- ❌ `<button style="background: blue">` → override a CSS variable
- ❌ Tailwind classes (`.bg-blue-500`, `.p-4`, etc.) → not supported
- ❌ JavaScript modal/dropdown libraries → use `<dialog popover>` / `<details>`
- ❌ Adding a class to every element → Daft expects bare semantic HTML
- ❌ Custom CSS for layout that could use `<div class="grid">` or container utilities

## When you need more detail

- [REFERENCE.md](REFERENCE.md) — full component catalog, complete CSS variable system, utility-class list, cascade layer order.
- [THEMING.md](THEMING.md) — load this when the user wants to retheme Daft: match a brand, change feel ("sharper", "softer", "denser"), build a custom palette, or set up a branded dark mode. Tier-0 / Tier-2 recipes and anti-patterns.
