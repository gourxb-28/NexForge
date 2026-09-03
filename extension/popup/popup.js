document.addEventListener('DOMContentLoaded', async () => {
  const generateBtn = document.getElementById('generate-btn');
  const platformStatus = document.getElementById('platform-status');

  generateBtn.disabled = true;
  platformStatus.textContent = 'Detecting platform...';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
      showUnsupported('Cannot run on this page.');
      return;
    }

    const supportedDomains = ['chatgpt.com', 'claude.ai', 'gemini.google.com'];
    const isSupported = supportedDomains.some(domain => tab.url.includes(domain));

    if (!isSupported) {
      showUnsupported('Unsupported website. Please open ChatGPT, Claude, or Gemini.');
      return;
    }

    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [
        'content/adapters/chatgpt.js',
        'content/adapters/claude.js',
        'content/adapters/gemini.js',
        'content/content.js'
      ]
    });

    
    chrome.tabs.sendMessage(tab.id, { action: 'detect_platform' }, (response) => {
      if (chrome.runtime.lastError) {
        showUnsupported('Failed to communicate with the page.');
        return;
      }

      if (response && response.status === 'supported') {
        platformStatus.innerHTML = `Detected Platform: <strong>${response.platform}</strong>`;
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
        generateBtn.dataset.platformId = response.platformId;
        generateBtn.dataset.platformName = response.platform;
        generateBtn.dataset.tabId = tab.id;
      } else {
        showUnsupported('Platform not recognized by adapters.');
      }
    });

  } catch (error) {
    console.error("NexForge Detection Error:", error);
    showUnsupported('Error detecting platform.');
  }

  function showUnsupported(message) {
    platformStatus.innerHTML = `<span style="color: #dc2626;">${message}</span>`;
    generateBtn.disabled = true;
    generateBtn.style.opacity = '0.5';
  }


  generateBtn.addEventListener('click', () => {
    const tabId = parseInt(generateBtn.dataset.tabId, 10);
    platformStatus.textContent = 'Extracting conversation...';
    generateBtn.textContent = 'Processing...';
    generateBtn.disabled = true;

    
    chrome.tabs.sendMessage(tabId, { action: 'extract_conversation' }, (response) => {
      if (chrome.runtime.lastError) {
        showUnsupported('Failed to extract: Content script disconnected.');
        return;
      }

      if (response && response.status === 'success') {
        console.log("Raw Extraction:", response);
        
        try {
          const normalizedData = window.NexForge.services.normalizer.normalize(
            response, 
            generateBtn.dataset.platformName
          );
          
          console.log("Normalized Data:", normalizedData);
          window.normalizedData = normalizedData;
          const noticeHtml = `<br><span style="font-size: 11px; color: #d97706; margin-top: 8px; display: block;">Note: AI platforms hide old messages to save memory. Scroll up in the chat to load older messages before extracting.</span>`;

          platformStatus.innerHTML = `<span style="color: #059669;"><strong>${normalizedData.metadata.normalizedCount}</strong> messages normalized.</span>${noticeHtml}`;
          generateBtn.textContent = 'Normalization Complete';
          
        } catch (err) {
          console.error("Normalization Error:", err);
          showUnsupported("Failed to normalize conversation data.");
          generateBtn.textContent = 'Generate Context';
          generateBtn.disabled = false;
        }
        
      } else if (response && (response.status === 'empty' || response.status === 'error')) {
        showUnsupported(response.error || 'No messages found.');
        generateBtn.textContent = 'Generate Context';
        generateBtn.disabled = false;
      } else {
        showUnsupported('An unknown error occurred during extraction.');
        generateBtn.textContent = 'Generate Context';
        generateBtn.disabled = false;
      }
    });
  });
});
