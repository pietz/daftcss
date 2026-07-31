import { useCallback, useEffect, useRef, useState } from "react"

type Theme = "light" | "dark"

const panes = [
  { id: "old", title: "Daft CSS · frozen", detail: "v1.20.1 artifact", src: "/components-daft-old.html" },
  { id: "new", title: "Daft CSS · current", detail: "Current branch · compact density", src: "/components-daft.html" },
  { id: "shadcn", title: "shadcn/ui · reference", detail: "Radix Nova · CLI 4.16.0", src: "/components-shadcn.html" },
] as const

type PaneId = (typeof panes)[number]["id"]

const paneById = Object.fromEntries(panes.map((pane) => [pane.id, pane])) as Record<PaneId, (typeof panes)[number]>

export default function ComponentsApp() {
  const [theme, setTheme] = useState<Theme>("light")
  const [leftPane, setLeftPane] = useState<PaneId>("shadcn")
  const [rightPane, setRightPane] = useState<PaneId>("new")
  const frameRefs = useRef<Record<string, HTMLIFrameElement | null>>({})
  const frameHeights = useRef<Record<string, number>>({})

  const sendTheme = useCallback((nextTheme: Theme, frame?: HTMLIFrameElement | null) => {
    const targets = frame ? [frame] : Object.values(frameRefs.current)
    targets.forEach((target) => target?.contentWindow?.postMessage(
      { type: "comparison:set-theme", theme: nextTheme }, window.location.origin,
    ))
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    sendTheme(theme)
  }, [sendTheme, theme])

  useEffect(() => {
    const receiveHeight = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== "comparison:height") return
      const entry = Object.entries(frameRefs.current).find(([, item]) => item?.contentWindow === event.source)
      if (!entry || typeof event.data.height !== "number") return
      frameHeights.current[entry[0]] = Math.max(680, Math.ceil(event.data.height))
      const sharedHeight = Math.max(...Object.values(frameHeights.current))
      Object.values(frameRefs.current).forEach((frame) => {
        if (frame) frame.style.height = `${sharedHeight}px`
      })
    }
    window.addEventListener("message", receiveHeight)
    return () => window.removeEventListener("message", receiveHeight)
  }, [])

  const slots = [
    { id: "left", pane: paneById[leftPane] },
    { id: "right", pane: paneById[rightPane] },
  ] as const

  return (
    <main className="comparison-shell comparison-catalog-shell">
      <header className="host-header">
        <div>
          <p className="eyebrow">Visual baseline experiment</p>
          <h1>Component Catalog</h1>
          <p className="lede">Compare full, isolated component surfaces with a shared theme and equal pane widths.</p>
        </div>
        <div className="host-controls" aria-label="Comparison controls">
          <fieldset className="pane-pickers">
            <legend>Compared renderings</legend>
            <label><span>Left</span><select value={leftPane} onChange={(event) => setLeftPane(event.target.value as PaneId)}>{panes.map((pane) => <option key={pane.id} value={pane.id}>{pane.title}</option>)}</select></label>
            <button className="swap-button" type="button" onClick={() => { setLeftPane(rightPane); setRightPane(leftPane) }}>Swap</button>
            <label><span>Right</span><select value={rightPane} onChange={(event) => setRightPane(event.target.value as PaneId)}>{panes.map((pane) => <option key={pane.id} value={pane.id}>{pane.title}</option>)}</select></label>
          </fieldset>
          <button className="theme-toggle" type="button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>
            {theme === "light" ? "Dark theme" : "Light theme"}
          </button>
        </div>
      </header>
      <section className="pane-grid catalog-pane-grid" aria-label="Component catalog comparison">
        {slots.map(({ id, pane }) => (
          <article className="pane" key={`${id}-${pane.id}`}>
            <header className="pane-label"><div><strong>{pane.title}</strong><span>{pane.detail}</span></div><span className="isolated-label">Isolated iframe</span></header>
            <iframe
              ref={(node) => { frameRefs.current[id] = node }}
              title={`${id} pane: ${pane.title} component catalog`}
              src={pane.src}
              onLoad={(event) => {
                frameHeights.current[id] = 680
                event.currentTarget.style.height = "680px"
                sendTheme(theme, event.currentTarget)
              }}
            />
          </article>
        ))}
      </section>
    </main>
  )
}
