# Alerts

## Purpose and semantic contract

Daft styles ARIA live-message roles, not alert classes:

- `role="alert"` is an assertive, destructive-tinted message for errors or urgent changes that need immediate attention.
- `role="status"` is a polite, neutral-tinted message for non-urgent updates.
- `.success` and `.warning` add a status tone to either role without changing its semantics.

Choose the role by urgency and the tone by meaning, never the role for its color.

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

<div role="status" class="success">
  <strong>Deployment complete</strong>
  <p>Version 42 is live in production.</p>
</div>

<div role="status" class="warning">
  <strong>Storage almost full</strong>
  <p>You have used 90% of your plan.</p>
</div>

<div role="alert" class="warning">
  <strong>Session expiring</strong>
  <p>Save your work. You will be signed out in 2 minutes.</p>
</div>
```

## Markup requirements

- Use a container with exactly the appropriate role: `alert` for urgent errors, `status` for routine updates.
- Use a direct-child `<strong>` for the title and a direct-child `<p>` for supporting text. Both are optional structurally, but this pairing receives the intended spacing and typography.
- Keep the message concise and actionable. Put the recovery control near the message when one is needed.
- Do not add `aria-live` unless there is a specific reason to override the behavior implied by the role.

## Variants and options

| Markup | Use |
|---|---|
| `role="status"` | Neutral, polite update or notice |
| `role="status" class="success"` | Polite confirmation: saved, deployed, completed |
| `role="status" class="warning"` | Polite caution: quota nearly reached, degraded service |
| `role="alert"` | Urgent error (destructive tone by default) |
| `role="alert" class="warning"` | Urgent warning that needs attention now: session expiring, unsaved changes at risk |

- Toned messages (every `role="alert"`, and `role="status"` with `.success` or `.warning`) use one recipe: title and body share the tone mixed 70% with `--foreground`, over the tone mixed 12% (light) or 20% (dark) into `--background`, with a 35% tone border. Text clears WCAG AA in both themes with the default tokens.
- Plain `[role="status"]` uses foreground text, muted body text, a muted surface, and the standard border.
- `role="alert" class="success"` works but is rarely right: success is not urgent, so use `role="status"`.
- Consecutive messages retain bottom spacing, except the last child.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

- `--destructive`, `--success`, and `--warning` drive the tones.
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
- Using a class such as `.alert`, `.success-alert`, or `.warning-alert`; use the role plus `.success` or `.warning`.
- Using `role="alert"` to make a warning more visible when it is not urgent; `role="status" class="warning"` is the polite form.
- Nesting essential controls inside a message without clear button or link text.
