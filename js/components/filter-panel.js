/* Filter sidebar component — topic domains, jurisdictions, search, status toggle */
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

      <!-- Domain / Topic filter (accordion) -->
      <div class="sidebar-section">
        <div class="filter-accordion-header" @click="domainsOpen = !domainsOpen">
          <span class="sidebar-label">Topics</span>
          <span class="filter-accordion-summary">{{ activeDomainsCount }}/{{ totalDomains }}</span>
          <svg class="filter-accordion-chevron" :class="{ open: domainsOpen }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <div v-if="domainsOpen" class="filter-accordion-body">
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
          <div class="filter-accordion-footer">
            <button class="sidebar-label-action" @click.stop="toggleAllDomains">
              {{ allDomainsActive ? 'None' : 'All' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Jurisdiction / Region filter (accordion) -->
      <div class="sidebar-section">
        <div class="filter-accordion-header" @click="jurisdictionsOpen = !jurisdictionsOpen">
          <span class="sidebar-label">Regions</span>
          <span class="filter-accordion-summary">{{ activeJurisdictionsCount }}/{{ totalJurisdictions }}</span>
          <svg class="filter-accordion-chevron" :class="{ open: jurisdictionsOpen }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <div v-if="jurisdictionsOpen" class="filter-accordion-body">
          <div v-for="j in jurisdictionList" :key="j.key" class="filter-domain-item" @click="toggleJurisdiction(j.key)">
            <span class="filter-domain-check" :class="{ checked: isJurisdictionActive(j.key) }"
                  :style="isJurisdictionActive(j.key) ? { background: j.color } : {}">
              <svg v-if="isJurisdictionActive(j.key)" width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l2.5 2.5L9 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="filter-domain-dot" :style="{ background: j.color }"></span>
            <span class="filter-domain-label">{{ j.label }}</span>
            <span class="filter-domain-count">{{ jurisdictionCount(j.key) }}</span>
          </div>
          <div class="filter-accordion-footer">
            <button class="sidebar-label-action" @click.stop="toggleAllJurisdictions">
              {{ allJurisdictionsActive ? 'None' : 'All' }}
            </button>
          </div>
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
  data() {
    return {
      domainsOpen: false,
      jurisdictionsOpen: false
    };
  },
  computed: {
    domainList() {
      return Object.entries(this.$dc).map(([key, cfg]) => ({ key, label: cfg.label, color: cfg.color }));
    },
    jurisdictionList() {
      return Object.entries(this.$jc).map(([key, cfg]) => ({ key, label: cfg.label, color: cfg.color }));
    },
    allDomainsActive() {
      return this.$s.filters.domains.length === Object.keys(this.$dc).length;
    },
    allJurisdictionsActive() {
      return this.$s.filters.jurisdictions.length === Object.keys(this.$jc).length;
    },
    activeDomainsCount() {
      return this.$s.filters.domains.length;
    },
    totalDomains() {
      return Object.keys(this.$dc).length;
    },
    activeJurisdictionsCount() {
      return this.$s.filters.jurisdictions.length;
    },
    totalJurisdictions() {
      return Object.keys(this.$jc).length;
    }
  },
  methods: {
    isDomainActive(key) {
      return this.$s.filters.domains.includes(key);
    },
    toggleDomain(key) {
      const idx = this.$s.filters.domains.indexOf(key);
      if (idx === -1) this.$s.filters.domains.push(key);
      else            this.$s.filters.domains.splice(idx, 1);
    },
    toggleAllDomains() {
      if (this.allDomainsActive) this.$s.filters.domains = [];
      else                       this.$s.filters.domains = Object.keys(this.$dc);
    },
    domainCount(key) {
      return this.$s.regulations.filter(r => r.domain.includes(key)).length;
    },
    isJurisdictionActive(key) {
      return this.$s.filters.jurisdictions.includes(key);
    },
    toggleJurisdiction(key) {
      const idx = this.$s.filters.jurisdictions.indexOf(key);
      if (idx === -1) this.$s.filters.jurisdictions.push(key);
      else            this.$s.filters.jurisdictions.splice(idx, 1);
    },
    toggleAllJurisdictions() {
      if (this.allJurisdictionsActive) this.$s.filters.jurisdictions = [];
      else                             this.$s.filters.jurisdictions = Object.keys(this.$jc);
    },
    jurisdictionCount(key) {
      return this.$s.regulations.filter(r => r.enforcement_region === key).length;
    },
    resetFilters() {
      this.$s.filters.domains        = Object.keys(this.$dc);
      this.$s.filters.jurisdictions  = Object.keys(this.$jc);
      this.$s.filters.search         = '';
      this.$s.filters.status         = 'active';
    }
  }
};
