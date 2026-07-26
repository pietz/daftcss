---
name: daftcss
description: Build, edit, or evaluate UIs with Daft CSS, a semantic-first CSS framework for raw HTML. Use when the user mentions Daft CSS or daftcss, when a project imports daft.css or daft.min.css, or when Daft is being considered for a UI.
---

# Daft CSS

Daft gives raw semantic HTML polished application styling. Native elements are the primary API; optional classes express variants and layout that HTML cannot express.

## How to work with Daft

1. If starting from scratch, load [quick-start.md](references/quick-start.md).
2. For a full page or section, load the small [blocks router](references/blocks.md), then only its relevant block group.
3. Write semantic landmarks and controls before adding classes.
4. Load only the relevant component references from the catalog below.
5. Compose with `.container`, `.grid`, `.cluster`, and `.stack` before lower-level utilities.
6. Retune tokens instead of overriding component selectors. Load [theming.md](references/theming.md) for branded work.
7. Add application CSS only when the framework API cannot express a real product requirement.

## Core rules

- Use native elements and states: `<button>`, `<article>`, `<dialog>`, `<details>`, `disabled`, `aria-current`, and `aria-invalid`.
- A true modal requires `<dialog>.showModal()`. `<dialog popover>` is a non-modal, light-dismiss overlay.
- `aria-disabled` and `aria-busy` communicate state but do not disable keyboard activation. Use native `disabled` when a form control must be unavailable.
- Cards are `<article>` elements, not `.card` classes.
- Use CSS variables for design changes. Start with `--spacing`, `--radius`, `--component-height`, `--font-size-base`, and semantic colors.
- Keep essential content and controls visible. Prefer wrapping or native menus to clipping.

## Component catalog

Load the component file when using, modifying, or troubleshooting that component.

| Component | Load | Native/API shape |
|---|---|---|
| Buttons | [buttons.md](references/components/buttons.md) | `<button>`, button roles, variants and states |
| Forms | [forms.md](references/components/forms.md) | Inputs, selects, validation, checkbox, radio, switch, range |
| Cards | [cards.md](references/components/cards.md) | Semantic `<article>` surfaces |
| Dialogs | [dialogs.md](references/components/dialogs.md) | Modal dialogs and non-modal dialog popovers |
| Navigation | [navigation.md](references/components/navigation.md) | Navigation groups and breadcrumbs |
| Sidebar | [sidebar.md](references/components/sidebar.md) | Desktop rail and mobile Popover drawer |
| Accordion | [accordion.md](references/components/accordion.md) | Native `<details>` disclosure |
| Dropdown | [dropdown.md](references/components/dropdown.md) | `<details class="dropdown">` menu surface |
| Tree | [tree.md](references/components/tree.md) | Nested file or hierarchy navigation |
| Tooltip | [tooltips.md](references/components/tooltips.md) | Focusable `data-tooltip` visual enhancement |
| Tables | [tables.md](references/components/tables.md) | Semantic data tables and overflow |
| Badges | [badges.md](references/components/badges.md) | Compact status and metadata labels |
| Groups | [groups.md](references/components/groups.md) | Connected buttons, inputs, and addons |
| Avatar | [avatars.md](references/components/avatars.md) | Initials, image, or SVG identity |
| Alert and status | [alerts.md](references/components/alerts.md) | Assertive errors and polite notices |
| Progress and loading | [progress.md](references/components/progress.md) | Determinate progress and busy states |
| Embedded content | [embedded-content.md](references/components/embedded-content.md) | Images, figures, media, iframes, and SVG |

## Other references

- [quick-start.md](references/quick-start.md): installation, minimal document setup, and common semantic shapes.
- [content.md](references/content.md): typography, prose, lists, quotations, and code.
- [layout.md](references/layout.md): landmarks, containers, grid, flow primitives, responsiveness, and overflow.
- [foundations.md](references/foundations.md): cascade layers, token hierarchy, themes, focus, motion, and browser support.
- [utilities.md](references/utilities.md): the complete limited helper set and when to use it.
- [theming.md](references/theming.md): brand, density, radius, status colors, dark mode, and worked retheme recipes.
- [blocks.md](references/blocks.md): page sections, app shells, dashboards, forms, empty states, and content blocks.
- [slides.md](references/slides.md): HTML-native presentation decks and PDF export.
