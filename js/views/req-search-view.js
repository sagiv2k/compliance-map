/* Global Requirement Search — search across all requirements in all regulations */
const ReqSearchView = {
  template: `
    <div>
      <div class="view-header">
        <h1 class="view-title">Requirement Search</h1>
        <p class="view-subtitle">Search across {{ totalReqs }} requirements from {{ $s.regulations.length }} regulations.</p>
      </div>

      <!-- Search Bar -->
      <div class="rs-search-bar">
        <div class="rs-search-input-wrap">
          <svg class="rs-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            class="rs-search-input"
            type="text"
            v-model="query"
            placeholder="Search by keyword, obligation, control, or evidence…"
            ref="searchInput"
            @input="onInput"
          />
          <button v-if="query" class="rs-clear-btn" @click="query=''; page=1" title="Clear search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Filters row -->
        <div class="rs-filters">
          <select class="rs-filter-sel" v-model="filterTheme">
            <option value="">All Control Themes</option>
            <option v-for="t in THEMES" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>

          <select class="rs-filter-sel" v-model="filterStatus">
            <option value="">All Statuses</option>
            <option value="implemented">Implemented</option>
            <option value="in_progress">In Progress</option>
            <option value="not_started">Not Started</option>
            <option value="na">N/A</option>
          </select>

          <select class="rs-filter-sel" v-model="filterReg">
            <option value="">All Regulations</option>
            <option v-for="r in $s.regulations" :key="r.id" :value="r.id">{{ r.short_name }}</option>
          </select>

          <button
            v-if="filterTheme || filterStatus || filterReg"
            class="rs-clear-filters"
            @click="filterTheme=''; filterStatus=''; filterReg=''; page=1"
          >Clear filters</button>
        </div>
      </div>

      <!-- Results summary -->
      <div class="rs-summary" v-if="!loading">
        <span v-if="query || filterTheme || filterStatus || filterReg">
          <strong>{{ filteredResults.length }}</strong> requirement{{ filteredResults.length !== 1 ? 's' : '' }} found
          <span v-if="filteredResults.length > pageSize"> — showing {{ pageStart + 1 }}–{{ pageEnd }} of {{ filteredResults.length }}</span>
        </span>
        <span v-else>
          Showing <strong>{{ pageEnd }}</strong> of <strong>{{ totalReqs }}</strong> requirements
        </span>
        <span class="rs-summary-hint">Click a row to open the regulation</span>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="rs-loading">
        <div class="spinner"></div>
        <span>Building requirement index…</span>
      </div>

      <!-- No results -->
      <div v-else-if="filteredResults.length === 0" class="rs-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p>No requirements match "<strong>{{ query }}</strong>"</p>
        <p style="font-size:13px;color:#94a3b8;">Try a broader term or remove filters</p>
      </div>

      <!-- Results table -->
      <div v-else class="rs-table-wrap">
        <table class="rs-table">
          <thead>
            <tr>
              <th class="rs-th rs-th--status" @click="sortBy('status')">Status {{ sortIcon('status') }}</th>
              <th class="rs-th rs-th--reg" @click="sortBy('reg')">Regulation {{ sortIcon('reg') }}</th>
              <th class="rs-th rs-th--title" @click="sortBy('title')">Requirement {{ sortIcon('title') }}</th>
              <th class="rs-th rs-th--theme" @click="sortBy('theme')">Control Theme {{ sortIcon('theme') }}</th>
              <th class="rs-th rs-th--evidence">Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in pagedResults"
              :key="item.req.id + item.reg.id"
              class="rs-row"
              @click="openReg(item.reg)"
              :title="'Open ' + item.reg.name"
            >
              <!-- Status -->
              <td class="rs-td rs-td--status">
                <span class="rs-status-chip" :class="'rs-status--' + item.status">
                  {{ statusLabel(item.status) }}
                </span>
              </td>

              <!-- Regulation -->
              <td class="rs-td rs-td--reg">
                <span class="rs-reg-badge" :style="{ background: regColor(item.reg) + '18', color: regColor(item.reg), borderColor: regColor(item.reg) + '40' }">
                  {{ item.reg.short_name }}
                </span>
              </td>

              <!-- Requirement title + text preview -->
              <td class="rs-td rs-td--title">
                <div class="rs-req-title" v-html="highlight(item.req.title || item.req.id)"></div>
                <div class="rs-req-text" v-html="highlight(truncate(item.req.text || '', 110))"></div>
              </td>

              <!-- Control theme -->
              <td class="rs-td rs-td--theme">
                <span v-if="item.req.control_theme" class="rs-theme-chip" :style="themeStyle(item.req.control_theme)">
                  {{ themeLabel(item.req.control_theme) }}
                </span>
              </td>

              <!-- Evidence count -->
              <td class="rs-td rs-td--evidence">
                <span v-if="evidenceCount(item.req.id) > 0" class="rs-ev-count">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  {{ evidenceCount(item.req.id) }}
                </span>
                <span v-else class="rs-no-ev">—</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="rs-pagination">
          <button class="rs-page-btn" :disabled="page === 1" @click="page--">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Prev
          </button>
          <span class="rs-page-info">Page {{ page }} of {{ totalPages }}</span>
          <button class="rs-page-btn" :disabled="page === totalPages" @click="page++">
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      query:        '',
      filterTheme:  '',
      filterStatus: '',
      filterReg:    '',
      sortCol:      'reg',
      sortDir:      'asc',
      page:         1,
      pageSize:     50,
      loading:      false,

      THEMES: [
        { value: 'access_control',    label: 'Access Control' },
        { value: 'board_governance',  label: 'Board Governance' },
        { value: 'data_governance',   label: 'Data Governance' },
        { value: 'financial_controls',label: 'Financial Controls' },
        { value: 'incident_response', label: 'Incident Response' },
        { value: 'policy_procedures', label: 'Policy & Procedures' },
        { value: 'risk_assessment',   label: 'Risk Assessment' },
        { value: 'technical_controls',label: 'Technical Controls' },
        { value: 'training_awareness',label: 'Training & Awareness' },
        { value: 'vendor_management', label: 'Vendor Management' }
      ],

      THEME_COLORS: {
        access_control:     '#7c3aed',
        board_governance:   '#1d4ed8',
        data_governance:    '#0e7490',
        financial_controls: '#059669',
        incident_response:  '#dc2626',
        policy_procedures:  '#92400e',
        risk_assessment:    '#d97706',
        technical_controls: '#4f46e5',
        training_awareness: '#0891b2',
        vendor_management:  '#6d28d9'
      }
    };
  },

  computed: {
    totalReqs() {
      return this.allRequirements.length;
    },

    allRequirements() {
      const cs = this.$s.complianceStatus;
      const result = [];
      for (const reg of this.$s.regulations) {
        const reqs = (reg.key_requirements || []).filter(r => typeof r === 'object');
        for (const req of reqs) {
          result.push({
            req,
            reg,
            status: cs[req.id] || 'not_started'
          });
        }
      }
      return result;
    },

    filteredResults() {
      const q = this.query.toLowerCase().trim();
      let items = this.allRequirements;

      if (q) {
        items = items.filter(item => {
          const req = item.req;
          return (
            (req.title || '').toLowerCase().includes(q) ||
            (req.text  || '').toLowerCase().includes(q) ||
            (req.control_theme || '').toLowerCase().includes(q) ||
            (req.consequence || '').toLowerCase().includes(q) ||
            (req.how_to_meet || '').toLowerCase().includes(q) ||
            (req.evidence_guide || '').toLowerCase().includes(q) ||
            (req.compliance_evidence || '').toLowerCase().includes(q) ||
            (req.id || '').toLowerCase().includes(q) ||
            item.reg.short_name.toLowerCase().includes(q) ||
            item.reg.name.toLowerCase().includes(q)
          );
        });
      }

      if (this.filterTheme) {
        items = items.filter(item => item.req.control_theme === this.filterTheme);
      }

      if (this.filterStatus) {
        items = items.filter(item => item.status === this.filterStatus);
      }

      if (this.filterReg) {
        items = items.filter(item => item.reg.id === this.filterReg);
      }

      // Sort
      const col = this.sortCol;
      const dir = this.sortDir === 'asc' ? 1 : -1;
      items = [...items].sort((a, b) => {
        let va, vb;
        if (col === 'status') {
          const ORDER = { implemented: 0, in_progress: 1, not_started: 2, na: 3 };
          va = ORDER[a.status] ?? 2;
          vb = ORDER[b.status] ?? 2;
        } else if (col === 'reg') {
          va = a.reg.short_name;
          vb = b.reg.short_name;
        } else if (col === 'title') {
          va = (a.req.title || a.req.id || '').toLowerCase();
          vb = (b.req.title || b.req.id || '').toLowerCase();
        } else if (col === 'theme') {
          va = a.req.control_theme || '';
          vb = b.req.control_theme || '';
        } else {
          return 0;
        }
        if (va < vb) return -dir;
        if (va > vb) return dir;
        return 0;
      });

      return items;
    },

    pageStart() { return (this.page - 1) * this.pageSize; },
    pageEnd()   { return Math.min(this.page * this.pageSize, this.filteredResults.length); },
    totalPages() { return Math.max(1, Math.ceil(this.filteredResults.length / this.pageSize)); },
    pagedResults() {
      return this.filteredResults.slice(this.pageStart, this.pageEnd);
    }
  },

  watch: {
    query()        { this.page = 1; },
    filterTheme()  { this.page = 1; },
    filterStatus() { this.page = 1; },
    filterReg()    { this.page = 1; }
  },

  mounted() {
    this.$nextTick(() => {
      if (this.$refs.searchInput) this.$refs.searchInput.focus();
    });
  },

  methods: {
    onInput() { /* v-model handles reactivity */ },

    openReg(reg) {
      this.$openItem(reg, 'regulation');
    },

    statusLabel(s) {
      return { implemented: 'Done', in_progress: 'In Progress', not_started: 'Not Started', na: 'N/A' }[s] || s;
    },

    themeLabel(t) {
      return this.THEMES.find(x => x.value === t)?.label || t;
    },

    themeStyle(t) {
      const c = this.THEME_COLORS[t] || '#64748b';
      return { background: c + '15', color: c, borderColor: c + '35' };
    },

    regColor(reg) {
      const jcEntry = this.$jc[reg.enforcement_region];
      return jcEntry?.color || '#64748b';
    },

    evidenceCount(reqId) {
      return (this.$s.reqEvidence[reqId] || []).length;
    },

    truncate(text, max) {
      if (text.length <= max) return text;
      return text.slice(0, max) + '…';
    },

    highlight(text) {
      if (!this.query.trim()) return text;
      const q = this.query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return text.replace(new RegExp(`(${q})`, 'gi'), '<mark class="rs-highlight">$1</mark>');
    },

    sortBy(col) {
      if (this.sortCol === col) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortCol = col;
        this.sortDir = 'asc';
      }
    },

    sortIcon(col) {
      if (this.sortCol !== col) return '↕';
      return this.sortDir === 'asc' ? '↑' : '↓';
    }
  }
};
