window.NexForge = window.NexForge || {};
window.NexForge.adapters = window.NexForge.adapters || {};

window.NexForge.adapters.gemini = {
  id: 'gemini',
  name: 'Google Gemini',
  
  matches: (url) => {
    return url.includes('gemini.google.com');
  },
  
  extractMessages: () => {
    try {
      const messages = [];
      const title = document.title.replace(' - Gemini', '').trim() || "Gemini Conversation";
      
      const messageElements = document.querySelectorAll('user-query, model-response, .user-query, .model-response, message-content');
      
      if (messageElements.length === 0) {
        return { 
          status: "empty", 
          title, 
          messages: [], 
          messageCount: 0, 
          error: "No messages found. Gemini interface may have changed." 
        };
      }

      messageElements.forEach((el) => {
        const tagName = el.tagName.toLowerCase();
        let role = 'assistant';
        
        if (tagName === 'user-query' || el.classList.contains('user-query')) {
          role = 'user';
        }

        const text = el.innerText || el.textContent;
        
        if (text.trim()) {
          messages.push({
            role: role,
            text: text.trim()
          });
        }
      });

      return {
        status: "success",
        title,
        messages,
        messageCount: messages.length
      };
    } catch (e) {
      console.error("Gemini extraction error:", e);
      return { status: "error", error: e.message, messages: [], messageCount: 0 };
    }
  }
};
