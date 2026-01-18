# Visual Inconsistencies: Daft CSS vs shadcn/ui

After comparing the current Daft CSS implementation with the original shadcn/ui design system, I've identified the following visual discrepancies:

---

## HIGH IMPACT

### 1. Dark Mode Border Colors
| Property | shadcn/ui | Daft CSS |
|----------|-----------|----------|
| `--border` (dark) | `oklch(1 0 0 / 10%)` semi-transparent white | `oklch(0.3 0 0)` solid gray |
| `--input` (dark) | `oklch(1 0 0 / 15%)` semi-transparent white | `var(--border)` same solid gray |

**Visual effect**: Daft's dark mode borders appear heavier and more prominent. shadcn/ui uses semi-transparent white borders that create a softer, more subtle look and blend better with the dark background.

### 2. Card Internal Separators
| Element | shadcn/ui | Daft CSS |
|---------|-----------|----------|
| Card header | No border separator | `border-bottom: 1px solid var(--border)` |
| Card footer | No border separator | `border-top: 1px solid var(--border)` |

**Visual effect**: Daft cards look more segmented and "boxy" with visible dividers. shadcn/ui cards are cleaner and more minimalist - content flows without internal borders.

### 3. Card Title Font Size
| Property | shadcn/ui | Daft CSS |
|----------|-----------|----------|
| Card title | `1.5rem` (24px) | `var(--text-lg)` = 1.125rem (18px) |

**Visual effect**: Card titles appear ~33% smaller in Daft, making cards look less prominent.

### 4. Button Line Height
| Property | shadcn/ui | Daft CSS |
|----------|-----------|----------|
| Line height | `text-sm` = 1.25rem (fixed 20px) | `--leading-normal` = 1.5 (ratio → ~21px) |

**Visual effect**: shadcn/ui uses Tailwind's `text-sm` which has a fixed line-height of 1.25rem (20px). Daft uses a 1.5 line-height ratio. At 14px font size, Daft's line-height is ~21px vs shadcn's 20px. Combined with the button height, this affects vertical text centering.

---

## MEDIUM IMPACT

### 5. Focus Ring Opacity
| Property | shadcn/ui | Daft CSS |
|----------|-----------|----------|
| Focus ring | 50% opacity | 25% opacity |

**Visual effect**: Focus indicators are half as visible in Daft, potentially affecting accessibility.

### 6. H2 Heading Styling
| Property | shadcn/ui | Daft CSS |
|----------|-----------|----------|
| H2 border | `padding-bottom: 0.5rem; border-bottom: 1px` | No bottom border |

**Visual effect**: Section headings in shadcn/ui have a characteristic underline separator. Daft headings lack this visual anchoring.

### 7. Dark Mode Accent Color
| Property | shadcn/ui (dark) | Daft CSS (dark) |
|----------|------------------|-----------------|
| `--accent` | `oklch(0.371 0 0)` (lighter) | `oklch(0.269 0 0)` via `--muted` |

**Visual effect**: Ghost button hovers and accent states appear darker in Daft than in the original.

### 8. Small Button Vertical Padding
| Size | shadcn/ui | Daft CSS |
|------|-----------|----------|
| Default | `h-10 px-4 py-2` (0.5rem vertical) | `padding: 0.5rem 1rem` |
| Small | `h-9 px-3` (no explicit py) | `padding: 0.25rem 0.75rem` |

**Visual effect**: Daft's small button has explicit 0.25rem vertical padding while shadcn relies on height constraint. This may affect text centering within small buttons.

---

## LOW IMPACT

### 9. Dark Mode Popover vs Card
| Property | shadcn/ui (dark) | Daft CSS (dark) |
|----------|------------------|-----------------|
| `--card` | `oklch(0.205 0 0)` | `oklch(0.205 0 0)` |
| `--popover` | `oklch(0.269 0 0)` (lighter!) | `var(--card)` (same) |

**Visual effect**: Popovers should appear slightly elevated from cards in dark mode. Daft lacks this subtle layering.

### 10. Link Underline Offset
| Property | shadcn/ui | Daft CSS |
|----------|-----------|----------|
| `text-underline-offset` | 4px | 0.2em (~3.2px) |

**Visual effect**: Links have slightly tighter underline spacing in Daft.

### 11. Input Font Size Responsiveness
| Breakpoint | shadcn/ui | Daft CSS |
|------------|-----------|----------|
| Mobile | 1rem (16px) | 1rem (16px) |
| Desktop (md+) | 0.875rem (14px) | 1rem (16px) |

**Visual effect**: Inputs don't get the subtle size reduction on larger screens.

---

## Summary

**Most noticeable differences:**
1. **Dark mode borders** - Too prominent/harsh compared to shadcn/ui's subtle semi-transparent borders
2. **Card separators** - Extra borders inside cards that shadcn/ui doesn't have
3. **Card titles** - Noticeably smaller font size (18px vs 24px)
4. **Button line-height** - Using ratio 1.5 instead of fixed 1.25rem (Tailwind's text-sm default)

**Button-specific issues:**
- Line height affects text centering within the fixed button heights
- Small button has explicit vertical padding (0.25rem) that may not match shadcn behavior
- Overall button dimensions (heights: 36/40/44px, horizontal padding) are correct

---

## Verification

After fixes, compare:
1. Open shadcn/ui components page in one tab
2. Open Daft demo in another tab
3. Toggle dark mode on both and compare border subtlety
4. Compare card component appearance
5. Compare focus states on buttons/inputs
