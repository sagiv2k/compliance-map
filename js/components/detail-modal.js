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

                <!-- Status progress summary bar -->
                <div class="req-status-summary" v-if="statusSummary.total > 0">
                  <div class="req-status-summary__bar">
                    <div class="req-status-summary__fill req-status-summary__fill--impl" :style="{width: (statusSummary.implemented / statusSummary.total * 100) + '%'}"></div>
                    <div class="req-status-summary__fill req-status-summary__fill--prog" :style="{width: (statusSummary.in_progress / statusSummary.total * 100) + '%', left: (statusSummary.implemented / statusSummary.total * 100) + '%'}"></div>
                  </div>
                  <div class="req-status-summary__labels">
                    <span class="req-status-label--impl">{{ statusSummary.implemented }} implemented</span>
                    <span class="req-status-label--prog" v-if="statusSummary.in_progress">{{ statusSummary.in_progress }} in progress</span>
                    <span class="req-status-label--gap">{{ statusSummary.not_started }} not started</span>
                    <span class="req-status-label--total">of {{ statusSummary.total }}</span>
                  </div>
                </div>

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

                  <!-- Status selector -->
                  <div class="req-status-row" @click.stop>
                    <div class="req-status-pills">
                      <button
                        v-for="opt in statusOptions" :key="opt.value"
                        class="req-status-pill"
                        :class="['req-status-pill--' + opt.value, { active: $getReqStatus(req.id) === opt.value }]"
                        @click="$setReqStatus(req.id, opt.value)"
                      >{{ opt.label }}</button>
                    </div>
                  </div>

                  <!-- Evidence linking (shown when status is tracked) -->
                  <div class="req-evidence-section" v-if="$getReqStatus(req.id) !== 'not_started'" @click.stop>
                    <div class="req-evidence-list" v-if="$getReqEvidence(req.id).length">
                      <div v-for="(ev, evIdx) in $getReqEvidence(req.id)" :key="evIdx" class="req-evidence-item">
                        <span class="req-evidence-type">{{ ev.type === 'url' ? '🔗' : '📝' }}</span>
                        <a v-if="ev.type === 'url'" :href="ev.value" target="_blank" rel="noopener" class="req-evidence-link">{{ ev.value }}</a>
                        <span v-else class="req-evidence-note">{{ ev.value }}</span>
                        <button class="req-evidence-remove" @click="removeEv(req.id, evIdx)" title="Remove">✕</button>
                      </div>
                    </div>
                    <div class="req-evidence-add-row">
                      <input
                        type="text"
                        class="req-evidence-input"
                        :value="evidenceInputs[req.id] || ''"
                        @input="evidenceInputs[req.id] = $event.target.value"
                        placeholder="Add URL or note as evidence…"
                        @keyup.enter="addEv(req.id)"
                      />
                      <button class="req-evidence-add-btn" @click="addEv(req.id)" :disabled="!(evidenceInputs[req.id] || '').trim()">+ Add</button>
                    </div>
                  </div>

                  <!-- Guidance toggle (only shown after enrichment) -->
                  <button
                    v-if="req.how_to_meet || req.vendor_actions"
                    class="req-guidance-toggle"
                    @click="toggleReqGuidance(req.id)"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline :points="expandedReqs[req.id] ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
                    </svg>
                    {{ expandedReqs[req.id] ? 'Hide guidance' : 'Show compliance guidance' }}
                  </button>

                  <!-- Guidance grid (2×2) -->
                  <div v-if="expandedReqs[req.id]" class="req-guidance-grid">
                    <div v-if="req.how_to_meet" class="req-guidance-cell req-guidance-cell--how">
                      <div class="req-guidance-cell__label">📋 How to Meet</div>
                      <div class="req-guidance-cell__text">{{ req.how_to_meet }}</div>
                    </div>
                    <div v-if="req.internal_actions" class="req-guidance-cell req-guidance-cell--internal">
                      <div class="req-guidance-cell__label">🏢 Internal Actions</div>
                      <div class="req-guidance-cell__text">{{ req.internal_actions }}</div>
                    </div>
                    <div v-if="req.vendor_actions" class="req-guidance-cell req-guidance-cell--vendor">
                      <div class="req-guidance-cell__label">🤝 Vendor Actions</div>
                      <div class="req-guidance-cell__text">{{ req.vendor_actions }}</div>
                    </div>
                    <div v-if="req.compliance_evidence" class="req-guidance-cell req-guidance-cell--evidence">
                      <div class="req-guidance-cell__label">✅ Compliance Evidence</div>
                      <div class="req-guidance-cell__text">{{ req.compliance_evidence }}</div>
                    </div>
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

            <!-- Policy Documents -->
            <div class="modal-section" v-if="isReg" @click.stop>
              <div class="modal-section-title" style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <span>Policy Documents</span>
                <button class="btn-add-policy" @click="showAddPolicy = !showAddPolicy">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Link Policy
                </button>
              </div>
              <div class="policy-empty" v-if="!linkedPolicies.length && !showAddPolicy">
                No policies linked. Connect internal documents to track coverage.
              </div>
              <div class="policy-list" v-if="linkedPolicies.length">
                <div v-for="pol in linkedPolicies" :key="pol.id" class="policy-item">
                  <div class="policy-item__info">
                    <a v-if="pol.url" :href="pol.url" target="_blank" rel="noopener" class="policy-item__name">{{ pol.name }}</a>
                    <span v-else class="policy-item__name">{{ pol.name }}</span>
                    <span class="policy-item__owner" v-if="pol.owner">Owner: {{ pol.owner }}</span>
                    <span class="policy-item__date" v-if="pol.last_reviewed">Reviewed: {{ pol.last_reviewed }}</span>
                  </div>
                  <button class="policy-item__remove" @click="removePolicy(pol.id)" title="Remove">✕</button>
                </div>
              </div>
              <div class="policy-add-form" v-if="showAddPolicy">
                <div class="policy-form-row">
                  <input type="text" v-model="newPolicy.name" class="policy-input" placeholder="Policy name (required)" />
                  <input type="text" v-model="newPolicy.url" class="policy-input" placeholder="URL or file path (optional)" />
                  <input type="text" v-model="newPolicy.owner" class="policy-input" placeholder="Owner / team" />
                  <input type="date" v-model="newPolicy.last_reviewed" class="policy-input" />
                </div>
                <div class="policy-form-btns">
                  <button class="policy-btn-save" @click="addPolicy" :disabled="!newPolicy.name.trim()">Add Policy</button>
                  <button class="policy-btn-cancel" @click="showAddPolicy = false">Cancel</button>
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
      checklistMenuOpen: false,
      expandedReqs: {},
      evidenceInputs: {},
      showAddPolicy: false,
      newPolicy: { name: '', url: '', owner: '', last_reviewed: '' },
      statusOptions: [
        { value: 'not_started', label: 'Not Started' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'implemented', label: 'Implemented' },
        { value: 'na',          label: 'N/A' }
      ]
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
    statusSummary() {
      if (!this.hasStructuredReqs) return { total: 0, implemented: 0, in_progress: 0, not_started: 0 };
      const reqs  = this.item.key_requirements.filter(r => typeof r === 'object');
      const cs    = this.$s.complianceStatus;
      const impl  = reqs.filter(r => cs[r.id] === 'implemented').length;
      const prog  = reqs.filter(r => cs[r.id] === 'in_progress').length;
      const na    = reqs.filter(r => cs[r.id] === 'na').length;
      return { total: reqs.length, implemented: impl, in_progress: prog, not_started: reqs.length - impl - prog - na };
    },
    linkedPolicies() {
      if (!this.isReg || !this.item) return [];
      const regId = this.item.id;
      return (this.$s.policies || []).filter(p => p.linked_reg_ids && p.linked_reg_ids.includes(regId));
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
      this.expandedReqs = {};
      this.evidenceInputs = {};
      this.showAddPolicy = false;
      this.newPolicy = { name: '', url: '', owner: '', last_reviewed: '' };
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

    toggleReqGuidance(id) {
      this.expandedReqs = { ...this.expandedReqs, [id]: !this.expandedReqs[id] };
    },

    addEv(reqId) {
      const val = (this.evidenceInputs[reqId] || '').trim();
      if (!val) return;
      const type = /^https?:\/\//.test(val) ? 'url' : 'note';
      this.$addReqEvidence(reqId, { type, value: val, date: new Date().toISOString().slice(0, 10) });
      this.evidenceInputs[reqId] = '';
    },
    removeEv(reqId, idx) {
      this.$removeReqEvidence(reqId, idx);
    },

    addPolicy() {
      const n = this.newPolicy;
      if (!n.name.trim()) return;
      const pol = {
        id: Date.now() + '-' + Math.random().toString(36).slice(2),
        name: n.name.trim(), url: n.url.trim(), owner: n.owner.trim(),
        last_reviewed: n.last_reviewed, linked_reg_ids: [this.item.id]
      };
      this.$s.policies.push(pol);
      try { localStorage.setItem('cm_policies', JSON.stringify(this.$s.policies)); } catch {}
      this.newPolicy = { name: '', url: '', owner: '', last_reviewed: '' };
      this.showAddPolicy = false;
    },
    removePolicy(polId) {
      const idx = this.$s.policies.findIndex(p => p.id === polId);
      if (idx !== -1) {
        this.$s.policies.splice(idx, 1);
        try { localStorage.setItem('cm_policies', JSON.stringify(this.$s.policies)); } catch {}
      }
    },

    /* ── Feature E: Checklist Generator ── */
    exportChecklist(format) {
      this.checklistMenuOpen = false;
      const reg  = this.item;
      const reqs = reg.key_requirements || [];
      const today   = new Date().toISOString().slice(0, 10);
      const orgName = '[ Organisation Name ]';
      const esc = s => '"' + String(s || '').replace(/"/g, '""') + '"';

      if (format === 'csv') {
        const cols = ['Req #', 'Requirement', 'Control Theme',
                      'How to Meet', 'Internal Actions', 'Vendor Actions', 'Compliance Evidence',
                      'Status', 'Finding / Notes', 'Evidence Collected', 'Owner'];
        const rows = [
          [reg.short_name + ' Compliance Checklist — Enhanced', ...Array(cols.length - 1).fill('')],
          ['Generated:', today, ...Array(cols.length - 2).fill('')],
          Array(cols.length).fill(''),
          cols
        ];
        reqs.forEach((req, i) => {
          const isObj = typeof req === 'object';
          rows.push([
            isObj ? req.id : (reg.short_name + '-R' + String(i + 1).padStart(3, '0')),
            isObj ? req.text : req,
            isObj ? this.themeLabel(req.control_theme) : '',
            isObj ? (req.how_to_meet       || '') : '',
            isObj ? (req.internal_actions  || '') : '',
            isObj ? (req.vendor_actions    || '') : '',
            isObj ? (req.compliance_evidence || '') : '',
            isObj ? this.$getReqStatus(req.id) : '',
            '',
            isObj ? (this.$getReqEvidence(req.id) || []).map(e => e.value).join(' | ') : '',
            ''
          ]);
        });
        const csv = rows.map(r => r.map(esc).join(',')).join('\n');
        this._download(csv, `${reg.short_name}-checklist-${today}.csv`, 'text/csv');

      } else {
        const rowsHtml = reqs.map((req, i) => {
          const isObj    = typeof req === 'object';
          const text     = isObj ? req.text : req;
          const theme    = isObj ? this.themeLabel(req.control_theme) : '';
          const id       = isObj ? req.id : (reg.short_name + '-R' + String(i + 1).padStart(3, '0'));
          const conseq   = isObj && req.consequence
            ? `<div style="font-size:11px;color:#b91c1c;margin-top:4px;">⚠ ${req.consequence}</div>` : '';
          const evGuide  = isObj && req.evidence_guide
            ? `<div style="font-size:11px;color:#0369a1;margin-top:3px;">📄 ${req.evidence_guide}</div>` : '';

          const hasGuidance = isObj && (req.how_to_meet || req.internal_actions || req.vendor_actions || req.compliance_evidence);
          const guidanceRow = hasGuidance ? `
            <tr class="guidance-row">
              <td colspan="7" style="padding:0 10px 12px 30px;background:#f0f9ff;border-bottom:2px solid #bfdbfe;">
                <div class="guidance-grid">
                  ${req.how_to_meet ? `<div class="gc gc--how"><div class="gc__label">📋 HOW TO MEET</div><div class="gc__text">${req.how_to_meet}</div></div>` : ''}
                  ${req.internal_actions ? `<div class="gc gc--internal"><div class="gc__label">🏢 INTERNAL ACTIONS</div><div class="gc__text">${req.internal_actions}</div></div>` : ''}
                  ${req.vendor_actions ? `<div class="gc gc--vendor"><div class="gc__label">🤝 VENDOR ACTIONS</div><div class="gc__text">${req.vendor_actions}</div></div>` : ''}
                  ${req.compliance_evidence ? `<div class="gc gc--evidence"><div class="gc__label">✅ COMPLIANCE EVIDENCE</div><div class="gc__text">${req.compliance_evidence}</div></div>` : ''}
                </div>
              </td>
            </tr>` : '';

          return `
            <tr class="req-row">
              <td style="font-weight:600;font-size:11px;color:#64748b;white-space:nowrap;vertical-align:top;">${id}</td>
              <td style="vertical-align:top;">${text}${conseq}${evGuide}</td>
              <td style="font-size:11px;color:#64748b;vertical-align:top;">${theme}</td>
              <td style="text-align:center;vertical-align:top;">☐</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>${guidanceRow}`;
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
  .req-row td{padding:8px 10px;vertical-align:top;border-bottom:1px solid #e2e8f0;background:#fff;}
  .req-row:nth-of-type(4n+1) td{background:#f8fafc;}
  .guidance-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px 0;}
  .gc{background:#fff;border-radius:6px;padding:10px;border:1px solid #e2e8f0;}
  .gc__label{font-size:10px;font-weight:700;letter-spacing:.05em;margin-bottom:5px;}
  .gc__text{font-size:11px;color:#1e293b;line-height:1.55;}
  .gc--how{border-color:#bfdbfe;}.gc--how .gc__label{color:#1d4ed8;}
  .gc--internal{border-color:#bbf7d0;}.gc--internal .gc__label{color:#15803d;}
  .gc--vendor{border-color:#fde68a;}.gc--vendor .gc__label{color:#92400e;}
  .gc--evidence{border-color:#d9f99d;}.gc--evidence .gc__label{color:#3d7d0a;}
  .footer{margin-top:20px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px;}
  @media print{
    body{padding:10px;}
    thead tr{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .guidance-grid{page-break-inside:avoid;}
  }
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
    <th style="width:100px;">Theme</th>
    <th style="width:50px;">Status</th>
    <th style="width:130px;">Finding / Notes</th>
    <th style="width:120px;">Evidence Collected</th>
    <th style="width:80px;">Owner</th>
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
