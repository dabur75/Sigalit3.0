/**
 * סיגלית - WhatsApp-Style Chat Assistant for Scheduling
 * A friendly AI assistant that helps with scheduling tasks
 */

class SigalitChat {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.isTyping = false;
    this.apiBase = 'http://localhost:4000/api/ai';
    this.userId = this.getUserId();
    this.currentContext = {};
    
    this.init();
  }

  /**
   * Initialize the chat system
   */
  init() {
    this.createChatElements();
    this.attachEventListeners();
    this.loadWelcomeMessage();
    this.startContextMonitoring();
    
    // Show subtle entrance animation after a delay
    setTimeout(() => {
      this.showAvatarWithAnimation();
    }, 1000);
  }

  /**
   * Create all chat UI elements
   */
  createChatElements() {
    // Create the main chat container
    const chatContainer = document.createElement('div');
    chatContainer.id = 'sigalit-chat-container';
    chatContainer.innerHTML = this.getChatHTML();
    document.body.appendChild(chatContainer);

    // Add the CSS styles
    this.addChatStyles();
  }

  /**
   * Get the complete HTML structure for the chat
   */
  getChatHTML() {
    return `
      <!-- Floating Avatar Button -->
      <div class="sigalit-avatar" id="sigalit-avatar" onclick="sigalitChat.toggleChat()">
        <div class="avatar-image">
          <div class="avatar-placeholder">ס</div>
        </div>
        <div class="online-indicator"></div>
        <div class="notification-badge" id="notification-badge" style="display: none;">1</div>
      </div>

      <!-- Chat Window -->
      <div class="sigalit-chat-window" id="sigalit-chat-window">
        <div class="chat-header">
          <div class="header-content">
            <div class="header-avatar">
              <div class="avatar-placeholder small">ס</div>
            </div>
            <div class="header-info">
              <div class="header-name">סיגלית</div>
              <div class="header-status">
                <span class="status-dot"></span>
                <span class="status-text">מחוברת</span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button class="header-btn" onclick="sigalitChat.minimizeChat()" title="מזער">−</button>
            <button class="header-btn" onclick="sigalitChat.closeChat()" title="סגור">×</button>
          </div>
        </div>

        <div class="chat-messages" id="chat-messages">
          <div class="messages-container" id="messages-container">
            <!-- Messages will be added here -->
          </div>
          
          <!-- Typing indicator -->
          <div class="typing-indicator" id="typing-indicator" style="display: none;">
            <div class="typing-avatar">
              <div class="avatar-placeholder small">ס</div>
            </div>
            <div class="typing-bubble">
              <div class="typing-text">סיגלית מקלידה...</div>
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input-area">
          <div class="quick-actions" id="quick-actions">
            <!-- Quick action buttons will be added here -->
          </div>
          <div class="input-container">
            <input 
              type="text" 
              id="chat-input" 
              placeholder="הקלד הודעה..."
              onkeypress="sigalitChat.handleKeyPress(event)"
              maxlength="500"
            >
            <button class="send-btn" onclick="sigalitChat.sendMessage()" id="send-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Chat backdrop -->
      <div class="sigalit-backdrop" id="sigalit-backdrop" onclick="sigalitChat.closeChat()"></div>
    `;
  }

  /**
   * Add CSS styles for the chat interface
   */
  addChatStyles() {
    const styles = `
      <style id="sigalit-chat-styles">
        /* Floating Avatar */
        .sigalit-avatar {
          position: fixed;
          bottom: 20px;
          left: 20px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0) translateY(20px);
        }

        .sigalit-avatar.show {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .sigalit-avatar:hover {
          transform: scale(1.1) translateY(0);
          box-shadow: 0 6px 24px rgba(0,0,0,0.2);
        }

        .sigalit-avatar.has-notification {
          animation: bounce 1s infinite;
        }

        @keyframes bounce {
          0%, 20%, 60%, 100% { transform: translateY(0) scale(1); }
          40% { transform: translateY(-10px) scale(1.1); }
          80% { transform: translateY(-5px) scale(1.05); }
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          position: relative;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: white;
          background: rgba(255,255,255,0.1);
        }

        .avatar-placeholder.small {
          font-size: 14px;
        }

        .online-indicator {
          position: absolute;
          bottom: 4px;
          right: 4px;
          width: 16px;
          height: 16px;
          background: #4ade80;
          border: 2px solid white;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          border: 2px solid white;
        }

        /* Chat Window */
        .sigalit-chat-window {
          position: fixed;
          bottom: 100px;
          left: 20px;
          width: 380px;
          height: 600px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.2);
          transform: scale(0) translateY(20px);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          direction: rtl;
        }

        .sigalit-chat-window.open {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        /* Chat Header */
        .chat-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: white;
          border-radius: 16px 16px 0 0;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-avatar {
          width: 40px;
          height: 40px;
        }

        .header-avatar .avatar-placeholder {
          border-radius: 50%;
          font-size: 16px;
        }

        .header-info {
          flex: 1;
        }

        .header-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .header-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          opacity: 0.9;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #4ade80;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .header-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          transition: background 0.2s;
        }

        .header-btn:hover {
          background: rgba(255,255,255,0.2);
        }

        /* Messages Area */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #f7f7f7;
          background-image: radial-gradient(circle at 20px 20px, rgba(255,255,255,0.3) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .messages-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Message Bubbles */
        .message {
          display: flex;
          flex-direction: column;
          max-width: 85%;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.sigalit {
          align-self: flex-start;
        }

        .message.user {
          align-self: flex-end;
        }

        .message-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          position: relative;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .message.sigalit .message-bubble {
          background: white;
          color: #1f2937;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .message.user .message-bubble {
          background: #667eea;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message-time {
          font-size: 11px;
          color: #6b7280;
          margin-top: 4px;
          text-align: left;
        }

        .message.user .message-time {
          color: rgba(255,255,255,0.7);
          text-align: right;
        }

        /* Quick Actions */
        .quick-actions {
          padding: 12px 16px 0;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          border-top: 1px solid #e5e7eb;
          background: white;
          min-height: 0;
          transition: all 0.3s ease;
        }

        .quick-actions:empty {
          padding: 0;
          border-top: none;
        }

        .quick-action-btn {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          color: #374151;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .quick-action-btn:hover {
          background: #e5e7eb;
          transform: translateY(-1px);
        }

        .quick-action-btn.primary {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .quick-action-btn.primary:hover {
          background: #5b6dd6;
        }

        /* Input Area */
        .chat-input-area {
          background: white;
          border-top: 1px solid #e5e7eb;
          border-radius: 0 0 16px 16px;
        }

        .input-container {
          padding: 16px;
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        #chat-input {
          flex: 1;
          border: 1px solid #d1d5db;
          border-radius: 24px;
          padding: 12px 16px;
          font-size: 14px;
          outline: none;
          resize: none;
          max-height: 100px;
          transition: border-color 0.2s;
          font-family: inherit;
          direction: rtl;
        }

        #chat-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        #chat-input::placeholder {
          color: #9ca3af;
        }

        .send-btn {
          background: #667eea;
          border: none;
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .send-btn:hover {
          background: #5b6dd6;
          transform: scale(1.05);
        }

        .send-btn:active {
          transform: scale(0.95);
        }

        .send-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        /* Typing Indicator */
        .typing-indicator {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          margin-bottom: 12px;
          animation: slideIn 0.3s ease-out;
        }

        .typing-avatar {
          width: 32px;
          height: 32px;
        }

        .typing-bubble {
          background: white;
          padding: 12px 16px;
          border-radius: 18px;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .typing-text {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .typing-dots {
          display: flex;
          gap: 4px;
        }

        .typing-dots span {
          width: 4px;
          height: 4px;
          background: #9ca3af;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(1) { animation-delay: 0s; }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(1); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }

        /* Backdrop */
        .sigalit-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.1);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
          z-index: 1000;
        }

        .sigalit-backdrop.show {
          opacity: 1;
          pointer-events: all;
        }

        /* Mobile Responsive */
        @media (max-width: 480px) {
          .sigalit-chat-window {
            width: calc(100vw - 20px);
            height: calc(100vh - 40px);
            bottom: 20px;
            left: 10px;
            border-radius: 12px;
          }

          .sigalit-avatar {
            bottom: 15px;
            left: 15px;
          }
        }

        /* Hebrew RTL Support */
        .sigalit-chat-window {
          direction: rtl;
        }

        .message-bubble {
          text-align: right;
        }

        .header-content {
          direction: rtl;
        }

        .input-container {
          direction: rtl;
        }

        /* Scrollbar Styling */
        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  /**
   * Show avatar with entrance animation
   */
  showAvatarWithAnimation() {
    const avatar = document.getElementById('sigalit-avatar');
    if (avatar) {
      avatar.classList.add('show');
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // ESC key to close chat
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeChat();
      }
    });

    // Click outside to close (mobile)
    document.addEventListener('click', (e) => {
      const chatWindow = document.getElementById('sigalit-chat-window');
      const avatar = document.getElementById('sigalit-avatar');
      
      if (this.isOpen && !chatWindow.contains(e.target) && !avatar.contains(e.target)) {
        // Only close on mobile
        if (window.innerWidth <= 480) {
          this.closeChat();
        }
      }
    });
  }

  /**
   * Toggle chat window open/closed
   */
  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  /**
   * Open the chat window
   */
  openChat() {
    const chatWindow = document.getElementById('sigalit-chat-window');
    const backdrop = document.getElementById('sigalit-backdrop');
    
    this.isOpen = true;
    chatWindow.classList.add('open');
    
    if (window.innerWidth <= 480) {
      backdrop.classList.add('show');
    }
    
    this.clearNotification();
    this.focusInput();
    
    // Scroll to bottom
    setTimeout(() => this.scrollToBottom(), 100);
  }

  /**
   * Close the chat window  
   */
  closeChat() {
    const chatWindow = document.getElementById('sigalit-chat-window');
    const backdrop = document.getElementById('sigalit-backdrop');
    
    this.isOpen = false;
    chatWindow.classList.remove('open');
    backdrop.classList.remove('show');
  }

  /**
   * Minimize chat (same as close for now)
   */
  minimizeChat() {
    this.closeChat();
  }

  /**
   * Focus on input field
   */
  focusInput() {
    setTimeout(() => {
      const input = document.getElementById('chat-input');
      if (input && window.innerWidth > 480) {
        input.focus();
      }
    }, 300);
  }

  /**
   * Handle Enter key press in input
   */
  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Send a message from the user
   */
  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message || this.isTyping) return;
    
    // Clear input and add user message
    input.value = '';
    this.addMessage(message, 'user');
    
    // Show typing indicator
    this.showTyping();
    
    try {
      // Send to AI backend
      const response = await this.sendToAI(message);
      await this.handleAIResponse(response);
      
    } catch (error) {
      console.error('Chat error:', error);
      this.addMessage('סליחה, יש לי בעיה טכנית. אנסה שוב בעוד רגע...', 'sigalit');
    } finally {
      this.hideTyping();
    }
  }

  /**
   * Add a message to the chat
   */
  addMessage(text, sender, options = {}) {
    const container = document.getElementById('messages-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const time = new Date().toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
      <div class="message-bubble">${text}</div>
      <div class="message-time">${time}</div>
    `;
    
    container.appendChild(messageDiv);
    this.scrollToBottom();
    
    // Store message
    this.messages.push({
      text,
      sender,
      timestamp: new Date(),
      ...options
    });
  }

  /**
   * Show typing indicator
   */
  showTyping() {
    const typingIndicator = document.getElementById('typing-indicator');
    this.isTyping = true;
    typingIndicator.style.display = 'flex';
    this.scrollToBottom();
  }

  /**
   * Hide typing indicator
   */
  hideTyping() {
    const typingIndicator = document.getElementById('typing-indicator');
    this.isTyping = false;
    typingIndicator.style.display = 'none';
  }

  /**
   * Scroll to bottom of messages
   */
  scrollToBottom() {
    const messagesArea = document.getElementById('chat-messages');
    setTimeout(() => {
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }, 50);
  }

  /**
   * Show notification badge
   */
  showNotification(count = 1) {
    const badge = document.getElementById('notification-badge');
    const avatar = document.getElementById('sigalit-avatar');
    
    badge.textContent = count;
    badge.style.display = 'flex';
    avatar.classList.add('has-notification');
  }

  /**
   * Clear notification badge
   */
  clearNotification() {
    const badge = document.getElementById('notification-badge');
    const avatar = document.getElementById('sigalit-avatar');
    
    badge.style.display = 'none';
    avatar.classList.remove('has-notification');
  }

  /**
   * Add quick action buttons
   */
  addQuickActions(actions) {
    const container = document.getElementById('quick-actions');
    container.innerHTML = '';
    
    actions.forEach(action => {
      const button = document.createElement('button');
      button.className = `quick-action-btn ${action.type || ''}`;
      button.textContent = action.text;
      button.onclick = () => this.handleQuickAction(action);
      container.appendChild(button);
    });
  }

  /**
   * Handle quick action click
   */
  handleQuickAction(action) {
    // Add user message
    this.addMessage(action.text, 'user');
    
    // Clear quick actions
    document.getElementById('quick-actions').innerHTML = '';
    
    // Handle the action
    if (action.handler) {
      action.handler();
    } else if (action.message) {
      this.processAIMessage(action.message);
    }
  }

  /**
   * Process AI message and show response
   */
  async processAIMessage(message) {
    this.showTyping();
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    this.hideTyping();
    this.addMessage(message.text, 'sigalit');
    
    // Add quick actions if provided
    if (message.actions) {
      this.addQuickActions(message.actions);
    }
  }

  /**
   * Load welcome message
   */
  loadWelcomeMessage() {
    // Wait a bit before showing welcome
    setTimeout(() => {
      if (!this.isOpen) {
        this.showNotification();
      }
      
      this.addMessage(
        'שלום! 👋 אני סיגלית, העוזרת החכמה שלך לשיבוץ.\nאיך אני יכולה לעזור לך היום?',
        'sigalit'
      );
      
      this.addQuickActions([
        { text: 'שיבוץ חודש חדש', type: 'primary', handler: () => this.handleNewMonthScheduling() },
        { text: 'פתרון בעיות', handler: () => this.handleProblemSolving() },
        { text: 'עזרה כללית', handler: () => this.handleGeneralHelp() },
        { text: 'טיפים חכמים', handler: () => this.handleSmartTips() }
      ]);
    }, 2000);
  }

  /**
   * Handle new month scheduling
   */
  handleNewMonthScheduling() {
    const currentMonth = this.getCurrentMonth();
    this.processAIMessage({
      text: `מעולה! בואו נתחיל לשבץ את ${currentMonth} 📅\n\nמה מעדיף:\n• שיבוץ אוטומטי מלא?\n• שיבוץ חלקי עם הנחיות שלך?\n• התחלה מאפס עם הכוונה?`,
      actions: [
        { text: 'שיבוץ אוטומטי', handler: () => this.startAutoScheduling() },
        { text: 'הכוונה צעד אחר צעד', handler: () => this.startGuidedScheduling() },
        { text: 'בדיקת אילוצים', handler: () => this.checkConstraints() }
      ]
    });
  }

  /**
   * Handle problem solving
   */
  handleProblemSolving() {
    this.processAIMessage({
      text: 'אני כאן לעזור לפתור בעיות! 🔧\n\nמה הבעיה שבא לך לפתור?',
      actions: [
        { text: 'יש חסר במדריכים', handler: () => this.handleStaffingIssue() },
        { text: 'אילוצים מתנגשים', handler: () => this.handleConstraintConflicts() },
        { text: 'חוסר איזון בעומס', handler: () => this.handleWorkloadImbalance() },
        { text: 'בעיה ביום ספציפי', handler: () => this.handleSpecificDayIssue() }
      ]
    });
  }

  /**
   * Handle general help
   */
  handleGeneralHelp() {
    this.processAIMessage({
      text: 'אני יכולה לעזור עם המון דברים! ✨\n\nמה מעניין אותך?',
      actions: [
        { text: 'איך משתמשים במערכת?', handler: () => this.showSystemGuide() },
        { text: 'מה זה אילוצים?', handler: () => this.explainConstraints() },
        { text: 'איך עובד השיבוץ האוטומטי?', handler: () => this.explainAutoScheduling() },
        { text: 'חוקי שיבוץ', handler: () => this.explainSchedulingRules() }
      ]
    });
  }

  /**
   * Handle smart tips
   */
  handleSmartTips() {
    const tips = [
      'תמיד בדוק אילוצים לפני שיבוץ אוטומטי',
      'משמרות לילה עדיף לא לתכנן לאותו מדריך פעמיים ברציפות',
      'כדאי לאזן את עומס העבודה בין כל המדריכים',
      'שתף את המדריכים בלוח מוקדם ככל הניתן',
      'השתמש ב"כללי רכז" למקרים מיוחדים'
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    this.processAIMessage({
      text: `💡 טיפ חכם:\n\n${randomTip}\n\nרוצה עוד טיפים או עזרה עם משהו ספציפי?`,
      actions: [
        { text: 'עוד טיפ', handler: () => this.handleSmartTips() },
        { text: 'עזרה עם שיבוץ', handler: () => this.handleNewMonthScheduling() },
        { text: 'שאלה אחרת', handler: () => this.handleGeneralHelp() }
      ]
    });
  }

  /**
   * Get current user ID
   */
  getUserId() {
    return localStorage.getItem('guideId') || localStorage.getItem('userId') || 'anonymous';
  }

  /**
   * Get current month name in Hebrew
   */
  getCurrentMonth() {
    const months = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];
    return months[new Date().getMonth()];
  }

  /**
   * Start context monitoring (detect scheduler state changes)
   */
  startContextMonitoring() {
    // Monitor for changes in the scheduler
    setInterval(() => {
      this.updateContext();
    }, 3000);
  }

  /**
   * Update context information
   */
  updateContext() {
    const newContext = {
      currentPage: 'scheduler',
      selectedDate: window.currentDate || null,
      selectedMonth: window.currentMonth || null,
      guides: window.guidesData || [],
      isScheduleFinalized: this.isScheduleFinalized()
    };

    // Check for significant changes
    if (JSON.stringify(newContext) !== JSON.stringify(this.currentContext)) {
      this.currentContext = newContext;
      this.onContextChange(newContext);
    }
  }

  /**
   * Handle context changes
   */
  onContextChange(context) {
    // Proactive suggestions based on context
    if (context.selectedDate && !this.isOpen) {
      // Maybe suggest something about the selected date
      this.considerProactiveSuggestion(context);
    }
  }

  /**
   * Consider showing proactive suggestions
   */
  considerProactiveSuggestion(context) {
    // Don't spam notifications
    const lastSuggestion = localStorage.getItem('sigalit-last-suggestion');
    const now = Date.now();
    
    if (lastSuggestion && (now - parseInt(lastSuggestion)) < 300000) { // 5 minutes
      return;
    }
    
    // Example: if selected date has issues
    if (context.selectedDate) {
      setTimeout(() => {
        if (!this.isOpen) {
          this.showNotification();
          this.addMessage(
            `הבחנתי שבחרת את ${context.selectedDate} 📅\nרוצה שאבדוק אם יש בעיות או הזדמנויות לשיפור?`,
            'sigalit'
          );
          
          this.addQuickActions([
            { text: 'כן, בדוק', handler: () => this.analyzeDateIssues(context.selectedDate) },
            { text: 'לא עכשיו', handler: () => this.dismissSuggestion() }
          ]);
          
          localStorage.setItem('sigalit-last-suggestion', now.toString());
        }
      }, 2000);
    }
  }

  /**
   * Send message to AI backend
   */
  async sendToAI(message) {
    // For now, return a mock response
    // In the next phase, this will connect to the real AI backend
    return this.generateMockResponse(message);
  }

  /**
   * Generate mock AI response (temporary)
   */
  generateMockResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('שיבוץ') || lowerMessage.includes('לוח')) {
      return {
        text: 'אני רואה שאתה מתעניין בשיבוץ! 📋\n\nבואו נתחיל - איזה חודש אתה רוצה לשבץ?',
        actions: [
          { text: 'החודש הנוכחי', handler: () => this.handleNewMonthScheduling() },
          { text: 'חודש אחר', handler: () => this.handleMonthSelection() }
        ]
      };
    }
    
    if (lowerMessage.includes('בעיה') || lowerMessage.includes('עזרה')) {
      return {
        text: 'אני כאן לעזור! 🆘\n\nתוכל לספר לי יותר על הבעיה?',
        actions: [
          { text: 'יש חסר במדריכים', handler: () => this.handleStaffingIssue() },
          { text: 'בעיה עם אילוצים', handler: () => this.handleConstraintConflicts() }
        ]
      };
    }
    
    // Default response
    return {
      text: 'מעניין! 🤔\n\nאני מבינה שאתה רוצה עזרה עם זה. בואו ננסה לפתור את זה יחד.',
      actions: [
        { text: 'עזרה עם שיבוץ', handler: () => this.handleNewMonthScheduling() },
        { text: 'פתרון בעיות', handler: () => this.handleProblemSolving() },
        { text: 'הסבר מהתחלה', handler: () => this.handleGeneralHelp() }
      ]
    };
  }

  /**
   * Handle AI response
   */
  async handleAIResponse(response) {
    await this.processAIMessage(response);
  }

  /**
   * Check if schedule is finalized
   */
  isScheduleFinalized() {
    // Check if there's a finalized schedule indicator
    return document.querySelector('.workflow-section h3')?.textContent?.includes('מאושר') || false;
  }

  // Placeholder methods for various handlers
  startAutoScheduling() {
    this.processAIMessage({
      text: 'מתחיל שיבוץ אוטומטי... 🤖\n\n(בקרוב תהיה אינטגרציה מלאה עם מערכת השיבוץ)',
      actions: [
        { text: 'הגדרות מתקדמות', handler: () => this.showAdvancedSettings() },
        { text: 'חזור לתפריט', handler: () => this.loadWelcomeMessage() }
      ]
    });
  }

  startGuidedScheduling() {
    this.processAIMessage({
      text: 'בואו נעבור צעד אחר צעד 👣\n\nשלב 1: בחירת חודש\nשלב 2: בדיקת אילוצים\nשלב 3: שיבוץ ראשוני\nשלב 4: עיבוד ושיפורים\n\nמתחילים?',
      actions: [
        { text: 'בואו נתחיל', handler: () => this.startStep1() },
        { text: 'אני רוצה הסבר', handler: () => this.explainGuidedProcess() }
      ]
    });
  }

  checkConstraints() {
    this.processAIMessage({
      text: 'בודק אילוצים נוכחיים... 🔍\n\n(כאן יוצגו האילוצים הפעילים במערכת)',
      actions: [
        { text: 'הוסף אילוץ חדש', handler: () => this.addNewConstraint() },
        { text: 'עדכן אילוצים', handler: () => this.updateConstraints() }
      ]
    });
  }

  // Additional placeholder methods would be implemented here...
  handleStaffingIssue() { this.processAIMessage({ text: 'בואו נפתור את בעיית המדריכים... 👥' }); }
  handleConstraintConflicts() { this.processAIMessage({ text: 'אני אעזור לפתור התנגשות אילוצים... ⚡' }); }
  handleWorkloadImbalance() { this.processAIMessage({ text: 'בואו נאזן את עומס העבודה... ⚖️' }); }
  handleSpecificDayIssue() { this.processAIMessage({ text: 'איזה יום מעניין אותך? 📅' }); }
  showSystemGuide() { this.processAIMessage({ text: 'הנה מדריך מהיר למערכת... 📖' }); }
  explainConstraints() { this.processAIMessage({ text: 'אילוצים הם כללים שמגבילים שיבוץ... 📝' }); }
  explainAutoScheduling() { this.processAIMessage({ text: 'השיבוץ האוטומטי עובד כך... 🤖' }); }
  explainSchedulingRules() { this.processAIMessage({ text: 'יש לנו מספר חוקי שיבוץ... 📏' }); }
}

// Initialize Sigalit when page loads
let sigalitChat;
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit to ensure page is fully loaded
  setTimeout(() => {
    sigalitChat = new SigalitChat();
    console.log('סיגלית מוכנה לעזור! 🤖');
  }, 1000);
});