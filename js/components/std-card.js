/* Standards card component */
const StdCardComponent = {
  props: { standard: Object },
  template: `
    <div class="std-card" @click="$openItem(standard, 'standard')">
      <div class="reg-card__accent"
           style="background: linear-gradient(90deg, #7c3aed, #2563eb)"></div>

      <div class="std-card__header">
        <span class="std-card__short-name">{{ standard.short_name }}</span>
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="cert-badge" :class="standard.certification_available ? 'cert-badge--yes' : 'cert-badge--no'">
            <svg v-if="standard.certification_available" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {{ standard.certification_available ? 'Certifiable' : 'Framework' }}
          </span>
          <button
            class="card-star-btn"
            :class="{ 'card-star-btn--active': $isWatchlisted(standard.id, 'standard') }"
            @click.stop="$toggleWatchlist(standard.id, 'standard')"
            :title="$isWatchlisted(standard.id, 'standard') ? 'Remove from watchlist' : 'Add to watchlist'"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="std-card__name">{{ standard.name }}</div>

      <div class="std-card__meta">
        <span class="category-badge">{{ $categoryLabel(standard.category) }}</span>
        <span
          v-for="d in standard.domains_addressed.slice(0, 2)"
          :key="d"
          class="domain-badge"
          :class="'domain-badge--' + d"
        >{{ $domainLabel(d) }}</span>
      </div>

      <p class="std-card__body">{{ standard.summary }}</p>

      <div class="std-card__footer">
        <span class="std-card__issuer">{{ standard.issuing_body.split(' ').slice(0,3).join(' ') }}</span>
        <span style="font-size:11px;color:var(--color-primary);font-weight:600;">View details →</span>
      </div>
    </div>
  `
};
