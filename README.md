# 🤖 AI Technical Interviewer

An advanced, full-stack AI coding interviewer platform. This application simulates a real-world technical interview by parsing a candidate's resume, asking personalized questions via real-time voice synthesis, dynamically serving LeetCode-style programming challenges, and securely grading the candidate's code execution.

---

## Key Features

*   **Intelligent Resume Parsing:** Uses a Node.js-to-Python bridge (`PyPDF2`) to extract candidate context and personalize the AI's opening questions based on their actual experience.
*   **Real-Time Voice AI:** Lightning-fast Speech-to-Text (STT) and Text-to-Speech (TTS) using **Deepgram**, powered by a **Groq (LLaMA 3.1)** brain.
*   **Human-like Interruption Handling:** The AI naturally stops talking and clears its audio queue if the candidate interrupts it mid-sentence.
*   **Dynamic Code Execution:** A LeetCode-style Monaco editor that securely executes candidate JavaScript code against hidden backend test cases using Node's native `vm` module.
*   **Post-Interview Scorecard:** Automatically generates a strictly structured JSON evaluation of the candidate's Data Structures, Problem Solving, and Communication skills, along with a final hire/no-hire decision.

---

## System Architecture

The application is split into a decoupled frontend and backend, communicating via a mix of REST APIs and real-time WebSockets.

### 1. The Real-Time Interview Loop (WebSocket)
1. **Audio Capture:** The candidate speaks into the React frontend. Raw audio blobs are streamed via WebSockets (`socket.io`) to the Node.js backend.
2. **Transcription:** Node.js forwards the audio stream to **Deepgram's** STT WebSocket.
3. **Inference:** Once Deepgram detects the user has stopped speaking, the transcribed text is added to the conversation history and sent to **Groq (LLaMA 3.1)**.
4. **Synthesis & Playback:** The AI's text response is sent to Deepgram's TTS API, converted to an MP3 buffer, and streamed back to the frontend to be played in an audio queue.

### 2. The Code Execution Engine (REST + `vm`)
1. **Dynamic Fetching:** The frontend fetches rich problem data (Description, Examples, Constraints, Starter Code) from `GET /api/problems/:id`.
2. **Execution:** When the candidate clicks "Run Code", the code is sent to `POST /api/execute`.
3. **Sandboxing:** The backend instantiates a fresh `vm.createContext()` (V8 Virtual Machine) to run the untrusted candidate code safely with a timeout wrapper.
4. **AI Context Injection:** The test results (Pass/Fail) are silently injected into the AI's system prompt so it can seamlessly comment on the candidate's code performance in its next verbal response.

### 3. The Python Resume Bridge
Node.js PDF parsing libraries are often outdated or incompatible with ES Modules. This app utilizes an inter-process communication bridge: Multer temporarily saves the uploaded PDF, Node spawns a `child_process` to execute a Python script (`PyPDF2`), captures the `stdout` text, and instantly deletes the file.

---

## Tech Stack

**Frontend:**
*   **Framework:** React 18 + Vite (TypeScript)
*   **Styling:** Tailwind CSS + Lucide Icons
*   **Editor:** `@monaco-editor/react`
*   **State & Sockets:** React Hooks + `socket.io-client`

**Backend:**
*   **Server:** Node.js + Express
*   **Real-time:** `socket.io`
*   **File Parsing:** Python 3 (`PyPDF2`) + Node `child_process`
*   **Code Sandbox:** Node native `vm` module

**AI & APIs:**
*   **LLM Inference:** Groq Cloud (LLaMA 3.1 8b Instant)
*   **Voice APIs:** Deepgram (Nova-3 STT, Aura-Asteria TTS)

---

## Environment Variables

Create a `.env` file in the **`ai-interviewer-backend`** directory with your API keys:

```env
GROQ_API_KEY=your_groq_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

# 1. Build and Run the Backend Container (Node + Python)
  cd ai-interviewer-backend

  ## Build the image \
  docker build -t ai-backend:latest .

  ## Run the container (Pass your API keys securely at runtime!)
  ```
docker run -d \
    -p 3001:3001 \
    -e GROQ_API_KEY="your_groq_key" \
    -e DEEPGRAM_API_KEY="your_deepgram_key" \
    ai-backend:latest
```
# 2. Build and Run the Frontend Container (Multi-stage Nginx)
  cd frontend

  ## Build the image
  docker build -t ai-frontend:latest .
  
  ## Run the container
  docker run -d -p 80:80 ai-frontend:latest

# 📂 Project Structure
~~~
├── ai-interviewer-backend/
│   ├── server.js           # Express & Socket.io server entry
│   ├── problems.js         # Dynamic LeetCode problem database
│   ├── pdf_parser.py       # Python script for resume extraction
│   ├── Dockerfile          # Node + Python Alpine environment
│   ├── .dockerignore
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # React UI (Dashboard, InterviewRoom, CodeEditor)
    │   ├── hooks/          # Custom hooks (useAudioStreamer)
    │   ├── types.ts        # Shared TypeScript interfaces
    │   └── App.tsx
    ├── Dockerfile          # Multi-stage Nginx build
    ├── .dockerignore
    └── package.json
~~~
