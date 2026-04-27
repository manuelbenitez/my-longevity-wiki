// Extract structured Recipe data from markdown body so the JSON-LD schema can
// expose recipeIngredient (with quantities) and recipeInstructions (HowToStep).
// Required for Google Recipe rich results — frontmatter alone isn't enough.

export interface HowToStep {
  "@type": "HowToStep";
  text: string;
}

function extractSection(content: string, names: string[]): string | undefined {
  const targets = names.map((n) => n.toLowerCase());
  const lines = content.split("\n");
  let inSection = false;
  const collected: string[] = [];
  for (const line of lines) {
    const headerMatch = line.match(/^##\s+(.+?)\s*$/);
    if (headerMatch) {
      if (inSection) break;
      if (targets.includes(headerMatch[1].toLowerCase())) {
        inSection = true;
        continue;
      }
    }
    if (inSection) collected.push(line);
  }
  return inSection ? collected.join("\n").trim() : undefined;
}

export function extractIngredientLines(content: string): string[] | undefined {
  const section = extractSection(content, ["Ingredients"]);
  if (!section) return undefined;
  const items = section
    .split("\n")
    .filter((l) => /^[-*]\s/.test(l))
    .map((l) => l.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

export function extractInstructionSteps(content: string): HowToStep[] | undefined {
  const section = extractSection(content, ["Instructions", "Method", "Steps", "Directions"]);
  if (!section) return undefined;

  const blocks: string[] = [];
  let current = "";
  for (const line of section.split("\n")) {
    if (line.trim() === "---") break;
    if (/^\d+\.\s/.test(line)) {
      if (current.trim()) blocks.push(current);
      current = line;
    } else {
      current += "\n" + line;
    }
  }
  if (current.trim()) blocks.push(current);

  if (blocks.length === 0) return undefined;

  return blocks.map((block) => {
    const text = block
      .replace(/^\d+\.\s*/, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*([^*\n]+?)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
    return { "@type": "HowToStep", text };
  });
}
