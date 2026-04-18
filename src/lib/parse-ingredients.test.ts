import { describe, it, expect } from "vitest";
import { parseIngredientLines } from "./parse-ingredients";

describe("parseIngredientLines", () => {
  it("parses basic bullet list", () => {
    const content = `## Ingredients\n\n- 400g spaghetti\n- 3 cloves garlic\n\n## Instructions`;
    expect(parseIngredientLines(content)).toEqual(["400g spaghetti", "3 cloves garlic"]);
  });

  it("ignores lines before ## Ingredients", () => {
    const content = `- Not an ingredient\n## Ingredients\n\n- real ingredient\n`;
    expect(parseIngredientLines(content)).toEqual(["real ingredient"]);
  });

  it("stops at the next ## section", () => {
    const content = `## Ingredients\n\n- item a\n- item b\n\n## Instructions\n\n- not an ingredient`;
    expect(parseIngredientLines(content)).toEqual(["item a", "item b"]);
  });

  it("strips bold markdown from ingredient lines", () => {
    const content = `## Ingredients\n\n- **400g** whole wheat flour\n`;
    expect(parseIngredientLines(content)).toEqual(["400g whole wheat flour"]);
  });

  it("skips ### subsection headers inside Ingredients block", () => {
    const content = `## Ingredients\n\n### The Base\n- 1 cup oats\n\n### Topping\n- 2 tbsp honey\n`;
    expect(parseIngredientLines(content)).toEqual(["1 cup oats", "2 tbsp honey"]);
  });

  it("handles indented bullet lines", () => {
    const content = `## Ingredients\n\n  - indented item\n`;
    expect(parseIngredientLines(content)).toEqual(["indented item"]);
  });

  it("returns empty array when no Ingredients section", () => {
    const content = `## Instructions\n\n- not ingredients\n`;
    expect(parseIngredientLines(content)).toEqual([]);
  });

  it("handles parenthetical notes in ingredient lines", () => {
    const content = `## Ingredients\n\n- 1kg mussels (serves 2 as main, 4 as starter)\n`;
    expect(parseIngredientLines(content)).toEqual(["1kg mussels (serves 2 as main, 4 as starter)"]);
  });

  it("handles complex time annotations without breaking", () => {
    const content = `## Ingredients\n\n- 250g chickpea flour\n- 500ml cold water\n`;
    const result = parseIngredientLines(content);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe("250g chickpea flour");
  });
});
