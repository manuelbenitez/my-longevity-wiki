# Design System — Longevity Wiki

## Product Context
- **What this is:** A minimalistic food encyclopedia grounded in longevity science
- **Who it's for:** Health-conscious people who cook, general audience interested in science-backed nutrition
- **Space/industry:** Food, nutrition, longevity science
- **Project type:** Static site (editorial wiki + recipe collection)
- **Source material:** "The Path to Longevity" by Luigi Fontana

## Aesthetic Direction
- **Direction:** Organic/Natural
- **Decoration level:** Minimal (typography and illustrations do all the work)
- **Mood:** Calm, scientific, warm. Like a beautifully typeset Japanese cookbook crossed with a botanical field guide. Aged paper and pressed herbs.
- **Key differentiator:** No photography. Hand-drawn SVG ingredient illustrations only. Every food site uses glossy photos. This one uses pen-and-ink.

## Typography
- **Display/Hero:** Fraunces (optical serif, warm and slightly quirky at large sizes, serious at small sizes)
- **Body:** Instrument Sans (clean, readable, neutral, slightly warmer than geometric sans-serifs)
- **UI/Labels:** Instrument Sans (same as body for consistency)
- **Data/Tables:** Instrument Sans tabular-nums
- **Code:** Not applicable (no code content)
- **Loading:** Google Fonts CDN
  - `https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Instrument+Sans:wght@400;500;600;700&display=swap`
- **Scale:**
  - Hero: 56px / Fraunces 300
  - H1: 42px / Fraunces 300
  - H2: 24-32px / Fraunces 400
  - H3: 20-22px / Fraunces 500
  - Body: 16px / Instrument Sans 400
  - Small: 14px / Instrument Sans 400
  - Label: 12px / Instrument Sans 500, uppercase, 0.05-0.15em letter-spacing

## Color
- **Approach:** Restrained. Color is rare and meaningful.
- **Background:** #F5F0EB (bone white, warm cream with the faintest blush)
- **Surface:** #FDFBF8 (cards, panels, slightly lighter than background)
- **Primary text:** #2C2418 (very dark warm brown, NOT black)
- **Muted text:** #8A7E6B (warm gray-brown for secondary info)
- **Accent:** #6B7F5E (sage green, the only accent color on the whole site)
- **Accent hover:** #557049 (darker sage)
- **Border/Divider:** #E5DDD3 (warm, barely visible)
- **Semantic:** success #6B7F5E, warning #C4963A, error #B85C4A

### CSS Custom Properties
```css
:root {
  --bg: #F5F0EB;
  --surface: #FDFBF8;
  --text: #2C2418;
  --muted: #8A7E6B;
  --accent: #6B7F5E;
  --accent-hover: #557049;
  --border: #E5DDD3;
  --success: #6B7F5E;
  --warning: #C4963A;
  --error: #B85C4A;
}
```

## Spacing
- **Base unit:** 8px
- **Density:** Spacious (editorial content, not a dashboard)
- **Scale:** xs(4) sm(8) md(16) lg(32) xl(48) 2xl(64) 3xl(96)

## Layout
- **Approach:** Editorial single-column for articles/recipes, grid for ingredient browsing
- **Article max-width:** 680px (optimal reading width)
- **Grid max-width:** 1200px
- **Ingredient grid:** `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`
- **Border radius:** sm:2px, md:4px, lg:8px (subtle, almost square, editorial feel)

## Motion
- **Approach:** Minimal-functional. Smooth, never bouncy.
- **Easing:** enter: ease-out, exit: ease-in, move: ease-in-out
- **Duration:** micro: 100ms, short: 200ms, medium: 300ms, long: 400ms
- **Page transitions:** opacity + translateY(8px) fade-up on content load

## SVG Illustration Spec
- **Style:** Single-color line art, hand-drawn feel with subtle irregularities
- **Color:** var(--text) (#2C2418)
- **Stroke width:** 1.5px
- **Stroke linecap:** round
- **Stroke linejoin:** round
- **ViewBox:** 0 0 64 64
- **Fills:** None (outlines only)
- **Naming:** `{ingredient-slug}.svg`
- **Location:** `public/icons/` or `assets/icons/`
- **Usage:** One SVG per ingredient, displayed on cards and article headers

## Component Patterns

### Buttons
- Primary: bg accent, text surface, radius-sm, 10px 24px padding
- Secondary: bg transparent, border 1px border color, radius-sm
- Ghost: no bg, no border, accent color text

### Ingredient Card
- Surface background, 1px border, radius-lg, 24px padding
- Centered: SVG icon, Fraunces h3, uppercase category label, accent score
- Hover: border-color transitions to accent

### Score Badge
- Inline-flex, bg accent, text surface, radius-sm, 4px 12px padding
- Font: 13px Instrument Sans 600

### Tags
- Inline-block, 1px border, radius-sm, 4px 10px padding
- Font: 12px Instrument Sans 500, muted color

### Tables (wiki)
- Full width within article column (680px max)
- Header: 12px uppercase, muted color, 2px bottom border
- Cells: 12px bottom border, 12px 16px padding

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-12 | Initial design system created | /design-consultation session. Bone-white + sage green + hand-drawn SVGs. |
| 2026-04-12 | No photography | Hand-drawn illustrations only. Differentiates from every food site. |
| 2026-04-12 | Sage green single accent | Says "longevity/nature" instead of appetite-stimulating reds/oranges. |
| 2026-04-12 | Fraunces + Instrument Sans | Warm editorial serif + clean sans. Matches cookbook meets field guide aesthetic. |
