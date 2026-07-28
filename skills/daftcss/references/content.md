# Content

Load this reference for document typography, prose, lists, quotations, and code presentation.

## Typography

Daft styles headings, paragraphs, links, emphasis, small text, abbreviations, marks, horizontal rules, description lists, and nested lists without required classes.

```html
<section>
  <hgroup>
    <h1>Release notes</h1>
    <p>What changed in this version.</p>
  </hgroup>
  <p>Daft preserves the meaning of ordinary document HTML.</p>
</section>
```

- Heading size and weight follow the shared type scale.
- `<hgroup>` pairs a heading with muted supporting text.
- Use `<article class="plain">` for a semantic narrative article that should follow this normal document typography and flow instead of Daft's automatic card presentation.
- `.muted` is available for supporting text that has no stronger semantic state.
- Links use underlines and visible keyboard focus by default.
- `.label` creates a small section label for dropdown groups, sidebars, and eyebrows.

Keep heading levels structurally correct. Do not choose `<h3>` merely because its default size looks convenient; use the correct level and a text-size utility only when presentation must differ.

## Lists and descriptions

```html
<ul>
  <li>Semantic defaults</li>
  <li>Native interactions</li>
</ul>

<dl>
  <dt>Runtime</dt>
  <dd>No required JavaScript</dd>
</dl>
```

Nested ordered and unordered lists receive tighter internal rhythm. Navigation, dropdown, tree, and breadcrumb lists use their component-specific structures instead of prose-list styling.

## Quotations

```html
<blockquote>
  <p>Make the simple path the polished path.</p>
  <footer><cite>Project principle</cite></footer>
</blockquote>
```

Use `<blockquote>` for quoted material, not as a generic indented panel. Put attribution in `<cite>`.

## Inline code and keyboard input

```html
<p>Run <code>npm install daftcss</code>, then press <kbd>Enter</kbd>.</p>
```

- `<code>` is for source, identifiers, and commands.
- `<kbd>` is for user input.
- `<samp>` is for program output.
- `<var>` is for a variable or placeholder.

## Code blocks

```html
<pre tabindex="0"><code>button {
  border-radius: var(--button-radius);
}</code></pre>
```

`<pre>` owns the scrollable surface; nested `<code>` removes its inline background and preserves whitespace. Add `tabindex="0"` when a code block can overflow and otherwise has no keyboard-focusable content.

Syntax highlighting is not bundled. If a documentation site adds a highlighter, keep `<pre>` as the scrolling surface and verify token contrast in both themes.

## Common mistakes

- Do not use heading levels as size utilities.
- Do not rely on placeholder text instead of form labels.
- Do not use `.muted` to communicate warning, success, or error meaning; use semantic status components.
- Do not nest interactive component lists inside prose markup without following that component's contract.
- Do not place a second independently scrolling element inside `<pre>`.

## Related references

- [embedded-content.md](components/embedded-content.md)
- [tables.md](components/tables.md)
- [utilities.md](utilities.md) for text-size and alignment helpers
