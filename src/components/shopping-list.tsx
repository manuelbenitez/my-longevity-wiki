"use client";

import { useMemo, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import type { RecipeForPlanner } from "@/lib/meal-planner-reducer";
import { parseShoppingLine } from "@/lib/parse-ingredients";

interface ShoppingItem {
  name: string;
  quantity: string;
  line: string;
  matchedSlug: string | null;
  recipeTitle: string;
  recipeSlug: string;
}

interface GroupedItem {
  name: string;
  matchedSlug: string | null;
  quantities: string[];
  recipeNames: string[];
  checkKey: string;
}

const UNIT_NORM: Record<string, string> = {
  tablespoon: "tablespoon", tablespoons: "tablespoon", tbsp: "tablespoon", "tbsp.": "tablespoon",
  teaspoon: "teaspoon", teaspoons: "teaspoon", tsp: "teaspoon", "tsp.": "teaspoon",
  cup: "cup", cups: "cup",
  clove: "clove", cloves: "clove",
  g: "g", gram: "g", grams: "g",
  ml: "ml", milliliter: "ml", milliliters: "ml",
  oz: "oz", ounce: "oz", ounces: "oz",
  lb: "lb", lbs: "lb", pound: "lb", pounds: "lb",
  kg: "kg",
  fillet: "fillet", fillets: "fillet",
  can: "can", cans: "can",
  piece: "piece", pieces: "piece",
  bunch: "bunch", bunches: "bunch",
  head: "head", heads: "head",
  stalk: "stalk", stalks: "stalk",
  sprig: "sprig", sprigs: "sprig",
  cucharada: "cucharada", cucharadas: "cucharada",
  cucharadita: "cucharadita", cucharaditas: "cucharadita",
  taza: "taza", tazas: "taza",
  diente: "diente", dientes: "diente",
  lata: "lata", latas: "lata",
  filete: "filete", filetes: "filete",
  pieza: "pieza", piezas: "pieza",
  rodaja: "rodaja", rodajas: "rodaja",
  ramita: "ramita", ramitas: "ramita",
  trozo: "trozo", trozos: "trozo",
  puñado: "puñado", puñados: "puñado",
  punado: "puñado", punados: "puñado",
  hoja: "hoja", hojas: "hoja",
  pizca: "pizca", pizcas: "pizca",
  manojo: "manojo", manojos: "manojo",
  cabeza: "cabeza", cabezas: "cabeza",
  tallo: "tallo", tallos: "tallo",
  gajo: "gajo", gajos: "gajo",
};

const UNIT_PLURAL: Record<string, string> = {
  tablespoon: "tablespoons", teaspoon: "teaspoons", cup: "cups",
  clove: "cloves", fillet: "fillets", can: "cans", piece: "pieces",
  bunch: "bunches", head: "heads", stalk: "stalks", sprig: "sprigs",
  cucharada: "cucharadas", cucharadita: "cucharaditas", taza: "tazas",
  diente: "dientes", lata: "latas", filete: "filetes", pieza: "piezas",
  rodaja: "rodajas", ramita: "ramitas", trozo: "trozos", puñado: "puñados",
  hoja: "hojas", pizca: "pizcas", manojo: "manojos", cabeza: "cabezas",
  tallo: "tallos", gajo: "gajos",
};

function normalizeUnit(u: string): string {
  return UNIT_NORM[u.toLowerCase()] ?? u.toLowerCase();
}

function displayUnit(norm: string, total: number): string {
  if (total === 1) return norm;
  return UNIT_PLURAL[norm] ?? norm;
}

function parseQty(qty: string): { amount: number; unit: string } | null {
  const clean = qty.replace(/\([^)]*\)/g, "").replace(/^(?:about|aproximadamente|unos|unas)\s+/i, "").trim();
  if (/^\d+\s*-\s*\d+/.test(clean)) return null; // ranges not summable
  let m = clean.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)/);
  if (m) return { amount: parseInt(m[1]) + parseInt(m[2]) / parseInt(m[3]), unit: m[4].trim().toLowerCase() };
  m = clean.match(/^(\d+)\/(\d+)\s*(.*)/);
  if (m) return { amount: parseInt(m[1]) / parseInt(m[2]), unit: m[3].trim().toLowerCase() };
  m = clean.match(/^(\d+(?:\.\d+)?)\s*(.*)/);
  if (m) return { amount: parseFloat(m[1]), unit: m[2].trim().toLowerCase() };
  return null;
}

function formatAmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const whole = Math.floor(n);
  const frac = n - whole;
  const fracs: [number, string][] = [[1/4,"1/4"],[1/3,"1/3"],[1/2,"1/2"],[2/3,"2/3"],[3/4,"3/4"]];
  for (const [v, s] of fracs) {
    if (Math.abs(frac - v) < 0.02) return whole > 0 ? `${whole} ${s}` : s;
  }
  return n.toFixed(1).replace(/\.0$/, "");
}

function sumQuantities(quantities: string[]): string {
  if (quantities.length === 0) return "";
  if (quantities.length === 1) return quantities[0];
  const parsed = quantities.map(parseQty);
  if (parsed.some((p) => p === null)) return quantities.join(", ");
  const normUnits = parsed.map((p) => normalizeUnit(p!.unit));
  if (new Set(normUnits).size !== 1) return quantities.join(", ");
  const total = parsed.reduce((s, p) => s + p!.amount, 0);
  const unit = displayUnit(normUnits[0], total);
  return unit ? `${formatAmt(total)} ${unit}` : formatAmt(total);
}

function findBestSlug(
  line: string,
  slugs: string[],
  wikiTitles: Record<string, string>
): string | null {
  const lower = line.toLowerCase();
  let best: { slug: string; len: number } | null = null;
  for (const slug of slugs) {
    const terms: string[] = [slug.replace(/-/g, " ")];
    const title = wikiTitles[slug];
    if (title) terms.push(title);
    for (const term of terms) {
      if (!term) continue;
      if (lower.includes(term.toLowerCase())) {
        if (!best || term.length > best.len) {
          best = { slug, len: term.length };
        }
      }
    }
  }
  return best?.slug ?? null;
}

interface Props {
  recipes: RecipeForPlanner[];
  wikiCategories: Record<string, string>;
  wikiTitles: Record<string, string>;
  servings: number;
  onCopyText: (text: string) => void;
  copyStatus: "idle" | "copied" | "failed";
}

export function ShoppingList({
  recipes,
  wikiCategories,
  wikiTitles,
  servings: _servings,
  onCopyText,
  copyStatus,
}: Props) {
  const t = useTranslations("meal_planner");
  const tCat = useTranslations("categories");
  const locale = useLocale();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const getCategoryLabel = useCallback((key: string): string => {
    try {
      return tCat(key as Parameters<typeof tCat>[0]);
    } catch {
      return key;
    }
  }, [tCat]);

  const toggle = useCallback((key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const sections = useMemo(() => {
    const flat = new Map<string, ShoppingItem[]>();

    for (const recipe of recipes) {
      for (const line of recipe.ingredientLines) {
        const matchedSlug = findBestSlug(line, recipe.longevity_ingredients, wikiTitles);
        const category = (matchedSlug ? wikiCategories[matchedSlug] : null) ?? "other";
        if (!flat.has(category)) flat.set(category, []);
        const localizedName = matchedSlug ? wikiTitles[matchedSlug] ?? null : null;
        const { name, quantity } = parseShoppingLine(line, matchedSlug, localizedName);
        flat.get(category)!.push({ name, quantity, line, matchedSlug, recipeTitle: recipe.title, recipeSlug: recipe.slug });
      }
    }

    // Group by name within each category, items sorted alphabetically
    const grouped = new Map<string, GroupedItem[]>();
    for (const [category, items] of flat) {
      const byName = new Map<string, GroupedItem>();
      for (const item of items) {
        const key = item.name.toLowerCase();
        if (!byName.has(key)) {
          byName.set(key, {
            name: item.name,
            matchedSlug: item.matchedSlug,
            quantities: [],
            recipeNames: [],
            checkKey: `${category}::${key}`,
          });
        }
        const g = byName.get(key)!;
        if (item.quantity) g.quantities.push(item.quantity);
        if (!g.recipeNames.includes(item.recipeTitle)) g.recipeNames.push(item.recipeTitle);
      }
      const sorted = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
      grouped.set(category, sorted);
    }

    // Sort categories alphabetically, "other" always last
    const sortedKeys = [...grouped.keys()].sort((a, b) => {
      if (a === "other") return 1;
      if (b === "other") return -1;
      return getCategoryLabel(a).localeCompare(getCategoryLabel(b));
    });

    const result = new Map<string, GroupedItem[]>();
    for (const key of sortedKeys) result.set(key, grouped.get(key)!);
    return result;
  }, [recipes, wikiCategories, wikiTitles, getCategoryLabel]);

  const copyText = [...sections.entries()].flatMap(([category, items]) => {
    if (items.length === 0) return [];
    const header = getCategoryLabel(category).toUpperCase();
    const lines = items.map((item) => {
      const qty = sumQuantities(item.quantities);
      return qty ? `- ${item.name} (${qty})` : `- ${item.name}`;
    });
    return [`${header}\n${lines.join("\n")}`];
  }).join("\n\n");

  const hasItems = recipes.some((r) => r.ingredientLines.length > 0);

  if (!hasItems) return null;

  return (
    <div className="mt-10 print:mt-4">
      <h2 className="font-display text-2xl font-light mb-6 print:text-xl">
        {t("shopping_list_title")}
      </h2>

      <div className="space-y-8 print:space-y-4">
        {[...sections.entries()].map(([category, items]) => {
          if (items.length === 0) return null;
          return (
            <div key={category}>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
                {getCategoryLabel(category)}
              </h3>
              <ul className="space-y-1">
                {items.map((item) => {
                  const done = checked.has(item.checkKey);
                  return (
                    <li
                      key={item.checkKey}
                      onClick={() => toggle(item.checkKey)}
                      className={`flex items-start gap-3 text-sm cursor-pointer select-none -mx-2 px-2 py-1 rounded-md transition-colors ${
                        done ? "opacity-40" : "hover:bg-black/[0.03]"
                      } print:hover:bg-transparent print:cursor-default`}
                    >
                      <span
                        className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          done ? "bg-accent border-accent" : "border-border"
                        }`}
                      >
                        {done && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>

                      <span className="flex-1">
                        <span className={done ? "line-through" : ""}>
                          {item.matchedSlug ? (
                            <Link
                              href={`/${locale}/ingredients/${item.matchedSlug}/`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-accent hover:underline visited:text-muted !border-none transition-colors"
                            >
                              {item.name}
                            </Link>
                          ) : (
                            <span>{item.name}</span>
                          )}
                          {item.quantities.length > 0 && (
                            <span className="text-muted"> ({sumQuantities(item.quantities)})</span>
                          )}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex gap-3 print:hidden">
        <button
          onClick={() => onCopyText(copyText)}
          className="px-4 py-2 text-sm font-medium bg-accent text-white rounded hover:bg-accent-hover transition-colors"
        >
          {copyStatus === "copied"
            ? t("copied")
            : copyStatus === "failed"
            ? t("copy_failed")
            : t("copy_button")}
        </button>
      </div>
    </div>
  );
}
