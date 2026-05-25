import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle, Clock, Zap, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { Problem } from '../data/problems';

interface CodeEditorProps {
  problem: Problem;
  onCodeRun: (code: string, results: any) => void;
}
interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
}

export default function CodeEditor({ problem,onCodeRun }: CodeEditorProps) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(problem.boilerplates['javascript']);
  const [activeTab, setActiveTab] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[] | null>(null);

  // Update editor when problem changes or language changes
  useEffect(() => {
    setCode(problem.boilerplates[language]);
    setResults(null);
    setActiveTab(0);
  }, [problem, language]);

  const handleRunCode = async () => {
    if (language !== 'javascript') {
      alert("Note: This local backend only supports JavaScript execution right now.");
      return;
    }

    setIsRunning(true);
    setResults(null);

    try {
      const response = await fetch('http://localhost:3001/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, problemId: problem.id }),
      });
      const data = await response.json();
      setResults(data.results);
      
      // NEW: Send the code and results to the AI!
      onCodeRun(code, data.results);
    } catch (err) {
      console.error('Execution failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-gray-900 border-l border-gray-800">
      
      {/* Left Panel: Dynamic Problem Statement */}
      <div className="w-2/5 flex flex-col border-r border-gray-800 bg-gray-900 overflow-y-auto">
        <div className="p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">{problem.title}</h2>
            <div className="flex gap-3 text-sm">
              <span className="text-green-400 bg-green-400/10 px-2.5 py-1 rounded-md font-medium border border-green-400/20">
                {problem.difficulty}
              </span>
              <span className="text-gray-400 flex items-center gap-1.5"><Clock size={14} /> {problem.timeLimit}</span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed">
            {problem.description.map((text, i) => <p key={i} className="mb-3">{text}</p>)}
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {problem.examples.map((ex, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Example {i + 1}</p>
                <div className="font-mono text-sm text-gray-300 space-y-1.5">
                  <p><span className="text-blue-400 font-semibold">Input:</span> {ex.input}</p>
                  <p><span className="text-blue-400 font-semibold">Output:</span> {ex.output}</p>
                  {ex.explanation && <p><span className="text-blue-400 font-semibold">Explanation:</span> {ex.explanation}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 mb-8">
            <p className="text-sm font-bold text-gray-200 mb-3">Constraints:</p>
            <ul className="list-disc pl-5 text-sm text-gray-400 font-mono space-y-2 bg-gray-800/30 p-4 rounded-lg border border-gray-800">
              {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Panel: Editor & Console */}
      <div className="w-3/5 flex flex-col">
        <div className="h-14 flex items-center justify-between px-4 bg-gray-800/40 border-b border-gray-800">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-sm text-gray-300 rounded-md px-3 py-1.5 outline-none"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
          <div className="flex gap-3">
            <button onClick={handleRunCode} disabled={isRunning} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-1.5 text-sm rounded-md">
              {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} className="text-green-400" />} Run
            </button>
            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 text-sm rounded-md">
              <CheckCircle size={14} /> Submit
            </button>
          </div>
        </div>

        <div className="flex-1 pt-2 bg-[#1e1e1e]">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
          />
        </div>

        <div className="h-64 border-t border-gray-800 bg-gray-900 flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-800/20">
            <Zap size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-200">Execution Results</h3>
          </div>
          <div className="p-4 flex-1 flex flex-col overflow-y-auto">
            <div className="flex gap-2 mb-4">
              {problem.testCases.map((tc, idx) => (
                <button 
                  key={tc.id}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${activeTab === idx ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  {results && (results[idx]?.passed ? <CheckCircle2 size={12} className="text-green-400" /> : <XCircle size={12} className="text-red-400" />)}
                  Case {idx + 1}
                </button>
              ))}
            </div>

            <div className="bg-black/30 rounded-lg p-4 font-mono text-sm border border-gray-800/50 flex-1 overflow-y-auto">
              {!results ? (
                <div className="text-gray-300">
                  <div><span className="text-gray-500">Input: </span>{problem.testCases[activeTab]?.inputDisplay}</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div><div className="text-gray-500 text-xs mb-1 font-sans">Expected Output</div><div className="text-green-400">{results[activeTab]?.expected}</div></div>
                  <div><div className="text-gray-500 text-xs mb-1 font-sans">Actual Output</div><div className={results[activeTab]?.passed ? "text-green-400" : "text-red-400"}>{results[activeTab]?.actual}</div></div>
                  {results[activeTab]?.error && <div className="text-red-400 text-xs mt-2 bg-red-900/20 p-2 rounded">{results[activeTab]?.error}</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}