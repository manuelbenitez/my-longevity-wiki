# Icon generation runbook

How to regenerate the wiki ingredient icons via the OpenAI Image API.

## Setup (once)

```bash
bun add openai
```

Get an OpenAI API key at https://platform.openai.com/api-keys and add credit
(~$15 covers all 212 icons + regen overhead). Then create `.env.local` at the
repo root:

```
OPENAI_API_KEY=sk-...
```

`.env.local` is already in `.gitignore`.

## Generate

```bash
# sanity check: 5 icons, dry run first
bun run scripts/icons/generate.ts --limit 5 --dry-run
bun run scripts/icons/generate.ts --limit 5

# generate all missing
bun run scripts/icons/generate.ts

# force regenerate specific slugs (after rejecting them)
bun run scripts/icons/generate.ts --regen kale,broccoli,salmon

# only generate specific slugs (skip if exist)
bun run scripts/icons/generate.ts --only tahini,miso

# higher quality (4x cost)
bun run scripts/icons/generate.ts --quality high
```

Outputs land in `public/icons/{slug}.webp` (192x192 opaque WEBP).
Raw 1024x1024 PNGs go to `scripts/icons/raw/{slug}.png` (gitignored, kept for
re-encoding without a fresh API call).

## Cost reference

| Quality | Per image | 212 icons |
|---------|-----------|-----------|
| low     | $0.011    | $2.30     |
| medium  | $0.042    | $8.90     |
| high    | $0.167    | $35.00    |

Default is medium.

## Review loop

After a batch:

1. Open `public/icons/` in a file browser, eyeball at thumbnail size.
2. Note slugs that didn't render well (paper texture leaked through, hatching
   too dense, anatomy wrong).
3. `bun run scripts/icons/generate.ts --regen <bad-slug-1>,<bad-slug-2>`.
4. The script overwrites; raw PNGs in `scripts/icons/raw/` get replaced too.

## Cutover

Once all 212 WEBPs are in `public/icons/`:

1. Delete the 204 old `.svg` files: `rm public/icons/*.svg`
2. Update `src/components/ingredient-grid.tsx:186` from
   `` `/icons/${entry.slug}.svg` `` to `` `/icons/${entry.slug}.webp` ``.
3. `bun run dev`, click through `/ingredients`, confirm everything renders.
4. Single commit with all of: new WEBPs, deleted SVGs, code change.

## Single new ingredient (post-cutover, ongoing)

When you add a new wiki entry at `content/wiki/en/{new-slug}.md`:

```bash
bun run scripts/icons/generate.ts --only new-slug
```

That's it.
