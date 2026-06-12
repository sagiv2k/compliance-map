/* Coverage matrix view — regulations × standards cross-reference table */
const MatrixView = {
  template: `
    <div>
      <div class="hint-banner" v-if="!hintDismissed">
        <svg class="hint-banner__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div class="hint-banner__content">
          <strong class="hint-banner__title">Dots show coverage level.</strong>
          <span class="hint-banner__text">Each dot indicates how well a standard covers a regulation. Click any dot for specifics, or click a regulation name to open full details.</span>
          <button class="hint-banner__help-link" @click="$s.helpPanelOpen = true">How to use this view</button>
        </div>
        <button class="hint-banner__dismiss" @click="hintDismissed=true;dismissHint()" aria-label="Dismiss">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="view-header">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <h1 class="view-title">Coverage Matrix</h1>
            <p class="view-subtitle">
              Shows whether each compliance standard satisfies or covers a given regulation.
              Click any regulation name to view full details; click a cell to see coverage notes.
            </p>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="view-help-btn" @click="$s.helpPanelOpen = true" title="How to use Coverage Matrix">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </button>
            <button class="btn-export" @click="exportCsv">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="matrix-legend">
        <span class="matrix-legend-item">
          <span class="coverage-badge coverage-full">Full</span>
          Standard fully satisfies regulation
        </span>
        <span class="matrix-legend-item">
          <span class="coverage-badge coverage-substantial">Sub</span>
          Substantial — minor gaps remain
        </span>
        <span class="matrix-legend-item">
          <span class="coverage-badge coverage-partial">Part</span>
          Partial — key areas uncovered
        </span>
        <span class="matrix-legend-item">
          <span class="coverage-badge coverage-minimal">Min</span>
          Minimal — addresses a few aspects
        </span>
        <span class="matrix-legend-item" style="color:var(--color-text-muted);">
          Empty cell = not mapped
        </span>
      </div>

      <!-- Table -->
      <div class="matrix-wrapper">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>Regulation</th>
              <th v-for="std in $s.standards" :key="std.id"
                  @click="$openItem(std, 'standard')"
                  style="cursor:pointer;min-width:80px;"
                  :title="std.name">
                <div class="matrix-col-header">{{ std.short_name }}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reg in filteredRegulations" :key="reg.id">
              <td @click="$openItem(reg, 'regulation')" style="cursor:pointer;">
                <span class="matrix-reg-name">{{ reg.short_name }}</span>
                <span class="matrix-reg-domain">
                  {{ reg.domain.map(d => $domainLabel(d)).join(', ') }}
                </span>
                <span class="matrix-coverage-summary">
                  {{ coveredByCount(reg.id) }}/{{ $s.standards.length }} covered
                </span>
                <span v-if="coveredByCount(reg.id) > 0" class="matrix-covered-by">
                  {{ coveredByNames(reg.id) }}
                </span>
              </td>
              <td
                v-for="std in $s.standards"
                :key="std.id"
                class="matrix-cell"
                :class="{ 'matrix-cell--mapped': !!getMapping(reg.id, std.id) }"
                :title="getCellTooltip(reg.id, std.id)"
                @click="onCellClick(reg, std)"
              >
                <span
                  v-if="getMapping(reg.id, std.id)"
                  class="coverage-badge"
                  :class="'coverage-' + getMapping(reg.id, std.id).coverage_level"
                >{{ coverageAbbr(getMapping(reg.id, std.id).coverage_level) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,

  data() {
    return { hintDismissed: sessionStorage.getItem('cm_hint_matrix') === 'true' };
  },

  computed: {
    filteredRegulations() {
      const { regulations, filters } = this.$s;
      return regulations.filter(r => {
        const domainOk       = r.domain.some(d => filters.domains.includes(d));
        const jurisdictionOk = filters.jurisdictions.includes(r.enforcement_region);
        const statusOk       = filters.status === 'all' || r.status === filters.status;
        const q = filters.search.toLowerCase();
        const searchOk = !q || r.name.toLowerCase().includes(q) ||
          r.short_name.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q);
        return domainOk && jurisdictionOk && statusOk && searchOk;
      });
    },
    mappingIndex() {
      const idx = {};
      this.$s.mappings.forEach(m => {
        idx[m.regulation_id + '|' + m.standard_id] = m;
      });
      return idx;
    }
  },

  methods: {
    dismissHint() { try { sessionStorage.setItem('cm_hint_matrix', 'true'); } catch(e) {} },
    getMapping(regId, stdId) {
      return this.mappingIndex[regId + '|' + stdId] || null;
    },
    coverageAbbr(level) {
      return { full: 'Full', substantial: 'Sub', partial: 'Part', minimal: 'Min' }[level] || level;
    },
    coveredByCount(regId) {
      return this.$s.standards.filter(s => !!this.getMapping(regId, s.id)).length;
    },
    coveredByNames(regId) {
      return this.$s.standards
        .filter(s => !!this.getMapping(regId, s.id))
        .map(s => s.short_name)
        .join(' · ');
    },
    coverageSummaryTitle(regId) {
      const covered = this.$s.standards
        .filter(s => !!this.getMapping(regId, s.id))
        .map(s => s.short_name).join(', ');
      return covered ? `Covered by: ${covered}` : 'No standards mapped yet';
    },
    getCellTooltip(regId, stdId) {
      const m = this.getMapping(regId, stdId);
      if (!m) return 'Not mapped — this standard does not address this regulation';
      const level = m.coverage_level.charAt(0).toUpperCase() + m.coverage_level.slice(1);
      return `${level} coverage\n${m.notes}`;
    },
    onCellClick(reg, std) {
      const m = this.getMapping(reg.id, std.id);
      if (m) {
        this.$openItem(reg, 'regulation');
      }
    },
    exportCsv() {
      const headers = ['Regulation', 'Jurisdiction', ...this.$s.standards.map(s => s.short_name)];
      const rows = this.filteredRegulations.map(reg => {
        const cells = this.$s.standards.map(std => {
          const m = this.getMapping(reg.id, std.id);
          return m ? m.coverage_level : '';
        });
        return [reg.short_name, reg.jurisdiction, ...cells];
      });

      const csvRows = [headers, ...rows].map(r =>
        r.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')
      );
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ComplianceMap-coverage-matrix.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  }
};
