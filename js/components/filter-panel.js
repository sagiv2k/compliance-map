/* Filter sidebar component — domain checkboxes, search, status toggle */
const FilterPanelComponent = {
  template: `
    <div>
      <!-- Search -->
      <div class="sidebar-section">
        <span class="sidebar-label">Search</span>
        <input
          class="filter-search"
          type="text"
          placeholder="Regulation or standard…"
          :value="$s.filters.search"
          @input="$s.filters.search = $event.target.value"
        />
      </div>

      <!-- Domain filter -->
      <div class="sidebar-section">
        <span class="sidebar-label">Domain</span>
        <div v-for="d in domainList" :key="d.key" class="filter-domain-item" @click="toggleDomain(d.key)">
          <span class="filter-domain-check" :class="{ checked: isDomainActive(d.key) }"
                :style="isDomainActive(d.key) ? { background: d.color } : {}">
            <svg v-if="isDomainActive(d.key)" width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4l2.5 2.5L9 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="filter-domain-dot" :style="{ background: d.color }"></span>
          <span class="filter-domain-label">{{ d.label }}</span>
          <span class="filter-domain-count">{{ domainCount(d.key) }}</span>
        </div>
      </div>

      <!-- Status filter -->
      <div class="sidebar-section">
        <span class="sidebar-label">Status</span>
        <div class="filter-radio-group">
          <div class="filter-radio-item" @click="$s.filters.status = 'active'">
            <span class="filter-radio-circle" :class="{ selected: $s.filters.status === 'active' }">
              <span v-if="$s.filters.status === 'active'" class="filter-radio-inner"></span>
            </span>
            <span class="filter-radio-label">Active only</span>
          </div>
          <div class="filter-radio-item" @click="$s.filters.status = 'all'">
            <span class="filter-radio-circle" :class="{ selected: $s.filters.status === 'all' }">
              <span v-if="$s.filters.status === 'all'" class="filter-radio-inner"></span>
            </span>
            <span class="filter-radio-label">All statuses</span>
          </div>
        </div>
      </div>

      <!-- Reset -->
      <div class="sidebar-section">
        <button class="btn-reset" @click="resetFilters">Reset Filters</button>
      </div>
    </div>
  `,
  computed: {
    domainList() {
      return Object.entries(this.$dc).map(([key, cfg]) => ({ key, label: cfg.label, color: cfg.color }));
    }
  },
  methods: {
    isDomainActive(key) {
      return this.$s.filters.domains.includes(key);
    },
    toggleDomain(key) {
      const idx = this.$s.filters.domains.indexOf(key);
      if (idx === -1) {
        this.$s.filters.domains.push(key);
      } else {
        this.$s.filters.domains.splice(idx, 1);
      }
    },
    domainCount(key) {
      return this.$s.regulations.filter(r => r.domain.includes(key)).length;
    },
    resetFilters() {
      this.$s.filters.domains = Object.keys(this.$dc);
      this.$s.filters.search = '';
      this.$s.filters.status = 'active';
    }
  }
};
