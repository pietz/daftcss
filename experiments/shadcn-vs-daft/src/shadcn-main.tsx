import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import ShadcnScenario from "./ShadcnScenario"

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark")
  document.documentElement.style.colorScheme = theme
}

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return
  if (event.data?.type !== "comparison:set-theme") return
  if (event.data.theme === "light" || event.data.theme === "dark") {
    applyTheme(event.data.theme)
  }
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ShadcnScenario />
  </StrictMode>,
)
