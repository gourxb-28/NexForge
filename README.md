# NexForge - AI Chat Context Portability

NexForge is a Chrome extension that helps preserve and transfer context across AI conversations and different AI platforms.

## 🚨 Problem Statement

Long-running conversations with AI assistants like ChatGPT, Claude, and Gemini often contain valuable project context, including technical requirements, architectural decisions, code changes, constraints, errors, and pending tasks.

However, when conversations reach context limits or users hit usage restrictions, they often need to start a new chat. The new conversation does not automatically have access to the previous conversation's complete history, forcing users to explain their projects all over again.

Manually transferring context is time-consuming and repetitive. Important details can be missed, technical decisions may need to be explained again, and switching between AI platforms becomes difficult.

**The problem is the lack of a simple, reliable way to preserve and transfer context across AI conversations and platforms.**

## 💡 Proposed Solution

NexForge is a Chrome extension that transforms AI conversation history into a structured, reusable continuation prompt.

With a single click, NexForge extracts available conversation messages from supported AI platforms and sends the normalized history to a Gemini-powered backend. The backend identifies essential project information, including goals, technology stacks, requirements, constraints, completed work, errors, and next steps, and organizes it into a structured format.

Users can choose from four compression modes: Compact, Balanced, Detailed, and Maximum Context, review and edit the generated continuation prompt, and export it as `.md`, `.txt` or `.json` .

The resulting prompt then can be pasted into a new AI chat, helping the assistant understand the existing project context and continue the work with less repetitive explanation.

## 🚀 Features

*   **Universal Compatibility:** Works with ChatGPT, Claude, and Google Gemini.
*   **Privacy-First Extraction:** Uses Manifest V3 and the `activeTab` permission. It only reads the webpage when you explicitly click the extension button.
*   **Gemini AI Processing:** Uses a FastAPI backend to understand technical requirements, constraints, and architecture from your chat history.
*   **Smart Compression:** Offers Compact, Balanced, Detailed, and Maximum Context modes to fit your specific char limits.
*   **Editable Preview:** Review and edit the generated continuation prompt before exporting.
*   **Flexible Exports:** One-click copy to clipboard, or download as `.md`, `.txt`, and  `.json`.

## 🛠️ Technology Stack

### Frontend — Chrome Extension

- JavaScript
- HTML
- CSS
- Chrome Extension API
- Manifest V3

### Backend
- Python3
- FastAPI
- Uvicorn
- Gemini 3.5 Flash-Lite
- Pydantic

## 🏗️ Architecture & Data Flow

NexForge follows a modular pipeline that converts raw conversation history into a structured continuation prompt.

1. **Detection (`popup.js` & `content.js`):** The extension identifies the active tab and checks whether the current webpage belongs to a supported AI platform.
2. **Extraction (Platform Adapters):** Platform-specific adapters, such as `chatgpt.js`, read available messages from the webpage DOM and preserve their roles and text.
3. **Normalization (`normalizer.js`):** Extracted conversation data is converted into a standardized internal JSON format.
4. **Context Generation (FastAPI Backend):** The normalized conversation history is sent to the backend, which uses `Gemini 3.5 Flash-Lite` to identify important project information and organize it into a structured format validated using Pydantic.
5. **Compression (`compressor.js`):** The structured context is filtered and formatted into Markdown according to the selected compression mode, with limits on included information to prevent unnecessarily large prompts.
6. **Package Assembly (`packageBuilder.js`):** The final continuation prompt is assembled with relevant context, timestamps, and metadata.
7. **Preview & Export (`exporter.js`):** The extension displays the generated prompt and supports manual editing, clipboard copying, and file downloads.

## 💻 Local Installation & Setup

### 1. Clone the Repository

Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/NexForge.git
cd NexForge
```

### 2. Set Up the FastAPI Backend

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv venv
```

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate
```

**macOS/Linux:**

```bash
source venv/bin/activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_key_here
```

Get your API key from [Google AI Studio](https://aistudio.google.com/).

### 4. Start the Backend Server

Run the following command from the `backend` directory:

```bash
uvicorn app.main:app --reload
```
The backend should now be running at `http://127.0.0.1:8000`.

### 5. Load the Chrome Extension

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `extension` folder inside your cloned NexForge repository.
5. Pin the NexForge extension to your browser toolbar.

### 6. Start Using NexForge

1. Open a conversation on ChatGPT, Claude, or Google Gemini.
2. Click the NexForge extension icon.
3. Select your preferred compression mode.
4. Click **Generate Context**.
5. Review and edit the generated prompt.
6. Copy or download it and paste it into a new AI conversation.



## 🧪 Testing & Usage

1. Open a technical conversation on ChatGPT, Claude, or Google Gemini.
2. **Load older messages:** Scroll upward to load older parts of the conversation, if necessary.
3. Click the NexForge extension icon in the browser toolbar.
4. Select the desired **Compression Mode**.
5. Click **Generate Context** to begin processing.
6. Wait while NexForge extracts and analyzes the available conversation history.
7. Review the generated continuation prompt in the preview box.
8. Edit the prompt manually if any information needs correction or additional detail.
9. Click **Copy Prompt** or download the prompt as a `.md`, `.txt`, or `.json` file.
10. Open a new conversation on a supported AI platform and paste the generated prompt.
11. Continue working with the relevant project context without manually explaining everything again.



## 🔒 Privacy and Security

*   **No Passive Tracking:** The extension has no background scripts actively reading your tabs. It only injects scripts when you click the popup (`activeTab` permission).
*   **Secure API Handling:** API keys are never stored in the browser extension. They remain strictly on your local Python backend.
*   **No Cloud Storage:** NexForge does not save your conversations to a database. All processing happens locally or directly via the official Google Gemini API, after which the data is discarded.



## ⚠️ Limitations

- **DOM Virtualization:** AI platforms may render only a portion of a long conversation at a time. NexForge can extract only the messages available in the webpage DOM, so older messages may need to be loaded by scrolling.
- **Platform UI Changes:** Changes to the HTML structure of ChatGPT, Claude, or Gemini may require updates to the corresponding platform adapters.
- **Context Compression:** Compression may omit minor details. Reviewing the generated prompt is recommended before continuing important work.
- **Model Limitations:** The quality of extracted context depends on the source conversation, the configured Gemini model, and the quality of the generated structured output.
- **No Guaranteed Exact Continuation:** NexForge preserves relevant information, but a new AI conversation may not reproduce every detail, decision, or response from the original conversation.

## 🔮 Future Improvements

- **Local Context Storage:** Add an optional local vector database such as ChromaDB to store and retrieve previous context packages.
- **More Platform Integrations:** Extend compatibility to Perplexity, GitHub Copilot, and other AI assistants.
- **Incremental Context Updates:** Update existing context using new conversation messages instead of processing the entire history again.
- **Token-Aware Compression:** Estimate token usage and optimize prompts for different models' context windows.
- **Context Quality Checks:** Detect missing information, conflicting decisions, and incomplete next steps before exporting.
- **Improved Extraction:** Improve handling of long, virtualized conversations while maintaining user control over webpage access.
- **Additional Export Formats:** Explore support for other portable formats and direct continuation workflows.

## 🎯 Project Objective

NexForge aims to reduce repetitive explanations, minimize context loss, and improve continuity across AI-assisted workflows by making conversation context **structured, editable, and portable**.

**NexForge, Forge your context. Continue without starting over.**
