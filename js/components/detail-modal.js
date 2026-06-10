/* Detail slide-over modal — regulations and standards */
const DetailModalComponent = {
  template: `
    <div class="modal-overlay" @click.self="$closeItem()">
      <div class="modal-panel">

        <!-- Header -->
        <div class="modal-header">
          <div class="modal-header__left">
            <div class="modal-short-name">{{ item.short_name || item.name }}</div>
            <div class="modal-full-name">{{ isReg ? item.name : item.issuing_body }}</div>
            <div class="modal-badges">
              <template v-if="isReg">
                <span v-for="d in item.domain" :key="d" class="domain-badge" :class="'domain-badge--' + d">{{ $domainLabel(d) }}</span>
                <span class="status-badge" :class="'status-badge--' + item.status">
                  <span class="status-dot"></span>{{ capitalize(item.status) }}
                </span>
                <!-- Risk score badges -->
                <span v-if="item.penalty_severity" class="risk-score-badge risk-score-badge--penalty" :title="'Penalty severity: ' + item.penalty_severity + '/5'">
                  <span v-for="n in 5" :key="n" :class="n <= item.penalty_severity ? 'risk-dot risk-dot--on' : 'risk-dot'">●</span>
                  Penalty
                </span>
                <span v-if="item.enforcement_intensity" class="risk-score-badge risk-score-badge--enforcement" :title="'Enforcement: ' + enforcementLabel">
                  {{ enforcementIcon }} {{ enforcementLabel }}
                </span>
              </template>
              <template v-else>
                <span class="category-badge">{{ $categoryLabel(item.category) }}</span>
                <span class="cert-badge" :class="item.certification_available ? 'cert-badge--yes' : 'cert-badge--no'">
                  {{ item.certification_available ? 'Certifiable' : 'Framework / Guideline' }}
                </span>
              </template>
            </div>
          </div>
          <button class="modal-close" @click="$closeItem()" aria-label="Close">✕</button>
        </div>

        <!-- Tab bar (regulation with structured reqs gets multiple tabs) -->
        <div class="modal-tabs" v-if="isReg && hasTabs">
          <button
            v-for="tab in visibleTabs" :key="tab.id"
            class="modal-tab"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >{{ tab.label }}</button>
        </div>

        <!-- Body -->
        <div class="modal-body">

          <!-- ── Tab: Overview ── -->
          <template v-if="activeTab === 'overview'">

            <!-- Summary -->
            <div class="modal-section">
              <div class="modal-section-title">Summary</div>
              <p class="modal-summary">{{ item.summary }}</p>
            </div>

            <!-- Meta grid -->
            <div class="modal-section">
              <div class="modal-section-title">Details</div>
              <div class="modal-meta-grid">
                <template v-if="isReg">
                  <div class="modal-meta-item">
                    <span class="modal-meta-key">Jurisdiction</span>
                    <span class="modal-meta-val">{{ item.jurisdiction }}</span>
                  </div>
                  <div class="modal-meta-item">
                    <span class="modal-meta-key">Effective Date</span>
                    <span class="modal-meta-val">{{ formatDate(item.effective_date) }}</span>
                  </div>
                  <div class="modal-meta-item">
                    <span class="modal-meta-key">Authority</span>
                    <span class="modal-meta-val">{{ item.authority }}</span>
                  </div>
                  <div class="modal-meta-item">
                    <span class="modal-meta-key">Countries Covered</span>
                    <span class="modal-meta-val">{{ item.geography.countries.length }} countries</span>
                  </div>
                </template>
                <template v-else>
                  <div class="modal-meta-item">
                    <span class="modal-meta-key">Issuing Body</span>
                    <span class="modal-meta-val">{{ item.issuing_body }}</span>
                  </div>
                  <div class="modal-meta-item">
                    <span class="modal-meta-key">Type</span>
                    <span class="modal-meta-val">{{ capitalize(item.type) }}</span>
                  </div>
                  <div class="modal-meta-item">
                    <span class="modal-meta-key">Certification</span>
                    <span class="modal-meta-val">{{ item.certification_available ? 'Available' : 'Not applicable' }}</span>
                  </div>
                  <div class="modal-meta-item" v-if="item.recertification_cycle_years">
                    <span class="modal-meta-key">Renewal Cycle</span>
                    <span class="modal-meta-val">Every {{ item.recertification_cycle_years }} year(s)</span>
                  </div>
                </template>
              </div>
            </div>

            <!-- Key requirements (simple strings or structured objects) -->
            <div class="modal-section">
              <div class="modal-section-title" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                <span>{{ isReg ? 'Key Requirements' : 'Key Controls / Domains' }}</span>
                <div style="display:flex;gap:6px;" v-if="isReg && item.key_requirements && item.key_requirements.length">
                  <div style="position:relative;">
                    <button class="btn-checklist-trigger" @click="checklistMenuOpen = !checklistMenuOpen">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 11 12 14 22 4"/>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                      Generate Checklist
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div v-if="checklistMenuOpen" class="checklist-menu" v-click-outside="() => checklistMenuOpen = false">
                      <button @click="exportChecklist('csv')">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Download CSV
                      </button>
                      <button @click="exportChecklist('html')">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download HTML
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Structured requirements -->
              <div v-if="isReg && hasStructuredReqs" class="req-structured-list">
                <div v-for="req in item.key_requirements" :key="req.id" class="req-structured-item">
                  <div class="req-structured-item__header">
                    <span class="req-id">{{ req.id }}</span>
                    <span class="req-theme" :class="'req-theme--' + req.control_theme">{{ themeLabel(req.control_theme) }}</span>
                  </div>
                  <div class="req-structured-item__text">{{ req.text }}</div>
                  <div v-if="req.consequence" class="req-structured-item__consequence">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {{ req.consequence }}
                  </div>
                  <div v-if="req.evidence_guide" class="req-structured-item__evidence">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <strong>Evidence:</strong> {{ req.evidence_guide }}
                  </div>
                </div>
              </div>

              <!-- Plain string requirements -->
              <ul class="modal-req-list" v-else-if="isReg">
                <li v-for="req in item.key_requirements" :key="req">{{ req }}</li>
              </ul>

              <!-- Standard controls -->
              <div class="modal-controls-list" v-else>
                <div class="modal-control-item" v-for="ctrl in item.key_controls" :key="ctrl">{{ ctrl }}</div>
              </div>
            </div>

            <!-- Penalties -->
            <div class="modal-section" v-if="isReg && item.penalties">
              <div class="modal-section-title">Penalties</div>
              <div class="modal-penalties">⚠ {{ item.penalties }}</div>
            </div>

            <!-- Cross-references -->
            <div class="modal-section" v-if="crossRefs.length">
              <div class="modal-section-title">
                {{ isReg ? 'Standards That Help Satisfy This Regulation' : 'Regulations This Standard Helps Satisfy' }}
              </div>
              <div class="modal-crossrefs">
                <div v-for="ref in crossRefs" :key="ref.id" class="crossref-item" @click="$openItem(ref.item, ref.type)">
                  <span class="coverage-dot" :class="'coverage-' + ref.coverage_level"></span>
                  <div>
                    <div class="crossref-item__name">{{ ref.short_name }}</div>
                    <div class="crossref-item__desc">
                      <span :class="'coverage-label-' + ref.coverage_level">{{ capitalize(ref.coverage_level) }} coverage</span>
                      — {{ ref.notes }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent news updates (Feature J) -->
            <div class="modal-section" v-if="isReg && recentNews.length">
              <div class="modal-section-title">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;margin-right:5px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Recent News (last 30 days)
              </div>
              <div class="modal-news-updates">
                <a v-for="ni in recentNews" :key="ni.id" :href="ni.url" target="_blank" rel="noopener" class="modal-news-update-item">
                  <div class="modal-news-update-source">{{ ni.source }} · {{ ni.published }}</div>
                  <div class="modal-news-update-title">{{ ni.title }}</div>
                </a>
              </div>
            </div>

            <!-- External link -->
            <div class="modal-section">
              <a :href="item.url" target="_blank" rel="noopener" class="btn-external">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                View Official Document
              </a>
            </div>
          </template>

          <!-- ── Tab: Timeline / Milestones ── -->
          <template v-if="activeTab === 'timeline'">
            <div class="modal-section">
              <div class="modal-section-title">Implementation Timeline</div>
              <p style="font-size:12px;color:var(--color-text-muted);margin:0 0 16px;">
                Key dates and phased obligations for {{ item.short_name }}.
              </p>
              <div class="milestone-timeline">
                <div
                  v-for="(ms, i) in item.milestones"
                  :key="i"
                  class="milestone-item"
                  :class="'milestone-item--' + ms.status"
                >
                  <div class="milestone-dot"></div>
                  <div class="milestone-body">
                    <div class="milestone-date">{{ formatDate(ms.date) }}</div>
                    <div class="milestone-label">{{ ms.label }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>

        </div>
      </div>
    </div>
  `,

  data() {
    return {
      activeTab: 'overview',
      checklistMenuOpen: false
    };
  },

  computed: {
    item() { return this.$s.selectedItem; },
    isReg() { return this.$s.selectedItemType === 'regulation'; },
    hasStructuredReqs() {
      const r = this.item?.key_requirements;
      return r && r.length > 0 && typeof r[0] === 'object';
    },
    hasTabs() {
      return this.isReg && (this.item?.milestones?.length > 0);
    },
    visibleTabs() {
      const tabs = [{ id: 'overview', label: 'Overview' }];
      if (this.item?.milestones?.length) tabs.push({ id: 'timeline', label: `Timeline (${this.item.milestones.length})` });
      return tabs;
    },
    enforcementLabel() {
      return ['', 'Nascent', 'Active', 'High'][this.item?.enforcement_intensity || 0] || '';
    },
    enforcementIcon() {
      return ['', '○', '◑', '●'][this.item?.enforcement_intensity || 0] || '';
    },
    recentNews() {
      if (!this.isReg || !this.item) return [];
      const news = this.$s.news;
      if (!news || !news.length) return [];
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const searchTerms = [
        this.item.short_name.toLowerCase(),
        ...this.item.short_name.toLowerCase().split(/\s+/).filter(w => w.length > 3)
      ];
      return news.filter(n => {
        if (!n.published || new Date(n.published) < cutoff) return false;
        const text = ((n.title || '') + ' ' + (n.summary || '')).toLowerCase();
        return searchTerms.some(t => text.includes(t));
      }).slice(0, 5);
    },
    crossRefs() {
      if (!this.item) return [];
      const { mappings, regulations, standards } = this.$s;
      if (this.isReg) {
        return mappings
          .filter(m => m.regulation_id === this.item.id)
          .map(m => {
            const std = standards.find(s => s.id === m.standard_id);
            return std ? { id: m.standard_id, short_name: std.short_name, coverage_level: m.coverage_level, notes: m.notes, item: std, type: 'standard' } : null;
          })
          .filter(Boolean)
          .sort((a, b) => ({ full:0, substantial:1, partial:2, minimal:3 }[a.coverage_level]||4) - ({ full:0, substantial:1, partial:2, minimal:3 }[b.coverage_level]||4));
      } else {
        return mappings
          .filter(m => m.standard_id === this.item.id)
          .map(m => {
            const reg = regulations.find(r => r.id === m.regulation_id);
            return reg ? { id: m.regulation_id, short_name: reg.short_name, coverage_level: m.coverage_level, notes: m.notes, item: reg, type: 'regulation' } : null;
          })
          .filter(Boolean)
          .sort((a, b) => ({ full:0, substantial:1, partial:2, minimal:3 }[a.coverage_level]||4) - ({ full:0, substantial:1, partial:2, minimal:3 }[b.coverage_level]||4));
      }
    }
  },

  watch: {
    '$s.selectedItem'() {
      this.activeTab = 'overview';
      this.checklistMenuOpen = false;
    }
  },

  mounted() {
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this.onKey);
    document.addEventListener('click', this.onOutsideClick);
  },
  beforeUnmount() {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this.onKey);
    document.removeEventListener('click', this.onOutsideClick);
  },

  methods: {
    capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; },
    formatDate(d) {
      if (!d) return '—';
      return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    onKey(e) { if (e.key === 'Escape') this.$closeItem(); },
    onOutsideClick(e) {
      if (!e.target.closest('.checklist-menu') && !e.target.closest('.btn-checklist-trigger')) {
        this.checklistMenuOpen = false;
      }
    },
    themeLabel(t) {
      return {
        data_governance:'Data Governance', access_control:'Access Control', incident_response:'Incident Response',
        vendor_management:'Vendor Mgmt', training_awareness:'Training', technical_controls:'Technical Controls',
        policy_procedures:'Policy', risk_assessment:'Risk Assessment', board_governance:'Board Governance',
        financial_controls:'Financial Controls'
      }[t] || t;
    },

    /* ── Feature E: Checklist Generator ── */
    exportChecklist(format) {
      this.checklistMenuOpen = false;
      const reg = this.item;
      const reqs = reg.key_requirements || [];
      const today = new Date().toISOString().slice(0, 10);
      const orgName = '[ Organisation Name ]';

      if (format === 'csv') {
        const rows = [
          [reg.short_name + ' Compliance Checklist', '', '', '', '', '', ''],
          ['Generated:', today, '', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['Req #', 'Requirement', 'Control Theme', 'Status', 'Finding / Notes', 'Evidence Reference', 'Owner']
        ];
        reqs.forEach((req, i) => {
          const text = typeof req === 'object' ? req.text : req;
          const theme = typeof req === 'object' ? this.themeLabel(req.control_theme) : '';
          const id = typeof req === 'object' ? req.id : (reg.short_name + '-R' + String(i + 1).padStart(3, '0'));
          rows.push([id, text, theme, '', '', '', '']);
        });
        const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
        this._download(csv, `${reg.short_name}-checklist-${today}.csv`, 'text/csv');

      } else {
        const rowsHtml = reqs.map((req, i) => {
          const text = typeof req === 'object' ? req.text : req;
          const theme = typeof req === 'object' ? this.themeLabel(req.control_theme) : '';
          const id = typeof req === 'object' ? req.id : (reg.short_name + '-R' + String(i + 1).padStart(3, '0'));
          const consequence = typeof req === 'object' && req.consequence ? `<div style="font-size:11px;color:#b91c1c;margin-top:4px;">⚠ ${req.consequence}</div>` : '';
          const evidence = typeof req === 'object' && req.evidence_guide ? `<div style="font-size:11px;color:#0369a1;margin-top:3px;">📄 ${req.evidence_guide}</div>` : '';
          return `
            <tr>
              <td style="font-weight:600;font-size:11px;color:#64748b;white-space:nowrap;">${id}</td>
              <td>${text}${consequence}${evidence}</td>
              <td style="font-size:11px;color:#64748b;">${theme}</td>
              <td style="text-align:center;">☐</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>`;
        }).join('');

        const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>${reg.short_name} Compliance Checklist</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1e293b;margin:0;padding:24px;}
  h1{font-size:20px;margin:0 0 4px;}
  .meta{font-size:12px;color:#64748b;margin-bottom:20px;}
  table{width:100%;border-collapse:collapse;font-size:12px;}
  thead tr{background:#0f172a;color:#fff;}
  thead th{padding:8px 10px;text-align:left;font-weight:600;font-size:11px;}
  tbody tr:nth-child(even){background:#f8fafc;}
  tbody td{padding:8px 10px;vertical-align:top;border-bottom:1px solid #e2e8f0;}
  .footer{margin-top:20px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px;}
  @media print{body{padding:10px;}thead tr{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
</style></head><body>
<h1>${reg.name}</h1>
<div class="meta">
  ${orgName} &nbsp;·&nbsp; Checklist generated: ${today} &nbsp;·&nbsp;
  Authority: ${reg.authority || '—'} &nbsp;·&nbsp; Penalties: ${reg.penalties || '—'}
</div>
<table>
  <thead><tr>
    <th style="width:90px;">Req #</th>
    <th>Requirement</th>
    <th style="width:110px;">Theme</th>
    <th style="width:50px;">Status</th>
    <th style="width:140px;">Finding / Notes</th>
    <th style="width:130px;">Evidence Ref</th>
    <th style="width:90px;">Owner</th>
  </tr></thead>
  <tbody>${rowsHtml}</tbody>
</table>
<div class="footer">
  Generated by ComplianceMap &nbsp;·&nbsp; ${reg.short_name} &nbsp;·&nbsp; ${reg.jurisdiction}
</div>
</body></html>`;
        this._download(html, `${reg.short_name}-checklist-${today}.html`, 'text/html');
      }
    },

    _download(content, filename, type) {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    }
  }
};
