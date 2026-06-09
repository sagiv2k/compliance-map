/* Regulatory News view — daily-updated feed from official regulatory bodies */
const NewsView = {
  template: `
    <div>
      <div class="view-header">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <h1 class="view-title">Regulatory News</h1>
            <p class="view-subtitle">
              Latest updates from EDPB, ENISA, CISA, NIST, FTC, ICO, SEC, EBA, ESMA, BIS, OCC, CFPB,
              Federal Reserve, IMO, and others. Updated daily via automated feed collection.
            </p>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <div class="news-meta">
              <span class="news-updated-label">Last updated:</span>
              <span class="news-updated-date">{{ $s.newsLastUpdated }}</span>
            </div>
            <button class="btn-update-news" @click="showUpdatePanel = !showUpdatePanel">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-3.08"/>
              </svg>
              Update Feed
            </button>
          </div>
        </div>

        <!-- Update panel (collapsible) -->
        <div class="news-update-panel" v-if="showUpdatePanel">
          <div class="news-update-panel__header">Update News Feed</div>
          <div class="news-update-tabs">
            <button
              v-for="tab in ['local', 'github']" :key="tab"
              class="news-update-tab"
              :class="{ active: updateTab === tab }"
              @click="updateTab = tab"
            >{{ tab === 'local' ? 'Run Locally' : 'GitHub Actions' }}</button>
          </div>

          <!-- Local tab -->
          <div v-if="updateTab === 'local'" class="news-update-body">
            <p class="news-update-desc">Run the following command from the project root to fetch the latest news:</p>
            <div class="news-cmd-row">
              <code class="news-cmd">pip install feedparser requests &amp;&amp; python scripts/fetch_news.py</code>
              <button class="news-cmd-copy" @click="copyCmd" :title="copied ? 'Copied!' : 'Copy to clipboard'">
                <svg v-if="!copied" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {{ copied ? 'Copied!' : 'Copy' }}
              </button>
            </div>
            <p class="news-update-hint">
              After running, reload this page to see updated articles.
              The script merges new items with existing ones and keeps the newest {{ maxItems }} articles.
            </p>
          </div>

          <!-- GitHub Actions tab -->
          <div v-if="updateTab === 'github'" class="news-update-body">
            <p class="news-update-desc">
              Trigger the <strong>Update Regulatory News</strong> GitHub Actions workflow on demand.
              Requires a GitHub Personal Access Token with <code>workflow</code> scope.
            </p>
            <div class="news-gh-form">
              <div class="news-gh-row">
                <label class="news-gh-label">GitHub Repo (owner/name)</label>
                <input class="news-gh-input" type="text" v-model="ghRepo" placeholder="e.g. myusername/compliance-map" />
              </div>
              <div class="news-gh-row">
                <label class="news-gh-label">Personal Access Token</label>
                <input class="news-gh-input" type="password" v-model="ghToken" placeholder="ghp_xxxxxxxxxxxx" />
                <span class="news-gh-hint">Stored locally in your browser only. Never sent to any server except GitHub.</span>
              </div>
            </div>
            <button
              class="btn-trigger-workflow"
              :disabled="!ghRepo || !ghToken || ghLoading"
              @click="triggerWorkflow"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              {{ ghLoading ? 'Triggering…' : 'Trigger Workflow' }}
            </button>
            <div v-if="ghStatus" class="news-gh-status" :class="ghStatusClass">{{ ghStatus }}</div>
          </div>
        </div>
      </div>

      <!-- Filter chips -->
      <div class="news-filters">
        <button
          v-for="chip in filterChips"
          :key="chip.key"
          class="news-chip"
          :class="{ active: activeChip === chip.key }"
          @click="activeChip = chip.key"
        >{{ chip.label }}</button>

        <div class="news-search-wrap">
          <input
            class="news-search"
            type="text"
            placeholder="Search headlines…"
            v-model="searchQuery"
          />
        </div>
      </div>

      <!-- Results count -->
      <div class="results-count" v-if="filteredNews.length > 0 || $s.news.length > 0">
        Showing <strong>{{ filteredNews.length }}</strong> of {{ $s.news.length }} articles
        <span v-if="searchQuery"> matching "<strong>{{ searchQuery }}</strong>"</span>
      </div>

      <!-- News cards -->
      <div class="news-grid" v-if="filteredNews.length > 0">
        <article
          v-for="item in filteredNews"
          :key="item.id"
          class="news-card"
        >
          <div class="news-card__header">
            <span class="news-source-badge" :style="{ background: sourceColor(item.source) }">
              {{ item.source }}
            </span>
            <span class="news-date">{{ formatDate(item.published) }}</span>
          </div>
          <h3 class="news-card__title">{{ item.title }}</h3>
          <p class="news-card__summary">{{ item.summary }}</p>
          <div class="news-card__footer">
            <div class="news-tags">
              <span
                v-for="cat in item.categories"
                :key="cat"
                class="news-tag"
                :style="{ background: $domainColor(cat) + '22', color: $domainColor(cat) }"
              >{{ $domainLabel(cat) }}</span>
            </div>
            <a :href="item.url" target="_blank" rel="noopener" class="news-read-link">
              Read article
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>
        </article>
      </div>

      <!-- Empty state -->
      <div class="empty-state" v-else>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
          <path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/>
        </svg>
        <h3 v-if="$s.news.length === 0">No articles yet</h3>
        <p v-if="$s.news.length === 0">
          News is populated daily by a GitHub Actions workflow.<br>
          Use the <strong>Update Feed</strong> button above to seed the first batch.
        </p>
        <h3 v-else>No articles match your filters</h3>
        <p v-else>Try selecting a different topic or clearing the search.</p>
      </div>
    </div>
  `,

  data() {
    const stored = localStorage.getItem('cm_gh_repo') || '';
    const storedToken = localStorage.getItem('cm_gh_token') || '';
    return {
      activeChip:      'all',
      searchQuery:     '',
      showUpdatePanel: false,
      updateTab:       'local',
      copied:          false,
      maxItems:        60,
      ghRepo:          stored,
      ghToken:         storedToken,
      ghLoading:       false,
      ghStatus:        '',
      ghStatusClass:   '',
      filterChips: [
        { key: 'all',                     label: 'All Topics' },
        { key: 'data_privacy',            label: 'Data Privacy' },
        { key: 'cybersecurity',           label: 'Cybersecurity' },
        { key: 'finance',                 label: 'Finance' },
        { key: 'ai_governance',           label: 'AI Governance' },
        { key: 'health',                  label: 'Health' },
        { key: 'environment',             label: 'Environment' },
        { key: 'maritime',                label: 'Maritime' },
        { key: 'critical_infrastructure', label: 'Critical Infra' }
      ],
      sourceColors: {
        'EDPB':    '#003399',
        'ENISA':   '#7c3aed',
        'CISA':    '#B22234',
        'NIST':    '#059669',
        'FTC':     '#dc2626',
        'ICO':     '#0d9488',
        'SEC':     '#ea580c',
        'EBA':     '#1d4ed8',
        'ESMA':    '#4f46e5',
        'BIS':     '#0f766e',
        'OCC':     '#15803d',
        'CFPB':    '#0369a1',
        'FED':     '#6d28d9',
        'IMO':     '#0e7490',
        'ILO':     '#0891b2',
        'FATF':    '#b45309',
        'FSB':     '#7c3aed',
        'ANPD':    '#009C3B',
        'PwC':     '#d97706',
        'Deloitte':'#0f172a',
        'EY':      '#c2410c',
        'KPMG':    '#1d4ed8',
        'OTHER':   '#64748b'
      }
    };
  },

  computed: {
    filteredNews() {
      let items = this.$s.news;
      if (this.activeChip !== 'all') {
        items = items.filter(i => i.categories && i.categories.includes(this.activeChip));
      }
      const q = this.searchQuery.toLowerCase().trim();
      if (q) {
        items = items.filter(i =>
          i.title.toLowerCase().includes(q) ||
          (i.summary && i.summary.toLowerCase().includes(q)) ||
          i.source.toLowerCase().includes(q)
        );
      }
      return items;
    }
  },

  watch: {
    ghRepo(val) { localStorage.setItem('cm_gh_repo', val); },
    ghToken(val) { localStorage.setItem('cm_gh_token', val); }
  },

  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '—';
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    },
    sourceColor(source) {
      return this.sourceColors[source] || this.sourceColors['OTHER'];
    },
    copyCmd() {
      const cmd = 'pip install feedparser requests && python scripts/fetch_news.py';
      navigator.clipboard.writeText(cmd).then(() => {
        this.copied = true;
        setTimeout(() => { this.copied = false; }, 2000);
      });
    },
    async triggerWorkflow() {
      if (!this.ghRepo || !this.ghToken) return;
      this.ghLoading = true;
      this.ghStatus  = '';
      try {
        const [owner, repo] = this.ghRepo.split('/');
        const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/update-news.yml/dispatches`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.ghToken}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ref: 'main' })
        });
        if (res.status === 204) {
          this.ghStatus = 'Workflow triggered successfully. Check your GitHub Actions tab — it will run in ~30 seconds.';
          this.ghStatusClass = 'news-gh-status--success';
        } else {
          const body = await res.json().catch(() => ({}));
          this.ghStatus = `Error ${res.status}: ${body.message || 'Unknown error. Check your token and repo name.'}`;
          this.ghStatusClass = 'news-gh-status--error';
        }
      } catch (err) {
        this.ghStatus = `Network error: ${err.message}`;
        this.ghStatusClass = 'news-gh-status--error';
      } finally {
        this.ghLoading = false;
      }
    }
  }
};
