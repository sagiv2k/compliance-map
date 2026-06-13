/* Audit Findings Tracker — log findings, track remediation, link to requirements */
const AuditView = {
  template: `
    <div>
      <div class="view-header">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <h1 class="view-title">Audit Findings</h1>
            <p class="view-subtitle">Log internal or external audit findings, link them to compliance requirements, and track remediation to closure.</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <select class="rr-filter-sel" v-model="filterStatus">
              <option value="all">All Findings</option>
              <option value="open">Open</option>
              <option value="in_remediation">In Remediation</option>
              <option value="accepted">Risk Accepted</option>
              <option value="closed">Closed</option>
            </select>
            <select class="rr-filter-sel" v-model="filterSeverity">
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button class="vr-export-btn" @click="exportCSV" v-if="$s.auditFindings.length">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
            <button class="btn-primary" @click="openAddDialog" style="padding:8px 16px;font-size:13px;">+ Add Finding</button>
          </div>
        </div>
      </div>

      <!-- Summary row -->
      <div class="vr-summary-row" v-if="$s.auditFindings.length">
        <div class="vr-stat-card">
          <div class="vr-stat__value">{{ $s.auditFindings.length }}</div>
          <div class="vr-stat__label">Total Findings</div>
        </div>
        <div class="vr-stat-card" :class="{'vr-stat-card--alert': openCount > 0}"
          @click="filterStatus = openCount > 0 ? 'open' : 'all'" style="cursor:pointer;">
          <div class="vr-stat__value" :style="openCount > 0 ? 'color:#dc2626;' : ''">{{ openCount }}</div>
          <div class="vr-stat__label">Open</div>
        </div>
        <div class="vr-stat-card"
          @click="filterStatus = inRemCount > 0 ? 'in_remediation' : 'all'" style="cursor:pointer;">
          <div class="vr-stat__value" style="color:#d97706;">{{ inRemCount }}</div>
          <div class="vr-stat__label">In Remediation</div>
        </div>
        <div class="vr-stat-card"
          @click="filterStatus = closedCount > 0 ? 'closed' : 'all'" style="cursor:pointer;">
          <div class="vr-stat__value" style="color:#16a34a;">{{ closedCount }}</div>
          <div class="vr-stat__label">Closed</div>
        </div>
        <div class="vr-stat-card">
          <div class="vr-stat__value" style="color:#dc2626;">{{ criticalCount }}</div>
          <div class="vr-stat__label">Critical</div>
        </div>
        <div class="vr-stat-card" v-if="overdueCount > 0"
          style="border-color:#fecaca!important;cursor:pointer;" @click="filterStatus='open'">
          <div class="vr-stat__value" style="color:#dc2626;">{{ overdueCount }}</div>
          <div class="vr-stat__label">Overdue</div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!$s.auditFindings.length" class="rr-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" style="margin-bottom:12px;">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <h3 style="margin:0 0 8px;font-size:16px;font-weight:700;color:#0f172a;">No findings yet</h3>
        <p style="color:#64748b;margin:0 0 16px;max-width:420px;text-align:center;">
          Log audit findings from internal reviews, external audits, or self-assessments. Track them through to remediation and closure.
        </p>
        <button class="btn-primary" @click="openAddDialog" style="padding:10px 20px;">Log your first finding</button>
      </div>

      <!-- Findings table -->
      <template v-else>
        <table class="vr-table" v-if="filteredFindings.length">
          <thead>
            <tr>
              <th @click="sortBy('title')">Finding {{ sortIcon('title') }}</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Regulation / Requirement</th>
              <th @click="sortBy('due_date')">Due Date {{ sortIcon('due_date') }}</th>
              <th>Owner</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in filteredFindings" :key="f.id"
              :class="{'vr-row--overdue': isOverdue(f)}">
              <td>
                <div style="font-weight:600;color:#0f172a;max-width:260px;">{{ f.title }}</div>
                <div v-if="f.description" class="vr-notes-preview" :title="f.description">{{ f.description }}</div>
              </td>
              <td>
                <span class="audit-severity-badge" :class="'audit-severity-badge--' + f.severity">
                  {{ capitalize(f.severity) }}
                </span>
              </td>
              <td>
                <span class="audit-status-badge" :class="'audit-status-badge--' + f.status">
                  {{ statusLabel(f.status) }}
                </span>
              </td>
              <td>
                <div v-if="f.regulation_id" style="font-size:12px;">
                  <span class="vr-reg-tag" style="cursor:pointer;"
                    @click.stop="openReg(f.regulation_id)" :title="regName(f.regulation_id)">
                    {{ regShortName(f.regulation_id) }}
                  </span>
                </div>
                <div v-if="f.req_id" style="font-size:11px;color:#64748b;margin-top:3px;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  Req: {{ reqTitle(f.regulation_id, f.req_id) }}
                </div>
                <span v-if="!f.regulation_id" style="color:#94a3b8;font-size:12px;">—</span>
              </td>
              <td>
                <template v-if="f.due_date">
                  <div :class="isOverdue(f) ? 'vr-date--overdue' : isDueSoon(f) ? 'vr-date--soon' : 'vr-date'">
                    {{ formatDate(f.due_date) }}
                  </div>
                  <div v-if="isOverdue(f)" style="font-size:10px;font-weight:700;color:#dc2626;text-transform:uppercase;">Overdue</div>
                  <div v-else-if="isDueSoon(f)" style="font-size:10px;color:#d97706;">Due soon</div>
                </template>
                <span v-else style="color:#94a3b8;font-size:12px;">—</span>
              </td>
              <td style="font-size:12px;color:#475569;">{{ f.owner || '—' }}</td>
              <td style="white-space:nowrap;">
                <button class="rr-action-btn" @click="openEditDialog(f)" title="Edit">✏</button>
                <button class="rr-action-btn rr-action-btn--del" @click="deleteFinding(f.id)" title="Delete">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else style="text-align:center;padding:32px;color:#64748b;font-size:14px;">
          No findings match this filter.
          <button @click="filterStatus='all';filterSeverity='all'"
            style="margin-left:8px;color:#3b82f6;background:none;border:none;cursor:pointer;font-size:14px;text-decoration:underline;">
            Clear filters
          </button>
        </div>
      </template>

      <!-- Add / Edit Dialog -->
      <div v-if="dialog" class="rr-dialog-overlay" @click.self="dialog = false">
        <div class="rr-dialog" style="max-width:580px;width:100%;">
          <div class="rr-dialog__header">
            <h3>{{ editId ? 'Edit Finding' : 'Log Finding' }}</h3>
            <button class="rr-dialog__close" @click="dialog = false">✕</button>
          </div>
          <div class="rr-dialog__body">
            <div class="rr-form-row">
              <label class="rr-label">Finding Title *</label>
              <input type="text" class="rr-input" v-model="form.title"
                placeholder="e.g. Access control review not completed for GDPR Article 25" />
            </div>
            <div class="rr-form-row">
              <label class="rr-label">Description</label>
              <textarea class="rr-input" v-model="form.description" rows="2"
                placeholder="What was found? What control failed?"></textarea>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
              <div class="rr-form-row">
                <label class="rr-label">Severity</label>
                <div class="audit-severity-picker">
                  <button v-for="lvl in ['low','medium','high','critical']" :key="lvl"
                    class="audit-sev-btn"
                    :class="'audit-sev-btn--' + lvl + (form.severity === lvl ? ' active' : '')"
                    @click.prevent="form.severity = lvl">{{ capitalize(lvl) }}</button>
                </div>
              </div>
              <div class="rr-form-row">
                <label class="rr-label">Status</label>
                <select class="rr-input" v-model="form.status">
                  <option value="open">Open</option>
                  <option value="in_remediation">In Remediation</option>
                  <option value="accepted">Risk Accepted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div class="rr-form-row">
              <label class="rr-label">Linked Regulation</label>
              <select class="rr-input" v-model="form.regulation_id" @change="form.req_id = ''">
                <option value="">None</option>
                <option v-for="reg in $s.regulations" :key="reg.id" :value="reg.id">
                  {{ reg.short_name }} — {{ reg.name.slice(0, 55) }}
                </option>
              </select>
            </div>

            <div class="rr-form-row" v-if="form.regulation_id && linkedRegReqs.length">
              <label class="rr-label">Specific Requirement (optional)</label>
              <select class="rr-input" v-model="form.req_id">
                <option value="">No specific requirement</option>
                <option v-for="req in linkedRegReqs" :key="req.id" :value="req.id">
                  {{ req.title || req.id }}
                </option>
              </select>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
              <div class="rr-form-row">
                <label class="rr-label">Remediation Due Date</label>
                <input type="date" class="rr-input" v-model="form.due_date" />
              </div>
              <div class="rr-form-row">
                <label class="rr-label">Owner</label>
                <input type="text" class="rr-input" v-model="form.owner"
                  placeholder="Who is responsible for remediation?" />
              </div>
            </div>

            <div class="rr-form-row">
              <label class="rr-label">Remediation Notes</label>
              <textarea class="rr-input" v-model="form.remediation_notes" rows="2"
                placeholder="What is being done to address this finding?"></textarea>
            </div>

            <div class="rr-form-row">
              <label class="rr-label">Audit Source</label>
              <input type="text" class="rr-input" v-model="form.source"
                placeholder="e.g. Internal audit Q1 2025, ISO 27001 certification audit" />
            </div>
          </div>
          <div class="rr-dialog__footer">
            <button class="vr-cancel-btn" @click="dialog = false">Cancel</button>
            <button class="btn-primary" @click="saveFinding" :disabled="!form.title.trim()"
              style="padding:8px 20px;font-size:13px;">
              {{ editId ? 'Save Changes' : 'Log Finding' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      dialog: false,
      editId: null,
      form: {
        title: '', description: '', severity: 'medium', status: 'open',
        regulation_id: '', req_id: '', due_date: '', owner: '',
        remediation_notes: '', source: ''
      },
      sortCol: 'due_date',
      sortDir: 1,
      filterStatus: 'all',
      filterSeverity: 'all'
    };
  },

  computed: {
    todayStr() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    },
    soonStr() {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    },
    openCount()     { return (this.$s.auditFindings || []).filter(f => f.status === 'open').length; },
    inRemCount()    { return (this.$s.auditFindings || []).filter(f => f.status === 'in_remediation').length; },
    closedCount()   { return (this.$s.auditFindings || []).filter(f => f.status === 'closed' || f.status === 'accepted').length; },
    criticalCount() { return (this.$s.auditFindings || []).filter(f => f.severity === 'critical').length; },
    overdueCount()  {
      return (this.$s.auditFindings || []).filter(f =>
        f.status !== 'closed' && f.status !== 'accepted' && this.isOverdue(f)
      ).length;
    },
    sortedFindings() {
      const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
      const STATUS_ORDER   = { open: 0, in_remediation: 1, accepted: 2, closed: 3 };
      const fs = [...(this.$s.auditFindings || [])];
      fs.sort((a, b) => {
        // Overdue open findings always first
        const aOverdue = (a.status === 'open' || a.status === 'in_remediation') && this.isOverdue(a);
        const bOverdue = (b.status === 'open' || b.status === 'in_remediation') && this.isOverdue(b);
        if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

        if (this.sortCol === 'title') {
          return this.sortDir * (a.title || '').localeCompare(b.title || '');
        }
        if (this.sortCol === 'due_date') {
          const av = a.due_date || '9999'; const bv = b.due_date || '9999';
          return this.sortDir * av.localeCompare(bv);
        }
        // Default: severity then status
        const sd = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
        if (sd !== 0) return sd;
        return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      });
      return fs;
    },
    filteredFindings() {
      return this.sortedFindings.filter(f => {
        const statusOk = this.filterStatus === 'all' || f.status === this.filterStatus;
        const sevOk    = this.filterSeverity === 'all' || f.severity === this.filterSeverity;
        return statusOk && sevOk;
      });
    },
    linkedRegReqs() {
      if (!this.form.regulation_id) return [];
      const reg = this.$s.regulations.find(r => r.id === this.form.regulation_id);
      if (!reg || !reg.key_requirements) return [];
      return reg.key_requirements.filter(r => typeof r === 'object');
    }
  },

  methods: {
    isOverdue(f) { return !!(f.due_date && f.due_date < this.todayStr); },
    isDueSoon(f) {
      if (!f.due_date || f.due_date < this.todayStr) return false;
      return f.due_date <= this.soonStr;
    },
    capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; },
    statusLabel(s) {
      return { open: 'Open', in_remediation: 'In Remediation', accepted: 'Risk Accepted', closed: 'Closed' }[s] || s;
    },
    regShortName(id) {
      return this.$s.regulations.find(r => r.id === id)?.short_name || id;
    },
    regName(id) {
      return this.$s.regulations.find(r => r.id === id)?.name || id;
    },
    reqTitle(regId, reqId) {
      const reg = this.$s.regulations.find(r => r.id === regId);
      if (!reg || !reg.key_requirements) return reqId;
      const req = reg.key_requirements.find(r => r.id === reqId);
      return req?.title || reqId;
    },
    openReg(regId) {
      const reg = this.$s.regulations.find(r => r.id === regId);
      if (reg) this.$openItem(reg, 'regulation');
    },
    formatDate(d) {
      if (!d) return '—';
      return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },
    sortBy(col) {
      if (this.sortCol === col) this.sortDir *= -1;
      else { this.sortCol = col; this.sortDir = 1; }
    },
    sortIcon(col) {
      if (this.sortCol !== col) return '↕';
      return this.sortDir === 1 ? '↑' : '↓';
    },
    openAddDialog() {
      this.editId = null;
      this.form = { title: '', description: '', severity: 'medium', status: 'open',
        regulation_id: '', req_id: '', due_date: '', owner: '', remediation_notes: '', source: '' };
      this.dialog = true;
    },
    openEditDialog(f) {
      this.editId = f.id;
      this.form = {
        title: f.title, description: f.description || '', severity: f.severity || 'medium',
        status: f.status || 'open', regulation_id: f.regulation_id || '',
        req_id: f.req_id || '', due_date: f.due_date || '', owner: f.owner || '',
        remediation_notes: f.remediation_notes || '', source: f.source || ''
      };
      this.dialog = true;
    },
    saveFinding() {
      if (!this.form.title.trim()) return;
      if (!this.$s.auditFindings) this.$s.auditFindings = [];
      if (this.editId) {
        const idx = this.$s.auditFindings.findIndex(f => f.id === this.editId);
        if (idx !== -1) Object.assign(this.$s.auditFindings[idx], { ...this.form });
      } else {
        this.$s.auditFindings.push({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          created_at: new Date().toISOString(),
          ...this.form
        });
      }
      this.persist();
      this.dialog = false;
    },
    deleteFinding(id) {
      if (!confirm('Delete this finding?')) return;
      const idx = (this.$s.auditFindings || []).findIndex(f => f.id === id);
      if (idx !== -1) this.$s.auditFindings.splice(idx, 1);
      this.persist();
    },
    persist() {
      try { localStorage.setItem('cm_audit_findings', JSON.stringify(this.$s.auditFindings)); } catch {}
    },
    exportCSV() {
      const header = ['Title', 'Description', 'Severity', 'Status', 'Regulation', 'Requirement', 'Owner', 'Due Date', 'Source', 'Remediation Notes'];
      const rows = (this.$s.auditFindings || []).map(f => [
        f.title, f.description || '', f.severity, this.statusLabel(f.status),
        f.regulation_id ? this.regShortName(f.regulation_id) : '',
        f.req_id ? this.reqTitle(f.regulation_id, f.req_id) : '',
        f.owner || '', f.due_date || '', f.source || '', f.remediation_notes || ''
      ]);
      const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const a = document.createElement('a');
      a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      a.download = 'audit-findings.csv';
      a.click();
    }
  }
};
