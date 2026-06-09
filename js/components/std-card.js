/* Standards card component */
const StdCardComponent = {
  props: { standard: Object },
  template: `
    <div class="std-card" @click="$openItem(standard, 'standard')">
      <div class="reg-card__accent"
           style="background: linear-gradient(90deg, #7c3aed, #2563eb)"></div>

      <div class="std-card__header">
        <span class="std-card__short-name">{{ standard.short_name }}</span>
        <span class="cert-badge" :class="standard.certification_available ? 'cert-badge--yes' : 'cert-badge--no'">
          <svg v-if="standard.certification_available" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ standard.certification_available ? 'Certifiable' : 'Framework' }}
        </span>
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
