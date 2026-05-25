import express from 'express';
import cors from 'cors';
import vm from 'node:vm';
import { createServer } from 'http';
import { Server } from 'socket.io';
import WebSocket from 'ws';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] } 
});

// Initialize Groq (Using the OpenAI SDK pointing to Groq's API)
const groq = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1" 
});

const conversationHistory = [
  { role: "system", content: "You are a strict but helpful technical interviewer. Keep responses under 2 sentences. Sound natural and conversational." }
];

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // 1. Connect directly to Deepgram using standard WebSockets
  const deepgramUrl = 'wss://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&interim_results=true';
  const dgConnection = new WebSocket(deepgramUrl, {
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`
    }
  });

  // 3. Receive Text Transcriptions back from Deepgram
  dgConnection.on('message', async (data) => {
    const response = JSON.parse(data);
    
    if (response.type === 'Results') {
      const transcript = response.channel.alternatives[0].transcript.trim();
      if (transcript === '') return; // Ignore silence

      // NEW: Interruption Logic
      if (!response.is_final) {
        // The user is actively speaking right now! Tell the frontend to stop AI audio.
        socket.emit('ai_interrupted');
        return; 
      }

      // If it is final, process it normally through Groq!
      console.log("🗣️ Candidate said:", transcript);
      conversationHistory.push({ role: "user", content: transcript });

      try {
        const completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: conversationHistory,
        });

        const aiResponseText = completion.choices[0].message.content;
        conversationHistory.push({ role: "assistant", content: aiResponseText });
        
        console.log("🤖 AI Interviewer says:", aiResponseText);
        
        socket.emit('ai_text_response', { text: aiResponseText });

        const ttsResponse = await fetch("https://api.deepgram.com/v1/speak?model=aura-asteria-en", {
          method: "POST",
          headers: {
            "Authorization": `Token ${process.env.DEEPGRAM_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ text: aiResponseText })
        });

        const buffer = Buffer.from(await ttsResponse.arrayBuffer());
        socket.emit('ai_audio_response', { audio: buffer });

      } catch (error) {
        console.error("AI Pipeline Error:", error);
      }
    }
  });

  // ==========================================
  // NEW: Receive Code Updates from React
  // ==========================================
  socket.on('code_update', (data) => {
    const { code, testResults } = data;
    
    // Calculate how many tests passed
    const passedCount = testResults.filter(r => r.passed).length;
    const totalCount = testResults.length;
    
    // Inject a secret system prompt so the AI knows what just happened
    const systemMessage = `[SYSTEM NOTE: The candidate just ran their code. They passed ${passedCount} out of ${totalCount} test cases. 
    Here is their current code:
    ${code}
    
    Do not critique immediately, but use this context to answer their next question or guide them if they failed.]`;

    console.log(`💻 Candidate ran code: ${passedCount}/${totalCount} passed.`);
    
    // Add to the AI's memory
    conversationHistory.push({ role: "system", content: systemMessage });
  });
  // ==========================================

  // 2. Forward incoming audio chunks from React straight to Deepgram
  socket.on('user_audio_chunk', (chunk) => {
    if (dgConnection.readyState === WebSocket.OPEN) {
      dgConnection.send(chunk);
    }
  });

  // ==========================================
  // NEW: The Interview Grader
  // ==========================================
  socket.on('end_interview', async () => {
    console.log("🛑 Interview ended. Generating report...");
    
    const gradingPrompt = {
      role: "system",
      content: `The interview is now over. Evaluate the candidate based on the entire conversation history.
      You MUST return your response as a valid JSON object with the exact following structure:
      {
        "scores": {
          "dataStructures": <number 1-10>,
          "problemSolving": <number 1-10>,
          "communication": <number 1-10>
        },
        "feedback": "<2-3 sentences of constructive feedback>",
        "hireDecision": "<Strong Hire, Hire, Leaning No Hire, or No Hire>"
      }`
    };

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [...conversationHistory, gradingPrompt],
        response_format: { type: "json_object" } // This guarantees JSON output!
      });

      const reportData = JSON.parse(completion.choices[0].message.content);
      console.log("📊 Report Generated:", reportData);
      
      // Send the report back to the React UI
      socket.emit('interview_report', reportData);

    } catch (error) {
      console.error("Grading Generation Error:", error);
    }
  });
  // ==========================================

  // 3. Receive Text Transcriptions back from Deepgram
  dgConnection.on('message', async (data) => {
    const response = JSON.parse(data);
    
    // Ensure it's a final transcript and not empty background noise
    if (response.type === 'Results' && response.channel.alternatives[0].transcript.trim() !== '') {
      const transcript = response.channel.alternatives[0].transcript;
      
      console.log("🗣️ Candidate said:", transcript);
      conversationHistory.push({ role: "user", content: transcript });

      try {
        // A. Send to Groq for ultra-fast LLaMA 3 response
        const completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: conversationHistory,
        });

        const aiResponseText = completion.choices[0].message.content;
        conversationHistory.push({ role: "assistant", content: aiResponseText });
        
        console.log("🤖 AI Interviewer says:", aiResponseText);
        
        // Emit text back to the React UI
        socket.emit('ai_text_response', { text: aiResponseText });

        // B. Generate Speech using Deepgram TTS REST API
        const ttsResponse = await fetch("https://api.deepgram.com/v1/speak?model=aura-asteria-en", {
          method: "POST",
          headers: {
            "Authorization": `Token ${process.env.DEEPGRAM_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ text: aiResponseText })
        });

        const buffer = Buffer.from(await ttsResponse.arrayBuffer());
        socket.emit('ai_audio_response', { audio: buffer });

      } catch (error) {
        console.error("AI Pipeline Error:", error);
      }
    }
  });

  dgConnection.on('error', (error) => {
    console.error("Deepgram WebSocket Error:", error);
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
    if (dgConnection.readyState === WebSocket.OPEN) {
      dgConnection.close();
    }
  });
});

// --- CODE EXECUTION DATABASE & API ---
const problemDatabase = {
  'two-sum': [
    { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
    { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] }
  ],
  'fizz-buzz': [
    { input: { n: 3 }, expected: ["1", "2", "Fizz"] },
    { input: { n: 5 }, expected: ["1", "2", "Fizz", "4", "Buzz"] }
  ],
  'valid-palindrome': [
    { input: { s: "A man, a plan, a canal: Panama" }, expected: true },
    { input: { s: "race a car" }, expected: false }
  ],
  'binary-search': [
    { input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 }, expected: 4 },
    { input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 }, expected: -1 }
  ],
  'contains-duplicate': [
    { input: { nums: [1, 2, 3, 1] }, expected: true },
    { input: { nums: [1, 2, 3, 4] }, expected: false }
  ]
};

app.post('/api/execute', (req, res) => {
  const { code, problemId } = req.body;
  const testCases = problemDatabase[problemId];

  if (!testCases) return res.status(404).json({ error: 'Problem not found on server.' });

  const results = testCases.map((testCase) => {
    const stringifiedExpected = JSON.stringify(testCase.expected);
    const inputKeys = Object.keys(testCase.input);
    const inputDisplay = inputKeys.map(k => `${k}: ${JSON.stringify(testCase.input[k])}`).join(', ');

    try {
      const sandbox = {};
      vm.createContext(sandbox);

      let functionName = 'twoSum';
      if (problemId === 'fizz-buzz') functionName = 'fizzBuzz';
      if (problemId === 'valid-palindrome') functionName = 'isPalindrome';
      if (problemId === 'binary-search') functionName = 'search';
      if (problemId === 'contains-duplicate') functionName = 'containsDuplicate';

      const args = inputKeys.map(k => JSON.stringify(testCase.input[k])).join(', ');

      const wrapperScript = `
        ${code}
        if (typeof ${functionName} !== 'function') throw new Error("Function missing.");
        ${functionName}(${args});
      `;

      const script = new vm.Script(wrapperScript);
      const rawOutput = script.runInContext(sandbox, { timeout: 1000 });
      
      const stringifiedActual = JSON.stringify(rawOutput);
      const passed = stringifiedActual === stringifiedExpected;

      return { passed, input: inputDisplay, expected: stringifiedExpected, actual: stringifiedActual || 'undefined' };
    } catch (error) {
      return { passed: false, input: inputDisplay, expected: stringifiedExpected, actual: 'Execution Error', error: error.message };
    }
  });

  res.json({ results });
});

httpServer.listen(3001, () => {
  console.log(`🚀 AI Backend running on http://localhost:3001`);
});