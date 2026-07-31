import { useCallback, useEffect, useRef, useState } from "react"

type Theme = "light" | "dark"

const panes = [
  {
    id: "old",
    title: "Daft CSS · before",
    detail: "Frozen v1.20.1 artifact",
    src: "/daft-old.html",
  },
  {
    id: "new",
    title: "Daft CSS · after",
    detail: "Current parity branch",
    src: "/daft.html",
  },
  {
    id: "shadcn",
    title: "shadcn/ui · reference",
    detail: "Radix Nova · CLI 4.16.0",
    src: "/shadcn.html",
  },
] as const

type PaneId = (typeof panes)[number]["id"]

const paneById = Object.fromEntries(panes.map((pane) => [pane.id, pane])) as Record<
  PaneId,
  (typeof panes)[number]
>

export function App() {
  const [theme, setTheme] = useState<Theme>("light")
  const [leftPane, setLeftPane] = useState<PaneId>("shadcn")
  const [rightPane, setRightPane] = useState<PaneId>("new")
  const frameRefs = useRef<Record<string, HTMLIFrameElement | null>>({})

  const sendTheme = useCallback((nextTheme: Theme, frame?: HTMLIFrameElement | null) => {
    const targets = frame ? [frame] : Object.values(frameRefs.current)
    targets.forEach((target) =>
      target?.contentWindow?.postMessage(
        { type: "comparison:set-theme", theme: nextTheme },
        window.location.origin,
      ),
    )
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    sendTheme(theme)
  }, [sendTheme, theme])

  const slots = [
    { id: "left", pane: paneById[leftPane] },
    { id: "right", pane: paneById[rightPane] },
  ] as const

  return (
    <main className="comparison-shell">
      <header className="host-header">
        <div>
          <p className="eyebrow">Visual baseline experiment</p>
          <h1>Release Operations</h1>
          <p className="lede">Choose any two isolated renderings and compare equal pane viewports.</p>
        </div>

        <div className="host-controls" aria-label="Comparison controls">
          <fieldset className="pane-pickers">
            <legend>Compared renderings</legend>
            <label>
              <span>Left</span>
              <select value={leftPane} onChange={(event) => setLeftPane(event.target.value as PaneId)}>
                {panes.map((pane) => <option key={pane.id} value={pane.id}>{pane.title}</option>)}
              </select>
            </label>
            <button
              className="swap-button"
              type="button"
              onClick={() => {
                setLeftPane(rightPane)
                setRightPane(leftPane)
              }}
            >
              Swap
            </button>
            <label>
              <span>Right</span>
              <select value={rightPane} onChange={(event) => setRightPane(event.target.value as PaneId)}>
                {panes.map((pane) => <option key={pane.id} value={pane.id}>{pane.title}</option>)}
              </select>
            </label>
          </fieldset>
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            {theme === "light" ? "Dark theme" : "Light theme"}
          </button>
        </div>
      </header>

      <section className="pane-grid" aria-label="Rendered comparison">
        {slots.map(({ id, pane }) => (
          <article className="pane" key={`${id}-${pane.id}`}>
            <header className="pane-label">
              <div>
                <strong>{pane.title}</strong>
                <span>{pane.detail}</span>
              </div>
              <span className="isolated-label">Isolated iframe</span>
            </header>
            <iframe
              ref={(node) => {
                frameRefs.current[id] = node
              }}
              title={`${id} pane: ${pane.title} Release Operations dashboard`}
              src={pane.src}
              onLoad={(event) => sendTheme(theme, event.currentTarget)}
            />
          </article>
        ))}
      </section>
    </main>
  )
}

export default App
