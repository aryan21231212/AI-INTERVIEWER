import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle, Clock, Zap } from 'lucide-react';

export default function CodeEditor() {
  const [code, setCode] = useState('function twoSum(nums, target) {\n  // Write your code here\n\n}');

  return (
    <div className="flex h-full w-full bg-gray-900 border-l border-gray-800">
      
      {/* Left Panel: Problem Statement (40% width) */}
      <div className="w-2/5 flex flex-col border-r border-gray-800 bg-gray-900 overflow-y-auto">
        <div className="p-6 flex flex-col gap-6">
          
          {/* Title and Meta Tags */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">1. Two Sum</h2>
            <div className="flex gap-3 text-sm">
              <span className="text-green-400 bg-green-400/10 px-2.5 py-1 rounded-md font-medium border border-green-400/20">Easy</span>
              <span className="text-gray-400 flex items-center gap-1.5"><Clock size={14} /> 45 mins</span>
            </div>
          </div>

          {/* Description Text */}
          <div className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed">
            <p>
              Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
            </p>
            <p className="mt-3">
              You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.
            </p>
            <p className="mt-3">
              You can return the answer in any order.
            </p>
          </div>

          {/* Example Blocks */}
          <div className="flex flex-col gap-4 mt-2">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Example 1</p>
              <div className="font-mono text-sm text-gray-300 space-y-1.5">
                <p><span className="text-blue-400 font-semibold">Input:</span> nums = [2,7,11,15], target = 9</p>
                <p><span className="text-blue-400 font-semibold">Output:</span> [0,1]</p>
                <p><span className="text-blue-400 font-semibold">Explanation:</span> Because nums[0] + nums[1] == 9, we return [0, 1].</p>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Example 2</p>
              <div className="font-mono text-sm text-gray-300 space-y-1.5">
                <p><span className="text-blue-400 font-semibold">Input:</span> nums = [3,2,4], target = 6</p>
                <p><span className="text-blue-400 font-semibold">Output:</span> [1,2]</p>
              </div>
            </div>
          </div>

          {/* Constraints Section */}
          <div className="mt-2 mb-8">
            <p className="text-sm font-bold text-gray-200 mb-3">Constraints:</p>
            <ul className="list-disc pl-5 text-sm text-gray-400 font-mono space-y-2 bg-gray-800/30 p-4 rounded-lg border border-gray-800">
              <li>2 ≤ nums.length ≤ 10^4</li>
              <li>-10^9 ≤ nums[i] ≤ 10^9</li>
              <li>-10^9 ≤ target ≤ 10^9</li>
              <li>Only one valid answer exists.</li>
            </ul>
          </div>
          
        </div>
      </div>

      {/* Right Panel: Code Editor & Console (60% width) */}
      <div className="w-3/5 flex flex-col">
        
        {/* Editor Toolbar Header */}
        <div className="h-14 flex items-center justify-between px-4 bg-gray-800/40 border-b border-gray-800">
          <div className="flex gap-2">
            <select className="bg-gray-900 border border-gray-700 text-sm text-gray-300 rounded-md px-3 py-1.5 outline-none focus:border-blue-500 transition-colors font-medium cursor-pointer">
              <option>JavaScript</option>
              <option>Python</option>
              <option>C++</option>
              <option>Java</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-1.5 text-sm rounded-md transition-colors font-medium">
              <Play size={14} className="text-green-400" /> Run
            </button>
            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 text-sm rounded-md transition-colors font-medium shadow-lg shadow-green-900/20">
              <CheckCircle size={14} /> Submit
            </button>
          </div>
        </div>

        {/* Monaco Editor Core */}
        <div className="flex-1 pt-2 bg-[#1e1e1e]">
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
              wordWrap: 'on',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              renderLineHighlight: 'all',
            }}
          />
        </div>

        {/* Bottom Console / Test Cases Panel */}
        <div className="h-56 border-t border-gray-800 bg-gray-900 flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-800/20">
            <Zap size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-200">Test Cases</h3>
          </div>
          <div className="p-4 flex-1 flex flex-col overflow-y-auto">
            <div className="flex gap-2 mb-4">
              <button className="bg-gray-700 text-white px-3 py-1.5 text-xs rounded-md font-medium transition-colors">Case 1</button>
              <button className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-3 py-1.5 text-xs rounded-md transition-colors">Case 2</button>
              <button className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-3 py-1.5 text-xs rounded-md transition-colors">Case 3</button>
            </div>
            <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-300 border border-gray-800/50 flex-1">
              <div className="mb-2"><span className="text-gray-500 select-none">nums = </span>[2, 7, 11, 15]</div>
              <div><span className="text-gray-500 select-none">target = </span>9</div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}