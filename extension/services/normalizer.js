window.NexForge = window.NexForge || {};
window.NexForge.services = window.NexForge.services || {};

window.NexForge.services.normalizer = {
  normalize: (rawData, platformName) => {
    if (!rawData || !rawData.messages || !Array.isArray(rawData.messages)) {
      throw new Error("Invalid raw data provided for normalization.");
    }

    const normalizedMessages = [];
    let msgId = 1;

    rawData.messages.forEach(msg => {
      const role = (msg.role === 'user' || msg.role === 'assistant') ? msg.role : 'unknown';
      const text = (msg.text || '').trim();

      
      if (text.length > 0) {
        normalizedMessages.push({
          id: msgId++,
          role: role,
          content: text
        });
      }
    });

    return {
      version: "1.0",
      sourcePlatform: platformName,
      exportTimestamp: new Date().toISOString(),
      conversationTitle: rawData.title || "Untitled Conversation",
      messages: normalizedMessages,
      metadata: {
        rawExtractedCount: rawData.messageCount || rawData.messages.length,
        normalizedCount: normalizedMessages.length
      }
    };
  }
};
