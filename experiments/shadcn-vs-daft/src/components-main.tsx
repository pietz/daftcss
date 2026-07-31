import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./host.css"
import ComponentsApp from "./ComponentsApp"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ComponentsApp />
  </StrictMode>,
)
