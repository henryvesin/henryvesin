# CANON.md — Fictional-universe facts

Append-only. Read every run. Never contradict an existing entry — if a
new idea would contradict canon, change the idea, not the canon. If a
canon fact is genuinely wrong (typo, inconsistency introduced by
mistake), correct it in place and note the correction inline rather than
leaving two contradictory facts.

## Founding & mandate

- Kaaostoimisto was established in **1949, by accident** (exact
  circumstances unspecified — never invent or reveal them; the mystery
  is the joke).
- Motto: *"Kaaos ei katoa. Se hallinnoidaan."* / "Chaos does not
  disappear. It is administered."
- Opening hours: **Ma–Pe 9:00–9:07** ("Poikkeukset ilmoitetaan
  poikkeuksellisesti, yleensä liian myöhään" / "Exceptions are announced
  exceptionally, usually too late").

## Design decisions (bootstrap run, 2026-08-01)

- **Bilingual pattern:** side-by-side blocks (Finnish then English),
  chosen over a JS toggle so content works without JS. Implemented as
  `.bilingual > .lang-block[lang]` in `assets/base.css`. This is
  permanent per spec — do not introduce a toggle later.
- **Palette:** paper `#f4f1ea`, ink `#1a1a18`, accent red `#b5342a`
  (seals/alerts/auctioned status), accent slate-blue `#4a5a66`
  (secondary structure/links/claimed status), rule-grey `#c9c3b5`
  (hairlines). Defined in `assets/tokens.css`; do not add new colors
  there without strong reason — the whole point is restraint.
- **Type:** system grotesk for body/headings, system monospace for
  specimen/form codes and tabular data.
- **Agency seal:** a circular stamp mark with the initials "KT", the one
  deliberate exception to the site's zero-border-radius rule. It appears
  in the masthead of every page.
- **Listing pages added beyond the original spec's file diagram:**
  `osastot/index.html` (department directory) and `nayttely/index.html`
  (exhibit gallery) exist so the front desk doesn't have to inline every
  department/exhibit as the caps (6/12) are approached. Keep both
  updated whenever a department or exhibit is added, removed, or
  replaced.

## Departments

### Sattumavarasto (Warehouse of Coincidences)
- Form number: **SV-12** ("Sattuman ilmoitus" / "Coincidence Report").
- Receives, classifies, and stores modest coincidences until claimed.
- Holds an **unannounced annual auction** of unclaimed coincidences —
  the date is deliberately never published in advance.
- Ledger entry IDs follow the pattern `SV-YYYY-###`.

## Exhibits

### Näyte 001 — Kaksoisheiluri (Double Pendulum)
- Registered **1962**, reclassified **1988** and **2011** (reclassify
  reasons unspecified — do not invent them unless a future bulletin
  needs the detail, in which case add it here first).
- Curatorial claim: fully deterministic, still unpredictable beyond a
  few seconds. "The office considers this exemplary."
- Interaction: visitors may drag either bob to disturb it; disturbance
  requires no permit.

## Bulletins

- **Tiedote 1/2026** (2026-08-01), "Arkisto avautuu yleisölle" — the
  agency's archive opens partially to the public after a **77-year**
  processing period (1949 founding → 2026 opening). This bulletin is
  the in-fiction narration of the site's real-world launch. Future
  bulletins may reference this opening as the point the public record
  begins, but should not re-explain it at length.

## Open motifs (available for future bulletins, not yet used)

Annual chaos statistics; renovation of the entropy archive; new form
numbers entering force; the agency's one elevator being "temporarily
deterministic"; recruitment notices for positions that cannot be
described.
