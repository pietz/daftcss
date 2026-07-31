# Badges

## Purpose and semantic contract

Use `.badge` on a short inline status, category, count, or label. A badge is presentational styling on ordinary content. It does not add status or alert semantics, and it is not a button, link, filter, or other interactive control.

## Basic example

```html
<span class="badge">New</span>
<span class="badge outline">Active</span>
<span class="badge secondary">Pending</span>
```

## Markup requirements

- Apply `.badge` to an element containing concise text, usually `<span>`.
- Make the text understandable without color alone.
- Add ARIA semantics only when the information itself requires them; the class does not make the badge a live status.
- Use a real button or link for an interactive action. Do not apply `.badge` to a link.

## Variants

Badges share the static surface recipes of buttons, but remain presentational and noninteractive. Choose at most one optional variant.

| Class | Use |
|---|---|
| none | Primary emphasis |
| `.secondary` | Pending, low-emphasis, or muted information |
| `.outline` | Neutral status, category, count, or metadata |
| `.ghost` | Minimal-emphasis metadata on a quiet surface |
| `.destructive` | Failed, blocked, or error state |

Badges have one canonical 20px pill size. There are no badge size classes; themes may override the shared `--badge-radius` token.

For v1 compatibility, deprecated `.success` maps to `.outline`, `.warning` maps to `.secondary`, and old `.small` or `.large` classes render at the canonical size. Do not use these aliases in new markup.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. Badge surfaces use the same color tokens as the corresponding static button recipes:

- `--primary`, `--secondary`, `--destructive`
- Their corresponding `*-foreground` tokens
- `--border`
- `--badge-radius`

## Behavior and accessibility

Badges are inline flex containers with no wrapping, tabular numerals, and a line-height of `1`. They have no interaction, focus, hover, or live-announcement behavior of their own.

When a changing value needs to be announced, put appropriate live-region semantics on a suitable container based on the update, not on every decorative badge by default.

## Composition

Use badges in table cells, card headers, and compact metadata rows. When a badge sits beside a heading or text, wrap the peers in `.cluster`; do not depend on raw adjacency or add an external margin to the badge.

```html
<article>
  <header>
    <div class="cluster">
      <strong>Deploy 42</strong>
      <span class="badge outline">Passed</span>
    </div>
  </header>
</article>
```

## Common mistakes

- Encoding status only by color.
- Using a badge as a button, link, or filter instead of a real interactive control.
- Combining badge variants or inventing size variants.
- Using long labels that cannot wrap.
