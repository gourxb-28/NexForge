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

          
          const contextObject = window.NexForge.services.contextGenerator.generateObject(normalizedData);
          
          const modeSelector = document.getElementById('compression-mode');
          const selectedMode = modeSelector.value || 'balanced';
          
          const compressionResult = window.NexForge.services.compressor.compress(
            contextObject, 
            normalizedData.conversationTitle, 
            selectedMode,
            normalizedData.messages
          );

          console.log(`Compression Result (${selectedMode}):`, compressionResult);
          
          
          const cbp = window.NexForge.services.packageBuilder.buildPackage(
            normalizedData,
            contextObject,
            compressionResult,
            selectedMode
          );
          
          console.log("Context Package Built:", cbp);
          window.nexForgePackage = cbp;

          const previewContainer = document.getElementById('preview-container');
          const contextPreview = document.getElementById('context-preview');
          const wordCountEl = document.getElementById('word-count');
          
          contextPreview.value = compressionResult.text;
          if (wordCountEl) wordCountEl.textContent = `~${compressionResult.wordCount} words`;
          previewContainer.style.display = 'block';

          const noticeHtml = `<br><span style="font-size: 11px; color: #d97706; margin-top: 8px; display: block;">Note: AI platforms hide old messages to save memory. Scroll up in the chat to load older messages before extracting.</span>`;

          platformStatus.innerHTML = `<span style="color: #059669;">Context generated! Mode: <strong>${selectedMode}</strong></span>${noticeHtml}`;
          generateBtn.textContent = 'Regenerate Context';
          generateBtn.disabled = false;
          
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

  // Phase 8: Wire up export actions
  const copyBtn = document.getElementById('copy-btn');
  const dlMdBtn = document.getElementById('dl-md-btn');
  const dlJsonBtn = document.getElementById('dl-json-btn');
  const dlTxtBtn = document.getElementById('dl-txt-btn');
  const actionStatus = document.getElementById('action-status');

  function showActionStatus(msg, isError = false) {
    if (!actionStatus) return;
    actionStatus.style.color = isError ? '#dc2626' : '#059669';
    actionStatus.textContent = msg;
    setTimeout(() => { actionStatus.textContent = ''; }, 3000);
  }

  copyBtn.addEventListener('click', async () => {
    if (!window.nexForgePackage) return;
    const editedPrompt = document.getElementById('context-preview').value;
    
    const success = await window.NexForge.services.exporter.copyToClipboard(editedPrompt);
    if (success) {
      showActionStatus('Copied to clipboard!');
    } else {
      showActionStatus('Failed to copy. Please copy manually.', true);
    }
  });

  dlMdBtn.addEventListener('click', () => {
    if (!window.nexForgePackage) return;
    const cbp = window.nexForgePackage;
    cbp.continuationPrompt = document.getElementById('context-preview').value;
    
    const mdContent = window.NexForge.services.packageBuilder.toMarkdown(cbp);
    window.NexForge.services.exporter.downloadFile(mdContent, cbp.exportFiles.markdownFilename, 'text/markdown');
    showActionStatus('Downloaded Markdown file.');
  });

  dlTxtBtn.addEventListener('click', () => {
    if (!window.nexForgePackage) return;
    const cbp = window.nexForgePackage;
    cbp.continuationPrompt = document.getElementById('context-preview').value;
    
    const txtContent = window.NexForge.services.packageBuilder.toPlainText(cbp);
    window.NexForge.services.exporter.downloadFile(txtContent, cbp.exportFiles.txtFilename, 'text/plain');
    showActionStatus('Downloaded Text file.');
  });

  dlJsonBtn.addEventListener('click', () => {
    if (!window.nexForgePackage) return;
    const cbp = window.nexForgePackage;
    cbp.continuationPrompt = document.getElementById('context-preview').value;
    
    const jsonContent = JSON.stringify(cbp, null, 2);
    window.NexForge.services.exporter.downloadFile(jsonContent, cbp.exportFiles.jsonFilename, 'application/json');
    showActionStatus('Downloaded JSON package.');
  });
});
