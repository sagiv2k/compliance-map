/* Regulations list view — filterable card grid */
const RegulationsView = {
  template: `
    <div>
      <div class="view-header">
        <h1 class="view-title">Regulations</h1>
        <p class="view-subtitle">
          Global regulations categorized by domain and country of application.
          Click any card to see full details and related compliance standards.
        </p>
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
