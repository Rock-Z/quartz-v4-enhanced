import assert from "node:assert"
import test, { describe } from "node:test"
import { normalizeDisplayMath } from "./latex"

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
