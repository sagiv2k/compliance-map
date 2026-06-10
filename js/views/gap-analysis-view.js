/* Feature C — Gap Analysis Report */
const GapAnalysisView = {
  template: `
    <div>
      <div class="view-header">
        <h1 class="view-title">Gap Analysis</h1>
        <p class="view-subtitle">
          Select the regulations in scope and the standards you have implemented.
          The system calculates coverage gaps using the 272 mapped obligations.
        </p>
      </div>

      <!-- ── Setup panel (shown until report generated) ── -->
      <div v-if="!reportReady" class="gap-setup">

        <div class="gap-setup-cols">
          <!-- Left: Regulations -->
          <div class="gap-setup-col">
            <div class="gap-setup-col__header">
              <span class="gap-setup-col__title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Regulations in scope
              </span>
              <div style="display:flex;gap:6px;">
                <button class="gap-sel-btn" @click="selectAllRegs">All</button>
                <button class="gap-sel-btn" @click="selectedRegs=[]">None</button>
              </div>
            </div>

            <div class="gap-search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" v-model="regSearch" placeholder="Search regulations…" class="gap-search-input" />
            </div>

            <div class="gap-check-list">
              <template v-for="group in regGroups" :key="group.domain">
                <div class="gap-group-label">{{ $domainLabel(group.domain) }}</div>
                <template v-for="reg in group.regs" :key="reg.id">
                  <label class="gap-check-item">
                    <input type="checkbox" :value="reg.id" v-model="selectedRegs" />
                    <span class="gap-check-name">{{ reg.short_name }}</span>
                    <span class="gap-check-sub">{{ reg.jurisdiction }}</span>
                  </label>
                </template>
              </template>
              <div v-if="!filteredRegs.length" style="padding:16px;font-size:13px;color:var(--color-text-muted);">No regulations match your search.</div>
            </div>

            <div class="gap-sel-count">{{ selectedRegs.length }} selected</div>
          </div>

          <!-- Right: Standards -->
          <div class="gap-setup-col">
            <div class="gap-setup-col__header">
              <span class="gap-setup-col__title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Standards implemented
              </span>
              <div style="display:flex;gap:6px;">
                <button class="gap-sel-btn" @click="selectedStds=$s.standards.map(s=>s.id)">All</button>
                <button class="gap-sel-btn" @click="selectedStds=[]">None</button>
              </div>
            </div>
            <div class="gap-check-list gap-check-list--stds">
              <label v-for="std in $s.standards" :key="std.id" class="gap-check-item gap-check-item--std">
                <input type="checkbox" :value="std.id" v-model="selectedStds" />
                <div>
                  <span class="gap-check-name">{{ std.short_name }}</span>
                  <span class="gap-check-sub">{{ std.name }}</span>
                </div>
              </label>
            </div>
            <div class="gap-sel-count">{{ selectedStds.length }} of {{ $s.standards.length }} selected</div>
          </div>
        </div>

        <!-- Generate button -->
        <div style="text-align:center;margin-top:24px;">
          <button
            class="btn-gap-generate"
            :disabled="!selectedRegs.length || !selectedStds.length"
            @click="generateReport"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Run Gap Analysis
          </button>
          <div v-if="!selectedRegs.length || !selectedStds.length" style="margin-top:8px;font-size:12px;color:var(--color-text-muted);">
            Select at least one regulation and one standard to continue.
          </div>
        </div>
      </div>

      <!-- ── Report ── -->
      <div v-else>
        <!-- Report toolbar -->
        <div class="gap-report-toolbar">
          <button class="gap-toolbar-btn" @click="reportReady=false">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Edit Selection
          </button>
          <div class="gap-summary-pills">
            <span class="gap-pill gap-pill--total">{{ report.length }} regulations</span>
            <span class="gap-pill gap-pill--covered">{{ coveredCount }} fully covered</span>
            <span class="gap-pill gap-pill--gap">{{ report.length - coveredCount }} with gaps</span>
          </div>
          <button class="gap-toolbar-btn gap-toolbar-btn--export" @click="exportReport">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export HTML Report
          </button>
        </div>

        <!-- Standards being assessed -->
        <div class="gap-std-chips">
          <span style="font-size:12px;font-weight:600;color:var(--color-text-secondary);">Standards assessed:</span>
          <span v-for="std in assessedStandards" :key="std.id" class="gap-std-chip">{{ std.short_name }}</span>
        </div>

        <!-- Per-regulation accordion rows -->
        <div class="gap-report-list">
          <div
            v-for="row in report"
            :key="row.reg.id"
            class="gap-report-row"
            :class="'gap-row--' + row.overallTier"
          >
            <!-- Header row (always visible) -->
            <div class="gap-row-header" @click="toggleRow(row.reg.id)">
              <div class="gap-row-left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="gap-row-chevron" :class="{open: openRows[row.reg.id]}">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
                <span class="gap-row-name">{{ row.reg.short_name }}</span>
                <span class="gap-row-fullname">{{ row.reg.name }}</span>
              </div>
              <div class="gap-row-right">
                <div class="gap-coverage-bar" :title="row.coveragePct + '% average coverage'">
                  <div class="gap-coverage-fill" :class="'gap-fill--' + row.overallTier" :style="{width: row.coveragePct + '%'}"></div>
                </div>
                <span class="gap-coverage-pct">{{ row.coveragePct }}%</span>
                <span class="gap-tier-badge" :class="'gap-tier-badge--' + row.overallTier">{{ tierLabel(row.overallTier) }}</span>
              </div>
            </div>

            <!-- Detail rows (expanded) -->
            <div v-show="openRows[row.reg.id]" class="gap-row-detail">
              <!-- Standard-by-standard coverage -->
              <div class="gap-std-coverage">
                <div v-for="sc in row.stdCoverage" :key="sc.std.id" class="gap-std-row">
                  <span class="gap-std-name">{{ sc.std.short_name }}</span>
                  <span class="coverage-badge" :class="sc.mapped ? 'coverage-' + sc.coverage_level : ''">
                    {{ sc.mapped ? coverageLabel(sc.coverage_level) : 'Not mapped' }}
                  </span>
                  <span v-if="sc.notes" class="gap-std-notes">{{ sc.notes }}</span>
                </div>
              </div>

              <!-- Per-requirement breakdown (structured reqs only) -->
              <div v-if="row.hasStructured" class="gap-req-breakdown">
                <div class="gap-req-breakdown__title">Requirement-level assessment</div>
                <div
                  v-for="req in row.reqRows"
                  :key="req.id"
                  class="gap-req-row"
                  :class="'gap-req--' + req.status"
                >
                  <div class="gap-req-status-dot" :class="'gap-req-dot--' + req.status"></div>
                  <div class="gap-req-body">
                    <span class="req-id">{{ req.id }}</span>
                    <span class="req-theme" :class="'req-theme--' + req.control_theme">{{ themeLabel(req.control_theme) }}</span>
                    <div class="gap-req-text">{{ req.text }}</div>
                    <div v-if="req.status === 'not_covered' && req.consequence" class="gap-req-consequence">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {{ req.consequence }}
                    </div>
                  </div>
                  <span class="gap-req-label">{{ { covered:'Covered', partial:'Partial', not_covered:'Gap' }[req.status] }}</span>
                </div>
              </div>

              <!-- Open item link -->
              <button class="gap-open-btn" @click.stop="$openItem(row.reg, 'regulation')">
                View full regulation details →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      selectedRegs: [],
      selectedStds: [],
      regSearch: '',
      reportReady: false,
      report: [],
      openRows: {}
    };
  },

  computed: {
    filteredRegs() {
      const q = this.regSearch.toLowerCase();
      return this.$s.regulations.filter(r =>
        !q || r.short_name.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.jurisdiction.toLowerCase().includes(q)
      );
    },
    regGroups() {
      const groups = {};
      this.filteredRegs.forEach(r => {
        const d = r.domain[0];
        if (!groups[d]) groups[d] = [];
        groups[d].push(r);
      });
      return Object.entries(groups)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([domain, regs]) => ({ domain, regs: regs.sort((a, b) => a.short_name.localeCompare(b.short_name)) }));
    },
    assessedStandards() {
      return this.$s.standards.filter(s => this.selectedStds.includes(s.id));
    },
    coveredCount() {
      return this.report.filter(r => r.overallTier === 'full' || r.overallTier === 'substantial').length;
    }
  },

  methods: {
    selectAllRegs() {
      this.selectedRegs = this.filteredRegs.map(r => r.id);
    },
    toggleRow(id) {
      this.openRows = { ...this.openRows, [id]: !this.openRows[id] };
    },

    coverageScore(level) {
      return { full: 4, substantial: 3, partial: 2, minimal: 1 }[level] || 0;
    },
    coverageLabel(level) {
      return { full: 'Full', substantial: 'Sub', partial: 'Part', minimal: 'Min' }[level] || level;
    },
    tierLabel(tier) {
      return { full: 'Covered', substantial: 'Substantial', partial: 'Partial', minimal: 'Minimal', none: 'Not Covered' }[tier] || tier;
    },
    themeLabel(t) {
      return {
        data_governance:'Data Governance', access_control:'Access Control', incident_response:'Incident Response',
        vendor_management:'Vendor Mgmt', training_awareness:'Training', technical_controls:'Technical Controls',
        policy_procedures:'Policy', risk_assessment:'Risk Assessment', board_governance:'Board Governance',
        financial_controls:'Financial Controls'
      }[t] || t;
    },

    scoreTier(score) {
      if (score >= 4)  return 'full';
      if (score >= 3)  return 'substantial';
      if (score >= 2)  return 'partial';
      if (score >= 1)  return 'minimal';
      return 'none';
    },

    generateReport() {
      const { regulations, standards, mappings } = this.$s;
      const selRegs = regulations.filter(r => this.selectedRegs.includes(r.id));
      const selStds = standards.filter(s => this.selectedStds.includes(s.id));

      this.report = selRegs.map(reg => {
        // Per-standard coverage for this reg
        const stdCoverage = selStds.map(std => {
          const mapping = mappings.find(m => m.regulation_id === reg.id && m.standard_id === std.id);
          return {
            std,
            mapped: !!mapping,
            coverage_level: mapping?.coverage_level || null,
            notes: mapping?.notes || '',
            mapped_controls: mapping?.mapped_controls || []
          };
        });

        // Best score across all selected standards
        const bestScore = Math.max(0, ...stdCoverage.filter(sc => sc.mapped).map(sc => this.coverageScore(sc.coverage_level)));
        const overallTier = this.scoreTier(bestScore);
        const coveragePct = Math.round((bestScore / 4) * 100);

        // Per-requirement breakdown (only for structured reqs)
        const hasStructured = Array.isArray(reg.key_requirements) && reg.key_requirements.length > 0 && typeof reg.key_requirements[0] === 'object';
        const reqRows = hasStructured ? reg.key_requirements.map(req => {
          // Infer requirement coverage from overall standard coverage and control_theme matching
          const reqStatus = this.inferReqStatus(req, stdCoverage, bestScore);
          return { ...req, status: reqStatus };
        }) : [];

        return { reg, stdCoverage, overallTier, coveragePct, hasStructured, reqRows };
      }).sort((a, b) => b.coveragePct - a.coveragePct);  // Best-covered first... actually show gaps first
      this.report.sort((a, b) => a.coveragePct - b.coveragePct);

      this.openRows = {};
      this.reportReady = true;
    },

    inferReqStatus(req, stdCoverage, bestScore) {
      // If regulation has full coverage from a standard, requirements with matching control_theme are "covered"
      // If partial coverage, split by control_theme — security themes more likely covered by ISO 27001
      const techThemes = ['technical_controls', 'access_control', 'incident_response'];
      const govThemes  = ['policy_procedures', 'board_governance', 'risk_assessment', 'data_governance'];

      const fullCovStds  = stdCoverage.filter(sc => sc.mapped && (sc.coverage_level === 'full' || sc.coverage_level === 'substantial'));
      const partCovStds  = stdCoverage.filter(sc => sc.mapped && sc.coverage_level === 'partial');

      if (fullCovStds.length > 0) return 'covered';
      if (partCovStds.length > 0) {
        // For partial coverage: technical controls tend to be covered, governance less so
        if (techThemes.includes(req.control_theme)) return 'partial';
        if (govThemes.includes(req.control_theme)) return 'not_covered';
        return 'partial';
      }
      if (bestScore >= 1) return 'not_covered'; // minimal coverage
      return 'not_covered';
    },

    exportReport() {
      const today = new Date().toISOString().slice(0, 10);
      const stdList = this.assessedStandards.map(s => s.short_name).join(', ');

      const regSections = this.report.map(row => {
        const stdRows = row.stdCoverage.map(sc => `
          <tr>
            <td>${sc.std.short_name}</td>
            <td><span class="badge badge-${sc.mapped ? sc.coverage_level : 'none'}">${sc.mapped ? this.coverageLabel(sc.coverage_level) : 'Not Mapped'}</span></td>
            <td>${sc.notes || '—'}</td>
          </tr>`).join('');

        const reqSection = row.hasStructured ? `
          <h4 style="margin:14px 0 8px;font-size:13px;">Requirement-Level Assessment</h4>
          <table>
            <thead><tr><th style="width:90px;">Req #</th><th>Requirement</th><th style="width:90px;">Status</th><th>Consequence</th></tr></thead>
            <tbody>
              ${row.reqRows.map(r => `
                <tr class="req-${r.status}">
                  <td>${r.id}</td>
                  <td>${r.text}</td>
                  <td><span class="badge badge-req-${r.status}">${{covered:'Covered',partial:'Partial',not_covered:'Gap'}[r.status]}</span></td>
                  <td style="font-size:11px;color:#b91c1c;">${r.status !== 'covered' ? (r.consequence || '') : ''}</td>
                </tr>`).join('')}
            </tbody>
          </table>` : '';

        return `
          <div class="reg-section tier-${row.overallTier}">
            <div class="reg-header">
              <span class="reg-name">${row.reg.short_name}</span>
              <span class="reg-fullname">${row.reg.name}</span>
              <span class="tier-badge tier-${row.overallTier}">${this.tierLabel(row.overallTier)} (${row.coveragePct}%)</span>
            </div>
            <p style="font-size:12px;color:#64748b;margin:6px 0 10px;">${row.reg.authority} · ${row.reg.jurisdiction} · Penalties: ${row.reg.penalties || '—'}</p>
            <table>
              <thead><tr><th>Standard</th><th>Coverage</th><th>Notes</th></tr></thead>
              <tbody>${stdRows}</tbody>
            </table>
            ${reqSection}
          </div>`;
      }).join('');

      const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Gap Analysis Report — ${today}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:13px;color:#1e293b;margin:0;padding:28px;max-width:1100px;}
  h1{font-size:22px;margin:0 0 4px;}h2{font-size:16px;margin:24px 0 6px;}
  .meta{font-size:12px;color:#64748b;margin-bottom:24px;border-bottom:1px solid #e2e8f0;padding-bottom:14px;}
  .summary{display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap;}
  .sum-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 16px;text-align:center;}
  .sum-card__val{font-size:22px;font-weight:700;color:#1e293b;}
  .sum-card__lbl{font-size:11px;color:#64748b;}
  .reg-section{border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:16px;}
  .reg-header{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:8px;}
  .reg-name{font-size:15px;font-weight:700;}
  .reg-fullname{font-size:12px;color:#64748b;flex:1;}
  table{width:100%;border-collapse:collapse;font-size:12px;margin-top:8px;}
  th{padding:6px 10px;text-align:left;background:#f1f5f9;border-bottom:2px solid #e2e8f0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;}
  td{padding:7px 10px;border-bottom:1px solid #e2e8f0;vertical-align:top;}
  tr:nth-child(even) td{background:#fafafa;}
  .badge{padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;}
  .badge-full{background:#dcfce7;color:#166534;}
  .badge-substantial{background:#dbeafe;color:#1d4ed8;}
  .badge-partial{background:#fef3c7;color:#92400e;}
  .badge-minimal{background:#f1f5f9;color:#475569;}
  .badge-none{background:#f1f5f9;color:#94a3b8;}
  .badge-req-covered{background:#dcfce7;color:#166534;}
  .badge-req-partial{background:#fef3c7;color:#92400e;}
  .badge-req-not_covered{background:#fee2e2;color:#b91c1c;}
  .tier-badge{padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;}
  .tier-full{border-left:4px solid #16a34a;}.tier-badge.tier-full{background:#dcfce7;color:#166534;}
  .tier-substantial{border-left:4px solid #3b82f6;}.tier-badge.tier-substantial{background:#dbeafe;color:#1d4ed8;}
  .tier-partial{border-left:4px solid #d97706;}.tier-badge.tier-partial{background:#fef3c7;color:#92400e;}
  .tier-minimal{border-left:4px solid #dc2626;}.tier-badge.tier-minimal{background:#fee2e2;color:#b91c1c;}
  .tier-none{border-left:4px solid #94a3b8;}.tier-badge.tier-none{background:#f1f5f9;color:#475569;}
  .footer{margin-top:28px;padding-top:14px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;}
  @media print{body{padding:8px;}table{page-break-inside:auto;}tr{page-break-inside:avoid;}}
</style></head><body>
<h1>Compliance Gap Analysis Report</h1>
<div class="meta">
  Generated: ${today} &nbsp;·&nbsp; Standards assessed: ${stdList} &nbsp;·&nbsp; Regulations in scope: ${this.report.length}
</div>
<div class="summary">
  <div class="sum-card"><div class="sum-card__val">${this.report.length}</div><div class="sum-card__lbl">Regulations</div></div>
  <div class="sum-card"><div class="sum-card__val">${this.coveredCount}</div><div class="sum-card__lbl">Well Covered</div></div>
  <div class="sum-card"><div class="sum-card__val">${this.report.length - this.coveredCount}</div><div class="sum-card__lbl">Gaps Found</div></div>
  <div class="sum-card"><div class="sum-card__val">${this.assessedStandards.length}</div><div class="sum-card__lbl">Standards</div></div>
</div>
<h2>Regulation-by-Regulation Analysis (lowest coverage first)</h2>
${regSections}
<div class="footer">Generated by ComplianceMap &nbsp;·&nbsp; For internal audit purposes only</div>
</body></html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `gap-analysis-${today}.html`; a.click();
      URL.revokeObjectURL(url);
    }
  }
};
