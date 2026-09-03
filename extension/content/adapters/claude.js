window.NexForge = window.NexForge || {};
window.NexForge.adapters = window.NexForge.adapters || {};

window.NexForge.adapters.claude = {
  id: 'claude',
  name: 'Claude',
  
  matches: (url) => {
    return url.includes('claude.ai');
  },
  
  extractMessages: () => {
    try {
      const messages = [];
      const title = document.title.replace(' - Claude', '').trim() || "Claude Conversation";
      
      const messageElements = document.querySelectorAll('.font-user-message, .font-claude-message, [data-is-user], .message');
      
      let elementsToProcess = messageElements;
      
      if (elementsToProcess.length === 0) {
        const fallbacks = document.querySelectorAll('.prose, div.grid');
        if (fallbacks.length > 0) {
          elementsToProcess = fallbacks;
        }
      }

      if (elementsToProcess.length === 0) {
         return { 
           status: "empty", 
           title, 
           messages: [], 
           messageCount: 0, 
           error: "No messages found. Claude's interface may have updated." 
         };
      }

      elementsToProcess.forEach((el, index) => {
        let role = 'user'; // Default guess
        
        // Determine role based on class or content clues
        if (el.classList.contains('font-claude-message') || 
            el.innerHTML.includes('Claude') || 
            el.querySelector('.prose')) {
          role = 'assistant';
        } else if (el.classList.contains('font-user-message') || el.getAttribute('data-is-user') === 'true') {
          role = 'user';
        } else {
          // Heuristic fallback: alternating structure
          role = (index % 2 === 0) ? 'user' : 'assistant';
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
      console.error("Claude extraction error:", e);
      return { status: "error", error: e.message, messages: [], messageCount: 0 };
    }
  }
};
