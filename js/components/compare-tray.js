/* Feature G — Enhanced Comparison Tray: floating selector + full side-by-side analysis modal */
const CompareTrayComponent = {
  template: `
    <div>
      <!-- Floating tray bar -->
      <transition name="tray-slide">
        <div v-if="$s.compareTray.length" class="compare-tray">
          <div class="compare-tray__items">
            <div v-for="id in $s.compareTray" :key="id" class="compare-tray__item">
              <span class="compare-tray__name">{{ regById(id)?.short_name || id }}</span>
              <button class="compare-tray__remove" @click="$s.compareTray.splice($s.compareTray.indexOf(id),1)" title="Remove">✕</button>
            </div>
            <div v-if="$s.compareTray.length < 3" class="compare-tray__slot">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add {{ $s.compareTray.length === 1 ? 'another regulation' : 'one more' }}
            </div>
          </div>
          <div class="compare-tray__actions">
            <button class="btn-compare-clear" @click="$s.compareTray=[]">Clear</button>
            <button class="btn-compare-now" :disabled="$s.compareTray.length < 2" @click="openModal">
              Compare {{ $s.compareTray.length >= 2 ? '(' + $s.compareTray.length + ')' : '' }} →
            </button>
          </div>
        </div>
      </transition>

      <!-- Full comparison modal -->
      <div v-if="$s.compareOpen" class="compare-overlay" @click.self="$s.compareOpen=false">
        <div class="compare-modal">

          <!-- Header -->
          <div class="compare-modal__header">
            <div>
              <h2 class="compare-modal__title">Side-by-Side Comparison</h2>
              <div class="compare-modal__subtitle">{{ compareRegs.map(r=>r.short_name).join(' · ') }}</div>
            </div>
            <button class="compare-close-btn" @click="$s.compareOpen=false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Per-regulation stats -->
          <div class="compare-stats-row">
            <div v-for="r in compareRegs" :key="r.id" class="compare-stat-card">
              <div class="compare-stat-card__name">{{ r.short_name }}</div>
              <div class="compare-stat-card__full">{{ r.jurisdiction }}</div>
              <div class="compare-stat-card__kpis">
                <div class="compare-kpi">
                  <span class="compare-kpi__num">{{ regStats(r).total }}</span>
                  <span class="compare-kpi__lbl">Reqs</span>
                </div>
                <div class="compare-kpi">
                  <span class="compare-kpi__num" :style="{color: regStats(r).pct >= 75 ? '#16a34a' : regStats(r).pct >= 40 ? '#d97706' : '#94a3b8'}">
                    {{ regStats(r).pct }}%
                  </span>
                  <span class="compare-kpi__lbl">Done</span>
                </div>
                <div class="compare-kpi">
                  <span class="compare-kpi__num" :style="{color: penaltyColor(r.penalty_severity)}">
                    {{ '●'.repeat(r.penalty_severity || 0) }}{{ '○'.repeat(5 - (r.penalty_severity || 0)) }}
                  </span>
                  <span class="compare-kpi__lbl">Penalty</span>
                </div>
              </div>
              <div class="compare-stat-card__bar" v-if="regStats(r).total > 0">
                <div class="compare-stat-card__bar-fill" :style="{width: regStats(r).pct + '%', background: regStats(r).pct >= 75 ? '#16a34a' : regStats(r).pct >= 40 ? '#d97706' : '#94a3b8'}"></div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="compare-tabs">
            <button v-for="t in TABS" :key="t.id" class="compare-tab" :class="{active: activeTab === t.id}" @click="activeTab = t.id">
              {{ t.label }}
            </button>
          </div>

          <div class="compare-modal__body">

            <!-- ── OVERVIEW TAB ── -->
            <div v-if="activeTab === 'overview'" style="overflow-x:auto;">
              <table class="compare-table">
                <thead>
                  <tr>
                    <th class="compare-attr-col">Attribute</th>
                    <th v-for="r in compareRegs" :key="r.id" class="compare-reg-col">
                      <div class="compare-reg-name">{{ r.short_name }}</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td class="compare-attr">Jurisdiction</td><td v-for="r in compareRegs" :key="r.id">{{ r.jurisdiction }}</td></tr>
                  <tr><td class="compare-attr">Authority</td><td v-for="r in compareRegs" :key="r.id" style="font-size:12px;">{{ r.authority }}</td></tr>
                  <tr>
                    <td class="compare-attr">Effective Date</td>
                    <td v-for="r in compareRegs" :key="r.id" :class="effectiveDateClass(r)">{{ r.effective_date || '—' }}</td>
                  </tr>
                  <tr>
                    <td class="compare-attr">Penalty Severity</td>
                    <td v-for="r in compareRegs" :key="r.id">
                      <span v-for="n in 5" :key="n" :style="{color: n <= (r.penalty_severity||0) ? penaltyColor(r.penalty_severity) : '#e2e8f0', fontSize:'16px'}">●</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="compare-attr">Enforcement</td>
                    <td v-for="r in compareRegs" :key="r.id">
                      <span v-for="n in 3" :key="n" :style="{color: n <= (r.enforcement_intensity||0) ? '#7c3aed' : '#e2e8f0', fontSize:'16px'}">▲</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="compare-attr">Domains</td>
                    <td v-for="r in compareRegs" :key="r.id">
                      <div style="display:flex;flex-wrap:wrap;gap:4px;">
                        <span v-for="d in r.domain" :key="d" class="domain-badge" :class="'domain-badge--'+d" style="font-size:10px;padding:2px 7px;">{{ $domainLabel(d) }}</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="compare-attr">Status</td>
                    <td v-for="r in compareRegs" :key="r.id">
                      <span class="compare-status-badge" :class="'compare-status--'+r.status">{{ r.status }}</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="compare-attr">Summary</td>
                    <td v-for="r in compareRegs" :key="r.id" style="font-size:12px;color:#475569;line-height:1.5;">{{ r.summary ? r.summary.slice(0,200) + (r.summary.length > 200 ? '…' : '') : '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- ── REQUIREMENTS TAB ── -->
            <div v-else-if="activeTab === 'requirements'">
              <!-- Theme filter -->
              <div class="compare-req-toolbar">
                <select class="compare-theme-filter" v-model="themeFilter">
                  <option value="">All Control Themes ({{ allThemes.length }})</option>
                  <option v-for="t in allThemes" :key="t" :value="t">{{ themeLabel(t) }}</option>
                </select>
                <div class="compare-legend">
                  <span class="compare-legend-item"><span class="cmp-status cmp-status--implemented"></span>Implemented</span>
                  <span class="compare-legend-item"><span class="cmp-status cmp-status--in_progress"></span>In Progress</span>
                  <span class="compare-legend-item"><span class="cmp-status cmp-status--not_started"></span>Not Started</span>
                </div>
              </div>

              <div v-for="theme in filteredThemes" :key="theme" class="compare-theme-block">
                <div class="compare-theme-header">
                  <span class="req-theme" :class="'req-theme--' + theme">{{ themeLabel(theme) }}</span>
                  <span class="compare-theme-counts">
                    <span v-for="r in compareRegs" :key="r.id" class="compare-theme-count">
                      {{ reqsByTheme(r, theme).length }} in {{ r.short_name }}
                    </span>
                  </span>
                </div>

                <div class="compare-req-grid" :style="{'grid-template-columns': 'repeat(' + compareRegs.length + ', 1fr)'}">
                  <div v-for="r in compareRegs" :key="r.id" class="compare-req-col">
                    <div v-if="reqsByTheme(r, theme).length === 0" class="compare-req-empty">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      No requirements
                    </div>
                    <div
                      v-for="req in reqsByTheme(r, theme)"
                      :key="req.id"
                      class="compare-req-card"
                      :class="'compare-req-card--' + reqStatus(req.id)"
                      @click="toggleReqExpand(req.id)"
                    >
                      <div class="compare-req-card__top">
                        <span class="compare-req-status-dot" :class="'cmp-status cmp-status--' + reqStatus(req.id)" :title="reqStatusLabel(req.id)"></span>
                        <span class="compare-req-id">{{ req.id }}</span>
                        <svg class="compare-req-chevron" :class="{open: expandedReqs.has(req.id)}" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                      <div class="compare-req-title" v-if="req.title">{{ req.title }}</div>
                      <div class="compare-req-text">{{ req.text }}</div>

                      <!-- Expanded detail -->
                      <div v-if="expandedReqs.has(req.id)" class="compare-req-detail">
                        <div v-if="req.consequence" class="compare-req-detail__row">
                          <span class="compare-req-detail__label">Consequence</span>
                          <span class="compare-req-detail__val">{{ req.consequence }}</span>
                        </div>
                        <div v-if="req.how_to_meet" class="compare-req-detail__row">
                          <span class="compare-req-detail__label">How to Meet</span>
                          <span class="compare-req-detail__val">{{ req.how_to_meet }}</span>
                        </div>
                        <div v-if="req.evidence_guide" class="compare-req-detail__row">
                          <span class="compare-req-detail__label">Evidence</span>
                          <span class="compare-req-detail__val">{{ req.evidence_guide }}</span>
                        </div>
                        <div class="compare-req-detail__actions">
                          <button class="compare-req-set-status" v-for="s in ['not_started','in_progress','implemented','na']" :key="s"
                            :class="'compare-req-set-status--' + s + (reqStatus(req.id) === s ? ' active' : '')"
                            @click.stop="setReqStatus(req.id, s)">
                            {{ {not_started:'Not Started',in_progress:'In Progress',implemented:'Done',na:'N/A'}[s] }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── ANALYSIS TAB ── -->
            <div v-else-if="activeTab === 'analysis'" class="compare-analysis">

              <!-- Coverage overlap -->
              <div class="compare-analysis-section">
                <h3 class="compare-analysis-title">Theme Coverage Overlap</h3>
                <p class="compare-analysis-desc">Control themes present across compared regulations</p>
                <div class="compare-overlap-grid">
                  <div v-for="t in allThemes" :key="t" class="compare-overlap-row">
                    <span class="req-theme" :class="'req-theme--' + t">{{ themeLabel(t) }}</span>
                    <div class="compare-overlap-bars">
                      <span v-for="r in compareRegs" :key="r.id"
                        class="compare-overlap-bar"
                        :class="reqsByTheme(r, t).length ? 'compare-overlap-bar--present' : 'compare-overlap-bar--absent'"
                        :title="r.short_name + ': ' + reqsByTheme(r, t).length + ' requirement(s)'"
                      >
                        {{ reqsByTheme(r, t).length ? reqsByTheme(r, t).length : '—' }}
                      </span>
                    </div>
                    <span class="compare-overlap-badge" :class="themeInAll(t) ? 'compare-overlap-badge--all' : 'compare-overlap-badge--partial'">
                      {{ themeInAll(t) ? 'All regs' : 'Partial' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Unique themes -->
              <div class="compare-analysis-section" v-if="uniqueThemes.length">
                <h3 class="compare-analysis-title">Regulation-Unique Obligations</h3>
                <p class="compare-analysis-desc">Control themes that only appear in one of the compared regulations</p>
                <div v-for="item in uniqueThemes" :key="item.theme + item.reg.id" class="compare-unique-row">
                  <span class="compare-unique-reg">{{ item.reg.short_name }}</span>
                  <span class="req-theme" :class="'req-theme--' + item.theme">{{ themeLabel(item.theme) }}</span>
                  <span style="font-size:12px;color:#64748b;">{{ reqsByTheme(item.reg, item.theme).length }} requirement(s) not covered elsewhere</span>
                </div>
              </div>

              <!-- Time-window conflicts -->
              <div class="compare-analysis-section" v-if="timeConflicts.length">
                <h3 class="compare-analysis-title" style="color:#dc2626;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:5px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Potential Conflicts
                </h3>
                <p class="compare-analysis-desc">Differing time windows for similar obligations — review which deadline takes precedence</p>
                <div v-for="(conf, i) in timeConflicts" :key="i" class="compare-conflict-card">
                  <div class="compare-conflict-card__label">{{ conf.label }}</div>
                  <div class="compare-conflict-card__values">
                    <span v-for="r in compareRegs" :key="r.id" class="compare-conflict-value-chip">
                      <strong>{{ r.short_name }}:</strong> {{ conf.values[r.id] || '—' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Implementation gap summary -->
              <div class="compare-analysis-section">
                <h3 class="compare-analysis-title">Implementation Gap Summary</h3>
                <p class="compare-analysis-desc">Based on your current compliance status</p>
                <table class="compare-gap-table">
                  <thead>
                    <tr>
                      <th>Regulation</th>
                      <th>Total Reqs</th>
                      <th>Implemented</th>
                      <th>In Progress</th>
                      <th>Not Started</th>
                      <th>Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="r in compareRegs" :key="r.id">
                      <td><strong>{{ r.short_name }}</strong></td>
                      <td>{{ regStats(r).total }}</td>
                      <td style="color:#16a34a;font-weight:700;">{{ regStats(r).implemented }}</td>
                      <td style="color:#d97706;font-weight:600;">{{ regStats(r).inProgress }}</td>
                      <td style="color:#64748b;">{{ regStats(r).notStarted }}</td>
                      <td>
                        <div style="display:flex;align-items:center;gap:8px;">
                          <div style="flex:1;height:8px;background:#f1f5f9;border-radius:999px;overflow:hidden;min-width:80px;">
                            <div :style="{height:'100%',width:regStats(r).pct+'%',background:regStats(r).pct>=75?'#16a34a':regStats(r).pct>=40?'#d97706':'#94a3b8',borderRadius:'999px'}"></div>
                          </div>
                          <span style="font-size:12px;font-weight:700;min-width:32px;">{{ regStats(r).pct }}%</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="compare-modal__footer">
            <button class="btn-compare-export" @click="exportComparison">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      activeTab:    'overview',
      themeFilter:  '',
      expandedReqs: new Set(),
      TABS: [
        { id: 'overview',      label: 'Overview' },
        { id: 'requirements',  label: 'Requirements' },
        { id: 'analysis',      label: 'Analysis' }
      ]
    };
  },

  computed: {
    compareRegs() {
      return this.$s.compareTray.map(id => this.$s.regulations.find(r => r.id === id)).filter(Boolean);
    },

    allThemes() {
      const themes = new Set();
      this.compareRegs.forEach(r => {
        (r.key_requirements || []).forEach(req => {
          if (typeof req === 'object' && req.control_theme) themes.add(req.control_theme);
        });
      });
      return [...themes].sort();
    },

    filteredThemes() {
      return this.themeFilter ? [this.themeFilter] : this.allThemes;
    },

    uniqueThemes() {
      const result = [];
      this.allThemes.forEach(theme => {
        const regsWithTheme = this.compareRegs.filter(r => this.reqsByTheme(r, theme).length > 0);
        if (regsWithTheme.length === 1) {
          result.push({ theme, reg: regsWithTheme[0] });
        }
      });
      return result;
    },

    timeConflicts() {
      const conflicts = [];
      const patterns = [
        { label: 'Breach Notification Window', re: /(\d+)\s*(hour|day)/i },
        { label: 'Data Retention Period',       re: /retain.*?(\d+)\s*(year|month)/i },
        { label: 'Response Time',               re: /respond.*?(\d+)\s*(day|hour)/i }
      ];
      patterns.forEach(p => {
        const values = {};
        const seen = new Set();
        this.compareRegs.forEach(r => {
          for (const req of (r.key_requirements || [])) {
            const text = typeof req === 'string' ? req : req.text || '';
            const m = text.match(p.re);
            if (m) { values[r.id] = m[0]; seen.add(m[0]); break; }
          }
        });
        if (seen.size > 1 && Object.keys(values).length >= 2) {
          conflicts.push({ label: p.label, values });
        }
      });
      return conflicts;
    }
  },

  methods: {
    openModal() {
      this.activeTab   = 'overview';
      this.themeFilter = '';
      this.expandedReqs = new Set();
      this.$s.compareOpen = true;
    },

    regById(id) { return this.$s.regulations.find(r => r.id === id); },

    reqsByTheme(reg, theme) {
      return (reg.key_requirements || []).filter(r => typeof r === 'object' && r.control_theme === theme);
    },

    themeInAll(theme) {
      return this.compareRegs.every(r => this.reqsByTheme(r, theme).length > 0);
    },

    regStats(reg) {
      const cs = this.$s.complianceStatus;
      const reqs = (reg.key_requirements || []).filter(r => typeof r === 'object');
      const total      = reqs.length;
      const implemented = reqs.filter(r => cs[r.id] === 'implemented').length;
      const inProgress  = reqs.filter(r => cs[r.id] === 'in_progress').length;
      const notStarted  = reqs.filter(r => !cs[r.id] || cs[r.id] === 'not_started').length;
      const pct = total ? Math.round(implemented / total * 100) : 0;
      return { total, implemented, inProgress, notStarted, pct };
    },

    reqStatus(reqId) {
      return this.$s.complianceStatus[reqId] || 'not_started';
    },

    reqStatusLabel(reqId) {
      return { not_started: 'Not Started', in_progress: 'In Progress', implemented: 'Implemented', na: 'N/A' }[this.reqStatus(reqId)] || '—';
    },

    setReqStatus(reqId, status) {
      this.$setReqStatus(reqId, status);
    },

    toggleReqExpand(reqId) {
      const s = new Set(this.expandedReqs);
      if (s.has(reqId)) s.delete(reqId); else s.add(reqId);
      this.expandedReqs = s;
    },

    themeLabel(t) {
      return {
        data_governance:'Data Governance', access_control:'Access Control',
        incident_response:'Incident Response', vendor_management:'Vendor Management',
        training_awareness:'Training & Awareness', technical_controls:'Technical Controls',
        policy_procedures:'Policy & Procedures', risk_assessment:'Risk Assessment',
        board_governance:'Board Governance', financial_controls:'Financial Controls'
      }[t] || t;
    },

    penaltyColor(sev) {
      return sev >= 5 ? '#dc2626' : sev >= 4 ? '#ea580c' : sev >= 3 ? '#d97706' : '#16a34a';
    },

    effectiveDateClass(r) {
      if (!r.effective_date) return '';
      const days = (new Date(r.effective_date + 'T00:00:00') - new Date()) / 86400000;
      if (days < 0) return 'compare-date--past';
      if (days <= 90) return 'compare-date--soon';
      return '';
    },

    exportComparison() {
      const today = new Date().toISOString().slice(0, 10);
      const cs = this.$s.complianceStatus;

      const colHeaders = this.compareRegs.map(r =>
        `<th style="background:#1e293b;color:#fff;padding:9px 12px;text-align:left;font-size:11px;">${r.short_name}<br><span style="font-weight:400;font-size:10px;">${r.jurisdiction}</span></th>`
      ).join('');

      const statsRows = this.compareRegs.map(r => {
        const st = this.regStats(r);
        return `<td style="padding:10px 12px;vertical-align:top;border-bottom:1px solid #e2e8f0;">
          <strong>${st.implemented}/${st.total}</strong> implemented (${st.pct}%)<br>
          <span style="color:#d97706;">${st.inProgress} in progress</span><br>
          <span style="color:#64748b;font-size:10px;">Penalty: ${'●'.repeat(r.penalty_severity||0)}${'○'.repeat(5-(r.penalty_severity||0))}</span>
        </td>`;
      }).join('');

      const themeRows = this.allThemes.map(theme => {
        const cols = this.compareRegs.map(r => {
          const reqs = this.reqsByTheme(r, theme);
          if (!reqs.length) return `<td style="padding:8px 12px;color:#cbd5e1;font-size:12px;border-bottom:1px solid #f1f5f9;border-right:1px solid #f1f5f9;">—</td>`;
          const items = reqs.map(req => {
            const status = cs[req.id] || 'not_started';
            const dot = status === 'implemented' ? '🟢' : status === 'in_progress' ? '🟡' : '⚪';
            return `<div style="margin-bottom:8px;padding:8px;background:#f8fafc;border-radius:6px;font-size:11px;">
              ${dot} <strong>${req.id}</strong><br>
              <span style="color:#374151;">${req.text || ''}</span>
              ${req.how_to_meet ? `<div style="margin-top:4px;color:#64748b;font-size:10px;"><em>How to meet:</em> ${req.how_to_meet.slice(0,200)}${req.how_to_meet.length>200?'…':''}</div>` : ''}
            </div>`;
          }).join('');
          return `<td style="padding:8px 12px;vertical-align:top;border-bottom:1px solid #f1f5f9;border-right:1px solid #f1f5f9;">${items}</td>`;
        }).join('');
        return `<tr>
          <td style="padding:8px 12px;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#475569;background:#f8fafc;white-space:nowrap;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">${this.themeLabel(theme)}</td>
          ${cols}
        </tr>`;
      }).join('');

      const conflictSection = this.timeConflicts.length ? `
        <h2 style="font-size:13px;font-weight:700;margin:24px 0 10px;color:#dc2626;">⚠ Potential Conflicts</h2>
        <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px;">
          ${this.timeConflicts.map(c => `<tr style="background:#fff7ed;">
            <td style="padding:8px 12px;font-weight:600;color:#92400e;width:160px;">${c.label}</td>
            ${this.compareRegs.map(r => `<td style="padding:8px 12px;">${c.values[r.id] || '—'}</td>`).join('')}
          </tr>`).join('')}
        </table>` : '';

      const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Regulation Comparison — ${today}</title>
<style>body{font-family:Arial,sans-serif;font-size:12px;color:#1e293b;margin:0;padding:24px;max-width:1400px;}h1{font-size:20px;margin:0 0 4px;}h2{font-size:14px;margin:20px 0 10px;border-bottom:2px solid #e2e8f0;padding-bottom:6px;}table{width:100%;border-collapse:collapse;}@media print{body{padding:4px;}}</style>
</head><body>
<h1>Regulation Comparison Report</h1>
<p style="font-size:11px;color:#64748b;margin:0 0 20px;">Generated: ${today} · ${this.compareRegs.map(r=>r.short_name).join(' vs ')}</p>
<h2>Implementation Summary</h2>
<table><thead><tr><th style="background:#1e293b;color:#fff;padding:9px 12px;text-align:left;font-size:11px;width:140px;">Metric</th>${colHeaders}</tr></thead>
<tbody><tr><td style="padding:10px 12px;font-weight:600;font-size:11px;background:#f8fafc;">Status</td>${statsRows}</tr></tbody></table>
<h2>Requirements by Control Theme</h2>
<table><thead><tr><th style="background:#1e293b;color:#fff;padding:9px 12px;text-align:left;font-size:11px;width:140px;">Theme</th>${colHeaders}</tr></thead>
<tbody>${themeRows}</tbody></table>
${conflictSection}
<div style="margin-top:20px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;">Generated by ComplianceMap · ${today}</div>
</body></html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `comparison-${today}.html`; a.click();
      URL.revokeObjectURL(url);
    }
  }
};
