window.NexForge = window.NexForge || {};
window.NexForge.adapters = window.NexForge.adapters || {};

window.NexForge.adapters.chatgpt = {
  id: 'chatgpt',
  name: 'ChatGPT',
  
  matches: (url) => {
    return url.includes('chatgpt.com');
  },
  
  extractMessages: () => {
    try {
      const messages = [];
      const title = document.title.replace(' - ChatGPT', '').trim() || "ChatGPT Conversation";
      
      const messageElements = document.querySelectorAll('[data-message-author-role]');
      
      if (messageElements.length === 0) {
        return { 
          status: "empty", 
          title, 
          messages: [], 
          messageCount: 0, 
          error: "No messages found. Make sure the conversation is fully loaded." 
        };
      }

      messageElements.forEach((el) => {
        const role = el.getAttribute('data-message-author-role');
        
        const contentDiv = el.querySelector('.markdown') || el;
        const text = contentDiv.innerText || contentDiv.textContent;
        
        if (text.trim()) {
          messages.push({
            role: role === 'user' ? 'user' : 'assistant',
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
      console.error("ChatGPT extraction error:", e);
      return { status: "error", error: e.message, messages: [], messageCount: 0 };
    }
  }
};
