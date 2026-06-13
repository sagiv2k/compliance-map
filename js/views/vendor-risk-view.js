/* Vendor Risk Module — third-party vendor register with review tracking */
const VendorRiskView = {
  template: `
    <div>
      <div class="view-header">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <h1 class="view-title">Vendor Risk</h1>
            <p class="view-subtitle">Track third-party vendors, their compliance relevance, and review schedules.</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <select class="rr-filter-sel" v-model="filterRisk">
              <option value="all">All Vendors</option>
              <option value="overdue">Review Overdue</option>
              <option value="soon">Due in 30 Days</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
            <button class="vr-export-btn" @click="exportCSV" v-if="$s.vendors.length">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
            <button class="btn-primary" @click="openAddDialog" style="padding:8px 16px;font-size:13px;">+ Add Vendor</button>
          </div>
        </div>
      </div>

      <!-- Summary stat cards -->
      <div class="vr-summary-row" v-if="$s.vendors.length">
        <div class="vr-stat-card">
          <div class="vr-stat__value">{{ $s.vendors.length }}</div>
          <div class="vr-stat__label">Total Vendors</div>
        </div>
        <div class="vr-stat-card" :class="{'vr-stat-card--alert': overdueCount > 0}"
          @click="filterRisk = overdueCount > 0 ? 'overdue' : 'all'" style="cursor:pointer;">
          <div class="vr-stat__value" :style="overdueCount > 0 ? 'color:#dc2626;' : ''">{{ overdueCount }}</div>
          <div class="vr-stat__label">Review Overdue</div>
        </div>
        <div class="vr-stat-card" @click="filterRisk = highRiskCount > 0 ? 'high' : 'all'" style="cursor:pointer;">
          <div class="vr-stat__value" style="color:#dc2626;">{{ highRiskCount }}</div>
          <div class="vr-stat__label">High Risk</div>
        </div>
        <div class="vr-stat-card" @click="filterRisk = medRiskCount > 0 ? 'medium' : 'all'" style="cursor:pointer;">
          <div class="vr-stat__value" style="color:#d97706;">{{ medRiskCount }}</div>
          <div class="vr-stat__label">Medium Risk</div>
        </div>
        <div class="vr-stat-card">
          <div class="vr-stat__value" style="color:#16a34a;">{{ lowRiskCount }}</div>
          <div class="vr-stat__label">Low Risk</div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!$s.vendors.length" class="rr-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" style="margin-bottom:12px;">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <h3 style="margin:0 0 8px;font-size:16px;font-weight:700;color:#0f172a;">No vendors yet</h3>
        <p style="color:#64748b;margin:0 0 16px;max-width:420px;text-align:center;">
          Add your third-party vendors to track their compliance relevance, certifications, and review schedules.
        </p>
        <button class="btn-primary" @click="openAddDialog" style="padding:10px 20px;">Add your first vendor</button>
      </div>

      <!-- Vendor table -->
      <template v-else>
        <table class="vr-table" v-if="filteredVendors.length">
          <thead>
            <tr>
              <th @click="sortBy('name')">Vendor {{ sortIcon('name') }}</th>
              <th>Category</th>
              <th>Risk</th>
              <th>Linked Regulations</th>
              <th @click="sortBy('next_review_date')">Next Review {{ sortIcon('next_review_date') }}</th>
              <th>Contact</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in filteredVendors" :key="v.id" :class="{'vr-row--overdue': isOverdue(v)}">
              <td>
                <div style="font-weight:600;color:#0f172a;">{{ v.name }}</div>
                <div v-if="v.notes" class="vr-notes-preview" :title="v.notes">{{ v.notes }}</div>
              </td>
              <td>
                <span class="vr-category-badge" v-if="v.category">{{ v.category }}</span>
                <span v-else style="color:#94a3b8;font-size:12px;">—</span>
              </td>
              <td>
                <span class="vr-risk-badge" :class="'vr-risk-badge--' + (v.risk_level || 'medium')">
                  {{ capitalize(v.risk_level || 'medium') }}
                </span>
              </td>
              <td>
                <template v-if="v.regulation_ids && v.regulation_ids.length">
                  <span v-for="rid in v.regulation_ids.slice(0,3)" :key="rid" class="vr-reg-tag">{{ shortName(rid) }}</span>
                  <span v-if="v.regulation_ids.length > 3" class="vr-reg-tag vr-reg-tag--more">+{{ v.regulation_ids.length - 3 }}</span>
                </template>
                <span v-else style="color:#94a3b8;font-size:12px;">—</span>
              </td>
              <td>
                <template v-if="v.next_review_date">
                  <div :class="isOverdue(v) ? 'vr-date--overdue' : isDueSoon(v) ? 'vr-date--soon' : 'vr-date'">
                    {{ formatDate(v.next_review_date) }}
                  </div>
                  <div v-if="isOverdue(v)" style="font-size:10px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.05em;">Overdue</div>
                  <div v-else-if="isDueSoon(v)" style="font-size:10px;color:#d97706;">Due soon</div>
                </template>
                <span v-else style="color:#94a3b8;font-size:12px;">—</span>
              </td>
              <td style="font-size:12px;color:#475569;">{{ v.contact || '—' }}</td>
              <td style="white-space:nowrap;">
                <button class="rr-action-btn" @click="openEditDialog(v)" title="Edit">✏</button>
                <button class="rr-action-btn rr-action-btn--del" @click="deleteVendor(v.id)" title="Delete">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else style="text-align:center;padding:32px;color:#64748b;font-size:14px;">
          No vendors match this filter.
          <button @click="filterRisk='all'" style="margin-left:8px;color:#3b82f6;background:none;border:none;cursor:pointer;font-size:14px;text-decoration:underline;">Show all</button>
        </div>
      </template>

      <!-- Add / Edit Dialog -->
      <div v-if="dialog" class="rr-dialog-overlay" @click.self="dialog = false">
        <div class="rr-dialog" style="max-width:560px;width:100%;">
          <div class="rr-dialog__header">
            <h3>{{ editId ? 'Edit Vendor' : 'Add Vendor' }}</h3>
            <button class="rr-dialog__close" @click="dialog = false">✕</button>
          </div>
          <div class="rr-dialog__body">
            <div class="rr-form-row">
              <label class="rr-label">Vendor Name *</label>
              <input type="text" class="rr-input" v-model="form.name" placeholder="e.g. AWS, Salesforce, Workday" />
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
              <div class="rr-form-row">
                <label class="rr-label">Category</label>
                <select class="rr-input" v-model="form.category">
                  <option value="">Select…</option>
                  <option v-for="c in VENDOR_CATEGORIES" :key="c">{{ c }}</option>
                </select>
              </div>
              <div class="rr-form-row">
                <label class="rr-label">Risk Level</label>
                <div style="display:flex;gap:6px;margin-top:6px;">
                  <button v-for="lvl in ['low','medium','high']" :key="lvl"
                    class="vr-risk-select-btn"
                    :class="'vr-risk-select-btn--' + lvl + (form.risk_level === lvl ? ' active' : '')"
                    @click.prevent="form.risk_level = lvl">{{ capitalize(lvl) }}</button>
                </div>
              </div>
            </div>

            <div class="rr-form-row">
              <label class="rr-label">Linked Regulations</label>
              <input type="text" class="rr-input" v-model="regSearch" placeholder="Search regulations…" style="margin-bottom:8px;" />
              <div class="vr-reg-list">
                <label v-for="reg in filteredRegOptions" :key="reg.id" class="vr-reg-option">
                  <input type="checkbox" :value="reg.id" v-model="form.regulation_ids" />
                  <span class="vr-reg-option__name">{{ reg.short_name }}</span>
                  <span class="vr-reg-option__jur">{{ reg.jurisdiction }}</span>
                </label>
              </div>
              <div v-if="form.regulation_ids.length" style="margin-top:6px;font-size:11px;color:#64748b;">
                {{ form.regulation_ids.length }} regulation{{ form.regulation_ids.length > 1 ? 's' : '' }} selected
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
              <div class="rr-form-row">
                <label class="rr-label">Next Review Date</label>
                <input type="date" class="rr-input" v-model="form.next_review_date" />
              </div>
              <div class="rr-form-row">
                <label class="rr-label">Contact</label>
                <input type="text" class="rr-input" v-model="form.contact" placeholder="Account manager or DRI" />
              </div>
            </div>

            <div class="rr-form-row">
              <label class="rr-label">Notes</label>
              <textarea class="rr-input" v-model="form.notes" rows="2" placeholder="e.g. SOC 2 Type II certified · DPA signed 2024-01-15"></textarea>
            </div>
          </div>
          <div class="rr-dialog__footer">
            <button class="vr-cancel-btn" @click="dialog = false">Cancel</button>
            <button class="btn-primary" @click="saveVendor" :disabled="!form.name.trim()" style="padding:8px 20px;font-size:13px;">
              {{ editId ? 'Save Changes' : 'Add Vendor' }}
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
      form: { name: '', category: '', regulation_ids: [], risk_level: 'medium', next_review_date: '', contact: '', notes: '' },
      sortCol: 'next_review_date',
      sortDir: 1,
      filterRisk: 'all',
      regSearch: '',
      VENDOR_CATEGORIES: ['Cloud Provider', 'SaaS', 'Data Processor', 'Payment Processor', 'Security Vendor', 'Professional Services', 'Infrastructure', 'HR & Payroll', 'Legal & Compliance', 'Other']
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
    overdueCount() { return (this.$s.vendors || []).filter(v => this.isOverdue(v)).length; },
    highRiskCount() { return (this.$s.vendors || []).filter(v => v.risk_level === 'high').length; },
    medRiskCount()  { return (this.$s.vendors || []).filter(v => v.risk_level === 'medium').length; },
    lowRiskCount()  { return (this.$s.vendors || []).filter(v => v.risk_level === 'low').length; },

    sortedVendors() {
      const vs = [...(this.$s.vendors || [])];
      vs.sort((a, b) => {
        // Overdue first regardless of sort column
        const aOv = this.isOverdue(a) ? 0 : 1;
        const bOv = this.isOverdue(b) ? 0 : 1;
        if (aOv !== bOv) return aOv - bOv;
        const av = a[this.sortCol] || '';
        const bv = b[this.sortCol] || '';
        if (typeof av === 'string') return this.sortDir * av.localeCompare(bv);
        return this.sortDir * (av - bv);
      });
      return vs;
    },

    filteredVendors() {
      if (this.filterRisk === 'all')    return this.sortedVendors;
      if (this.filterRisk === 'overdue') return this.sortedVendors.filter(v => this.isOverdue(v));
      if (this.filterRisk === 'soon')    return this.sortedVendors.filter(v => this.isDueSoon(v));
      return this.sortedVendors.filter(v => v.risk_level === this.filterRisk);
    },

    filteredRegOptions() {
      const q = this.regSearch.toLowerCase();
      if (!q) return this.$s.regulations;
      return this.$s.regulations.filter(r =>
        r.short_name.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.jurisdiction.toLowerCase().includes(q)
      );
    }
  },

  methods: {
    isOverdue(v) { return !!(v.next_review_date && v.next_review_date < this.todayStr); },
    isDueSoon(v) {
      if (!v.next_review_date || v.next_review_date < this.todayStr) return false;
      return v.next_review_date <= this.soonStr;
    },
    shortName(regId) {
      const reg = this.$s.regulations.find(r => r.id === regId);
      return reg ? reg.short_name : regId;
    },
    formatDate(d) {
      if (!d) return '—';
      return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },
    capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; },
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
      this.regSearch = '';
      this.form = { name: '', category: '', regulation_ids: [], risk_level: 'medium', next_review_date: '', contact: '', notes: '' };
      this.dialog = true;
    },
    openEditDialog(v) {
      this.editId = v.id;
      this.regSearch = '';
      this.form = {
        name: v.name, category: v.category || '', regulation_ids: [...(v.regulation_ids || [])],
        risk_level: v.risk_level || 'medium', next_review_date: v.next_review_date || '',
        contact: v.contact || '', notes: v.notes || ''
      };
      this.dialog = true;
    },
    saveVendor() {
      if (!this.form.name.trim()) return;
      if (!this.$s.vendors) this.$s.vendors = [];
      if (this.editId) {
        const idx = this.$s.vendors.findIndex(v => v.id === this.editId);
        if (idx !== -1) Object.assign(this.$s.vendors[idx], { ...this.form });
      } else {
        this.$s.vendors.push({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          created_at: new Date().toISOString(),
          ...this.form
        });
      }
      this.persist();
      this.dialog = false;
    },
    deleteVendor(id) {
      if (!confirm('Delete this vendor?')) return;
      const idx = (this.$s.vendors || []).findIndex(v => v.id === id);
      if (idx !== -1) this.$s.vendors.splice(idx, 1);
      this.persist();
    },
    persist() {
      try { localStorage.setItem('cm_vendors', JSON.stringify(this.$s.vendors)); } catch {}
    },
    exportCSV() {
      const header = ['Name', 'Category', 'Risk Level', 'Linked Regulations', 'Next Review Date', 'Contact', 'Notes', 'Status'];
      const rows = (this.$s.vendors || []).map(v => [
        v.name,
        v.category || '',
        v.risk_level || '',
        (v.regulation_ids || []).map(id => this.shortName(id)).join('; '),
        v.next_review_date || '',
        v.contact || '',
        v.notes || '',
        this.isOverdue(v) ? 'OVERDUE' : this.isDueSoon(v) ? 'Due Soon' : 'OK'
      ]);
      const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const a = document.createElement('a');
      a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      a.download = 'vendor-register.csv';
      a.click();
    }
  }
};
