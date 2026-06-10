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
          <span v-if="hasRecentNews" class="card-updated-badge" title="This regulation was in the news recently">Updated</span>
          <span class="status-badge" :class="'status-badge--' + regulation.status">
            <span class="status-dot"></span>
            {{ capitalize(regulation.status) }}
          </span>
          <button
            class="card-star-btn"
            :class="{ 'card-star-btn--active': $isWatchlisted(regulation.id, 'regulation') }"
            @click.stop="$toggleWatchlist(regulation.id, 'regulation')"
            :title="$isWatchlisted(regulation.id, 'regulation') ? 'Remove from watchlist' : 'Add to watchlist'"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
          <button
            class="card-compare-btn"
            :class="{ 'card-compare-btn--active': $isInCompare(regulation.id) }"
            @click.stop="$toggleCompare(regulation.id)"
            :title="$isInCompare(regulation.id) ? 'Remove from comparison' : ($s.compareTray.length >= 3 ? 'Comparison tray full (max 3)' : 'Add to comparison')"
            :disabled="!$isInCompare(regulation.id) && $s.compareTray.length >= 3"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </button>
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
    },
    hasRecentNews() {
      const news = this.$s.news;
      if (!news || !news.length) return false;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const searchTerms = [
        this.regulation.short_name.toLowerCase(),
        ...this.regulation.short_name.toLowerCase().split(/\s+/).filter(w => w.length > 3)
      ];
      return news.some(item => {
        if (!item.published || new Date(item.published) < cutoff) return false;
        const text = ((item.title || '') + ' ' + (item.summary || '')).toLowerCase();
        return searchTerms.some(t => text.includes(t));
      });
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
