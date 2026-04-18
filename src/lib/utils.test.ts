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
  it("asc sort produces A→Z order", () => {
    const sorted = sortItems(items(["Zucchini", "Apple", "Miso"]), "asc");
    expect(sorted.map((i) => i.title)).toEqual(["Apple", "Miso", "Zucchini"]);
  });

  it("desc sort produces Z→A order", () => {
    const sorted = sortItems(items(["Apple", "Miso", "Zucchini"]), "desc");
    expect(sorted.map((i) => i.title)).toEqual(["Zucchini", "Miso", "Apple"]);
  });

  it("does not mutate the original array", () => {
    const original = items(["Zucchini", "Apple"]);
    sortItems(original, "asc");
    expect(original[0].title).toBe("Zucchini");
  });
});
