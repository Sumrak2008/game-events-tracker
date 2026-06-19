<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Game Events Tracker

Project-specific rules for working with the tracker data and publishing live in **[CLAUDE.md](CLAUDE.md)**. Read them before editing `data/*.json` or shipping changes. Key points: data lives only in `data/` JSON files; only `banner`/`event`/`season` record types; status is computed, never stored; never delete completed records; use official sources for real data and keep `sourceUrls`; demo data must be `isDemo: true`.
