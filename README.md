# Arslan Ali Portfolio

Production portfolio website for [iarslanaly.dev](https://iarslanaly.dev), deployed as a static site with GitHub Pages.

## Local development

Requirements:

- Python 3
- GNU Make (optional, included with macOS developer tools)

Run the production build and local server:

```bash
make serve
```

Then open [http://localhost:8000](http://localhost:8000). Stop the server with `Ctrl+C`.

You can also run each step separately:

```bash
make build
make validate
```

Run regression checks with `make test` (requires Node.js in addition to Python).
These cover content synchronization, broken internal links, required SEO and
accessibility markup, and cookie controls when browser storage is blocked.

## Project structure

```text
.
├── .github/workflows/       GitHub Pages deployment
├── assets/
│   ├── css/                 Shared site styles
│   ├── images/              Profile, social, and browser assets
│   └── js/                  Site behavior and analytics consent
├── scripts/                 Production build and validation tools
├── *.html                   Public pages with stable indexed URLs
├── CNAME                    Custom GitHub Pages domain
├── robots.txt               Search crawler rules
├── sitemap.xml              Search engine URL index
└── site.webmanifest         Installable-site metadata
```

HTML pages intentionally remain at the repository root. This keeps existing public URLs stable and prevents avoidable SEO redirects.

Shared education, internship details, and existing statistics live in `content/profile.json`.
After editing them, run `python3 scripts/sync_content.py` to update the homepage's
static HTML and profile structured data. The build checks for stale values, so
readable content never depends on JavaScript. Statistics remain subject to owner
verification; see `AUDIT.md` for outstanding evidence requests.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy-pages.yml`. The workflow:

1. Builds a clean `_site` artifact.
2. Validates required files, metadata, JSON-LD, headings, IDs, and local links.
3. Uploads and deploys the artifact to GitHub Pages.

Do not commit `_site`; it is generated automatically.
