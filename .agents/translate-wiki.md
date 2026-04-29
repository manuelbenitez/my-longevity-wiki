# Wiki page translation — session brief

You are translating enriched English ingredient wiki pages to Spanish. The English files have been fully enriched (1200–2000 words each with PubMed citations). The Spanish files exist but are outdated stubs. Your job is to replace each ES file with a complete, accurate Spanish translation of the current EN file.

## Repo

- Path: `/home/manuel/Development/my-longevity-wiki`
- English source: `content/wiki/en/{slug}.md`
- Spanish target: `content/wiki/es/{slug}.md`
- Each renders at `https://longevity.mbdev.to/es/ingredients/{slug}/`
- The site is Next.js 16 + static export. No dev server needed for content edits.

## Priority queue

Always start with the lowest-word-count Spanish files. Generate the list with:

```bash
cd /home/manuel/Development/my-longevity-wiki/content/wiki
for f in es/*.md; do wc -w < "$f" | tr -d '\n'; echo "  $f"; done | sort -n | head -20
```

Ignore aggregate/category pages with very generic slugs: `vegetables-general`, `seeds`, `tea-coffee-cocoa`, `whole-grains`, `nuts`, `green-vegetables`, `non-starchy-vegetables-fasting`, `fruits`, `beans`, `spinach-chard-beets`, `cabbage-broccoli`, `fish`, `white-meat`, `cereal`. Focus on **specific ingredients**.

## Per-page workflow

For each ingredient:

1. **Read** the current English file: `Read content/wiki/en/{slug}.md`
2. **Read** the current Spanish file: `Read content/wiki/es/{slug}.md` — note the existing translated title, tags, and any already-translated content to avoid regression
3. **Write** a complete Spanish translation to `content/wiki/es/{slug}.md`
4. **Verify** word count: `wc -w content/wiki/es/{slug}.md` — should be ≥900 words (Spanish translations run ~10% shorter than English due to prose compression)

## Translation rules

### Frontmatter
```yaml
---
title: {translated title in Spanish}
slug: {KEEP IDENTICAL to English — never change}
category: {KEEP IDENTICAL to English}
tags: [{translate each tag to Spanish kebab-case}]
longevity_score: {KEEP IDENTICAL}
last_updated: {today's date in YYYY-MM-DD}
---
```

### Body
- Translate all prose, section headers, table content, and labels to Spanish
- **Keep all PubMed/DOI URLs exactly as-is** — do not translate or alter hyperlinks
- Translate inline citation text (author names, journal names, year) but keep the URL unchanged:
  - English: `[Smith et al., 2020, *Nature*](https://pubmed.ncbi.nlm.nih.gov/12345/)`
  - Spanish: `[Smith et al., 2020, *Nature*](https://pubmed.ncbi.nlm.nih.gov/12345/)` — same link, same author/journal format (these are proper nouns, keep as-is)
- Translate the References section prose titles (bold paper titles) to Spanish
- **Keep scientific compound names in English/Latin** (sulforaphane, NF-κB, EGCG, EPA, DHA, etc.) — these are technical terms, not translated
- **Keep organism names in Latin** (*Lactobacillus*, *C. elegans*, etc.)
- Section headers: translate `## Why It Matters for Longevity` → `## Por Qué Importa para la Longevidad`, `## How to Use It` → `## Cómo Usarlo`, `## What to Pair It With` → `## Con Qué Combinarlo`, `## Flavor Profile` → `## Perfil de Sabor`, `## The Science` → `## La Ciencia`, `## References` → `## Referencias`, `## Key Nutrients` → `## Nutrientes Clave`, `## Dosage` → `## Dosis`

### Style
- Natural, fluent Spanish — not literal word-for-word translation
- Maintain the same voice: serious science journalism, not wellness-blogger tone
- Specific numbers and mechanisms must be preserved exactly
- Do not add or remove claims vs. the English source

## Commit instructions

After writing all files in a batch, commit each separately (no Co-Authored-By trailer):

```
feat(wiki/es): translate {slug} — full retranslation from enriched EN, {old}→{new} words
```

Use: `git -C /home/manuel/Development/my-longevity-wiki commit`

**Do NOT push** — the orchestrating agent pushes after the build passes.

## Build + push (orchestrator only)

After all agents in a batch complete:

```bash
timeout 180 bun run build 2>&1 | tail -5   # must succeed before pushing
git -C /home/manuel/Development/my-longevity-wiki push origin main
```

## Per-session output target

15 files per batch (5 agents × 3 files each). A good session is "shipped 45 translations, build passing, all pushed to main."

## Grouping suggestions for parallel agents

Group files by ingredient type so agents can share mental context:
- Seafood together (salmon, sardines, tuna)
- Leafy greens together (spinach, kale, chard)
- Legumes together (lentils, chickpeas, soybeans)
- Supplements together (vitamin D, vitamin K, magnesium)
- etc.

## After each commit

```bash
git push origin main
```

Vercel auto-deploys in ~90 seconds.

## Standing preferences

- No `Co-Authored-By:` trailer in commits
- Push directly to main, never open a PR
- Do not translate aggregate/category pages (wrong shape for enrichment)
- If a Spanish file is already ≥1000 words and was recently updated, skip it — check `last_updated` in frontmatter
