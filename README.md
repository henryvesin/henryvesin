# kaaostoimisto.fi — kaaoksen havaintoarkisto

A static, numerically honest atlas of chaotic systems: the Lorenz
attractor, the double pendulum, bifurcation diagrams, fractal basins.
Every specimen is a real, interactive simulation — not an illustration
— whose placard states exactly the equations and integrator the code
actually runs. Static HTML/CSS/JS, no backend, no build step, hosted on
GitHub Pages. It grows one specimen at a time, each produced by a
single Claude Code run and merged as a pull request.

This replaced an earlier, unrelated concept for the same domain (a
satirical bureaucratic-agency site) on 2026-08-03. See
[`agent/LOG.md`](agent/LOG.md) for the pivot and
[`agent/SPEC-v1-satire.md`](agent/SPEC-v1-satire.md) for the archived
original, kept for provenance only.

- The full operating manual the agent reads every run: [`agent/AGENT.md`](agent/AGENT.md)
- The 14-specimen catalogue and build status: [`agent/CATALOGUE.md`](agent/CATALOGUE.md)
- Numerical standards and the invariant table: [`agent/STANDARDS.md`](agent/STANDARDS.md)
- Run history: [`agent/LOG.md`](agent/LOG.md)
- The current design spec (kept for provenance; the agent no longer needs it): [`agent/SPEC.md`](agent/SPEC.md)

## Running a growth cycle

```bash
./run.sh
```

This pulls `main`, verifies the tree is clean, and hands one run off to
`claude -p`, which reads `agent/AGENT.md`, builds exactly one specimen
or refinement, measures and reports its numerical invariants, and opens
a PR. The PR URL prints at the end — review the diff (and the reported
numbers) and merge it. That's the entire loop.

To force a specific run type instead of the next one in rotation:

```bash
./run.sh specimen      # or: refinement
```

No cron, no launchd — run it whenever you're at the desk.

## One-time setup checklist

Everything below is a manual, external-account step — the agent never
touches your GitHub account settings, DNS, or auth. This project's repo,
DNS, and Pages custom domain are already configured; this checklist is
kept as reference for a fresh clone or a disaster-recovery setup.

1. **Authenticate `gh`:**
   ```bash
   gh auth login
   ```
2. **Create the GitHub repo** (public — GitHub Pages custom domains need a
   public repo on the free plan):
   ```bash
   gh repo create <name> --public --source=. --remote=origin --push
   ```
3. **Cloudflare DNS** — point the apex domain at GitHub Pages:
   - Four `A` records for `kaaostoimisto.fi` →
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Optionally `AAAA` records for IPv6 →
     `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - Set the DNS records' proxy status to **DNS only** (grey cloud) while
     GitHub Pages issues its TLS certificate for the custom domain; you can
     switch to proxied afterward if desired.
4. **GitHub Pages settings** (repo → Settings → Pages):
   - Source: deploy from `main`, root.
   - Custom domain: `kaaostoimisto.fi` (the `CNAME` file in this repo
     already declares this; GitHub will verify DNS and issue a certificate).
   - Once the certificate is issued, check **Enforce HTTPS**.
5. **Verify:** visit `https://kaaostoimisto.fi` and confirm it loads over
   HTTPS.

## Design notes for humans

The entire visual identity lives in `assets/tokens.css`: a near-black
"dark-field observatory" palette, one low-saturation accent color per
arc section, one monospace type family used boldly for headings and
normally for body/data. `assets/base.css` builds every component
(masthead, nav, bilingual blocks, placards, the uniform control strip,
exhibit frames) from those tokens only — no page defines its own color
or font. `assets/sim.js` holds the shared, tested numerics (seeded RNG,
generic RK4, the fixed-timestep accumulator loop, DPR-aware canvas
setup) that every exhibit builds on rather than re-deriving. This is
enforced by the agent's own self-check every run, so the site still
looks and behaves like one thing after fourteen specimens.
