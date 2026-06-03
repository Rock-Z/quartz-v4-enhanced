document.addEventListener("nav", () => {
  const panels = [...document.getElementsByClassName("sidebar-panel")] as HTMLElement[]

  for (const panel of panels) {
    const header = panel.querySelector(".sidebar-panel-header")
    if (!(header instanceof HTMLElement)) continue

    const updateExpandedState = () => {
      const expanded = !panel.classList.contains("collapsed")
      header.setAttribute("aria-expanded", expanded ? "true" : "false")
    }

    const togglePanel = () => {
      panel.classList.toggle("collapsed")
      updateExpandedState()
    }

    updateExpandedState()
    header.addEventListener("click", togglePanel)
    window.addCleanup(() => header.removeEventListener("click", togglePanel))
  }
})
