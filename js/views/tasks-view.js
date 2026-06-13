/* Compliance Task Manager — proactive action items with owners and due dates */
const TasksView = {
  template: `
    <div>
      <div class="view-header">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <h1 class="view-title">Compliance Tasks</h1>
            <p class="view-subtitle">Proactive action items to close compliance gaps. Link tasks to regulations and requirements.</p>
          </div>
          <button class="btn-task-add" @click="openAddDialog">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Task
          </button>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="task-stats-row">
        <div class="task-stat" :class="filterStatus === 'open' ? 'task-stat--active' : ''" @click="filterStatus = filterStatus === 'open' ? '' : 'open'">
          <span class="task-stat__num" style="color:#dc2626;">{{ countByStatus('open') }}</span>
          <span class="task-stat__lbl">Open</span>
        </div>
        <div class="task-stat" :class="filterStatus === 'in_progress' ? 'task-stat--active' : ''" @click="filterStatus = filterStatus === 'in_progress' ? '' : 'in_progress'">
          <span class="task-stat__num" style="color:#d97706;">{{ countByStatus('in_progress') }}</span>
          <span class="task-stat__lbl">In Progress</span>
        </div>
        <div class="task-stat" :class="filterStatus === 'done' ? 'task-stat--active' : ''" @click="filterStatus = filterStatus === 'done' ? '' : 'done'">
          <span class="task-stat__num" style="color:#16a34a;">{{ countByStatus('done') }}</span>
          <span class="task-stat__lbl">Done</span>
        </div>
        <div class="task-stat" @click="filterStatus = ''">
          <span class="task-stat__num">{{ $s.tasks.length }}</span>
          <span class="task-stat__lbl">Total</span>
        </div>
        <div v-if="overdueCount > 0" class="task-stat task-stat--overdue">
          <span class="task-stat__num" style="color:#dc2626;">{{ overdueCount }}</span>
          <span class="task-stat__lbl">Overdue</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="task-filter-row">
        <input class="task-search" type="text" v-model="searchQ" placeholder="Search tasks…" />
        <select class="task-filter-sel" v-model="filterPriority">
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select class="task-filter-sel" v-model="filterReg">
          <option value="">All Regulations</option>
          <option v-for="r in $s.regulations" :key="r.id" :value="r.id">{{ r.short_name }}</option>
        </select>
        <button v-if="searchQ || filterPriority || filterReg || filterStatus" class="task-clear-filters" @click="searchQ=''; filterPriority=''; filterReg=''; filterStatus=''">Clear</button>
      </div>

      <!-- Empty state -->
      <div v-if="$s.tasks.length === 0" class="task-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5">
          <rect x="3" y="5" width="6" height="6" rx="1"/><path d="M3 17h18M3 12h18M13 5h8"/>
        </svg>
        <p>No tasks yet</p>
        <p style="font-size:13px;color:#94a3b8;">Create tasks to track compliance actions, assign owners, and set deadlines.</p>
        <button class="btn-task-add" style="margin-top:12px;" @click="openAddDialog">New Task</button>
      </div>

      <!-- Task list -->
      <div v-else-if="filteredTasks.length === 0" class="task-empty">
        <p>No tasks match your filters.</p>
        <button class="task-clear-filters" @click="searchQ=''; filterPriority=''; filterReg=''; filterStatus=''">Clear filters</button>
      </div>

      <div v-else class="task-list">
        <!-- Overdue section -->
        <div v-if="overdueTasks.length && !filterStatus" class="task-section">
          <div class="task-section__label task-section__label--overdue">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Overdue ({{ overdueTasks.length }})
          </div>
          <div v-for="task in overdueTasks" :key="task.id" class="task-card task-card--overdue" @click="openEditDialog(task)">
            <div class="task-card__left">
              <button class="task-check-btn" :class="'task-check-btn--' + task.status" @click.stop="cycleStatus(task)" :title="'Status: ' + statusLabel(task.status)">
                <svg v-if="task.status === 'done'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else-if="task.status === 'in_progress'" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/></svg>
              </button>
            </div>
            <div class="task-card__body">
              <div class="task-card__title" :class="{ 'task-card__title--done': task.status === 'done' }">{{ task.title }}</div>
              <div class="task-card__meta">
                <span class="task-priority-chip" :class="'task-priority--' + task.priority">{{ task.priority }}</span>
                <span v-if="task.regulation_id" class="task-reg-chip">{{ regShortName(task.regulation_id) }}</span>
                <span v-if="task.owner" class="task-owner">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {{ task.owner }}
                </span>
                <span class="task-due task-due--overdue">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {{ formatDate(task.due_date) }} · Overdue
                </span>
              </div>
              <div v-if="task.description" class="task-card__desc">{{ task.description }}</div>
            </div>
            <div class="task-card__actions">
              <button class="task-action-btn" @click.stop="deleteTask(task)" title="Delete task">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Active / filtered section -->
        <div class="task-section" v-if="activeTasks.length">
          <div v-if="overdueTasks.length && !filterStatus" class="task-section__label">Active ({{ activeTasks.length }})</div>
          <div v-for="task in activeTasks" :key="task.id" class="task-card" @click="openEditDialog(task)">
            <div class="task-card__left">
              <button class="task-check-btn" :class="'task-check-btn--' + task.status" @click.stop="cycleStatus(task)" :title="'Status: ' + statusLabel(task.status)">
                <svg v-if="task.status === 'done'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else-if="task.status === 'in_progress'" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/></svg>
              </button>
            </div>
            <div class="task-card__body">
              <div class="task-card__title" :class="{ 'task-card__title--done': task.status === 'done' }">{{ task.title }}</div>
              <div class="task-card__meta">
                <span class="task-priority-chip" :class="'task-priority--' + task.priority">{{ task.priority }}</span>
                <span v-if="task.regulation_id" class="task-reg-chip">{{ regShortName(task.regulation_id) }}</span>
                <span v-if="task.owner" class="task-owner">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {{ task.owner }}
                </span>
                <span v-if="task.due_date" class="task-due" :class="isDueSoon(task.due_date) ? 'task-due--soon' : ''">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {{ formatDate(task.due_date) }}{{ isDueSoon(task.due_date) ? ' · Due soon' : '' }}
                </span>
              </div>
              <div v-if="task.description" class="task-card__desc">{{ task.description }}</div>
            </div>
            <div class="task-card__actions">
              <button class="task-action-btn" @click.stop="deleteTask(task)" title="Delete task">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add / Edit Dialog -->
      <div v-if="dialogOpen" class="task-dialog-overlay" @click.self="dialogOpen = false">
        <div class="task-dialog">
          <div class="task-dialog__header">
            <h3>{{ editingTask ? 'Edit Task' : 'New Task' }}</h3>
            <button class="task-dialog__close" @click="dialogOpen = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="task-dialog__body">
            <div class="task-field">
              <label class="task-label">Task Title <span style="color:#dc2626;">*</span></label>
              <input class="task-input" v-model="form.title" placeholder="e.g. Appoint Data Protection Officer" maxlength="200" />
            </div>
            <div class="task-field">
              <label class="task-label">Description</label>
              <textarea class="task-textarea" v-model="form.description" rows="3" placeholder="What needs to be done and why…"></textarea>
            </div>
            <div class="task-field-row">
              <div class="task-field">
                <label class="task-label">Priority</label>
                <div class="task-priority-picker">
                  <button v-for="p in PRIORITIES" :key="p.value"
                    class="task-pri-btn" :class="['task-pri-btn--' + p.value, form.priority === p.value ? 'active' : '']"
                    @click="form.priority = p.value">{{ p.label }}</button>
                </div>
              </div>
              <div class="task-field">
                <label class="task-label">Status</label>
                <select class="task-input" v-model="form.status">
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div class="task-field-row">
              <div class="task-field">
                <label class="task-label">Owner / Assignee</label>
                <input class="task-input" v-model="form.owner" placeholder="Name or team" />
              </div>
              <div class="task-field">
                <label class="task-label">Due Date</label>
                <input class="task-input" type="date" v-model="form.due_date" />
              </div>
            </div>
            <div class="task-field">
              <label class="task-label">Linked Regulation (optional)</label>
              <select class="task-input" v-model="form.regulation_id">
                <option value="">— None —</option>
                <option v-for="r in $s.regulations" :key="r.id" :value="r.id">{{ r.short_name }} — {{ r.name }}</option>
              </select>
            </div>
            <div class="task-field" v-if="form.regulation_id">
              <label class="task-label">Linked Requirement (optional)</label>
              <select class="task-input" v-model="form.req_id">
                <option value="">— None —</option>
                <option v-for="req in linkedReqs" :key="req.id" :value="req.id">{{ req.id }} — {{ req.title || req.text }}</option>
              </select>
            </div>
            <div class="task-field">
              <label class="task-label">Source / Context</label>
              <input class="task-input" v-model="form.source" placeholder="e.g. Gap analysis, audit finding, regulatory update…" />
            </div>
          </div>
          <div class="task-dialog__footer">
            <button class="task-btn-cancel" @click="dialogOpen = false">Cancel</button>
            <button class="task-btn-save" @click="saveTask" :disabled="!form.title.trim()">
              {{ editingTask ? 'Save Changes' : 'Create Task' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      searchQ:        '',
      filterStatus:   '',
      filterPriority: '',
      filterReg:      '',
      dialogOpen:     false,
      editingTask:    null,
      form: this.blankForm(),

      PRIORITIES: [
        { value: 'critical', label: 'Critical' },
        { value: 'high',     label: 'High' },
        { value: 'medium',   label: 'Medium' },
        { value: 'low',      label: 'Low' }
      ]
    };
  },

  computed: {
    today() { return new Date().toISOString().slice(0, 10); },

    filteredTasks() {
      const q = this.searchQ.toLowerCase();
      const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
      let tasks = [...this.$s.tasks];

      if (q) tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.owner || '').toLowerCase().includes(q) ||
        (t.source || '').toLowerCase().includes(q)
      );
      if (this.filterStatus)   tasks = tasks.filter(t => t.status === this.filterStatus);
      if (this.filterPriority) tasks = tasks.filter(t => t.priority === this.filterPriority);
      if (this.filterReg)      tasks = tasks.filter(t => t.regulation_id === this.filterReg);

      return tasks.sort((a, b) => {
        const aOver = a.due_date && a.due_date < this.today && a.status !== 'done' && a.status !== 'cancelled';
        const bOver = b.due_date && b.due_date < this.today && b.status !== 'done' && b.status !== 'cancelled';
        if (aOver !== bOver) return aOver ? -1 : 1;
        const pa = PRIORITY_ORDER[a.priority] ?? 2;
        const pb = PRIORITY_ORDER[b.priority] ?? 2;
        if (pa !== pb) return pa - pb;
        return (a.due_date || '9999').localeCompare(b.due_date || '9999');
      });
    },

    overdueTasks() {
      return this.filteredTasks.filter(t =>
        t.due_date && t.due_date < this.today &&
        t.status !== 'done' && t.status !== 'cancelled'
      );
    },

    activeTasks() {
      const overdueIds = new Set(this.overdueTasks.map(t => t.id));
      if (this.filterStatus) return this.filteredTasks;
      return this.filteredTasks.filter(t => !overdueIds.has(t.id));
    },

    overdueCount() {
      const today = this.today;
      return this.$s.tasks.filter(t =>
        t.due_date && t.due_date < today &&
        t.status !== 'done' && t.status !== 'cancelled'
      ).length;
    },

    linkedReqs() {
      if (!this.form.regulation_id) return [];
      const reg = this.$s.regulations.find(r => r.id === this.form.regulation_id);
      if (!reg) return [];
      return (reg.key_requirements || []).filter(r => typeof r === 'object');
    }
  },

  methods: {
    blankForm() {
      return { title: '', description: '', priority: 'medium', status: 'open', owner: '', due_date: '', regulation_id: '', req_id: '', source: '' };
    },

    countByStatus(s) {
      return this.$s.tasks.filter(t => t.status === s).length;
    },

    openAddDialog() {
      this.editingTask = null;
      this.form = this.blankForm();
      this.dialogOpen = true;
    },

    openEditDialog(task) {
      this.editingTask = task;
      this.form = { ...task };
      this.dialogOpen = true;
    },

    saveTask() {
      if (!this.form.title.trim()) return;
      if (this.editingTask) {
        Object.assign(this.editingTask, { ...this.form });
      } else {
        this.$s.tasks.push({
          id: 'task-' + Date.now(),
          ...this.form,
          created_at: new Date().toISOString()
        });
      }
      this.persist();
      this.dialogOpen = false;
    },

    deleteTask(task) {
      if (!confirm(`Delete task "${task.title}"?`)) return;
      const idx = this.$s.tasks.indexOf(task);
      if (idx !== -1) this.$s.tasks.splice(idx, 1);
      this.persist();
    },

    cycleStatus(task) {
      const cycle = { open: 'in_progress', in_progress: 'done', done: 'open', cancelled: 'open' };
      task.status = cycle[task.status] || 'open';
      this.persist();
    },

    persist() {
      try { localStorage.setItem('cm_tasks', JSON.stringify(this.$s.tasks)); } catch {}
    },

    regShortName(regId) {
      return this.$s.regulations.find(r => r.id === regId)?.short_name || regId;
    },

    statusLabel(s) {
      return { open: 'Open', in_progress: 'In Progress', done: 'Done', cancelled: 'Cancelled' }[s] || s;
    },

    isOverdue(due) {
      return due && due < this.today;
    },

    isDueSoon(due) {
      if (!due) return false;
      const diff = (new Date(due + 'T00:00:00') - new Date()) / 86400000;
      return diff >= 0 && diff <= 7;
    },

    formatDate(d) {
      if (!d) return '';
      return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }
};
