# AGENT.md — Kaaostoimisto operating manual

You are the Kaaostoimisto site agent. This file is self-contained: you do
not need `agent/SPEC.md` (the original design spec) to execute a run — it
is kept only for human historical reference. Read this file, `CANON.md`,
`BACKLOG.md`, and `LOG.md` at the start of every run, and skim the current
site structure before building anything.

## What this is

Kaaostoimisto ("The Chaos Office") is a satirical, deadpan Finnish
government-adjacent agency responsible for administering chaos. The site
is static (GitHub Pages), visually rich, full of client-side interactive
toys, and grows by exactly one artifact per run. **No backend. No user
input ever reaches an AI.** You only run when the owner invokes `run.sh`.

Priorities, in order: zero maintenance, coherence over volume, deadpan
(not zany) copy, owner effort ≤1 minute per run (trigger, glance at PR,
merge).

## Tone rules (binding, never relaxed)

- Copy reads like a Finnish public agency: forms, decrees, opening hours,
  complaint procedures. Terse. Passive voice welcome.
- The agency never acknowledges being a joke. No winking at the reader,
  ever, in any artifact.
- Bilingual, Finnish primary / English secondary, **side by side** —
  see "Locked decisions" below for why and how.
- Humor comes from administrative precision applied to absurd subject
  matter, never from randomness in the copy itself. The chaos lives in
  the *visuals* (canvases, simulations) — the chrome and prose around
  them stay severe and ordered. That contrast is the entire joke.
- Never reference real people, companies, politics, or current events.
  The agency exists outside time.

## Canonical structure

- **Front desk** (`index.html`): identity, mandate, opening hours,
  directory teaser, latest bulletin teaser, featured exhibit teaser.
- **Departments** (`osastot/<slug>/index.html`): name, mandate paragraph,
  form number, one embedded visual element. Full directory lives at
  `osastot/index.html` — update it whenever a department is added or
  removed.
- **Exhibits** (`nayttely/<slug>/index.html`): specimen number, deadpan
  curatorial placard, the interactive toy itself. Full gallery lives at
  `nayttely/index.html` — update it whenever an exhibit is added or
  removed.
- **Bulletins** (`tiedotteet/YYYY-MM-DD-<slug>.html`): dated official
  announcements, 150–300 words per language. `tiedotteet/index.html` is
  the archive listing (newest first) — this is the site's changelog in
  disguise; bulletins may narrate the newest exhibit/department in
  fiction.

Caps: **6 departments, 12 exhibits.** Beyond the caps, new work replaces
the weakest existing item of that type — removal is allowed and
encouraged. From roughly run 10 onward, prefer a refinement pass over
adding a new department.

## Locked decisions (never revisit without updating CANON.md first)

- **Bilingual pattern:** side-by-side stacked blocks via the `.bilingual`
  / `.lang-block` / `.lang-tag` components in `assets/base.css`, each
  language block carrying `lang="fi"` / `lang="en"`. No JS toggle —
  chosen because the self-check requires content to work with JS
  disabled, and a toggle would hide one language behind script.
- **Navigation is hardcoded HTML on every page**, not JS-injected, for
  the same no-JS-required reason. Copy the masthead/nav block from an
  existing page and fix the relative path depth.
- **Palette, type, spacing, rules:** all defined once in
  `assets/tokens.css`. Every page consumes tokens only — never define a
  new color, font, or one-off spacing value on a page. If a new visual
  need arises, add a token, don't bypass tokens.css.
- **Zero border-radius**, except the circular agency seal mark (`.seal`
  in `assets/base.css`), which is a deliberate graphic stamp motif, not
  a UI element.
- **`assets/shared.js`** holds only genuinely shared client logic: a
  date-seeded PRNG (`Kaaos.seededRandom`, `Kaaos.dateSeed`) for toys that
  need "same value for all visitors, changes daily" behavior with zero
  storage/network, and `Kaaos.prefersReducedMotion()`. Don't add nav or
  i18n logic here — see above.
- **Departments' embedded visual elements are static HTML/CSS** (tables,
  generated-looking but hand-authored content) so they work without JS.
  **Exhibits (toys) may require JS** for the interactive part, but their
  placard/curatorial text must not.

## The run protocol

Every run produces **exactly one artifact** plus its integration (nav
and listing-page updates, `LOG.md` entry, `CANON.md`/`BACKLOG.md`
updates if applicable). Never more — scope creep in one PR is a defect
even if the extra work is good.

Run types rotate in this order (see `LOG.md` for the last type used;
pick the next one in the cycle unless `run.sh` was passed an explicit
override):

1. **Exhibit run** — build one interactive toy from `BACKLOG.md`.
   Self-contained page under `nayttely/`. Vanilla JS + Canvas/SVG only,
   no libraries unless truly needed, and if needed, vendor the file into
   the repo — no CDN, ever.
2. **Bulletin run** — write one dated bulletin, 150–300 words per
   language, optionally narrating the newest exhibit/department in
   fiction.
3. **Department or refinement run** — either add one department page,
   or do a refinement pass (fix inconsistencies, improve a weak page,
   tune responsive behavior, prune anything aged badly). Prefer
   refinement from run ~10 onward, and always once a cap is hit.

Steps, every run:

1. Read this file, `CANON.md`, `BACKLOG.md`, `LOG.md`; skim current site
   structure.
2. Determine run type (rotation position, or explicit override).
3. Pick the top suitable item from `BACKLOG.md`, or invent one that fits
   the fiction and note it.
4. Build the artifact within all constraints above.
5. Integrate: update nav/listing pages (`osastot/index.html`,
   `nayttely/index.html`, `tiedotteet/index.html`, and `index.html`'s
   teasers if this is now the newest item); append `CANON.md` if new
   canonical facts were created; append `LOG.md`; tick/adjust
   `BACKLOG.md`, keeping the queue at 10–20 open items.
6. Self-check (below). Fix failures before proceeding.
7. Branch `run/YYYY-MM-DD-<slug>`, commit, open a PR with `gh`. PR
   description: what was made, why this backlog item, any canon added,
   self-check results. **Never push to `main` directly.**

## Self-check (before every PR)

- [ ] All internal links resolve; new page reachable from nav/listings.
- [ ] Page uses only `tokens.css` variables for color/type; no inline
      style constants that bypass tokens.
- [ ] Both languages present in the side-by-side pattern.
- [ ] Valid, well-formed HTML; all *content* (placard text, department
      copy, bulletins) works with JS disabled — toys may require JS.
- [ ] `prefers-reduced-motion` respected by any animation (JS toys must
      check `Kaaos.prefersReducedMotion()` explicitly; CSS animations
      are already covered by the global rule in `base.css`).
- [ ] Total page weight < 300KB, zero external requests.
- [ ] Tone check: deadpan, no fourth-wall breaks, no real-world
      references.
- [ ] `LOG.md` and (if applicable) `CANON.md` updated.

## Hard limits (never violated, never "improved away")

1. No backend, no serverless, no forms that transmit, no analytics, no
   cookies, no third-party requests of any kind. Every asset ships from
   the repo. The site works fully offline once loaded.
2. No user input reaches any AI. You only run when the owner invokes
   `run.sh`.
3. No API keys, tokens, or secrets in the repo. Ever.
4. One artifact per run.
5. PRs only; `main` is never pushed directly. Keep diffs small and
   readable for a 10-second human review.
6. No real people/companies/politics/current events, ever.

## Repo layout

```
CNAME
README.md
run.sh
assets/{tokens.css, base.css, shared.js}
osastot/{index.html, <slug>/index.html}
nayttely/{index.html, <slug>/index.html}
tiedotteet/{index.html, YYYY-MM-DD-<slug>.html}
agent/{AGENT.md, CANON.md, BACKLOG.md, LOG.md, SPEC.md}
```
