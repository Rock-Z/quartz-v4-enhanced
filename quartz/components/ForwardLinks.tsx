import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/backlinks.scss"
import { resolveRelative, simplifySlug } from "../util/path"
import { classNames } from "../util/lang"
import OverflowListFactory from "./OverflowList"
import { concatenateResources } from "../util/resources"
// @ts-ignore
import sidebarPanelScript from "./scripts/sidebarPanel.inline"

interface ForwardLinksOptions {
  hideWhenEmpty: boolean
}

const defaultOptions: ForwardLinksOptions = {
  hideWhenEmpty: true,
}

export default ((opts?: Partial<ForwardLinksOptions>) => {
  const options: ForwardLinksOptions = { ...defaultOptions, ...opts }
  const { OverflowList, overflowListAfterDOMLoaded } = OverflowListFactory()

  const ForwardLinks: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const currentSlug = simplifySlug(fileData.slug!)
    const linkedSlugs = [...new Set((fileData.links ?? []).filter((slug) => slug !== currentSlug))]
    const linkedFiles = linkedSlugs
      .map((slug) => allFiles.find((file) => simplifySlug(file.slug!) === slug))
      .filter((file) => file !== undefined)

    if (options.hideWhenEmpty && linkedFiles.length === 0) {
      return null
    }

    return (
      <div class={classNames(displayClass, "backlinks", "forward-links", "sidebar-panel")}>
        <button type="button" class="sidebar-panel-header">
          <h3>Links</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="5 8 14 8"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="fold"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <OverflowList class="sidebar-panel-content">
          {linkedFiles.length > 0 ? (
            linkedFiles.map((f) => (
              <li>
                <a
                  href={resolveRelative(fileData.slug!, f.slug!)}
                  class="internal"
                  data-popover-delay="500"
                >
                  {f.frontmatter?.title ?? f.slug}
                </a>
              </li>
            ))
          ) : (
            <li>No links found.</li>
          )}
        </OverflowList>
      </div>
    )
  }

  ForwardLinks.css = style
  ForwardLinks.afterDOMLoaded = concatenateResources(sidebarPanelScript, overflowListAfterDOMLoaded)

  return ForwardLinks
}) satisfies QuartzComponentConstructor
