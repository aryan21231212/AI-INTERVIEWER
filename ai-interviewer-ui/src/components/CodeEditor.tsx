import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play } from 'lucide-react';

export default function CodeEditor() {
  const [code, setCode] = useState('function twoSum(nums, target) {\n  // Write your code here\n\n}');

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
      {/* Header with Problem Title and Actions */}
      <div className="h-14 flex items-center justify-between px-4 bg-gray-800 border-b border-gray-700">
        <h2 className="font-semibold text-gray-200">1. Two Sum</h2>
        <div className="flex gap-3">
          <select className="bg-gray-700 text-sm rounded px-2 py-1 outline-none">
            <option>JavaScript</option>
            <option>Python</option>
            <option>C++</option>
          </select>
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-3 py-1 text-sm rounded transition-colors">
            <Play size={14} /> Run Code
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 pt-2">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}