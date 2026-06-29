# ARCHITECTURE DECISION RECORDS (ADRs)

**Status:** Active ledger
**Scope:** Immutable, numbered **technical** decisions for Venture OS. Strategic/venture/business decisions live in `DECISION_LEDGER.md`.

**Format:** each ADR has a Status (Proposed / Accepted / Superseded), Context, Decision, and Consequences. Records are append-only and immutable — when a decision changes, add a new ADR and mark the old one *Superseded by ADR-NNNN*. The trail is the value.

---

## ADR-0001 — Static, repository-driven PWA; zero backend
**Status:** Accepted (2026-06-29)
**Context:** A single-founder OS in a price-sensitive market needs zero infrastructure cost and high durability.
**Decision:** Implement Venture OS as a static Progressive Web App served from the repository, with no backend or server-side logic.
**Consequences:** Zero hosting/ops cost; offline-capable; no dynamic queries or server personalization; runtime state is derived client-side.

## ADR-0002 — Vanilla HTML/CSS/JS; no framework
**Status:** Accepted (2026-06-29)
**Context:** The app renders a few dozen Markdown documents and JSON domain objects.
**Decision:** Use vanilla HTML + ES modules; the only earned dependency is a vendored MIT Markdown parser.
**Consequences:** No build step, no runtime, no lock-in; we hand-write a small router/renderer/adapter.

## ADR-0003 — GitHub Pages from `main`/root; hash routing; `.nojekyll`
**Status:** Accepted (2026-06-29)
**Context:** Pages is free, HTTPS, already hosts the repo, but has no server-side routing and runs Jekyll by default.
**Decision:** Deploy from `main`/root; use client-side hash routing; commit `.nojekyll`; relative links only.
**Consequences:** Push = publish; robust deep links; uglier hash URLs (clean URLs deferred as debt).

## ADR-0004 — Repository is the source of truth; app derives runtime state
**Status:** Accepted (2026-06-29)
**Context:** v1.0 incorrectly called the repository "the database," blurring source-of-truth and runtime concerns.
**Decision:** The repository is the authoritative, version-controlled store (Markdown Knowledge + JSON Domain). The application derives disposable runtime state (caches, routes, view models). `index.json` is a derived projection, not a second source.
**Consequences:** Eliminates state-sync ambiguity; reload = truth; no relational querying.
**Supersedes:** the "repository is the database" framing in TECHNICAL_ARCHITECTURE v1.0.

## ADR-0005 — Card Atlas as the canonical design system
**Status:** Accepted (2026-06-29)
**Context:** Consistency and zero design debt across all pages.
**Decision:** `card-atlas-design-system.html` is canonical — copied verbatim, tokens-only, default forest-green theme. Offline compatibility adaptations (self-hosted fonts; keep `color-mix()`) are not visual changes.
**Consequences:** Uniform UI; design-system updates must be re-copied into the shell (accepted debt).

## ADR-0006 — Five-layer architecture
**Status:** Accepted (2026-06-29)
**Context:** v1.0 blended storage, UI, AI, and real-world concerns.
**Decision:** Separate into Knowledge, Domain, Application, Reasoning, and Execution layers, communicating only through the repository. Layers are an implementation view and do not create new `PRODUCT.md` primitives.
**Consequences:** Independent evolution of each concern; clearer reasoning; slight up-front conceptual overhead.

## ADR-0007 — Vendor-neutral AI Reasoning Engine; authoring-time only
**Status:** Accepted (2026-06-29)
**Context:** The OS must not be coupled to any single AI vendor, and must keep the app free and offline.
**Decision:** Define the Reasoning Layer by interfaces and protocol (boot from repo, propose, commit, verify by read-back), independent of any specific model. The Application Layer makes zero runtime AI calls.
**Consequences:** Works with any capable AI processor; no runtime AI cost or dependency; reasoning happens through git.

## ADR-0008 — Semantic Versioning for Core OS specs
**Status:** Accepted (2026-06-29)
**Context:** Long-lived specs need legible evolution.
**Decision:** Apply SemVer (MAJOR.MINOR.PATCH) to `PRODUCT.md`, `ROADMAP.md`, `TECHNICAL_ARCHITECTURE.md`.
**Consequences:** Clear change semantics; TECHNICAL_ARCHITECTURE bumped to 2.0 for the layered redesign.

## ADR-0009 — Adopt ADRs distinct from the Decision Ledger
**Status:** Accepted (2026-06-29)
**Context:** Technical decisions get superseded and target engineers; strategic decisions do not share that lifecycle.
**Decision:** Record technical decisions here (immutable, numbered, with status); keep strategic/venture decisions in `DECISION_LEDGER.md`.
**Consequences:** Cleaner audit trail; two ledgers to maintain (boundary defined in TECHNICAL_ARCHITECTURE §14).

## ADR-0010 — Reconstructability: the repository is durable memory
**Status:** Accepted (2026-06-29)
**Context:** A stateless OS must survive loss of chat history, AI vendor changes, host changes, and rewrites of the app.
**Decision:** Guarantee that the entire system is reconstructable from the repository alone. The repository is durable memory and the single source of truth; the AI Reasoning Engine, the app, the host, and all derived files (e.g., `index.json`) are replaceable and rebuildable.
**Consequences:** No catastrophic lock-in; the only irreplaceable asset is the repository (protected by git history + remotes). Recovery is rebuild-from-source, not archaeology.

## ADR-0011 — Design system is a replaceable Application-Layer dependency
**Status:** Accepted (2026-06-29)
**Context:** Product and presentation must be cleanly separable so the OS is not coupled to one visual style.
**Decision:** Card Atlas is an implementation dependency of the Application Layer only. Replacing or re-theming it changes nothing in the Constitution, Product, Domain Model, or Repository — only presentation.
**Consequences:** The design system is the most replaceable part of the system; visual evolution carries no risk to knowledge, domain, or doctrine.

## ADR-0012 — Phase 0 flat root file layout (deployment-tooling constraint)
**Status:** Superseded by ADR-0016 (2026-06-29) — the flat-layout pay-down trigger (a credentialed git client) is met via GitHub Desktop; repo now uses the holding-company layout
**Context:** Phase 0 is deployed by the AI Reasoning Engine committing through the GitHub web UI. That mechanism uploads files to a single folder and cannot create subdirectories or place binary files into them; no credentialed git client is available in the build environment.
**Decision:** Place all Phase 0 application files (`index.html`, `app.js`, `sw.js`, `manifest.webmanifest`, `index.json`, `.nojekyll`, `marked.min.js`, `icon-192.png`, `icon-512.png`) at the repository **root**, instead of the `assets/{fonts,icons,vendor}/` structure in TECHNICAL_ARCHITECTURE §3. The frozen architecture is **not** edited; this is an implementation deviation recorded here.
**Consequences:** Works with web-UI commits today; root is slightly cluttered. **Pay-down trigger:** when a credentialed git client / push is available, restructure into the `assets/` layout (relative paths already make this a low-risk move).

## ADR-0013 — Phase 0 font delivery: canonical CDN link + service-worker cache
**Status:** Accepted (2026-06-29) — implementation decision
**Context:** TECHNICAL_ARCHITECTURE §6.1 specifies self-hosted woff2 fonts for offline. Card Atlas (canonical, not to be redesigned) ships a Google Fonts `<link>` in its `<head>`; obtaining/committing binary font files via the web-UI mechanism is impractical in Phase 0.
**Decision:** Keep the Card Atlas Google Fonts `<link>` verbatim and have the service worker runtime-cache `fonts.googleapis.com`/`fonts.gstatic.com` (cache-first). Offline rendering uses cached fonts after first load, falling back to the design system's system-font stack before then.
**Consequences:** Fully offline-capable after first visit, with the canonical typography; first-ever load requires network for exact fonts. **Pay-down trigger:** self-host woff2 (and enable a strict `'self'` CSP) once a git client can commit binaries into `assets/fonts/`.


## ADR-0015 — Venture data is Markdown-first
**Status:** Accepted (2026-06-29)
**Context:** The repository must stay human- and AI-readable and editable without specialized tooling.
**Decision:** Venture domain data is Markdown with lightweight YAML frontmatter for structured fields (e.g., `state`). No `venture.json`. JSON is reserved solely for the disposable `index.json` app map.
**Consequences:** Repository stays plain-text editable; the runtime parses frontmatter + headed sections in the view layer.

## ADR-0016 — Holding-company repository layout
**Status:** Accepted (2026-06-29)
**Context:** Venture OS must scale to 10–20 simultaneous ventures without restructuring.
**Decision:** Top-level division — `os/` (Core OS), `founder/` (founder + reality), `ventures/` (portfolio; one folder per venture), `library/` (reusable knowledge + assets), `static/` (app assets); app shell at root. Adding a venture is exactly one new folder under `ventures/`.
**Consequences:** Clean root, additive scaling, explicit holding-company shape. Required a one-time migration of existing files.
**Supersedes:** ADR-0012 (flat root layout).

## ADR-0017 — Venture-internal structure
**Status:** Accepted (2026-06-29)
**Context:** Each venture mixes slow identity/business data with fast daily execution.
**Decision:** Per venture — `README.md` = identity + State (rare); `mission.md` = daily execution; `business/` = slow assets (offer/icp/pricing/positioning); `execution/` = fast assets (pipeline/deliverables/log); `lessons.md`; `assets/` = venture-specific. Reusable assets are **promoted** to `library/templates/`. Folders named `venture-NNN-descriptive`.
**Consequences:** Clean Git diffs (daily churn isolated), clear slow/fast and business/execution split, a defined asset-promotion flow.

## ADR-0018 — Client-side working layer (interactive cockpit)
**Status:** Accepted (2026-06-29)
**Context:** A strictly read-only runtime made Venture OS something the founder reads, then leaves to work in WhatsApp/Notion/GitHub. Success is now measured by *voluntary daily use*; that requires in-app doing with persisted state (as demonstrated by North Stories OS).
**Decision:** Permit a client-side **working layer** — interactive tools whose state persists in the browser (`localStorage`): the daily plan checks, captured wins, and the progress streak. The **repository remains the canonical record** for durable truth; the founder commits anything that must survive devices/reinstalls. The PWA still has **no backend and makes no runtime AI calls**.
**Consequences:** Materially stickier — a cockpit you operate, not a page you read. Working-layer state is device-local and non-authoritative; durable truth is still committed to the repository (multi-device version derives from repo state). This relaxes the strict read-only posture for *ephemeral working state* only; the repository-is-source-of-truth principle holds for durable truth.

