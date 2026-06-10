/* Feature B — Compliance Calendar / Deadline Tracker */
const CalendarView = {
  template: `
    <div>
      <div class="view-header">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <h1 class="view-title">Compliance Calendar</h1>
            <p class="view-subtitle">
              Milestones and effective dates from your filtered regulation set.
              Advance the reference date to plan ahead.
            </p>
          </div>
          <div class="calendar-view-toggle">
            <button class="btn-cal-view" :class="{active: viewMode==='lanes'}" @click="viewMode='lanes'">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>Cards
            </button>
            <button class="btn-cal-view" :class="{active: viewMode==='table'}" @click="viewMode='table'">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <circle cx="3" cy="6" r="1" fill="currentColor"/>
                <circle cx="3" cy="12" r="1" fill="currentColor"/>
                <circle cx="3" cy="18" r="1" fill="currentColor"/>
              </svg>Table
            </button>
          </div>
        </div>
      </div>

      <!-- Reference date control -->
      <div class="calendar-date-ctrl">
        <label>Reference date:</label>
        <input type="date" class="calendar-date-input" v-model="refDateStr" />
        <button class="btn-calendar-reset" @click="resetDate" v-if="refDateStr !== todayStr">Reset to today</button>
        <span style="font-size:12px;color:var(--color-text-muted);">
          {{ allEvents.length }} events · {{ filteredRegulations.length }} regulations
        </span>
      </div>

      <!-- Card Lanes view -->
      <template v-if="viewMode === 'lanes'">
        <div class="calendar-lanes">
          <!-- v-for and v-if on separate elements to avoid Vue 3 priority issue -->
          <template v-for="lane in visibleLanes" :key="lane.id">
            <div class="calendar-lane" :class="'lane--' + lane.id">
              <div class="calendar-lane__header">
                <span class="calendar-lane__title">{{ lane.label }}</span>
                <span class="calendar-lane__count">{{ lane.events.length }}</span>
              </div>
              <div v-if="!lane.events.length" class="calendar-lane__empty">
                No events in this window.
              </div>
              <div v-else class="calendar-cards">
                <div
                  v-for="ev in lane.events"
                  :key="ev.key"
                  class="calendar-card"
                  @click="$openItem(ev.reg, 'regulation')"
                  :title="ev.reg.name"
                >
                  <div class="calendar-card__date">{{ formatDate(ev.date) }}</div>
                  <div class="calendar-card__name">{{ ev.reg.short_name }}</div>
                  <div v-if="ev.label && ev.label !== 'Effective date'" class="calendar-card__milestone">
                    {{ ev.label }}
                  </div>
                  <div class="calendar-card__reg">{{ ev.reg.jurisdiction }}</div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>

      <!-- Table view -->
      <template v-else>
        <table class="calendar-table">
          <thead>
            <tr>
              <th @click="sortBy('short_name')">Regulation {{ sortIcon('short_name') }}</th>
              <th @click="sortBy('date')">Date {{ sortIcon('date') }}</th>
              <th @click="sortBy('days')">Days {{ sortIcon('days') }}</th>
              <th>Event</th>
              <th>Jurisdiction</th>
              <th @click="sortBy('penalty_severity')">Penalty {{ sortIcon('penalty_severity') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ev in sortedTableEvents"
              :key="ev.key"
              @click="$openItem(ev.reg, 'regulation')"
            >
              <td style="font-weight:600;">{{ ev.reg.short_name }}</td>
              <td>{{ formatDate(ev.date) }}</td>
              <td>
                <span class="days-badge" :class="daysBadgeClass(ev.days)">
                  {{ ev.days < 0 ? Math.abs(ev.days) + 'd ago' : ev.days === 0 ? 'Today' : ev.days + 'd' }}
                </span>
              </td>
              <td style="max-width:280px;font-size:12px;">{{ ev.label }}</td>
              <td style="font-size:12px;color:var(--color-text-secondary);">{{ ev.reg.jurisdiction }}</td>
              <td>
                <div class="penalty-stars">
                  <svg
                    v-for="n in 5" :key="n"
                    class="penalty-star"
                    :class="n <= (ev.reg.penalty_severity || 0) ? 'penalty-star--on' : 'penalty-star--off'"
                    viewBox="0 0 24 24"
                  ><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>
  `,

  data() {
    const today = new Date();
    const pad = n => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
    return {
      viewMode: 'lanes',
      refDateStr: todayStr,
      todayStr,
      sortCol: 'days',
      sortDir: 1
    };
  },

  computed: {
    refDate() {
      return new Date(this.refDateStr + 'T00:00:00');
    },

    filteredRegulations() {
      const { regulations, filters } = this.$s;
      return regulations.filter(r => {
        const domainOk       = r.domain.some(d => filters.domains.includes(d));
        const jurisdictionOk = filters.jurisdictions.includes(r.enforcement_region);
        const statusOk       = filters.status === 'all' || r.status === filters.status;
        return domainOk && jurisdictionOk && statusOk;
      });
    },

    allEvents() {
      const events = [];
      const ref = this.refDate;

      this.filteredRegulations.forEach(reg => {
        if (reg.effective_date) {
          const d = new Date(reg.effective_date + 'T00:00:00');
          const days = Math.round((d - ref) / 86400000);
          events.push({
            key: reg.id + '-effective',
            reg,
            date: reg.effective_date,
            label: 'Effective date',
            days
          });
        }
        if (Array.isArray(reg.milestones)) {
          reg.milestones.forEach((ms, i) => {
            const d = new Date(ms.date + 'T00:00:00');
            const days = Math.round((d - ref) / 86400000);
            events.push({
              key: reg.id + '-ms-' + i,
              reg,
              date: ms.date,
              label: ms.label,
              days,
              status: ms.status
            });
          });
        }
      });

      return events.sort((a, b) => a.days - b.days);
    },

    visibleLanes() {
      const ev = this.allEvents;
      const all = [
        {
          id: 'overdue',
          label: 'Overdue / Past',
          events: ev.filter(e => e.days < 0).slice(-20).reverse()
        },
        {
          id: 'soon',
          label: 'Next 90 Days',
          events: ev.filter(e => e.days >= 0 && e.days <= 90)
        },
        {
          id: 'upcoming',
          label: 'Next 12 Months',
          events: ev.filter(e => e.days > 90 && e.days <= 365)
        },
        {
          id: 'future',
          label: 'Beyond 12 Months',
          events: ev.filter(e => e.days > 365)
        }
      ];
      // Hide "future" lane if empty to reduce clutter
      return all.filter(lane => lane.id !== 'future' || lane.events.length > 0);
    },

    sortedTableEvents() {
      const evs = [...this.allEvents];
      const col = this.sortCol;
      const dir = this.sortDir;
      evs.sort((a, b) => {
        let av, bv;
        if      (col === 'short_name')       { av = a.reg.short_name; bv = b.reg.short_name; }
        else if (col === 'date')             { av = a.date; bv = b.date; }
        else if (col === 'days')             { av = a.days; bv = b.days; }
        else if (col === 'penalty_severity') { av = a.reg.penalty_severity || 0; bv = b.reg.penalty_severity || 0; }
        else                                 { av = a.days; bv = b.days; }
        if (typeof av === 'string') return dir * av.localeCompare(bv);
        return dir * (av - bv);
      });
      return evs;
    }
  },

  methods: {
    formatDate(d) {
      if (!d) return '—';
      return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    },
    resetDate() { this.refDateStr = this.todayStr; },
    daysBadgeClass(days) {
      if (days < 0)   return 'days-badge--overdue';
      if (days <= 90) return 'days-badge--soon';
      if (days <= 365)return 'days-badge--upcoming';
      return 'days-badge--future';
    },
    sortBy(col) {
      if (this.sortCol === col) this.sortDir *= -1;
      else { this.sortCol = col; this.sortDir = 1; }
    },
    sortIcon(col) {
      if (this.sortCol !== col) return '↕';
      return this.sortDir === 1 ? '↑' : '↓';
    }
  }
};
