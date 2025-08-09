/**
 * AI Assistant for Sigalit Scheduling System
 * Emergency Swap Recommendations and Contact Management
 */

class SigalitAIAssistant {
  constructor() {
    this.apiBase = 'http://localhost:4000/api/ai';
    this.currentEmergency = null;
    this.currentRecommendations = [];
    this.contactLog = [];
    this.isInitialized = false;
    this.init();
  }

  async init() {
    this.createAIWidget();
    this.attachEventListeners();
    this.isInitialized = true;
  }

  /**
   * Create the floating AI assistant widget
   */
  createAIWidget() {
    const widget = document.createElement('div');
    widget.id = 'ai-assistant-widget';
    widget.innerHTML = `
      <div class="ai-widget-header">
        <span class="ai-icon">🤖</span>
        <span class="ai-title">עוזר חכם</span>
        <button class="ai-toggle" onclick="aiAssistant.toggleWidget()">
          <span class="toggle-icon">−</span>
        </button>
      </div>
      <div class="ai-widget-content" id="ai-widget-content">
        <div class="ai-welcome">
          <p>שלום! אני כאן לעזור לך עם החלפות מדריכים בחירום.</p>
          <p>לחץ על "🔄 החלפה חכמה" ליד כל משמרת לקבלת הצעות.</p>
        </div>
      </div>
    `;

    // Add CSS styles
    const styles = `
      <style>
        #ai-assistant-widget {
          position: fixed;
          bottom: 100px;
          left: 20px;
          width: 320px;
          max-height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          border: 1px solid #e2e8f0;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          overflow: hidden;
        }

        .ai-widget-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }

        .ai-icon {
          font-size: 18px;
          margin-left: 8px;
        }

        .ai-title {
          font-weight: 600;
          font-size: 14px;
        }

        .ai-toggle {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .ai-toggle:hover {
          background: rgba(255,255,255,0.1);
        }

        .ai-widget-content {
          padding: 16px;
          max-height: 400px;
          overflow-y: auto;
          font-size: 13px;
          line-height: 1.4;
        }

        .ai-widget-content.collapsed {
          display: none;
        }

        .ai-welcome {
          text-align: center;
          color: #64748b;
        }

        .ai-emergency-form {
          margin-bottom: 16px;
        }

        .ai-form-group {
          margin-bottom: 12px;
        }

        .ai-form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
          color: #374151;
        }

        .ai-form-group select,
        .ai-form-group input,
        .ai-form-group textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
        }

        .ai-form-group textarea {
          height: 60px;
          resize: vertical;
        }

        .ai-btn {
          background: #7c3aed;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          width: 100%;
          margin-bottom: 8px;
        }

        .ai-btn:hover {
          background: #6d28d9;
        }

        .ai-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .ai-btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .ai-btn-secondary:hover {
          background: #e5e7eb;
        }

        .ai-recommendations {
          margin-top: 16px;
        }

        .ai-recommendation {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
          position: relative;
        }

        .ai-recommendation.priority-high {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .ai-recommendation.priority-medium {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .ai-recommendation.priority-low {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .ai-recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .ai-guide-info {
          font-weight: 600;
          color: #1f2937;
        }

        .ai-likelihood {
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 12px;
          font-weight: 500;
        }

        .ai-likelihood.high {
          background: #dcfce7;
          color: #166534;
        }

        .ai-likelihood.medium {
          background: #fef3c7;
          color: #92400e;
        }

        .ai-likelihood.low {
          background: #fee2e2;
          color: #991b1b;
        }

        .ai-reasoning {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .ai-contact-actions {
          display: flex;
          gap: 8px;
        }

        .ai-contact-btn {
          flex: 1;
          padding: 6px 8px;
          font-size: 12px;
        }

        .ai-contact-log {
          margin-top: 16px;
        }

        .ai-contact-entry {
          padding: 8px;
          border-left: 3px solid #e5e7eb;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .ai-contact-entry.accepted {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .ai-contact-entry.declined {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .ai-contact-entry.pending {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .ai-loading {
          text-align: center;
          color: #6b7280;
          padding: 20px;
        }

        .ai-error {
          background: #fef2f2;
          color: #dc2626;
          padding: 12px;
          border-radius: 6px;
          font-size: 12px;
          margin-bottom: 12px;
        }

        .emergency-swap-btn {
          background: #f59e0b;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 11px;
          cursor: pointer;
          margin-right: 4px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .emergency-swap-btn:hover {
          background: #d97706;
        }

        @media (max-width: 768px) {
          #ai-assistant-widget {
            width: 280px;
            left: 10px;
            bottom: 80px;
          }
        }
      </style>
    `;

    // Add styles to head
    document.head.insertAdjacentHTML('beforeend', styles);
    
    // Add widget to body
    document.body.appendChild(widget);
  }

  /**
   * Toggle widget visibility
   */
  toggleWidget() {
    const content = document.getElementById('ai-widget-content');
    const toggleIcon = document.querySelector('.toggle-icon');
    
    if (content.classList.contains('collapsed')) {
      content.classList.remove('collapsed');
      toggleIcon.textContent = '−';
    } else {
      content.classList.add('collapsed');
      toggleIcon.textContent = '+';
    }
  }

  /**
   * Add emergency swap buttons to calendar shifts
   */
  addEmergencySwapButtons() {
    // Add emergency swap buttons to existing calendar shifts
    const shiftElements = document.querySelectorAll('.calendar-day .guides-info');
    
    shiftElements.forEach(shiftElement => {
      if (shiftElement.querySelector('.emergency-swap-btn')) return; // Already added
      
      const dateElement = shiftElement.closest('.calendar-day');
      const date = dateElement?.getAttribute('data-date');
      
      if (!date) return;
      
      const emergencyBtn = document.createElement('button');
      emergencyBtn.className = 'emergency-swap-btn';
      emergencyBtn.innerHTML = '🔄 החלפה חכמה';
      emergencyBtn.onclick = (e) => {
        e.stopPropagation();
        this.showEmergencyForm(date, shiftElement);
      };
      
      shiftElement.appendChild(emergencyBtn);
    });
  }

  /**
   * Show emergency swap form
   */
  showEmergencyForm(date, shiftElement) {
    // Get guides for this shift
    const guides = this.extractGuidesFromShift(shiftElement);
    
    if (guides.length === 0) {
      this.showError('לא נמצאו מדריכים למשמרת זו');
      return;
    }

    const content = document.getElementById('ai-widget-content');
    content.innerHTML = `
      <div class="ai-emergency-form">
        <h3 style="margin-bottom: 12px; color: #1f2937;">חירום - ${date}</h3>
        
        <div class="ai-form-group">
          <label>מדריך שלא יכול להגיע:</label>
          <select id="unavailable-guide">
            <option value="">בחר מדריך...</option>
            ${guides.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
          </select>
        </div>
        
        <div class="ai-form-group">
          <label>סוג משמרת:</label>
          <select id="shift-type">
            <option value="morning">בוקר</option>
            <option value="evening">ערב</option>
            <option value="night">לילה</option>
            <option value="weekend">סוף שבוע</option>
          </select>
        </div>
        
        <div class="ai-form-group">
          <label>סיבה (אופציונלי):</label>
          <textarea id="emergency-reason" placeholder="למה המדריך לא יכול להגיע..."></textarea>
        </div>
        
        <button class="ai-btn" onclick="aiAssistant.getEmergencyRecommendations('${date}')">
          🔍 חפש פתרונות
        </button>
        
        <button class="ai-btn ai-btn-secondary" onclick="aiAssistant.showWelcome()">
          ביטול
        </button>
      </div>
    `;

    // Expand widget if collapsed
    const widgetContent = document.getElementById('ai-widget-content');
    if (widgetContent.classList.contains('collapsed')) {
      this.toggleWidget();
    }
  }

  /**
   * Extract guides from shift element
   */
  extractGuidesFromShift(shiftElement) {
    const guides = [];
    const guideElements = shiftElement.querySelectorAll('.guide-name, .guide');
    
    guideElements.forEach(el => {
      const name = el.textContent.trim();
      const id = el.getAttribute('data-guide-id') || 
                 el.getAttribute('data-id') || 
                 this.getGuideIdByName(name);
      
      if (name && id) {
        guides.push({ id: parseInt(id), name });
      }
    });

    return guides;
  }

  /**
   * Get guide ID by name (fallback method)
   */
  getGuideIdByName(name) {
    // This would need to be populated from the guides data
    // For now, return a placeholder
    return Math.floor(Math.random() * 100); // Temporary
  }

  /**
   * Get emergency recommendations from AI
   */
  async getEmergencyRecommendations(date) {
    const unavailableGuideId = document.getElementById('unavailable-guide').value;
    const shiftType = document.getElementById('shift-type').value;
    const reason = document.getElementById('emergency-reason').value;
    
    if (!unavailableGuideId) {
      this.showError('יש לבחור מדריך שלא יכול להגיע');
      return;
    }

    this.showLoading('מחפש פתרונות חכמים...');

    try {
      const response = await fetch(`${this.apiBase}/emergency-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          unavailableGuideId: parseInt(unavailableGuideId),
          date,
          shiftType,
          reason,
          coordinatorId: this.getCurrentCoordinatorId()
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'שגיאה בקבלת המלצות');
      }

      this.currentEmergency = result.emergencyId;
      this.currentRecommendations = result.recommendations;
      this.showRecommendations(result.recommendations);

    } catch (error) {
      console.error('Error getting recommendations:', error);
      this.showError('שגיאה בקבלת המלצות: ' + error.message);
    }
  }

  /**
   * Show AI recommendations
   */
  showRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      this.showNoSolutions();
      return;
    }

    const content = document.getElementById('ai-widget-content');
    content.innerHTML = `
      <div class="ai-recommendations">
        <h3 style="margin-bottom: 16px; color: #1f2937;">💡 פתרונות מומלצים</h3>
        
        ${recommendations.map((rec, index) => this.renderRecommendation(rec, index)).join('')}
        
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <button class="ai-btn ai-btn-secondary" onclick="aiAssistant.showWelcome()">
            חזור לתפריט הראשי
          </button>
        </div>
      </div>
      
      <div class="ai-contact-log" id="ai-contact-log">
        <h4 style="margin-bottom: 8px; color: #374151;">📞 יומן קשר</h4>
        <div id="contact-entries"></div>
      </div>
    `;
  }

  /**
   * Render a single recommendation
   */
  renderRecommendation(rec, index) {
    const priorityClass = rec.likelihood >= 70 ? 'priority-high' : 
                         rec.likelihood >= 40 ? 'priority-medium' : 'priority-low';
    
    const likelihoodClass = rec.likelihood >= 70 ? 'high' : 
                           rec.likelihood >= 40 ? 'medium' : 'low';

    return `
      <div class="ai-recommendation ${priorityClass}" data-rec-index="${index}">
        <div class="ai-recommendation-header">
          <div class="ai-guide-info">
            <strong>${rec.primaryGuide.name}</strong>
            ${rec.swapType === 'chain' ? ' (החלפה שרשרת)' : ''}
            ${rec.swapType === 'split' ? ' (משמרת מחולקת)' : ''}
          </div>
          <div class="ai-likelihood ${likelihoodClass}">
            ${rec.likelihood}% סיכוי
          </div>
        </div>
        
        <div class="ai-reasoning">
          ${rec.reasoning || 'אין פרטים נוספים'}
        </div>
        
        <div class="ai-contact-actions">
          <button class="ai-contact-btn ai-btn" onclick="aiAssistant.showContactTemplate(${index})">
            📞 פרטי קשר
          </button>
          <button class="ai-contact-btn ai-btn ai-btn-secondary" onclick="aiAssistant.recordContactResult(${index}, 'attempted')">
            ✅ יצרתי קשר
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Show contact template for guide
   */
  async showContactTemplate(recIndex) {
    const rec = this.currentRecommendations[recIndex];
    if (!rec) return;

    try {
      const response = await fetch(`${this.apiBase}/contact-template/${rec.primaryGuide.id}/${this.currentEmergency}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'שגיאה בקבלת תבנית קשר');
      }

      this.showContactModal(result, recIndex);

    } catch (error) {
      console.error('Error getting contact template:', error);
      this.showError('שגיאה בקבלת תבנית קשר: ' + error.message);
    }
  }

  /**
   * Show contact modal with template
   */
  showContactModal(contactData, recIndex) {
    const modal = document.createElement('div');
    modal.className = 'ai-contact-modal';
    modal.innerHTML = `
      <div class="ai-modal-overlay" onclick="this.parentElement.remove()">
        <div class="ai-modal-content" onclick="event.stopPropagation()">
          <div class="ai-modal-header">
            <h3>📞 יצירת קשר עם ${contactData.guide.name}</h3>
            <button onclick="this.closest('.ai-contact-modal').remove()">✕</button>
          </div>
          
          <div class="ai-modal-body">
            <div class="contact-info">
              <strong>טלפון:</strong> ${contactData.guide.phone || 'לא זמין'}
            </div>
            
            <div class="message-template">
              <label><strong>הודעה מוצעת:</strong></label>
              <textarea id="contact-message" rows="6">${contactData.template}</textarea>
            </div>
            
            <div class="contact-method">
              <label><strong>דרך יצירת קשר מומלצת:</strong></label>
              <select id="contact-method">
                <option value="phone" ${contactData.suggestedMethod === 'phone' ? 'selected' : ''}>טלפון</option>
                <option value="sms" ${contactData.suggestedMethod === 'sms' ? 'selected' : ''}>SMS</option>
                <option value="whatsapp" ${contactData.suggestedMethod === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
              </select>
            </div>
          </div>
          
          <div class="ai-modal-footer">
            <button class="ai-btn" onclick="aiAssistant.recordContactAttempt(${recIndex}, 'contacted')">
              ✅ יצרתי קשר
            </button>
            <button class="ai-btn ai-btn-secondary" onclick="this.closest('.ai-contact-modal').remove()">
              ביטול
            </button>
          </div>
        </div>
      </div>
    `;

    // Add modal styles
    const modalStyles = `
      <style>
        .ai-contact-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2000;
        }
        
        .ai-modal-overlay {
          background: rgba(0,0,0,0.5);
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .ai-modal-content {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .ai-modal-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .ai-modal-header button {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #6b7280;
        }
        
        .ai-modal-body {
          padding: 20px;
        }
        
        .ai-modal-body > div {
          margin-bottom: 16px;
        }
        
        .ai-modal-body label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
        }
        
        .ai-modal-body textarea,
        .ai-modal-body select {
          width: 100%;
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        
        .ai-modal-footer {
          padding: 20px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
        }
        
        .contact-info {
          background: #f3f4f6;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
        }
      </style>
    `;

    if (!document.querySelector('.ai-modal-styles')) {
      const styleElement = document.createElement('style');
      styleElement.className = 'ai-modal-styles';
      styleElement.textContent = modalStyles.replace(/<\/?style>/g, '');
      document.head.appendChild(styleElement);
    }

    document.body.appendChild(modal);
  }

  /**
   * Record contact attempt result
   */
  async recordContactAttempt(recIndex, initialResponse) {
    const rec = this.currentRecommendations[recIndex];
    if (!rec) return;

    // Show response form
    const responseModal = this.createResponseModal(rec, recIndex, initialResponse);
    document.body.appendChild(responseModal);
  }

  /**
   * Create response recording modal
   */
  createResponseModal(rec, recIndex, initialResponse) {
    const modal = document.createElement('div');
    modal.className = 'ai-contact-modal';
    modal.innerHTML = `
      <div class="ai-modal-overlay" onclick="this.parentElement.remove()">
        <div class="ai-modal-content" onclick="event.stopPropagation()">
          <div class="ai-modal-header">
            <h3>📝 תוצאת הקשר עם ${rec.primaryGuide.name}</h3>
            <button onclick="this.closest('.ai-contact-modal').remove()">✕</button>
          </div>
          
          <div class="ai-modal-body">
            <div class="ai-form-group">
              <label>תגובת המדריך:</label>
              <select id="guide-response">
                <option value="pending">עדיין לא ענה</option>
                <option value="accepted">הסכים לקחת את המשמרת</option>
                <option value="declined">סירב לקחת את המשמרת</option>
                <option value="no_answer">לא ענה לטלפון</option>
              </select>
            </div>
            
            <div class="ai-form-group" id="decline-reason-group" style="display: none;">
              <label>סיבת הסירוב:</label>
              <select id="decline-reason">
                <option value="">בחר סיבה...</option>
                <option value="family_commitment">התחייבות משפחתית</option>
                <option value="too_tired">עייפות</option>
                <option value="already_scheduled">כבר מתוכנן למשמרת אחרת</option>
                <option value="short_notice">הודעה קצרה מדי</option>
                <option value="wrong_shift_type">לא מתאים לסוג המשמרת</option>
                <option value="other">אחר</option>
              </select>
            </div>
            
            <div class="ai-form-group">
              <label>זמן תגובה (דקות):</label>
              <input type="number" id="response-time" placeholder="כמה דקות עד שענה?" min="0">
            </div>
            
            <div class="ai-form-group">
              <label>הערות נוספות:</label>
              <textarea id="contact-notes" placeholder="פרטים נוספים על השיחה..."></textarea>
            </div>
          </div>
          
          <div class="ai-modal-footer">
            <button class="ai-btn" onclick="aiAssistant.submitContactResult(${recIndex})">
              💾 שמור תוצאה
            </button>
            <button class="ai-btn ai-btn-secondary" onclick="this.closest('.ai-contact-modal').remove()">
              ביטול
            </button>
          </div>
        </div>
      </div>
    `;

    // Add event listener for decline reason
    modal.querySelector('#guide-response').addEventListener('change', function() {
      const declineGroup = modal.querySelector('#decline-reason-group');
      declineGroup.style.display = this.value === 'declined' ? 'block' : 'none';
    });

    return modal;
  }

  /**
   * Submit contact result to backend
   */
  async submitContactResult(recIndex) {
    const modal = document.querySelector('.ai-contact-modal');
    const response = modal.querySelector('#guide-response').value;
    const declineReason = modal.querySelector('#decline-reason').value;
    const responseTime = modal.querySelector('#response-time').value;
    const notes = modal.querySelector('#contact-notes').value;

    try {
      const result = await fetch(`${this.apiBase}/contact-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emergencyId: this.currentEmergency,
          suggestionId: recIndex + 1,
          contactedGuideId: this.currentRecommendations[recIndex].primaryGuide.id,
          contactOrder: this.contactLog.length + 1,
          coordinatorId: this.getCurrentCoordinatorId(),
          contactMethod: 'phone',
          response,
          responseTime: responseTime ? parseInt(responseTime) : null,
          declineReason: response === 'declined' ? declineReason : null,
          notes
        })
      });

      const resultData = await result.json();
      
      if (!result.ok) {
        throw new Error(resultData.error || 'שגיאה בשמירת התוצאה');
      }

      // Add to contact log
      this.addToContactLog({
        guide: this.currentRecommendations[recIndex].primaryGuide.name,
        response,
        responseTime,
        notes,
        timestamp: new Date()
      });

      // Close modal
      modal.remove();

      // If accepted, show execution option
      if (response === 'accepted') {
        this.showSwapExecutionOption(recIndex);
      }

    } catch (error) {
      console.error('Error submitting contact result:', error);
      this.showError('שגיאה בשמירת התוצאה: ' + error.message);
    }
  }

  /**
   * Show swap execution option
   */
  showSwapExecutionOption(recIndex) {
    const rec = this.currentRecommendations[recIndex];
    
    if (confirm(`${rec.primaryGuide.name} הסכים לקחת את המשמרת!\n\nהאם לבצע את ההחלפה במערכת?`)) {
      this.executeSwap(recIndex);
    }
  }

  /**
   * Execute the swap in the system
   */
  async executeSwap(recIndex) {
    const rec = this.currentRecommendations[recIndex];
    
    this.showLoading('מבצע החלפה במערכת...');

    try {
      const response = await fetch(`${this.apiBase}/execute-swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emergencyId: this.currentEmergency,
          swapSolution: rec,
          coordinatorId: this.getCurrentCoordinatorId()
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'שגיאה בביצוע החלפה');
      }

      this.showSuccess('✅ החלפה בוצעה בהצלחה! הלוח עודכן.');
      
      // Refresh the calendar
      setTimeout(() => {
        location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error executing swap:', error);
      this.showError('שגיאה בביצוע החלפה: ' + error.message);
    }
  }

  /**
   * Add entry to contact log
   */
  addToContactLog(entry) {
    this.contactLog.push(entry);
    
    const contactEntries = document.getElementById('contact-entries');
    if (!contactEntries) return;

    const entryDiv = document.createElement('div');
    entryDiv.className = `ai-contact-entry ${entry.response}`;
    entryDiv.innerHTML = `
      <div style="font-weight: 500;">${entry.guide}</div>
      <div style="font-size: 11px; color: #6b7280;">
        ${entry.response === 'accepted' ? '✅ הסכים' : 
          entry.response === 'declined' ? '❌ סירב' : 
          entry.response === 'no_answer' ? '📵 לא ענה' : '⏳ ממתין'}
        ${entry.responseTime ? ` • ${entry.responseTime} דק'` : ''}
        ${entry.notes ? ` • ${entry.notes}` : ''}
      </div>
    `;
    
    contactEntries.appendChild(entryDiv);
  }

  /**
   * Show no solutions message
   */
  showNoSolutions() {
    const content = document.getElementById('ai-widget-content');
    content.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #ef4444;">
        <h3>😔 לא נמצאו פתרונות פנימיים</h3>
        <p style="margin: 12px 0;">כל המדריכים הפעילים חסומים או לא זמינים.</p>
        <p style="font-size: 12px; color: #6b7280;">יהיה צורך לפנות למדריכים חיצוניים (רזרבה).</p>
        
        <button class="ai-btn ai-btn-secondary" onclick="aiAssistant.showWelcome()" style="margin-top: 16px;">
          חזור לתפריט הראשי
        </button>
      </div>
    `;
  }

  /**
   * Show welcome screen
   */
  showWelcome() {
    const content = document.getElementById('ai-widget-content');
    content.innerHTML = `
      <div class="ai-welcome">
        <p>שלום! אני כאן לעזור לך עם החלפות מדריכים בחירום.</p>
        <p>לחץ על "🔄 החלפה חכמה" ליד כל משמרת לקבלת הצעות.</p>
      </div>
    `;
    
    this.currentEmergency = null;
    this.currentRecommendations = [];
    this.contactLog = [];
  }

  /**
   * Show loading message
   */
  showLoading(message) {
    const content = document.getElementById('ai-widget-content');
    content.innerHTML = `
      <div class="ai-loading">
        <div style="margin-bottom: 12px;">⏳</div>
        <div>${message}</div>
      </div>
    `;
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    const content = document.getElementById('ai-widget-content');
    content.innerHTML = `
      <div style="text-align: center; color: #10b981; padding: 20px;">
        <div style="font-size: 24px; margin-bottom: 8px;">✅</div>
        <div>${message}</div>
      </div>
    `;
  }

  /**
   * Show error message
   */
  showError(message) {
    const content = document.getElementById('ai-widget-content');
    content.innerHTML = `
      <div class="ai-error">
        ${message}
        <button class="ai-btn ai-btn-secondary" onclick="aiAssistant.showWelcome()" style="margin-top: 8px;">
          חזור לתפריט הראשי
        </button>
      </div>
    `;
  }

  /**
   * Get current coordinator ID
   */
  getCurrentCoordinatorId() {
    // Get from localStorage or session
    const coordinatorId = localStorage.getItem('guideId') || localStorage.getItem('userId');
    return coordinatorId ? parseInt(coordinatorId) : 1; // Default to 1 if not found
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Add emergency swap buttons when calendar is updated
    document.addEventListener('DOMContentLoaded', () => {
      this.addEmergencySwapButtons();
    });

    // Re-add buttons when calendar is re-rendered
    const originalRenderCalendarGrid = window.renderCalendarGrid;
    if (originalRenderCalendarGrid) {
      window.renderCalendarGrid = (...args) => {
        const result = originalRenderCalendarGrid.apply(this, args);
        setTimeout(() => this.addEmergencySwapButtons(), 100);
        return result;
      };
    }
  }
}

// Initialize AI Assistant
let aiAssistant;
document.addEventListener('DOMContentLoaded', () => {
  aiAssistant = new SigalitAIAssistant();
});