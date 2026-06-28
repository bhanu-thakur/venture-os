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
