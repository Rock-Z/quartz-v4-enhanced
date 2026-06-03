import assert from "node:assert"
import test, { describe } from "node:test"
import { Root } from "mdast"
import remarkParse from "remark-parse"
import { unified } from "unified"
import { VFile } from "vfile"
import { Latex, normalizeDisplayMath } from "./latex"

const parseLatex = async (markdown: string) => {
  const processor = unified().use(remarkParse)
  for (const plugin of Latex().markdownPlugins!({} as any)) {
    processor.use(plugin as any)
  }

  const file = new VFile({ value: markdown })
  const tree = processor.parse(file)
  return (await processor.run(tree, file)) as Root
}

const inlineMathValues = (tree: Root) => {
  const values: string[] = []
  const collect = (node: any) => {
    if (node.type === "inlineMath") {
      values.push(node.value)
    }

    for (const child of node.children ?? []) {
      collect(child)
    }
  }

  collect(tree)
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

describe("normalizeDisplayMath", () => {
  test("puts multiline display math delimiters on standalone lines", () => {
    const input = ["before", "$$ x = y", "\\;=\\;", "z,$$", "## after"].join("\n")

    assert.equal(
      normalizeDisplayMath(input),
      ["before", "$$", "x = y", "\\;=\\;", "z,", "$$", "## after"].join("\n"),
    )
  })

  test("puts single-line display math delimiters on standalone lines", () => {
    assert.equal(normalizeDisplayMath("$$x + y$$"), ["$$", "x + y", "$$"].join("\n"))
  })

  test("does not normalize display math markers inside fenced code blocks", () => {
    const input = ["```md", "$$x + y$$", "```", "$$z$$"].join("\n")

    assert.equal(
      normalizeDisplayMath(input),
      ["```md", "$$x + y$$", "```", "$$", "z", "$$"].join("\n"),
    )
  })
})
