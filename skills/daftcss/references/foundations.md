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

## Native hidden states

Ordinary `hidden` values, including `hidden` and `hidden=""`, remain non-rendered even when a Daft component declares `display`. Remove the attribute to show the element normally. Daft excludes `hidden="until-found"` from that reset so supporting browsers can reveal it through find-in-page or fragment navigation. Firefox 129 and Safari 18 do not support that behavior, and CSS cannot feature-query it; a display-bearing component may therefore render on those versions instead of receiving an ordinary-hidden fallback. Do not make `until-found` the only way to reach essential content.

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
| `--popover`, `--popover-foreground` | Floating surfaces (`--popover` defaults to `--card`; override independently) |
| `--primary`, `--primary-foreground` | Primary actions and emphasis |
| `--secondary`, `--secondary-foreground` | Secondary controls |
| `--muted`, `--muted-foreground` | Quiet surfaces and supporting text |
| `--accent`, `--accent-foreground` | Solid accent components plus hover and selected surfaces |
| `--destructive`, `--success`, `--warning` | Status meaning |
| `--border`, `--input`, `--ring` | Boundaries, form borders, focus |

Foreground pairs for primary, accent, and status colors derive automatically from their background color with relative OKLCH, choosing a neutral near-white or near-black around the L 0.623 threshold. A valid opaque custom root `--accent` therefore supplies readable text for solid accent components and accent hover surfaces in supported browsers. An explicit `--accent-foreground` declaration still overrides the derived default; use it for a brand-specific pair after checking contrast.

This minor release changes the default `--accent-foreground` from `var(--foreground)` to that auto-contrast derivation. Existing pages with a custom accent may therefore see text on accent-powered hover/selected surfaces switch to neutral black or white; redeclare `--accent-foreground: var(--foreground)` to preserve the previous behavior. Like Daft's other derived foreground tokens, a narrowly scoped background override should redeclare its foreground pair because an inherited derived value does not recompute against a descendant override. Translucent accent colors are also outside the auto-contrast guarantee: compositing depends on the surface underneath, and relative-color output can preserve source alpha. For a translucent `--accent`, provide an explicit opaque `--accent-foreground` and test the pair over every actual background.

## Accent support matrix

`.accent` has one cross-component meaning: **non-status brand emphasis using the accent token pair**. It is a semantic component variant, never a generic text/background utility.

| Surface | Support | Rationale |
|---|---|---|
| Buttons, button-type inputs, button roles, `.button` links | Yes | Actions and prominent navigation can need a second branded emphasis distinct from the bare primary action. |
| Dropdown summaries and button-styled disclosure summaries | Yes | These already share the complete button variant/state contract. |
| Badges | Yes | A concise category, featured label, or brand marker can carry non-status accent emphasis. |
| Progress | Yes | A task can be brand-emphasized without claiming success, warning, or failure. |
| Inputs, choices, switches, range, validation | No | Their colors communicate native value, focus, validation, or selected state; an accent class would blur that state model. |
| Alerts/status, loading indicators | No | Their role/state determines urgency or activity. Use the existing semantic role or state rather than brand emphasis. |
| Cards, dialogs, tooltips, tables, avatars | No | These are content, container, data, or identity surfaces without a color-variant contract. Accent here would become generic decoration. |
| Ordinary links/nav items, accordions, trees | No | Native/current/open interaction states own their presentation. Only an explicitly button-styled trigger receives the button API. |
| Layout primitives, content elements, utilities | No | They are not semantic component surfaces; `.accent` would be a generic color utility. |

For buttons and badges, `.accent` is mutually exclusive with other surface/color variants. Established variants win accidental combinations. Button selected/current state also wins because state is stronger than brand emphasis. Progress likewise uses one color class at a time; status meaning should never rely on color alone.

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
| Cards | `--card-radius`, `--card-shadow`, `--card-padding`, `--card-gap` |
| Dialogs | `--modal-max-width`, `--modal-radius`, `--modal-shadow`, `--modal-overlay` |
| Floating surfaces | `--dropdown-radius`, `--dropdown-shadow`, `--tooltip-radius` |
| Small controls | `--badge-radius`, `--progress-radius`, `--control-size` |
| Switches | `--switch-width`, `--switch-height`, `--switch-thumb` |
| Responsive top navigation | `--top-nav-height` |
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
