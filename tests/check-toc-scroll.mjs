import { firefox } from "playwright"

const baseUrl = process.env.TOC_BASE_URL || "http://127.0.0.1:4174"
const tocPath = "/010-Notes/012-Research/012.02-Projects/2409-Inverting-TPR/_Logs"

console.log("launching browser")
const browser = await firefox.launch({ headless: true })

try {
  console.log("opening page")
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
  console.log("navigating")
  await page.goto(new URL(tocPath, baseUrl).toString(), { waitUntil: "domcontentloaded" })
  console.log("evaluating toc")

  const metrics = await page.evaluate(() => {
    const toc = document.querySelector(".sidebar.right .toc")
    const header = toc?.querySelector(".toc-header")
    const content = toc?.querySelector(".toc-content")
    const toggle = toc?.querySelector("button.toc-header")

    if (!(toc instanceof HTMLElement) || !(header instanceof HTMLElement) || !(content instanceof HTMLElement)) {
      throw new Error("ToC structure not found")
    }

    const beforeScrollTop = content.scrollTop
    content.scrollTop = content.scrollHeight

    return {
      panelHeight: toc.clientHeight,
      headerHeight: header.clientHeight,
      listClientHeight: content.clientHeight,
      listScrollHeight: content.scrollHeight,
      beforeScrollTop,
      afterScrollTop: content.scrollTop,
      overflowY: window.getComputedStyle(content).overflowY,
      hasToggleButton: toggle !== null,
    }
  })

  console.log(JSON.stringify(metrics, null, 2))

  if (metrics.hasToggleButton) {
    throw new Error("ToC still renders a toggle button")
  }

  if (metrics.panelHeight < 300 || metrics.panelHeight > 500) {
    throw new Error(`Unexpected ToC panel height: ${metrics.panelHeight}`)
  }

  if (metrics.overflowY !== "auto") {
    throw new Error(`ToC overflow-y is ${metrics.overflowY}, expected auto`)
  }

  if (metrics.listScrollHeight <= metrics.listClientHeight) {
    throw new Error("ToC list is not overflowed; no internal scroll area was created")
  }

  if (metrics.afterScrollTop <= metrics.beforeScrollTop) {
    throw new Error("ToC list did not scroll when scrollTop was advanced")
  }
} finally {
  console.log("closing browser")
  await browser.close()
}
