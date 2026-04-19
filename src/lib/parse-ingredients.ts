export function parseIngredientLines(content: string): string[] {
  const section =
    content.split(/^## (?:Ingredients|Ingredientes)\b/m)[1]?.split(/^## /m)[0] ?? "";
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

const UNITS_EN =
  "tablespoons?|teaspoons?|tbsp\\.?|tsp\\.?|cups?|cloves?|cans?|fillets?|pieces?|bunche?s?|handfuls?|pinch(?:es)?|heads?|stalks?|sprigs?";
const UNITS_ES =
  "cucharadas?|cucharaditas?|tazas?|dientes?|latas?|filetes?|piezas?|rodajas?|ramitas?|trozos?|pu[nñ]ados?|hojas?|pizcas?|manojos?|cabezas?|tallos?|gajos?";
const UNITS_METRIC = "kg|ml|oz|lbs?|g(?=\\b)";
const UNITS = `${UNITS_EN}|${UNITS_ES}|${UNITS_METRIC}`;

const QTY_PREFIX = "(?:about|aproximadamente|unos|unas)\\s+";

// Matches a leading quantity + optional unit. Also matches unit-less quantifiers
// like "Pinch of" / "Pizca de" / "Large handful" / "Un puñado de".
const QTY_RE = new RegExp(
  `^((?:${QTY_PREFIX})?(?:(?:\\d+\\s+)?\\d+(?:[/.]\\d+)?(?:\\s*-\\s*\\d+(?:[/.]\\d+)?)?(?:[\\s-]*(?:${UNITS}))?\\s*(?:~)?\\s*(?:\\([^)]*\\))?|pinch(?:es)?\\s+of|pizca\\s+de|large\\s+handful|small\\s+handful|handful\\s+of?|(?:un(?:a)?\\s+)?manojo\\s+(?:grande|peque[nñ]o|de)|(?:un\\s+)?pu[nñ]ado\\s+(?:de|grande|peque[nñ]o)))\\s*`,
  "i"
);

export function parseShoppingLine(
  line: string,
  matchedSlug: string | null,
  localizedName: string | null = null
): { name: string; quantity: string } {
  const match = line.match(QTY_RE);
  const quantity = match?.[1]?.trim() ?? "";
  let afterQty = match ? line.slice(match[0].length) : line;
  afterQty = afterQty.replace(/^de\s+/i, "");

  let name: string;
  if (matchedSlug && localizedName) {
    name = localizedName;
  } else if (matchedSlug) {
    name = matchedSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } else {
    name = afterQty
      .split(/,\s*|--\s*/)[0]
      .replace(/\s*\((?:optional|opcional)\)/gi, "")
      .replace(/\s+for\s+serving\b.*/i, "")
      .replace(/\s+para\s+servir\b.*/i, "")
      .trim();
    if (name) name = name.charAt(0).toUpperCase() + name.slice(1);
    if (!name) name = line.split(/,\s*/)[0].trim();
  }

  return { name, quantity };
}
