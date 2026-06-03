function setupBackToTop() {
  const button = document.querySelector(".back-to-top")
  if (!(button instanceof HTMLButtonElement)) return

  const threshold = 500
  let animationFrame = 0

  const updateVisibility = () => {
    button.classList.toggle("visible", window.scrollY > threshold)
  }

  const handleClick = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      window.scrollTo({ top: 0, behavior: "auto" })
      return
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }

    const startY = window.scrollY
    const durationMs = 80
    const startTime = performance.now()

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      window.scrollTo(0, Math.round(startY * (1 - eased)))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      } else {
        animationFrame = 0
      }
    }

    animationFrame = requestAnimationFrame(step)
  }

  updateVisibility()
  button.addEventListener("click", handleClick)
  window.addEventListener("scroll", updateVisibility, { passive: true })

  window.addCleanup(() => button.removeEventListener("click", handleClick))
  window.addCleanup(() => window.removeEventListener("scroll", updateVisibility))
  window.addCleanup(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }
  })
}

document.addEventListener("nav", setupBackToTop)
