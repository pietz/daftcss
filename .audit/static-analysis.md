# Static Analysis

## Summary

- `npm run build` passed.
- `dist/daft.css` and `docs/dist/daft.css` are byte-identical after build; same for minified output.
- `dist/daft.min.css` is 58,939 bytes.
- Subagent security/performance pass reported `npm audit --audit-level=moderate --package-lock-only` found 0 vulnerabilities.
- No configured lint/type/test command was found beyond the Lightning CSS build.

## Build Output

```text
> daftcss@1.12.3 build
> lightningcss --bundle src/daft.css -o dist/daft.css && lightningcss --bundle --minify src/daft.css -o dist/daft.min.css && cp dist/daft.css dist/daft.min.css docs/dist/
```

## Notes

- The project intentionally does not pass browser targets to Lightning CSS, preserving modern CSS such as `light-dark()`, CSS nesting, `:has()`, `:popover-open`, and `@starting-style`.
- Generated output reproducibility was verified by the build and by subagent temp-build comparison.
