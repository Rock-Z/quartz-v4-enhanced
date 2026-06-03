import { QuartzComponent, QuartzComponentConstructor } from "./types"
import style from "./styles/backToTop.scss"

// @ts-ignore
import script from "./scripts/backToTop.inline"
import { classNames } from "../util/lang"

const BackToTop: QuartzComponent = ({ displayClass }) => {
  return (
    <button
      type="button"
      class={classNames(displayClass, "back-to-top")}
      aria-label="Back to top"
      title="Back to top"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  )
}

BackToTop.css = style
BackToTop.afterDOMLoaded = script

export default (() => BackToTop) satisfies QuartzComponentConstructor
