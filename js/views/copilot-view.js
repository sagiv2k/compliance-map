/* AI Compliance Copilot — streaming chat interface powered by Claude */
const CopilotView = {
  template: `
    <div>
      <div class="view-header">
        <h1 class="view-title">AI Compliance Copilot</h1>
        <p class="view-subtitle">Ask questions about your compliance program, compare regulations, or get implementation guidance.</p>
      </div>

      <!-- API Key Setup -->
      <div v-if="!apiKey" class="copilot-setup">
        <h2>Connect your Anthropic API key</h2>
        <p>
          The Copilot uses Claude AI to answer compliance questions using your watchlist, profile,
          and the full 102-regulation database. Your key is stored in your browser only — never sent to our servers.
        </p>
        <div class="copilot-key-row">
          <input
            class="copilot-key-input"
            type="password"
            v-model="keyInput"
            placeholder="sk-ant-api03-…"
            @keyup.enter="saveKey"
            autocomplete="off"
          />
          <button class="copilot-key-save" @click="saveKey">Connect</button>
        </div>
        <p class="copilot-key-hint">Get an API key at console.anthropic.com · Cost is ~$0.003 per query with Claude Haiku</p>

        <div class="copilot-setup-suggestions">
          <div class="copilot-setup-suggestions__label">Example questions you can ask</div>
          <div class="copilot-example-prompts">
            <div class="copilot-example-prompt">What are my top 3 compliance priorities as a fintech operating in the EU?</div>
            <div class="copilot-example-prompt">Compare GDPR and PIPL breach notification requirements</div>
            <div class="copilot-example-prompt">What vendor contracts do I need updated for DORA compliance?</div>
            <div class="copilot-example-prompt">Generate a compliance roadmap for a healthcare SaaS entering the US market</div>
          </div>
        </div>
      </div>

      <!-- Chat Interface -->
      <div v-else class="copilot-chat">
        <div class="copilot-chat__header">
          <h2 style="font-size:18px;font-weight:700;margin:0;color:#0f172a;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" stroke-width="2" style="vertical-align:middle;margin-right:6px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Compliance Copilot
          </h2>
          <div class="copilot-chat__key-info">
            API key connected
            <button class="copilot-reset-key" @click="resetKey">Change key</button>
          </div>
        </div>

        <div class="copilot-messages" ref="messagesEl">
          <!-- Welcome state -->
          <div v-if="messages.length === 0" class="copilot-welcome">
            <div class="copilot-welcome__icon">🤖</div>
            <h3>How can I help with your compliance program?</h3>
            <p>I have access to your profile, watchlist, {{ $s.regulations.length }} regulations, and {{ $s.standards.length }} standards.</p>
            <div class="copilot-welcome-chips">
              <button class="copilot-chip" v-for="q in quickQuestions" :key="q" @click="sendQuick(q)">{{ q }}</button>
            </div>
          </div>

          <!-- Message history -->
          <div v-for="msg in messages" :key="msg.id" class="copilot-msg" :class="'copilot-msg--' + msg.role">
            <div class="copilot-msg__avatar">
              <span v-if="msg.role === 'user'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <span v-else>AI</span>
            </div>
            <div class="copilot-msg__bubble">{{ msg.content }}</div>
          </div>

          <!-- Streaming response -->
          <div v-if="isStreaming" class="copilot-msg copilot-msg--assistant">
            <div class="copilot-msg__avatar">AI</div>
            <div class="copilot-msg__bubble">{{ streamingText }}<span class="copilot-cursor">▊</span></div>
          </div>

          <!-- Error -->
          <div v-if="error" class="copilot-error">Error: {{ error }}</div>
        </div>

        <div class="copilot-input-area">
          <div class="copilot-input-row">
            <textarea
              class="copilot-input"
              v-model="userInput"
              rows="2"
              placeholder="Ask about your compliance program…"
              :disabled="isStreaming"
              @keydown.enter.exact.prevent="sendMessage"
            ></textarea>
            <button class="copilot-send" @click="sendMessage" :disabled="isStreaming || !userInput.trim()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Send
            </button>
          </div>
          <p class="copilot-hint">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      apiKey:       localStorage.getItem('cm_copilot_key') || '',
      keyInput:     '',
      messages:     [],
      userInput:    '',
      isStreaming:  false,
      streamingText: '',
      error:        null,
      quickQuestions: [
        'What are my top compliance gaps?',
        'Which regulation has the highest penalty risk?',
        'Compare GDPR and CCPA',
        'What should I do first for ISO 27001?'
      ]
    };
  },

  methods: {
    saveKey() {
      const key = this.keyInput.trim();
      if (!key.startsWith('sk-ant-')) {
        alert('Please enter a valid Anthropic API key (starts with sk-ant-)');
        return;
      }
      this.apiKey = key;
      try { localStorage.setItem('cm_copilot_key', key); } catch {}
      this.keyInput = '';
    },

    resetKey() {
      this.apiKey = '';
      try { localStorage.removeItem('cm_copilot_key'); } catch {}
      this.messages = [];
    },

    sendQuick(q) {
      this.userInput = q;
      this.sendMessage();
    },

    async sendMessage() {
      const content = this.userInput.trim();
      if (!content || this.isStreaming) return;

      this.messages.push({ id: Date.now() + Math.random(), role: 'user', content });
      this.userInput    = '';
      this.isStreaming  = true;
      this.streamingText = '';
      this.error        = null;

      await this.$nextTick();
      this.scrollToBottom();

      const apiMessages = this.messages.map(m => ({ role: m.role, content: m.content }));

      try {
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model:      'claude-haiku-4-5-20251001',
            max_tokens: 2048,
            stream:     true,
            system:     this.buildSystemPrompt(),
            messages:   apiMessages
          })
        });

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error?.message || `API error ${resp.status}`);
        }

        const reader  = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer    = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') continue;
            try {
              const evt = JSON.parse(raw);
              if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
                this.streamingText += evt.delta.text;
                this.scrollToBottom();
              }
            } catch {}
          }
        }

        this.messages.push({ id: Date.now(), role: 'assistant', content: this.streamingText });
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isStreaming   = false;
        this.streamingText = '';
        await this.$nextTick();
        this.scrollToBottom();
      }
    },

    scrollToBottom() {
      const el = this.$refs.messagesEl;
      if (el) el.scrollTop = el.scrollHeight;
    },

    buildSystemPrompt() {
      const s  = this.$s;
      const p  = s.userProfile;
      const cs = s.complianceStatus;

      let prompt = `You are an expert compliance copilot embedded in ComplianceMap, a global compliance intelligence platform. Help the user understand their compliance obligations, identify gaps, compare regulations, and prioritize implementation actions.

DATABASE: ${s.regulations.length} global regulations · ${s.standards.length} standards (${s.standards.map(st => st.short_name).join(', ')})

`;

      if (p.active) {
        prompt += `USER PROFILE:
- Regions: ${p.regions.join(', ')}
- Industries: ${p.industries.join(', ')}
- Company size: ${p.companySize || 'unspecified'}
- ${p.matchCount} regulations match their profile

`;
      }

      if (s.watchlist.regulations.length) {
        const names = s.watchlist.regulations
          .map(id => s.regulations.find(r => r.id === id))
          .filter(Boolean)
          .map(r => `${r.short_name} (${r.jurisdiction})`);
        prompt += `WATCHLISTED REGULATIONS: ${names.join(', ')}\n\n`;
      }

      const implIds = Object.keys(cs).filter(k => cs[k] === 'implemented');
      const progIds = Object.keys(cs).filter(k => cs[k] === 'in_progress');
      if (implIds.length || progIds.length) {
        prompt += `IMPLEMENTATION STATUS: ${implIds.length} requirements implemented · ${progIds.length} in progress\n\n`;
      }

      const topRegs = s.regulations.slice(0, 30).map(r =>
        `${r.short_name} (${r.jurisdiction}, ${r.domain.join('/')}): ${(r.summary || '').slice(0, 100)}`
      ).join('\n');
      prompt += `KEY REGULATIONS SAMPLE:\n${topRegs}\n\nBe concise, practical, and professional. Reference specific regulations by name. Prioritize actionable advice.`;

      return prompt;
    }
  }
};
