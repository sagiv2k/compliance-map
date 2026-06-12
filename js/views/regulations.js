/* Regulations list view — filterable card grid */
const RegulationsView = {
  template: `
    <div>
      <div class="view-header" style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <div>
          <h1 class="view-title">Regulations</h1>
          <p class="view-subtitle">
            Global regulations categorized by domain and country of application.
            Click any card to see full details and related compliance standards.
          </p>
        </div>
        <button class="view-help-btn" @click="$s.helpPanelOpen = true" title="How to use Regulations">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </button>
      </div>

      <div class="results-count">
        Showing <strong>{{ filteredRegulations.length }}</strong> of {{ $s.regulations.length }} regulations
        <span v-if="$s.filters.search"> matching "<strong>{{ $s.filters.search }}</strong>"</span>
      </div>

      <div class="card-grid">
        <template v-if="filteredRegulations.length > 0">
          <reg-card
            v-for="reg in filteredRegulations"
            :key="reg.id"
            :regulation="reg"
          />
        </template>
        <div v-else class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <h3>No regulations found</h3>
          <p>Try adjusting the domain filters or clearing the search term.</p>
        </div>
      </div>
    </div>
  `,
  computed: {
    filteredRegulations() {
      const { regulations, filters } = this.$s;
      return regulations.filter(r => {
        const domainOk        = r.domain.some(d => filters.domains.includes(d));
        const jurisdictionOk  = filters.jurisdictions.includes(r.enforcement_region);
        const statusOk        = filters.status === 'all' || r.status === filters.status;
        const q = filters.search.toLowerCase();
        const searchOk = !q || r.name.toLowerCase().includes(q) ||
          r.short_name.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.jurisdiction.toLowerCase().includes(q);
        return domainOk && jurisdictionOk && statusOk && searchOk;
      });
    }
  }
};
