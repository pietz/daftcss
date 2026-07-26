# Badges

## Purpose and semantic contract

Use `.badge` on a short inline status, category, count, or label. A badge is presentational styling on ordinary content; it does not add status or alert semantics.

## Basic example

```html
<span class="badge">New</span>
<span class="badge success">Active</span>
<span class="badge warning">Pending</span>
```

## Markup requirements

- Apply `.badge` to an element containing concise text, usually `<span>`.
- Make the text understandable without color alone.
- Add ARIA semantics only when the information itself requires them; the class does not make the badge a live status.

## Variants and options

### Color

| Class | Meaning |
|---|---|
| none | Primary |
| `.secondary` | Neutral |
| `.success` | Resolved, active, healthy |
| `.warning` | Pending, attention |
| `.destructive` | Failed, blocked, error |

### Outline

`.outline` uses a transparent background with the current tint as text and border. Combine it with color variants, for example `.badge outline success`.

`.badge.outline.secondary` is intentionally neutral: with the default palette, it uses `--foreground` text and `--border` stroke because `--secondary` equals `--muted`. If `--secondary` is overridden to a distinguishable color, its standard tint can show through.

### Size and shape

- `.small` changes padding to `0 var(--spacing-xs)`.
- `.large` changes padding to `var(--spacing-sm) var(--spacing-md)`.
- Both retain `--text-xs`; they do not change font size.
- Set `--badge-radius: var(--radius-full)` to make badges pill-shaped.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

- `--badge-radius`
- `--spacing-xs`, `--spacing-sm`, `--spacing-md`
- `--text-xs`, `--font-medium`
- `--border-width`
- `--primary`, `--secondary`, `--success`, `--warning`, `--destructive`
- Their corresponding `*-foreground` tokens

## Behavior and accessibility

Badges are inline flex containers with no wrapping, tabular numerals, and a line-height of `1`. They have no interaction, focus, hover, or live-announcement behavior of their own.

When a changing value needs to be announced, put appropriate live-region semantics on a suitable container based on the update, not on every decorative badge by default.

## Composition

Use badges in table cells, card headers, and compact metadata rows.

```html
<article>
  <header>
    <strong>Deploy 42</strong>
    <span class="badge outline success">Passed</span>
  </header>
</article>
```

## Common mistakes

- Encoding status only by color.
- Using a badge as a button or filter without supplying a real interactive control.
- Expecting `.small` or `.large` to change text size.
- Assuming badges are pills by default. Their default radius is `--radius-md`.
- Using long labels that cannot wrap.
