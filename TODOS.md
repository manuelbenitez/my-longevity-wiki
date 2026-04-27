# TODOS

## Strategy / Brand

### Rename around symptom-to-food
**What:** Rename the app away from "Longevity Wiki" to a name that fits the symptom-to-food + recipe job. Pivot the homepage entry point from "browse longevity ingredients" to "tell us how you feel, get a recipe."
**Why:** "Longevity" is insider vocabulary — small audience, low search intent. The symptom-to-food job (already a roadmap item) has 100x the search demand: "foods for bloating," "what to eat for fatigue," "anti-inflammatory recipes," etc. The current name actively prevents the rebrand. JTBD says name the job, not the meta-category.
**Pros:** Aligns the brand with the highest-volume intent class. Recipes get framed as remedies (anchoring → higher perceived value). Removes the curse-of-knowledge gap with non-longevity-curious users — i.e., almost everyone. Compounding benefit: every new page targets a query class that actually has volume.
**Cons:** Throws away accumulated brand equity in "Longevity Wiki" (modest given indexation state). Risks losing the literary/research credibility if the new name skews wellness-app. Requires redirects and a careful canonical migration so SEO doesn't reset.
**Context:** Marketing-psychology naming session + competitive research 2026-04-27. Three rounds of candidates, each filtered against live competition.

**Round 1 (rejected after research):**
- **Apothecary** — too crowded (thekitchenapothecary.com, outdoorapothecary.com, theamazonapothecary.com, apothekary.com /recipes portal, theapothecary.app taken by beauty brand, 5+ books). Generic word, undefendable.
- **Foodnote** — too phonetically close to **Foodnoms** (live AI nutrition tracker with 9to5Mac coverage). Brand confusion risk.
- **Forager** — owned by James Beard winner Forager Chef + Backyard Forager.
- **Almanac** — Old Farmer's Almanac dominates.
- **Larder** — two established food blogs (Larder Love, Jo's Kitchen Larder).

**Round 2 — niche reality check:**
The pure symptom-to-food category is *not* empty. **Symptom To Spoon** (Android, live, AI-driven, Pro tier) does the literal pivot. Food-diary cluster — mySymptoms (1M+ users), GutDiaries, Foody — tracks the inverse (food → triggers). Healthline / WebMD / Mayo dominate "foods for X" head SEO at DR 90+ vs ours ~5. The category isn't a moat — the moat is the **differentiators**: PubMed-cited claims, hand-written recipes, open source, ad-free, donation-funded, bilingual. Name must signal *that*.

**Round 3 — finalists (clean lanes after research):**

1. **Materia** ⭐ recommended. Zero food/recipe collisions. From *materia medica* — the historical academic discipline of "which substances heal which conditions." That's literally what this site is, open-sourced. Sounds institutional + warm. Same word in EN and ES (same pronunciation, same meaning) — solves bilingual double-naming. Short, distinctive, brandable. Tagline: *"Food as medicine. Cited."*

2. **Dossier** — also zero collisions. Frames each ingredient as a research file. Accessible (every English speaker knows it), investigative tone. Tagline: *"Every food has a dossier."* Weaker bilingual fit (different connotations in ES).

3. **Receipts** — minimal collisions. Killer double-meaning (1700s English for "recipe" + modern slang for "proof/evidence"). Risk: financial-receipt UX confusion. Tagline: *"Recipes with the receipts."*

**Recommendation: Materia.** Cleanest lane + most meaningful etymology + bilingual-native. The longevity research stays as the substrate (every claim still PubMed-backed); the framing shifts from "longevity wiki" to "the open materia medica."
**Effort:** L (new domain + name + every page string + redirect plan + opengraph/og-image refresh + 301s from longevity.mbdev.to → new domain). With CC: M.
**Priority:** P2 — strategic, not blocking
**Depends on:** "Symptom to food" roadmap item (in-progress). Don't rename until that feature is real, or the name overpromises.

---

## Meal Planner — v2 Items

### Weekly longevity protocol tracker
**What:** Show cumulative coverage across all meal plans ever suggested — "over the past 4 weeks, your family has cooked with 31 of 37 longevity ingredients."
**Why:** The triedSlugs data foundation ships in v1. The display layer is a separate feature that makes the health-protocol angle genuinely compelling over time.
**Pros:** Transforms the meal planner from a weekly grocery tool into a long-term health tracker. Highly shareable.
**Cons:** Requires rethinking the coverage bar semantics (current plan vs. all-time). Needs careful UX so it doesn't feel like surveillance.
**Context:** triedSlugs is stored in localStorage as a persistent slug set. The weekly tracker would aggregate this into a coverage timeline. Start by displaying all-time coverage separately from current-plan coverage.
**Effort:** M → with CC: S
**Priority:** P2
**Depends on:** meal-planner v1 shipped

---

### Coverage synonym normalization
**What:** Merge synonymous ingredient slugs in the coverage counter — "olive-oil" and "extra-virgin-olive-oil" are the same ingredient. Same for "berries"/"blueberries".
**Why:** The raw unique slug count is slightly inflated. Normalization makes the "X of 37 longevity ingredients" number genuinely accurate.
**Pros:** More honest coverage number. Cleaner data model.
**Cons:** Requires a synonym map that needs manual curation and maintenance.
**Context:** The coverage counter uses `new Set(selectedRecipes.flatMap(r => r.longevity_ingredients)).size`. A normalization layer would canonicalize synonyms before the Set is built.
**Effort:** S → with CC: XS
**Priority:** P3
**Depends on:** meal-planner v1 shipped

---

### Cross-device triedSlugs sync
**What:** Let users pass their triedSlugs history between devices without an account — via a `?tried=slug1,slug2` URL param they can bookmark or share.
**Why:** localStorage is per-browser. If you use the planner on phone + laptop you see different tried histories. This solves it without requiring login.
**Pros:** Cross-device continuity without auth. Can be combined with the plan share URL.
**Cons:** URL gets long if many slugs are tried. 24 slugs max = manageable.
**Context:** The plan URL already has `?recipes=` and `?servings=`. Adding `?tried=` follows the same pattern. triedSlugs hydration from URL would happen alongside the existing URL hydration in useEffect.
**Effort:** S → with CC: XS
**Priority:** P3
**Depends on:** meal-planner v1 shipped, shareable plan URL shipped

---

## A11y & Design Debt

### Muted text contrast fails WCAG AA
**What:** `--muted #8A7E6B` on `--bg #F5F0EB` is ~3.5:1 contrast. WCAG AA requires 4.5:1 for body text. Every page using `text-muted` for descriptive copy is affected (support page, ingredient pages, recipe pages).
**Why:** Real accessibility debt. Low-vision users and anyone in bright sunlight will struggle with muted text.
**Pros:** Genuine a11y win. Darkening `--muted` to ~`#6D6150` would hit ~4.6:1 without changing the warm-brown character of the palette.
**Cons:** Touches a global token. Every muted text instance needs visual QA. Some existing designs may rely on the softer color for hierarchy separation.
**Context:** Discovered during the /plan-design-review of the support-page roadmap. `--muted` is used for: secondary body text, small labels, "Where your donation goes" descriptions, ingredient card category labels, recipe meta info. Changing the token is a 1-line CSS edit but a visual-regression pass on several pages.
**Effort:** S → with CC: XS (token change) + visual QA pass
**Priority:** P2
**Depends on:** nothing

---

### Roadmap "Recently shipped" collapsed sub-section
**What:** When the first roadmap item flips to "Shipped," show a collapsed `<details>` sub-section below the "What's next" list titled "Recently shipped," containing the past items with sage "Shipped ✓" pills.
**Why:** Keeps the roadmap focused on what's next, while preserving evidence that donations moved the needle over time. Turns the roadmap into a living receipt.
**Pros:** Strongest long-term trust-building pattern on the support page. Donors who come back see their previous contributions materialized.
**Cons:** Needs a small amount of logic (status field per item + conditional render). Designer must specify the collapsed-state styling at trigger time.
**Context:** Decided during /plan-design-review. At launch there are no Shipped items, so no code is needed. When the in-progress hand-drawn illustrations milestone completes, the implementer adds a second list beneath the roadmap using the same editorial vertical-list pattern but wrapped in `<details>` with a muted summary like "Recently shipped — 3 items."
**Effort:** S → with CC: XS
**Priority:** P3
**Depends on:** support-page roadmap shipped, first roadmap item marked Shipped
