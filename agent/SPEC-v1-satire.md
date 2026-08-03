# KAAOSTOIMISTO.FI — System Specification

*Specification for Claude Code. Build this system in full. The human reviews via pull requests only.*

---

## 1. What this is

**Kaaostoimisto** ("The Chaos Office") is a satirical, self-growing website at `kaaostoimisto.fi`. It presents itself as a deadpan Finnish government-adjacent agency responsible for the administration of chaos. The site is static, visually rich, and full of client-side interactive toys. **No user input ever reaches an AI. No backend exists.**

The site grows over time: an agent (Claude Code, invoked locally by the owner) periodically adds one new piece of content per run, opens a pull request, and the owner merges it after a glance. That is the entire operational model.

Design intent, in priority order:

1. **Zero maintenance.** Static files on GitHub Pages. Nothing to patch, monitor, or restart.
2. **Coherence over volume.** One good artifact per run. The site must still look like one designer made it after 50 runs.
3. **Deadpan, not zany.** The humor is bureaucratic seriousness applied to chaos. Never wacky, never random-for-random's-sake in the *copy* (the *visuals* may be chaotic — that is the joke: perfect order describing disorder).
4. **The owner spends ≤1 minute per run**: trigger the script, later glance at the PR diff, merge.

---

## 2. Architecture

```
Owner's machine                      GitHub                   Visitor
┌──────────────────┐    PR    ┌─────────────────┐   HTTPS   ┌─────────┐
│ run.sh           │ ───────▶ │ repo            │ ────────▶ │ Browser │
│  └─ claude -p    │          │  └─ Pages build │           │ (all JS │
│     (this spec + │          │     on merge    │           │ is here)│
│      AGENT.md)   │          └─────────────────┘           └─────────┘
└──────────────────┘          DNS: Cloudflare → GitHub Pages IPs
```

- **Hosting:** GitHub Pages, custom domain `kaaostoimisto.fi`, HTTPS enforced. `CNAME` file in repo root.
- **Build:** none, or at most a zero-dependency static generator. **Default: plain HTML/CSS/JS, no framework, no npm build step.** Pages serves the repo as-is. This removes an entire failure class (broken builds, dependency rot). If a build step is ever truly needed, justify it in the PR description first.
- **Agent runtime:** Claude Code in headless mode (`claude -p`), invoked by `run.sh`. It reads the repo, generates one artifact according to §5, self-checks per §7, commits to a branch, opens a PR with `gh`.
- **No CI/CD logic beyond Pages' own deploy.** No Actions workflows unless later added for link-checking (optional, §7).

### Repository layout

```
/
├── CNAME                      # kaaostoimisto.fi
├── index.html                 # Front desk (landing page)
├── assets/
│   ├── tokens.css             # Design tokens — single source of visual truth
│   ├── base.css               # Layout, typography, components
│   └── shared.js              # Tiny shared utilities (nav injection, i18n toggle)
├── osastot/                   # "Departments" — one dir per department
│   └── <slug>/index.html
├── nayttely/                  # "Exhibits" — interactive chaos toys, one dir each
│   └── <slug>/index.html      #   toy JS lives inline or as sibling file
├── tiedotteet/                # "Bulletins" — memos, one HTML file each, dated
│   ├── index.html             # Bulletin archive listing
│   └── YYYY-MM-DD-<slug>.html
├── agent/
│   ├── AGENT.md               # Standing prompt / operating manual (the agent's own instructions)
│   ├── CANON.md               # Fictional-universe facts. Append-only. Read every run.
│   ├── BACKLOG.md             # Idea queue. Agent picks from top, may append new ideas at bottom.
│   └── LOG.md                 # One line per run: date, type, what was made. Append-only.
└── README.md                  # For humans: what this repo is, how to run the agent
```

---

## 3. The fiction (content concept)

Kaaostoimisto is a straight-faced institution. Established "1949, by accident." Its mandate: *"Kaaos ei katoa. Se hallinnoidaan."* ("Chaos does not disappear. It is administered.")

**Tone rules (binding):**
- Copy reads like a Finnish public agency: forms, decrees, opening hours, complaint procedures. Terse. Passive voice welcome.
- The agency never acknowledges being a joke. No winking at the reader.
- Bilingual: Finnish primary, English secondary. Every page carries both (simple toggle or side-by-side; agent picks one pattern in run 1 and keeps it forever — record the choice in CANON.md).
- Humor emerges from applying administrative precision to absurd subject matter. Example register: *"Tiedoksianto: satunnaisuuden kausivaihtelu on tänä vuonna 4,2 % odotettua satunnaisempaa."*
- Never reference real people, real companies, real politics, or current events. The agency exists outside time.

**Canonical structure of the institution** (seed for CANON.md; agent may extend, never contradict):
- **Front desk** (`index.html`): agency identity, mandate, opening hours ("Ma–Pe 9:00–9:07"), directory of departments, latest bulletin, featured exhibit.
- **Departments (Osastot):** each has a name, a mandate paragraph, a form number, and one embedded visual element. Seed ideas live in BACKLOG.md (§6).
- **Exhibits (Näyttely):** the public gallery of "chaos specimens under administration" — the interactive toys. Each exhibit page: specimen number, deadpan curatorial placard text, and the interactive visual itself.
- **Bulletins (Tiedotteet):** dated official announcements. Short (150–300 words per language). The archive is the site's changelog in disguise.

---

## 4. Visual design system

Established once, in the bootstrap run, then **enforced forever via `tokens.css`**.

- **Direction:** brutalist Nordic bureaucracy. Think 1970s Finnish government forms meeting generative art. Lots of whitespace, rigid grid, one accent color, monospace or grotesk type from system-font stack (no webfont dependencies; if a webfont is irresistible, self-host it — no third-party requests, see §8).
- `tokens.css` defines: color palette (max 5 colors + neutrals), type scale, spacing scale, border/rule conventions. All pages consume tokens only; no page defines its own colors or fonts.
- **The chaos lives inside frames.** Interactive canvases may be wild; the chrome around them stays severe and ordered. This contrast *is* the visual identity.
- Every page must be responsive and legible on mobile without separate effort (fluid grid, sensible canvas sizing).
- Accessibility floor: semantic HTML, alt text, visible focus states, animations respect `prefers-reduced-motion`.

---

## 5. The run protocol (what the agent does each invocation)

Every run produces **exactly one artifact** plus its integration (nav/index updates, LOG entry). Never more. Run types rotate by default in this order, tracked in LOG.md:

1. **Exhibit run** — build one interactive toy (§6 backlog). Self-contained page under `nayttely/`. Vanilla JS + Canvas/SVG only. No libraries unless truly needed; if needed, vendor the file into the repo (no CDN).
2. **Bulletin run** — write one dated bulletin. May reference (in-fiction) the newest exhibit or department: this is how the site narrates its own growth.
3. **Department or refinement run** — either add one department page, or perform a refinement pass: fix inconsistencies, improve a weak page, tune responsive behavior, prune anything that has aged badly. From run ~10 onward, prefer refinement over new departments (cap: 6 departments, 12 exhibits; beyond caps, new work replaces the weakest existing item — removal is allowed and encouraged).

**Every run, in order:**
1. Read `AGENT.md`, `CANON.md`, `BACKLOG.md`, `LOG.md`, and skim current site structure.
2. Determine run type (next in rotation unless `run.sh` was passed an explicit type).
3. Pick the top suitable item from BACKLOG.md (or invent one and note it).
4. Build the artifact within all constraints (§3 tone, §4 design, §8 hard limits).
5. Integrate: update nav/listing pages; append CANON.md if new canonical facts were created; append LOG.md; tick/adjust BACKLOG.md.
6. Self-check (§7). Fix failures before proceeding.
7. Branch `run/YYYY-MM-DD-<slug>`, commit, open PR. PR description: what was made, why this backlog item, any canon added, self-check results. **Never push to main directly.**

### Bootstrap (run 0 — a larger, one-time run)
Executed once, by Claude Code, from this spec: create repo structure, `CNAME`, tokens + base CSS, `index.html`, bulletin archive skeleton, one seed department, one seed exhibit, one inaugural bulletin, and all four `agent/` files — including writing `AGENT.md` itself: a condensed, self-contained operating manual distilled from §3–§8 of this spec, so future runs do not depend on this document. Also write README.md with the exact `run.sh` usage and the DNS/Pages setup checklist for the owner (Cloudflare A records to GitHub Pages IPs, Pages custom-domain setting, enforce HTTPS).

### `run.sh`
Minimal wrapper, committed to the repo root:
- `git pull` main, verify clean tree.
- Invoke `claude -p` with an instruction of the form: *"You are the Kaaostoimisto site agent. Read agent/AGENT.md and execute one run. Optional run type override: $1."* — with permissions to edit files and run git/gh.
- Print the PR URL at the end.
No cron, no launchd. The owner runs it when at the desk. (If scheduling is ever wanted, that is a one-line launchd job invoking the same script — out of scope now.)

---

## 6. Content backlog (seed — becomes `agent/BACKLOG.md`)

**Exhibits (interactive toys; all pure client-side):**
- *Näyte 001 — Kaksoisheiluri*: double pendulum, trailing path, "specimen under observation" placard; drag to perturb.
- *Näyte 002 — Lorenz-attraktori*: 3D-ish rotating Lorenz attractor on Canvas; sliders styled as official calibration dials.
- *Näyte 003 — Jonotusnumerosimulaatio*: queue-number ticker that skips, stalls and misorders numbers; occasionally announces "asiakas 47 poistettu järjestelmästä."
- *Näyte 004 — Organisaatiokaavio*: generative org chart that reshuffles itself on an interval; every node titled some variant of "vt. koordinaattori."
- *Näyte 005 — Entropiamittari*: a gauge tracking "national entropy today," driven by seeded pseudo-randomness from the date — same value for all visitors, changes daily, purely client-side.
- *Näyte 006 — Lomake K-7*: an official form whose fields drift, swap labels, and renumber themselves as you try to fill it. Submitting yields "Lomake vastaanotettu. Käsittelyaika: ∞." **Input goes nowhere** — no storage, no network.
- *Näyte 007 — Konservoitu satunnaisuus*: particle system in a "vitrine"; particles behave until the visitor taps the glass.
- *Näyte 008 — Sääennuste*: weather forecast for chaos ("huomenna hajanaista epäjärjestystä, paikoin selkeää"), generated client-side from date-seeded randomness.

**Departments:**
- *Sattumavarasto* (Warehouse of Coincidences) — stores coincidences until claimed; unclaimed coincidences are auctioned annually.
- *Viivästysvirasto* (Bureau of Delays) — its page loads elements deliberately, elegantly late.
- *Kadonneiden ajatusten osasto* (Dept. of Lost Thoughts) — lost-and-found for thoughts; features a slowly scrolling ledger of found thoughts.
- *Ennakoimattomuuden ennakointiyksikkö* (Unit for Anticipating the Unanticipated) — publishes forecasts that are officially always wrong (accuracy target: 0 %).

**Bulletin seams (recurring in-fiction motifs the bulletins may draw on):**
annual chaos statistics; renovation of the entropy archive; new form numbers entering force; the agency's one elevator being "temporarily deterministic"; recruitment notices for positions that cannot be described.

The agent appends new ideas to BACKLOG.md as they occur, keeping the queue at 10–20 open items. Ideas must fit the fiction and the caps in §5.

---

## 7. Self-check (agent runs before every PR)

- [ ] All internal links resolve; new page is reachable from nav/listings.
- [ ] Page uses only `tokens.css` variables for color/type; no inline style constants that bypass tokens.
- [ ] Both languages present in the established pattern.
- [ ] Valid HTML (well-formed; run a quick parse check), works without JS for all *content* (toys may require JS but the placard text must not).
- [ ] `prefers-reduced-motion` respected by any animation.
- [ ] Total page weight < 300 KB, no external requests (§8).
- [ ] Tone check against §3: deadpan, no fourth-wall breaks, no real-world references.
- [ ] LOG.md and (if applicable) CANON.md updated.

Optional later: a GitHub Action running a link checker on PRs. Not required for launch.

## 8. Hard limits (never violated, never "improved away")

1. **No backend, no serverless, no forms that transmit, no analytics, no cookies, no third-party requests of any kind.** Every asset is served from the repo. The site works fully offline once loaded.
2. **No user input reaches any AI.** The agent runs only when the owner invokes `run.sh`.
3. **No API keys, tokens, or secrets in the repo. Ever.**
4. **One artifact per run.** Scope creep across the site in a single PR is a defect, even if the extra work is good.
5. **PRs only; main is never pushed directly.** The human merge is the quality gate — keep diffs small and readable for a 10-second review.
6. Content restrictions of §3 (no real people/companies/politics/current events) are absolute.

---

## 9. Cost profile

GitHub Pages: €0. Cloudflare DNS: €0. Domain: already owned. Only cost: Claude Code usage per run (single-artifact runs on a small static repo are cheap; the repo must be kept small precisely so runs stay cheap — another reason for the caps in §5 and the no-framework rule in §2).

---

*End of specification. Bootstrap per §5 "run 0," then hand the keys to `run.sh`.*
