---
name: daftcss
description: Build, edit, or evaluate UIs and HTML presentation decks with Daft CSS, a semantic-first CSS framework for raw HTML. Use when the user mentions Daft CSS or daftcss, when a project imports daft.css or daft.min.css, or when Daft is being considered for a UI or deck.
---

# Daft CSS

Daft gives raw semantic HTML polished application styling. Native elements are the primary API; optional classes express variants and layout that HTML cannot express.

## How to work with Daft

1. For `<body class="deck">`, presentation, or PDF-deck work, load [slides.md](references/slides.md) first.
2. If starting an ordinary page from scratch, load [quick-start.md](references/quick-start.md).
3. When the request calls for a conventional application, marketing, or documentation section, load the small [blocks router](references/blocks.md), then only its relevant block group.
4. Write semantic landmarks and controls before adding classes.
5. Load only the relevant component references from the catalog below.
6. Compose with `.container`, `.grid`, `.cluster`, and `.stack` before lower-level utilities.
7. Retune tokens before overriding component selectors. Load [theming.md](references/theming.md) for branded work.
8. Add scoped project CSS when the framework API cannot express the intended product or visual design.

## Core rules

- Use native elements and states before optional classes.
- Use documented Daft components and layout primitives before inventing framework APIs.
- Use CSS variables for system-wide design changes. Start with `--spacing`, `--radius`, `--component-height`, `--font-size-base`, and semantic colors.
- Keep project-specific composition in CSS loaded after Daft.

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
