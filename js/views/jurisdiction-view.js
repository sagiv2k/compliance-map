/* Feature K — Multi-Jurisdiction Overlap Analysis */
const JurisdictionView = {
  template: `
    <div>
      <div class="hint-banner" v-if="!hintDismissed">
        <svg class="hint-banner__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div class="hint-banner__content">
          <strong class="hint-banner__title">Select 2+ jurisdictions.</strong>
          <span class="hint-banner__text">Choose the regions your organization operates in to see shared obligations, unique requirements, and conflicting rules across borders.</span>
          <button class="hint-banner__help-link" @click="$s.helpPanelOpen = true">How to use this view</button>
        </div>
        <button class="hint-banner__dismiss" @click="hintDismissed=true;dismissHint()" aria-label="Dismiss">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="view-header" style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <div>
          <h1 class="view-title">Jurisdiction Overlap Analysis</h1>
          <p class="view-subtitle">
            Select two or more jurisdictions to identify regulatory overlap, shared obligations,
            and potential conflicts in timing requirements.
          </p>
        </div>
        <button class="view-help-btn" @click="$s.helpPanelOpen = true" title="How to use Jurisdiction Overlap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </button>
      </div>

      <!-- Jurisdiction selector -->
      <div class="juris-selector">
        <div class="juris-selector__label">Select jurisdictions to compare:</div>
        <div class="juris-chips">
          <button
            v-for="(cfg, key) in $jc"
            :key="key"
            class="juris-chip"
            :class="{active: selectedJurisdictions.includes(key)}"
            :style="selectedJurisdictions.includes(key) ? {background: cfg.color+'18', borderColor: cfg.color, color: cfg.color} : {}"
            @click="toggleJuris(key)"
            :title="cfg.label + ' — ' + regsByJuris[key] + ' regulations'"
          >
            {{ cfg.label }}
            <span class="juris-chip-count">{{ regsByJuris[key] || 0 }}</span>
          </button>
        </div>
        <div class="juris-sel-hint">
          {{ selectedJurisdictions.length }} selected
          <button class="posture-sel-link" @click="selectedJurisdictions=[]" v-if="selectedJurisdictions.length">
            · Clear
          </button>
        </div>
      </div>

      <div v-if="selectedJurisdictions.length < 2" class="juris-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        Select at least 2 jurisdictions to see the overlap analysis.
      </div>

      <template v-else>
        <!-- Summary bar -->
        <div class="juris-summary-bar">
          <div class="juris-sum-card">
            <div class="juris-sum-num">{{ overlapRegs.length }}</div>
            <div class="juris-sum-lbl">Shared Regulations</div>
          </div>
          <div class="juris-sum-card juris-sum-card--warn" v-if="conflictCount">
            <div class="juris-sum-num">{{ conflictCount }}</div>
            <div class="juris-sum-lbl">Potential Conflicts</div>
          </div>
          <template v-for="(regs, jk) in perJurisRegs" :key="jk">
            <div class="juris-sum-card" :style="{borderLeftColor: $jc[jk]?.color}">
              <div class="juris-sum-num" :style="{color: $jc[jk]?.color}">{{ regs.length }}</div>
              <div class="juris-sum-lbl">{{ $jc[jk]?.label || jk }}</div>
            </div>
          </template>
        </div>

        <!-- Overlap table -->
        <div class="juris-section-title">Shared Regulations (in all {{ selectedJurisdictions.length }} selected jurisdictions)</div>
        <div v-if="!overlapRegs.length" class="juris-no-overlap">
          No regulations apply to all selected jurisdictions simultaneously.
        </div>
        <table v-else class="juris-table">
          <thead>
            <tr>
              <th>Regulation</th>
              <th v-for="jk in selectedJurisdictions" :key="jk" :style="{color: $jc[jk]?.color || 'inherit'}">
                {{ $jc[jk]?.label || jk }}
              </th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reg in overlapRegs" :key="reg.id" @click="$openItem(reg, 'regulation')">
              <td>
                <div style="font-weight:600;">{{ reg.short_name }}</div>
                <div style="font-size:11px;color:var(--color-text-muted);">{{ reg.authority }}</div>
              </td>
              <td v-for="jk in selectedJurisdictions" :key="jk">
                <span class="juris-check" v-if="reg.enforcement_region === jk">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" :stroke="$jc[jk]?.color || '#16a34a'" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Direct
                </span>
                <span class="juris-check juris-check--applies" v-else-if="regAppliesToJuris(reg, jk)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  Extraterritorial
                </span>
              </td>
              <td>
                <div class="penalty-stars">
                  <svg v-for="n in 5" :key="n" class="penalty-star" :class="n<=(reg.penalty_severity||0)?'penalty-star--on':'penalty-star--off'" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Unique-to-each-jurisdiction -->
        <div class="juris-section-title" style="margin-top:28px;">Jurisdiction-Specific Regulations</div>
        <div class="juris-unique-grid">
          <div v-for="jk in selectedJurisdictions" :key="jk" class="juris-unique-col">
            <div class="juris-unique-header" :style="{borderLeftColor: $jc[jk]?.color || '#e2e8f0'}">
              {{ $jc[jk]?.label || jk }}
              <span class="juris-unique-count">{{ uniqueRegs[jk]?.length || 0 }} unique</span>
            </div>
            <div v-if="!uniqueRegs[jk]?.length" class="juris-unique-empty">None unique to this jurisdiction.</div>
            <div v-else class="juris-unique-list">
              <div
                v-for="reg in uniqueRegs[jk]"
                :key="reg.id"
                class="juris-unique-item"
                @click="$openItem(reg, 'regulation')"
              >
                <span class="juris-unique-name">{{ reg.short_name }}</span>
                <span class="juris-unique-domain">{{ $domainLabel(reg.domain[0]) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Conflict analysis -->
        <div v-if="timeConflicts.length" style="margin-top:28px;">
          <div class="juris-section-title juris-section-title--warn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;margin-right:5px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Requirement Conflicts Detected
          </div>
          <div class="juris-conflicts">
            <div v-for="(conf, i) in timeConflicts" :key="i" class="juris-conflict-card">
              <div class="juris-conflict-title">{{ conf.topic }}</div>
              <div class="juris-conflict-items">
                <div v-for="item in conf.items" :key="item.id" class="juris-conflict-item">
                  <span class="juris-conflict-reg">{{ item.reg }}</span>
                  <span class="juris-conflict-val">{{ item.value }}</span>
                </div>
              </div>
              <div class="juris-conflict-note">Different timelines for the same obligation may require harmonising your compliance programme to the strictest requirement.</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  `,

  data() {
    return {
      selectedJurisdictions: [],
      hintDismissed: sessionStorage.getItem('cm_hint_jurisdiction') === 'true'
    };
  },

  computed: {
    filteredRegulations() {
      const { regulations, filters } = this.$s;
      return regulations.filter(r => {
        const domainOk = r.domain.some(d => filters.domains.includes(d));
        const statusOk = filters.status === 'all' || r.status === filters.status;
        return domainOk && statusOk;
      });
    },

    regsByJuris() {
      const counts = {};
      this.filteredRegulations.forEach(r => {
        counts[r.enforcement_region] = (counts[r.enforcement_region] || 0) + 1;
      });
      return counts;
    },

    perJurisRegs() {
      const map = {};
      this.selectedJurisdictions.forEach(jk => {
        map[jk] = this.filteredRegulations.filter(r => r.enforcement_region === jk);
      });
      return map;
    },

    overlapRegs() {
      if (this.selectedJurisdictions.length < 2) return [];
      const regSets = this.selectedJurisdictions.map(jk =>
        new Set(this.filteredRegulations
          .filter(r => r.enforcement_region === jk || this.regAppliesToJuris(r, jk))
          .map(r => r.id))
      );
      return this.filteredRegulations.filter(r =>
        regSets.every(set => set.has(r.id))
      );
    },

    uniqueRegs() {
      const map = {};
      this.selectedJurisdictions.forEach(jk => {
        const otherJuris = this.selectedJurisdictions.filter(j => j !== jk);
        map[jk] = this.filteredRegulations.filter(r =>
          r.enforcement_region === jk &&
          !otherJuris.some(oj => r.enforcement_region === oj || this.regAppliesToJuris(r, oj))
        );
      });
      return map;
    },

    timeConflicts() {
      const sharedRegs = this.overlapRegs;
      if (!sharedRegs.length) return [];

      const patterns = [
        { topic: 'Breach Notification Deadline', re: /(\d+)\s*(hour|day)s?\s*(breach|notif|report)/i },
        { topic: 'Data Retention Period', re: /retain.*?(\d+)\s*(year|month|day)/i },
        { topic: 'Data Subject Response Window', re: /(\d+)\s*(day|month)s?\s*(respond|fulfill|compli)/i },
        { topic: 'Incident Reporting Timeline', re: /(\d+)\s*(hour|day)s?\s*(incident|report|notify)/i }
      ];

      const conflicts = [];
      patterns.forEach(p => {
        const items = [];
        const seen = new Set();
        sharedRegs.forEach(reg => {
          const reqs = Array.isArray(reg.key_requirements) ? reg.key_requirements : [];
          const textSources = [
            ...reqs.map(r => typeof r === 'string' ? r : (r.text || '')),
            reg.summary || ''
          ];
          for (const text of textSources) {
            const m = text.match(p.re);
            if (m) {
              const val = m[0].slice(0, 60);
              if (!seen.has(val)) seen.add(val);
              items.push({ id: reg.id, reg: reg.short_name, value: val });
              break;
            }
          }
        });
        if (items.length >= 2 && seen.size > 1) {
          conflicts.push({ topic: p.topic, items });
        }
      });
      return conflicts;
    },

    conflictCount() { return this.timeConflicts.length; }
  },

  methods: {
    dismissHint() { try { sessionStorage.setItem('cm_hint_jurisdiction', 'true'); } catch(e) {} },
    toggleJuris(key) {
      const idx = this.selectedJurisdictions.indexOf(key);
      if (idx === -1) this.selectedJurisdictions.push(key);
      else this.selectedJurisdictions.splice(idx, 1);
    },
    regAppliesToJuris(reg, jk) {
      const countries = reg.geography?.countries || [];
      const jurConfig = this.$jc[jk];
      if (!jurConfig) return false;
      const euCountries = ['DE','FR','ES','IT','NL','BE','PL','SE','AT','DK','FI','IE','PT','CZ','HU','RO','BG','GR','HR','SK','SI','EE','LV','LT','LU','MT','CY'];
      const usCountries = ['US'];
      const key = jk;
      if (key === 'eu' && countries.some(c => euCountries.includes(c))) return true;
      if (key === 'us_federal' && countries.includes('US')) return true;
      if (key === 'uk' && countries.includes('GB')) return true;
      if (key === 'china' && countries.includes('CN')) return true;
      if (key === 'brazil' && countries.includes('BR')) return true;
      return false;
    }
  }
};
