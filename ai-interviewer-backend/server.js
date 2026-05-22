import express from 'express';
import cors from 'cors';
import vm from 'node:vm';

const app = express();
app.use(cors());
app.use(express.json());

// Hardcoded problem definitions and test cases
const problemDatabase = {
  'two-sum': [
    { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
    { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
    { input: { nums: [3, 3], target: 6 }, expected: [0, 1] }
  ]
};

app.post('/api/execute', (req, res) => {
  const { code, problemId } = req.body;
  const testCases = problemDatabase[problemId];

  if (!testCases) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  const results = testCases.map((testCase) => {
    const stringifiedExpected = JSON.stringify(testCase.expected);
    const inputDisplay = `nums: \${JSON.stringify(testCase.input.nums)}, target: \${testCase.input.target}`;

    try {
      const sandbox = {};
      vm.createContext(sandbox);

      // 2. Wrap the user's code and invoke their function with the test case inputs
      const wrapperScript = `
        ${code}
        
        if (typeof twoSum !== 'function') {
          throw new Error("Function 'twoSum' is not defined.");
        }
        
        twoSum(${JSON.stringify(testCase.input.nums)}, ${testCase.input.target});
      `;

      // 3. Execute the script with a strict 1000ms timeout to catch infinite loops
      const script = new vm.Script(wrapperScript);
      const rawOutput = script.runInContext(sandbox, { timeout: 1000 });
      
      const stringifiedActual = JSON.stringify(rawOutput);
      const passed = stringifiedActual === stringifiedExpected;

      return {
        passed,
        input: inputDisplay,
        expected: stringifiedExpected,
        actual: stringifiedActual || 'undefined'
      };

    } catch (error) {
      // Catch compilation errors, timeouts, or runtime exceptions
      return {
        passed: false,
        input: inputDisplay,
        expected: stringifiedExpected,
        actual: 'Execution Error',
        error: error.message
      };
    }
  });

  // Send the evaluation array back to React
  res.json({ results });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Code execution backend running on http://localhost:${PORT}`);
});