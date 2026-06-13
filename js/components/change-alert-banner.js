/* Regulatory Change Alert Banner — shown on overview/watchlist when tracked regs have updated */
const ChangeAlertBannerComponent = {
  template: `
    <div class="change-alert-banner" v-if="!dismissed && visibleChanges.length > 0">
      <div class="change-alert-banner__icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/>
        </svg>
      </div>
      <div class="change-alert-banner__content">
        <strong>
          {{ visibleChanges.length }} regulation{{ visibleChanges.length > 1 ? 's' : '' }}
          {{ watchedIds.length ? "you're tracking" : "" }} {{ visibleChanges.length > 1 ? 'have' : 'has' }} been updated
        </strong>
        <div class="change-alert-banner__list">
          <button
            v-for="c in visibleChanges.slice(0, 4)"
            :key="c.regulation_id"
            class="change-alert-tag"
            @click="openReg(c)"
          >{{ c.regulation }}</button>
          <span v-if="visibleChanges.length > 4" style="font-size:11px;color:#7c2d12;align-self:center;">
            +{{ visibleChanges.length - 4 }} more
          </span>
        </div>
      </div>
      <button class="change-alert-banner__dismiss" @click="dismissed = true" title="Dismiss">✕</button>
    </div>
  `,

  data() {
    return { dismissed: false };
  },

  computed: {
    watchedIds() {
      return this.$s.watchlist.regulations;
    },
    visibleChanges() {
      const changes = this.$s.regulationChanges;
      if (!changes || !changes.length) return [];
      if (this.watchedIds.length) {
        return changes.filter(c => this.watchedIds.includes(c.regulation_id));
      }
      return changes.slice(0, 10);
    }
  },

  methods: {
    openReg(change) {
      const reg = this.$s.regulations.find(r => r.id === change.regulation_id);
      if (reg) this.$openItem(reg, 'regulation');
    }
  }
};
