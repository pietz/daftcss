# Dialogs

## Purpose and semantic contract

Use `<dialog>` for a focused interaction outside the normal document flow. Choose modality deliberately:

- `<dialog popover>` is a **non-modal popover dialog**. It opens from declarative Popover API attributes, supports Escape and light dismiss, does not make the page inert, and does not contain focus.
- A regular `<dialog>` opened with `showModal()` is a **true modal dialog**. It requires JavaScript to open, creates the native modal backdrop, makes the rest of the document inert, and contains focus until closed.

Give every dialog an accessible name with `aria-labelledby` pointing to its visible title, or with `aria-label` when a visible title is not appropriate.

## Basic example

### Non-modal popover

```html
<button type="button" popovertarget="help-dialog">Open help</button>

<dialog id="help-dialog" popover aria-labelledby="help-title">
  <article>
    <button aria-label="Close" popovertarget="help-dialog"
            popovertargetaction="hide"></button>
    <header><strong id="help-title">Help</strong></header>
    <p>Supporting information.</p>
  </article>
</dialog>
```

### True modal dialog

```html
<button type="button" onclick="document.querySelector('#confirm-dialog').showModal()">
  Delete account
</button>

<dialog id="confirm-dialog" aria-labelledby="confirm-title">
  <article>
    <header>
      <button aria-label="Close" onclick="this.closest('dialog').close()"></button>
      <h2 id="confirm-title">Delete account?</h2>
    </header>
    <p>This action cannot be undone.</p>
    <footer>
      <button class="secondary" type="button" onclick="this.closest('dialog').close()">Cancel</button>
      <button class="destructive" type="button">Delete</button>
    </footer>
  </article>
</dialog>
```

## Markup requirements

- Give the dialog an `id` when a popover trigger or script refers to it.
- Keep the dialog name in the dialog itself. Use `aria-labelledby` for a visible heading, otherwise `aria-label`.
- Wrap content in `<article>` for the full card layout, including its styled header, footer, and close-button placement. The article is optional: a dialog without one is styled as a compact card surface.
- A dialog close button is only visually recognized by `aria-label="Close"` (or `rel="prev"`). Supply the actual close behavior: `popovertargetaction="hide"` for a popover, or `close()` / `method="dialog"` for a modal.

## Variants and options

There are no dialog variant classes. Compose the contents with standard buttons, forms, cards, and utility classes. The surface is at most `--modal-max-width` wide and scrolls when its content exceeds the available dynamic viewport height.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

- `--modal-max-width`, `--modal-radius`, `--modal-shadow`, `--modal-overlay`, `--blur`
- `--card`, `--foreground`, `--border`, `--muted-foreground`, `--accent`
- `--spacing`, `--spacing-sm`, `--spacing-lg`, `--spacing-xl`
- `--transition-slow`, `--ease-default`

## Behavior and accessibility

Both dialog forms share Daft's centered surface, overlay backdrop, close-button styling, and entrance animation when content is wrapped in an article.

Use a non-modal popover for supplementary, interruptible content. Its native light-dismiss behavior is appropriate when losing the overlay does not discard work. Do not use it for confirmation, destructive actions, or a workflow that must block the page.

Use `showModal()` for blocking confirmation, authentication, or required decisions. Provide an explicit close or cancel path, preserve a useful trigger focus target, and return focus there after closing if your flow changes the default. Avoid setting `autofocus` unless a specific control should receive the initial focus.

## Composition

Use a `<footer>` in the article for right-aligned action buttons. For a modal form, `<form method="dialog">` can close the modal declaratively for cancel/submit flows; keep business-side effects in your application logic.

## Common mistakes

- Do not add `popover` when the interaction must be modal. It is non-modal even though it uses `<dialog>`.
- Do not call `showModal()` on a dialog that also has `popover`.
- Do not omit the dialog's accessible name or rely on the close icon's generated `✕` as its name.
- Do not assume the styled close button closes anything by itself.
- Do not use a JavaScript dialog library when native `<dialog>` and the Popover API meet the interaction requirement.
