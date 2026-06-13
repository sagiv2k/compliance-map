/* Mappings View — tab wrapper for Coverage Matrix + Traceability */
const MappingsView = {
  template: `
    <div>
      <div class="view-header">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <h1 class="view-title">Regulation Mappings</h1>
            <p class="view-subtitle">
              Explore standard-to-regulation coverage and trace each control back to its regulatory citations.
            </p>
          </div>
          <div class="posture-view-tabs">
            <button class="btn-posture-tab" :class="{active: tab==='matrix'}" @click="tab='matrix'">
              Coverage Matrix
            </button>
            <button class="btn-posture-tab" :class="{active: tab==='traceability'}" @click="tab='traceability'">
              Traceability
            </button>
          </div>
        </div>
      </div>
      <div class="embedded-view-pane">
        <matrix-pane v-show="tab === 'matrix'" />
        <traceability-pane v-show="tab === 'traceability'" />
      </div>
    </div>
  `,
  data() {
    return {
      tab: window.location.hash.replace('#', '') === 'traceability' ? 'traceability' : 'matrix'
    };
  }
};
