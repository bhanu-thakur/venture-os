# CHANGELOG

**Status:** Active ledger
**Purpose:** The operational history of Venture OS — *what* changed and *when*, in reverse-chronological order. The CHANGELOG answers "what happened to the system?"; `DECISION_LEDGER.md` answers "why?". Each entry should be terse and link to the ledger for rationale.

**How it evolves:** Append-only. A new dated entry is added whenever a Core OS file is created, frozen, or structurally changed, or a venture changes state. Never rewrite history; corrections are new entries.

---

## 2026-06-29 (Phase 3 — Mission home screen)
* **Mission replaces the Dashboard as the landing experience** (`#/`). Renders the active venture's `mission.md` + `README.md` as a single-focus cockpit: quiet orientation (venture · State), the day's win (serif headline), one focal next-action card, the Venture-State journey path (Idea→Scale, current highlighted), a revenue-to-target line, and why-it-matters / proof on demand — with calm staggered entrance motion. Retired the survey dashboard and dead helpers. `sw.js` cache `v3→v4`. Built per the approved Experience Architecture. Verified locally (jsdom: Mission renders from real content, 0 console errors).

## 2026-06-29 (repository migration — holding-company layout)
* **Repository restructured** to the holding-company layout (ADR-0016/0017): `os/` (Core OS), `founder/`, `ventures/` (portfolio), `library/`, `static/`; app shell at root. Moved OS docs → `os/`, app assets → `static/`, reality → `founder/context.md`; retired `CURRENT_VENTURE.md` (→ `ventures/README.md` + venture README + `NEXT.md`). Venture data is Markdown-first (ADR-0015; no `venture.json`). Updated `index.json`, `index.html`, `manifest`, `sw.js` (cache `v2→v3`), `app.js`, and the `START_HERE.md` boot sequence. `TECHNICAL_ARCHITECTURE.md` → v2.1 (§9 layout). Verified locally (jsdom: dashboard/knowledge/doc render, 0 console errors).

## 2026-06-29 (Phase 2 — Knowledge Library)
* **Knowledge Library implemented** (Implementation Roadmap step 2/3). New `#/knowledge` route groups the Knowledge Layer into 5 categories (Orientation, Doctrine, Product & Strategy, Architecture, Decisions & History) as browsable tiles opening the live document reader; added a Knowledge nav link + active-state handling. `index.json` now carries `category` metadata and includes README + Constitution Amendments (10 docs). Files: `app.js`, `index.json`, `index.html`, `sw.js` (cache `v1→v2`). Verified locally (jsdom: 5 sections, 10 tiles, 0 console errors). No architecture change; read-only.

## 2026-06-29 (Phase 1 — Dashboard)
* **Dashboard implemented** (Implementation Roadmap step 2). Home route now renders live repository data: current focus (`NEXT.md`), active venture + status (`CURRENT_VENTURE.md`), reality (`CURRENT_CONTEXT.md`), recent activity (`CHANGELOG.md`), plus the document grid. File: `app.js`. Verified locally (jsdom, 0 console errors). No architecture change; read-only.

## 2026-06-29 (Phase 0 — foundation shell)
* **PWA foundation shell implemented** (Implementation Roadmap step 1): `index.html` (Card Atlas integrated verbatim), `app.js` (hash routing + repository-driven Markdown rendering via vendored `marked`), `sw.js` (offline: cache-first shell, network-first index, SWR docs), `manifest.webmanifest`, `index.json`, `.nojekyll`, `marked.min.js`, and PWA icons. No features beyond the shell.
* **Implementation ADRs:** ADR-0012 (flat root layout due to web-UI commit tooling) and ADR-0013 (Phase 0 font delivery via CDN link + SW cache). The frozen architecture was not modified.

## 2026-06-29 (architecture freeze)
* **TECHNICAL_ARCHITECTURE.md v2.0 — FROZEN.** Final refinement pass: added an explicit **Ownership Model** (§1.1), reframed the Application Layer as the runtime that transforms Knowledge + Domain into an interactive OS (not a docs website), strengthened the repository as **durable memory / reconstructable / portable** with `index.json` declared disposable, added **Reconstructability & Failure Recovery** (§9.1), and made **design-system independence** explicit (§6.4). Trimmed the review verdict. (See ADR-0010, ADR-0011.)
* **ARCHITECTURE_DECISIONS.md** — added ADR-0010 (reconstructability) and ADR-0011 (design system is a replaceable dependency).

## 2026-06-29 (architecture review)
* **TECHNICAL_ARCHITECTURE.md v1.0 → v2.0** after a formal Architecture Design Review. Restructured around five explicit layers (Knowledge, Domain, Application, Reasoning, Execution); corrected "repository is the database" → repository is the source of truth, app derives runtime state; added a Domain Model (Venture, Project, Client, Opportunity, Asset, Skill, Lesson, Framework, Decision); made the Compounding Loop explicit; generalized the AI Reasoning Engine (vendor-neutral); added Known Technical Debt and SemVer; removed nice-to-haves. (See `ARCHITECTURE_DECISIONS.md`.)
* **ARCHITECTURE_DECISIONS.md created** — technical ADRs (ADR-0001…0009), distinct from the strategic `DECISION_LEDGER.md`.
* **Semantic Versioning adopted** for Core OS spec documents.

## 2026-06-29 (later)
* **TECHNICAL_ARCHITECTURE.md v1.0 — created.** Authoritative technical spec: Venture OS as a static, repository-driven PWA on GitHub Pages — vanilla HTML/CSS/JS, zero backend, zero infra cost, offline-capable, mobile-first. 18 sections incl. a pre-finalization architecture review. (See `DECISION_LEDGER.md`.)
* **Canonical design system adopted** — `card-atlas-design-system.html` committed to the repo as the single source of visual truth (consumed, not redesigned).
* **Implementation order changed** — TECHNICAL_ARCHITECTURE.md inserted before ASSUMPTIONS.md.

## 2026-06-29
* **PRODUCT.md v1.0 — created, design-reviewed, and FROZEN.** Establishes Core Primitives (Founder, Reality, AI Reasoning Engine, Ventures, Knowledge, Assets, Core Engines), each with a single home and a single responsibility; the Venture States lifecycle; the Portfolio concept; and the Concept→File map. (See `DECISION_LEDGER.md`.)
* **Venture States lifecycle introduced** — 9 states from Idea to Archived, replacing the coarse "Active" status.
* **CHANGELOG.md created** (this file).
* **DECISION_LEDGER.md updated** — added four 2026-06-29 entries; replaced the broken `[Date]` placeholder.
* **Core OS build sequence underway** — order: PRODUCT → ROADMAP → CHANGELOG → ASSUMPTIONS → LESSONS_LEARNED, before Venture 001 execution.
