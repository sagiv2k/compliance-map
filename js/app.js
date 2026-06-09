/* ===== Domain & Category Configuration ===== */
const DOMAIN_CONFIG = {
  data_privacy:           { label: 'Data Privacy',            color: '#3b82f6' },
  cybersecurity:          { label: 'Cybersecurity',           color: '#7c3aed' },
  finance:                { label: 'Finance',                  color: '#059669' },
  health:                 { label: 'Health',                   color: '#dc2626' },
  ai_governance:          { label: 'AI Governance',            color: '#f59e0b' },
  environment:            { label: 'Environment',              color: '#0d9488' },
  labor:                  { label: 'Labor',                    color: '#ea580c' },
  critical_infrastructure:{ label: 'Critical Infrastructure', color: '#64748b' }
};

const CATEGORY_CONFIG = {
  information_security: { label: 'Information Security' },
  privacy:              { label: 'Privacy' },
  cloud_security:       { label: 'Cloud Security' },
  quality:              { label: 'Quality Management' },
  risk_management:      { label: 'Risk Management' },
  financial_controls:   { label: 'Financial Controls' },
  it_governance:        { label: 'IT Governance' }
};

const ALL_DOMAINS = Object.keys(DOMAIN_CONFIG);
const VALID_VIEWS = ['overview', 'regulations', 'standards', 'matrix'];

/* ===== Global Reactive State ===== */
const AppState = Vue.reactive({
  regulations:      [],
  standards:        [],
  mappings:         [],
  loading:          true,
  error:            null,
  filters: {
    domains: [...ALL_DOMAINS],
    search:  '',
    status:  'active'
  },
  selectedItem:     null,
  selectedItemType: null,
  activeView:       'overview',
  sidebarOpen:      false,
  version:          '1.0.0',
  lastUpdated:      '—'
});

/* ===== Root Component ===== */
const RootComponent = {
  template: `
    <div>
      <!-- ── Navigation Bar ── -->
      <nav class="topnav">
        <a href="#overview" class="topnav__logo" @click.prevent="navigate('overview')">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#3b82f6"/>
            <circle cx="16" cy="16" r="9" stroke="white" stroke-width="1.8" fill="none"/>
            <line x1="7" y1="16" x2="25" y2="16" stroke="white" stroke-width="1.5"/>
            <path d="M16 7a11 11 0 0 1 3.5 9A11 11 0 0 1 16 25a11 11 0 0 1-3.5-9A11 11 0 0 1 16 7z" stroke="white" stroke-width="1.5" fill="none"/>
          </svg>
          <span>Compliance<em>Map</em></span>
        </a>

        <div class="topnav__nav">
          <button
            v-for="v in navViews" :key="v.id"
            class="nav-link"
            :class="{ active: $s.activeView === v.id }"
            @click="navigate(v.id)"
          >
            <span v-html="v.icon"></span>
            {{ v.label }}
          </button>
        </div>

        <div class="topnav__stats" v-if="!$s.loading">
          <span class="stat-pill"><strong>{{ $s.regulations.length }}</strong> Regs</span>
          <span class="stat-pill"><strong>{{ $s.standards.length }}</strong> Standards</span>
          <span class="stat-pill"><strong>{{ totalCountries }}</strong> Countries</span>
        </div>

        <button class="topnav__mobile-toggle" @click="$s.sidebarOpen = !$s.sidebarOpen" aria-label="Toggle filters">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </nav>

      <!-- ── Page body ── -->
      <div class="page-body">
        <!-- Mobile overlay -->
        <div
          class="sidebar-overlay"
          :class="{ visible: $s.sidebarOpen }"
          @click="$s.sidebarOpen = false"
        ></div>

        <!-- Sidebar -->
        <aside class="sidebar" :class="{ open: $s.sidebarOpen }" role="complementary" aria-label="Filters">
          <filter-panel />
        </aside>

        <!-- Main content -->
        <main class="main-content" role="main">
          <div v-if="$s.loading" class="loading-screen">
            <div class="spinner"></div>
            <span>Loading regulations database…</span>
          </div>
          <div v-else-if="$s.error" class="error-screen">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h3>Could not load data</h3>
            <p>{{ $s.error }}</p>
            <p style="font-size:13px;margin-top:8px;">
              <strong>Tip:</strong> Run a local server in the ComplianceMap folder:<br>
              <code style="background:#f1f5f9;padding:4px 8px;border-radius:4px;">python -m http.server 8080</code><br>
              then open <a href="http://localhost:8080">http://localhost:8080</a>
            </p>
          </div>
          <component v-else :is="currentViewComponent" />
        </main>
      </div>

      <!-- Footer -->
      <footer class="site-footer">
        ComplianceMap v{{ $s.version }} &nbsp;·&nbsp;
        Data last updated: {{ $s.lastUpdated }} &nbsp;·&nbsp;
        <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
      </footer>

      <!-- Detail modal (teleported above everything) -->
      <detail-modal v-if="$s.selectedItem" />
    </div>
  `,

  data() {
    return {
      navViews: [
        {
          id: 'overview', label: 'Overview',
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
        },
        {
          id: 'regulations', label: 'Regulations',
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'
        },
        {
          id: 'standards', label: 'Standards',
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
        },
        {
          id: 'matrix', label: 'Coverage Matrix',
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
        }
      ]
    };
  },

  computed: {
    currentViewComponent() {
      return {
        overview:    OverviewView,
        regulations: RegulationsView,
        standards:   StandardsView,
        matrix:      MatrixView
      }[this.$s.activeView] || OverviewView;
    },
    totalCountries() {
      const set = new Set();
      this.$s.regulations.forEach(r => r.geography.countries.forEach(c => set.add(c)));
      return set.size;
    }
  },

  methods: {
    navigate(viewId) {
      this.$s.activeView = viewId;
      window.location.hash = viewId;
      this.$s.sidebarOpen = false;
      window.scrollTo(0, 0);
    }
  },

  mounted() {
    // Set initial view from URL hash
    const hash = window.location.hash.replace('#', '');
    if (VALID_VIEWS.includes(hash)) AppState.activeView = hash;

    // React to back/forward navigation
    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '');
      if (VALID_VIEWS.includes(h)) AppState.activeView = h;
    });

    // Load all data
    DataLoader.loadAll()
      .then(data => {
        AppState.regulations  = data.regulations;
        AppState.standards    = data.standards;
        AppState.mappings     = data.mappings;
        AppState.version      = data.version || '1.0.0';
        AppState.lastUpdated  = data.last_updated || '—';
        AppState.loading      = false;
      })
      .catch(err => {
        AppState.error   = err.message;
        AppState.loading = false;
      });
  }
};

/* ===== Create & Configure App ===== */
const app = Vue.createApp(RootComponent);

/* Global properties — accessible as this.$xxx in all components */
app.config.globalProperties.$s            = AppState;
app.config.globalProperties.$dc           = DOMAIN_CONFIG;
app.config.globalProperties.$cc           = CATEGORY_CONFIG;
app.config.globalProperties.$domainLabel  = (key) => DOMAIN_CONFIG[key]?.label || key;
app.config.globalProperties.$domainColor  = (key) => DOMAIN_CONFIG[key]?.color || '#64748b';
app.config.globalProperties.$categoryLabel = (key) => CATEGORY_CONFIG[key]?.label || key;
app.config.globalProperties.$openItem     = (item, type) => {
  AppState.selectedItem     = item;
  AppState.selectedItemType = type;
};
app.config.globalProperties.$closeItem    = () => {
  AppState.selectedItem     = null;
  AppState.selectedItemType = null;
};

/* Register components */
app.component('filter-panel',  FilterPanelComponent);
app.component('reg-card',      RegCardComponent);
app.component('std-card',      StdCardComponent);
app.component('detail-modal',  DetailModalComponent);

/* Mount */
app.mount('#app');
