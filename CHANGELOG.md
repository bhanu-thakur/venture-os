# CHANGELOG

**Status:** Active ledger
**Purpose:** The operational history of Venture OS — *what* changed and *when*, in reverse-chronological order. The CHANGELOG answers "what happened to the system?"; `DECISION_LEDGER.md` answers "why?". Each entry should be terse and link to the ledger for rationale.

**How it evolves:** Append-only. A new dated entry is added whenever a Core OS file is created, frozen, or structurally changed, or a venture changes state. Never rewrite history; corrections are new entries.

---

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
