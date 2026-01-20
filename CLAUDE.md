# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Daft CSS is a semantic-first CSS framework that combines Pico CSS compatibility with shadcn/ui aesthetics. Requires modern browsers (Chrome 123+, Firefox 120+, Safari 18+) for native support of `light-dark()`, OKLCH colors, CSS nesting, and `color-mix()`.

## Commands

```bash
npm run build    # Build both daft.css and daft.min.css to dist/
npm run watch    # Watch src/ and rebuild on changes
npm run dev      # Serve demo folder locally
```

## Architecture

### Build System

Uses `lightningcss-cli` directly (no custom build script). Entry point is `src/daft.css` which imports all partials using CSS `@import` with `@layer` for specificity management.

**Important:** Do NOT specify browser targets in the build command. Without targets, LightningCSS:
- Bundles and minifies only (no transforms)
- Preserves modern CSS like `light-dark()` as-is
- Keeps output small (~49KB vs ~55KB with polyfills)

If you add targets for older browsers, LightningCSS will inject `--lightningcss-light/dark` polyfill variables and expand every `light-dark()` call into verbose fallback patterns.

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

Hierarchical system in `src/base/variables.css`:

1. **Core variables** - Control the entire design system:
   - `--spacing`, `--radius`, `--font-size-base`, `--font-scale`
   - `--line-height`, `--transition`, `--component-height`

2. **Derived variables** - Calculated from core:
   - `--spacing-xs`, `--spacing-sm`, `--spacing-lg`, `--spacing-xl`
   - `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`
   - `--text-xs` through `--text-4xl` (scale-based)
   - `--line-height-sm`, `--line-height-lg`

3. **Semantic tokens** - Colors and contextual values:
   - `--background`, `--foreground`, `--primary`, `--muted`, `--border`

Theme switching uses `light-dark()` function with `color-scheme` property. Override via `data-theme="light|dark"` attribute.

### Key Patterns

- Semantic HTML styling without classes (buttons, inputs, tables work out of the box)
- Optional classes for variants: `.secondary`, `.outline`, `.ghost`, `.destructive`
- Role-based switches: `<input type="checkbox" role="switch">`
- Data attributes for features: `data-tooltip`, `data-placement`, `data-theme`

## Adding New Components or Features

When adding a new component or feature to the library:

1. **Create the CSS** in the appropriate `src/` directory
2. **Import it** in `src/daft.css` with the correct layer
3. **Update `examples/components.html`** with usage examples
4. **Update documentation** if applicable
5. **Run `npm run build`** to verify it compiles

## Visual Testing with Agent Browser

Use the `agent-browser` skill to visually verify CSS changes. This is especially useful for checking color variants, theme switching, and responsive layouts.

### Basic Workflow

```bash
# Open an HTML file directly (no server needed)
agent-browser open "file:///Users/pietz/Private/daft-v3/examples/components.html"

# Take screenshots to verify visual output
agent-browser screenshot --full /tmp/screenshot.png

# Get interactive elements for interaction
agent-browser snapshot -i

# Interact with elements (use refs from snapshot)
agent-browser click @e1          # Click element
agent-browser fill @e2 "text"    # Fill input

# Check computed styles
agent-browser eval "getComputedStyle(document.querySelector('.my-class')).backgroundColor"

# Close when done
agent-browser close
```

### Tips

- Use `file://` URLs to test HTML files without a server
- Take `--full` screenshots for full page captures
- Use `eval` to check computed CSS values for debugging
- Create temporary test HTML files in `examples/` for specific features, then delete them after verification
