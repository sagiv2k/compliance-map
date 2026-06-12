/* Watchlist / Bookmarks view — shows starred regulations, standards, and a scoped coverage matrix */
const WatchlistView = {
  template: `
    <div>
      <div class="view-header">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <h1 class="view-title">My Watchlist</h1>
            <p class="view-subtitle">Regulations and standards you've bookmarked. Persists across sessions.</p>
          </div>
          <button class="view-help-btn" @click="$s.helpPanelOpen = true" title="How to use Watchlist">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
          <button
            v-if="hasAny"
            class="btn-watchlist-clear"
            @click="clearAll"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
            </svg>
            Clear All
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!hasAny" class="watchlist-empty" style="margin-top:60px;">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <p style="margin:0 0 6px;font-weight:600;color:#475569;">Nothing bookmarked yet</p>
        <p style="margin:0;font-size:12px;">Click the ☆ star icon on any regulation or standard card to add it here.</p>
      </div>

      <!-- Watched Regulations -->
      <template v-if="watchedRegs.length">
        <div class="watchlist-section-title">
          Watched Regulations
          <span class="watchlist-count-badge">{{ watchedRegs.length }}</span>
        </div>
        <div class="reg-grid">
          <reg-card v-for="r in watchedRegs" :key="r.id" :regulation="r" />
        </div>
      </template>

      <!-- Watched Standards -->
      <template v-if="watchedStds.length">
        <div class="watchlist-section-title" :style="watchedRegs.length ? 'margin-top:36px;' : ''">
          Watched Standards
          <span class="watchlist-count-badge">{{ watchedStds.length }}</span>
        </div>
        <div class="std-grid">
          <std-card v-for="s in watchedStds" :key="s.id" :standard="s" />
        </div>
      </template>

      <!-- Scoped Coverage Matrix -->
      <template v-if="watchedRegs.length && watchedStds.length">
        <div class="watchlist-section-title" style="margin-top:36px;">
          Coverage Matrix
          <span class="watchlist-count-badge">{{ watchedRegs.length }} × {{ watchedStds.length }}</span>
        </div>
        <p style="font-size:12px;color:var(--color-text-muted);margin:0 0 14px;">
          Coverage between your watched regulations and standards only.
        </p>
        <div class="matrix-wrapper">
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Regulation</th>
                <th
                  v-for="std in watchedStds"
                  :key="std.id"
                  @click="$openItem(std, 'standard')"
                  style="cursor:pointer;min-width:80px;"
                  :title="std.name"
                >
                  <div class="matrix-col-header">{{ std.short_name }}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reg in watchedRegs" :key="reg.id">
                <td @click="$openItem(reg, 'regulation')" style="cursor:pointer;">
                  <span class="matrix-reg-name">{{ reg.short_name }}</span>
                  <span class="matrix-reg-domain">{{ reg.domain.map(d => $domainLabel(d)).join(', ') }}</span>
                </td>
                <td
                  v-for="std in watchedStds"
                  :key="std.id"
                  class="matrix-cell"
                  :class="{ 'matrix-cell--mapped': !!getMapping(reg.id, std.id) }"
                  :title="getCellTooltip(reg.id, std.id)"
                  @click="getMapping(reg.id, std.id) && $openItem(reg, 'regulation')"
                >
                  <span
                    v-if="getMapping(reg.id, std.id)"
                    class="coverage-badge"
                    :class="'coverage-' + getMapping(reg.id, std.id).coverage_level"
                  >{{ coverageAbbr(getMapping(reg.id, std.id).coverage_level) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Show a nudge to watch standards when only regs are watched -->
      <p
        v-else-if="watchedRegs.length && !watchedStds.length"
        style="font-size:12px;color:var(--color-text-muted);margin:14px 0 0;text-align:center;"
      >
        Star a standard to see coverage against your watched regulations.
      </p>
    </div>
  `,

  computed: {
    watchedRegs() {
      const ids = new Set(this.$s.watchlist.regulations);
      return this.$s.regulations.filter(r => ids.has(r.id));
    },
    watchedStds() {
      const ids = new Set(this.$s.watchlist.standards);
      return this.$s.standards.filter(s => ids.has(s.id));
    },
    hasAny() {
      return this.$s.watchlist.regulations.length > 0 || this.$s.watchlist.standards.length > 0;
    },
    mappingIndex() {
      const idx = {};
      this.$s.mappings.forEach(m => {
        idx[m.regulation_id + '|' + m.standard_id] = m;
      });
      return idx;
    }
  },

  methods: {
    getMapping(regId, stdId) {
      return this.mappingIndex[regId + '|' + stdId] || null;
    },
    coverageAbbr(level) {
      return { full: 'Full', substantial: 'Sub', partial: 'Part', minimal: 'Min' }[level] || level;
    },
    getCellTooltip(regId, stdId) {
      const m = this.getMapping(regId, stdId);
      if (!m) return 'Not mapped';
      const level = m.coverage_level.charAt(0).toUpperCase() + m.coverage_level.slice(1);
      return `${level} coverage\n${m.notes}`;
    },
    clearAll() {
      if (!confirm('Remove all bookmarks from your watchlist?')) return;
      this.$s.watchlist.regulations = [];
      this.$s.watchlist.standards   = [];
      try { localStorage.setItem('cm_watchlist', JSON.stringify(this.$s.watchlist)); } catch {}
    }
  }
};
