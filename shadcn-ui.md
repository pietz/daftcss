# shadcn/ui CSS Design System Reference

A comprehensive guide to recreating the shadcn/ui aesthetic in pure CSS. This document covers the foundational 20% of design decisions that make up 80% of the visual identity.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Border Radius](#border-radius)
5. [Spacing](#spacing)
6. [Borders](#borders)
7. [Shadows](#shadows)
8. [Focus States](#focus-states)
9. [Interactive States](#interactive-states)
10. [Component Patterns](#component-patterns)
11. [Dark Mode](#dark-mode)
12. [Complete CSS Variables Reference](#complete-css-variables-reference)

---

## Design Philosophy

shadcn/ui follows these core principles:

- **Minimalist & Clean**: Generous whitespace, subtle borders, restrained color usage
- **Neutral Base**: Gray-scale foundation with accent colors used sparingly
- **Soft Corners**: Rounded but not pill-shaped elements
- **Subtle Depth**: Minimal shadows, relying more on borders for definition
- **High Contrast Text**: Clear foreground/background relationships
- **Semantic Naming**: Variables named by purpose, not appearance

---

## Color System

### Color Format: OKLCH

shadcn/ui uses the OKLCH color space for better perceptual uniformity. The format is:

```css
oklch(lightness chroma hue)
/* lightness: 0-1 (0 = black, 1 = white) */
/* chroma: 0-0.4 (0 = gray, higher = more saturated) */
/* hue: 0-360 (color wheel angle) */
```

### Semantic Color Variables

The system uses a `background`/`foreground` naming convention:

```css
:root {
  /* Base colors */
  --background: oklch(1 0 0);              /* Pure white */
  --foreground: oklch(0.145 0 0);          /* Near black */
  
  /* Primary action color */
  --primary: oklch(0.205 0 0);             /* Dark gray/black */
  --primary-foreground: oklch(0.985 0 0);  /* Near white */
  
  /* Secondary/muted elements */
  --secondary: oklch(0.97 0 0);            /* Very light gray */
  --secondary-foreground: oklch(0.205 0 0);
  
  /* Muted text and backgrounds */
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);    /* Medium gray */
  
  /* Accent/hover states */
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  
  /* Destructive/error states */
  --destructive: oklch(0.577 0.245 27.325); /* Red */
  
  /* Structural colors */
  --border: oklch(0.922 0 0);              /* Light gray border */
  --input: oklch(0.922 0 0);               /* Input border */
  --ring: oklch(0.708 0 0);                /* Focus ring */
  
  /* Card and popover surfaces */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
}
```

### HSL Fallback (Legacy)

For broader browser support, you can use HSL format:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 47.4% 11.2%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 100% 50%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 215 20.2% 65.1%;
}
```

### Base Color Palettes

shadcn/ui offers several neutral base palettes:

| Palette | Character | Hue Range |
|---------|-----------|-----------|
| **Neutral** | Pure gray, no undertone | 0 |
| **Stone** | Warm, slight brown undertone | 46-58 |
| **Zinc** | Cool, slight blue undertone | 285-286 |
| **Gray** | Balanced cool gray | 261-265 |
| **Slate** | Blue-tinted gray | 247-266 |

---

## Typography

### Font Stack

shadcn/ui uses system fonts by default, with Inter as the recommended custom font:

```css
:root {
  --font-sans: ui-sans-serif, system-ui, sans-serif, 
               "Apple Color Emoji", "Segoe UI Emoji", 
               "Segoe UI Symbol", "Noto Color Emoji";
  
  /* With Inter */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  
  /* Monospace for code */
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, 
               Consolas, "Liberation Mono", monospace;
}

body {
  font-family: var(--font-sans);
}
```

### Font Sizes

Based on Tailwind CSS defaults:

| Name | Size | Line Height | Use Case |
|------|------|-------------|----------|
| `text-xs` | 0.75rem (12px) | 1rem | Captions, badges |
| `text-sm` | 0.875rem (14px) | 1.25rem | Body text, labels |
| `text-base` | 1rem (16px) | 1.5rem | Default body |
| `text-lg` | 1.125rem (18px) | 1.75rem | Large body |
| `text-xl` | 1.25rem (20px) | 1.75rem | Subheadings |
| `text-2xl` | 1.5rem (24px) | 2rem | Section headings |
| `text-3xl` | 1.875rem (30px) | 2.25rem | Page headings |
| `text-4xl` | 2.25rem (36px) | 2.5rem | Large headings |

### Typography Styles

```css
/* Heading 1 */
.heading-1 {
  font-size: 2.25rem;      /* text-4xl */
  font-weight: 800;        /* font-extrabold */
  letter-spacing: -0.025em; /* tracking-tight */
  line-height: 1;
  scroll-margin-top: 5rem;  /* scroll-m-20 */
}

/* Heading 2 */
.heading-2 {
  font-size: 1.875rem;     /* text-3xl */
  font-weight: 600;        /* font-semibold */
  letter-spacing: -0.025em;
  line-height: 1.2;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
  scroll-margin-top: 5rem;
}

/* Heading 3 */
.heading-3 {
  font-size: 1.5rem;       /* text-2xl */
  font-weight: 600;
  letter-spacing: -0.025em;
  scroll-margin-top: 5rem;
}

/* Heading 4 */
.heading-4 {
  font-size: 1.25rem;      /* text-xl */
  font-weight: 600;
  letter-spacing: -0.025em;
  scroll-margin-top: 5rem;
}

/* Paragraph */
.paragraph {
  line-height: 1.75;       /* leading-7 */
}

.paragraph:not(:first-child) {
  margin-top: 1.5rem;
}

/* Lead text */
.lead {
  font-size: 1.25rem;
  color: var(--muted-foreground);
}

/* Large text */
.large {
  font-size: 1.125rem;
  font-weight: 600;
}

/* Small text */
.small {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;
}

/* Muted text */
.muted {
  font-size: 0.875rem;
  color: var(--muted-foreground);
}

/* Inline code */
.inline-code {
  position: relative;
  border-radius: 0.25rem;
  background-color: var(--muted);
  padding: 0.2rem 0.3rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 600;
}
```

### Font Weights

| Weight | CSS Value | Use Case |
|--------|-----------|----------|
| Medium | 500 | Labels, small text |
| Semibold | 600 | Headings, emphasis |
| Bold | 700 | Strong emphasis |
| Extrabold | 800 | H1, hero text |

---

## Border Radius

### Base Radius Variable

```css
:root {
  --radius: 0.625rem; /* 10px - default in latest version */
  /* Previously: 0.5rem (8px) */
}
```

### Radius Scale

Components use calculated values based on the base radius:

```css
:root {
  --radius-sm: calc(var(--radius) - 4px);  /* 6px */
  --radius-md: calc(var(--radius) - 2px);  /* 8px */
  --radius-lg: var(--radius);               /* 10px */
  --radius-xl: calc(var(--radius) + 4px);  /* 14px */
}
```

### Usage by Component

| Component | Radius | CSS |
|-----------|--------|-----|
| Buttons | `rounded-md` | 6-8px |
| Inputs | `rounded-md` | 6-8px |
| Cards | `rounded-xl` | 12-14px |
| Badges | `rounded-md` | 6-8px |
| Dialogs | `rounded-lg` | 10px |
| Avatars | `rounded-full` | 50% |
| Tabs (container) | `rounded-lg` | 10px |

### CSS Implementation

```css
.radius-sm { border-radius: calc(var(--radius) - 4px); }
.radius-md { border-radius: calc(var(--radius) - 2px); }
.radius-lg { border-radius: var(--radius); }
.radius-xl { border-radius: calc(var(--radius) + 4px); }
.radius-full { border-radius: 9999px; }
```

---

## Spacing

### Spacing Scale

shadcn/ui uses Tailwind's spacing scale (1 unit = 0.25rem = 4px):

| Class | Value | Pixels |
|-------|-------|--------|
| `p-1` | 0.25rem | 4px |
| `p-2` | 0.5rem | 8px |
| `p-3` | 0.75rem | 12px |
| `p-4` | 1rem | 16px |
| `p-5` | 1.25rem | 20px |
| `p-6` | 1.5rem | 24px |
| `p-8` | 2rem | 32px |

### Component-Specific Spacing

```css
/* Buttons */
.button-default {
  height: 2.5rem;          /* h-10 (40px) */
  padding: 0.5rem 1rem;    /* py-2 px-4 */
}

.button-sm {
  height: 2.25rem;         /* h-9 (36px) */
  padding: 0.5rem 0.75rem; /* px-3 */
}

.button-lg {
  height: 2.75rem;         /* h-11 (44px) */
  padding: 0.5rem 2rem;    /* px-8 */
}

/* Inputs */
.input {
  height: 2.5rem;          /* h-10 */
  padding: 0.5rem 0.75rem; /* py-2 px-3 */
}

/* Cards */
.card {
  padding: 1.5rem;         /* p-6 */
}

.card-header {
  padding: 1.5rem 1.5rem 0;
}

.card-content {
  padding: 1.5rem;
  padding-top: 0;
}

.card-footer {
  padding: 1.5rem;
  padding-top: 0;
}

/* Gap patterns */
.gap-small { gap: 0.5rem; }   /* gap-2 */
.gap-medium { gap: 1rem; }    /* gap-4 */
.gap-large { gap: 1.5rem; }   /* gap-6 */
```

---

## Borders

### Border Width

```css
/* Default: 1px borders everywhere */
.border { border-width: 1px; }
```

### Border Color

```css
.border-default {
  border-color: var(--border); /* Light gray: oklch(0.922 0 0) */
}

.border-input {
  border-color: var(--input);  /* Same as border */
}

.border-destructive {
  border-color: var(--destructive);
}
```

### Border Styles by Component

```css
/* Input borders */
.input {
  border: 1px solid var(--input);
  background-color: var(--background);
}

/* Card borders */
.card {
  border: 1px solid var(--border);
  background-color: var(--card);
}

/* Separator */
.separator {
  height: 1px;
  width: 100%;
  background-color: var(--border);
}

/* Table borders */
.table-row {
  border-bottom: 1px solid var(--border);
}

/* Heading with border */
.heading-with-border {
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}
```

---

## Shadows

### Shadow Scale

shadcn/ui uses minimal shadows, preferring borders for definition:

```css
:root {
  /* Extra small shadow */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  
  /* Small shadow */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  
  /* Default shadow */
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 
            0 1px 2px -1px rgb(0 0 0 / 0.1);
  
  /* Medium shadow */
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 
               0 2px 4px -2px rgb(0 0 0 / 0.1);
  
  /* Large shadow */
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 
               0 4px 6px -4px rgb(0 0 0 / 0.1);
  
  /* Extra large shadow */
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 
               0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

### Shadow Usage

| Component | Shadow | Notes |
|-----------|--------|-------|
| Default Button | `shadow-xs` | Very subtle |
| Outline Button | None | Border only |
| Card (default style) | None | Border only |
| Card (new-york style) | `shadow-sm` | Subtle lift |
| Dropdown/Popover | `shadow-md` | Floating feel |
| Dialog | `shadow-lg` | Modal elevation |

```css
/* Button with shadow */
.button-default {
  box-shadow: var(--shadow-xs);
}

/* Popover/dropdown */
.popover {
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
}

/* Dialog overlay */
.dialog {
  box-shadow: var(--shadow-lg);
}
```

---

## Focus States

### Focus Ring System

shadcn/ui uses a consistent focus ring pattern:

```css
/* Modern focus ring (Tailwind v4 / latest shadcn) */
.focus-ring {
  outline: none;
}

.focus-ring:focus-visible {
  border-color: var(--ring);
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent);
  /* Or: ring-[3px] ring-ring/50 */
}

/* Legacy focus ring */
.focus-ring-legacy:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--background),
              0 0 0 4px var(--ring);
  /* ring-2 ring-ring ring-offset-2 ring-offset-background */
}
```

### Focus Ring Variables

```css
:root {
  --ring: oklch(0.708 0 0);           /* Medium gray */
  --ring-offset: var(--background);   /* White offset */
}

.dark {
  --ring: oklch(0.556 0 0);           /* Darker for dark mode */
}
```

### Component Focus Examples

```css
/* Input focus */
.input:focus-visible {
  outline: none;
  border-color: var(--ring);
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent);
}

/* Button focus */
.button:focus-visible {
  outline: none;
  border-color: var(--ring);
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent);
}

/* Destructive element focus */
.destructive:focus-visible {
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--destructive) 20%, transparent);
}
```

---

## Interactive States

### Hover States

```css
/* Primary button hover */
.button-primary:hover {
  background-color: color-mix(in oklch, var(--primary) 90%, transparent);
  /* Or: bg-primary/90 */
}

/* Secondary button hover */
.button-secondary:hover {
  background-color: color-mix(in oklch, var(--secondary) 80%, transparent);
}

/* Ghost/accent hover */
.button-ghost:hover {
  background-color: var(--accent);
  color: var(--accent-foreground);
}

/* Link hover */
.link:hover {
  text-decoration: underline;
}

/* List item hover */
.list-item:hover {
  background-color: var(--accent);
}
```

### Disabled States

```css
.disabled,
[disabled] {
  pointer-events: none;
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Transition Patterns

```css
/* Standard transition */
.transition-default {
  transition-property: color, background-color, border-color, 
                       text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* All properties transition */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
```

---

## Component Patterns

### Button

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
  border-radius: calc(var(--radius) - 2px);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 150ms ease;
  outline: none;
  
  /* Disabled state */
  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }
  
  /* SVG icons */
  & svg {
    pointer-events: none;
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
  }
}

/* Variants */
.button-default {
  background-color: var(--primary);
  color: var(--primary-foreground);
  box-shadow: var(--shadow-xs);
  
  &:hover {
    background-color: color-mix(in oklch, var(--primary) 90%, transparent);
  }
}

.button-destructive {
  background-color: var(--destructive);
  color: white;
  box-shadow: var(--shadow-xs);
  
  &:hover {
    background-color: color-mix(in oklch, var(--destructive) 90%, transparent);
  }
}

.button-outline {
  border: 1px solid var(--input);
  background-color: var(--background);
  box-shadow: var(--shadow-xs);
  
  &:hover {
    background-color: var(--accent);
    color: var(--accent-foreground);
  }
}

.button-secondary {
  background-color: var(--secondary);
  color: var(--secondary-foreground);
  
  &:hover {
    background-color: color-mix(in oklch, var(--secondary) 80%, transparent);
  }
}

.button-ghost {
  &:hover {
    background-color: var(--accent);
    color: var(--accent-foreground);
  }
}

.button-link {
  color: var(--primary);
  text-underline-offset: 4px;
  
  &:hover {
    text-decoration: underline;
  }
}

/* Sizes */
.button-sm {
  height: 2.25rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.button-default-size {
  height: 2.5rem;
  padding: 0.5rem 1rem;
}

.button-lg {
  height: 2.75rem;
  padding-left: 2rem;
  padding-right: 2rem;
}

.button-icon {
  height: 2.5rem;
  width: 2.5rem;
  padding: 0;
}
```

### Input

```css
.input {
  display: flex;
  height: 2.5rem;
  width: 100%;
  border-radius: calc(var(--radius) - 2px);
  border: 1px solid var(--input);
  background-color: var(--background);
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  transition: all 150ms ease;
  
  &::placeholder {
    color: var(--muted-foreground);
  }
  
  &:focus-visible {
    outline: none;
    border-color: var(--ring);
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  /* File input styling */
  &[type="file"] {
    border: 0;
    background: transparent;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  /* Responsive: smaller text on larger screens */
  @media (min-width: 768px) {
    font-size: 0.875rem;
  }
}
```

### Card

```css
.card {
  border-radius: calc(var(--radius) + 4px);
  border: 1px solid var(--border);
  background-color: var(--card);
  color: var(--card-foreground);
  /* Optional shadow for new-york style */
  /* box-shadow: var(--shadow-sm); */
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 1.5rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.025em;
}

.card-description {
  font-size: 0.875rem;
  color: var(--muted-foreground);
}

.card-content {
  padding: 1.5rem;
  padding-top: 0;
}

.card-footer {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  padding-top: 0;
}
```

### Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: calc(var(--radius) - 2px);
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  transition: colors 150ms ease;
}

.badge-default {
  background-color: var(--primary);
  color: var(--primary-foreground);
}

.badge-secondary {
  background-color: var(--secondary);
  color: var(--secondary-foreground);
}

.badge-destructive {
  background-color: var(--destructive);
  color: white;
}

.badge-outline {
  border: 1px solid var(--border);
  color: var(--foreground);
}
```

---

## Dark Mode

### Dark Mode Variables

```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  
  --popover: oklch(0.269 0 0);
  --popover-foreground: oklch(0.985 0 0);
  
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  
  --accent: oklch(0.371 0 0);
  --accent-foreground: oklch(0.985 0 0);
  
  --destructive: oklch(0.704 0.191 22.216);
  
  /* Semi-transparent borders */
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  
  --ring: oklch(0.556 0 0);
}
```

### Implementation Pattern

```css
/* Using class-based dark mode */
:root {
  color-scheme: light;
}

.dark {
  color-scheme: dark;
}

/* Or using media query */
@media (prefers-color-scheme: dark) {
  :root {
    --background: oklch(0.145 0 0);
    /* ... other dark values */
  }
}
```

---

## Complete CSS Variables Reference

```css
:root {
  /* ===== RADIUS ===== */
  --radius: 0.625rem;
  
  /* ===== COLORS (Light Mode) ===== */
  /* Base */
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  
  /* Card */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  
  /* Popover */
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  
  /* Primary */
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  
  /* Secondary */
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  
  /* Muted */
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  
  /* Accent */
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  
  /* Destructive */
  --destructive: oklch(0.577 0.245 27.325);
  
  /* Borders & Inputs */
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  
  /* Chart Colors (for data visualization) */
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  
  /* Sidebar (if using sidebar component) */
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
  
  /* ===== SHADOWS ===== */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  
  /* ===== TYPOGRAPHY ===== */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", monospace;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  
  --popover: oklch(0.269 0 0);
  --popover-foreground: oklch(0.985 0 0);
  
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  
  --accent: oklch(0.371 0 0);
  --accent-foreground: oklch(0.985 0 0);
  
  --destructive: oklch(0.704 0.191 22.216);
  
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}
```

---

## Quick Reference Cheat Sheet

### Key Values to Remember

| Property | Light Mode | Dark Mode |
|----------|------------|-----------|
| Background | `oklch(1 0 0)` (white) | `oklch(0.145 0 0)` |
| Foreground | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| Border | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` |
| Muted text | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` |
| Radius | `0.625rem` (10px) | same |
| Button height | `2.5rem` (40px) | same |
| Input height | `2.5rem` (40px) | same |
| Font size (body) | `0.875rem` (14px) | same |

### The shadcn/ui "Feel"

1. **Neutral grayscale base** - No color bias in UI chrome
2. **1px borders everywhere** - Clean, crisp edges
3. **Subtle rounded corners** - 6-10px, never pill-shaped
4. **Minimal shadows** - Prefer borders to shadows
5. **High contrast text** - Clear readability
6. **Consistent spacing** - 4px grid system
7. **Generous whitespace** - Let elements breathe
8. **Smooth transitions** - 150ms ease on interactions

---

*Reference compiled from official shadcn/ui documentation and source code.*
*Last updated: January 2026*
