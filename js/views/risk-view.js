/* Feature H — Risk Prioritization: Heatmap + Sortable Table */
const RiskView = {
  template: `
    <div>
      <div class="view-header">
        <h1 class="view-title">Risk Prioritization</h1>
        <p class="view-subtitle">
          Regulations ranked by penalty severity × enforcement intensity.
          Combined Score = (Penalty × 2) + Enforcement + (1 if deadline within 90 days).
        </p>
      </div>

      <!-- View toggle -->
      <div class="risk-controls">
        <button class="btn-risk-view" :class="{active:mode==='heatmap'}" @click="mode='heatmap'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>Heatmap
        </button>
        <button class="btn-risk-view" :class="{active:mode==='table'}" @click="mode='table'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>Table
        </button>
        <span style="font-size:12px;color:var(--color-text-muted);margin-left:8px;">
          Showing {{ filteredRegs.length }} regulations
        </span>
      </div>

      <!-- Heatmap mode -->
      <template v-if="mode === 'heatmap'">
        <!-- Legend -->
        <div class="risk-heatmap-legend">
          <div class="risk-heatmap-legend-item">
            <span class="risk-heatmap-legend-swatch" style="background:#f0fdf4;border:1px solid #86efac;"></span>
            Lower risk
          </div>
          <div class="risk-heatmap-legend-item">
            <span class="risk-heatmap-legend-swatch" style="background:#fef3c7;border:1px solid #fde68a;"></span>
            Medium risk
          </div>
          <div class="risk-heatmap-legend-item">
            <span class="risk-heatmap-legend-swatch" style="background:#fee2e2;border:1px solid #fca5a5;"></span>
            Higher risk
          </div>
        </div>

        <!-- Grid: 3 enforcement rows × 5 penalty columns -->
        <div class="risk-heatmap">
          <!-- Row labels (enforcement intensity, top=3, bottom=1) -->
          <template v-for="ei in [3,2,1]" :key="'row-'+ei">
            <div class="heatmap-axis-label" style="writing-mode:vertical-rl;transform:rotate(180deg);">
              {{ ['','Low','Active','High'][ei] }}
            </div>
            <div
              v-for="ps in [1,2,3,4,5]"
              :key="'cell-'+ei+'-'+ps"
              class="heatmap-cell"
              :class="heatmapBg(ps, ei)"
            >
              <span
                v-for="reg in cellRegs(ps, ei)"
                :key="reg.id"
                class="heatmap-reg-badge"
                @click="$openItem(reg, 'regulation')"
                :title="reg.name + ' · Combined Score: ' + combinedScore(reg)"
              >{{ reg.short_name }}</span>
            </div>
          </template>

          <!-- Bottom row: penalty x-axis labels -->
          <div></div>
          <div v-for="ps in [1,2,3,4,5]" :key="'xlabel-'+ps" class="heatmap-x-label">
            {{ ['','★','★★','★★★','★★★★','★★★★★'][ps] }}
          </div>
        </div>

        <div style="text-align:center;font-size:11px;color:var(--color-text-muted);margin-top:6px;">
          X-axis: Penalty severity (1–5) &nbsp;·&nbsp; Y-axis: Enforcement intensity (Low / Active / High)
        </div>
      </template>

      <!-- Table mode -->
      <template v-else>
        <table class="risk-table">
          <thead>
            <tr>
              <th @click="sortBy('short_name')">Regulation {{ sortIcon('short_name') }}</th>
              <th @click="sortBy('score')" title="Combined Score = (Penalty×2) + Enforcement + deadline bonus">Score {{ sortIcon('score') }}</th>
              <th @click="sortBy('penalty_severity')">Penalty {{ sortIcon('penalty_severity') }}</th>
              <th @click="sortBy('enforcement_intensity')">Enforcement {{ sortIcon('enforcement_intensity') }}</th>
              <th>Domain</th>
              <th>Jurisdiction</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="reg in sortedRegs"
              :key="reg.id"
              @click="$openItem(reg, 'regulation')"
            >
              <td>
                <div style="font-weight:600;">{{ reg.short_name }}</div>
                <div style="font-size:11px;color:var(--color-text-muted);">{{ reg.name.length > 55 ? reg.name.slice(0,55)+'…' : reg.name }}</div>
              </td>
              <td>
                <span class="risk-score-pill" :class="scorePillClass(combinedScore(reg))">
                  {{ combinedScore(reg) }}
                </span>
              </td>
              <td>
                <div class="penalty-stars">
                  <svg v-for="n in 5" :key="n" class="penalty-star" :class="n <= (reg.penalty_severity||0) ? 'penalty-star--on' : 'penalty-star--off'" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </td>
              <td>
                <div class="enforcement-bar">
                  <div v-for="n in 3" :key="n" class="enforcement-seg" :class="n <= (reg.enforcement_intensity||0) ? 'enforcement-seg--on' : 'enforcement-seg--off'"></div>
                </div>
                <div style="font-size:10px;color:var(--color-text-muted);margin-top:2px;">
                  {{ ['','Low','Active','High'][reg.enforcement_intensity||1] }}
                </div>
              </td>
              <td>
                <span v-for="d in reg.domain.slice(0,2)" :key="d" class="domain-badge" :class="'domain-badge--'+d" style="font-size:10px;padding:2px 6px;">
                  {{ $domainLabel(d) }}
                </span>
              </td>
              <td style="font-size:12px;color:var(--color-text-secondary);">{{ reg.jurisdiction }}</td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>
  `,

  data() {
    return {
      mode: 'heatmap',
      sortCol: 'score',
      sortDir: -1
    };
  },

  computed: {
    filteredRegs() {
      const { regulations, filters } = this.$s;
      return regulations.filter(r => {
        const domainOk       = r.domain.some(d => filters.domains.includes(d));
        const jurisdictionOk = filters.jurisdictions.includes(r.enforcement_region);
        const statusOk       = filters.status === 'all' || r.status === filters.status;
        return domainOk && jurisdictionOk && statusOk;
      });
    },
    sortedRegs() {
      const regs = [...this.filteredRegs];
      const col = this.sortCol;
      const dir = this.sortDir;
      regs.sort((a, b) => {
        let av, bv;
        if (col === 'short_name') { av = a.short_name; bv = b.short_name; }
        else if (col === 'score') { av = this.combinedScore(a); bv = this.combinedScore(b); }
        else if (col === 'penalty_severity') { av = a.penalty_severity||0; bv = b.penalty_severity||0; }
        else if (col === 'enforcement_intensity') { av = a.enforcement_intensity||0; bv = b.enforcement_intensity||0; }
        else { av = this.combinedScore(a); bv = this.combinedScore(b); }
        if (typeof av === 'string') return dir * av.localeCompare(bv);
        return dir * (av - bv);
      });
      return regs;
    }
  },

  methods: {
    combinedScore(reg) {
      const ps = reg.penalty_severity || 0;
      const ei = reg.enforcement_intensity || 0;
      const deadlineBonus = this.hasNearDeadline(reg) ? 1 : 0;
      return (ps * 2) + ei + deadlineBonus;
    },
    hasNearDeadline(reg) {
      const today = new Date();
      const check = (d) => {
        if (!d) return false;
        const diff = (new Date(d + 'T00:00:00') - today) / 86400000;
        return diff >= 0 && diff <= 90;
      };
      if (check(reg.effective_date)) return true;
      return (reg.milestones || []).some(ms => ms.status === 'upcoming' && check(ms.date));
    },
    cellRegs(ps, ei) {
      return this.filteredRegs.filter(r =>
        (r.penalty_severity || 0) === ps && (r.enforcement_intensity || 0) === ei
      );
    },
    heatmapBg(ps, ei) {
      const score = (ps * 2) + ei;
      if (score >= 12) return 'heatmap-bg-high';
      if (score >= 7)  return 'heatmap-bg-medium';
      return 'heatmap-bg-low';
    },
    scorePillClass(score) {
      if (score >= 12) return 'risk-score-pill--critical';
      if (score >= 9)  return 'risk-score-pill--high';
      if (score >= 6)  return 'risk-score-pill--med';
      return 'risk-score-pill--low';
    },
    sortBy(col) {
      if (this.sortCol === col) this.sortDir *= -1;
      else { this.sortCol = col; this.sortDir = -1; }
    },
    sortIcon(col) {
      if (this.sortCol !== col) return '↕';
      return this.sortDir === 1 ? '↑' : '↓';
    }
  }
};
