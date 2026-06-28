# TECHNICAL ARCHITECTURE

**Version:** 2.0
**Status:** Active (authoritative technical specification)
**Supersedes:** v1.0 (post Architecture Design Review — layered redesign)
**Governs:** How Venture OS is implemented as software. `PRODUCT.md` defines *what* the system is; this document defines *how it runs*.
**Canonical design system:** `card-atlas-design-system.html` ("Card Atlas") — consumed verbatim, never redesigned here.
**Decision record:** technical decisions are logged as ADRs in `ARCHITECTURE_DECISIONS.md`; strategic/venture decisions in `DECISION_LEDGER.md`.

> Each major decision is justified by **Why**, **Trade-offs**, and the **Four Costs** it reduces (Thinking, Learning, Building, Deciding). This document is deliberately minimal: per the Constitution, *simplicity beats unnecessary complexity*.

---

## 1. ARCHITECTURE PHILOSOPHY

Venture OS is a **repository-driven, AI-reasoned operating system** with an offline-capable Progressive Web App as its interface.

The foundational distinction — and the correction at the heart of v2.0:

> **The repository is NOT a database.** It is the **authoritative, version-controlled source of truth**. It holds the Knowledge Layer (Markdown) and the Domain Layer (JSON). The application **derives disposable runtime state** (caches, routes, view models) from repository contents. Runtime state is temporary; the repository is permanent. Reload = truth.

Principles, in priority order:

1. **Repository is the source of truth.** Nothing is real until committed. (`PRODUCT.md` Stateless Architecture.)
2. **Files over services.** Human- and AI-readable Markdown + JSON, diffable and portable, beat an opaque backend for a single-founder OS.
3. **Boring, durable technology.** Vanilla HTML/CSS/JS and platform APIs. No framework unless a decision earns it.
4. **Layered separation of concerns.** Five explicit layers (§2), never blended.
5. **Components over bespoke design.** All UI derives from Card Atlas.
6. **Reversible by default.** Plain files outlive any app; every choice keeps a cheap exit.

> **Four Costs:** reduces **Building** (no backend/infra), **Thinking** (one source of truth), **Deciding** (no lock-in).

## 2. THE FIVE LAYERS

Venture OS is organized into five layers. Each has a single concern; they communicate only through the repository.

| Layer | Concern | Form | Realizes (`PRODUCT.md` primitive) |
|---|---|---|---|
| **Knowledge** | Durable understanding, rules, doctrine | Markdown | Knowledge |
| **Domain** | Structured first-class entities of the business | JSON | Ventures, Assets |
| **Application** | The PWA: routing, rendering, UI, offline | HTML/CSS/JS | (the interface) |
| **Reasoning** | Reading, proposing, authoring, syncing | AI Reasoning Engine + git | AI Reasoning Engine |
| **Execution** | The real world: founder, clients, revenue | Reality | Founder, Reality |

> **These layers are an implementation view; they do not create new primitives.** The Core Primitives in `PRODUCT.md` are frozen. The Domain Layer elaborates *within* the Ventures primitive; it never promotes a domain entity to a top-level primitive without a `PRODUCT.md` amendment.
>
> **Why a layer model:** it lets each concern evolve independently — the app can be rewritten without touching Knowledge; the AI Reasoning Engine can be swapped without touching the Domain. **Four Costs:** reduces **Building**, **Deciding**.

## 3. THE COMPOUNDING LOOP (THE OPERATING LOOP)

This is the fundamental cycle of Venture OS:

```
        Reality
           │  (captured into)
           ▼
       Repository  ◀────────────┐
           │  (read by)         │
           ▼                    │ (outcomes written back)
      AI Reasoning              │
           │  (drives)          │
           ▼                    │
       Execution ───────────────┘
           │  (changes)
           ▼
        Reality
```

Reading the loop by layer: **Reality** (Execution Layer) is captured into the **Repository** (Knowledge + Domain Layers); the **AI Reasoning Engine** (Reasoning Layer) reads the repository and proposes decisions, content, and next actions; the founder and clients turn those into **Execution** — deliverables and revenue; outcomes are written **back** into the repository; which moves **Reality** forward. Each turn should also strengthen the system (extract a Lesson, create an Asset) — that is what makes the loop *compound* rather than merely repeat.

> **Why explicit:** the loop is the product. Naming it keeps every feature accountable to it. **Four Costs:** reduces **Thinking**, **Deciding**.

## 4. KNOWLEDGE LAYER

Durable, generalized understanding — written as **Markdown**, the source of truth for *meaning*.

| Knowledge | File / home |
|---|---|
| Doctrine (how we think/behave) | `CONSTITUTION.md`, `CONSTITUTION_AMENDMENTS.md` |
| Product definition | `PRODUCT.md` |
| Strategy / sequencing | `ROADMAP.md` |
| Reality (mutable grounding) | `CURRENT_CONTEXT.md` |
| Founder profile & skills | `FOUNDER.md` *(when needed)* |
| Lessons | `LESSONS_LEARNED.md` |
| Frameworks / Core Engines | `docs/frameworks/` *(when extracted)* |
| Bibles (brand/marketing IP) | `docs/bibles/` *(when needed)* |

Knowledge is prose meant to be read and reasoned over. It is **not** queried as data. Optional light YAML frontmatter (`title`, `type`, `updated`) aids navigation.

> **Four Costs:** reduces **Learning** (reuse), **Thinking**.

## 5. DOMAIN LAYER & DOMAIN MODEL

The structured, first-class **entities** of the business — represented as **JSON domain objects** so the application can render and the AI can reason over them deterministically. JSON is for *things with state and relationships*; Markdown is for *meaning*.

### 5.1 The Domain Model (permanent entities)

| Entity | Definition | Home |
|---|---|---|
| **Venture** | A business being built; always in one Venture State (`PRODUCT.md` §5). | `docs/ventures/<id>/venture.json` + Markdown |
| **Project** | A bounded unit of work inside a venture (e.g., a shoot, a campaign). | `projects[]` in `venture.json` |
| **Client** | A customer or prospect of a venture. **PII-sensitive** (see §11/§13). | `clients[]` in `venture.json` *(anonymized in public repo)* |
| **Opportunity** | A potential venture or deal not yet activated. | `docs/opportunities.json` |
| **Asset** | A reusable artifact (template, playbook, proof piece, code). | `docs/templates/` + promoted deliverables; indexed in `assets[]` |
| **Skill** | A founder capability being acquired or mastered. | `skills[]` in `FOUNDER.md`/founder data |
| **Lesson** | An extracted, generalized learning. | `LESSONS_LEARNED.md` |
| **Framework** | A reusable mental model or Core Engine. | `docs/frameworks/` |
| **Decision** | A recorded choice + rationale. | `DECISION_LEDGER.md` (strategic) / `ARCHITECTURE_DECISIONS.md` (technical) |

### 5.2 Minimalism rule
Not every entity gets its own store at v1. Most live **embedded** in `venture.json`; separate files appear only when an entity is referenced across ventures (e.g., shared Assets). Avoid premature normalization.

### 5.3 The index
`index.json` (repo root) is the application's map — an aggregated, derived view linking Knowledge docs and Domain objects for navigation and Venture-State display. It is a **convenience projection of the source of truth**, not a second source.

> **Why JSON domain objects:** they give the app and the AI a precise contract for entities with state, without a backend. **Trade-off:** `index.json` and embedded objects can drift from prose (debt item §12). **Four Costs:** reduces **Thinking**, **Building**.

## 6. APPLICATION LAYER

The PWA — the interface that renders the repository.

### 6.1 Technology stack
Vanilla **HTML + ES modules**; **Card Atlas CSS verbatim**; self-hosted **Fraunces/Inter/JetBrains Mono** (offline); one vendored MIT Markdown parser (e.g. `marked`) in `assets/vendor/`. No framework.

> **Framework justification test:** a framework adds a build, a runtime, and lock-in to render a few dozen documents — it fails. The only earned dependency is the Markdown parser. **Four Costs:** reduces **Building**, **Learning**.

### 6.2 Routing
Client-side **hash routing** (`#/`, `#/doc/<path>`, `#/venture/<id>`). GitHub Pages has no server rewrites; hashes always resolve to `index.html`.
> **Trade-off:** uglier URLs; a clean-URL `404.html` trick is **deferred** (debt §12).

### 6.3 Rendering
`app.js` loads `index.json` (network-first), builds home + nav, and on route fetches Markdown/JSON and renders. **Render adapter:** Markdown is rendered inside a `.card`; a small set of base-element styles (raw `h1–h3`, `p`, `ul`, `code`, `blockquote`) consume Card Atlas tokens so prose looks native. True components (cardgrid, track, pills, minigrid) are built by the app from Domain objects, not authored in Markdown.

### 6.4 Design System Integration (Card Atlas)
Binding rules: copy the `<style>` block + icon sprite **verbatim**; **tokens only** (no new hex/px); **re-theme by variable** — v1 adopts the canonical default theme (`--primary:#1E5945`); **relative links only** (works under `/venture-os/`). Token bindings: PWA `theme_color`=`--primary`, `background_color`=`--bg`; content types map to category accents `--c1…--c6`. Compatibility-only adaptations (self-host fonts; keep `color-mix()`) are **not** visual changes.

### 6.5 Component mapping
Home → `.hero`+`.stats`+`.cardgrid`; Venture → `.tile`(live)/`.tile.lock`(Idea/Archived); Venture State → `.pill` or `.track/.seg`; document → `.card`; metrics → `.minigrid/.cell`; nav → `.topbar/.brand/.nav`; callouts → `.note`.

### 6.6 PWA & offline
`manifest.webmanifest` (`start_url`/`scope` = `"."` for the subpath; standalone; maskable icons). `sw.js`: precache shell (cache-first); `index.json` network-first; `*.md`/`*.json` stale-while-revalidate; versioned cache + "update available — reload" affordance.
> **Why these cache rules:** instant + offline while honoring "the repository wins" — content stays as fresh as the network allows and never blocks. **Trade-off:** a just-edited doc may show the prior version for one view. **Four Costs:** reduces **Learning**, **Building**.

### 6.7 State management
Authoritative state is in the repository. Client state is **ephemeral**: route hash, in-memory content cache, small UI prefs in `localStorage`. No global store, no reactivity library.

### 6.8 GitHub Pages deployment
Deploy from `main`/root; no build step; URL `https://bhanu-thakur.github.io/venture-os/`; `.nojekyll` committed; HTTPS automatic (required for Service Workers).

### 6.9 Performance & security
Performance by subtraction: app JS (excl. fonts) < ~80 KB; cache-first shell ≈ instant; Lighthouse PWA pass target. Security: no backend = minimal surface; **public repo — never commit secrets or client PII**; CSP via `<meta>` restricted to `'self'` (all assets self-hosted/vendored).

## 7. REASONING LAYER

The **AI Reasoning Engine** — vendor-neutral. The architecture must work equally with any capable AI processor (commercial, open, or local). It is defined by *interfaces and protocol*, never by a specific model.

Responsibilities:
- **Session reconstruction:** boot from the repository via `START_HERE.md`; never rely on chat memory.
- **Repository synchronization:** read current state; propose changes to Knowledge (Markdown) and Domain (JSON).
- **Authoring workflow:** write changes → commit with conventional messages → **verify by reading the file back** from the repository → report. Stop on any verification failure.
- **No runtime dependency:** the Application Layer makes **zero** AI calls. Reasoning happens at authoring time, through git — not in the running app.

> **Why vendor-neutral + authoring-time only:** keeps cost at zero, the app fully static/offline, and prevents lock-in to any one AI. **Four Costs:** reduces **Thinking**, **Learning**, **Building**, **Deciding**.

## 8. EXECUTION LAYER

The real world — where value and revenue actually happen. The OS exists to serve this layer, not the reverse (`CONSTITUTION.md`: the OS succeeds only if it helps build real ventures).

| Element | Role |
|---|---|
| **Founder** | Makes decisions and executes (the only actor who acts in the world). |
| **Clients** | Sources of validation and revenue; demand is proven by cleared payments. |
| **Deliverables** | The work shipped (e.g., Venture 001 media assets). |
| **Revenue** | The hardest evidence of validation. |
| **Reality** | Constraints and results that feed back into the repository. |

The Execution Layer **writes outcomes back** into the repository (new Reality, Lessons, Assets, updated Venture State), closing the Compounding Loop (§3).

> **Four Costs:** the layer the other four exist to serve.

## 9. REPOSITORY ARCHITECTURE

One repository, layered concerns, app at root:

```
venture-os/
├─ index.html  app.js  sw.js  manifest.webmanifest   # Application Layer
├─ index.json                                          # derived nav/state projection
├─ .nojekyll
├─ assets/{fonts,icons,vendor}/
├─ CONSTITUTION.md PRODUCT.md ROADMAP.md TECHNICAL_ARCHITECTURE.md
│  ARCHITECTURE_DECISIONS.md DECISION_LEDGER.md CHANGELOG.md …  # Knowledge Layer
├─ card-atlas-design-system.html                       # canonical design system
└─ docs/
   ├─ ventures/venture-001/{venture.json, *.md}        # Domain + Knowledge
   ├─ frameworks/  bibles/                              # Knowledge
   ├─ templates/                                        # Assets
   └─ opportunities.json                                # Domain
```

The repository is the **authoritative store**; the running app holds only derived, disposable state. Folders under `/docs/*` are created **only when first needed** (no placeholders).

## 10. SCALABILITY

Client rendering + a JSON index are comfortable into the hundreds of documents. Beyond that: move index generation to build-time (a GitHub Action) and paginate the cardgrid. Portfolio scale: filter the home grid by Venture State, lock non-active tiles to protect focus. GitHub Pages soft limits (~1 GB repo, ~100 GB/mo bandwidth) are generous. Known ceilings: no relational queries, no full-text search in v1.

> **Decision — scale by adding build-time generation later, not now.** Avoid premature infrastructure. **Four Costs:** reduces **Building**, **Deciding**.

## 11. FUTURE MIGRATION & MODULARITY

**Migration:** because content is Markdown + JSON in git, every exit is cheap — adopt a static site generator (Astro/11ty) for build-time rendering and clean URLs; move hosting to any CDN; add an API that reads the same files; or simply export the folder. The data outlives the app.

**Modularity through extraction, not plugins.** Venture OS does **not** add a plugin system. Instead, a proven venture contributes reusable **Assets** and **Core Engines** via the Extraction Rule (a process proven twice). Over time, ventures stop being hard-coded one-offs and become *composable building blocks* — modularity earned from real usage, with zero added framework complexity.

> **Four Costs:** reduces **Deciding** (low switching cost), **Building** (reuse).

## 12. KNOWN TECHNICAL DEBT

Mature architectures name their debt. Each item below is accepted deliberately, with the trigger that should pay it down.

| Debt | Why accepted now | Pay-down trigger |
|---|---|---|
| **Hash routing** (`#/...`) | Robust on Pages, zero config | Clean URLs become a real need → add `404.html` SPA redirect or an SSG |
| **Manual `index.json` / embedded objects** | Fast to start; small scale | Drift observed or many ventures → add a generator (GitHub Action) |
| **No full-text search** | Not needed at current size | Content outgrows manual browsing → add a client-side search index |
| **No in-app editing / sync** | Authoring is via git + AI | A non-git editing need arises |
| **Design-system verbatim copy** | Card Atlas mandates it | Frequent design changes → script the shell `<style>` from canonical |
| **Markdown render adapter** | Avoids a heavy MD→components engine | Rich authored layouts demanded → revisit, don't expand silently |
| **Client PII in a public repo** | Repo is public by choice | Real client data needed → anonymize, or switch repo to Private |
| **GitHub Pages limits** | Free, zero-ops | Routing/headers/bandwidth limits bind → move host |

## 13. VERSIONING

The Core OS uses **Semantic Versioning** (`MAJOR.MINOR.PATCH`) for its specification documents (`PRODUCT.md`, `ROADMAP.md`, `TECHNICAL_ARCHITECTURE.md`):

- **MAJOR** — a structural redesign or a breaking change to concepts/contracts (e.g., this v1.0 → v2.0 layered redesign).
- **MINOR** — a new section, decision, or capability that is backward-compatible.
- **PATCH** — clarifications, typos, non-semantic edits.

Every bump is logged in `CHANGELOG.md`; technical rationale in `ARCHITECTURE_DECISIONS.md`, strategic rationale in `DECISION_LEDGER.md`.

> **Why:** versioning makes evolution legible across many ventures and years. **Four Costs:** reduces **Thinking**, **Deciding**.

## 14. ARCHITECTURE DECISION RECORDS

Venture OS adopts **ADRs** in `ARCHITECTURE_DECISIONS.md`, distinct from `DECISION_LEDGER.md`:

- **`ARCHITECTURE_DECISIONS.md`** — numbered, immutable **technical** decisions (`ADR-NNNN`) with `Status` (Proposed / Accepted / Superseded), Context, Decision, Consequences. Superseded ADRs are kept, never deleted — the audit trail is the point.
- **`DECISION_LEDGER.md`** — **strategic / venture / business** decisions and their rationale.

> **Why separate:** technical decisions have a different lifecycle (they get superseded as the stack evolves) and a different audience than strategic ones. Conflating them rots both. **Four Costs:** reduces **Thinking**, **Deciding**.

## 15. IMPLEMENTATION ROADMAP

Incremental, each step shippable, mapping to `ROADMAP.md` Phase 0:

1. **Shell + one doc** — `index.html` (Card Atlas verbatim) + `app.js` renders `PRODUCT.md` into a `.card`; `.nojekyll`; enable Pages. *Proves the pipeline.*
2. **Home + routing** — `index.json`; hero/stats + cardgrid; hash routing across core docs.
3. **Domain + Venture States** — `venture.json`; render state as pill/track; lock non-active tiles; Venture 001 page.
4. **PWA hardening** — manifest, icons, `sw.js` (precache shell / network-first index / SWR docs), self-hosted fonts, update affordance. *Installable + offline.*
5. **Polish + verify** — CSP meta, Lighthouse pass, base-element prose styles, `index.json` generator/verification.

No step introduces a backend or a framework.

## 16. ARCHITECTURE REVIEW VERDICT

This v2.0 was produced by a formal design review (CPO / Chief Systems Architect / Principal SWE / Staff Platform Engineer). It corrects the repository-vs-database error, imposes five-layer separation, defines a domain model, makes the compounding loop explicit, and adds the maintenance scaffolding (ADRs, technical debt, SemVer) a decade-scale system needs — while removing nice-to-haves. **Verdict: appropriately minimal and structurally sound.** The only non-trivial code remains the contained Markdown renderer. No backend, no framework, and no premature infrastructure are justified at this stage.

---

## HOW THIS DOCUMENT EVOLVES

Stable, but less locked than `PRODUCT.md`. It changes when a real implementation constraint or deliberate stack decision requires it. Every change follows §13 SemVer, is logged in `CHANGELOG.md`, and records a technical ADR in `ARCHITECTURE_DECISIONS.md`. The canonical design system is referenced, never forked.
