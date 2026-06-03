import test, { describe } from "node:test"
import assert from "node:assert"
import { unified } from "unified"
import remarkParse from "remark-parse"
import { Root } from "mdast"
import { visit } from "unist-util-visit"
import { Latex } from "./latex"

const parseLatex = async (markdown: string) => {
  const processor = unified().use(remarkParse)
  for (const plugin of Latex().markdownPlugins!({} as any)) {
    processor.use(plugin as any)
  }

  const tree = processor.parse(markdown)
  return (await processor.run(tree)) as Root
}

const inlineMathValues = (tree: Root) => {
  const values: string[] = []
  visit(tree, "inlineMath", (node: { value: string }) => values.push(node.value))
  return values
}

const paragraphText = (tree: Root) => {
  const paragraph = tree.children[0] as any
  return paragraph.children.map((node: { value?: string }) => node.value ?? "").join("")
}

describe("Latex", () => {
  test("does not parse single-dollar spans padded by whitespace as math", async () => {
    const markdown = "closed GPT 5.5 7.1$ per hour for CoT, $24 per hr for agent"
    const tree = await parseLatex(markdown)

    assert.deepStrictEqual(inlineMathValues(tree), [])
    assert.strictEqual(paragraphText(tree), markdown)
  })

  test("does not parse currency-like single-dollar amounts as math", async () => {
    const markdown = "price is $24 and another $30"
    const tree = await parseLatex(markdown)

    assert.deepStrictEqual(inlineMathValues(tree), [])
    assert.strictEqual(paragraphText(tree), markdown)
  })

  test("still parses standard single-dollar inline math", async () => {
    const tree = await parseLatex("inline $x + y$ math")

    assert.deepStrictEqual(inlineMathValues(tree), ["x + y"])
  })

  test("still parses display math", async () => {
    const tree = await parseLatex("$$\nx + y\n$$")

    assert.strictEqual(tree.children[0].type, "math")
  })
})
