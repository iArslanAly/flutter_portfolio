# Portfolio maintenance audit

Reviewed on 26 October 2026. Changes are local; nothing was pushed or deployed.

## Corrections and modified files

| Files | Changes |
| --- | --- |
| `index.html` | Education now states Bachelor of Science in Computer Science (BSCS), Virtual University of Pakistan, September 2020 – September 2024, graduation 2024, CGPA 3.04/4.00. Added matching credential information to Person JSON-LD. Corrected TechSwivel and used only 2025 for the internship. Preserved the other existing experience periods and independent developer positioning. |
| `content/profile.json`, `scripts/sync_content.py`, `scripts/build_site.py`, `README.md` | Centralized duplicated profile facts and the existing 15+/12+/2+ statistics. Sync writes real HTML and structured data; builds reject stale content. No runtime fetch or dependency was introduced. Run `python3 scripts/sync_content.py` after updating the configuration. |
| `assets/js/script.js`, `assets/css/style.css`, `index.html` | Counter HTML contains final values instead of zero. Optional viewport animation uses elapsed time, skips reduced motion, falls back without IntersectionObserver, and settles on timeout/backgrounding. Reserved digit width limits movement. Reveal content stays readable without JavaScript/observers. Added a static typewriter fallback, removed animation delays under reduced motion, improved mobile-menu focus handling, and added a contact request timeout. Contact submission stays disabled until its handler is attached; without JavaScript an email link is available. |
| `index.html`, `services/index.html`, `projects/index.html`, all eight `projects/*/index.html` pages | Replaced unsupported Top Rated and verified-profile labels with neutral profile wording. Removed “Verified review” labels while preserving existing quotes and authors. Qualified blanket testing, deployment, and security promises. |
| `projects/renue/index.html`, `projects/truesight/index.html`, homepage/project summaries | Corrected implemented/planned distinctions and matching metadata. Renue descriptions include owner-confirmed OCR, on-device AI, and DeepSeek API integration through Appwrite Functions; the cloud API path is distinguished from on-device processing. TrueSight uses an external detection API from Flutter; its separate Node.js service handles password resets. Qualified unfinished history/web support. Standardized go_router/API terminology. |

Colors, fonts, navigation destinations, artwork, contact address, services, project portfolio, and case-study structure were preserved. No research page or academic title was added.

## Counter diagnosis

This is a static HTML site, with no hydration framework. The old strip hardcoded `0+`, then relied on IntersectionObserver at a 60% visibility threshold and a timer to replace it. Delayed/blocked JavaScript or missing viewport callbacks therefore left zeros in place. Reduced-motion CSS did not disable the JavaScript counting loop. The new HTML carries the configured totals before any script executes, with animation added only when supported.

## Evidence and items requiring owner verification

- **Internship:** confirm TechSwivel's exact start/end months. The conflicting March and May–September dates were not resolved by guessing; the timeline uses 2025. The existing 2022–2025 client work and 2025–present independent work remain as supplied, with possible overlap in 2025 rather than an invented transition month.
- **Statistics:** 15+ projects, 12+ clients, and 2+ years are unchanged, not independently substantiated. Supply a delivery/client ledger and define whether experience includes university-era freelance work. Both displays now use the neutral labels “Projects” and “Clients”; delivery and satisfaction claims were removed.
- **Upwork:** the linked profile was accessible through a cached search result, but a direct current request returned HTTP 403. This does not prove a broken link or disprove badge ownership. Current Top Rated and verification status remain unconfirmed; neutral wording is used until evidence is provided. [Profile](https://www.upwork.com/freelancers/~017c64bbb9c7001600).
- **Testimonials:** Atif Nadeem, Arsin Hove, and Masaka quotes, attribution, permission, and five-star ratings need original review links or records. Existing quotes/stars remain for owner review; they are not certified by this audit.
- **Renue:** inspected the local `renue` source read-only, including feature modules, tests, CI/release configuration, and the CSV/PDF import cloud function. The owner subsequently confirmed implemented OCR, on-device AI, and DeepSeek API integration through Appwrite Functions. Portfolio descriptions now reflect that confirmation. These newer integrations were not found in the available local checkout, so their implementation is owner-confirmed rather than independently source-verified. On-device AI is described separately from cloud DeepSeek API calls; no specific model, OCR engine, device benchmark, or performance metric is claimed. Removed the stale/unsupported marketing figures (721 files, ~58K lines, 24 modules, 19 test suites, 5 deployed functions) rather than replacing them with new numbers. Source files and workflow configuration do not establish successful deployments, store availability, catalogue size, or live production reliability. The unverified 100+ catalogue count was removed; confirm platform/release claims. Renue was not among the public repositories returned by GitHub's API.
- **TrueSight:** public Flutter source confirms direct Reality Defender API requests and `dart:io` upload code. Local Node.js source provides password-reset support rather than detection proxying. The dedicated history screen contains placeholders; request-ID result retrieval exists but does not substantiate a persistent scan browser. Mobile implementation does not establish a working web release. External API integration does not establish model accuracy or secure client-side API-key handling. [Repository](https://github.com/iArslanAly/true_sight).
- **UniDrive:** local source/documentation and the accessible public repository support the storage, chunking, streaming, authentication, and manifest architecture. These are implementation descriptions, not security certification, performance benchmarks, or proof of production deployment. Preserved its descriptions and stack. [Repository](https://github.com/iArslanAly/unidrive).
- **NutriGlow:** descriptions and stack were preserved. No identifiable NutriGlow source or public repository was available in the inspected locations. The stale version 2.x reference was removed. Confirm production delivery, localization, and successful iOS/Android release claims from authorized records.
- **Other claims:** Same-day reply and shipping-on-time promises were replaced with direct communication and milestone wording, and the static “Online” indicator now says “Remote.” Profiling results and production deployment achievements still need owner records. No new awards, publications, research credentials, client reviews, or performance metrics were introduced.

## Links, contact, accessibility, and SEO

All built local links and fragment targets pass validation, including the project navigation and services anchors. GitHub profile, public TrueSight/UniDrive repositories, and LinkedIn returned HTTP 200. Upwork returned 403, so current availability needs a normal-browser check. Case studies originally linked the GitHub profile rather than per-project repositories; no guessed repository links were added to the site.

Contact retains the existing EmailJS public configuration and direct email fallback. Browser tests intercept the EmailJS request: no real messages were sent. Successful delivery to the mailbox, template/service status, and provider origin restrictions still require an owner-controlled end-to-end check. Public EmailJS identifiers are not private API secrets; no private credentials were added.

Title/description/viewport metadata, canonical links on indexable pages, main landmarks, image alt attributes, and contact labels were checked. Existing canonical URLs, sitemap, SEO hierarchy, and social metadata were preserved, with factual description corrections. These checks are not a complete accessibility certification.

## Validation

- `make validate`: production build succeeded; 15 HTML pages and 13 sitemap URLs validated, including local references, fragment targets, JSON-LD, manifest, headings, and duplicate IDs.
- `python3 scripts/sync_content.py --check`: passed. An in-memory regression check confirmed idempotent rendering and that changing a configured statistic updates both static displays and the animation target.
- `node --check assets/js/script.js` and `node --check assets/js/consent.js`: passed.
- `python3 -m compileall -q scripts` and `git diff --check`: passed.
- Additional built-page metadata, landmark, image-alt, and contact-label assertions passed.
- Headless Chrome browser checks passed: counters/content with JavaScript disabled, reduced motion, missing IntersectionObserver, delayed site script, and normal animation; homepage overflow at 375/768/1440 pixels; all eight project pages at 375/1440 pixels; mobile menu open/close, focus loop, Escape, and anchor navigation; mocked contact success and server-failure handling. No uncaught page errors were observed. No real EmailJS request was sent. A disposable Puppeteer harness used an existing cached installation; no dependency was added to this repository. The repository now has `make test` for the added dependency-free regression checks. There are no package-manager lint/type-check commands; this is plain HTML/CSS/JavaScript with Python build scripts, not a Flutter application.

## Owner correction: Renue AI integrations

On 26 October 2026, the owner confirmed that OCR, on-device AI, and DeepSeek API integration through Appwrite Functions are implemented. Updated the homepage summary, project listing, Renue case study, and its description/OG/JSON-LD metadata; removed the earlier “planned” classification for these integrations. Other outstanding verification items remain applicable.

## Follow-up maintenance

- Hardened cookie controls against blocked local storage, retained consent in memory for the page visit, and restored focus to the cookie-settings trigger. Updated the privacy page’s technical storage description and revision date.
- Added a small JavaScript-free stylesheet so mobile navigation links remain usable when JavaScript is disabled. The regular navigation design is unchanged.
- Extended production validation to enforce page titles, descriptions, viewport metadata, canonical URLs, main landmarks, image alt attributes, form labels, and absolute links to this site's own domain.
- Added `make test`, six Python regression tests, and a Node.js consent regression script. These require no third-party packages. Updated README instructions and sitemap modification dates for substantive page changes.
- `make test` passed, including the production build, all 15 HTML pages/13 sitemap URLs, all six Python tests, JavaScript syntax checks, and consent regression scenarios.
- Chrome verified cookie controls with blocked storage, analytics gating using an intercepted empty script (no real analytics collection), focus restoration, and homepage widths of 320/375/768/1440 pixels. JavaScript-disabled navigation visibility, mobile anchor placement, and all four responsive widths also passed.

Remaining owner-dependent items: internship months, evidence for the unchanged statistics, testimonial sources and permission, current Upwork badges, production/store release records, and actual contact-message delivery. None can be established by changing portfolio code alone.
