# Venture OS

Venture OS is a stateless, repository-driven operating system for building and scaling ventures, optimized for the realities of the Indian market. **The repository is the single source of truth; the app is a thin, offline-capable cockpit over it.**

New here (human or AI)? Read `START_HERE.md` for the boot sequence.

## Structure
- `os/` — the Core OS: Constitution, Product, Roadmap, Technical Architecture, ADRs, Decision Ledger, Changelog.
- `founder/` — founder profile and current reality.
- `ventures/` — the portfolio; one folder per venture (identity + State + mission).
- `library/` — reusable knowledge and assets shared across ventures.
- `static/` — app assets; the app shell (`index.html`, `app.js`, `sw.js`, `index.json`) lives at the repo root.

Live cockpit: https://bhanu-thakur.github.io/venture-os/
