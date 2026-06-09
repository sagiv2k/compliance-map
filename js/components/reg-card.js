/* Regulation card component */
const RegCardComponent = {
  props: { regulation: Object },
  template: `
    <div class="reg-card" @click="$openItem(regulation, 'regulation')">
      <div class="reg-card__accent"
           :style="{ background: accentColor }"></div>

      <div class="reg-card__header">
        <span class="reg-card__short-name">{{ regulation.short_name }}</span>
        <div class="reg-card__badges">
          <span class="status-badge" :class="'status-badge--' + regulation.status">
            <span class="status-dot"></span>
            {{ capitalize(regulation.status) }}
          </span>
        </div>
      </div>

      <div class="reg-card__name">{{ regulation.name }}</div>

      <div class="reg-card__badges">
        <span
          v-for="d in regulation.domain"
          :key="d"
          class="domain-badge"
          :class="'domain-badge--' + d"
        >{{ $domainLabel(d) }}</span>
      </div>

      <div class="reg-card__jurisdiction">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        {{ regulation.jurisdiction }}
      </div>

      <p class="reg-card__summary">{{ regulation.summary }}</p>

      <div class="reg-card__footer">
        <span class="reg-card__date">Effective: {{ formatDate(regulation.effective_date) }}</span>
        <span style="font-size:11px;color:var(--color-primary);font-weight:600;">View details →</span>
      </div>
    </div>
  `,
  computed: {
    accentColor() {
      return this.$domainColor(this.regulation.domain[0]);
    }
  },
  methods: {
    capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); },
    formatDate(d) {
      if (!d) return '—';
      const dt = new Date(d);
      return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  }
};
