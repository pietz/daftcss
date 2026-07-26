# Alerts

## Purpose and semantic contract

Daft styles ARIA live-message roles, not alert classes:

- `role="alert"` is an assertive, destructive-tinted message for errors or urgent changes that need immediate attention.
- `role="status"` is a polite, neutral-tinted message for non-urgent updates.

Use the role that matches the urgency of the message, not its preferred color.

## Basic example

```html
<div role="alert">
  <strong>Payment failed</strong>
  <p>Your card could not be charged.</p>
</div>

<div role="status">
  <strong>Sync in progress</strong>
  <p>We are updating your workspace.</p>
</div>
```

## Markup requirements

- Use a container with exactly the appropriate role: `alert` for urgent errors, `status` for routine updates.
- Use a direct-child `<strong>` for the title and a direct-child `<p>` for supporting text. Both are optional structurally, but this pairing receives the intended spacing and typography.
- Keep the message concise and actionable. Put the recovery control near the message when one is needed.
- Do not add `aria-live` unless there is a specific reason to override the behavior implied by the role.

## Variants and options

There are no class variants.

- `[role="alert"]` uses destructive text, border, and a destructive-tinted surface.
- `[role="status"]` uses foreground text, muted body text, a muted surface, and the standard border.
- Consecutive messages retain bottom spacing, except the last child.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

- `--destructive` drives alert emphasis.
- `--background`, `--foreground`, `--muted`, and `--muted-foreground` drive the surfaces and text.
- `--border` and `--border-width` set the outline.
- `--radius-md` sets the corner radius.
- `--spacing-xs`, `--spacing-md`, `--spacing-lg`, `--spacing` set internal and external spacing.
- `--font-semibold`, `--text-sm`, and `--line-height-sm` set title and body typography.

## Behavior and accessibility

An alert is assertive: assistive technology may interrupt current speech when it appears. Reserve it for errors that require prompt attention; do not use it for page-load content, routine confirmations, or frequent progress updates. A status message is polite and is appropriate for background updates and confirmations. Dynamic messages must actually be inserted or updated by application code for live-region behavior to matter.

## Composition

Place alerts near the affected form, task, or page region. Pair field-specific errors with the relevant label, `aria-invalid`, and helper text rather than putting every validation problem into a global alert. Use a button or link for a retry, undo, or details action.

## Common mistakes

- Using `role="alert"` solely to get a red panel.
- Announcing numerous or constantly changing messages assertively.
- Using a class such as `.alert`, `.success-alert`, or `.warning-alert`; Daft provides no such variants.
- Nesting essential controls inside a message without clear button or link text.
