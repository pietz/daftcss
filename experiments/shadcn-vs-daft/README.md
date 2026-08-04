# shadcn/ui vs Daft CSS

A same-origin visual comparison of one assembled **Release Operations** dashboard. Two equal-size, CSS-isolated panes can independently display frozen Daft CSS 1.20.1, the current Daft parity branch, or shadcn/ui. Shared theme controls and a swap action make before/after/reference comparisons quick while each pane keeps independent interactions.

This is intentionally a composition test rather than a component catalog. It exposes how each system's sidebar width, breakpoints, card internals, form primitives, tables, menus, dialogs, and density rules interact in a realistic application shell. Equivalent outcomes are aligned, but framework-specific composition is preserved.

A second, additive comparison is available at **`/components.html`**. It is a long-form component catalog rather than an app shell: two independently selected same-origin panes compare frozen Daft v1.20.1, current Daft, or the pinned shadcn reference. Its frames automatically report their content height to the host, so the host document provides the single long-page scroll surface.

## Run

```bash
npm install
npm run dev
```

Open `/` for Release Operations or `/components.html` for the component catalog.

```bash
npm run build
npm run preview
```

- `npm run stage:daft` copies `../../dist/daft.css` byte-for-byte to `public/vendor/daft.css` and verifies the bytes.
- `public/vendor/daft-old.css` is a frozen byte-for-byte snapshot of `dist/daft.css` from branch point v1.20.1, SHA-256 prefix `6dbecc21405b`.
- `npm run build` first runs the repository root build, then stages that fresh artifact and builds the host plus all three isolated scenario entries into this experiment's `dist/`.

## shadcn snapshot

- CLI package: **`shadcn@4.16.0`**, pinned exactly in `package.json` and `package-lock.json`
- Preset/style: **Radix Nova** (`style: "radix-nova"`, Radix base)
- Template: Vite, React 19, Tailwind CSS 4, CSS variables, neutral base color, Lucide icons
- Installed lockfile resolutions: `react@19.2.8`, `tailwindcss@4.3.3`, `radix-ui@1.6.7`, `lucide-react@1.28.0`
- Generated components: button, input, input-group, card, badge, avatar, tabs, table, dropdown-menu, dialog, textarea, label, progress, sidebar, sheet, tooltip, breadcrumb, separator, and skeleton
- Generated source lives in `src/shadcn/components/ui/` and is intentionally unedited.

Initialization used CLI 4.16.0 with `--template vite --base radix --preset nova`; components were then generated through the same pinned CLI after setting the UI alias to `@/shadcn/components/ui` in `components.json`.

## Why iframes

Tailwind's reset/utilities and Daft's semantic element selectors are both global by design. Independent documents prevent any of the three versions from changing another baseline. The same-origin frames still allow the host to propagate light/dark theme commands with `postMessage`. Radix portals and native Daft dialogs/popovers are consequently contained in their own document.

## Deliberately not normalized

The experiment aligns scenario content, data, order, viewport, and outcomes, but does not normalize framework typography, radii, color tokens, responsive breakpoints, sidebar behavior, dialogs, or menus. The updated Daft pane deliberately exercises the semantic sidebar-footer APIs; shadcn continues to use its untouched official equivalents. Daft's deployment filters and environment selector still demonstrate the separate joined `[role="group"]` API.
