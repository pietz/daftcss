# Theming Daft CSS

Load this when the user wants to retheme — match a brand, change feel ("sharper", "softer", "denser"), or build a custom palette. The goal is to get the look right by **overriding CSS variables**, never by rewriting selectors.

## Mental model

Daft tokens form three tiers:

- **Tier 0 — root knobs.** A handful of values that drive the whole system: `--spacing`, `--radius`, `--component-height`, `--font-size-base`, `--font-sans`, `--background`, `--foreground`, `--primary`, `--muted`, `--destructive`, `--success`, `--warning`, `--border`.
- **Tier 1 — scales.** Derived from Tier 0. `--spacing-sm`, `--radius-lg`, `--text-xl`, `--shadow-md`, etc. Rarely touched.
- **Tier 2 — component tokens.** Per-component overrides. `--button-radius`, `--card-shadow`, `--input-background`, `--aside-width`, etc.

**The rule of theming:** always start at the highest tier that works. Most rethemes are 3–6 lines at Tier 0. Drop to Tier 2 only when one component genuinely needs to differ from the rest.

All overrides go in `:root` (or scoped to `[data-theme="dark"]` for dark-mode tweaks, or an element for theme islands).

---

## Recipes

### Brand color

Override `--primary`. Foreground text on primary surfaces is auto-contrasted via `oklch(from …)`, so you get readable text for free.

```css
:root {
  --primary: oklch(0.55 0.22 264);  /* indigo-ish */
}
```

If your brand has a separate dark-mode color:
```css
:root { --primary: light-dark(oklch(0.55 0.22 264), oklch(0.7 0.18 264)); }
```

### Custom font

```css
:root {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

Don't touch the type scale (`--text-*`) — it derives from `--font-size-base`. To make the whole UI larger/smaller, change that instead:

```css
:root { --font-size-base: 1.0625rem; }  /* slightly larger */
```

### Density (denser vs roomier)

```css
/* Compact admin UI */
:root {
  --spacing: 0.75rem;
  --component-height: 2rem;
}

/* Marketing / consumer feel */
:root {
  --spacing: 1.25rem;
  --component-height: 2.5rem;
}
```

The whole spacing scale (`--spacing-xs/sm/md/lg/xl`) and component sizes (`--button-height`, `--input-height`) move together.

### Corner roundness

```css
:root { --radius: 0.375rem; }   /* sharper, more "enterprise" */
:root { --radius: 0.875rem; }   /* softer, friendlier */
:root { --radius: 0; }          /* fully square — bauhaus mode */
```

Per-component if you want pill buttons but normal cards:
```css
:root {
  --button-radius: var(--radius-full);
  --card-radius: var(--radius-lg);
}
```

### Flatten the look (no shadows)

```css
:root {
  --button-shadow: none;
  --card-shadow: none;
  --dropdown-shadow: none;
  --modal-shadow: none;
}
```

### Higher contrast

```css
:root {
  --background: light-dark(oklch(1 0 0), oklch(0.1 0 0));
  --foreground: light-dark(oklch(0.05 0 0), oklch(1 0 0));
  --border:     light-dark(oklch(0.85 0 0), oklch(1 0 0 / 20%));
}
```

### Custom dark mode

Either override per-variable inside the dark-mode block, or use `light-dark()` on each token. Block form is clearer for branded dark:

```css
[data-theme="dark"] {
  --background: oklch(0.12 0.02 270);   /* tinted dark blue */
  --foreground: oklch(0.95 0 0);
  --primary: oklch(0.75 0.18 280);
  --card: oklch(0.18 0.02 270);
}
```

### Status colors

```css
:root {
  --success: light-dark(oklch(0.55 0.16 145), oklch(0.72 0.16 145));
  --warning: light-dark(oklch(0.68 0.16 70), oklch(0.82 0.16 80));
  --destructive: light-dark(oklch(0.577 0.245 27), oklch(0.704 0.191 22));
}
```

Foregrounds for these auto-contrast — leave them alone.

### Sidebar width

```css
:root { --aside-width: 16rem; }                    /* fixed */
:root { --aside-width: clamp(12rem, 18vw, 18rem); } /* responsive */
```

### Focus ring

```css
:root {
  --ring: oklch(0.7 0.2 264);   /* match brand */
  --focus-ring-width: 2px;
}
```

---

## Anti-patterns

- ❌ **Selector overrides.** `.button { background: red; }` — fights the cascade. Override `--button-bg` (or `--primary` if every primary surface should change).
- ❌ **`!important`.** Means you're working against the framework. Find the right variable instead.
- ❌ **Inline `style=""` for theming.** Use a `<style>` block (or external sheet) with variable overrides.
- ❌ **Editing `dist/daft.css`.** Always override in your own stylesheet that loads *after* Daft.
- ❌ **Rebuilding the type scale.** Don't override `--text-xs` through `--text-4xl` individually — change `--font-size-base`.
- ❌ **Mixed units in the spacing scale.** Don't redefine `--spacing-sm` etc. unless you've genuinely outgrown the proportional system.
- ❌ **Touching Tier 2 first.** If five components share a problem, fix it at Tier 0.

---

## Worked example: "Stripe-like" retheme

Roughly 10 lines transforms the look:

```css
:root {
  /* Brand */
  --primary: oklch(0.5 0.22 264);            /* indigo */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

  /* Feel */
  --radius: 0.5rem;
  --spacing: 1.125rem;

  /* Flatter surfaces */
  --card-shadow: var(--shadow-sm);
  --button-shadow: none;

  /* Slightly cooler grays */
  --muted: light-dark(oklch(0.975 0.005 264), oklch(0.27 0.01 264));
  --border: light-dark(oklch(0.92 0.005 264), oklch(1 0 0 / 12%));
}
```

Everything cascades: buttons pick up the new radius and shadow, cards inherit the cool gray, inputs use the new font, the focus ring stays semantically correct.

---

## When in doubt

1. Try to do it with Tier 0 (root variables). 90% of rethemes finish here.
2. If a single component needs to differ from the rest, drop to its Tier 2 token.
3. If neither works, the framework probably has a gap — leave a note and open an issue.
