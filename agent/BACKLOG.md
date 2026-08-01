# BACKLOG.md — Idea queue

Pick the top suitable item for the current run's type (see `AGENT.md`
run protocol). Mark an item `[x]` and move it to the bottom with a
"(built — see CANON.md)" note once shipped, rather than deleting it, so
history stays visible. Append new ideas at the bottom, keeping the queue
at roughly 10–20 open items. Everything here must fit the fiction (§3 of
`agent/SPEC.md` / the tone rules in `AGENT.md`) and the caps (6
departments, 12 exhibits).

## Exhibits (nayttely/)

- [ ] Näyte 002 — Lorenz-attraktori: 3D-ish rotating Lorenz attractor on
      Canvas; sliders styled as official calibration dials.
- [ ] Näyte 003 — Jonotusnumerosimulaatio: queue-number ticker that
      skips, stalls, and misorders numbers; occasionally announces
      "asiakas 47 poistettu järjestelmästä."
- [ ] Näyte 004 — Organisaatiokaavio: generative org chart that
      reshuffles itself on an interval; every node titled some variant
      of "vt. koordinaattori."
- [ ] Näyte 005 — Entropiamittari: a gauge tracking "national entropy
      today," driven by `Kaaos.seededRandom` from the date — same value
      for all visitors, changes daily, purely client-side.
- [ ] Näyte 006 — Lomake K-7: an official form whose fields drift, swap
      labels, and renumber themselves as you try to fill it. Submitting
      yields "Lomake vastaanotettu. Käsittelyaika: ∞." Input goes
      nowhere — no storage, no network.
- [ ] Näyte 007 — Konservoitu satunnaisuus: particle system in a
      "vitrine"; particles behave until the visitor taps the glass.
- [ ] Näyte 008 — Sääennuste: weather forecast for chaos ("huomenna
      hajanaista epäjärjestystä, paikoin selkeää"), generated
      client-side via `Kaaos.seededRandom` from the date.

## Departments (osastot/)

- [ ] Viivästysvirasto (Bureau of Delays) — its own page loads elements
      deliberately, elegantly late.
- [ ] Kadonneiden ajatusten osasto (Dept. of Lost Thoughts) —
      lost-and-found for thoughts; features a slowly scrolling ledger of
      found thoughts (static HTML, no JS — see the Sattumavarasto ledger
      for the pattern).
- [ ] Ennakoimattomuuden ennakointiyksikkö (Unit for Anticipating the
      Unanticipated) — publishes forecasts that are officially always
      wrong (accuracy target: 0%).

## Built (see agent/CANON.md for canonical facts)

- [x] Näyte 001 — Kaksoisheiluri (bootstrap run, 2026-08-01).
- [x] Sattumavarasto (bootstrap run, 2026-08-01).
