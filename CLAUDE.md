# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Daft CSS is a semantic-first CSS framework with shadcn/ui-quality aesthetics. It styles raw HTML — no JavaScript, no required utility classes, no JSX components. Requires modern browsers (Chrome 123+, Firefox 129+, Safari 18+) for native support of `light-dark()`, OKLCH colors, CSS nesting, `color-mix()`, the Popover API, and `@starting-style`.

## Commands

```bash
npm run build    # Build daft.css/daft.min.css to dist/ and mirror to docs/dist/
npm run watch    # Watch src/ and rebuild on changes
npm run dev      # Serve docs/ folder locally (landing + examples)
```

## Architecture

### Build System

Uses `lightningcss-cli` directly (no custom build script). Entry point is `src/daft.css` which imports all partials using CSS `@import` with `@layer` for specificity management.

**Important:** Do NOT specify browser targets in the build command. Without targets, LightningCSS:
- Bundles and minifies only (no transforms)
- Preserves modern CSS like `light-dark()` as-is
- Keeps output small (~55KB vs larger transformed builds with polyfills)

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
3. **Update `docs/components.html`** with usage examples
4. **Update documentation** if applicable
5. **Run `npm run build`** to verify it compiles

## Release & Publishing Process

When the user asks to publish a new version, follow these steps in order. Never skip steps or batch them without acknowledgement — each is a separate trust boundary.

### 1. Version bump

Update the version in three places (they must match):
- `package.json` → `"version": "x.y.z"`
- `src/daft.css` → header comment `* Daft CSS vx.y.z`
- `docs/index.html` → footer + nav badge (`v1.x.y`)

SemVer guidance for this project:
- **Patch (1.6.x)** — bug fixes, additive helpers, no behavior change for existing markup
- **Minor (1.x.0)** — new component, new utility class, behavior changes that aren't user-visible breaks
- **Major (x.0.0)** — removed classes, renamed selectors, changed default behavior that could break existing pages

### 2. Build

```bash
npm run build
```

Verify `dist/daft.css` and `dist/daft.min.css` regenerated. Check the minified size hasn't ballooned unexpectedly.

### 3. Visual smoke test

Run a quick check on `docs/index.html` or `docs/components.html` via `agent-browser` to catch regressions, especially for layout/grid/component changes.

### 4. Update documentation

Whenever the framework gains or loses a class, the following files must reflect it:
- `README.md` — Components section + Utility table
- `DOCS.md` — Components or Utilities sections
- `skills/daftcss/SKILL.md` — Component idioms (one-liners)
- `skills/daftcss/REFERENCE.md` — Component examples + utility lists

### 5. Git commit + tag + push

```bash
git add -A
git commit -m "vx.y.z - <one-line summary>

- <bullet>
- <bullet>"
git tag -a vx.y.z -m "vx.y.z"
git push origin main
git push origin vx.y.z
```

Never commit/push without explicit user request. Never amend a published commit — make a new one.

### 6. Publish to npm

```bash
npm publish
```

Requires `npm whoami` to show the publish-authorized account.

### 7. Create the GitHub Release

```bash
gh release create vx.y.z --title "vx.y.z — <short title>" --notes "$(cat <<'EOF'
## Highlights

- <bullet>
- <bullet>

## Changes

- <bullet>
EOF
)"
```

This is **easy to forget** — the npm publish does not create a GitHub release. Verify with `gh release list` afterward.

### Common mistakes

- Forgetting to bump `src/daft.css` header or `docs/index.html` version after `package.json`
- Publishing to npm before pushing the git tag (release will reference a commit that's not on the remote)
- Skipping the GitHub release step — npm-only releases leave the GH page stale and users have no readable changelog
- Using `git commit --amend` after the commit was pushed — create a new commit instead

## Visual Testing with Agent Browser

Use the `agent-browser` skill to visually verify CSS changes. This is especially useful for checking color variants, theme switching, and responsive layouts.

### Basic Workflow

```bash
# Open an HTML file directly (no server needed)
agent-browser open "file:///Users/pietz/Private/daftcss/docs/components.html"

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
