# CHANGELOG

**Status:** Active ledger
**Purpose:** The operational history of Venture OS — *what* changed and *when*, in reverse-chronological order. The CHANGELOG answers "what happened to the system?"; `DECISION_LEDGER.md` answers "why?". Each entry should be terse and link to the ledger for rationale.

**How it evolves:** Append-only. A new dated entry is added whenever a Core OS file is created, frozen, or structurally changed, or a venture changes state. Never rewrite history; corrections are new entries.

---

## 2026-06-30 (Skill tracks — the rung system, for every venture)
* **Every venture now has the rung system, with multiple skill tracks** (technical *and* soft skills). Hospitality Media: **Food Cinematography** + **Closing Hotels** (negotiation/sales). Wedding Films: **Cinematic Editing** + **Cinematic Shooting**. A new **Skills** section on each workspace lists tracks with live progress and the literal next action; a skills chooser lives at `#/v/<slug>/learn`, each track at `#/v/<slug>/learn/<trackId>`.
* **Rungs are richer and more actionable.** Each rung now carries a **Goal**, a short **Lesson**, a list of concrete real-world **Do** actions (each individually checkable — the "get off your seat" core), a **Milestone** proof piece, and a **Review**. A **Do this now** card surfaces the single next action verbatim. Completing every action + the milestone banks a portfolio piece, registers a streak day, and opens the next rung. More rungs per track (5–6) and an explicit milestone each.
* **Engine generalised + data-driven:** `parseTrack` reads Goal/Lesson/Do-list/Milestone/Review from each track's Markdown (source of truth); per-venture, per-track progress (`vos:<slug>:learn.tracks.<id>`); v1 single-curriculum progress auto-migrates into the first track. Wedding Films' editing curriculum rewritten to the rich format; `index.json` carries `tracks[]` per venture.
* `sw` cache `v13→v14`. Verified: track parser + rung state machine unit-tested (parses Goal/Do-list/Milestone across all 4 tracks, completion banks + advances + clamps); `app.js` syntax-checked.

## 2026-06-30 (Learning Engine — curriculum becomes execution)
* **Learning is now a first-class workflow, not documentation.** New route `#/v/<slug>/learn` turns a learning venture's `curriculum.md` into a guided loop: the runtime parses each rung into **Lesson → Challenge → Deliverable → Review** and walks the founder one step at a time. The "45 free minutes" answer: a single **Do this now** focal action surfaces the next incomplete step.
* **Built for doing, not reading.** Each rung is a four-step checklist (study → do the real challenge → ship the deliverable → review). Completing a rung **banks a portfolio piece** (with an optional link/note), **registers a streak win** (finished work counts), and opens the next rung. A progress track shows shipped vs current vs upcoming rungs; a portfolio list shows every piece shipped.
* **Curriculum.md restructured** to be both human-readable and machine-parseable (per-rung Lesson/Challenge/Deliverable/Review fields) — Markdown stays the source of truth; the app derives the runtime (no new data format, ADR-0015 honoured).
* **Workspace wiring:** learning ventures now show a prominent **Continue learning** card (current rung · next step · pieces shipped) above the daily plan. Per-venture working layer holds learning progress (`vos:<slug>:learn`).
* `sw` cache `v12→v13`. Verified: curriculum parser + rung state machine unit-tested (12/12 — parses 5 rungs, ignores prose, completes a rung → banks a portfolio piece, advances, clamps at last rung); `app.js` syntax-checked (`node --check`, incl. the full `renderLearn` block); `index.html` structure reviewed clean.

## 2026-06-30 (Founder HQ + multi-venture workspaces — the holding company becomes operable)
* **The homepage now belongs to the founder, not a venture.** `#/` is **HQ**: greeting + company identity, a single "Needs you today" card (the active venture's objective + next action), decisions waiting across ventures, portfolio stats (streak · leads in play · earned across ventures), the venture grid, and "what moved recently." Mission moved *inside* the venture. This activates the Experience Architecture's **Portfolio tier** (designed to switch on at ≥2 ventures) — no doctrine changed.
* **Context-aware venture workspaces** at `#/v/<slug>`: each venture is its own room — its own Mission cockpit (objective, plan, capture-a-win, streak), its own **per-venture working layer** (state no longer mixed between ventures), workspace module tiles (its playbook/learning docs), a scoped Pipeline, journey, and revenue. Client vs learning ventures adapt (e.g. "Move one lead forward" vs "Finish one practice rep").
* **Deliberate focus-switching (anti shiny-object).** Switching today's focus is a confirmed action ("X will be paused — nothing is lost"), stored in the working layer; the repository's `activeVenture` stays the canonical default. Idea-state ventures can't be activated directly ("Validate before activating"). The OS makes switching intentional rather than rewriting the homepage on impulse.
* **Pipeline is now per-venture** (`#/v/<slug>/pipeline`); legacy global working state auto-migrates into Venture 001 on first load.
* **Venture 002 — Wedding Films created** (Validation, learning venture): `README`, `mission`, `learning/curriculum · references · practice`, `business/opportunities`. Captured and parked — Venture 001 remains the canonical active focus until its first spec reel exists.
* `index.json` → v2 (ventures carry slug/type/accent/modules; `nav` is now OS-only). Library reframed to the OS knowledge shelf (venture playbooks live in their workspaces). Topbar: **HQ · Library**. `sw` cache `v11→v12`. Verified locally (jsdom: HQ, both workspaces, switch, scoped pipeline — 0 console errors).

## 2026-06-29 (Pipeline — the leads you’re chasing)
* New **Pipeline** experience (working layer, ADR-0018): add a lead (name · type · next action), move it **To reach → In talks → Won**, remove it; live per-stage counts. A Pipeline link + count now surfaces on Mission, tying the daily loop to real outreach. `sw` cache `v8→v9`. Verified locally (jsdom: add / advance / remove persist, 0 errors).

## 2026-06-29 (interactive cockpit — working layer)
* **Mission becomes a cockpit you operate** (ADR-0018): an interactive **Today’s plan** (check items off, progress bar), **Capture a win** that saves and lists recent wins, a real-progress **streak**, and **launch pads** (Message on WhatsApp · Research references). State persists in the browser working layer; the repository stays the canonical record. `sw` cache `v7→v8`. Verified locally (jsdom: capture saves + streak + checks persist, 0 errors).

## 2026-06-29 (Mission complete + Experience Architecture frozen)
* **Experience Architecture v1.0 frozen** as `os/EXPERIENCE_ARCHITECTURE.md` (added to the boot sequence and Knowledge nav). The loop is the product; Mission is the only daily home; Knowledge/Review/Portfolio/Founder/Assets are reference summoned via a future Command Palette.
* **Mission upgraded to the complete daily experience:** added the **"Since last time"** delta (honest movement from local UI memory vs current repo values), a one-line **Capture** affordance (generates a paste-ready log entry; the founder commits — no in-app persistence), and a **decision beat** that surfaces on Mission when a venture has a pending decision (gated on content). `sw.js` cache `v5→v6`. Verified locally (jsdom, 0 console errors). Aligns with the frozen Experience Architecture.

## 2026-06-29 (Phase 3 — service-worker update-reliability fix)
* `sw.js`: pre-cache shell assets with `{cache:'reload'}` so install **bypasses GitHub Pages' HTTP cache** and always stores the freshly-deployed files — fixes the stale-on-deploy cache poisoning observed during Phase 3 verification (returning visitors served an old build). Cache `v4→v5`. Addresses the caching item in `TECHNICAL_ARCHITECTURE.md` §12.

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
