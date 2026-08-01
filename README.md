# kaaostoimisto.fi

A satirical, self-growing static site: a deadpan Finnish government-adjacent
agency responsible for administering chaos. Static HTML/CSS/JS, no backend,
no build step, hosted on GitHub Pages. It grows one artifact at a time —
an interactive toy, a department, or a bulletin — each produced by a single
Claude Code run and merged as a pull request.

- The full operating manual the agent reads every run: [`agent/AGENT.md`](agent/AGENT.md)
- Canonical facts about the fictional agency: [`agent/CANON.md`](agent/CANON.md)
- What's queued to build next: [`agent/BACKLOG.md`](agent/BACKLOG.md)
- Run history: [`agent/LOG.md`](agent/LOG.md)
- The original design spec (kept for provenance; the agent no longer needs it): [`agent/SPEC.md`](agent/SPEC.md)

## Running a growth cycle

```bash
./run.sh
```

This pulls `main`, verifies the tree is clean, and hands one run off to
`claude -p`, which reads `agent/AGENT.md`, builds exactly one artifact,
self-checks it, and opens a PR. The PR URL prints at the end — review the
diff and merge it. That's the entire loop.

To force a specific run type instead of the next one in rotation:

```bash
./run.sh exhibit      # or: bulletin, department
```

No cron, no launchd — run it whenever you're at the desk. (If scheduling is
ever wanted, a one-line launchd job invoking this same script would do it —
intentionally out of scope for now.)

## One-time setup checklist

Everything below is a manual, external-account step — the agent never
touches your GitHub account settings, DNS, or auth.

1. **Authenticate `gh`:**
   ```bash
   gh auth login
   ```
2. **Create the GitHub repo** (public — GitHub Pages custom domains need a
   public repo on the free plan):
   ```bash
   gh repo create kaaostoimisto --public --source=. --remote=origin --push
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

The entire visual identity lives in `assets/tokens.css` — one palette (5
accents + paper/ink neutrals), one type scale, one spacing scale, zero
border-radius except the agency seal. `assets/base.css` builds every
component (masthead, nav, bilingual blocks, cards, exhibit frames) from
those tokens only. This is deliberate and enforced by the agent's own
self-check every run, so the site still looks like one designer made it
after fifty runs.
