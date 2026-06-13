/* Regulatory Change Alert Banner + Obligation Impact Assessment */
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
            :class="{'change-alert-tag--impact': impactCount(c) > 0}"
            @click="toggleImpact(c.regulation_id)"
            :title="impactCount(c) > 0 ? impactCount(c) + ' implemented requirements may need review' : 'View regulation'"
          >
            {{ c.regulation }}
            <span v-if="impactCount(c) > 0" class="change-alert-impact-badge">{{ impactCount(c) }}</span>
          </button>
          <span v-if="visibleChanges.length > 4" style="font-size:11px;color:#7c2d12;align-self:center;">
            +{{ visibleChanges.length - 4 }} more
          </span>
        </div>

        <!-- Impact detail panel (shown on click) -->
        <div v-if="expandedId" class="change-alert-impact-panel">
          <div class="change-alert-impact-panel__header">
            <span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#92400e" stroke-width="2" style="vertical-align:middle;margin-right:4px;">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <strong>Obligation Impact:</strong> {{ expandedChange.regulation }}
              <span v-if="expandedChange.change_summary" style="font-weight:400;color:#92400e;margin-left:6px;">— {{ expandedChange.change_summary }}</span>
            </span>
            <button @click="expandedId = null" style="background:none;border:none;cursor:pointer;color:#92400e;font-size:16px;line-height:1;padding:0 2px;">✕</button>
          </div>
          <template v-if="expandedImpact.length">
            <p style="margin:0 0 8px;font-size:12px;color:#92400e;">
              {{ expandedImpact.length }} requirement{{ expandedImpact.length > 1 ? 's' : '' }} you've marked
              <strong>Implemented</strong> may need re-review following this update:
            </p>
            <div class="change-alert-impact-list">
              <div v-for="req in expandedImpact" :key="req.id" class="change-alert-impact-item">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5" style="flex-shrink:0;margin-top:2px;">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span>{{ req.title || req.id }}</span>
              </div>
            </div>
            <button class="change-alert-open-btn" @click="openRegulation(expandedChange)">
              Open {{ expandedChange.regulation }} to review →
            </button>
          </template>
          <template v-else>
            <p style="margin:0;font-size:12px;color:#78716c;">
              No requirements you've implemented are affected by this change.
              <button class="change-alert-open-btn" @click="openRegulation(expandedChange)" style="display:inline;margin-left:8px;">View regulation →</button>
            </p>
          </template>
        </div>
      </div>
      <button class="change-alert-banner__dismiss" @click="dismissed = true" title="Dismiss">✕</button>
    </div>
  `,

  data() {
    return { dismissed: false, expandedId: null };
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
    },
    expandedChange() {
      return this.visibleChanges.find(c => c.regulation_id === this.expandedId) || null;
    },
    expandedImpact() {
      if (!this.expandedChange) return [];
      return this.getImplementedReqs(this.expandedChange);
    }
  },

  methods: {
    impactCount(change) {
      return this.getImplementedReqs(change).length;
    },
    getImplementedReqs(change) {
      const reg = this.$s.regulations.find(r => r.id === change.regulation_id);
      if (!reg || !reg.key_requirements) return [];
      const cs = this.$s.complianceStatus;
      // If change has specific affected_requirements, use those; else flag all implemented ones
      if (change.affected_requirements && change.affected_requirements.length) {
        return reg.key_requirements
          .filter(r => typeof r === 'object' && change.affected_requirements.includes(r.id) && cs[r.id] === 'implemented');
      }
      return reg.key_requirements
        .filter(r => typeof r === 'object' && cs[r.id] === 'implemented');
    },
    toggleImpact(regId) {
      if (this.expandedId === regId) {
        this.expandedId = null;
      } else {
        this.expandedId = regId;
      }
    },
    openRegulation(change) {
      const reg = this.$s.regulations.find(r => r.id === change.regulation_id);
      if (reg) this.$openItem(reg, 'regulation');
      this.expandedId = null;
    }
  }
};
