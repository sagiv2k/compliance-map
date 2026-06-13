/* Overview view — world map choropleth + stat cards + charts */
const OverviewView = {
  template: `
    <div>
      <!-- Quick-Start Strip (dismissible) -->
      <div class="quickstart-strip" v-if="!quickstartDismissed">
        <div class="quickstart-strip__header">
          <span class="quickstart-strip__label">Quick Start</span>
          <button class="quickstart-strip__dismiss" @click="dismissQuickstart" title="Dismiss">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="quickstart-strip__cards">
          <button class="quickstart-card" @click="$s.wizardOpen = true">
            <span class="quickstart-card__icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg></span>
            <span class="quickstart-card__title">Set My Profile</span>
            <span class="quickstart-card__desc">Narrow to your applicable regulations</span>
            <span class="quickstart-card__arrow">→</span>
          </button>
          <button class="quickstart-card" @click="$s.activeView = 'regulations'">
            <span class="quickstart-card__icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>
            <span class="quickstart-card__title">Browse Regulations</span>
            <span class="quickstart-card__desc">Explore all 102 global regulations</span>
            <span class="quickstart-card__arrow">→</span>
          </button>
          <button class="quickstart-card" @click="$s.activeView = 'gap'">
            <span class="quickstart-card__icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></span>
            <span class="quickstart-card__title">Analyze Gaps</span>
            <span class="quickstart-card__desc">Find uncovered regulatory requirements</span>
            <span class="quickstart-card__arrow">→</span>
          </button>
          <button class="quickstart-card" @click="$s.activeView = 'calendar'">
            <span class="quickstart-card__icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
            <span class="quickstart-card__title">Track Deadlines</span>
            <span class="quickstart-card__desc">See upcoming compliance milestones</span>
            <span class="quickstart-card__arrow">→</span>
          </button>
        </div>
      </div>

      <!-- Stat cards -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-card__value">{{ filteredRegulations.length }}</div>
          <div class="stat-card__label">Regulations shown</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{{ $s.standards.length }}</div>
          <div class="stat-card__label">Compliance standards</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{{ totalCountries }}</div>
          <div class="stat-card__label">Countries covered</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{{ activeDomainCount }}</div>
          <div class="stat-card__label">Active domains</div>
        </div>
        <div class="stat-card stat-card--risk" v-if="openRisks > 0" @click="$s.activeView = 'risk-register'">
          <div class="stat-card__value" style="color:#dc2626;">{{ openRisks }}</div>
          <div class="stat-card__label">Open Risks</div>
        </div>
        <div class="stat-card stat-card--vendor" v-if="overdueVendors > 0" @click="$s.activeView = 'vendor-risk'">
          <div class="stat-card__value" style="color:#7c3aed;">{{ overdueVendors }}</div>
          <div class="stat-card__label">Vendor Reviews Due</div>
        </div>
      </div>

      <!-- World map -->
      <div class="map-section">
        <div class="map-section__header">
          <span class="map-section__title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            Global Regulation Coverage
          </span>
          <div class="map-mode-toggle">
            <button :class="['map-mode-btn', { active: mapColorMode === 'count' }]" @click="setMapMode('count')">By Count</button>
            <button :class="['map-mode-btn', { active: mapColorMode === 'domain' }]" @click="setMapMode('domain')">By Domain</button>
          </div>
          <span class="map-section__hint">Click any country to see applicable regulations</span>
        </div>
        <div id="world-map" style="height:420px;width:100%;"></div>

        <!-- Country detail panel (shown when a country is clicked) -->
        <div class="country-panel" :class="{ open: countryPanel }" v-if="countryPanel">
          <div class="country-panel__header">
            <div class="country-panel__title">
              <span class="country-panel__name">{{ countryPanel.name }}</span>
              <span class="country-panel__count">{{ countryPanel.regs.length }} regulation{{ countryPanel.regs.length !== 1 ? 's' : '' }}</span>
            </div>
            <button class="country-panel__close" @click="countryPanel = null" title="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="country-panel__empty" v-if="countryPanel.regs.length === 0">
            No regulations match the current filters for this country.
          </div>
          <ul class="country-panel__list" v-else>
            <li
              v-for="reg in countryPanel.regs"
              :key="reg.id"
              class="country-panel__item"
              @click="$openItem(reg, 'regulation')"
            >
              <div class="country-panel__item-top">
                <span class="country-panel__item-name">{{ reg.short_name }}</span>
                <span class="country-panel__item-region" :style="{ background: $jurisdictionColor(reg.enforcement_region) + '22', color: $jurisdictionColor(reg.enforcement_region) }">
                  {{ $jurisdictionLabel(reg.enforcement_region) }}
                </span>
              </div>
              <div class="country-panel__item-full">{{ reg.name }}</div>
              <div class="country-panel__item-domains">
                <span
                  v-for="d in reg.domain" :key="d"
                  class="country-panel__domain-chip"
                  :style="{ background: $domainColor(d) + '22', color: $domainColor(d) }"
                >{{ $domainLabel(d) }}</span>
              </div>
              <div class="country-panel__item-authority">{{ reg.authority }}</div>
            </li>
          </ul>
        </div>

        <!-- Legend -->
        <div class="map-legend">
          <div class="map-legend__title">{{ mapColorMode === 'domain' ? 'Domain' : 'Regulations' }}</div>
          <div v-for="step in legendSteps" :key="step.label" class="map-legend__item">
            <span class="map-legend__swatch" :style="{ background: step.color }"></span>
            {{ step.label }}
          </div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-card__title">Regulations by Domain</div>
          <div class="chart-container" style="height:220px;">
            <canvas id="domain-bar-chart"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-card__title">Standards by Category</div>
          <div class="chart-container" style="height:220px;">
            <canvas id="category-doughnut-chart"></canvas>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      mapColorMode: 'count',
      countryPanel: null,
      quickstartDismissed: localStorage.getItem('cm_quickstart_dismissed') === 'true'
    };
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
    totalCountries() {
      const set = new Set();
      this.filteredRegulations.forEach(r => r.geography.countries.forEach(c => set.add(c)));
      return set.size;
    },
    activeDomainCount() {
      const set = new Set();
      this.filteredRegulations.forEach(r => r.domain.forEach(d => set.add(d)));
      return set.size;
    },
    openRisks() {
      return (this.$s.riskRegister || []).filter(r => r.status !== 'resolved').length;
    },
    overdueVendors() {
      const today = new Date().toISOString().slice(0, 10);
      return (this.$s.vendors || []).filter(v => v.next_review_date && v.next_review_date < today).length;
    },
    countByCountry() {
      const counts = {};
      this.filteredRegulations.forEach(r => {
        r.geography.countries.forEach(c => { counts[c] = (counts[c] || 0) + 1; });
      });
      return counts;
    },
    // Maps each ISO country code to its dominant domain key (most regulations in that domain)
    domainByCountry() {
      const byCountry = {};
      this.filteredRegulations.forEach(r => {
        r.geography.countries.forEach(c => {
          if (!byCountry[c]) byCountry[c] = {};
          r.domain.forEach(d => { byCountry[c][d] = (byCountry[c][d] || 0) + 1; });
        });
      });
      const result = {};
      Object.entries(byCountry).forEach(([iso, domainCounts]) => {
        result[iso] = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0][0];
      });
      return result;
    },
    legendSteps() {
      if (this.mapColorMode === 'domain') {
        // Show domain colors for domains that appear in filtered regulations
        const activeDomains = new Set();
        this.filteredRegulations.forEach(r => r.domain.forEach(d => activeDomains.add(d)));
        return Object.entries(this.$dc)
          .filter(([key]) => activeDomains.has(key))
          .map(([key, cfg]) => ({ label: cfg.label, color: cfg.color }));
      }
      return [
        { label: '0 regulations', color: '#e8edf2' },
        { label: '1',             color: '#c7ddf5' },
        { label: '2–3',           color: '#5a9dd4' },
        { label: '4+',            color: '#1a4480' }
      ];
    },
    domainBarData() {
      const counts = {};
      this.filteredRegulations.forEach(r => r.domain.forEach(d => { counts[d] = (counts[d] || 0) + 1; }));
      const entries = Object.entries(this.$dc)
        .map(([key, cfg]) => ({ key, label: cfg.label, color: cfg.color, count: counts[key] || 0 }))
        .filter(e => e.count > 0)
        .sort((a, b) => b.count - a.count);
      return entries;
    }
  },

  watch: {
    filteredRegulations() {
      this.updateMapColors();
      this.updateBarChart();
    }
  },

  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.initMap();
        this.initCharts();
      }, 50);
    });
  },

  beforeUnmount() {
    if (this._map) { this._map.remove(); this._map = null; }
    if (this._barChart) { this._barChart.destroy(); this._barChart = null; }
    if (this._doughnutChart) { this._doughnutChart.destroy(); this._doughnutChart = null; }
  },

  methods: {
    dismissQuickstart() {
      this.quickstartDismissed = true;
      try { localStorage.setItem('cm_quickstart_dismissed', 'true'); } catch(e) {}
    },
    choroplethColor(count) {
      if (!count || count === 0) return '#e8edf2';
      if (count === 1)           return '#c7ddf5';
      if (count <= 3)            return '#5a9dd4';
      return '#1a4480';
    },
    choroplethStroke(count) {
      if (!count || count === 0) return '#c8d0db';
      if (count === 1)           return '#a0bfe8';
      if (count <= 3)            return '#3b84c5';
      return '#0f2d5a';
    },
    getFeatureStyle(feature) {
      const iso   = feature.properties.ISO_A2;
      const count = this.countByCountry[iso] || 0;

      if (this.mapColorMode === 'domain') {
        const dominant = this.domainByCountry[iso];
        if (dominant) {
          const base = this.$domainColor(dominant);
          return { fillColor: base, fillOpacity: 0.70, color: base, weight: 1 };
        }
        return { fillColor: '#e8edf2', fillOpacity: 0.85, color: '#c8d0db', weight: 0.5 };
      }

      return {
        fillColor:   this.choroplethColor(count),
        fillOpacity: 0.85,
        color:       this.choroplethStroke(count),
        weight:      0.5
      };
    },
    setMapMode(mode) {
      this.mapColorMode = mode;
      this.updateMapColors();
    },
    async initMap() {
      try {
        if (typeof L === 'undefined') throw new Error('Leaflet library not loaded');
        const mapEl = document.getElementById('world-map');
        if (!mapEl || this._map) return;

        this._map = L.map('world-map', {
          center: [20, 0],
          zoom: 2,
          minZoom: 1,
          maxZoom: 6,
          scrollWheelZoom: false,
          worldCopyJump: true
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(this._map);

        const res = await fetch('./data/world-countries.geo.json');
        if (!res.ok) throw new Error('GeoJSON not found');
        this._geoData = await res.json();

        this._geoLayer = L.geoJSON(this._geoData, {
          style: (feature) => this.getFeatureStyle(feature),
          onEachFeature: (feature, layer) => {
            layer.on({
              click:     ()  => this.onCountryClick(feature),
              mouseover: ()  => { layer.setStyle({ fillOpacity: 1, weight: 1.5 }); },
              mouseout:  ()  => { this._geoLayer && this._geoLayer.resetStyle(layer); }
            });
          }
        }).addTo(this._map);
      } catch (err) {
        console.error('[ComplianceMap] Map initialization failed:', err.message);
      }
    },
    updateMapColors() {
      if (!this._geoLayer) return;
      this._geoLayer.eachLayer((layer) => {
        layer.setStyle(this.getFeatureStyle(layer.feature));
      });
    },
    onCountryClick(feature) {
      const iso  = feature.properties.ISO_A2;
      const name = feature.properties.ADMIN || feature.properties.NAME || iso;
      const regs = this.filteredRegulations.filter(r =>
        r.geography.type !== 'global' && r.geography.countries.includes(iso)
      );
      this.countryPanel = { iso, name, regs };
    },
    initCharts() {
      this.initBarChart();
      this.initDoughnutChart();
    },
    initBarChart() {
      const canvas = document.getElementById('domain-bar-chart');
      if (!canvas) return;
      const data = this.domainBarData;
      this._barChart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: data.map(d => d.label),
          datasets: [{
            data: data.map(d => d.count),
            backgroundColor: data.map(d => d.color + 'cc'),
            borderColor: data.map(d => d.color),
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.raw} regulation${ctx.raw !== 1 ? 's' : ''}`
              }
            }
          },
          scales: {
            x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: '#f0f0f0' } },
            y: { ticks: { font: { size: 11 } }, grid: { display: false } }
          }
        }
      });
    },
    updateBarChart() {
      if (!this._barChart) return;
      const data = this.domainBarData;
      this._barChart.data.labels = data.map(d => d.label);
      this._barChart.data.datasets[0].data = data.map(d => d.count);
      this._barChart.data.datasets[0].backgroundColor = data.map(d => d.color + 'cc');
      this._barChart.data.datasets[0].borderColor = data.map(d => d.color);
      this._barChart.update();
    },
    initDoughnutChart() {
      const canvas = document.getElementById('category-doughnut-chart');
      if (!canvas) return;
      const cats = {};
      this.$s.standards.forEach(s => { cats[s.category] = (cats[s.category] || 0) + 1; });
      const labels = Object.keys(cats).map(k => this.$categoryLabel(k));
      const values = Object.values(cats);
      const colors = ['#3b82f6','#7c3aed','#059669','#f59e0b','#dc2626','#0d9488','#ea580c','#64748b'];
      this._doughnutChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{ data: values, backgroundColor: colors.slice(0, values.length), borderWidth: 2, borderColor: '#fff' }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 12, padding: 10 } }
          }
        }
      });
    }
  }
};
