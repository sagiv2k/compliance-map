/* Feature G — Comparison Tray (floating bottom bar + modal view) */
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
            <button
              class="btn-compare-now"
              :disabled="$s.compareTray.length < 2"
              @click="$s.compareOpen = true"
            >
              Compare {{ $s.compareTray.length >= 2 ? '(' + $s.compareTray.length + ')' : '' }} →
            </button>
          </div>
        </div>
      </transition>

      <!-- Comparison modal -->
      <div v-if="$s.compareOpen" class="compare-overlay" @click.self="$s.compareOpen=false">
        <div class="compare-modal">
          <div class="compare-modal__header">
            <h2 class="compare-modal__title">Side-by-Side Comparison</h2>
            <button class="compare-close-btn" @click="$s.compareOpen=false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div style="overflow-x:auto;">
            <table class="compare-table">
              <thead>
                <tr>
                  <th class="compare-attr-col">Attribute</th>
                  <th v-for="reg in compareRegs" :key="reg.id" class="compare-reg-col">
                    <div class="compare-reg-name">{{ reg.short_name }}</div>
                    <div class="compare-reg-full">{{ reg.name.length > 50 ? reg.name.slice(0,50) + '…' : reg.name }}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <!-- Meta attributes -->
                <tr class="compare-section-row"><td :colspan="compareRegs.length + 1">Overview</td></tr>
                <tr><td class="compare-attr">Jurisdiction</td><td v-for="r in compareRegs" :key="r.id">{{ r.jurisdiction }}</td></tr>
                <tr><td class="compare-attr">Authority</td><td v-for="r in compareRegs" :key="r.id">{{ r.authority }}</td></tr>
                <tr>
                  <td class="compare-attr">Effective Date</td>
                  <td v-for="r in compareRegs" :key="r.id" :class="effectiveDateClass(r)">
                    {{ r.effective_date || '—' }}
                  </td>
                </tr>
                <tr>
                  <td class="compare-attr">Penalties</td>
                  <td v-for="r in compareRegs" :key="r.id">
                    <span v-if="r.penalties" class="compare-penalty-pill">{{ r.penalties }}</span>
                    <span v-else style="color:#94a3b8;">—</span>
                  </td>
                </tr>
                <tr>
                  <td class="compare-attr">Penalty Severity</td>
                  <td v-for="r in compareRegs" :key="r.id">
                    <div class="penalty-stars">
                      <svg v-for="n in 5" :key="n" class="penalty-star" :class="n<=(r.penalty_severity||0)?'penalty-star--on':'penalty-star--off'" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
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

                <!-- Key requirements comparison -->
                <tr v-if="hasAnyStructured" class="compare-section-row">
                  <td :colspan="compareRegs.length + 1">Key Requirements</td>
                </tr>
                <template v-if="hasAnyStructured">
                  <tr v-for="theme in allThemes" :key="theme">
                    <td class="compare-attr">
                      <span class="req-theme" :class="'req-theme--'+theme">{{ themeLabel(theme) }}</span>
                    </td>
                    <td v-for="r in compareRegs" :key="r.id" class="compare-req-cell">
                      <div v-for="req in reqsByTheme(r, theme)" :key="req.id" class="compare-req-item">
                        <span class="compare-req-id">{{ req.id }}</span>
                        <span class="compare-req-text">{{ req.text }}</span>
                      </div>
                      <span v-if="!reqsByTheme(r, theme).length" style="color:#cbd5e1;font-size:12px;">—</span>
                    </td>
                  </tr>
                </template>

                <!-- Time-window conflicts -->
                <tr v-if="timeConflicts.length" class="compare-section-row compare-section-row--warn">
                  <td :colspan="compareRegs.length + 1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:5px;vertical-align:middle;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Potential Conflicts Detected
                  </td>
                </tr>
                <tr v-for="(conf, i) in timeConflicts" :key="'conf-'+i" class="compare-conflict-row">
                  <td class="compare-attr compare-attr--warn">{{ conf.label }}</td>
                  <td v-for="r in compareRegs" :key="r.id" class="compare-conflict-cell">
                    <span v-if="conf.values[r.id]" class="compare-conflict-value">{{ conf.values[r.id] }}</span>
                    <span v-else style="color:#94a3b8;">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="compare-modal__footer">
            <button class="btn-compare-export" @click="exportComparison">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  computed: {
    compareRegs() {
      return this.$s.compareTray.map(id => this.$s.regulations.find(r => r.id === id)).filter(Boolean);
    },
    hasAnyStructured() {
      return this.compareRegs.some(r => Array.isArray(r.key_requirements) && r.key_requirements.length > 0 && typeof r.key_requirements[0] === 'object');
    },
    allThemes() {
      const themes = new Set();
      this.compareRegs.forEach(r => {
        if (Array.isArray(r.key_requirements)) {
          r.key_requirements.forEach(req => { if (typeof req === 'object') themes.add(req.control_theme); });
        }
      });
      return [...themes];
    },
    timeConflicts() {
      const conflicts = [];
      const patterns = [
        { label: 'Breach Notification Window', re: /(\d+)\s*(hour|day)/i },
        { label: 'Data Retention Period', re: /retain.*?(\d+)\s*(year|month)/i },
        { label: 'Response Time', re: /respond.*?(\d+)\s*(day|hour)/i }
      ];
      patterns.forEach(p => {
        const values = {};
        let found = 0;
        const seen = new Set();
        this.compareRegs.forEach(r => {
          const reqs = Array.isArray(r.key_requirements) ? r.key_requirements : [];
          for (const req of reqs) {
            const text = typeof req === 'string' ? req : req.text || '';
            const m = text.match(p.re);
            if (m) {
              values[r.id] = m[0];
              if (!seen.has(m[0])) { seen.add(m[0]); found++; }
              break;
            }
          }
        });
        if (found >= 2 && seen.size > 1) conflicts.push({ label: p.label, values });
      });
      return conflicts;
    }
  },

  methods: {
    regById(id) { return this.$s.regulations.find(r => r.id === id); },
    themeLabel(t) {
      return {
        data_governance:'Data Governance', access_control:'Access Control', incident_response:'Incident Response',
        vendor_management:'Vendor Mgmt', training_awareness:'Training', technical_controls:'Technical Controls',
        policy_procedures:'Policy', risk_assessment:'Risk Assessment', board_governance:'Board Governance',
        financial_controls:'Financial Controls'
      }[t] || t;
    },
    reqsByTheme(reg, theme) {
      if (!Array.isArray(reg.key_requirements)) return [];
      return reg.key_requirements.filter(r => typeof r === 'object' && r.control_theme === theme);
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
      const regCols = this.compareRegs.map(r => `<th>${r.short_name}</th>`).join('');
      const attrRow = (label, fn) =>
        `<tr><td class="attr">${label}</td>${this.compareRegs.map(r => `<td>${fn(r)}</td>`).join('')}</tr>`;

      const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Regulation Comparison — ${today}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:12px;color:#1e293b;margin:0;padding:20px;max-width:1200px;}
  h1{font-size:20px;margin:0 0 4px;}
  .meta{font-size:11px;color:#64748b;margin-bottom:20px;border-bottom:1px solid #e2e8f0;padding-bottom:12px;}
  table{width:100%;border-collapse:collapse;font-size:12px;}
  th{padding:9px 12px;text-align:left;background:#1e293b;color:#fff;font-size:11px;font-weight:700;}
  td{padding:8px 12px;border-bottom:1px solid #e2e8f0;vertical-align:top;}
  tr:nth-child(even) td{background:#f8fafc;}
  .attr{font-weight:600;color:#475569;background:#f1f5f9 !important;width:160px;font-size:11px;}
  .section{background:#e2e8f0 !important;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#334155;}
  .conflict{background:#fff7ed !important;} .attr.conflict-attr{color:#92400e;}
  .footer{margin-top:20px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;}
  @media print{body{padding:4px;}table{page-break-inside:auto;}tr{page-break-inside:avoid;}}
</style></head><body>
<h1>Regulation Comparison Report</h1>
<div class="meta">Generated: ${today} · Regulations compared: ${this.compareRegs.map(r=>r.short_name).join(' vs ')}</div>
<table>
<thead><tr><th>Attribute</th>${regCols}</tr></thead>
<tbody>
<tr class="section"><td colspan="${this.compareRegs.length+1}">Overview</td></tr>
${attrRow('Jurisdiction', r => r.jurisdiction)}
${attrRow('Authority', r => r.authority)}
${attrRow('Effective Date', r => r.effective_date || '—')}
${attrRow('Penalties', r => r.penalties || '—')}
${attrRow('Penalty Severity', r => '★'.repeat(r.penalty_severity||0) || '—')}
${attrRow('Status', r => r.status)}
${attrRow('Domains', r => r.domain.map(d=>this.$domainLabel(d)).join(', '))}
${this.timeConflicts.length ? `<tr class="section conflict"><td colspan="${this.compareRegs.length+1}">⚠ Potential Conflicts</td></tr>
${this.timeConflicts.map(c => `<tr class="conflict">${`<td class="attr conflict-attr">${c.label}</td>`}${this.compareRegs.map(r=>`<td>${c.values[r.id]||'—'}</td>`).join('')}</tr>`).join('')}` : ''}
</tbody></table>
<div class="footer">Generated by ComplianceMap · For legal advisory purposes · ${today}</div>
</body></html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `comparison-${today}.html`; a.click();
      URL.revokeObjectURL(url);
    }
  }
};
