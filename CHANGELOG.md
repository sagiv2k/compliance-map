# Changelog — ComplianceMap

All notable changes and the system's objectives are recorded in this file.
This file is the persistent record of what we have built and where we are going.

---

## Objectives

**ComplianceMap** is a static web platform hosted on GitHub Pages that helps
compliance professionals, legal teams, and IT security managers:

1. **Browse global regulations** — searchable and filterable by domain (Data Privacy,
   Cybersecurity, Finance, Health, AI Governance, Environment, Labor,
   Critical Infrastructure) and by country.

2. **Explore compliance standards** — ISO 27001, SOC 2, NIST CSF, PCI DSS, and
   others — and understand which regulations each standard helps satisfy.

3. **Visualize geographic coverage** — an interactive world map choropleth shows
   which countries are covered by the currently filtered regulations.

4. **Navigate the coverage matrix** — a regulation × standard table shows, at a
   glance, how well each standard covers each regulation (Full / Substantial /
   Partial / Minimal), with notes and links for each mapping.

### Design principles

- **No build process** — pure HTML, CSS, and vanilla Vue 3 (CDN). Anyone can edit
  a JSON file and push to GitHub to update the data.
- **Map-first** — the world map is the hero visualization on the Overview screen.
- **Data-driven** — all regulations and standards are stored in three JSON files
  (`regulations.json`, `standards.json`, `mappings.json`). No code changes are
  needed to add new regulations.

---

## Roadmap (Planned)

### Next data additions
- [ ] Singapore PDPA — Personal Data Protection Act
- [ ] Thailand PDPA — Personal Data Protection Act
- [ ] India DPDPA — Digital Personal Data Protection Act 2023
- [ ] UK GDPR (post-Brexit) — retained GDPR
- [ ] Australia Privacy Act 1988 (2024 reforms)
- [ ] MARPOL / SOLAS (shipping/maritime regulations for domain expansion)
- [ ] CSRD (EU Corporate Sustainability Reporting Directive) — environment domain

### Future features
- [ ] Automated data freshness alerts via GitHub Actions (detect regulation amendments)
- [ ] Regulation timeline view — sortable by effective date
- [ ] PDF export of filtered regulation list
- [ ] "My Jurisdiction Profile" — user can select their countries and see a
      personalized view of applicable regulations
- [ ] Dark mode toggle

---

## [1.0.0] — 2026-06-09 — Initial Launch

### Added
- **Platform scaffold** — Vue 3 (CDN) SPA with hash-based routing,
  Leaflet 1.9 world map, Chart.js 4 visualizations.
- **12 regulations** seeded with full metadata, real official URLs, and detailed
  summaries: GDPR, NIS2, DORA, EU AI Act, EU Cybersecurity Act, CCPA/CPRA,
  HIPAA, SOX, EO 14028, PIPL, LGPD, PDPL (Saudi Arabia).
- **10 compliance standards** seeded: ISO 27001, ISO 27701, SOC 2, NIST CSF 2.0,
  NIST SP 800-53, ISO 9001, ISO 31000, CIS Controls v8, PCI DSS v4.0, COBIT 2019.
- **42 regulation–standard mappings** with coverage level and detailed notes.
- **Overview view** — world map choropleth, stat cards, domain bar chart,
  standards category doughnut chart.
- **Regulations view** — filterable card grid; cards open full detail modals.
- **Standards view** — filterable card grid; cards open full detail modals.
- **Coverage Matrix view** — regulation × standard table with colored coverage dots;
  CSV export button.
- **Detail modal** — shows full metadata, key requirements/controls, penalties,
  and bidirectional cross-references (regulation ↔ standards).
- **Filter sidebar** — domain checkboxes, search box, status toggle.
- **Responsive layout** — mobile sidebar drawer, touch-friendly.
- **CHANGELOG.md** — this file, tracking objectives and changes.

---

## How to Add a New Regulation

1. Open `data/regulations.json`.
2. Copy an existing regulation object and paste it at the end of the `regulations` array.
3. Fill in all fields (ensure `id` is unique, use ISO 3166-1 alpha-2 country codes).
4. Update `last_updated` at the top of the file.
5. Add mappings to `data/mappings.json` if this regulation is covered by existing standards.
6. Commit and push — the site updates automatically.

## How to Add a New Standard

1. Open `data/standards.json`.
2. Copy an existing standard object and add it to the `standards` array.
3. Fill in all fields (`id` must be unique, `domains_addressed` must use valid domain keys).
4. Add mappings to `data/mappings.json` linking the new standard to relevant regulations.
5. Commit and push.

## How to Run Locally

```bash
# Navigate to the ComplianceMap folder
cd "c:\Users\sboul\OneDrive\שולחן העבודה\ComplianceMap"

# Start a local server (Python 3)
python -m http.server 8080

# Open in browser
# http://localhost:8080
```
