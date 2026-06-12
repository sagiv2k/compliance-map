/* ===== Domain & Category Configuration ===== */
const DOMAIN_CONFIG = {
  data_privacy:           { label: 'Data Privacy',            color: '#3b82f6' },
  cybersecurity:          { label: 'Cybersecurity',           color: '#7c3aed' },
  finance:                { label: 'Finance',                  color: '#059669' },
  health:                 { label: 'Health',                   color: '#dc2626' },
  ai_governance:          { label: 'AI Governance',            color: '#f59e0b' },
  environment:            { label: 'Environment',              color: '#0d9488' },
  labor:                  { label: 'Labor',                    color: '#ea580c' },
  critical_infrastructure:{ label: 'Critical Infrastructure', color: '#64748b' },
  maritime:               { label: 'Maritime Shipping',        color: '#0e7490' },
  anti_corruption:        { label: 'Anti-Corruption',          color: '#b91c1c' },
  esg:                    { label: 'ESG / Sustainability',     color: '#15803d' },
  customs_trade:          { label: 'Customs & Trade',          color: '#92400e' }
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

const JURISDICTION_CONFIG = {
  eu:            { label: 'European Union',          color: '#003399' },
  us_federal:    { label: 'US Federal',              color: '#B22234' },
  us_state:      { label: 'US State / Territory',    color: '#e05c5c' },
  china:         { label: 'China',                   color: '#DE2910' },
  brazil:        { label: 'Brazil',                  color: '#009C3B' },
  mena:          { label: 'Middle East & N. Africa', color: '#006C35' },
  israel:        { label: 'Israel',                  color: '#0038b8' },
  canada:        { label: 'Canada',                  color: '#C41E3A' },
  australia:     { label: 'Australia',               color: '#00843D' },
  africa:        { label: 'Sub-Saharan Africa',      color: '#E07B39' },
  latam:         { label: 'Latin America',           color: '#7C3AED' },
  international: { label: 'International / IMO',     color: '#0891B2' },
  uk:            { label: 'United Kingdom',           color: '#012169' },
  singapore:     { label: 'Singapore',               color: '#EF3340' },
  japan:         { label: 'Japan',                   color: '#BC002D' },
  south_korea:   { label: 'South Korea',             color: '#003478' },
  india:         { label: 'India',                   color: '#FF9933' },
  southeast_asia:{ label: 'Southeast Asia',          color: '#0e7490' },
  europe_other:  { label: 'Europe (Other)',           color: '#6b7280' },
  new_zealand:   { label: 'New Zealand',             color: '#00247D' }
};

const ALL_DOMAINS       = Object.keys(DOMAIN_CONFIG);
const ALL_JURISDICTIONS = Object.keys(JURISDICTION_CONFIG);
const VALID_VIEWS = ['overview', 'regulations', 'standards', 'matrix', 'news', 'watchlist', 'calendar', 'risk', 'gap', 'traceability', 'posture', 'jurisdiction'];

/* ===== Global Reactive State ===== */
const AppState = Vue.reactive({
  regulations:      [],
  standards:        [],
  mappings:         [],
  loading:          true,
  error:            null,
  filters: {
    domains:       [...ALL_DOMAINS],
    jurisdictions: [...ALL_JURISDICTIONS],
    search:        '',
    status:        'active'
  },
  news:             [],
  newsLastUpdated:  '—',
  selectedItem:     null,
  selectedItemType: null,
  activeView:       'overview',
  sidebarOpen:      false,
  version:          '1.0.0',
  lastUpdated:      '—',
  watchlist: {
    regulations: [],
    standards:   []
  },
  userProfile: {
    active:              false,
    regions:             [],
    industries:          [],
    companySize:         null,
    derivedDomains:      [],
    derivedJurisdictions:[],
    matchCount:          0
  },
  wizardOpen:      false,
  compareTray:     [],
  compareOpen:     false,
  helpPanelOpen:   false,
  onboardingDone:  localStorage.getItem('cm_onboarded') === 'true'
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
            :data-help="v.help"
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
          <button
            class="btn-profile-trigger"
            :class="{ 'profile-active': $s.userProfile.active }"
            @click="$s.wizardOpen = true"
            :title="$s.userProfile.active ? 'Edit your applicability profile' : 'Set up your compliance profile'"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {{ $s.userProfile.active ? 'My Profile' : 'Set Profile' }}
          </button>
        </div>

        <button class="topnav__mobile-toggle" @click="$s.sidebarOpen = !$s.sidebarOpen" aria-label="Toggle filters">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </nav>

      <!-- ── Profile Banner ── -->
      <div class="profile-banner" v-if="$s.userProfile.active">
        <span class="profile-banner__label">My Profile</span>
        <span class="profile-banner__sub">{{ profileLabel }}</span>
        <span class="profile-banner__count">{{ $s.userProfile.matchCount }} regulations match</span>
        <div class="profile-banner__actions">
          <button class="btn-profile-apply" @click="applyProfileToFilters" title="Snap sidebar filters to your profile">
            Apply to Filters
          </button>
          <button class="btn-profile-edit" @click="$s.wizardOpen = true" title="Edit profile">Edit</button>
          <button class="btn-profile-clear" @click="clearProfile" title="Clear profile">✕</button>
        </div>
      </div>

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

      <!-- Applicability Wizard -->
      <applicability-wizard v-if="$s.wizardOpen" @close="$s.wizardOpen = false" @saved="applyProfileToFilters" />

      <!-- Comparison Tray -->
      <compare-tray />

      <!-- Help Panel (per-view slide-in drawer) -->
      <help-panel />

      <!-- First-visit Onboarding Modal -->
      <onboarding-modal v-if="!$s.onboardingDone" />
    </div>
  `,

  data() {
    return {
      navViews: [
        {
          id: 'overview', label: 'Overview',
          help: 'World map, stats, and domain coverage at a glance',
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
        },
        {
          id: 'regulations', label: 'Regulations',
          help: 'Browse and filter all 102 global regulations',
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'
        },
        {
          id: 'standards', label: 'Standards',
          help: 'Explore 10 compliance frameworks and their controls',
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
        },
        {
          id: 'matrix', label: 'Coverage Matrix',
          help: 'See which standards cover which regulations',
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
        },
        {
          id: 'news', label: 'Regulatory News',
          help: 'Latest updates from EDPB, CISA, FTC, and 10+ official bodies',
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg>'
        },
        {
          id: 'watchlist', label: 'Watchlist',
          help: 'Your starred regulations and standards',
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
        },
        {
          id: 'calendar', label: 'Calendar',
          help: 'Upcoming deadlines and compliance milestones by urgency',
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
        },
        {
          id: 'risk', label: 'Risk Radar',
          help: 'Penalty × enforcement heatmap — prioritize your compliance focus',
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
        },
        {
          id: 'gap', label: 'Gap Analysis',
          help: 'Find regulatory requirements not covered by your standards',
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>'
        },
        {
          id: 'traceability', label: 'Traceability',
          help: 'Map each standard control to its regulatory citations',
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>'
        },
        {
          id: 'posture', label: 'Posture',
          help: 'Check off certifications and see your overall coverage score',
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        },
        {
          id: 'jurisdiction', label: 'Jurisdiction Overlap',
          help: 'Compare obligations and conflicts across 2+ jurisdictions',
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'
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
        matrix:      MatrixView,
        news:        NewsView,
        watchlist:    WatchlistView,
        calendar:     CalendarView,
        risk:         RiskView,
        gap:          GapAnalysisView,
        traceability: TraceabilityView,
        posture:      PostureView,
        jurisdiction: JurisdictionView
      }[this.$s.activeView] || OverviewView;
    },
    profileLabel() {
      const p = this.$s.userProfile;
      const regionLabels = (p.regions || []).map(rk => {
        const r = WIZARD_REGIONS.find(x => x.key === rk);
        return r ? r.label : rk;
      });
      const sizeLabel = WIZARD_SIZES.find(s => s.key === p.companySize)?.label || '';
      const parts = [];
      if (regionLabels.length) parts.push(regionLabels.join(', '));
      if (sizeLabel) parts.push(sizeLabel);
      return parts.join(' · ') || 'Custom profile';
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
    },
    applyProfileToFilters() {
      const p = this.$s.userProfile;
      if (!p.active) return;
      if (p.derivedDomains.length)       this.$s.filters.domains        = [...p.derivedDomains];
      if (p.derivedJurisdictions.length) this.$s.filters.jurisdictions  = [...p.derivedJurisdictions];
    },
    clearProfile() {
      Object.assign(this.$s.userProfile, {
        active: false, regions: [], industries: [],
        companySize: null, derivedDomains: [], derivedJurisdictions: [], matchCount: 0
      });
      try { localStorage.removeItem('cm_user_profile'); } catch {}
    }
  },

  mounted() {
    // Restore watchlist from localStorage
    try {
      const wl = JSON.parse(localStorage.getItem('cm_watchlist') || 'null');
      if (wl) { AppState.watchlist.regulations = wl.regulations || []; AppState.watchlist.standards = wl.standards || []; }
    } catch {}

    // Restore user profile from localStorage
    try {
      const prof = JSON.parse(localStorage.getItem('cm_user_profile') || 'null');
      if (prof && prof.active) Object.assign(AppState.userProfile, prof);
    } catch {}

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
        AppState.regulations      = data.regulations;
        AppState.standards        = data.standards;
        AppState.mappings         = data.mappings;
        AppState.news             = data.news || [];
        AppState.newsLastUpdated  = data.news_last_updated || '—';
        AppState.version          = data.version || '1.1.0';
        AppState.lastUpdated      = data.last_updated || '—';
        AppState.loading          = false;
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
app.config.globalProperties.$s                  = AppState;
app.config.globalProperties.$dc                 = DOMAIN_CONFIG;
app.config.globalProperties.$cc                 = CATEGORY_CONFIG;
app.config.globalProperties.$jc                 = JURISDICTION_CONFIG;
app.config.globalProperties.$domainLabel        = (key) => DOMAIN_CONFIG[key]?.label || key;
app.config.globalProperties.$domainColor        = (key) => DOMAIN_CONFIG[key]?.color || '#64748b';
app.config.globalProperties.$categoryLabel      = (key) => CATEGORY_CONFIG[key]?.label || key;
app.config.globalProperties.$jurisdictionLabel  = (key) => JURISDICTION_CONFIG[key]?.label || key;
app.config.globalProperties.$jurisdictionColor  = (key) => JURISDICTION_CONFIG[key]?.color || '#64748b';
app.config.globalProperties.$openItem     = (item, type) => {
  AppState.selectedItem     = item;
  AppState.selectedItemType = type;
};
app.config.globalProperties.$closeItem    = () => {
  AppState.selectedItem     = null;
  AppState.selectedItemType = null;
};
app.config.globalProperties.$isInCompare  = (id) => AppState.compareTray.includes(id);
app.config.globalProperties.$toggleCompare = (id) => {
  const idx = AppState.compareTray.indexOf(id);
  if (idx === -1) { if (AppState.compareTray.length < 3) AppState.compareTray.push(id); }
  else AppState.compareTray.splice(idx, 1);
};
app.config.globalProperties.$isWatchlisted = (id, type) => {
  const list = type === 'regulation' ? AppState.watchlist.regulations : AppState.watchlist.standards;
  return list.includes(id);
};
app.config.globalProperties.$toggleWatchlist = (id, type) => {
  const list = type === 'regulation' ? AppState.watchlist.regulations : AppState.watchlist.standards;
  const idx  = list.indexOf(id);
  if (idx === -1) list.push(id);
  else list.splice(idx, 1);
  try { localStorage.setItem('cm_watchlist', JSON.stringify(AppState.watchlist)); } catch {}
};

/* Register components */
app.component('filter-panel',         FilterPanelComponent);
app.component('reg-card',             RegCardComponent);
app.component('std-card',             StdCardComponent);
app.component('detail-modal',         DetailModalComponent);
app.component('news-view',            NewsView);
app.component('watchlist-view',       WatchlistView);
app.component('applicability-wizard', ApplicabilityWizardComponent);
app.component('compare-tray',         CompareTrayComponent);
app.component('help-panel',           HelpPanelComponent);
app.component('onboarding-modal',     OnboardingModalComponent);

/* Mount */
app.mount('#app');
