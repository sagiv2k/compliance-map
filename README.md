# ComplianceMap

An interactive web platform for browsing, filtering, and visualizing global regulations and compliance standards. Hosted on GitHub Pages — no server required.

## Live Site

**https://&lt;your-github-username&gt;.github.io/compliance-map/**

## Features

- **World Map** — choropleth showing which countries are covered by the filtered regulations
- **Regulations Database** — 12 key global regulations with full metadata, key requirements, and penalties
- **Standards Library** — 10 compliance frameworks (ISO 27001, SOC 2, NIST CSF, PCI DSS, and more)
- **Coverage Matrix** — see which standards help satisfy which regulations, with coverage levels
- **Filters** — filter by domain, status, and free-text search across all views
- **Detail Modals** — full details and bidirectional cross-references for every regulation and standard
- **CSV Export** — export the coverage matrix

## Data Coverage

| Domain | Regulations |
|--------|------------|
| Data Privacy | GDPR, CCPA/CPRA, HIPAA, PIPL, LGPD, PDPL |
| Cybersecurity | NIS2, EO 14028, EU Cybersecurity Act |
| Finance + Cyber | DORA, SOX |
| AI Governance | EU AI Act |

## Running Locally

```bash
cd ComplianceMap
python -m http.server 8080
# then open http://localhost:8080
```

> The site requires a local HTTP server because browsers block `fetch()` on `file://` URLs.

## GitHub Pages Deployment

1. Create a public GitHub repository named `compliance-map`
2. Push this folder's contents to the `main` branch
3. Go to **Settings → Pages → Source: Deploy from branch → main / (root)**
4. Site goes live at `https://<username>.github.io/compliance-map/` within ~60 seconds

## Adding Data

All content is in three JSON files — no coding required:

| File | Contents |
|------|----------|
| `data/regulations.json` | All regulations with metadata |
| `data/standards.json` | All compliance standards |
| `data/mappings.json` | Regulation ↔ standard cross-references |

See `CHANGELOG.md` for step-by-step instructions on adding new entries.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | Vue 3 (CDN, no build step) |
| Map | Leaflet 1.9 + Natural Earth GeoJSON |
| Charts | Chart.js 4 |
| Styling | Pure CSS with custom properties |
| Hosting | GitHub Pages |
| Data | Static JSON files |
