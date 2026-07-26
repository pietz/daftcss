# Tree

## Purpose and semantic contract

Use `<ul class="tree">` for a compact, file-like hierarchy. Folders are native details disclosures; files are links. The class provides tree visuals only: the underlying semantics remain nested lists and disclosures, not an ARIA `tree` widget.

## Basic example

```html
<ul class="tree">
  <li>
    <details open>
      <summary>src</summary>
      <ul>
        <li>
          <details>
            <summary>components</summary>
            <ul>
              <li><a href="/button.css">button.css</a></li>
              <li><a href="/tree.css" aria-current="page">tree.css</a></li>
            </ul>
          </details>
        </li>
        <li><a href="/daft.css">daft.css</a></li>
      </ul>
    </details>
  </li>
  <li><a href="/README">README.md</a></li>
</ul>
```

## Markup requirements

- Start with `<ul class="tree">` and use an `<li>` for every folder or file.
- A folder is `li > details > summary + ul`. The summary is the native folder disclosure; its nested list contains child items.
- A file is `li > a`. Use a real destination in `href`.
- Set `open` on a folder that should initially be expanded. Mark the current file with `aria-current="page"`; `.active` is a visual alternative.

## Variants and options

- Set `--tree-indent` on `.tree` to change the indentation per nesting level. It defaults to `var(--spacing-md)`.
- Closed folders show a right-pointing chevron; open folders show a down-pointing chevron.
- `aria-current` and `.active` give a file row the selected background. `aria-current` also communicates the current resource; prefer it for actual current files.
- There are no folder or file icon classes in this component. The folder chevron alone differentiates folders from files.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

`--tree-indent`, `--spacing`, `--spacing-xs`, `--spacing-md`, `--text-sm`, `--line-height-sm`, `--font-medium`, `--radius-sm`, `--foreground`, `--icon-chevron`, and `--transition-default`.

## Behavior and accessibility

- Folders inherit native details behavior: their summaries are keyboard-operable controls and toggle the `open` attribute.
- Folder and file rows have a minimum 24 CSS pixel hit area for WCAG 2.2 target sizing.
- The tree does not implement `role="tree"`, roving tabindex, or arrow-key traversal. Do not add those roles unless you also implement the full ARIA tree interaction model.
- File links remain ordinary links. `aria-current="page"` is the semantic selected-state marker; `.active` alone is visual.
- Tree styles intentionally remove the ordinary accordion border, open color, chevron, and content spacing for folders.

## Composition

Use a tree in a file browser, documentation explorer, sidebar panel, or card. It can sit beside an editor in a grid or inside a [Sidebar](sidebar.md). Use an ordinary [Accordion](accordion.md) for expandable prose rather than a hierarchy.

## Common mistakes

- Do not use nested divs instead of nested lists for the hierarchy.
- Do not make a file row a non-link when it represents a navigable resource.
- Do not add ARIA tree roles just for the appearance; that changes the keyboard contract.
- Do not use the generic accordion markup without the `.tree` root when you need tree indentation and folder/file alignment.
