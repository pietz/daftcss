# Foundations

Load this reference when changing the design system, reasoning about cascade behavior, or checking browser requirements.

## Mental model

Daft styles semantic HTML first. Optional classes express variants or layout that HTML cannot express. Prefer this order:

1. Use the native element or ARIA state.
2. Add a documented Daft variant or layout primitive.
3. Override design tokens at the narrowest useful scope.
4. Write selector-level custom CSS only when the public API cannot express the requirement.

## Cascade layers

Later layers win:

```text
tokens → reset → base → layout → content → forms → components → slides → utilities
```

Utilities intentionally override component defaults. Application CSS loaded after Daft remains the final authority.

## Token API boundary

This file is the canonical taxonomy for Daft's token API; `src/base/variables.css` is the implementation source of truth.

- **Root and semantic tokens** are the preferred public controls for changing the system as a whole.
- **Derived scale tokens** are public escape hatches, but overriding them disconnects that step from its root scale.
- **Component tokens** are the preferred controls when one component family must diverge.
- Component references list the tokens that materially affect that component. Those lists are routing aids, not separate token definitions.
- Component-local scratch variables are implementation details unless a reference explicitly documents them as an override point.

## Root tokens

These few variables drive most of the system:

| Variable | Default | Controls |
|---|---|---|
| `--spacing` | `1rem` | Spacing scale and component density |
| `--radius` | `0.625rem` | Radius scale |
| `--component-height` | `2rem` | Default button and input height |
| `--font-size-base` | `1rem` | Body size and type scale |
| `--line-height` | `1.5` | Body line height |
| `--transition` | `150ms` | Motion duration scale |
| `--font-sans` | system stack | Interface text |
| `--font-mono` | system mono stack | Code and samples |

## Semantic colors

All default colors use `light-dark()` and follow the active `color-scheme`.

| Token | Purpose |
|---|---|
| `--background`, `--foreground` | Page surface and text |
| `--card`, `--card-foreground` | Article/card surfaces |
| `--popover`, `--popover-foreground` | Floating surfaces |
| `--primary`, `--primary-foreground` | Primary actions and emphasis |
| `--secondary`, `--secondary-foreground` | Secondary controls |
| `--muted`, `--muted-foreground` | Quiet surfaces and supporting text |
| `--accent`, `--accent-foreground` | Hover and selected surfaces |
| `--destructive`, `--success`, `--warning` | Status meaning |
| `--border`, `--input`, `--ring` | Boundaries, form borders, focus |

Foreground pairs for primary and status colors derive automatically from their background color. Override the pair only when the computed contrast is unsuitable for a custom palette.

## Derived scales

- Spacing: `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing`, `--spacing-lg`, `--spacing-xl`
- Radius: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full`
- Text: `--text-xs` through `--text-6xl`
- Weight: `--font-normal`, `--font-medium`, `--font-semibold`, `--font-bold`, `--font-extrabold`
- Motion: `--transition-fast`, `--transition-default`, `--transition-slow`
- Shadows: `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- Heights: `--component-height-sm`, `--component-height`, `--component-height-lg`

Change the root token instead of redefining every derived step.

## Component tokens

Use these when one component should diverge without disconnecting the rest of the system:

| Family | Tokens |
|---|---|
| Buttons | `--button-radius`, `--button-shadow`, `--button-height`, `--button-height-sm`, `--button-height-lg` |
| Inputs | `--input-radius`, `--input-height`, `--input-height-sm`, `--input-height-lg` |
| Cards/dialogs | `--card-radius`, `--card-shadow`, `--modal-max-width`, `--modal-radius`, `--modal-shadow`, `--modal-overlay` |
| Floating surfaces | `--dropdown-radius`, `--dropdown-shadow`, `--tooltip-radius` |
| Small controls | `--badge-radius`, `--progress-radius`, `--control-size` |
| Switches | `--switch-width`, `--switch-height`, `--switch-thumb` |
| Sidebar | `--aside-width` |

Consult the relevant entry in the [component catalog](../SKILL.md#component-catalog) before overriding a component token.

## Focus and motion

- `--ring`, `--focus-ring-width`, and `--focus-ring-opacity` control focus indicators.
- Interactive elements use `:focus-visible` rather than suppressing keyboard focus.
- Under `prefers-reduced-motion: reduce`, Daft forces animation and transition durations to `0.01ms`, limits animations to one iteration, and disables smooth scrolling.

Do not remove focus indication. If the default ring clashes with a custom palette, retune the ring tokens.

## Themes and theme islands

Daft follows system preference by default:

```html
<html data-theme="dark">
<article data-theme="light">Always light</article>
```

`data-theme="light|dark"` changes `color-scheme` for that subtree, so tokens using `light-dark()` resolve locally. For recipes and palette guidance, load [theming.md](theming.md).

## Browser support

Daft intentionally requires modern CSS and platform APIs:

- Chrome 123+
- Firefox 129+
- Safari 18+

The bundle preserves `light-dark()`, OKLCH, CSS nesting, `color-mix()`, the Popover API, and `@starting-style`. Do not add Lightning CSS browser targets or compatibility transforms; they expand the bundle and change the framework's support contract.
