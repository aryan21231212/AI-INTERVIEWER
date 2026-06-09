import { useState } from 'react';
import CodeEditor from './CodeEditor';
import VideoFeed from './VideoFeed';
import { problemDatabase } from '../data/problems';
import { useAudioStreamer } from '../hooks/useAudioStreamer';
import type { InterviewConfig }  from '../types';

export default function InterviewRoom({ config }: { config: InterviewConfig }) {
  const [currentProblemId, setCurrentProblemId] = useState('two-sum'); 
  const activeProblem = problemDatabase[currentProblemId];

  // Pass the config into the hook!
  const { isRecording, toggleMicrophone, aiTranscript, sendCodeUpdate, endInterview, interviewReport } = useAudioStreamer(config);
  return (
    <div className="h-screen w-full flex bg-gray-900 text-white overflow-hidden relative">
      
      {/* 🛑 THE SCORECARD MODAL 🛑 */}
      {interviewReport && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-700 text-center">
              <h2 className="text-2xl font-bold text-white">Interview Complete</h2>
              <p className="text-gray-400 mt-1">Here is your AI evaluation</p>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Decision Badge */}
              <div className="flex justify-center">
                <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                  interviewReport.hireDecision.includes('No') 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  Decision: {interviewReport.hireDecision}
                </span>
              </div>

              {/* Scores Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 text-center">
                  <div className="text-3xl font-bold text-blue-400">{interviewReport.scores.dataStructures}/10</div>
                  <div className="text-xs text-gray-400 mt-1 uppercase">Data Structures</div>
                </div>
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 text-center">
                  <div className="text-3xl font-bold text-purple-400">{interviewReport.scores.problemSolving}/10</div>
                  <div className="text-xs text-gray-400 mt-1 uppercase">Problem Solving</div>
                </div>
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 text-center">
                  <div className="text-3xl font-bold text-emerald-400">{interviewReport.scores.communication}/10</div>
                  <div className="text-xs text-gray-400 mt-1 uppercase">Communication</div>
                </div>
              </div>

              {/* Feedback Text */}
              <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700/50">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Detailed Feedback</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {interviewReport.feedback}
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-900 border-t border-gray-700 flex justify-end">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-all"
              >
                Start New Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Panel: Camera & Controls */}
      <div className="w-[35%] flex flex-col p-4 gap-4 border-r border-gray-800">
        
        {/* Top bar with timer */}
        <div className="flex justify-between items-center bg-gray-800 px-4 py-3 rounded-xl border border-gray-700 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-semibold text-gray-200 font-mono tracking-wider">45:00</span>
          </div>
          {/* Wire up the End Interview Button */}
          <button 
            onClick={endInterview}
            className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
          >
            End Interview
          </button>
        </div>

        {/* The Video Feed */}
        <div className="flex-1 min-h-0">
          <VideoFeed 
            isRecording={isRecording} 
            toggleMicrophone={toggleMicrophone} 
            aiTranscript={aiTranscript} 
          />
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
        <CodeEditor problem={activeProblem} onCodeRun={sendCodeUpdate} />
      </div>

    </div>
  );
}