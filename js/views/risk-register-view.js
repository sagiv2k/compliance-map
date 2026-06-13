/* Risk Register — CRUD table for user-tracked compliance risks */
const RiskRegisterView = {
  template: `
    <div>
      <div class="view-header">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <h1 class="view-title">Risk Register</h1>
            <p class="view-subtitle">Log and track identified compliance risks. Assign owners, set due dates, and monitor mitigation progress.</p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn-posture-export" @click="exportCSV" v-if="risks.length">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
            <button class="rr-add-btn" @click="openAddDialog">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Risk
            </button>
          </div>
        </div>
      </div>

      <!-- KPI row -->
      <div class="posture-kpi-row" v-if="risks.length">
        <div class="posture-kpi-card posture-kpi-card--red">
          <div class="posture-kpi-num">{{ openCount }}</div>
          <div class="posture-kpi-label">Open</div>
        </div>
        <div class="posture-kpi-card" style="background:#fffbeb;border-color:#fde68a;">
          <div class="posture-kpi-num" style="color:#d97706;">{{ mitigatingCount }}</div>
          <div class="posture-kpi-label">Mitigating</div>
        </div>
        <div class="posture-kpi-card posture-kpi-card--green">
          <div class="posture-kpi-num">{{ resolvedCount }}</div>
          <div class="posture-kpi-label">Resolved</div>
        </div>
        <div class="posture-kpi-card" style="background:#fef2f2;border-color:#fecaca;" v-if="criticalCount > 0">
          <div class="posture-kpi-num" style="color:#991b1b;">{{ criticalCount }}</div>
          <div class="posture-kpi-label">Critical</div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!risks.length" class="rr-empty">
        <div class="rr-empty__icon">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h3 class="rr-empty__title">No risks logged yet</h3>
        <p class="rr-empty__desc">Click "Add Risk" to log an identified compliance risk and start tracking it.</p>
      </div>

      <!-- Risk table -->
      <div v-else class="rr-table-wrap">
        <table class="rr-table">
          <thead>
            <tr>
              <th>Risk Title</th>
              <th>Regulation</th>
              <th>Score</th>
              <th>Owner</th>
              <th>Due Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="risk in sortedRisks" :key="risk.id" class="rr-row" :class="'rr-row--' + risk.status">
              <td>
                <div class="rr-risk-title">{{ risk.title }}</div>
                <div class="rr-risk-desc" v-if="risk.description">{{ risk.description }}</div>
              </td>
              <td>
                <span class="rr-reg-chip" v-if="risk.regulation_id">{{ regShortName(risk.regulation_id) }}</span>
                <span v-else class="rr-no-reg">—</span>
              </td>
              <td>
                <div class="rr-score-wrap">
                  <span class="rr-score" :class="scoreClass(risk.severity, risk.likelihood)">{{ risk.severity * risk.likelihood }}</span>
                  <span class="rr-score-label">{{ scoreLabel(risk.severity, risk.likelihood) }}</span>
                </div>
              </td>
              <td class="rr-owner">{{ risk.owner_name || '—' }}</td>
              <td>
                <span v-if="risk.due_date" :class="dueDateClass(risk.due_date)">{{ risk.due_date }}</span>
                <span v-else class="rr-no-date">—</span>
              </td>
              <td>
                <span class="rr-status-badge" :class="'rr-status--' + risk.status">{{ capitalize(risk.status) }}</span>
              </td>
              <td class="rr-actions">
                <button class="rr-action-btn" @click="openEditDialog(risk)" title="Edit">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="rr-action-btn rr-action-btn--delete" @click="deleteRisk(risk.id)" title="Delete">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Dialog -->
      <div v-if="dialog.open" class="rr-overlay" @click.self="closeDialog">
        <div class="rr-dialog">
          <div class="rr-dialog__header">
            <h3>{{ dialog.editId ? 'Edit Risk' : 'Add Risk' }}</h3>
            <button class="rr-dialog__close" @click="closeDialog">✕</button>
          </div>
          <div class="rr-dialog__body">
            <div class="rr-form-group">
              <label>Risk Title <span class="rr-required">*</span></label>
              <input type="text" v-model="dialog.form.title" class="rr-input" placeholder="e.g. No DPO appointed for GDPR compliance" />
            </div>
            <div class="rr-form-group">
              <label>Description</label>
              <textarea v-model="dialog.form.description" class="rr-textarea" rows="2" placeholder="Describe the risk in detail..."></textarea>
            </div>
            <div class="rr-form-row">
              <div class="rr-form-group">
                <label>Related Regulation</label>
                <select v-model="dialog.form.regulation_id" class="rr-select">
                  <option value="">None</option>
                  <option v-for="reg in $s.regulations" :key="reg.id" :value="reg.id">{{ reg.short_name }}</option>
                </select>
              </div>
              <div class="rr-form-group">
                <label>Status</label>
                <select v-model="dialog.form.status" class="rr-select">
                  <option value="open">Open</option>
                  <option value="mitigating">Mitigating</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
            <div class="rr-form-row">
              <div class="rr-form-group">
                <label>Severity (1–5)</label>
                <div class="rr-rating">
                  <button v-for="n in 5" :key="n" class="rr-rating-btn" :class="{'rr-rating-btn--on': n <= dialog.form.severity}" @click="dialog.form.severity = n" type="button">
                    {{ n <= dialog.form.severity ? '●' : '○' }}
                  </button>
                  <span class="rr-rating-label">{{ ['','Trivial','Low','Moderate','Significant','Critical'][dialog.form.severity] }}</span>
                </div>
              </div>
              <div class="rr-form-group">
                <label>Likelihood (1–3)</label>
                <div class="rr-rating">
                  <button v-for="n in 3" :key="n" class="rr-rating-btn" :class="{'rr-rating-btn--on': n <= dialog.form.likelihood}" @click="dialog.form.likelihood = n" type="button">
                    {{ n <= dialog.form.likelihood ? '●' : '○' }}
                  </button>
                  <span class="rr-rating-label">{{ ['','Unlikely','Possible','Likely'][dialog.form.likelihood] }}</span>
                </div>
              </div>
            </div>
            <div class="rr-form-row">
              <div class="rr-form-group">
                <label>Owner</label>
                <input type="text" v-model="dialog.form.owner_name" class="rr-input" placeholder="e.g. Legal Team / John Smith" />
              </div>
              <div class="rr-form-group">
                <label>Due Date</label>
                <input type="date" v-model="dialog.form.due_date" class="rr-input" />
              </div>
            </div>
            <div class="rr-form-group">
              <label>Mitigation Notes</label>
              <textarea v-model="dialog.form.mitigation" class="rr-textarea" rows="2" placeholder="Describe mitigation actions taken or planned..."></textarea>
            </div>
          </div>
          <div class="rr-dialog__footer">
            <button class="rr-btn-cancel" @click="closeDialog">Cancel</button>
            <button class="rr-btn-save" @click="saveRisk" :disabled="!dialog.form.title.trim()">
              {{ dialog.editId ? 'Save Changes' : 'Add Risk' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      dialog: { open: false, editId: null, form: this._emptyForm() }
    };
  },

  computed: {
    risks()           { return this.$s.riskRegister; },
    openCount()       { return this.risks.filter(r => r.status === 'open').length; },
    mitigatingCount() { return this.risks.filter(r => r.status === 'mitigating').length; },
    resolvedCount()   { return this.risks.filter(r => r.status === 'resolved').length; },
    criticalCount()   { return this.risks.filter(r => r.severity * r.likelihood >= 13).length; },
    sortedRisks() {
      return [...this.risks].sort((a, b) => {
        if (a.status === 'resolved' && b.status !== 'resolved') return 1;
        if (a.status !== 'resolved' && b.status === 'resolved') return -1;
        return (b.severity * b.likelihood) - (a.severity * a.likelihood);
      });
    }
  },

  methods: {
    _emptyForm() {
      return { title: '', description: '', regulation_id: '', severity: 3, likelihood: 2, owner_name: '', due_date: '', mitigation: '', status: 'open' };
    },
    capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; },
    regShortName(id) {
      const reg = this.$s.regulations.find(r => r.id === id);
      return reg ? reg.short_name : id;
    },
    scoreClass(sev, lik) {
      const s = sev * lik;
      if (s >= 13) return 'rr-score--critical';
      if (s >= 9)  return 'rr-score--high';
      if (s >= 5)  return 'rr-score--medium';
      return 'rr-score--low';
    },
    scoreLabel(sev, lik) {
      const s = sev * lik;
      if (s >= 13) return 'Critical';
      if (s >= 9)  return 'High';
      if (s >= 5)  return 'Medium';
      return 'Low';
    },
    dueDateClass(d) {
      const days = Math.round((new Date(d + 'T00:00:00') - new Date()) / 86400000);
      if (days < 0)   return 'rr-due--overdue';
      if (days <= 30) return 'rr-due--soon';
      return 'rr-due--ok';
    },
    openAddDialog() {
      this.dialog = { open: true, editId: null, form: this._emptyForm() };
    },
    openEditDialog(risk) {
      this.dialog = { open: true, editId: risk.id, form: { ...risk } };
    },
    closeDialog() { this.dialog.open = false; },
    saveRisk() {
      if (!this.dialog.form.title.trim()) return;
      const rr = this.$s.riskRegister;
      if (this.dialog.editId) {
        const idx = rr.findIndex(r => r.id === this.dialog.editId);
        if (idx !== -1) rr.splice(idx, 1, { ...this.dialog.form });
      } else {
        rr.push({
          ...this.dialog.form,
          id: Date.now() + '-' + Math.random().toString(36).slice(2),
          created_at: new Date().toISOString().slice(0, 10)
        });
      }
      try { localStorage.setItem('cm_risk_register', JSON.stringify(rr)); } catch {}
      this.closeDialog();
    },
    deleteRisk(id) {
      const rr = this.$s.riskRegister;
      const idx = rr.findIndex(r => r.id === id);
      if (idx !== -1) {
        rr.splice(idx, 1);
        try { localStorage.setItem('cm_risk_register', JSON.stringify(rr)); } catch {}
      }
    },
    exportCSV() {
      const today = new Date().toISOString().slice(0, 10);
      const esc = s => '"' + String(s || '').replace(/"/g, '""') + '"';
      const cols = ['Title', 'Description', 'Regulation', 'Severity', 'Likelihood', 'Risk Score', 'Risk Level', 'Owner', 'Due Date', 'Status', 'Mitigation Notes', 'Created'];
      const rows = [cols, ...this.sortedRisks.map(r => [
        r.title, r.description || '',
        r.regulation_id ? this.regShortName(r.regulation_id) : '',
        r.severity, r.likelihood, r.severity * r.likelihood,
        this.scoreLabel(r.severity, r.likelihood),
        r.owner_name || '', r.due_date || '', r.status,
        r.mitigation || '', r.created_at || ''
      ])];
      const csv = rows.map(row => row.map(esc).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `risk-register-${today}.csv`; a.click();
      URL.revokeObjectURL(url);
    }
  }
};
