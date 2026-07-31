import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import "./catalog-shadcn.css"
import ComponentsShadcn from "./ComponentsShadcn"

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark")
  document.documentElement.style.colorScheme = theme
}

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin || event.data?.type !== "comparison:set-theme") return
  if (event.data.theme === "light" || event.data.theme === "dark") applyTheme(event.data.theme)
})

function reportHeight() {
  const content = document.querySelector("main")
  const height = content ? Math.ceil(content.getBoundingClientRect().bottom + window.scrollY) : document.body.scrollHeight
  window.parent.postMessage(
    { type: "comparison:height", height },
    window.location.origin,
  )
}

new ResizeObserver(reportHeight).observe(document.body)
window.addEventListener("load", reportHeight)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ComponentsShadcn />
  </StrictMode>,
)

requestAnimationFrame(reportHeight)
