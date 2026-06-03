import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default ((component: QuartzComponent) => {
  const Component = component
  const NotDesktopOnly: QuartzComponent = (props: QuartzComponentProps) => {
    return <Component displayClass="not-desktop" {...props} />
  }

  NotDesktopOnly.displayName = component.displayName
  NotDesktopOnly.afterDOMLoaded = component?.afterDOMLoaded
  NotDesktopOnly.beforeDOMLoaded = component?.beforeDOMLoaded
  NotDesktopOnly.css = component?.css
  return NotDesktopOnly
}) satisfies QuartzComponentConstructor<QuartzComponent>
