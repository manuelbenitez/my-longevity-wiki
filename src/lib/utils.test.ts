import { describe, it, expect } from "vitest";
import { groupByFirstLetter, sortItems } from "./utils";

const items = (titles: string[]) => titles.map((t) => ({ title: t }));

describe("groupByFirstLetter", () => {
  it("groups items by first letter", () => {
    const grouped = groupByFirstLetter(items(["Apple", "Avocado", "Broccoli"]));
    expect(grouped.get("A")?.map((i) => i.title)).toEqual(["Apple", "Avocado"]);
    expect(grouped.get("B")?.map((i) => i.title)).toEqual(["Broccoli"]);
  });

  it("returns empty Map for empty array", () => {
    expect(groupByFirstLetter([]).size).toBe(0);
  });

  it("puts number-starting titles under #", () => {
    const grouped = groupByFirstLetter(items(["3-Seed Mix", "Apple"]));
    expect(grouped.get("#")?.map((i) => i.title)).toEqual(["3-Seed Mix"]);
  });

  it("normalizes accented letters (Ñ → N)", () => {
    const grouped = groupByFirstLetter(items(["Ñame", "Nuez"]));
    expect(grouped.get("N")?.length).toBe(2);
  });
});

describe("sortItems", () => {
  it("alpha sort produces A→Z order", () => {
    const sorted = sortItems(items(["Zucchini", "Apple", "Miso"]), "alpha");
    expect(sorted.map((i) => i.title)).toEqual(["Apple", "Miso", "Zucchini"]);
  });

  it("score sort produces descending order", () => {
    const scored = [
      { title: "A", longevity_score: 5 },
      { title: "B", longevity_score: 9 },
      { title: "C", longevity_score: 2 },
    ];
    const sorted = sortItems(scored, "score");
    expect(sorted.map((i) => i.longevity_score)).toEqual([9, 5, 2]);
  });

  it("default sort preserves original order", () => {
    const original = items(["Zucchini", "Apple", "Miso"]);
    expect(sortItems(original, "default")).toBe(original);
  });

  it("handles items without longevity_score in score sort", () => {
    const mixed = [
      { title: "A", longevity_score: 7 },
      { title: "B" },
      { title: "C", longevity_score: 3 },
    ];
    const sorted = sortItems(mixed, "score");
    expect(sorted[0].title).toBe("A");
    expect(sorted[2].title).toBe("B");
  });
});
