/* Coverage matrix view — regulations × standards cross-reference table */
const MatrixView = {
  template: `
    <div>
      <div class="view-header">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <h1 class="view-title">Coverage Matrix</h1>
            <p class="view-subtitle">
              Shows which compliance standards cover each regulation.
              Click any cell for details. Click a regulation or standard name to open its full detail view.
            </p>
          </div>
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

      <!-- Legend -->
      <div class="matrix-legend">
        <div class="matrix-legend-item">
          <span class="coverage-dot coverage-full" style="width:12px;height:12px;border-radius:50%;display:inline-block;flex-shrink:0;"></span>
          Full coverage
        </div>
        <div class="matrix-legend-item">
          <span class="coverage-dot coverage-substantial" style="width:12px;height:12px;border-radius:50%;display:inline-block;flex-shrink:0;"></span>
          Substantial coverage
        </div>
        <div class="matrix-legend-item">
          <span class="coverage-dot coverage-partial" style="width:12px;height:12px;border-radius:50%;display:inline-block;flex-shrink:0;"></span>
          Partial coverage
        </div>
        <div class="matrix-legend-item">
          <span class="coverage-dot coverage-minimal" style="width:12px;height:12px;border-radius:50%;display:inline-block;flex-shrink:0;"></span>
          Minimal coverage
        </div>
        <div class="matrix-legend-item" style="color:var(--color-text-muted);">
          Empty = not mapped
        </div>
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
              </td>
              <td
                v-for="std in $s.standards"
                :key="std.id"
                class="matrix-cell"
                :title="getCellTooltip(reg.id, std.id)"
                @click="onCellClick(reg, std)"
              >
                <span
                  v-if="getMapping(reg.id, std.id)"
                  class="matrix-dot"
                  :class="'coverage-' + getMapping(reg.id, std.id).coverage_level"
                ></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,

  computed: {
    filteredRegulations() {
      const { regulations, filters } = this.$s;
      return regulations.filter(r => {
        const domainOk = r.domain.some(d => filters.domains.includes(d));
        const statusOk = filters.status === 'all' || r.status === filters.status;
        const q = filters.search.toLowerCase();
        const searchOk = !q || r.name.toLowerCase().includes(q) ||
          r.short_name.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q);
        return domainOk && statusOk && searchOk;
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
    getMapping(regId, stdId) {
      return this.mappingIndex[regId + '|' + stdId] || null;
    },
    getCellTooltip(regId, stdId) {
      const m = this.getMapping(regId, stdId);
      if (!m) return 'No mapping defined';
      return `${m.coverage_level.charAt(0).toUpperCase() + m.coverage_level.slice(1)} coverage — ${m.notes}`;
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
