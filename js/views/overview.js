/* Overview view — world map choropleth + stat cards + charts */
const OverviewView = {
  template: `
    <div>
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
          <span class="map-section__hint">Click any country to see applicable regulations</span>
        </div>
        <div id="world-map"></div>
        <!-- Legend -->
        <div class="map-legend">
          <div class="map-legend__title">Regulations</div>
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
      legendSteps: [
        { label: '0 regulations', color: '#e8edf2' },
        { label: '1',            color: '#c7ddf5' },
        { label: '2–3',          color: '#5a9dd4' },
        { label: '4+',           color: '#1a4480' }
      ]
    };
  },

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
    countByCountry() {
      const counts = {};
      this.filteredRegulations.forEach(r => {
        r.geography.countries.forEach(c => { counts[c] = (counts[c] || 0) + 1; });
      });
      return counts;
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
      this.initMap();
      this.initCharts();
    });
  },

  beforeUnmount() {
    if (this._map) { this._map.remove(); this._map = null; }
    if (this._barChart) { this._barChart.destroy(); this._barChart = null; }
    if (this._doughnutChart) { this._doughnutChart.destroy(); this._doughnutChart = null; }
  },

  methods: {
    choroplethColor(count) {
      if (!count || count === 0) return '#e8edf2';
      if (count === 1) return '#c7ddf5';
      if (count <= 3) return '#5a9dd4';
      return '#1a4480';
    },
    choroplethStroke(count) {
      if (!count || count === 0) return '#c8d0db';
      if (count === 1) return '#a0bfe8';
      if (count <= 3) return '#3b84c5';
      return '#0f2d5a';
    },
    getFeatureStyle(feature) {
      const iso = feature.properties.ISO_A2;
      const count = this.countByCountry[iso] || 0;
      return {
        fillColor: this.choroplethColor(count),
        fillOpacity: 0.85,
        color: this.choroplethStroke(count),
        weight: 0.5
      };
    },
    async initMap() {
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

      try {
        const res = await fetch('./data/world-countries.geo.json');
        if (!res.ok) throw new Error('GeoJSON not found');
        this._geoData = await res.json();

        this._geoLayer = L.geoJSON(this._geoData, {
          style: (feature) => this.getFeatureStyle(feature),
          onEachFeature: (feature, layer) => {
            layer.on({
              click:     (e) => this.onCountryClick(feature, e.latlng),
              mouseover: (e) => { layer.setStyle({ fillOpacity: 1, weight: 1.5 }); },
              mouseout:  ()  => { this._geoLayer && this._geoLayer.resetStyle(layer); }
            });
          }
        }).addTo(this._map);
      } catch (err) {
        console.warn('Could not load GeoJSON:', err.message);
      }
    },
    updateMapColors() {
      if (!this._geoLayer) return;
      this._geoLayer.eachLayer((layer) => {
        layer.setStyle(this.getFeatureStyle(layer.feature));
      });
    },
    onCountryClick(feature, latlng) {
      const iso   = feature.properties.ISO_A2;
      const name  = feature.properties.ADMIN || feature.properties.NAME || iso;
      const regs  = this.filteredRegulations.filter(r => r.geography.countries.includes(iso));
      const count = regs.length;

      const items = count === 0
        ? '<li class="map-popup__empty">No regulations match the current filters for this country.</li>'
        : regs.map(r => `
            <li class="map-popup__item">
              <span class="map-popup__item-dot" style="background:${this.$domainColor(r.domain[0])}"></span>
              <div>
                <div class="map-popup__item-name">${r.short_name}</div>
                <div class="map-popup__item-domain">${r.domain.map(d => this.$domainLabel(d)).join(', ')}</div>
              </div>
            </li>`).join('');

      const html = `
        <div class="map-popup">
          <div class="map-popup__country">
            ${name}
            ${count > 0 ? '<span class="map-popup__count">' + count + ' regulation' + (count > 1 ? 's' : '') + '</span>' : ''}
          </div>
          <ul class="map-popup__list">${items}</ul>
        </div>`;

      L.popup({ maxWidth: 320, closeButton: true })
        .setLatLng(latlng)
        .setContent(html)
        .openOn(this._map);
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
