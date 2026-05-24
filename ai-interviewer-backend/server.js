import express from 'express';
import cors from 'cors';
import vm from 'node:vm';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
app.use(cors());
app.use(express.json());

// 1. Create HTTP Server and bind Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { 
    origin: "*", // Allows your React app to connect
    methods: ["GET", "POST"] 
  } 
});

// 2. Handle WebSocket Connections for Audio Streaming
io.on('connection', (socket) => {
  console.log('🟢 User connected to interview room:', socket.id);

  // Listen for the audio chunks from React
  socket.on('user_audio_chunk', (chunk) => {
    // Right now, we just log that we are receiving data.
    // Soon, we will pipe this chunk into Deepgram/OpenAI!
    console.log(`Received audio chunk from ${socket.id}: ${chunk.length} bytes`);
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

// 3. The Code Execution Database
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

// 4. The Code Execution API Endpoint
app.post('/api/execute', (req, res) => {
  const { code, problemId } = req.body;
  const testCases = problemDatabase[problemId];

  if (!testCases) {
    return res.status(404).json({ error: 'Problem not found on server.' });
  }

  const results = testCases.map((testCase) => {
    const stringifiedExpected = JSON.stringify(testCase.expected);
    
    // Dynamically format the input display string based on the problem
    const inputKeys = Object.keys(testCase.input);
    const inputDisplay = inputKeys.map(k => `${k}: ${JSON.stringify(testCase.input[k])}`).join(', ');

    try {
      const sandbox = {};
      vm.createContext(sandbox);

      // Determine the function name based on the problem ID to invoke it correctly
      let functionName = 'twoSum';
      if (problemId === 'fizz-buzz') functionName = 'fizzBuzz';
      if (problemId === 'valid-palindrome') functionName = 'isPalindrome';
      if (problemId === 'binary-search') functionName = 'search';
      if (problemId === 'contains-duplicate') functionName = 'containsDuplicate';

      // Pass the arguments dynamically
      const args = inputKeys.map(k => JSON.stringify(testCase.input[k])).join(', ');

      const wrapperScript = `
        ${code}
        if (typeof ${functionName} !== 'function') {
          throw new Error("Function '${functionName}' is not defined. Did you change the boilerplate name?");
        }
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

// 5. Start the server using httpServer (not app.listen)
httpServer.listen(3001, () => {
  console.log(`🚀 Code execution and WebSocket backend running on http://localhost:3001`);
});