/* Feature: First-visit onboarding modal — 5-screen welcome carousel */
const OnboardingModalComponent = {
  template: `
    <div class="onboarding-overlay">
      <div class="onboarding-modal" role="dialog" aria-modal="true" aria-label="Welcome to ComplianceMap">

        <!-- Header (always visible) -->
        <div class="onboarding-modal__header">
          <div class="onboarding-modal__logo">
            <svg class="onboarding-modal__logo-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.5px;">ComplianceMap</span>
          </div>
          <div class="onboarding-modal__title">Your command center for global regulatory compliance</div>
          <div class="onboarding-modal__subtitle">Built for auditors, CISOs, legal advisors, and risk managers</div>
        </div>

        <!-- Screen 0: Welcome & Stats -->
        <div class="onboarding-screen" v-if="screen === 0">
          <div class="onboarding-screen__title">Navigate 102 regulations across 18 jurisdictions</div>
          <div class="onboarding-screen__desc">ComplianceMap gives compliance professionals a single platform to explore regulations, assess gaps, compare obligations, and present findings — all in the browser, no signup required.</div>
          <div class="onboarding-stats">
            <div class="onboarding-stat">
              <div class="onboarding-stat__num">102</div>
              <div class="onboarding-stat__label">Global Regulations</div>
            </div>
            <div class="onboarding-stat">
              <div class="onboarding-stat__num">10</div>
              <div class="onboarding-stat__label">Compliance Standards</div>
            </div>
            <div class="onboarding-stat">
              <div class="onboarding-stat__num">18</div>
              <div class="onboarding-stat__label">Jurisdictions</div>
            </div>
            <div class="onboarding-stat">
              <div class="onboarding-stat__num">12</div>
              <div class="onboarding-stat__label">Regulatory Domains</div>
            </div>
          </div>
        </div>

        <!-- Screen 1: Set Your Profile -->
        <div class="onboarding-screen" v-if="screen === 1">
          <div class="onboarding-screen__title">Start with what applies to you</div>
          <div class="onboarding-screen__desc">The Applicability Wizard narrows 102 regulations down to exactly what matters for your organization. Answer 3 quick questions — it takes under a minute.</div>
          <div class="onboarding-wizard-preview">
            <div class="onboarding-wizard-steps">
              <div class="onboarding-wiz-step">
                <div class="onboarding-wiz-step-num">1</div>
                <div class="onboarding-wiz-step-label">Region</div>
              </div>
              <div class="onboarding-wiz-connector"></div>
              <div class="onboarding-wiz-step">
                <div class="onboarding-wiz-step-num">2</div>
                <div class="onboarding-wiz-step-label">Industry</div>
              </div>
              <div class="onboarding-wiz-connector"></div>
              <div class="onboarding-wiz-step">
                <div class="onboarding-wiz-step-num">3</div>
                <div class="onboarding-wiz-step-label">Size</div>
              </div>
            </div>
          </div>
          <div style="text-align:center;">
            <button class="btn-onboarding-wizard" @click="launchWizard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>
              Launch Wizard Now
            </button>
            <br>
            <button class="onboarding-skip-link" @click="next">Skip for now →</button>
          </div>
        </div>

        <!-- Screen 2: Professional Tools -->
        <div class="onboarding-screen" v-if="screen === 2">
          <div class="onboarding-screen__title">Four professional-grade analysis tools</div>
          <div class="onboarding-screen__desc">Each tool is designed for a specific compliance workflow — from field audit work to board-level reporting.</div>
          <div class="onboarding-tools">
            <div class="onboarding-tool-card">
              <div class="onboarding-tool-card__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              </div>
              <div class="onboarding-tool-card__name">Gap Analysis</div>
              <div class="onboarding-tool-card__desc">Map your implemented standards against in-scope regulations to find every uncovered requirement.</div>
            </div>
            <div class="onboarding-tool-card">
              <div class="onboarding-tool-card__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div class="onboarding-tool-card__name">Risk Radar</div>
              <div class="onboarding-tool-card__desc">Rank regulations by penalty severity × enforcement intensity. Know where your greatest exposure is.</div>
            </div>
            <div class="onboarding-tool-card">
              <div class="onboarding-tool-card__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div class="onboarding-tool-card__name">Posture Scorecard</div>
              <div class="onboarding-tool-card__desc">Check off your certifications and get an overall coverage score with domain breakdown and recommendations.</div>
            </div>
            <div class="onboarding-tool-card">
              <div class="onboarding-tool-card__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><circle cx="4" cy="12" r="3"/><circle cx="20" cy="12" r="3"/><line x1="7" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="17" y2="12"/></svg>
              </div>
              <div class="onboarding-tool-card__name">Jurisdiction Overlap</div>
              <div class="onboarding-tool-card__desc">Select 2+ jurisdictions to see shared obligations and conflicting requirements side-by-side.</div>
            </div>
          </div>
        </div>

        <!-- Screen 3: Compare & Track -->
        <div class="onboarding-screen" v-if="screen === 3">
          <div class="onboarding-screen__title">Compare side-by-side and stay current</div>
          <div class="onboarding-screen__desc">Three built-in tools help you track your scope and monitor change over time.</div>
          <div class="onboarding-features">
            <div class="onboarding-feature">
              <div class="onboarding-feature__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <div>
                <div class="onboarding-feature__title">Compare Tray</div>
                <div class="onboarding-feature__desc">Click the bar-chart icon on any regulation card to add it to the Compare Tray (up to 3). Then open a side-by-side comparison of penalties, requirements, and effective dates — exportable as a client memo.</div>
              </div>
            </div>
            <div class="onboarding-feature">
              <div class="onboarding-feature__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div>
                <div class="onboarding-feature__title">Watchlist</div>
                <div class="onboarding-feature__desc">Star any regulation or standard to save it. Your watchlist persists across sessions and includes a scoped coverage matrix — ideal for tracking a specific client's compliance scope.</div>
              </div>
            </div>
            <div class="onboarding-feature">
              <div class="onboarding-feature__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <div class="onboarding-feature__title">Calendar &amp; News</div>
                <div class="onboarding-feature__desc">The Compliance Calendar shows upcoming deadlines by urgency lane. Regulatory News pulls daily updates from EDPB, CISA, FTC, ICO, and 10+ other official bodies — cards with an amber "Updated" badge have recent coverage.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Screen 4: Ready -->
        <div class="onboarding-screen" v-if="screen === 4">
          <div style="text-align:center;margin-bottom:18px;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="1.5" style="display:inline-block;">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="onboarding-screen__title" style="text-align:center;">You're ready to navigate compliance</div>
          <div class="onboarding-screen__desc" style="text-align:center;margin-bottom:20px;">Three quick tips to get the most out of ComplianceMap:</div>
          <div class="onboarding-tips">
            <div class="onboarding-tip">
              <span class="onboarding-tip__icon">💡</span>
              <span>Use the <strong>sidebar filters</strong> to narrow regulations by domain, jurisdiction, or status — filters apply across all 12 views simultaneously.</span>
            </div>
            <div class="onboarding-tip">
              <span class="onboarding-tip__icon">💡</span>
              <span>Set your <strong>Applicability Profile</strong> once and click "Apply to Filters" — it instantly scopes the entire app to your organization's footprint.</span>
            </div>
            <div class="onboarding-tip">
              <span class="onboarding-tip__icon">💡</span>
              <span>Every view has a <strong>? help button</strong> in its header. Click it any time to open a step-by-step guide for that specific view.</span>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="onboarding-nav">
          <button class="onboarding-skip" @click="skip">Skip tour</button>
          <div class="onboarding-dots">
            <div v-for="i in totalScreens" :key="i"
                 class="onboarding-dot" :class="{ active: screen === i-1 }"
                 @click="screen = i-1"></div>
          </div>
          <div class="onboarding-nav-right">
            <button v-if="screen > 0" class="btn-onboarding-back" @click="back">Back</button>
            <button v-if="screen < totalScreens - 1" class="btn-onboarding-next" @click="next">Next</button>
            <button v-if="screen === totalScreens - 1" class="btn-onboarding-finish" @click="getStarted">Get Started →</button>
          </div>
        </div>

      </div>
    </div>
  `,
  data() {
    return {
      screen: 0,
      totalScreens: 5
    };
  },
  methods: {
    next()   { if (this.screen < this.totalScreens - 1) this.screen++; },
    back()   { if (this.screen > 0) this.screen--; },
    skip()   { this.dismiss(); },
    dismiss() {
      this.$s.onboardingDone = true;
      try { localStorage.setItem('cm_onboarded', 'true'); } catch(e) {}
    },
    launchWizard() {
      this.dismiss();
      this.$s.wizardOpen = true;
    },
    getStarted() {
      this.dismiss();
      if (!this.$s.userProfile || !this.$s.userProfile.active) {
        this.$s.wizardOpen = true;
      }
    }
  }
};
