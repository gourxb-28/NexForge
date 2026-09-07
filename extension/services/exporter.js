window.NexForge = window.NexForge || {};
window.NexForge.services = window.NexForge.services || {};

window.NexForge.services.exporter = {

  downloadFile: (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  },

  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Modern clipboard API failed, attempting fallback...', err);
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (fallbackErr) {
        console.error('Fallback clipboard copy failed:', fallbackErr);
        return false;
      }
    }
  }
};
