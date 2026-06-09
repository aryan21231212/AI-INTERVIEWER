import express from 'express';
import cors from 'cors';
import vm from 'node:vm';
import { createServer } from 'http';
import { Server } from 'socket.io';
import WebSocket from 'ws';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import multer from 'multer';

// Node.js built-in tools to run Python and manage files
import { exec } from 'node:child_process';
import util from 'node:util';
import fs from 'node:fs';

// NEW: Import our dynamic problems database!
import  {problems}  from './problem.js';

const execAsync = util.promisify(exec);
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Set Multer to save files to a temporary 'uploads' folder on your disk
const upload = multer({ dest: 'uploads/' });

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] } 
});

const groq = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1" 
});

const userSilenceTimers = new Map();

// ==========================================
// THE BULLETPROOF PYTHON BRIDGE
// ==========================================
app.post('/api/parse-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📄 Received PDF: ${req.file.originalname}, handing off to Python...`);
    const filePath = req.file.path;

    // Execute the Python script and pass the file path
    const { stdout, stderr } = await execAsync(`python3 pdf_parser.py "${filePath}"`);

    // Immediately delete the file from the server to save space
    fs.unlinkSync(filePath);

    if (stderr) console.warn("Python Warning:", stderr);

    // Clean up the extracted text
    const cleanText = stdout.replace(/\s+/g, ' ').trim();

    console.log(`✅ Python successfully extracted ${cleanText.length} characters of text!`);
    res.json({ text: cleanText });

  } catch (error) {
    console.error('Python Parsing Error:', error);
    // Ensure file gets deleted even if Python crashes
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Failed to parse PDF' });
  }
});
// ==========================================


io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // Leave history empty initially
  let conversationHistory = [];

  // ==========================================
  // NEW: Initialize the AI with the Resume
  // ==========================================
  socket.on('initialize_session', async (config) => {
    const { role, level, resumeText } = config;
    
    // Truncate resume text just in case it's massive to save LLM tokens
    const truncatedResume = resumeText.substring(0, 2500);

    const systemPrompt = `You are a realistic, senior human technical interviewer hiring for a ${level} ${role} position.
    Here is the candidate's parsed resume:
    ---
    ${truncatedResume}
    ---
    Follow these rules strictly:
    1. Keep responses under 2 short sentences.
    2. Never ask multi-part or compound questions. Ask exactly ONE clear question at a time.
    3. Acknowledge their specific experience from the resume naturally.
    4. Start the interview immediately.`;

    conversationHistory.push({ role: "system", content: systemPrompt });
    console.log(`🧠 AI Brain initialized for ${level} ${role} with resume context.`);

    // TRIGGER THE FIRST GREETING AUTOMATICALLY
    try {
      // Secretly simulate the user saying "I'm ready" so the AI speaks first
      const initMessage = [...conversationHistory, { role: "user", content: "Hi, I'm ready to start the interview." }];
      
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: initMessage,
      });

      const aiResponseText = completion.choices[0].message.content;
      conversationHistory.push({ role: "assistant", content: aiResponseText });
      
      console.log("🤖 AI Interviewer starts:", aiResponseText);
      socket.emit('ai_text_response', { text: aiResponseText });

      // Generate the opening audio
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
      console.error("AI Initialization Error:", error);
    }
  });
  // ==========================================

  const deepgramUrl = 'wss://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&interim_results=true';
  const dgConnection = new WebSocket(deepgramUrl, {
    headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}` }
  });

  dgConnection.on('open', () => {
    console.log('⚡ Deepgram WebSocket connection opened');
  });

  socket.on('user_audio_chunk', (chunk) => {
    if (dgConnection.readyState === WebSocket.OPEN) {
      dgConnection.send(chunk);
    }
  });

  let speechBuffer = "";

  dgConnection.on('message', async (data) => {
    const response = JSON.parse(data);
    
    if (response.type === 'Results') {
      const transcript = response.channel.alternatives[0].transcript.trim();
      if (transcript === '') return; 

      if (!response.is_final) {
        if (transcript.length > 2) {
          socket.emit('ai_interrupted');
          if (userSilenceTimers.has(socket.id)) {
            clearTimeout(userSilenceTimers.get(socket.id));
          }
        }
        return; 
      }

      speechBuffer += " " + transcript;

      if (userSilenceTimers.has(socket.id)) {
        clearTimeout(userSilenceTimers.get(socket.id));
      }

      const timeoutId = setTimeout(async () => {
        const finalPhrase = speechBuffer.trim();
        speechBuffer = ""; 

        if (finalPhrase.length <= 2 || ["uh", "um", "ah", "okay", "so"].includes(finalPhrase.toLowerCase())) {
          return;
        }

        console.log("🗣️ Candidate said:", finalPhrase);
        conversationHistory.push({ role: "user", content: finalPhrase });

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
      }, 800); 

      userSilenceTimers.set(socket.id, timeoutId);
    }
  });

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

// ==========================================
// DYNAMIC CODING API ENDPOINTS
// ==========================================

// 1. Fetch Problem Details (Title, Description, Starter Code)
app.get('/api/problems/:id', (req, res) => {
  const problemId = req.params.id;
  const problem = problems[problemId];

  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  // Hide the expected testcase answers from the frontend!
  res.json({
    id: problem.id,
    title: problem.title,
    difficulty: problem.difficulty,
    timeLimit: problem.timeLimit,
    description: problem.description,
    examples: problem.examples,
    constraints: problem.constraints,
    starterCode: problem.starterCode
  });
});

// 2. Execute Code dynamically based on the problems.js database
app.post('/api/execute', (req, res) => {
  const { code, problemId } = req.body;
  const problem = problems[problemId];

  if (!problem) return res.status(404).json({ error: 'Problem not found on server.' });

  const results = problem.testCases.map((testCase) => {
    const stringifiedExpected = JSON.stringify(testCase.expected);
    const inputKeys = Object.keys(testCase.input);
    const inputDisplay = inputKeys.map(k => `${k}: ${JSON.stringify(testCase.input[k])}`).join(', ');

    try {
      const sandbox = {};
      vm.createContext(sandbox);
      
      // Auto-extract function name from the starter code
      const funcNameMatch = problem.starterCode.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
      if (!funcNameMatch) throw new Error("Could not find function signature.");
      const functionName = funcNameMatch[1];

      const args = inputKeys.map(k => JSON.stringify(testCase.input[k])).join(', ');
      const wrapperScript = `${code}\nif (typeof ${functionName} !== 'function') throw new Error("Function missing.");\n${functionName}(${args});`;
      
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