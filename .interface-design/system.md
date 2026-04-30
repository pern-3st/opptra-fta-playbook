# FTA Playbook — Design System

Extracted from `web/app/` and `web/components/` on 2026-04-30. Source of truth for tokens lives in `web/app/globals.css` (`@theme` block); this document records the rules that aren't expressible as tokens.

---

## Colour

Defined in `globals.css`:

| Token              | Hex      | Use                                    |
| ------------------ | -------- | -------------------------------------- |
| `navy`             | #131A48  | Primary text, headings, dark surfaces  |
| `navy-deep`        | #0d1236  | Reserved (deeper navy variant)         |
| `orange`           | #FF5800  | Brand accent, primary action, focus    |
| `orange-hover`     | #FF8C4F  | Hover state for orange                 |
| `yellow`           | #FFFCE8  | Notice / callout background            |
| `grey`             | #5A5A5A  | Body / secondary text                  |
| `grey-light`       | #CECECE  | Borders, dividers                      |
| `canvas`           | #F3F4F8  | Page background, inset surfaces        |

**Rules**

- Use tokens directly — never hardcode hex.
- Alpha modifiers are allowed but should map to one of the **semantic roles** below rather than being chosen ad-hoc:
  - `border-subtle` → `border-black/5` (on white) or `border-grey-light/60` (on canvas)
  - `border-strong` → `border-grey-light`
  - `border-accent` → `border-orange/30`
  - `text-muted-on-dark` → `text-white/60`
  - `text-faint-on-dark` → `text-white/45`
- Inactive/empty state grey: `text-grey/70`. Don't introduce new alphas without a reason.

---

## Typography

Two families, set in `app/layout.tsx`:

- **Heading** — Spectral (serif). Weights: 300, 600, 700.
- **Body** — Raleway (sans). Weights: 400, 500, 600.

### Type scale

| Role        | Class                     | Use                                          |
| ----------- | ------------------------- | -------------------------------------------- |
| `display`   | `font-heading font-light text-4xl text-navy` | Page H1 (one per page)            |
| `h2`        | `text-2xl font-bold text-navy`              | Top-level reference / collapsible sections   |
| `section`   | `text-xl font-bold text-navy`               | Card section title (FTA name, Step title)    |
| `subhead`   | `font-heading font-bold text-navy`          | Sub-sections inside a card                   |
| `body`      | `text-sm` (default colour `grey`)           | Default running text                         |
| `caption`   | `text-xs text-grey`                         | Metadata, helper text, footer                |
| `eyebrow`   | `text-xs font-semibold uppercase tracking-wider text-grey` | Form labels, tile labels |

**Rules**

- Body text defaults to `text-sm`. Reserve `text-base` and above for specific content (markdown prose handled by `@tailwindcss/typography`).
- Never use arbitrary sizes (`text-[10px]` etc.). If something smaller than `text-xs` is needed, revisit the layout instead.
- All `<h1>`–`<h4>` automatically receive `font-heading` and `text-navy` via the base layer in `globals.css`.

---

## Spacing

Tailwind's 4px grid. Most-used values, in order: `2, 3, 4, 5` (8/12/16/20px).

**Allowed scale:** `1, 2, 3, 4, 5, 6, 8, 10, 12` → 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 px.

**Rules**

- Stick to the scale. Avoid half-steps (`2.5`, `3.5`) unless matching native form-control heights — current half-step uses in `Input`/`Select` (`px-3.5 py-2.5`) are grandfathered as the form-control standard, but no new ones.
- No arbitrary values (`p-[14px]`, `border-[1.5px]`). The existing `border-[1.5px]` in `Input`/`Select` is the form-control standard; no other arbitrary borders.
- Vertical rhythm between cards: `mb-5` (20px). Between major page sections: `mt-10`–`mt-12`.
- Card internal padding standard: `p-7` (28px). Inset/Tile padding: `p-3` (12px). Notice/callout padding: `p-4` (16px).

---

## Radius

| Token         | Pixels | Use                                                     |
| ------------- | ------ | ------------------------------------------------------- |
| `rounded-sm`  | 2px    | Text-level: `<mark>` highlights, loading skeletons      |
| `rounded-lg`  | 8px    | Controls and interactive list rows                      |
| `rounded-xl`  | 12px   | Inset surfaces: Tile, Notice, contained tables          |
| `rounded-2xl` | 16px   | Container surfaces: Card                                |
| `rounded-full`| —      | Pills: Badge, step number circles, chips                |

**Rules**

- Plain `rounded` (4px) is **not** in the system. Pick from the table above.
- Match radius to nesting depth: container > inset > control. Don't nest larger radii inside smaller ones.

---

## Depth

**Borders-first.** The system uses borders for separation; shadows are reserved for elevated/temporary surfaces (modals, popovers — none yet).

**Rules**

- Card uses `border border-black/5 shadow-sm` — this is the **only** sanctioned shadow today. Don't add more without a reason.
- Use the border roles in the Colour section. Never introduce new alpha border colours ad-hoc.

---

## Focus & interaction

**Rule:** every interactive element gets:

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/40 focus-visible:ring-offset-1
```

This is built in to `Button`, `Input`, `Select`, `Checkbox`, and the reference-table collapse toggle. Form controls also swap `border-color` to orange on focus in addition to the ring.

When adding a new interactive element, include the rule above. The `Button` primitive applies it automatically — prefer that to a bare `<button>`.

Hover transitions: `transition-colors` only. Avoid transforming size/position on hover.

---

## Motion

Defined as theme tokens in `globals.css`:

- `animate-fade-in` — 220ms — opacity only.
- `animate-section-in` — 280ms — opacity + 6px translate.
- `animate-row-in` — 200ms — opacity + 2px translate.

Use these for content transitions (new section appearing, list rows). All motion is gated by `prefers-reduced-motion`.

---

## Components

### Button (`components/ui/button.tsx`)

**Variants** (target — current implementation has only `primary`):

| Variant         | Bg                  | Text          | Use                                  |
| --------------- | ------------------- | ------------- | ------------------------------------ |
| `primary`       | `bg-orange`         | `text-white`  | Main CTA, one per region             |
| `secondary`     | `bg-white border`   | `text-navy`   | Alternate action                     |
| `ghost`         | transparent         | `text-navy`   | Tertiary, in-card actions            |
| `ghost-on-dark` | `bg-white/10`       | `text-white`  | Actions in the navy header           |
| `link`          | transparent         | `text-orange` | Inline "Change", "Reset" actions     |

**Sizes:** `sm` (px-3 py-1.5 text-xs), `md` (px-4 py-2 text-sm — default).

**Shape:** `rounded-lg`, `font-medium`, `transition-colors`, `disabled:opacity-50`. All variants share these.

### Card (`components/ui/card.tsx`)

`bg-white rounded-2xl border border-black/5 shadow-sm p-7 mb-5`. Variants are encoded by passing `className` (e.g. `bg-canvas`, `border-orange/20`). If a third variant appears, formalise.

### StepHeader (`components/ui/card.tsx`)

`<num?, title, subtitle?, aside?>`. The canonical section-opener for any card-level title.

- `num` (optional) — when set, renders an 8×8 navy circle with white number on the left. Use for true numbered steps; omit for result/summary panels.
- `title` — `section` style (`text-xl font-bold text-navy`).
- `subtitle` (optional) — `caption` style.
- `aside` (optional) — right-aligned slot, typically for a `<Badge>` (status, etc.). Wraps below on narrow viewports.

All card-level section titles should route through this.

### Input / Select (`components/ui/input.tsx`, `select.tsx`)

`w-full px-3.5 py-2.5 border-[1.5px] border-grey-light rounded-lg text-sm text-navy bg-white`. Focus: border swaps to orange. Both components are the form-control standard — match this if adding Textarea, Combobox, etc.

### Badge (`components/ui/badge.tsx`)

Tones: `navy | orange | grey`. `bg-{tone}/10 text-{tone}`, `rounded-full`, `text-xs font-medium`, `px-2.5 py-0.5`.

### Notice (`components/ui/notice.tsx`)

`rounded-xl bg-yellow border border-orange/30 p-4 text-sm text-navy`. Single-tone callout for "indicative", "lane-specific", or otherwise advisory content. Accepts arbitrary children — drop a `<Badge>` or `<strong>` lead-in inside as needed. If a second tone is needed (info, warning, error), formalise variants then.

### Tile (`components/ui/tile.tsx`)

`rounded-xl bg-canvas border border-black/5 p-3` with `eyebrow` label and value. Returns `null` when value is empty — safe to render in grids without conditional wrappers.

### Field (`components/ui/field.tsx`)

Wraps a single form control with an `eyebrow` label and optional hint. Implemented as a `<label>` so click-to-focus and label-association are automatic — no `id`/`htmlFor` plumbing needed. Use for any new form control. Pass `className` to control outer layout (e.g. `flex-1`).

### Checkbox (`components/ui/checkbox.tsx`)

Native `<input type="checkbox">` with `accent-orange` and the standard `focus-visible` ring, wrapped in a clickable `<label>`. Sufficient for an internal tool — escalate to a fully custom checkbox only if indeterminate state or advanced styling is required.

### Tabs (`components/ui/tabs.tsx`)

Underline-style tabs, orange indicator. Currently unused — keep until either adopted or pruned.

---

## Layout

- Page max-width: `max-w-5xl` (1024px), centred, with `px-5` gutters.
- Header is full-bleed navy on the outside; **inner content uses the same `max-w-5xl mx-auto px-5` shell** so the logo, body, and footer all share a left edge.
- Footer matches the body container.
- Scrollbar gutter is reserved (`scrollbar-gutter: stable` in `globals.css`).

---

## Known violations (as of 2026-04-30)

All ten initial-audit items closed:

1. ~~Five custom buttons bypassing `<Button>`~~ — **fixed**.
2. ~~`fta-details.tsx` and `playbook.tsx` use inline H2 instead of `StepHeader`~~ — **fixed** (StepHeader extended with `aside` slot and optional `num`).
3. ~~Plain `rounded` (4px) in `product-lookup.tsx` and `loading.tsx`~~ — **fixed**: listbox rows → `rounded-lg`, `<mark>` and skeleton bars → `rounded-sm` (added to scale).
4. ~~`text-[10px]` arbitrary in `fta-details.tsx`~~ — **fixed** by promoting Tile to `ui/tile.tsx` with `text-xs` eyebrow.
5. ~~Notice and Tile patterns duplicated inline~~ — **fixed**, now `ui/notice.tsx` and `ui/tile.tsx`.
6. ~~`Input`/`Select` lack `focus-visible` ring~~ — **fixed**.
7. ~~Reference-table collapse toggle ring~~ — **fixed** (added in pass 1).
8. ~~Lane-selector free-zone checkbox is unstyled~~ — **fixed** (`ui/checkbox.tsx`).
9. ~~Lane-selector form labels duplicate the eyebrow markup~~ — **fixed** (`ui/field.tsx`).
10. ~~Header content not aligned with body container~~ — **fixed**: header is now full-bleed navy with a `max-w-5xl mx-auto px-5` inner shell.

Run `/audit` to scan for new drift.
