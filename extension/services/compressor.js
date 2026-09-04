window.NexForge = window.NexForge || {};
window.NexForge.services = window.NexForge.services || {};

window.NexForge.services.compressor = {
  compress: (context, title, mode, originalMessages) => {
    let maxItems = 5;
    let includeStack = true;
    let includeArchitecture = true;
    let includeHistory = true;
    let includeRawMessages = false;

    switch (mode) {
      case 'compact':
        maxItems = 2; 
        includeStack = false;
        includeArchitecture = false;
        includeHistory = false; 
        break;
      case 'balanced':
        maxItems = 5; 
        break;
      case 'detailed':
        maxItems = 15; 
        break;
      case 'maximum':
        maxItems = 50; 
        includeRawMessages = true; 
        break;
    }

    
    const formatSection = (sectionTitle, arr, limit) => {
      const unique = [...new Set(arr)].filter(Boolean).slice(0, limit);
      if (unique.length === 0) return "";
      return `\n## ${sectionTitle}\n` + unique.map(item => `* ${item}`).join('\n');
    };

    let prompt = `# Context Transfer: ${title}\n\n`;
    
    
    const overview = [...new Set(context.overview)].slice(0, maxItems).join(' ');
    if (overview) {
      prompt += `## Project Goal\n${overview}\n`;
    }

    if (includeStack && context.techStack.size > 0) {
      prompt += `\n## Tech Stack\n* ${Array.from(context.techStack).slice(0, maxItems).join(', ')}\n`;
    }

    prompt += formatSection("Requirements", context.requirements, maxItems > 2 ? maxItems : 5);
    prompt += formatSection("Important Constraints", context.constraints, maxItems > 2 ? maxItems : 5);
    
    if (includeArchitecture) {
      prompt += formatSection("Architecture & Files", context.architecture, maxItems);
      prompt += formatSection("Important Decisions", context.decisions, maxItems);
    }

    if (includeHistory) {
      prompt += formatSection("Completed Work (Recent)", context.completedWork, maxItems);
      prompt += formatSection("Recent Errors & Debugging", context.errors, maxItems);
    }

    prompt += formatSection("Pending Tasks", context.pendingTasks, maxItems);

    if (context.nextStep) {
      prompt += `\n## Immediate Next Step\n${context.nextStep}\n`;
    } else {
      prompt += `\n## Immediate Next Step\nInspect the current state and ask how to proceed.\n`;
    }

    if (includeRawMessages && originalMessages && originalMessages.length > 0) {
      prompt += `\n## Recent Conversation Transcript (Max Mode)\n`;
      const recentMessages = originalMessages.slice(-5); 
      recentMessages.forEach(msg => {
         const roleName = msg.role === 'user' ? 'User' : 'AI';
         prompt += `**${roleName}:**\n${msg.content.substring(0, 500)}${msg.content.length > 500 ? '...\n' : '\n\n'}`;
      });
    }

    prompt += `\n## Instructions for the Receiving AI\nRead the context carefully. Continue from the existing state, respect the constraints, and ask for relevant files only when necessary.\n`;

    const cleanPrompt = prompt.trim();
    const charCount = cleanPrompt.length;
    const wordCount = cleanPrompt.split(/\s+/).length;

    return {
      text: cleanPrompt,
      charCount: charCount,
      wordCount: wordCount
    };
  }
};
