# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Daft CSS is a semantic-first CSS framework that combines Pico CSS compatibility with shadcn/ui aesthetics. It targets modern browsers only (Chrome/Firefox/Edge 100+, Safari 15+) and uses modern CSS features like OKLCH colors, CSS nesting, `light-dark()`, and `color-mix()`.

## Commands

```bash
npm run build    # Build both daft.css and daft.min.css to dist/
npm run watch    # Watch src/ and rebuild on changes
npm run dev      # Serve demo folder locally
```

## Architecture

### Build System

`build.js` uses LightningCSS to bundle and minify. It processes `src/daft.css` which imports all partials using CSS `@import` with `@layer` for specificity management.

### CSS Layer Order

Layers are defined in `src/daft.css` and control cascade priority:
```
tokens → reset → base → layout → content → forms → components → utilities
```

### Source Structure

- `src/base/` - Variables (design tokens), reset, root theme selection, document defaults
- `src/content/` - Typography, code blocks, embedded content (images, video)
- `src/layout/` - Container, grid, landmarks (header/main/footer), overflow
- `src/forms/` - Input, checkbox/radio/switch, range slider, validation states
- `src/components/` - Button, card, table, accordion, dropdown, modal, nav, progress, tooltip, group
- `src/utilities/` - Helper classes

### Design Token System

Three-tier system in `src/base/variables.css`:
1. **Primitives** - Raw values: `--spacing-4`, `--radius-md`, `--text-base`
2. **Semantic tokens** - Contextual: `--background`, `--foreground`, `--primary`, `--muted`, `--border`
3. **Pico aliases** - Compatibility layer (when needed)

Theme switching uses `light-dark()` function with `color-scheme` property. Override via `data-theme="light|dark"` attribute.

### Key Patterns

- Semantic HTML styling without classes (buttons, inputs, tables work out of the box)
- Optional classes for variants: `.secondary`, `.outline`, `.ghost`, `.destructive`
- Role-based switches: `<input type="checkbox" role="switch">`
- Data attributes for features: `data-tooltip`, `data-placement`, `data-theme`
