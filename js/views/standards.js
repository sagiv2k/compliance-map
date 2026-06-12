/* Standards list view — filterable card grid */
const StandardsView = {
  template: `
    <div>
      <div class="view-header" style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <div>
          <h1 class="view-title">Compliance Standards</h1>
          <p class="view-subtitle">
            Internationally recognized frameworks and standards that help organizations
            implement the controls needed to satisfy regulatory requirements.
            Click any card to see which regulations it helps satisfy.
          </p>
        </div>
        <button class="view-help-btn" @click="$s.helpPanelOpen = true" title="How to use Standards">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </button>
      </div>

      <div class="results-count">
        Showing <strong>{{ filteredStandards.length }}</strong> of {{ $s.standards.length }} standards
        <span v-if="$s.filters.search"> matching "<strong>{{ $s.filters.search }}</strong>"</span>
      </div>

      <div class="card-grid">
        <template v-if="filteredStandards.length > 0">
          <std-card
            v-for="std in filteredStandards"
            :key="std.id"
            :standard="std"
          />
        </template>
        <div v-else class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <h3>No standards found</h3>
          <p>Try clearing the search term or adjusting filters.</p>
        </div>
      </div>
    </div>
  `,
  computed: {
    filteredStandards() {
      const { standards, filters } = this.$s;
      const q = filters.search.toLowerCase();
      return standards.filter(s => {
        const domainOk = s.domains_addressed.some(d => filters.domains.includes(d));
        const searchOk = !q || s.name.toLowerCase().includes(q) ||
          s.short_name.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          s.issuing_body.toLowerCase().includes(q) ||
          this.$categoryLabel(s.category).toLowerCase().includes(q);
        return domainOk && searchOk;
      });
    }
  }
};
