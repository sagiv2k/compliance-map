/* Detail slide-over modal — works for both regulations and standards */
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
                <span
                  v-for="d in item.domain"
                  :key="d"
                  class="domain-badge"
                  :class="'domain-badge--' + d"
                >{{ $domainLabel(d) }}</span>
                <span class="status-badge" :class="'status-badge--' + item.status">
                  <span class="status-dot"></span>{{ capitalize(item.status) }}
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

        <!-- Body -->
        <div class="modal-body">

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

          <!-- Key requirements / controls -->
          <div class="modal-section">
            <div class="modal-section-title">
              {{ isReg ? 'Key Requirements' : 'Key Controls / Domains' }}
            </div>
            <ul class="modal-req-list" v-if="isReg">
              <li v-for="req in item.key_requirements" :key="req">{{ req }}</li>
            </ul>
            <div class="modal-controls-list" v-else>
              <div class="modal-control-item" v-for="ctrl in item.key_controls" :key="ctrl">{{ ctrl }}</div>
            </div>
          </div>

          <!-- Penalties (regulation only) -->
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
              <div
                v-for="ref in crossRefs"
                :key="ref.id"
                class="crossref-item"
                @click="$openItem(ref.item, ref.type)"
              >
                <span class="coverage-dot" :class="'coverage-' + ref.coverage_level"></span>
                <div>
                  <div class="crossref-item__name">{{ ref.short_name }}</div>
                  <div class="crossref-item__desc">
                    <span :class="'coverage-label-' + ref.coverage_level">
                      {{ capitalize(ref.coverage_level) }} coverage
                    </span>
                    — {{ ref.notes }}
                  </div>
                </div>
              </div>
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

        </div>
      </div>
    </div>
  `,
  computed: {
    item() { return this.$s.selectedItem; },
    isReg() { return this.$s.selectedItemType === 'regulation'; },
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
          .sort((a, b) => {
            const order = { full: 0, substantial: 1, partial: 2, minimal: 3 };
            return (order[a.coverage_level] || 4) - (order[b.coverage_level] || 4);
          });
      } else {
        return mappings
          .filter(m => m.standard_id === this.item.id)
          .map(m => {
            const reg = regulations.find(r => r.id === m.regulation_id);
            return reg ? { id: m.regulation_id, short_name: reg.short_name, coverage_level: m.coverage_level, notes: m.notes, item: reg, type: 'regulation' } : null;
          })
          .filter(Boolean)
          .sort((a, b) => {
            const order = { full: 0, substantial: 1, partial: 2, minimal: 3 };
            return (order[a.coverage_level] || 4) - (order[b.coverage_level] || 4);
          });
      }
    }
  },
  mounted() {
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this.onKey);
  },
  beforeUnmount() {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this.onKey);
  },
  methods: {
    capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; },
    formatDate(d) {
      if (!d) return '—';
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    onKey(e) { if (e.key === 'Escape') this.$closeItem(); }
  }
};
