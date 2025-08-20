'use strict';

const crypto = require('crypto');

/**
 * Minimal Anthropic (Claude 3 Haiku) client using native fetch
 * - Deterministic (temperature 0)
 * - JSON-only responses when requested
 */
class ClaudeHaikuAgent {
  /**
   * @param {Object} options
   * @param {string} [options.apiKey=process.env.ANTHROPIC_API_KEY]
   * @param {string} [options.model='claude-3-haiku-20240307']
   * @param {number} [options.maxTokens=2048]
   */
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
    this.model = options.model || 'claude-3-haiku-20240307';
    this.maxTokens = options.maxTokens || 4096;

    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }
  }

  /**
   * Send a message to Anthropic Messages API
   * @param {Object} params
   * @param {string} params.system - System prompt
   * @param {Array<{role: 'user'|'assistant', content: string}>} params.messages - Conversation
   * @param {Object} [params.schema] - Optional JSON schema to enforce structured output
   * @returns {Promise<{text: string, usage: {input_tokens:number, output_tokens:number}}>} 
   */
  async sendMessage({ system, messages, schema }) {
    const body = {
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: 0,
      system,
      messages,
    };

    // Note: Anthropic Messages API version used here does not accept response_format; rely on prompt to return JSON

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    const text = (data && data.content && data.content[0] && data.content[0].text) || '';
    const usage = data && data.usage ? { input_tokens: data.usage.input_tokens, output_tokens: data.usage.output_tokens } : { input_tokens: 0, output_tokens: 0 };
    return { text, usage };
  }

  /**
   * Simple connection and Hebrew handling check
   */
  async healthCheck() {
    const { text, usage } = await this.sendMessage({
      system: 'אתה מסייע למערכת שיבוץ משמרות בעברית. ענה בתמציתיות.',
      messages: [
        { role: 'user', content: 'הדפס רק את המילה: שלום' },
      ],
    });
    return { reply: text, usage };
  }

  /**
   * Utility to build a stable hash for caching
   */
  static hashObjectStable(object) {
    const json = JSON.stringify(object, Object.keys(object).sort());
    return crypto.createHash('sha256').update(json).digest('hex');
  }
}

module.exports = ClaudeHaikuAgent;


