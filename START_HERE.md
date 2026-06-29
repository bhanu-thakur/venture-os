# BOOTSTRAP: VENTURE OS

If you are a new AI instance, or returning after a long absence, read this file first.

Venture OS is a stateless, repository-driven operating system for building and scaling ventures. The AI Reasoning Engine is the processor; this repository is the memory and single source of truth. The app (`index.html` / `app.js` / `sw.js`) is a **derived cockpit** — regenerable from `os/TECHNICAL_ARCHITECTURE.md`, not authoritative.

## Repository structure
- `os/` — the Core OS (doctrine + system specs)
- `founder/` — founder profile + current reality
- `ventures/` — the portfolio (one folder per venture)
- `library/` — reusable knowledge + assets (created as content emerges)
- `static/` — app assets; app shell (`index.html`, `app.js`, `sw.js`, `index.json`) at root

## Boot sequence (read in this order)
1. `START_HERE.md` (here)
2. `README.md` — orientation
3. `os/CONSTITUTION.md` — rules + Desi mindset filter
4. `os/PRODUCT.md` — what Venture OS is (primitives, Venture States)
5. `os/TECHNICAL_ARCHITECTURE.md` — how it runs (five layers, repo layout)
6. `os/EXPERIENCE_ARCHITECTURE.md` — how the runtime feels (the daily loop; Mission is the home)
6. `os/ARCHITECTURE_DECISIONS.md` — technical decisions (ADRs)
7. `os/ROADMAP.md` — strategic roadmap
8. `os/DECISION_LEDGER.md` — strategic/venture decisions + rationale
9. `os/CHANGELOG.md` — history
10. `founder/context.md` — current reality / constraints
11. `ventures/README.md` — the portfolio + States; then each `ventures/<slug>/README.md` (identity + State) and `mission.md` (current execution)
12. `NEXT.md` — immediate focus queue

Do not rely on conversational history. If the repository conflicts with chat memory, the repository wins.
