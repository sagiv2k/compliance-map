/* Feature: Per-view sliding help panel — triggered by ? button in every view header */
const HelpPanelComponent = {
  template: `
    <div>
      <transition name="help-panel-fade">
        <div v-if="$s.helpPanelOpen" class="help-panel-overlay" @click="$s.helpPanelOpen = false"></div>
      </transition>
      <div class="help-panel" :class="{ open: $s.helpPanelOpen }" role="dialog" aria-label="View help">
        <div class="help-panel__header">
          <div>
            <div class="help-panel__title">{{ content.title }}</div>
            <div class="help-panel__persona">{{ content.persona }}</div>
          </div>
          <button class="help-panel__close" @click="$s.helpPanelOpen = false" aria-label="Close help">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="help-panel__body">
          <p class="help-panel__desc">{{ content.description }}</p>
          <div class="help-panel__section-label">How to use</div>
          <ol class="help-panel__steps">
            <li v-for="(step, i) in content.steps" :key="i" class="help-panel__step">
              <span class="help-panel__step-num">{{ i + 1 }}</span>
              <span>{{ step }}</span>
            </li>
          </ol>
          <template v-if="content.tips && content.tips.length">
            <div class="help-panel__section-label">Pro Tips</div>
            <ul class="help-panel__tips">
              <li v-for="(tip, i) in content.tips" :key="i" class="help-panel__tip">
                <span class="help-panel__tip-icon">💡</span>
                <span>{{ tip }}</span>
              </li>
            </ul>
          </template>
        </div>
      </div>
    </div>
  `,
  computed: {
    content() {
      return this.helpContent[this.$s.activeView] || this.helpContent.overview;
    }
  },
  data() {
    return {
      helpContent: {
        overview: {
          title: 'Global Compliance Map',
          persona: 'Best for: All users — start here',
          description: 'The overview gives you an at-a-glance picture of global regulatory coverage, organized geographically and by domain. A great starting point before diving into any specific regulation.',
          steps: [
            'Click any country on the map to open a panel showing which regulations apply there — click any regulation in the panel to open full details.',
            'Toggle between "By Count" (blue intensity heatmap) and "By Domain" (color-coded by regulatory domain) using the map mode buttons.',
            'Read the stat cards at the top — they update live as you adjust the sidebar filters.',
            'Use the domain bar chart and jurisdiction doughnut chart below to understand your regulatory landscape at a glance.',
            'Use the sidebar filters to narrow scope — the same filters apply across all 12 views simultaneously.'
          ],
          tips: [
            'Gray countries have no regulations in the current filter set. Try setting "Show All" status in the sidebar to reveal proposed regulations.',
            'Sidebar filters are global — setting them on this view also scopes the Regulations list, Coverage Matrix, Gap Analysis, and every other view.'
          ]
        },
        regulations: {
          title: 'Regulation Browser',
          persona: 'Best for: Legal advisors, Compliance officers',
          description: 'The full library of 102 active regulations, filterable by domain, jurisdiction, and status. Each card is a clickable entry point to full details, requirements, penalties, and compliance checklists.',
          steps: [
            'Use the sidebar to filter by domain (e.g., Data Privacy only) or jurisdiction (e.g., EU only).',
            'Type in the search box to find a specific regulation by name, short name, or keyword.',
            'Click any card to open the full detail modal: requirements, penalties, milestones, coverage matrix row, and related standards.',
            'Click the star icon (☆) on a card to add it to your Watchlist — it persists across sessions.',
            'Click the bar chart icon (▦) to add a regulation to the Compare Tray — add up to 3 and click "Compare" for a side-by-side view.'
          ],
          tips: [
            'Cards with an amber "Updated" badge have been mentioned in a regulatory news item within the last 30 days.',
            'Filter by status "Proposed" to track regulations you should be preparing for before they take effect.'
          ]
        },
        standards: {
          title: 'Standards Library',
          persona: 'Best for: Security teams, CISOs, Internal auditors',
          description: 'The 10 major compliance frameworks mapped to regulations in the database. Each standard shows all its controls, which regulations it helps satisfy, and at what coverage level.',
          steps: [
            'Click any standard card to open full details including all mapped controls and coverage levels.',
            'In the detail modal, the coverage section shows how well the standard covers each regulation (Full, Substantial, Partial, Minimal).',
            'Star a standard to save it to your Watchlist for quick access.',
            'Use the search box to filter standards by name, category, or issuing body.'
          ],
          tips: [
            'ISO 27001 has the broadest regulatory coverage across cybersecurity and data privacy regulations — it is often the best first framework to implement.',
            '"Partial" coverage means the standard addresses some but not all requirements — use Gap Analysis to see exactly what remains uncovered.'
          ]
        },
        matrix: {
          title: 'Coverage Matrix',
          persona: 'Best for: CISOs, Compliance architects',
          description: 'A regulations × standards cross-reference table showing coverage levels at a glance. The single most powerful view for understanding your overall compliance landscape in one screen.',
          steps: [
            'Read rows as regulations (left column) and columns as standards. Colored dots indicate coverage level.',
            'Coverage levels: Full (dark blue) → Substantial → Partial → Minimal → None (empty). Hover any dot to see the coverage notes.',
            'Click any regulation name in the left column to open its full detail modal.',
            'Apply sidebar domain or jurisdiction filters to scope the matrix down to a specific compliance area.',
            'Click "Export CSV" to download the full matrix for offline analysis or audit documentation.'
          ],
          tips: [
            'Regulations with mostly empty cells have the weakest standard coverage — those are where your remediation investment will be highest.',
            'The matrix respects all sidebar filters — set domain to "Cybersecurity" to see only your cybersecurity coverage landscape.'
          ]
        },
        news: {
          title: 'Regulatory News Feed',
          persona: 'Best for: Compliance officers, Legal teams',
          description: 'Daily-updated news from 15+ official regulatory bodies: EDPB, ENISA, CISA, NIST, FTC, ICO (UK), SEC, EBA, ESMA, BIS, OCC, CFPB, Federal Reserve, IMO, and others.',
          steps: [
            'Filter news by source using the chips at the top (e.g., EDPB, CISA, FTC).',
            'Use the search box to find news about a specific regulation or topic keyword.',
            'Click "Read more →" on any card to open the original article in a new tab.',
            'Use "Update Feed" to trigger a local Python script or GitHub Action to refresh the news data with the latest items.',
            'Regulations with recent matching news will show an amber "Updated" badge on their cards throughout the app.'
          ],
          tips: [
            'The news feed is static data updated by running scripts/fetch_news.py or triggering the GitHub Actions workflow — it does not auto-refresh in the browser.',
            'The "Updated" badges on regulation cards anywhere in the app are powered by this same news data.'
          ]
        },
        watchlist: {
          title: 'My Watchlist',
          persona: 'Best for: All users — personal tracking',
          description: 'All the regulations and standards you have starred, collected in one place. Includes a scoped coverage matrix showing only your saved items, making it your personal compliance dashboard.',
          steps: [
            'Star any regulation card (☆ icon) or standard card throughout the app to add it here.',
            'Your watchlist persists across browser sessions — it is saved in your browser\'s localStorage.',
            'The scoped coverage matrix at the bottom shows how your watched standards cover your watched regulations.',
            'Click any item to open its full detail modal.',
            'Use "Clear All" to remove all watchlist items, or use the individual star icon on each card to remove a single item.'
          ],
          tips: [
            'Build your watchlist to mirror your actual compliance scope — the scoped matrix then gives you a focused, personal gap view.',
            'The watchlist stores regulation/standard IDs, so it automatically reflects any future data updates to those items.'
          ]
        },
        calendar: {
          title: 'Compliance Calendar',
          persona: 'Best for: Compliance program managers, Legal advisors',
          description: 'All upcoming deadlines and milestones from your filtered regulation set, organized by urgency: overdue, within 90 days, within a year, and further out.',
          steps: [
            'The reference date defaults to today. Change it using the date picker to simulate future scenarios — useful for quarterly and annual planning.',
            'Toggle between "Cards" (urgency swim lanes) and "Table" (sortable columns) using the view buttons.',
            'In Cards view, the left lane (red) shows overdue items; the middle lane (amber) shows what is due within 90 days.',
            'Click any card or table row to open the full regulation detail modal, including multi-phase milestones.',
            'Apply sidebar domain/jurisdiction filters to scope the calendar to only your applicable regulations.'
          ],
          tips: [
            'Advance the reference date by 90 days to see what becomes "urgent" soon — a fast way to build a quarterly compliance roadmap.',
            'Multi-phase regulations like EU AI Act, DORA, and NIS2 show individual milestone cards for each enforcement phase.'
          ]
        },
        risk: {
          title: 'Risk Radar',
          persona: 'Best for: CISOs, Risk managers, Board-level reporting',
          description: 'Regulations ranked by combined risk score: (Penalty Severity × 2) + Enforcement Intensity + 1 bonus point if a deadline is within 90 days. Two modes: heatmap and sortable table.',
          steps: [
            'View the heatmap to see how regulations cluster by penalty severity (x-axis: 1–5 stars) and enforcement intensity (y-axis: Low/Medium/High).',
            'Regulations in the top-right quadrant (high enforcement + max penalty) represent your highest compliance risk.',
            'Switch to Table view for sortable columns — click any column header to re-sort.',
            'Click any regulation badge in the heatmap or any table row to open its full detail modal.',
            'Apply sidebar filters to focus on the domains or jurisdictions most relevant to your organization.'
          ],
          tips: [
            'Use the Table view sorted by "Combined Score" for a ready-made risk register to present to leadership.',
            'The 90-day deadline bonus means regulations near their effective date temporarily appear with a higher combined score — check the Calendar view for precise timing.'
          ]
        },
        gap: {
          title: 'Gap Analysis',
          persona: 'Best for: Internal auditors, Compliance teams',
          description: 'Select the regulations you are subject to and the standards you have implemented. The system calculates coverage using 272 mapped obligations and shows exactly where gaps remain — at the individual requirement level.',
          steps: [
            'In the left panel, check the regulations that apply to your organization. Use the domain group headers or "All"/"None" buttons to batch-select.',
            'In the right panel, check the standards your organization has implemented or is certified against.',
            'Click "Generate Report" to calculate coverage. The report appears below the selector.',
            'Expand any regulation row (click the row or arrow) to see per-requirement coverage detail with red/amber/green dots.',
            'Click "Export Report" to download a self-contained HTML file suitable for audit working papers and board reporting.'
          ],
          tips: [
            'Start with 2–3 regulations and your core standards to understand the format before running a full analysis.',
            'Requirements marked "Not Covered" (red dot) map directly to regulatory obligations you have no standard addressing — these are your remediation priorities.'
          ]
        },
        traceability: {
          title: 'Control Traceability Matrix',
          persona: 'Best for: Internal auditors, Audit testing teams',
          description: 'Select a compliance standard to see a matrix of its controls mapped to all applicable regulations. The foundation for building structured audit testing plans.',
          steps: [
            'Click a standard tab at the top (ISO 27001, SOC 2, NIST CSF, etc.) to load its controls.',
            'Each row is a control from the standard; each column is a regulation. Colored cells indicate a mapping with the specific articles cited.',
            'Toggle "Group by Theme" to organize controls into categories (Access Control, Incident Response, Data Governance, etc.).',
            'Hover any colored cell to see the specific regulatory articles the control addresses.',
            'Click "Export Testing Plan" to download an HTML workbook structured for audit test procedures — with blank columns for Testing Objective, Procedure, and Finding.'
          ],
          tips: [
            'The exported testing plan is formatted as one row per control–regulation pair with article citations and coverage level — paste it directly into your GRC tool.',
            'Click any regulation column header to open the full regulation detail modal without leaving the matrix view.'
          ]
        },
        posture: {
          title: 'Compliance Posture Scorecard',
          persona: 'Best for: CISOs, Compliance directors, Board reporting',
          description: 'Check off the standards your organization holds and see your overall coverage score, broken down by domain and regulation. The Recommendations tab shows the highest-impact standards to add next.',
          steps: [
            'Check the standards your organization currently holds in the standards selector at the top of the view.',
            'The Scorecard tab shows: overall coverage ring, domain breakdown cards, and per-regulation progress bars.',
            'Red bars are regulations with the least coverage by your current standard set — prioritize these.',
            'Switch to the Recommendations tab to see which unimplemented standards would close the most gaps.',
            'Click "Export" to download a posture snapshot as a print-ready HTML file suitable for board or leadership reporting.'
          ],
          tips: [
            'Set your Applicability Profile first — the posture scorecard narrows to your profile\'s regulations, making the score meaningful to your organization.',
            'The "Recommended Next Standard" KPI card shows the single standard that would improve your coverage score the most with no other changes.'
          ]
        },
        jurisdiction: {
          title: 'Jurisdiction Overlap Analysis',
          persona: 'Best for: Multinational compliance teams, M&A advisors',
          description: 'Select two or more jurisdictions to identify regulations that apply in multiple areas simultaneously, surface conflicting requirements, and see what is unique to each jurisdiction.',
          steps: [
            'Click jurisdiction chips to select the regions your organization operates in. Each chip shows the regulation count for that region.',
            'The summary bar shows: shared regulations (apply in all selected jurisdictions), unique regulations per jurisdiction, and detected conflicts.',
            'The "Shared Obligations" table lists regulations applying across all selected jurisdictions — these need unified compliance approaches.',
            'The "Unique Regulations" grid shows obligations that only exist in specific jurisdictions.',
            'Expand "Conflicting Requirements" to see where the same obligation (e.g., breach notification) has different time windows across jurisdictions.'
          ],
          tips: [
            'Start with EU + US Federal as a baseline — this combination covers the largest compliance surface for most multinational technology companies.',
            'Use this view during M&A due diligence to quickly understand new jurisdictional obligations introduced by an acquisition target\'s operating regions.'
          ]
        }
      }
    };
  }
};
