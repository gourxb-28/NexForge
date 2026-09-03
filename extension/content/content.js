window.NexForge = window.NexForge || {};

window.NexForge.getActiveAdapter = function() {
  const url = window.location.href;
  const adapters = window.NexForge.adapters || {};
  
  for (const key in adapters) {
    if (adapters[key].matches(url)) {
      return adapters[key];
    }
  }
  return null;
};

if (!window.NexForge.listenerAdded) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const adapter = window.NexForge.getActiveAdapter();
    
    if (request.action === 'detect_platform') {
      if (adapter) {
        sendResponse({ 
          status: 'supported', 
          platform: adapter.name, 
          platformId: adapter.id 
        });
      } else {
        sendResponse({ status: 'unsupported' });
      }
    } 
    else if (request.action === 'extract_conversation') {
      if (adapter) {
        const data = adapter.extractMessages();
        sendResponse(data);
      } else {
        sendResponse({ status: 'error', error: 'No active adapter found.' });
      }
    }
    
  });
  window.NexForge.listenerAdded = true;
  console.log("NexForge content script listening for extraction requests.");
}
