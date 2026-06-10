/* Applicability Wizard — 3-step profile setup modal */

const WIZARD_REGIONS = [
  { key: 'europe_eea',  label: 'Europe / EEA',         emoji: '🇪🇺', jurisdictions: ['eu', 'europe_other'] },
  { key: 'uk',          label: 'United Kingdom',        emoji: '🇬🇧', jurisdictions: ['uk'] },
  { key: 'north_america', label: 'North America',       emoji: '🌎', jurisdictions: ['us_federal', 'us_state', 'canada'] },
  { key: 'china',       label: 'China',                 emoji: '🇨🇳', jurisdictions: ['china'] },
  { key: 'apac',        label: 'APAC (other)',           emoji: '🌏', jurisdictions: ['singapore', 'japan', 'south_korea', 'india', 'southeast_asia', 'australia', 'new_zealand'] },
  { key: 'mena',        label: 'MENA',                  emoji: '🌍', jurisdictions: ['mena', 'israel'] },
  { key: 'latam',       label: 'Latin America',         emoji: '🌎', jurisdictions: ['brazil', 'latam'] },
  { key: 'africa',      label: 'Sub-Saharan Africa',    emoji: '🌍', jurisdictions: ['africa'] },
  { key: 'global',      label: 'Global / International', emoji: '🌐', jurisdictions: ['international'] },
];

const WIZARD_INDUSTRIES = [
  { key: 'financial_services',   label: 'Financial Services',    emoji: '🏦', domains: ['finance', 'cybersecurity', 'data_privacy'] },
  { key: 'healthcare',           label: 'Healthcare / Pharma',   emoji: '🏥', domains: ['health', 'data_privacy'] },
  { key: 'technology',           label: 'Technology / SaaS',     emoji: '💻', domains: ['cybersecurity', 'ai_governance', 'data_privacy'] },
  { key: 'manufacturing',        label: 'Manufacturing',          emoji: '🏭', domains: ['environment', 'labor', 'customs_trade', 'esg'] },
  { key: 'retail_ecommerce',     label: 'Retail / E-commerce',   emoji: '🛒', domains: ['data_privacy', 'finance', 'customs_trade'] },
  { key: 'energy_utilities',     label: 'Energy / Utilities',    emoji: '⚡', domains: ['critical_infrastructure', 'environment'] },
  { key: 'shipping_logistics',   label: 'Shipping / Logistics',  emoji: '🚢', domains: ['maritime', 'customs_trade'] },
  { key: 'professional_services', label: 'Professional Services', emoji: '⚖️', domains: ['data_privacy', 'finance', 'anti_corruption'] },
];

const WIZARD_SIZES = [
  { key: 'sme',    label: 'SME',              sub: 'Under 250 employees',   emoji: '🏢' },
  { key: 'large',  label: 'Large Enterprise', sub: '250–10 000 employees',  emoji: '🏛️' },
  { key: 'public', label: 'Publicly Listed',  sub: 'Traded on any exchange', emoji: '📈' },
];

const ApplicabilityWizardComponent = {
  template: `
    <div class="wizard-overlay" @click.self="$emit('close')">
      <div class="wizard-panel">

        <!-- Header -->
        <div class="wizard-header">
          <div class="wizard-title-group">
            <h2 class="wizard-title">What applies to your org?</h2>
            <p class="wizard-subtitle">Takes 30 seconds. Snaps the filters to your profile.</p>
          </div>
          <button class="wizard-close-btn" @click="$emit('close')" title="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Stepper -->
        <div class="wizard-stepper">
          <div
            v-for="(s, i) in steps"
            :key="i"
            class="wizard-step"
            :class="{ active: step === i, done: step > i }"
          >
            <span class="wizard-step-num">
              <svg v-if="step > i" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              <span v-else>{{ i + 1 }}</span>
            </span>
            {{ s }}
          </div>
        </div>

        <!-- Step 1 — Regions -->
        <div class="wizard-body" v-if="step === 0">
          <p class="wizard-body-title">Where does your organisation operate? <span style="font-weight:400;color:#94a3b8;">(select all that apply)</span></p>
          <div class="wizard-grid">
            <label
              v-for="r in WIZARD_REGIONS"
              :key="r.key"
              class="wizard-chip"
              :class="{ sel: form.regions.includes(r.key) }"
              @click="toggleArr(form.regions, r.key)"
            >
              <span class="wizard-chip-box">
                <svg v-if="form.regions.includes(r.key)" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span style="font-size:16px;line-height:1;flex-shrink:0;">{{ r.emoji }}</span>
              <span class="wizard-chip-label">{{ r.label }}</span>
              <span class="wizard-chip-count">{{ regionRegCount(r) }}</span>
            </label>
          </div>
        </div>

        <!-- Step 2 — Industry -->
        <div class="wizard-body" v-if="step === 1">
          <p class="wizard-body-title">What does your organisation do? <span style="font-weight:400;color:#94a3b8;">(select all that apply)</span></p>
          <div class="wizard-grid">
            <label
              v-for="ind in WIZARD_INDUSTRIES"
              :key="ind.key"
              class="wizard-chip"
              :class="{ sel: form.industries.includes(ind.key) }"
              @click="toggleArr(form.industries, ind.key)"
            >
              <span class="wizard-chip-box">
                <svg v-if="form.industries.includes(ind.key)" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span style="font-size:16px;line-height:1;flex-shrink:0;">{{ ind.emoji }}</span>
              <span class="wizard-chip-label">{{ ind.label }}</span>
            </label>
          </div>
        </div>

        <!-- Step 3 — Company size -->
        <div class="wizard-body" v-if="step === 2">
          <p class="wizard-body-title">What is your organisation's size?</p>
          <div class="wizard-size-row">
            <div
              v-for="sz in WIZARD_SIZES"
              :key="sz.key"
              class="wizard-size-card"
              :class="{ sel: form.companySize === sz.key }"
              @click="form.companySize = sz.key"
            >
              <div class="wizard-size-emoji">{{ sz.emoji }}</div>
              <div class="wizard-size-lbl">{{ sz.label }}</div>
              <div class="wizard-size-sub">{{ sz.sub }}</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="wizard-footer">
          <div class="wizard-preview">
            <div class="wizard-preview-num">{{ previewCount }}</div>
            <div class="wizard-preview-label">regulations match so far</div>
          </div>
          <div class="wizard-nav">
            <button v-if="step > 0" class="btn-wiz btn-wiz-back" @click="step--">Back</button>
            <button v-if="step < 2" class="btn-wiz btn-wiz-next" :disabled="step === 0 && !form.regions.length" @click="step++">Next →</button>
            <button v-if="step === 2" class="btn-wiz btn-wiz-finish" :disabled="!form.companySize" @click="finish">Save Profile</button>
          </div>
        </div>

      </div>
    </div>
  `,

  emits: ['close', 'saved'],

  data() {
    return {
      step: 0,
      steps: ['Where?', 'What do you do?', 'Company size'],
      WIZARD_REGIONS,
      WIZARD_INDUSTRIES,
      WIZARD_SIZES,
      form: {
        regions: [],
        industries: [],
        companySize: null
      }
    };
  },

  computed: {
    activeJurisdictions() {
      const set = new Set();
      this.form.regions.forEach(rk => {
        const r = WIZARD_REGIONS.find(x => x.key === rk);
        if (r) r.jurisdictions.forEach(j => set.add(j));
      });
      return set;
    },
    activeDomains() {
      const set = new Set();
      this.form.industries.forEach(ik => {
        const ind = WIZARD_INDUSTRIES.find(x => x.key === ik);
        if (ind) ind.domains.forEach(d => set.add(d));
      });
      return set;
    },
    previewCount() {
      const { regions, industries } = this.form;
      const hasRegions = regions.length > 0;
      const hasIndustries = industries.length > 0;
      if (!hasRegions && !hasIndustries) return this.$s.regulations.length;

      const juris = this.activeJurisdictions;
      const doms = this.activeDomains;
      const isGlobal = regions.includes('global');

      return this.$s.regulations.filter(r => {
        const jurisdictionOk = !hasRegions || isGlobal ||
          r.geography.type === 'global' ||
          juris.has(r.enforcement_region);
        const domainOk = !hasIndustries || r.domain.some(d => doms.has(d));
        return jurisdictionOk && domainOk;
      }).length;
    }
  },

  mounted() {
    const saved = this.$s.userProfile;
    if (saved && saved.active) {
      this.form.regions      = [...(saved.regions || [])];
      this.form.industries   = [...(saved.industries || [])];
      this.form.companySize  = saved.companySize || null;
    }
    document.addEventListener('keydown', this._escHandler = e => {
      if (e.key === 'Escape') this.$emit('close');
    });
  },

  beforeUnmount() {
    document.removeEventListener('keydown', this._escHandler);
  },

  methods: {
    toggleArr(arr, key) {
      const idx = arr.indexOf(key);
      if (idx === -1) arr.push(key);
      else arr.splice(idx, 1);
    },
    regionRegCount(region) {
      const juris = new Set(region.jurisdictions);
      const n = this.$s.regulations.filter(r =>
        r.geography.type === 'global' || juris.has(r.enforcement_region)
      ).length;
      return n ? `${n}` : '';
    },
    finish() {
      const derivedDomains = [...this.activeDomains];
      const derivedJurisdictions = [...this.activeJurisdictions];

      const profile = {
        active:       true,
        regions:      [...this.form.regions],
        industries:   [...this.form.industries],
        companySize:  this.form.companySize,
        derivedDomains,
        derivedJurisdictions,
        matchCount:   this.previewCount
      };

      Object.assign(this.$s.userProfile, profile);
      try { localStorage.setItem('cm_user_profile', JSON.stringify(profile)); } catch {}
      this.$emit('saved', profile);
      this.$emit('close');
    }
  }
};
