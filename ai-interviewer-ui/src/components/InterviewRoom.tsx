import { useState } from 'react';
import CodeEditor from './CodeEditor';
import VideoFeed from './VideoFeed'; // <-- Import the new component
import { problemDatabase } from '../data/problems';

export default function InterviewRoom() {
  const [currentProblemId, setCurrentProblemId] = useState('two-sum'); 
  const activeProblem = problemDatabase[currentProblemId];

  return (
    <div className="h-screen w-full flex bg-gray-900 text-white overflow-hidden">
      
      {/* Left Panel: Camera & Controls */}
      <div className="w-[35%] flex flex-col p-4 gap-4 border-r border-gray-800">
        
        {/* Top bar with timer */}
        <div className="flex justify-between items-center bg-gray-800 px-4 py-3 rounded-xl border border-gray-700 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-semibold text-gray-200 font-mono tracking-wider">45:00</span>
          </div>
          <button className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 px-4 py-1.5 rounded-lg text-sm font-bold transition-all">
            End Interview
          </button>
        </div>

        {/* The New Video Feed Component */}
        <div className="flex-1 min-h-0">
          <VideoFeed />
        </div>

        {/* AI Action Simulator Buttons */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shrink-0">
          <p className="text-sm font-medium text-gray-400 mb-3">Simulate AI Switching Problems:</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCurrentProblemId('two-sum')} className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-medium rounded shadow-sm">Two Sum</button>
            <button onClick={() => setCurrentProblemId('fizz-buzz')} className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-medium rounded shadow-sm">Fizz Buzz</button>
            <button onClick={() => setCurrentProblemId('valid-palindrome')} className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-medium rounded shadow-sm">Palindrome</button>
            <button onClick={() => setCurrentProblemId('binary-search')} className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-medium rounded shadow-sm">Binary Search</button>
          </div>
        </div>

      </div>

      {/* Right Panel: The Dynamic Coding Environment */}
      <div className="w-[65%]">
        <CodeEditor problem={activeProblem} />
      </div>

    </div>
  );
}