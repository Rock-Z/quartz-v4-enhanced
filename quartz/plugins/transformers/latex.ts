import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeMathjax from "rehype-mathjax/svg"
import type { Root } from "mdast"
import type { InlineMath } from "mdast-util-math"
import { visit } from "unist-util-visit"
//@ts-ignore
import rehypeTypst from "@myriaddreamin/rehype-typst"
import { QuartzTransformerPlugin } from "../types"
import { KatexOptions } from "katex"
import { Options as MathjaxOptions } from "rehype-mathjax/svg"
//@ts-ignore
import { Options as TypstOptions } from "@myriaddreamin/rehype-typst"

interface Options {
  renderEngine: "katex" | "mathjax" | "typst"
  customMacros: MacroType
  katexOptions: Omit<KatexOptions, "macros" | "output">
  mathJaxOptions: Omit<MathjaxOptions, "macros">
  typstOptions: TypstOptions
}

// mathjax macros
export type Args = boolean | number | string | null
interface MacroType {
  [key: string]: string | Args[]
}

const unwrapWhitespacePaddedSingleDollarMath = () => {
  return (tree: Root, file: { value: unknown }) => {
    const source = String(file.value)

    visit(tree as any, "inlineMath", (node: InlineMath, index: number | undefined, parent: any) => {
      if (
        index === undefined ||
        !parent ||
        node.position?.start.offset === undefined ||
        node.position.end.offset === undefined
      ) {
        return
      }

      const raw = source.slice(node.position.start.offset, node.position.end.offset)
      if (
        raw.startsWith("$") &&
        raw.endsWith("$") &&
        !raw.startsWith("$$") &&
        !raw.endsWith("$$") &&
        (/\s/.test(raw[1] ?? "") || /\s/.test(raw[raw.length - 2] ?? ""))
      ) {
        parent.children[index] = { type: "text", value: raw, position: node.position }
      }
    })
  }
}

export function normalizeDisplayMath(src: string): string {
  const lines = src.split("\n")
  const normalized: string[] = []
  let inDisplayMath = false
  let fence: string | undefined

  for (const line of lines) {
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/)
    if (fenceMatch && !inDisplayMath) {
      const marker = fenceMatch[1][0]
      if (fence === marker) {
        fence = undefined
      } else if (!fence) {
        fence = marker
      }
    }

    if (fence) {
      normalized.push(line)
      continue
    }

    const indent = line.match(/^\s*/)?.[0] ?? ""
    const trimmed = line.trim()

    if (!inDisplayMath && trimmed.startsWith("$$") && trimmed !== "$$") {
      let body = trimmed.slice(2).trim()
      const closesOnSameLine = body.endsWith("$$")
      if (closesOnSameLine) {
        body = body.slice(0, -2).trim()
      }

      normalized.push(`${indent}$$`)
      if (body) {
        normalized.push(`${indent}${body}`)
      }
      if (closesOnSameLine) {
        normalized.push(`${indent}$$`)
      } else {
        inDisplayMath = true
      }
      continue
    }

    if (inDisplayMath && trimmed.endsWith("$$") && trimmed !== "$$") {
      const body = trimmed.slice(0, -2).trim()
      if (body) {
        normalized.push(`${indent}${body}`)
      }
      normalized.push(`${indent}$$`)
      inDisplayMath = false
      continue
    }

    if (trimmed === "$$") {
      inDisplayMath = !inDisplayMath
    }
    normalized.push(line)
  }

  return normalized.join("\n")
}

export const Latex: QuartzTransformerPlugin<Partial<Options>> = (opts) => {
  const engine = opts?.renderEngine ?? "katex"
  const macros = opts?.customMacros ?? {}
  return {
    name: "Latex",
    textTransform(_ctx, src) {
      return normalizeDisplayMath(src)
    },
    markdownPlugins() {
      return [remarkMath, unwrapWhitespacePaddedSingleDollarMath]
    },
    htmlPlugins() {
      switch (engine) {
        case "katex": {
          return [[rehypeKatex, { output: "html", macros, ...(opts?.katexOptions ?? {}) }]]
        }
        case "typst": {
          return [[rehypeTypst, opts?.typstOptions ?? {}]]
        }
        default:
        case "mathjax": {
          return [
            [
              rehypeMathjax,
              {
                ...(opts?.mathJaxOptions ?? {}),
                tex: {
                  ...(opts?.mathJaxOptions?.tex ?? {}),
                  macros,
                },
              },
            ],
          ]
        }
      }
    },
    externalResources() {
      switch (engine) {
        case "katex":
          return {
            css: [{ content: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" }],
            js: [
              {
                // fix copy behaviour: https://github.com/KaTeX/KaTeX/blob/main/contrib/copy-tex/README.md
                src: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/copy-tex.min.js",
                loadTime: "afterDOMReady",
                contentType: "external",
              },
            ],
          }
      }
    },
  }
}
