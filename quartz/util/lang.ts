import type { QuartzDisplayClass } from "../components/types"

export function capitalize(s: string): string {
  return s.substring(0, 1).toUpperCase() + s.substring(1)
}

export function classNames(displayClass?: QuartzDisplayClass, ...classes: string[]): string {
  if (displayClass) {
    classes.push(displayClass)
  }
  return classes.join(" ")
}
