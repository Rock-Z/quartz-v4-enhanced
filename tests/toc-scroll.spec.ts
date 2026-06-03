import { expect, test } from "@playwright/test"

const tocPath = "/010-Notes/012-Research/012.02-Projects/2409-Inverting-TPR/_Logs"

test("toc stays fixed-height and scrolls internally", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 })
  await page.goto(tocPath, { waitUntil: "domcontentloaded" })

  const toc = page.locator(".sidebar.right .toc")
  const tocHeader = toc.locator(".toc-header")
  const tocContent = toc.locator(".toc-content")

  await expect(toc).toBeVisible()
  await expect(toc.locator("button.toc-header")).toHaveCount(0)
  await expect(tocHeader).toBeVisible()
  await expect(tocContent).toBeVisible()

  const metrics = await tocContent.evaluate((node) => {
    const element = node as HTMLElement
    const parent = element.parentElement as HTMLElement
    return {
      panelHeight: parent.clientHeight,
      listClientHeight: element.clientHeight,
      listScrollHeight: element.scrollHeight,
      initialScrollTop: element.scrollTop,
      overflowY: window.getComputedStyle(element).overflowY,
    }
  })

  expect(metrics.panelHeight).toBeGreaterThan(300)
  expect(metrics.panelHeight).toBeLessThan(500)
  expect(metrics.listScrollHeight).toBeGreaterThan(metrics.listClientHeight)
  expect(metrics.overflowY).toBe("auto")
  expect(metrics.initialScrollTop).toBe(0)

  const scrollResult = await tocContent.evaluate((node) => {
    const element = node as HTMLElement
    element.scrollTop = element.scrollHeight
    return {
      finalScrollTop: element.scrollTop,
      maxScrollTop: element.scrollHeight - element.clientHeight,
    }
  })

  expect(scrollResult.maxScrollTop).toBeGreaterThan(0)
  expect(scrollResult.finalScrollTop).toBeGreaterThan(0)
})
