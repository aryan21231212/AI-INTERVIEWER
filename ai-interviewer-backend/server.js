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

// Initialize Groq
const groq = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1" 
});

// Keep track of active timers for each connected user to handle silence debouncing
const userSilenceTimers = new Map();

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // Session-scoped history (resets when you refresh the page)
  const conversationHistory = [
    { 
      role: "system", 
      content: "You are a realistic, senior human technical interviewer. Follow these rules strictly:\n1. Keep responses under 2 short sentences.\n2. Never ask multi-part or compound questions. Ask exactly ONE clear question at a time.\n3. Acknowledge what the user said naturally, like a human would.\n4. If the user's input seems cut off or partial, just ask them to continue gently." 
    }
  ];

  // 1. Connect directly to Deepgram
  const deepgramUrl = 'wss://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&interim_results=true';
  const dgConnection = new WebSocket(deepgramUrl, {
    headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}` }
  });

  dgConnection.on('open', () => {
    console.log('⚡ Deepgram WebSocket connection opened');
  });

  // 2. Forward incoming audio chunks from React to Deepgram
  socket.on('user_audio_chunk', (chunk) => {
    if (dgConnection.readyState === WebSocket.OPEN) {
      dgConnection.send(chunk);
    }
  });

  // Maintain a local buffer of the user's active sentence fragments
  let speechBuffer = "";

  // 3. Receive Text Transcriptions back from Deepgram (ULTRA-SMOOTH PIPELINE)
  dgConnection.on('message', async (data) => {
    const response = JSON.parse(data);
    
    if (response.type === 'Results') {
      const transcript = response.channel.alternatives[0].transcript.trim();
      if (transcript === '') return; // Ignore pure silence

      // A. INTELLIGENT BARGE-IN (Interim Results)
      if (!response.is_final) {
        if (transcript.length > 2) {
          // The user is actively speaking right now! Shut the AI up.
          socket.emit('ai_interrupted');
          
          // Clear any pending LLM execution timers because the user isn't done speaking
          if (userSilenceTimers.has(socket.id)) {
            clearTimeout(userSilenceTimers.get(socket.id));
          }
        }
        return; 
      }

      // B. BUFFER SPEECH (Final fragments)
      speechBuffer += " " + transcript;

      // C. SILENCE DEBOUNCE FILTER
      if (userSilenceTimers.has(socket.id)) {
        clearTimeout(userSilenceTimers.get(socket.id));
      }

      // Wait 800ms of complete silence before sending to Groq
      const timeoutId = setTimeout(async () => {
        const finalPhrase = speechBuffer.trim();
        speechBuffer = ""; // Reset buffer for the next conversational turn

        // Ignore meaningless snippets or pure filler words (breathing, clicking, etc.)
        if (finalPhrase.length <= 2 || ["uh", "um", "ah", "okay", "so"].includes(finalPhrase.toLowerCase())) {
          return;
        }

        console.log("🗣️ Candidate said:", finalPhrase);
        conversationHistory.push({ role: "user", content: finalPhrase });

        try {
          // Send to Groq
          const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: conversationHistory,
          });

          const aiResponseText = completion.choices[0].message.content;
          conversationHistory.push({ role: "assistant", content: aiResponseText });
          
          console.log("🤖 AI Interviewer says:", aiResponseText);
          socket.emit('ai_text_response', { text: aiResponseText });

          // Generate Speech using Deepgram TTS
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
      }, 800); // <-- The 800ms magic pause threshold

      userSilenceTimers.set(socket.id, timeoutId);
    }
  });

  // 4. Receive Code Updates from React
  socket.on('code_update', (data) => {
    const { code, testResults } = data;
    const passedCount = testResults.filter(r => r.passed).length;
    const totalCount = testResults.length;
    
    const systemMessage = `[SYSTEM NOTE: The candidate just ran their code. They passed ${passedCount} out of ${totalCount} test cases. 
    Here is their current code:
    ${code}
    
    Do not critique immediately, but use this context to answer their next question or guide them if they failed.]`;

    console.log(`💻 Candidate ran code: ${passedCount}/${totalCount} passed.`);
    conversationHistory.push({ role: "system", content: systemMessage });
  });

  // 5. The Interview Grader
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
        response_format: { type: "json_object" } 
      });

      const reportData = JSON.parse(completion.choices[0].message.content);
      console.log("📊 Report Generated:", reportData);
      socket.emit('interview_report', reportData);

    } catch (error) {
      console.error("Grading Generation Error:", error);
    }
  });

  dgConnection.on('error', (error) => {
    console.error("Deepgram WebSocket Error:", error);
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
    if (userSilenceTimers.has(socket.id)) {
      clearTimeout(userSilenceTimers.get(socket.id));
      userSilenceTimers.delete(socket.id);
    }
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