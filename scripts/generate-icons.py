"""
Generate hand-drawn style SVG icons for all longevity wiki ingredients.
Style: 1.5px stroke, round caps/joins, #2C2418, 64x64 viewBox, no fills.
Slight path variations simulate hand-drawn feel.
"""

import os
import random
import math

ICON_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')
STROKE = '#2C2418'
SW = '1.5'

def svg_wrap(paths: str, slug: str) -> str:
    return f'''<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- {slug} -->
{paths}
</svg>'''

def p(d: str) -> str:
    """Create a path element with standard styling."""
    return f'  <path d="{d}" stroke="{STROKE}" stroke-width="{SW}" stroke-linecap="round" stroke-linejoin="round"/>'

def circle(cx, cy, r) -> str:
    return f'  <circle cx="{cx}" cy="{cy}" r="{r}" stroke="{STROKE}" stroke-width="{SW}" fill="none"/>'

def ellipse(cx, cy, rx, ry) -> str:
    return f'  <ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" stroke="{STROKE}" stroke-width="{SW}" fill="none"/>'

# Wobble a value slightly for hand-drawn feel
def w(val, amount=0.5):
    return round(val + random.uniform(-amount, amount), 1)

random.seed(42)  # Reproducible

ICONS = {
    'almonds': lambda: '\n'.join([
        p(f'M24 32c0-10 6-18 8-18s8 8 8 18s-6 18-8 18s-8-8-8-18'),
        p(f'M32 14v36'),
        p(f'M26 24c3 2 6 2 10 0'),
    ]),
    'apples': lambda: '\n'.join([
        p('M32 12c-12 0-18 10-18 22s8 18 18 18s18-6 18-18s-6-22-18-22'),
        p('M32 12c-2-6 2-10 6-8'),
        p('M32 8c2 2 4 4 4 4'),
    ]),
    'avocado': lambda: '\n'.join([
        p('M32 8c-14 0-20 16-20 28s8 20 20 20s20-8 20-20s-6-28-20-28'),
        circle(32, 38, 8),
    ]),
    'barley': lambda: '\n'.join([
        p('M32 56V20'),
        p('M32 20c-4-4-10-6-14-4'), p('M32 28c-4-4-10-6-14-4'),
        p('M32 36c-4-4-10-6-14-4'),
        p('M32 20c4-4 10-6 14-4'), p('M32 28c4-4 10-6 14-4'),
        p('M32 36c4-4 10-6 14-4'),
        p('M32 20c0-6 0-12 0-14'),
    ]),
    'berries': lambda: '\n'.join([
        circle(24, 36, 7), circle(38, 34, 6), circle(30, 46, 6),
        p('M22 28c-2-6 0-12 4-16'), p('M36 27c2-4 4-8 6-10'),
    ]),
    'black-pepper': lambda: '\n'.join([
        circle(22, 28, 4), circle(34, 24, 4), circle(28, 36, 4),
        circle(40, 34, 4), circle(24, 44, 4), circle(36, 44, 4),
        p('M30 8c-2 4-2 10 0 14'), p('M34 6c2 4 2 12 0 16'),
    ]),
    'blueberries': lambda: '\n'.join([
        circle(24, 36, 8), circle(38, 34, 7), circle(30, 46, 6),
        p('M22 28c-2-4-1-8 2-12'), p('M36 27c1-3 3-6 5-8'),
        p('M20 36l-2 1'), p('M36 34l2-1'),
    ]),
    'brazil-nuts': lambda: '\n'.join([
        p('M20 18c4-4 12-6 18-2s8 12 6 20c-2 8-10 14-18 12s-12-8-12-16s2-10 6-14'),
        p('M26 22l12 20'), p('M38 22l-12 20'),
    ]),
    'broccoli-sprouts': lambda: '\n'.join([
        p('M26 56l6-20'), p('M38 56l-6-20'),
        p('M32 36c-6 0-10-4-10-8s4-8 10-8s10 4 10 8s-4 8-10 8'),
        p('M24 24c-2-2-2-6 0-8'), p('M40 24c2-2 2-6 0-8'),
        p('M32 20c0-2 0-6 0-8'),
    ]),
    'brown-rice': lambda: '\n'.join([
        ellipse(24, 32, 5, 10), ellipse(40, 32, 5, 10),
        ellipse(32, 30, 5, 10),
        p('M20 12c4 4 8 6 12 6s8-2 12-6'),
    ]),
    'buckwheat': lambda: '\n'.join([
        p('M24 20l8 12l8-12'), p('M24 20l8-8l8 8'),
        p('M32 32v20'),
        p('M24 40h16'), p('M26 46h12'),
    ]),
    'capers': lambda: '\n'.join([
        circle(32, 32, 10),
        p('M32 22c-2-6-1-12 3-16'),
        p('M36 18c4-2 8-2 10 0'),
        p('M26 24c-3-1-6-1-8 1'),
        p('M28 32l4-4l4 4'), p('M30 36l2 2l2-2'),
    ]),
    'carrots': lambda: '\n'.join([
        p('M32 56l-6-32c0-4 2-8 6-8s6 4 6 8l-6 32'),
        p('M28 16c-4-6-2-12 4-12'), p('M36 16c4-6 2-12-4-12'),
        p('M32 16c0-6 2-10 6-12'),
        p('M26 30h12'), p('M27 38h10'),
    ]),
    'chickpeas': lambda: '\n'.join([
        circle(26, 34, 10), circle(40, 34, 9),
        p('M22 24c2-4 6-6 10-4'), p('M36 24c2-4 6-4 8-1'),
        p('M26 44v4'), p('M40 43v4'),
    ]),
    'chilli-pepper': lambda: '\n'.join([
        p('M28 8c-2 4-2 8 0 12c4 8 6 18 4 28c-1 6-4 8-4 8'),
        p('M36 8c2 4 2 8 0 12c-4 8-6 18-4 28c1 6 4 8 4 8'),
        p('M30 8c0-4 2-6 4-4'), p('M34 8c0-4-2-6-4-4'),
    ]),
    'cinnamon': lambda: '\n'.join([
        p('M18 16c8 0 14 4 14 12s-2 12 2 16c4 4 10 4 12 0'),
        p('M18 24c8 0 14 4 14 12s-2 8 2 12'),
        p('M48 20c-2 4-2 8 0 12'),
    ]),
    'citrus-fruits': lambda: '\n'.join([
        circle(32, 34, 16),
        p('M32 18v32'), p('M16 34h32'),
        p('M22 22l20 24'), p('M42 22l-20 24'),
        circle(32, 34, 4),
    ]),
    'clams-shellfish': lambda: '\n'.join([
        p('M12 34c0-12 10-20 20-20s20 8 20 20'),
        p('M12 34c0 8 10 14 20 14s20-6 20-14'),
        p('M16 34c4-10 10-14 16-14s12 4 16 14'),
        p('M20 42c3 2 8 3 12 3s9-1 12-3'),
    ]),
    'coffee': lambda: '\n'.join([
        p('M16 24h24v20c0 4-4 8-12 8s-12-4-12-8v-20'),
        p('M40 28c4 0 8 2 8 6s-4 6-8 6'),
        p('M24 16c0-4 2-8 2-8'), p('M32 14c0-4 2-8 2-8'),
    ]),
    'cruciferous-vegetables': lambda: '\n'.join([
        p('M32 54v-18'), p('M28 54l4-18'), p('M36 54l-4-18'),
        circle(24, 28, 8), circle(32, 24, 8), circle(40, 28, 8),
        circle(28, 20, 6), circle(36, 20, 6),
    ]),
    'cumin': lambda: '\n'.join([
        ellipse(22, 32, 4, 12), ellipse(32, 30, 4, 12),
        ellipse(42, 32, 4, 12),
        p('M22 20c0-4 2-8 4-10'), p('M32 18c0-4 0-8 0-10'),
        p('M42 20c0-4-2-8-4-10'),
    ]),
    'dark-chocolate': lambda: '\n'.join([
        p('M14 20h36v28H14V20'),
        p('M14 20l6-8h24l6 8'),
        p('M26 20v28'), p('M38 20v28'),
        p('M14 32h36'), p('M14 40h36'),
    ]),
    'dark-green-leafy-vegetables': lambda: '\n'.join([
        p('M32 56V28'),
        p('M32 28c-12-2-20-8-20-16c8 2 16 6 20 16'),
        p('M32 36c12-2 18-10 18-18c-6 2-14 8-18 18'),
        p('M20 28c4 4 8 6 12 8'),
        p('M44 30c-4 2-8 4-12 6'),
    ]),
    'dates': lambda: '\n'.join([
        ellipse(26, 34, 8, 14), ellipse(38, 34, 8, 14),
        p('M26 20c0-4 2-8 6-10'), p('M38 20c0-4-2-8-6-10'),
    ]),
    'durum-wheat-pasta': lambda: '\n'.join([
        p('M16 44c4-16 8-28 16-32'), p('M24 44c4-16 8-28 16-32'),
        p('M32 44c4-16 8-28 16-32'),
        p('M16 44h32'), p('M18 50h28'),
    ]),
    'extra-virgin-olive-oil': lambda: '\n'.join([
        p('M24 18h16v6l4 4v24c0 2-2 4-4 4H24c-2 0-4-2-4-4V28l4-4v-6'),
        p('M26 18v-6h12v6'),
        ellipse(32, 40, 6, 8),
    ]),
    'figs': lambda: '\n'.join([
        p('M32 52c-12 0-18-8-18-18s6-18 18-22c12 4 18 12 18 22s-6 18-18 18'),
        p('M32 12c-2-4 0-8 4-8'),
        p('M32 52v-40'),
    ]),
    'flaxseeds': lambda: '\n'.join([
        ellipse(20, 28, 4, 6), ellipse(32, 24, 4, 6),
        ellipse(44, 28, 4, 6), ellipse(26, 40, 4, 6),
        ellipse(38, 40, 4, 6), ellipse(32, 50, 4, 6),
    ]),
    'garlic': lambda: '\n'.join([
        p('M32 52c-10 0-16-6-16-16 0-6 4-12 8-16'),
        p('M32 52c10 0 16-6 16-16 0-6-4-12-8-16'),
        p('M24 20c2-4 5-8 8-10'), p('M40 20c-2-4-5-8-8-10'),
        p('M32 10v4'), p('M28 36v-12'), p('M36 36v-12'), p('M32 38v-14'),
    ]),
    'ginger': lambda: '\n'.join([
        p('M20 38c2-8 6-14 12-16s10 2 12 8c1 4-1 10-6 12s-10 1-13-1c-2-2-4-1-5-3'),
        p('M32 22c3-6 5-10 8-14'), p('M37 26c4-3 8-5 12-5'),
        p('M24 36c-4 2-8 6-10 10'),
    ]),
    'green-tea': lambda: '\n'.join([
        p('M18 24h28v4c0 12-6 20-14 24c-8-4-14-12-14-24v-4'),
        p('M18 24c-4-2-8-4-8-8 4 0 8 2 8 8'),
        p('M28 14c0-4 2-8 4-6'), p('M36 12c0-4 2-8 4-6'),
    ]),
    'honey-natural-sweeteners': lambda: '\n'.join([
        p('M22 20h20v8c0 12-4 20-10 24s-10-12-10-24v-8'),
        p('M22 20c-2-4-1-8 2-10h16c3 2 4 6 2 10'),
        p('M32 52v4'), p('M28 56h8'),
        p('M26 30c2 2 4 2 6 0s4-2 6 0'),
    ]),
    'iodised-salt': lambda: '\n'.join([
        p('M22 16h20v36H22V16'),
        p('M22 16l4-6h12l4 6'),
        p('M26 28h12'), p('M26 34h12'), p('M26 40h12'),
        p('M30 46h4'),
    ]),
    'legumes': lambda: '\n'.join([
        p('M16 28c0-8 6-14 12-14s10 4 12 10'),
        p('M40 24c2 6 2 14-2 18c-4 4-10 6-16 4s-10-6-10-12'),
        circle(28, 32, 4), circle(38, 34, 3),
    ]),
    'lemon-juice-vitamin-c': lambda: '\n'.join([
        ellipse(32, 34, 14, 16),
        p('M32 18c-2-4 0-10 4-10'),
        p('M32 34l-10-6'), p('M32 34l10-6'),
        p('M32 34l-8 8'), p('M32 34l8 8'), p('M32 34v12'),
    ]),
    'lentils': lambda: '\n'.join([
        ellipse(20, 32, 8, 5), ellipse(44, 32, 8, 5),
        ellipse(32, 44, 8, 5), ellipse(32, 20, 8, 5),
        ellipse(32, 32, 8, 5),
    ]),
    'oat-porridge': lambda: '\n'.join([
        p('M12 28h40'), p('M16 28v16c0 4 6 8 16 8s16-4 16-8V28'),
        ellipse(32, 28, 20, 4),
        p('M24 22c2-4 4-6 8-6s6 2 8 6'),
    ]),
    'oats': lambda: '\n'.join([
        p('M32 56V16'),
        p('M32 16c-6-2-12 0-14 4'), p('M32 24c-6-2-12 0-14 4'),
        p('M32 16c6-2 12 0 14 4'), p('M32 24c6-2 12 0 14 4'),
        p('M32 32c-6-2-12 0-14 4'), p('M32 32c6-2 12 0 14 4'),
        p('M32 16c0-4 0-8 0-10'),
    ]),
    'oily-fish': lambda: '\n'.join([
        p('M8 32c6-12 16-16 24-16s14 4 20 16c-6 12-12 16-20 16s-18-4-24-16'),
        p('M48 26c4 2 8 4 8 6s-4 4-8 6'),
        circle(18, 30, 3),
        p('M24 36c4 2 10 2 14 0'),
    ]),
    'onion': lambda: '\n'.join([
        p('M32 52c-14 0-20-8-20-20s10-16 20-16s20 4 20 16s-6 20-20 20'),
        p('M32 16c-2-6 0-10 4-12'),
        p('M28 16c-2-4-4-6-6-6'),
        p('M32 20v32'),
    ]),
    'parsley': lambda: '\n'.join([
        p('M32 56V36'),
        p('M32 36c-8-4-16-10-16-20c6 4 12 8 16 20'),
        p('M32 32c8-4 16-12 16-22c-6 6-12 12-16 22'),
        p('M32 40c-6-2-14-6-18-14c6 2 12 6 18 14'),
        p('M28 36c-4 2-8 6-10 10'),
    ]),
    'pomegranate': lambda: '\n'.join([
        circle(32, 34, 16),
        p('M28 18c2-4 6-6 10-4'),
        p('M32 18v-6'),
        circle(26, 30, 3), circle(36, 28, 3), circle(32, 38, 3),
        circle(24, 40, 3), circle(40, 38, 3), circle(32, 46, 3),
    ]),
    'psyllium': lambda: '\n'.join([
        ellipse(22, 36, 6, 10), ellipse(42, 36, 6, 10),
        p('M22 26c0-6 4-12 10-14'), p('M42 26c0-6-4-12-10-14'),
        p('M28 46c2 4 4 6 4 6'), p('M36 46c-2 4-4 6-4 6'),
    ]),
    'pumpkin': lambda: '\n'.join([
        p('M32 50c-8 0-14-6-16-14s0-16 4-20c4-4 8-4 12-2'),
        p('M32 50c8 0 14-6 16-14s0-16-4-20c-4-4-8-4-12-2'),
        p('M32 14c-2-4 0-8 4-8'),
        p('M32 14v36'),
        p('M20 30c4 1 8 1 12 0s8-1 12 0'),
    ]),
    'purslane': lambda: '\n'.join([
        p('M32 56V32'),
        ellipse(24, 26, 8, 6), ellipse(40, 26, 8, 6),
        ellipse(32, 18, 8, 6),
        p('M32 32c-4 4-10 8-14 10'), p('M32 32c4 4 10 8 14 10'),
    ]),
    'red-wine': lambda: '\n'.join([
        p('M24 56h16'), p('M32 56V44'),
        p('M20 44h24'),
        p('M20 44c0-6-2-10 0-16c2-6 6-10 12-10s10 4 12 10c2 6 0 10 0 16'),
        p('M20 32h24'),
    ]),
    'rosemary': lambda: '\n'.join([
        p('M32 56V12'),
        p('M32 18c-6-2-12 0-14 4'), p('M32 18c6-2 12 0 14 4'),
        p('M32 26c-6-2-10 0-12 4'), p('M32 26c6-2 10 0 12 4'),
        p('M32 34c-6-2-8 0-10 4'), p('M32 34c6-2 8 0 10 4'),
        p('M32 42c-4-1-6 0-8 3'), p('M32 42c4-1 6 0 8 3'),
    ]),
    'rye': lambda: '\n'.join([
        p('M32 56V14'),
        p('M32 14c-3-2-8-2-10 0'), p('M32 14c3-2 8-2 10 0'),
        p('M32 22c-4-2-10-2-12 0'), p('M32 22c4-2 10-2 12 0'),
        p('M32 30c-4-2-10-2-12 0'), p('M32 30c4-2 10-2 12 0'),
        p('M32 38c-3-1-8-1-10 0'), p('M32 38c3-1 8-1 10 0'),
    ]),
    'sage': lambda: '\n'.join([
        p('M32 56V30'),
        p('M32 30c-10-2-18-8-18-16c8 2 14 6 18 16'),
        p('M32 34c10-2 16-10 16-18c-6 4-12 10-16 18'),
        p('M32 38c-8-1-14-4-16-10c6 1 12 4 16 10'),
    ]),
    'sesame-seeds': lambda: '\n'.join([
        ellipse(20, 26, 3, 6), ellipse(32, 22, 3, 6),
        ellipse(44, 26, 3, 6), ellipse(26, 38, 3, 6),
        ellipse(38, 36, 3, 6), ellipse(32, 48, 3, 6),
        ellipse(20, 46, 3, 6), ellipse(44, 44, 3, 6),
    ]),
    'sourdough-bread-wholegrain': lambda: '\n'.join([
        p('M12 40c0-16 10-28 20-28s20 12 20 28'),
        p('M12 40h40'),
        p('M12 40v8h40v-8'),
        p('M22 30c2-2 4-1 4 1'), p('M34 26c2-2 4-1 4 1'),
        p('M28 34c1-2 3-1 3 1'),
    ]),
    'sourdough-bread': lambda: '\n'.join([
        p('M12 40c0-16 10-28 20-28s20 12 20 28'),
        p('M12 40h40'),
        p('M12 40v8h40v-8'),
        p('M22 30c2-2 4-1 4 1'), p('M34 26c2-2 4-1 4 1'),
    ]),
    'soybeans': lambda: '\n'.join([
        p('M16 24c2-4 8-8 14-8c0 0 2 8-4 14s-10 8-12 6s-1-8 2-12'),
        p('M48 24c-2-4-8-8-14-8c0 0-2 8 4 14s10 8 12 6s1-8-2-12'),
        circle(26, 30, 3), circle(22, 36, 3),
        circle(38, 30, 3), circle(42, 36, 3),
    ]),
    'sweet-potatoes': lambda: '\n'.join([
        p('M12 34c2-8 8-14 16-14s12 4 16 8c4 4 6 10 8 14c-2 6-8 10-16 10s-14-4-18-8c-4-4-7-6-6-10'),
        p('M22 28c4 4 10 6 16 4'),
        p('M18 38c6 2 14 2 20-2'),
    ]),
    'tofu': lambda: '\n'.join([
        p('M16 20h32v24H16V20'),
        p('M16 20l4-6h24l4 6'),
        p('M48 20v24l-4 4'),
        p('M20 28h24'), p('M20 36h24'),
        p('M32 20v24'),
    ]),
    'tomatoes': lambda: '\n'.join([
        circle(32, 36, 16),
        p('M22 20c2-2 6-4 10-4s8 2 10 4'),
        p('M32 20v-6'),
        p('M28 16c-4-2-6-4-4-6'), p('M36 16c4-2 6-4 4-6'),
    ]),
    'turmeric': lambda: '\n'.join([
        p('M20 38c2-8 6-14 12-16s10 2 12 8c1 4-1 10-6 12s-10 1-13-1c-2-2-4-1-5-3'),
        p('M32 22c3-6 5-10 8-14'), p('M37 26c4-3 8-5 12-5'),
        p('M24 36c-4 2-8 6-10 10'), p('M27 30c-1-4 0-8 2-12'),
    ]),
    'walnuts': lambda: '\n'.join([
        ellipse(32, 34, 16, 14),
        p('M32 20v28'),
        p('M20 28c4 3 8 4 12 4s8-1 12-4'),
        p('M20 40c4-3 8-4 12-4s8 1 12 4'),
        p('M28 12c2 2 4 5 4 8'), p('M36 12c-2 2-4 5-4 8'),
    ]),
    'wild-edible-weeds': lambda: '\n'.join([
        p('M32 56V28'),
        p('M32 28c-6-8-14-12-20-10c6-4 14-2 20 10'),
        p('M32 34c6-8 12-14 18-12c-4-4-12-2-18 12'),
        p('M32 42c-4-4-10-8-14-6c4-2 10 0 14 6'),
        p('M32 46c4-4 8-6 12-4c-4-2-8 0-12 4'),
    ]),
}

os.makedirs(ICON_DIR, exist_ok=True)

generated = 0
for slug, generator in sorted(ICONS.items()):
    svg = svg_wrap(generator(), slug)
    filepath = os.path.join(ICON_DIR, f'{slug}.svg')
    with open(filepath, 'w') as f:
        f.write(svg)
    generated += 1

print(f'Generated {generated} icons in {ICON_DIR}')
