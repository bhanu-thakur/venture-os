# PRODUCT

**Version:** 1.0
**Status:** LOCKED — Frozen at v1.0 (2026-06-29)
**Revision:** Post Design-Review pass + Single Responsibility (CPO/CTO/Architect)
**Governs:** What Venture OS is, the primitives it is built from, and the concepts that structure it.

> This document defines the product. `CONSTITUTION.md` defines how we think and behave; `PRODUCT.md` defines what the thing *is*. It describes the operating system itself — never the implementation, the tooling, or any single venture.

---

## 1. WHAT VENTURE OS IS

Venture OS is a **stateless, repository-driven operating system for building and scaling ventures.** The **AI Reasoning Engine** is the processor; this repository is the memory and single source of truth. Chat history is disposable; files are permanent.

It is not an app, a CRM, or a project tracker. It is an operating system: a small set of durable primitives and concepts that let a founder (plus the AI Reasoning Engine) move from idea to revenue with maximum leverage and minimum overhead.

**The product is Venture OS itself.** Individual ventures (starting with Venture 001, Hospitality Media) are its proving grounds — live tests of whether the OS produces better decisions, faster execution, and real revenue.

## 2. NORTH STAR

> "The OS is successful only if it helps me make better decisions and build real ventures — not if it becomes the most sophisticated app I've never used."

Every primitive and concept must earn its place by reducing one or more of the **Four Costs**: Thinking, Learning, Building, Deciding (`CONSTITUTION.md` §I.2). Anything that does not is challenged before it enters the architecture.

## 3. CORE PRIMITIVES

These are the **first-class nouns** of the operating system. They are permanent: each persists across all ventures and is not reducible to any single one. A concept that only serves one venture is venture work, not a primitive.

| Primitive | Definition | Why it is permanent (not venture-specific) | Home |
|---|---|---|---|
| **Founder** | The durable profile of the operator: values, skills mastered, hard advantages, capital, risk posture. | Skill acquisition and better decisions are success metrics in their own right; the founder's capability compounds across every venture. Distinct from Reality (which is mutable, week-to-week). | `FOUNDER.md` *(created when first needed)* |
| **Reality** | The mutable grounding filter: location, time, capital, gear, current bottleneck, market conditions. | All strategy must map to current reality. The contents change constantly; the *slot* is forever. | `CURRENT_CONTEXT.md` |
| **AI Reasoning Engine** | The stateless processor that boots from the repository, reasons, and writes changes back to files. | One half of the stateless architecture — without it the repository is inert. Permanent and central. | `CONSTITUTION.md` + boot sequence (`START_HERE.md`) |
| **Ventures** | The portfolio of businesses being built. Each is always in exactly one Venture State (§5). | The OS exists to build many ventures over time; one OS, many ventures. | venture files / `/docs/ventures` *(created when first needed)* |
| **Knowledge** | Generalized lessons, mental models, and frameworks abstracted *from* doing the work. | Knowledge is cross-venture by definition — it is what we extract and reuse. The substrate of compounding. | `LESSONS_LEARNED.md`, `/docs/frameworks`, `/docs/bibles` *(created when first needed)* |
| **Assets** | Reusable artifacts: templates, playbooks, code, brand IP, proof pieces. | An artifact is an Asset only if it is reusable across contexts; a one-venture artifact is just venture work. Assets are the unit of compounding output. | `/docs/templates`, venture deliverables promoted to reuse *(created when first needed)* |
| **Core Engines** | Reusable operational *capabilities* a venture plugs into (e.g., a validation engine, an outreach engine, a content engine). | The mechanism of scale across many ventures — the difference between linear effort and an OS. | `/docs/frameworks` (as engines are extracted) *(created when first needed)* |

> **Core Engines — Extraction Rule (guardrail against drift):** An engine is **extracted from a process proven to work at least twice**, never designed speculatively up front. Building engines before there is a repeated, working process is premature abstraction and produces exactly the "sophisticated app never used" the North Star warns against.

### 3.1 Single Responsibility

Each primitive owns **exactly one job.** If two primitives compete for the same responsibility, the architecture is wrong and must be corrected — not patched. This is what keeps the system easy to reason about.

| Primitive | Single Responsibility |
|---|---|
| **Founder** | Makes decisions and executes |
| **Reality** | Validates assumptions |
| **AI Reasoning Engine** | Generates reasoning and proposed changes |
| **Ventures** | Create value and revenue |
| **Knowledge** | Preserves generalized understanding |
| **Assets** | Compound leverage through reuse |
| **Core Engines** | Standardize repeatable capabilities |

## 4. OPERATING CONCEPTS (THE DYNAMICS)

Where §3 lists the nouns, this section lists the forces that move them.

### 4.1 Stateless Architecture
The repository is the only memory. Nothing matters until written to a file. The AI Reasoning Engine never assumes context from past chats; it boots from files. If repository and chat conflict, the repository wins.

### 4.2 The Four Costs
Everything exists to reduce the Cost of Thinking, Learning, Building, or Deciding. The product's primary design filter.

### 4.3 The Compounding Loop
`Learn → Execute → Ship → Review → Extract Knowledge → Create Assets → Improve the Core OS → Build the Next Venture.` Every meaningful piece of work should strengthen the system, not just complete a task. The loop is what turns the primitives Knowledge, Assets, and Core Engines from aspirations into accumulating capital.

## 5. VENTURE STATES (THE LIFECYCLE)

Every venture is **always in exactly one state.** "Active" is too coarse to drive decisions; the state tells us what work is appropriate, what evidence is required to advance, and where risk currently lives. A venture's current state is recorded in its venture file.

```
Idea → Research → Validation → Prototype → Execution → Revenue → Scale → Maintenance → Archived
```

| State | What it means | Exit criteria (to advance) |
|---|---|---|
| **Idea** | A raw hypothesis worth considering. Cheap to hold, cheaper to kill. | A clear problem, target user, and why-now. |
| **Research** | Actively gathering evidence: market, competitors, customer reality, constraints. | Enough evidence to form a testable value hypothesis. |
| **Validation** | Testing demand and willingness to pay *before* building. The most important state in a price-sensitive market. | Real demand signal — ideally a cleared payment, advance, or firm commitment. |
| **Prototype** | Building the smallest thing that proves the offer is deliverable (sample, MVP, pilot). | A working proof asset showable to a customer. |
| **Execution** | Delivering to real customers and refining the repeatable process. | First paying customer served; repeatable delivery established. |
| **Revenue** | Consistent, repeatable income from the validated offer. | Stable, predictable revenue from the core offer. |
| **Scale** | Growing volume, margin, or reach beyond one-to-one founder effort. | Systems/Assets/Engines that grow output without proportional founder time. |
| **Maintenance** | Stable, low-effort operation; harvested for cash and lessons, not growth. | Decision to wind down, or a reason to re-activate growth. |
| **Archived** | Closed or parked. Knowledge extracted into the Core OS. | Lessons captured in `LESSONS_LEARNED.md`; no further work. |

### Rules of the lifecycle
* **One state at a time.** A venture cannot occupy two states.
* **Advancement requires evidence, not optimism** (Truth Policy + Proof of Execution). The bar to leave Validation is real demand, ideally a cleared payment.
* **States can move backward.** Failed validation returns a venture to Research or Idea. This is healthy, not failure.
* **The state dictates the work.** Don't do Execution work on a venture still in Research.

## 6. THE PORTFOLIO

Ventures are **many over time; the OS is one.** At any moment most ventures are dormant (Idea, Maintenance, Archived) and **focus is deliberately protected** to one or a few active ventures (Constitution: Scope Protection). The OS must always be able to hold the full portfolio while concentrating effort narrowly.

## 7. WHAT IS NOT PART OF THE PRODUCT

To protect focus and prevent drift:
* Tactics, copy, pricing, and venture-specific assets — these live in venture files, never here.
* Roadmap and sequencing — see `ROADMAP.md`.
* Operational history — see `CHANGELOG.md`.
* Any current venture's *state or status* — that lives in its venture file, not in this spec.

## 8. CONCEPT → FILE MAP

One concept, one home. Files marked *(planned)* are created only when first needed — not pre-created as placeholders.

| Concept | File / location | Status |
|---|---|---|
| Thinking & behavior rules | `CONSTITUTION.md` | exists |
| Boot sequence | `START_HERE.md` | exists |
| Product definition (this doc) | `PRODUCT.md` | exists |
| Reality | `CURRENT_CONTEXT.md` | exists |
| Active venture(s) | `CURRENT_VENTURE.md` | exists |
| Decision rationale | `DECISION_LEDGER.md` | exists |
| Execution queue | `NEXT.md` | exists |
| Sequencing | `ROADMAP.md` | planned (next) |
| History | `CHANGELOG.md` | planned |
| Assumptions register | `ASSUMPTIONS.md` | planned |
| Knowledge / lessons | `LESSONS_LEARNED.md` | planned |
| Founder profile | `FOUNDER.md` | planned (when needed) |
| Frameworks / Engines | `/docs/frameworks` | planned (when needed) |
| Reusable Assets | `/docs/templates` | planned (when needed) |

## 9. HOW THIS DOCUMENT EVOLVES

`PRODUCT.md` is the most stable document after the Constitution. It changes only when a **core primitive or concept** is added, redefined, or retired. It never absorbs tactics, history, or venture detail. Every structural change bumps the version, is logged in `CHANGELOG.md`, and its rationale recorded in `DECISION_LEDGER.md`.
