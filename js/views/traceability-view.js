/* Feature L — Control Traceability Matrix */
const TraceabilityView = {
  template: `
    <div>
      <div class="view-header">
        <h1 class="view-title">Control Traceability Matrix</h1>
        <p class="view-subtitle">
          Select a standard to see how its controls map across regulations.
          Each cell shows the coverage level and mapped regulatory articles.
        </p>
      </div>

      <!-- Standard selector -->
      <div class="trace-std-selector">
        <span class="trace-std-selector__label">Standard:</span>
        <div class="trace-std-tabs">
          <button
            v-for="std in $s.standards"
            :key="std.id"
            class="trace-std-tab"
            :class="{active: selectedStdId === std.id}"
            @click="selectedStdId = std.id"
          >{{ std.short_name }}</button>
        </div>
      </div>

      <template v-if="selectedStd">
        <!-- Controls: group toggle + export -->
        <div class="trace-toolbar">
          <div class="trace-toolbar__left">
            <label class="trace-toggle-label">
              <input type="checkbox" v-model="groupByTheme" />
              <span>Group by theme</span>
            </label>
            <span class="trace-info">
              {{ selectedStd.key_controls.length }} controls &nbsp;·&nbsp;
              {{ mappedRegs.length }} regulations with mappings
            </span>
          </div>
          <button class="btn-trace-export" @click="exportTestingPlan">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Testing Plan
          </button>
        </div>

        <!-- Scrollable matrix table -->
        <div class="trace-matrix-wrap">
          <table class="trace-matrix">
            <thead>
              <tr>
                <th class="trace-ctrl-col">Control</th>
                <th
                  v-for="reg in mappedRegs"
                  :key="reg.id"
                  class="trace-reg-col"
                  :title="reg.name"
                  @click="$openItem(reg, 'regulation')"
                >
                  <span class="trace-reg-name">{{ reg.short_name }}</span>
                  <span class="trace-reg-jur">{{ reg.jurisdiction }}</span>
                </th>
                <th v-if="!mappedRegs.length" class="trace-no-regs-th">No regulations have mappings to this standard under current filters.</th>
              </tr>
            </thead>
            <tbody>
              <!-- Group header rows when groupByTheme -->
              <template v-for="group in controlGroups" :key="group.theme">
                <tr v-if="groupByTheme && group.theme !== '__all__'" class="trace-group-row">
                  <td :colspan="mappedRegs.length + 1" class="trace-group-label">{{ group.theme }}</td>
                </tr>
                <tr
                  v-for="ctrl in group.controls"
                  :key="ctrl.index"
                  class="trace-ctrl-row"
                >
                  <td class="trace-ctrl-cell">
                    <div class="trace-ctrl-index">C{{ ctrl.index + 1 }}</div>
                    <div class="trace-ctrl-text">{{ ctrl.text }}</div>
                  </td>
                  <td
                    v-for="reg in mappedRegs"
                    :key="reg.id"
                    class="trace-map-cell"
                    :class="cellClass(ctrl, reg)"
                    :title="cellTitle(ctrl, reg)"
                    @click="cellClick(ctrl, reg)"
                  >
                    <span v-if="cellMapping(ctrl, reg)" class="trace-cell-content">
                      <span class="coverage-badge" :class="'coverage-' + cellMapping(ctrl, reg).coverage_level">
                        {{ shortCovLabel(cellMapping(ctrl, reg).coverage_level) }}
                      </span>
                      <span v-if="cellArticles(ctrl, reg)" class="trace-articles">
                        {{ cellArticles(ctrl, reg) }}
                      </span>
                    </span>
                    <span v-else class="trace-cell-empty">—</span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Coverage legend -->
        <div class="trace-legend">
          <span v-for="(label, level) in coverageLevels" :key="level" class="trace-legend-item">
            <span class="coverage-badge" :class="'coverage-' + level">{{ shortCovLabel(level) }}</span>
            {{ label }}
          </span>
          <span class="trace-legend-item">
            <span class="trace-cell-empty">—</span>
            Not mapped
          </span>
        </div>
      </template>

      <div v-else class="trace-empty">
        Select a standard above to generate the traceability matrix.
      </div>
    </div>
  `,

  data() {
    return {
      selectedStdId: null,
      groupByTheme: false
    };
  },

  mounted() {
    if (this.$s.standards.length) {
      this.selectedStdId = this.$s.standards[0].id;
    }
  },

  computed: {
    selectedStd() {
      return this.$s.standards.find(s => s.id === this.selectedStdId) || null;
    },

    filteredRegulations() {
      const { regulations, filters } = this.$s;
      return regulations.filter(r => {
        const domainOk       = r.domain.some(d => filters.domains.includes(d));
        const jurisdictionOk = filters.jurisdictions.includes(r.enforcement_region);
        const statusOk       = filters.status === 'all' || r.status === filters.status;
        return domainOk && jurisdictionOk && statusOk;
      });
    },

    mappingsForStd() {
      if (!this.selectedStdId) return [];
      return this.$s.mappings.filter(m => m.standard_id === this.selectedStdId);
    },

    mappedRegs() {
      const mappedIds = new Set(this.mappingsForStd.map(m => m.regulation_id));
      return this.filteredRegulations
        .filter(r => mappedIds.has(r.id))
        .sort((a, b) => a.short_name.localeCompare(b.short_name));
    },

    indexedControls() {
      if (!this.selectedStd) return [];
      return this.selectedStd.key_controls.map((text, index) => ({ text, index }));
    },

    controlGroups() {
      if (!this.groupByTheme) {
        return [{ theme: '__all__', controls: this.indexedControls }];
      }
      // Infer theme from control text keywords
      const groups = {};
      this.indexedControls.forEach(ctrl => {
        const theme = this.inferControlTheme(ctrl.text);
        if (!groups[theme]) groups[theme] = [];
        groups[theme].push(ctrl);
      });
      return Object.entries(groups)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([theme, controls]) => ({ theme, controls }));
    },

    coverageLevels() {
      return {
        full: 'Full coverage',
        substantial: 'Substantial',
        partial: 'Partial',
        minimal: 'Minimal'
      };
    }
  },

  methods: {
    cellMapping(ctrl, reg) {
      return this.mappingsForStd.find(m => m.regulation_id === reg.id) || null;
    },

    cellClass(ctrl, reg) {
      const m = this.cellMapping(ctrl, reg);
      if (!m) return 'trace-cell--none';
      return 'trace-cell--' + m.coverage_level;
    },

    cellTitle(ctrl, reg) {
      const m = this.cellMapping(ctrl, reg);
      if (!m) return `${reg.short_name}: Not mapped to this standard`;
      const articles = (m.mapped_articles || []).join(', ');
      return `${reg.short_name} — ${m.coverage_level} coverage${articles ? ' · Articles: ' + articles : ''}`;
    },

    cellArticles(ctrl, reg) {
      const m = this.cellMapping(ctrl, reg);
      if (!m || !m.mapped_articles || !m.mapped_articles.length) return '';
      return m.mapped_articles.slice(0, 3).join(', ') + (m.mapped_articles.length > 3 ? '…' : '');
    },

    cellClick(ctrl, reg) {
      const m = this.cellMapping(ctrl, reg);
      if (m) this.$openItem(reg, 'regulation');
    },

    shortCovLabel(level) {
      return { full: 'Full', substantial: 'Sub', partial: 'Part', minimal: 'Min' }[level] || level;
    },

    inferControlTheme(text) {
      const t = text.toLowerCase();
      if (/access|identity|authenticat|privilege/.test(t))         return 'Access Control';
      if (/incident|respond|detect|monitor|alert/.test(t))         return 'Incident Management';
      if (/risk|assess|evaluat|threat|vulnerab/.test(t))           return 'Risk Assessment';
      if (/policy|procedure|document|record|govern/.test(t))       return 'Policies & Governance';
      if (/encrypt|crypto|key|secure communicat/.test(t))          return 'Cryptography';
      if (/vendor|supplier|third.party|outsourc/.test(t))          return 'Supplier Management';
      if (/train|aware|educat|staff/.test(t))                      return 'Training & Awareness';
      if (/physical|facilit|environment|hardware/.test(t))         return 'Physical Security';
      if (/audit|log|trace|report/.test(t))                        return 'Audit & Logging';
      if (/backup|recover|continuity|resilien/.test(t))            return 'Business Continuity';
      if (/data|classif|retention|personal|privac/.test(t))        return 'Data Management';
      return 'General Controls';
    },

    exportTestingPlan() {
      if (!this.selectedStd) return;
      const today = new Date().toISOString().slice(0, 10);
      const stdName = this.selectedStd.short_name;
      const stdFullName = this.selectedStd.name;

      const regHeaders = this.mappedRegs.map(r =>
        `<th title="${r.name}">${r.short_name}<br/><span class="sub">${r.jurisdiction}</span></th>`
      ).join('');

      const bodyRows = this.indexedControls.map(ctrl => {
        const regCells = this.mappedRegs.map(reg => {
          const m = this.cellMapping(ctrl, reg);
          if (!m) return '<td class="empty">—</td>';
          const arts = (m.mapped_articles || []).join(', ') || '—';
          return `<td class="cov-${m.coverage_level}">
            <span class="badge badge-${m.coverage_level}">${this.shortCovLabel(m.coverage_level)}</span>
            <div class="arts">${arts}</div>
          </td>`;
        }).join('');

        const covSummary = this.mappedRegs.map(r => {
          const m = this.cellMapping(ctrl, r);
          return m ? m.coverage_level[0].toUpperCase() : '—';
        }).join(' / ');

        return `<tr>
          <td class="ctrl-idx">C${ctrl.index + 1}</td>
          <td class="ctrl-text">${ctrl.text}</td>
          ${regCells}
          <td class="blank testing-objective"></td>
          <td class="blank procedure"></td>
          <td class="blank finding"></td>
        </tr>`;
      }).join('');

      const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Control Traceability — ${stdName} — ${today}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:12px;color:#1e293b;margin:0;padding:20px;max-width:1400px;}
  h1{font-size:18px;margin:0 0 4px;}
  .meta{font-size:11px;color:#64748b;margin-bottom:16px;border-bottom:1px solid #e2e8f0;padding-bottom:12px;}
  table{width:100%;border-collapse:collapse;font-size:11px;}
  th{padding:7px 8px;text-align:left;background:#1e293b;color:#fff;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;vertical-align:bottom;white-space:nowrap;}
  td{padding:7px 8px;border-bottom:1px solid #e2e8f0;border-right:1px solid #f1f5f9;vertical-align:top;}
  tr:nth-child(even) td{background:#f8fafc;}
  .ctrl-idx{width:38px;font-weight:700;color:#64748b;font-size:10px;}
  .ctrl-text{max-width:320px;min-width:200px;line-height:1.5;}
  .sub{font-size:9px;font-weight:400;color:#94a3b8;}
  .badge{display:inline-block;padding:1px 6px;border-radius:999px;font-size:9px;font-weight:700;margin-bottom:3px;}
  .badge-full{background:#dcfce7;color:#166534;}
  .badge-substantial{background:#dbeafe;color:#1d4ed8;}
  .badge-partial{background:#fef3c7;color:#92400e;}
  .badge-minimal{background:#f1f5f9;color:#475569;}
  .arts{font-size:9px;color:#94a3b8;margin-top:1px;line-height:1.4;}
  .empty{color:#d1d5db;text-align:center;}
  .cov-full td,.cov-full{background:#f0fdf4 !important;}
  .cov-partial{background:#fffbeb !important;}
  .blank{background:#f8fafc;min-width:120px;}
  .testing-objective::before,.procedure::before,.finding::before{content:attr(class);font-size:8px;color:#94a3b8;text-transform:uppercase;}
  .instructions{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;margin-bottom:16px;font-size:11px;color:#1d4ed8;}
  .legend{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;font-size:11px;}
  .legend-item{display:flex;align-items:center;gap:5px;}
  @media print{body{padding:4px;font-size:10px;}th{font-size:9px;}table{page-break-inside:auto;}tr{page-break-inside:avoid;}}
</style></head><body>
<h1>Control Traceability Matrix — ${stdName}</h1>
<div class="meta">
  ${stdFullName} &nbsp;·&nbsp; Generated: ${today} &nbsp;·&nbsp;
  ${this.indexedControls.length} controls &nbsp;·&nbsp;
  ${this.mappedRegs.length} regulations mapped
</div>
<div class="instructions">
  <strong>Instructions:</strong>
  Fill the Testing Objective column with the specific audit test for each control.
  The Procedure column should describe how you will verify compliance evidence.
  The Finding column records the outcome of each test.
  Coverage level indicates how thoroughly the standard's control addresses the regulation:
  Full = complete alignment, Sub = substantial, Part = partial, Min = minimal.
</div>
<div class="legend">
  <span class="legend-item"><span class="badge badge-full">Full</span> Complete coverage</span>
  <span class="legend-item"><span class="badge badge-substantial">Sub</span> Substantial coverage</span>
  <span class="legend-item"><span class="badge badge-partial">Part</span> Partial coverage</span>
  <span class="legend-item"><span class="badge badge-minimal">Min</span> Minimal coverage</span>
</div>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Control</th>
      ${regHeaders}
      <th class="blank">Testing Objective</th>
      <th class="blank">Procedure</th>
      <th class="blank">Finding</th>
    </tr>
  </thead>
  <tbody>${bodyRows}</tbody>
</table>
<div style="margin-top:16px;font-size:10px;color:#94a3b8;">Generated by ComplianceMap · For internal audit use only</div>
</body></html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `traceability-${stdName.toLowerCase().replace(/\s+/g, '-')}-${today}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
};
