export function parseIngredientLines(content: string): string[] {
  const section = content.split(/^## Ingredients/m)[1]?.split(/^## /m)[0] ?? "";
  return section
    .split("\n")
    .filter((line) => line.trimStart().startsWith("- "))
    .map((line) =>
      line
        .replace(/^[\s-]+/, "")
        .replace(/\*\*/g, "")
        .trim()
    )
    .filter(Boolean);
}

// Matches leading quantity: "6 cloves", "1 1/2 cups (300g)", "400g", "Pinch of", "Large handful"
const QTY_RE =
  /^((?:about\s+)?(?:(?:\d+\s+)?\d+(?:[/.]\d+)?(?:\s*-\s*\d+(?:[/.]\d+)?)?(?:[\s-]*(?:tablespoons?|teaspoons?|tbsp\.?|tsp\.?|cups?|cloves?|cans?|fillets?|pieces?|bunche?s?|handfuls?|pinch(?:es)?|heads?|stalks?|sprigs?|kg|ml|oz|lbs?|g(?=\b)))?\s*(?:~)?\s*(?:\([^)]*\))?|pinch(?:es)?\s+of|large\s+handful|small\s+handful|handful\s+of?))\s*/i;

export function parseShoppingLine(
  line: string,
  matchedSlug: string | null
): { name: string; quantity: string } {
  const match = line.match(QTY_RE);
  const quantity = match?.[1]?.trim() ?? "";
  const afterQty = match ? line.slice(match[0].length) : line;

  let name: string;
  if (matchedSlug) {
    name = matchedSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } else {
    name = afterQty
      .split(/,\s*|--\s*/)[0]
      .replace(/\s*\(optional\)/gi, "")
      .replace(/\s+for\s+serving\b.*/i, "")
      .trim();
    if (name) name = name.charAt(0).toUpperCase() + name.slice(1);
    if (!name) name = line.split(/,\s*/)[0].trim();
  }

  return { name, quantity };
}
