# TECHNICAL ARCHITECTURE

**Version:** 1.0
**Status:** Active (authoritative technical specification)
**Governs:** How Venture OS is implemented as software. `PRODUCT.md` defines *what* the system is; this document defines *how it runs*.
**Canonical design system:** `card-atlas-design-system.html` (the "Card Atlas" system). It is canonical and is **not** redesigned here — only consumed.

> Reading order for engineers: `CONSTITUTION.md` → `PRODUCT.md` → this file. Every decision below is justified by **Why it exists**, **Trade-offs**, and **which of the Four Costs it reduces** (Thinking, Learning, Building, Deciding).

---

## 1. ARCHITECTURE PHILOSOPHY

Venture OS is a **static, repository-driven Progressive Web App**. The repository *is* the database; the app is a thin, offline-capable read/render layer over Markdown and a small JSON index. There is no backend, no server-side logic, and no infrastructure cost.

Principles, in priority order:

1. **The repository is the single source of truth.** The app never holds authoritative state; it renders what the repo contains. This mirrors the Stateless Architecture primitive in `PRODUCT.md`.
2. **Files over databases.** Human- and AI-readable Markdown beats an opaque DB for a single-founder OS. Diffable, versioned, portable, greppable.
3. **Boring, durable technology.** Vanilla HTML/CSS/JS and platform APIs (fetch, Service Worker, hash routing). No framework unless a decision below earns it.
4. **Components over bespoke design.** All UI derives from Card Atlas; we compose, we don't invent.
5. **Reversible by default.** Plain files outlive any app. Every choice keeps a cheap exit.

> **Why this philosophy:** it makes the system cheap to build, trivial to host, easy for an AI to maintain, and impossible to lock in.
> **Trade-offs:** no dynamic queries, no server personalization, manual content indexing.
> **Four Costs:** reduces **Building** (no backend/infra), **Thinking** (one source of truth), **Deciding** (reversible, no lock-in).

## 2. TECHNOLOGY STACK

| Layer | Choice | Why / Trade-off |
|---|---|---|
| Markup/Logic | **Vanilla HTML + ES modules (JS)** | No framework runtime, no build. Trade-off: we hand-write a small router/renderer. Reduces **Building**, **Learning**. |
| Styling | **Card Atlas CSS, copied verbatim** | Canonical design system; tokens only. Trade-off: updates must be re-copied (duplication). Reduces **Building**, **Thinking**. |
| Type | **Fraunces / Inter / JetBrains Mono, self-hosted** | Self-hosted woff2 so the PWA works fully offline (Google Fonts CDN fails offline). Trade-off: ~150–250 KB of fonts to precache. Reduces **Learning** (consistent reading). |
| Content format | **Markdown (+ light YAML frontmatter)** | AI- and human-friendly, diffable. Trade-off: needs a parser. Reduces **Thinking**, **Building**. |
| Markdown→HTML | **One vendored, MIT-licensed parser (e.g. `marked`), stored in-repo** | Keeps "zero build / zero backend." Vendored (not CDN) for offline + supply-chain safety. Trade-off: ~30 KB JS + a class-mapping adapter. This is the single biggest piece of non-trivial code — kept deliberately small. Reduces **Building**. |
| Index/metadata | **`index.json`** committed in repo | Static sites can't list directories; the app needs a manifest of content + Venture States. Trade-off: must stay in sync (drift risk — see §15/§18). Reduces **Thinking**. |
| Offline/runtime | **Service Worker + Web App Manifest** | Native PWA APIs; no library. Trade-off: cache-coherence complexity (§9, §11). Reduces **Learning** (instant, offline). |
| Host | **GitHub Pages (branch `main`, root)** | Free, HTTPS, zero ops, already where the repo lives. Trade-off: static-only limits (§10). Reduces **Building**, **Deciding**. |

> **Framework justification test:** a framework (React/Vue) would add a build step, a runtime, and lock-in to render a few dozen Markdown documents. It fails the test. The only earned dependency is the Markdown parser.

## 3. REPOSITORY ARCHITECTURE

One repository holds two concerns, kept clearly separated:

```
venture-os/
├─ index.html              # app shell (Card Atlas <style> + icon sprite, verbatim)
├─ app.js                  # router + renderer (ES module)
├─ sw.js                   # service worker
├─ manifest.webmanifest    # PWA manifest
├─ index.json             # content + venture-state index (the app's map)
├─ .nojekyll              # disable Jekyll (serve files/underscores as-is)
├─ assets/
│  ├─ fonts/              # self-hosted woff2 (Fraunces, Inter, JetBrains Mono)
│  ├─ icons/             # PWA icons (192/512, maskable)
│  └─ vendor/            # marked.min.js (vendored)
├─ CONSTITUTION.md  PRODUCT.md  ROADMAP.md  …   # OS core (source of truth)
└─ docs/
   ├─ ventures/venture-001/…
   ├─ frameworks/        # Knowledge / Core Engines (when extracted)
   ├─ bibles/            # Knowledge
   └─ templates/         # Assets
```

> **Decision — single repo, app at root, content alongside.** **Why:** the repo is both the data and the deployment; Pages serves from `main`/root (Card Atlas rule). **Trade-off:** app files and content files coexist; the app must know which Markdown is "content" via `index.json` rather than scanning. **Four Costs:** reduces **Building** (one repo, one deploy), **Thinking** (Concept→File map from `PRODUCT.md` §8 is the folder plan). Folders under `/docs/*` are created **only when first needed** (no placeholders), consistent with prior decisions.

## 4. DATA ARCHITECTURE

Two data shapes:

1. **Documents** — Markdown files, optionally prefixed with YAML frontmatter:
   ```
   ---
   title: Product
   type: core | venture | knowledge | asset
   state: <venture-state, only for ventures>
   updated: 2026-06-29
   ---
   ```
2. **The index** — `index.json`, the app's authoritative map:
   ```json
   {
     "version": 1,
     "nav": [{ "title": "Product", "path": "PRODUCT.md", "type": "core", "accent": "c2" }],
     "ventures": [{ "title": "Venture 001 — Hospitality Media",
                    "path": "docs/ventures/venture-001/CURRENT_VENTURE.md",
                    "state": "Validation" }]
   }
   ```

> **Decision — frontmatter + a committed index, not a database.** **Why:** metadata co-located with content (frontmatter) plus one fast manifest (`index.json`) the app fetches first. **Trade-off:** `index.json` can drift from the file tree (mitigated in §15/§18 by a generator + verification). **Four Costs:** reduces **Thinking** (structured metadata), **Building** (no DB/queries). Venture `state` values are exactly the nine Venture States from `PRODUCT.md` §5.

## 5. KNOWLEDGE ARCHITECTURE

The Core Primitives from `PRODUCT.md` map directly onto storage and UI:

| Primitive | Storage | Rendered as |
|---|---|---|
| Ventures | `docs/ventures/<id>/` | Cardgrid tiles on home; state shown as pill/track |
| Knowledge | `LESSONS_LEARNED.md`, `docs/frameworks/`, `docs/bibles/` | Doc pages; lessons list |
| Assets | `docs/templates/` + venture deliverables promoted to reuse | Doc pages / download links |
| Core Engines | `docs/frameworks/` (only once extracted — Extraction Rule) | Doc pages |
| Reality / Founder | `CURRENT_CONTEXT.md` / `FOUNDER.md` | Doc pages |

> **Decision — knowledge is files, navigable by type.** **Why:** compounding requires that lessons/assets have a stable home and are findable. **Trade-off:** no semantic search in v1 (future, §15). **Four Costs:** reduces **Learning** (reuse), **Thinking**.

## 6. APPLICATION ARCHITECTURE

A single-page shell with client-side **hash routing**:

- `#/` → home: hero + stats + cardgrid (ventures + core sections).
- `#/doc/<path>` → fetch the Markdown, parse, render into Card Atlas components.
- `app.js` responsibilities: load `index.json` (network-first), build nav/home, route on `hashchange`, fetch+render docs, manage the small render adapter.

> **Decision — hash routing, no clean URLs in v1.** **Why:** GitHub Pages has no server-side rewrites; deep links to real paths 404. Hashes always resolve to `index.html`. **Trade-off:** `#/doc/PRODUCT.md` is uglier than `/doc/product`; a `404.html` redirect trick could give clean URLs but adds moving parts — **deferred as premature** (§18). **Four Costs:** reduces **Building** (robust on Pages with zero config).

## 7. DESIGN SYSTEM INTEGRATION

Card Atlas is the **single source of visual truth**. Binding rules (from the system's own "First principles"):

1. **Copy the `<style>` block + icon `<svg>` sprite verbatim** into `index.html`. Never hand-edit per view.
2. **Tokens only.** No new hex colors or arbitrary px. Use `--primary`, `--radius`, `--shadow`, the ink scale, status colors, and category accents `--c1…--c6`.
3. **Re-theme by variable, not rewrite.** Venture OS v1 adopts the **canonical default theme** (forest green `--primary:#1E5945`) as-is — this is the design system's default, not a redesign. Changing the accent later is a single `[THEME]` block edit and is the founder's call.
4. **Relative links only** (`PRODUCT.md`, never `/PRODUCT.md`) so everything works under `bhanu-thakur.github.io/venture-os/`.
5. **Components over prose.**

Token bindings for the app/PWA:

- `theme_color` = `--primary` `#1E5945`; `background_color` = `--bg` `#F4F6F2`.
- Category accents map to content types: Constitution `--c1`, Product `--c2`, Roadmap `--c3`, Ventures `--c4`, Knowledge `--c5`, Assets `--c6`.

> **Decision — adopt verbatim; theme = default.** **Why:** consistency and zero design debt; the system is explicitly built to be copied. **Trade-off:** verbatim copy means design-system updates require re-copying (duplication risk, §15). **Compatibility note (not a redesign):** the system uses `color-mix()` and Google Fonts; for the offline PWA we self-host fonts (no visual change) and keep `color-mix()` (well-supported in 2026 browsers), retaining the exact look. **Four Costs:** reduces **Thinking**, **Building**, **Learning**.

## 8. COMPONENT ARCHITECTURE

Mapping OS concepts → Card Atlas components:

| OS concept | Component |
|---|---|
| Home overview | `.hero` + `.eyebrow` + `.stats/.stat` |
| Venture / section navigation | `.cardgrid` + `.tile` (live) / `.tile.lock` (e.g., Idea/Archived) |
| Venture State | `.pill--good/watch/brand` for a single state; `.track/.seg` for the full lifecycle |
| A document page | `.card` containing rendered Markdown; section headers `.sec-head.num` |
| Callouts / status | `.note--you/done/warn` |
| Metrics (revenue, targets) | `.minigrid/.cell` (`.cell.lever` for the highlighted KPI) |
| Top navigation | `.topbar/.brand/.nav` |
| Icons | sprite `<use href="#i-...">` (e.g., `i-target`, `i-cash`, `i-building`, `i-camera` for Venture 001) |

**The render adapter (the one tricky part):** `marked` emits class-less HTML (`<h2>`, `<ul>`, `<p>`). Card Atlas styles are largely class-based (`ul.list`, `ol.steps`). Strategy: (a) render Markdown **inside a `.card`**; (b) add a small set of **base-element styles** (raw `h1–h3`, `p`, `ul`, `ol`, `code`, `blockquote`) that consume the same tokens, so prose looks native without per-element classes; (c) reserve true components (cardgrid, track, pills, minigrid) for app-generated UI, not Markdown body.

> **Decision — thin adapter, base styles for prose, components for chrome.** **Why:** avoids a heavy "Markdown-to-components" engine (premature, §18) while keeping the look consistent. **Trade-off:** Markdown bodies won't auto-become rich components; rich layouts are built by the app, not authored in MD. **Four Costs:** reduces **Building** (small code), **Learning**.

## 9. PWA ARCHITECTURE

- **Manifest:** `name`/`short_name` = Venture OS; `start_url` `"."` and `scope` `"."` (relative — required under the `/venture-os/` subpath); `display` standalone; `theme_color`/`background_color` per §7; maskable icons 192/512.
- **Service worker (`sw.js`):**
  - **Precache (cache-first):** app shell — `index.html`, `app.js`, `marked`, fonts, icons, `manifest`.
  - **Runtime:** `index.json` → **network-first** (freshness matters most); `*.md` → **stale-while-revalidate** (instant + self-healing).
  - **Versioned cache** (`vos-cache-v<n>`); on activate, delete old caches; `skipWaiting` + `clients.claim` paired with an in-app "Update available — reload" affordance.

> **Decision — cache-first shell, network-first index, SWR for docs.** **Why:** instant offline app while honoring "the repository wins" — content stays as fresh as the network allows and never blocks. **Trade-off:** a just-edited doc may show a previous version for one view until revalidation; the index being network-first bounds staleness. **Four Costs:** reduces **Learning** (always available), **Building**.

## 10. GITHUB PAGES DEPLOYMENT STRATEGY

- **Source:** Deploy from branch `main`, `/` (root). No build step.
- **URL:** `https://bhanu-thakur.github.io/venture-os/`.
- **`.nojekyll`** committed so Jekyll doesn't process/ignore files (e.g., anything underscore-prefixed) — serve the tree as-is.
- **Relative links + relative `start_url`/`scope`** so app, SW, and manifest all resolve under the project subpath.
- **HTTPS** is automatic (required for Service Workers).

> **Decision — Pages from main/root, no Actions in v1.** **Why:** simplest possible deploy; push = publish. **Trade-offs / limits:** ~1 min publish latency; static only (no server routing → §6 hash routing); free-tier Pages serves public repos only (the repo is public, so fine — flagged if it ever goes private); response headers not configurable (CSP only via `<meta>`; cache behavior handled by the SW). **Four Costs:** reduces **Building**, **Deciding** (no ops).

## 11. STATE MANAGEMENT

- **Authoritative state lives in the repo**, not the client.
- **Client state is ephemeral:** current route (the URL hash), an in-memory content cache, and small UI prefs (e.g., last-viewed) in `localStorage`.
- No global store, no reactivity library. A tiny module pattern in `app.js`.

> **Decision — minimal client state, repo is the store.** **Why:** eliminates state-sync bugs entirely; reload = truth. **Trade-off:** no optimistic UI / offline editing in v1 (editing happens in the repo via the AI/founder, then deploys). **Four Costs:** reduces **Thinking**, **Building**.

## 12. AI INTEGRATION

AI integration is an **authoring/maintenance loop, not a runtime dependency** (zero backend means no runtime AI calls).

- The AI Reasoning Engine reads the repo, proposes changes, and writes Markdown + `index.json`, committing via GitHub with conventional messages — then verifies by read-back (the established protocol).
- **AI-friendliness is a design goal:** plain Markdown, a documented frontmatter schema, the `index.json` contract, predictable folder conventions (Concept→File map), and small, readable app code.
- **Optional future affordance:** a "Copy context" button that concatenates selected docs for pasting into an AI session (still no backend).

> **Decision — AI at authoring time only.** **Why:** keeps cost at zero and the app fully static/offline; the compounding loop runs through git, not an API. **Trade-off:** no in-app chat/generation in v1. **Four Costs:** reduces **Thinking**, **Learning**, **Building**.

## 13. PERFORMANCE

- No framework runtime; shell is HTML + one small JS module + one parser.
- **Budget:** app JS (excl. fonts) < ~80 KB; first contentful paint near-instant on repeat visits (cache-first shell).
- Fonts precached and `font-display:swap`; icons are inline SVG (no requests).
- Targets: Lighthouse PWA pass; Performance ≥ 95 on mid-range mobile.

> **Decision — performance by subtraction.** **Why:** the cheapest fast app is the one with almost no code. **Trade-off:** none material at this scale. **Four Costs:** reduces **Learning** (speed = usage), **Building**.

## 14. SECURITY

- **No backend = minimal attack surface.** No auth, no user data, no server to breach.
- **Public repo:** everything published is world-readable (the founder chose Public). **Hard rule: never commit secrets, credentials, or sensitive venture/customer data.** Sensitive material stays out of the repo entirely.
- **CSP via `<meta>`** restricting to `'self'` (all assets are self-hosted/vendored — no third-party origins at runtime).
- Service worker served over HTTPS (Pages default).

> **Decision — static + self-hosted + no secrets.** **Why:** removes whole classes of risk. **Trade-off:** public visibility constrains what can live here (mitigated by discipline; switch repo to Private if private data becomes necessary). **Four Costs:** reduces **Thinking**, **Building**.

## 15. SCALABILITY

- **Content scale:** client-side rendering and a JSON index are comfortable into the hundreds of documents. Beyond that, move index generation to build-time (GitHub Action) and/or add pagination to the cardgrid.
- **Portfolio scale:** many ventures → filter/segment the home cardgrid by Venture State; lock non-active tiles (Idea/Archived) to protect focus.
- **GitHub Pages soft limits:** ~1 GB repo, ~100 GB/month bandwidth, ~10 builds/hour — generous headroom for a single-founder OS.
- **Known ceilings:** no relational queries, no full-text search in v1 (add a client-side search index later).

> **Decision — scale by adding build-time generation later, not now.** **Why:** avoid premature infrastructure; current scale needs none. **Trade-off:** a future inflection point requires adding an Action. **Four Costs:** reduces **Building**, **Deciding**.

## 16. FUTURE MIGRATION STRATEGY

Because content is plain Markdown + JSON in git, every exit stays cheap:

- **Add a static site generator** (Astro/11ty/Eleventy) for build-time rendering and clean URLs — content unchanged.
- **Move hosting** to Netlify/Cloudflare Pages/any CDN — same files.
- **Add a backend/API** later that reads the same files; or expose content via the GitHub API.
- **Export** is trivial — it's already a folder of Markdown.

> **Decision — optimize for reversibility, avoid lock-in.** **Why:** the data must outlive the app. **Trade-off:** we forgo some conveniences a framework gives today. **Four Costs:** reduces **Deciding** (low switching cost).

## 17. IMPLEMENTATION ROADMAP

Incremental, each step shippable; maps to `ROADMAP.md` Phase 0 (Foundation):

1. **Shell + one doc.** `index.html` with Card Atlas verbatim; `app.js` fetches and renders `PRODUCT.md` into a `.card`; `.nojekyll`; enable Pages. *Proves the pipeline end-to-end.*
2. **Home + routing.** `index.json`; hero/stats + cardgrid of core docs + ventures; hash routing across all core docs.
3. **Venture States UI.** Render venture state as pill/track; lock non-active tiles; Venture 001 page.
4. **PWA hardening.** `manifest.webmanifest`, icons, `sw.js` (precache shell, network-first index, SWR docs), self-host fonts, "update available" affordance. *Now installable + offline.*
5. **Polish + verify.** CSP meta, Lighthouse pass, base-element prose styles, `index.json` generator/verification.

Each step is one or more commits, each verified by read-back per protocol. No step introduces a backend or a framework.

## 18. ARCHITECTURE REVIEW & KNOWN LIMITATIONS (performed pre-finalization)

A formal review was run against complexity, premature abstraction, and platform limits. Findings and their mitigations (reflected in the decisions above):

- **Unnecessary complexity — the Markdown render adapter.** Risk: a "Markdown→rich components" engine could balloon. **Mitigation:** thin adapter, base-element styles for prose, components reserved for app-generated chrome (§8).
- **Premature abstraction — defer.** Core Engines, a content-type registry/plugin system, a theme switcher UI, clean-URL routing, and full-text search are **explicitly out of v1**. Build them only when a real second venture or scale pressure demands.
- **Caching vs "repository wins."** A service worker can serve stale content. **Mitigation:** network-first `index.json`, SWR for docs, versioned cache, visible update affordance (§9, §11).
- **`index.json` drift.** A hand-maintained index re-creates the repo's drift problem. **Mitigation:** a tiny generator script (optionally a GitHub Action) plus a verification step in the workflow (§4, §15).
- **Design-system duplication.** "Copy verbatim" means Card Atlas updates must be re-pasted into `index.html`. **Mitigation:** treat the shell's `<style>` block as generated-from-canonical; document the re-copy step; never hand-edit it.
- **GitHub Pages limitations.** No server routing (→ hash routing, `.nojekyll`), ~1 min deploys, public-only on free tier (repo is public), no custom headers (CSP via meta, caching via SW) (§10).
- **PWA limitations.** iOS Safari: manual "Add to Home Screen," constrained SW storage, unreliable push, possible SW eviction; offline requires self-hosted fonts; first load needs network (§9).
- **Scalability ceilings.** Client rendering + JSON index are fine into the hundreds of docs; beyond, move to build-time generation and add pagination/search (§15).

**Review verdict:** the architecture is appropriately minimal for a single-founder, zero-cost, repository-driven OS. The only non-trivial code is the Markdown renderer, which is contained. No backend, no framework, and no premature infrastructure are justified at v1.

---

## HOW THIS DOCUMENT EVOLVES

Stable, but less locked than `PRODUCT.md`. It changes when a real implementation constraint or a deliberate stack decision requires it (e.g., adopting a build step at scale). Every change bumps the version, is logged in `CHANGELOG.md`, with rationale in `DECISION_LEDGER.md`. The canonical design system (`card-atlas-design-system.html`) is referenced, never forked.
