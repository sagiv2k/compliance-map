/* Feature I — Compliance Posture Scorecard + Feature D — Standards Recommendation Engine */
const PostureView = {
  template: `
    <div>
      <div class="hint-banner" v-if="!hintDismissed">
        <svg class="hint-banner__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div class="hint-banner__content">
          <strong class="hint-banner__title">Check off what you hold.</strong>
          <span class="hint-banner__text">Select your implemented standards at the top. The Scorecard tab shows overall coverage; the Recommendations tab shows what to add next for maximum impact.</span>
          <button class="hint-banner__help-link" @click="$s.helpPanelOpen = true">How to use this view</button>
        </div>
        <button class="hint-banner__dismiss" @click="hintDismissed=true;dismissHint()" aria-label="Dismiss">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="view-header">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <h1 class="view-title">Compliance Posture Scorecard</h1>
            <p class="view-subtitle">
              Check off the standards your organization holds. See coverage across applicable regulations
              and get recommendations for maximum gap closure.
            </p>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
          <div class="posture-view-tabs">
            <button class="btn-posture-tab" :class="{active: tab==='scorecard'}" @click="tab='scorecard'">
              Scorecard
            </button>
            <button class="btn-posture-tab" :class="{active: tab==='recommender'}" @click="tab='recommender'">
              Recommendations
            </button>
          </div>
          <button class="view-help-btn" @click="$s.helpPanelOpen = true" title="How to use Posture Scorecard">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
          </div>
        </div>
      </div>

      <!-- Standards selector (shared) -->
      <div class="posture-std-selector">
        <div class="posture-std-selector__label">Standards implemented:</div>
        <div class="posture-std-grid">
          <label
            v-for="std in $s.standards"
            :key="std.id"
            class="posture-std-chip"
            :class="{active: implementedStds.includes(std.id)}"
          >
            <input type="checkbox" :value="std.id" v-model="implementedStds" />
            <span class="posture-std-name">{{ std.short_name }}</span>
          </label>
        </div>
        <div class="posture-std-sel-hint">
          {{ implementedStds.length }} of {{ $s.standards.length }} selected ·
          <button class="posture-sel-link" @click="implementedStds=$s.standards.map(s=>s.id)">Select all</button>
          ·
          <button class="posture-sel-link" @click="implementedStds=[]">Clear</button>
        </div>
      </div>

      <!-- ══ SCORECARD TAB ══ -->
      <template v-if="tab === 'scorecard'">
        <!-- KPI row -->
        <div class="posture-kpi-row">
          <div class="posture-kpi-card">
            <div class="posture-ring-wrap">
              <svg class="posture-ring" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" stroke-width="3.5"/>
                <circle cx="18" cy="18" r="15.9" fill="none"
                  :stroke="overallPct >= 75 ? '#16a34a' : overallPct >= 50 ? '#3b82f6' : overallPct >= 25 ? '#d97706' : '#dc2626'"
                  stroke-width="3.5"
                  stroke-dasharray="100 100"
                  :stroke-dashoffset="100 - overallPct"
                  stroke-linecap="round"
                  transform="rotate(-90 18 18)"
                />
                <text x="18" y="20.5" text-anchor="middle" font-size="8" font-weight="800" fill="#1e293b">{{ overallPct }}%</text>
              </svg>
            </div>
            <div class="posture-kpi-label">Overall Coverage</div>
          </div>
          <div class="posture-kpi-card posture-kpi-card--green">
            <div class="posture-kpi-num">{{ wellCoveredCount }}</div>
            <div class="posture-kpi-label">Well Covered Regs</div>
          </div>
          <div class="posture-kpi-card posture-kpi-card--red">
            <div class="posture-kpi-num">{{ gapCount }}</div>
            <div class="posture-kpi-label">Major Gaps</div>
          </div>
          <div class="posture-kpi-card posture-kpi-card--blue" v-if="nextBestStd">
            <div class="posture-kpi-std">{{ nextBestStd.short_name }}</div>
            <div class="posture-kpi-label">Recommended Next Standard</div>
          </div>
        </div>

        <!-- Per-domain summary -->
        <div class="posture-section-title">Coverage by Domain</div>
        <div class="posture-domain-grid">
          <div v-for="domain in domainScores" :key="domain.key" class="posture-domain-card">
            <div class="posture-domain-header">
              <span class="posture-domain-name" :style="{color: $domainColor(domain.key)}">{{ $domainLabel(domain.key) }}</span>
              <span class="posture-domain-pct">{{ domain.pct }}%</span>
            </div>
            <div class="posture-domain-bar">
              <div class="posture-domain-fill"
                :style="{width: domain.pct + '%', background: domain.pct >= 75 ? '#16a34a' : domain.pct >= 50 ? '#3b82f6' : domain.pct >= 25 ? '#d97706' : '#dc2626'}"
              ></div>
            </div>
            <div class="posture-domain-sub">{{ domain.covered }} / {{ domain.total }} regs covered</div>
          </div>
        </div>

        <!-- Per-regulation breakdown -->
        <div class="posture-section-title" style="margin-top:28px;">Per-Regulation Progress</div>
        <div class="posture-reg-list">
          <div
            v-for="row in regScores"
            :key="row.reg.id"
            class="posture-reg-row"
            @click="$openItem(row.reg, 'regulation')"
          >
            <div class="posture-reg-left">
              <span class="posture-reg-name">{{ row.reg.short_name }}</span>
              <div class="posture-reg-stds">
                <span v-for="sc in row.coveringStds" :key="sc" class="posture-std-badge">{{ sc }}</span>
                <span v-if="!row.coveringStds.length" class="posture-std-badge posture-std-badge--none">No standard maps here</span>
              </div>
            </div>
            <div class="posture-reg-right">
              <div class="posture-reg-bar">
                <div class="posture-reg-fill" :class="'posture-fill--' + row.tier" :style="{width: row.pct + '%'}"></div>
              </div>
              <span class="posture-reg-pct">{{ row.pct }}%</span>
            </div>
          </div>
        </div>

        <!-- Export button -->
        <div style="margin-top:24px;text-align:right;">
          <button class="btn-posture-export" @click="exportScorecard">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Executive Summary
          </button>
        </div>
      </template>

      <!-- ══ RECOMMENDER TAB ══ -->
      <template v-else>
        <div class="recommender-intro">
          The recommender ranks standards and combinations by how much they improve your coverage
          of the <strong>{{ filteredRegulations.length }}</strong> regulations in scope.
          Standards you've already implemented are shown greyed out.
        </div>

        <!-- Single standard ranking -->
        <div class="posture-section-title">Single Standard Coverage</div>
        <div class="rec-std-list">
          <div
            v-for="(row, i) in singleStdRanking"
            :key="row.std.id"
            class="rec-std-row"
            :class="{ 'rec-std-row--impl': implementedStds.includes(row.std.id) }"
          >
            <span class="rec-rank">{{ i + 1 }}</span>
            <div class="rec-std-info">
              <span class="rec-std-name">{{ row.std.short_name }}</span>
              <span class="rec-std-fullname">{{ row.std.name }}</span>
            </div>
            <div class="rec-std-bar-wrap">
              <div class="rec-std-bar">
                <div class="rec-std-fill" :style="{width: row.pct + '%', background: implementedStds.includes(row.std.id) ? '#94a3b8' : '#3b82f6'}"></div>
              </div>
              <span class="rec-std-pct">{{ row.pct }}%</span>
            </div>
            <span v-if="implementedStds.includes(row.std.id)" class="rec-impl-badge">Implemented</span>
            <div v-else class="rec-std-domains">
              <span v-for="d in row.domains.slice(0,3)" :key="d" class="rec-domain-chip" :style="{background: $domainColor(d)+'20', color: $domainColor(d)}">{{ $domainLabel(d) }}</span>
            </div>
          </div>
        </div>

        <!-- Two-standard combos -->
        <div class="posture-section-title" style="margin-top:28px;">Best Two-Standard Combinations</div>
        <div class="rec-combo-list">
          <div v-for="(combo, i) in topCombos2" :key="i" class="rec-combo-row">
            <span class="rec-rank">{{ i + 1 }}</span>
            <div class="rec-combo-stds">
              <span class="rec-combo-std" v-for="sid in combo.ids" :key="sid">
                {{ stdById(sid)?.short_name }}
              </span>
            </div>
            <div class="rec-std-bar-wrap" style="flex:1;">
              <div class="rec-std-bar">
                <div class="rec-std-fill" :style="{width: combo.pct + '%', background: '#059669'}"></div>
              </div>
              <span class="rec-std-pct">{{ combo.pct }}%</span>
            </div>
            <span class="rec-combo-delta" v-if="combo.delta > 0">+{{ combo.delta }}% vs best single</span>
          </div>
        </div>

        <!-- Three-standard combos -->
        <div class="posture-section-title" style="margin-top:28px;">Best Three-Standard Combinations</div>
        <div class="rec-combo-list">
          <div v-for="(combo, i) in topCombos3" :key="i" class="rec-combo-row">
            <span class="rec-rank">{{ i + 1 }}</span>
            <div class="rec-combo-stds">
              <span class="rec-combo-std" v-for="sid in combo.ids" :key="sid">
                {{ stdById(sid)?.short_name }}
              </span>
            </div>
            <div class="rec-std-bar-wrap" style="flex:1;">
              <div class="rec-std-bar">
                <div class="rec-std-fill" :style="{width: combo.pct + '%', background: '#7c3aed'}"></div>
              </div>
              <span class="rec-std-pct">{{ combo.pct }}%</span>
            </div>
            <span class="rec-combo-delta" v-if="combo.delta > 0">+{{ combo.delta }}% vs best single</span>
          </div>
        </div>
      </template>
    </div>
  `,

  data() {
    return {
      implementedStds: [],
      tab: 'scorecard',
      hintDismissed: sessionStorage.getItem('cm_hint_posture') === 'true'
    };
  },

  mounted() {
    try {
      const saved = JSON.parse(localStorage.getItem('cm_implemented_stds') || 'null');
      if (Array.isArray(saved)) this.implementedStds = saved;
    } catch {}
  },

  watch: {
    implementedStds(v) {
      try { localStorage.setItem('cm_implemented_stds', JSON.stringify(v)); } catch {}
    }
  },

  computed: {
    filteredRegulations() {
      const { regulations, filters } = this.$s;
      return regulations.filter(r => {
        const domainOk       = r.domain.some(d => filters.domains.includes(d));
        const jurisdictionOk = filters.jurisdictions.includes(r.enforcement_region);
        const statusOk       = filters.status === 'all' || r.status === filters.status;
        return domainOk && jurisdictionOk && statusOk;
      });
    },

    coverageMap() {
      const map = {};
      this.$s.mappings.forEach(m => {
        const key = `${m.regulation_id}::${m.standard_id}`;
        map[key] = m;
      });
      return map;
    },

    coverageScore() {
      return (level) => ({ full: 4, substantial: 3, partial: 2, minimal: 1 }[level] || 0);
    },

    regScores() {
      return this.filteredRegulations.map(reg => {
        const mappings = this.implementedStds
          .map(sid => this.coverageMap[`${reg.id}::${sid}`])
          .filter(Boolean);
        const best = Math.max(0, ...mappings.map(m => this.coverageScore(m.coverage_level)));
        const pct = Math.round((best / 4) * 100);
        const tier = best >= 4 ? 'full' : best >= 3 ? 'substantial' : best >= 2 ? 'partial' : best >= 1 ? 'minimal' : 'none';
        const coveringStds = mappings
          .filter(m => this.coverageScore(m.coverage_level) >= 3)
          .map(m => this.$s.standards.find(s => s.id === m.standard_id)?.short_name)
          .filter(Boolean);
        return { reg, pct, tier, coveringStds };
      }).sort((a, b) => a.pct - b.pct);
    },

    overallPct() {
      if (!this.regScores.length) return 0;
      return Math.round(this.regScores.reduce((s, r) => s + r.pct, 0) / this.regScores.length);
    },

    wellCoveredCount() {
      return this.regScores.filter(r => r.pct >= 75).length;
    },

    gapCount() {
      return this.regScores.filter(r => r.pct < 25).length;
    },

    domainScores() {
      const domains = [...new Set(this.filteredRegulations.flatMap(r => r.domain))];
      return domains.map(d => {
        const regs = this.filteredRegulations.filter(r => r.domain.includes(d));
        const scores = regs.map(reg => {
          const row = this.regScores.find(rs => rs.reg.id === reg.id);
          return row ? row.pct : 0;
        });
        const avg = scores.length ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : 0;
        const covered = scores.filter(s => s >= 75).length;
        return { key: d, pct: avg, total: regs.length, covered };
      }).sort((a, b) => b.pct - a.pct);
    },

    singleStdRanking() {
      return this.$s.standards.map(std => {
        const pct = this._comboCoverage([std.id]);
        const domains = [...new Set(
          this.$s.mappings.filter(m => m.standard_id === std.id).map(m => {
            const reg = this.filteredRegulations.find(r => r.id === m.regulation_id);
            return reg ? reg.domain : [];
          }).flat()
        )];
        return { std, pct, domains };
      }).sort((a, b) => b.pct - a.pct);
    },

    bestSinglePct() {
      return this.singleStdRanking.length ? this.singleStdRanking[0].pct : 0;
    },

    topCombos2() {
      const stds = this.$s.standards;
      const combos = [];
      for (let i = 0; i < stds.length; i++) {
        for (let j = i + 1; j < stds.length; j++) {
          const ids = [stds[i].id, stds[j].id];
          const pct = this._comboCoverage(ids);
          combos.push({ ids, pct, delta: Math.max(0, pct - this.bestSinglePct) });
        }
      }
      return combos.sort((a, b) => b.pct - a.pct).slice(0, 5);
    },

    topCombos3() {
      const stds = this.$s.standards;
      const combos = [];
      for (let i = 0; i < stds.length; i++) {
        for (let j = i + 1; j < stds.length; j++) {
          for (let k = j + 1; k < stds.length; k++) {
            const ids = [stds[i].id, stds[j].id, stds[k].id];
            const pct = this._comboCoverage(ids);
            combos.push({ ids, pct, delta: Math.max(0, pct - this.bestSinglePct) });
          }
        }
      }
      return combos.sort((a, b) => b.pct - a.pct).slice(0, 5);
    },

    nextBestStd() {
      const unimpl = this.singleStdRanking.filter(r => !this.implementedStds.includes(r.std.id));
      if (!unimpl.length) return null;
      // Find which unimplemented standard improves current score most
      const currentPct = this.overallPct;
      let bestGain = -1;
      let bestStd = null;
      unimpl.forEach(row => {
        const pct = this._comboCoverage([...this.implementedStds, row.std.id]);
        const gain = pct - currentPct;
        if (gain > bestGain) { bestGain = gain; bestStd = row.std; }
      });
      return bestStd;
    }
  },

  methods: {
    dismissHint() { try { sessionStorage.setItem('cm_hint_posture', 'true'); } catch(e) {} },
    stdById(id) {
      return this.$s.standards.find(s => s.id === id);
    },

    _comboCoverage(stdIds) {
      if (!this.filteredRegulations.length) return 0;
      const scores = this.filteredRegulations.map(reg => {
        const mappings = stdIds
          .map(sid => this.coverageMap[`${reg.id}::${sid}`])
          .filter(Boolean);
        const best = Math.max(0, ...mappings.map(m => ({ full:4, substantial:3, partial:2, minimal:1 }[m.coverage_level] || 0)));
        return (best / 4) * 100;
      });
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    },

    exportScorecard() {
      const today = new Date().toISOString().slice(0, 10);
      const implNames = this.implementedStds.map(id => this.$s.standards.find(s => s.id === id)?.short_name || id).join(', ');

      const domainRows = this.domainScores.map(d => `
        <tr>
          <td>${this.$domainLabel(d.key)}</td>
          <td>
            <div class="bar-wrap"><div class="bar-fill" style="width:${d.pct}%;background:${d.pct>=75?'#16a34a':d.pct>=50?'#3b82f6':d.pct>=25?'#d97706':'#dc2626'};"></div></div>
          </td>
          <td style="text-align:right;font-weight:700;">${d.pct}%</td>
          <td>${d.covered} / ${d.total}</td>
        </tr>`).join('');

      const regRows = [...this.regScores].reverse().map(row => `
        <tr>
          <td><strong>${row.reg.short_name}</strong></td>
          <td style="font-size:11px;color:#64748b;">${row.reg.name.length>55?row.reg.name.slice(0,55)+'…':row.reg.name}</td>
          <td>
            <div class="bar-wrap"><div class="bar-fill" style="width:${row.pct}%;background:${row.tier==='full'?'#16a34a':row.tier==='substantial'?'#3b82f6':row.tier==='partial'?'#d97706':row.tier==='minimal'?'#dc2626':'#e2e8f0'};"></div></div>
          </td>
          <td style="text-align:right;font-weight:700;">${row.pct}%</td>
          <td style="font-size:11px;">${row.coveringStds.join(', ') || '—'}</td>
        </tr>`).join('');

      const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Compliance Posture Scorecard — ${today}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:12px;color:#1e293b;margin:0;padding:24px;max-width:1100px;}
  h1{font-size:22px;margin:0 0 4px;}
  .meta{font-size:11px;color:#64748b;margin-bottom:24px;border-bottom:1px solid #e2e8f0;padding-bottom:14px;}
  .kpi-row{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;}
  .kpi-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;min-width:130px;text-align:center;}
  .kpi-num{font-size:28px;font-weight:800;color:#1e293b;}
  .kpi-lbl{font-size:11px;color:#64748b;margin-top:4px;}
  .kpi-card.green .kpi-num{color:#16a34a;} .kpi-card.red .kpi-num{color:#dc2626;} .kpi-card.blue .kpi-num{color:#2563eb;}
  h2{font-size:15px;margin:22px 0 10px;}
  table{width:100%;border-collapse:collapse;font-size:12px;}
  th{padding:7px 10px;text-align:left;background:#f1f5f9;border-bottom:2px solid #e2e8f0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;}
  td{padding:7px 10px;border-bottom:1px solid #e2e8f0;vertical-align:middle;}
  tr:nth-child(even) td{background:#fafafa;}
  .bar-wrap{width:120px;height:8px;background:#f1f5f9;border-radius:999px;overflow:hidden;display:inline-block;}
  .bar-fill{height:100%;border-radius:999px;}
  .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;}
  @media print{body{padding:6px;}table{page-break-inside:auto;}tr{page-break-inside:avoid;}}
</style></head><body>
<h1>Compliance Posture Scorecard</h1>
<div class="meta">
  Generated: ${today} · Standards implemented: ${implNames || 'None'} · Regulations in scope: ${this.filteredRegulations.length}
</div>
<div class="kpi-row">
  <div class="kpi-card">
    <div class="kpi-num">${this.overallPct}%</div><div class="kpi-lbl">Overall Coverage</div>
  </div>
  <div class="kpi-card green">
    <div class="kpi-num">${this.wellCoveredCount}</div><div class="kpi-lbl">Well Covered Regs (≥75%)</div>
  </div>
  <div class="kpi-card red">
    <div class="kpi-num">${this.gapCount}</div><div class="kpi-lbl">Major Gaps (&lt;25%)</div>
  </div>
  ${this.nextBestStd ? `<div class="kpi-card blue"><div class="kpi-num" style="font-size:18px;">${this.nextBestStd.short_name}</div><div class="kpi-lbl">Recommended Next Standard</div></div>` : ''}
</div>
<h2>Coverage by Domain</h2>
<table><thead><tr><th>Domain</th><th>Coverage</th><th>Score</th><th>Regs Covered</th></tr></thead>
<tbody>${domainRows}</tbody></table>
<h2>Per-Regulation Progress</h2>
<table><thead><tr><th>Regulation</th><th>Name</th><th>Coverage</th><th>Score</th><th>Covered By</th></tr></thead>
<tbody>${regRows}</tbody></table>
<div class="footer">Generated by ComplianceMap · For executive and board reporting · ${today}</div>
</body></html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `posture-scorecard-${today}.html`; a.click();
      URL.revokeObjectURL(url);
    }
  }
};
