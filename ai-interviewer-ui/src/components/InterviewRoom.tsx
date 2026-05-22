import VideoFeed from './VideoFeed';
import CodeEditor from './CodeEditor';

export default function InterviewRoom() {
  return (
    <div className="h-screen w-full flex bg-gray-900 text-white overflow-hidden">
      
      {/* Left Panel: Video Feeds & Live Captions (35% width) */}
      <div className="w-[35%] flex flex-col p-4 gap-4">
        
        {/* Top bar with timer */}
        <div className="flex justify-between items-center bg-gray-800 px-4 py-3 rounded-lg border border-gray-700">
          <span className="font-semibold text-red-400 font-mono tracking-wider">
            45:00
          </span>
          <button className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded text-sm font-medium transition-colors">
            End Interview
          </button>
        </div>

        {/* Video Components */}
        <div className="flex-1">
          <VideoFeed />
        </div>

        {/* Live Transcript Box */}
        <div className="h-32 bg-gray-800 rounded-xl p-4 border border-gray-700 overflow-y-auto">
          <p className="text-sm text-gray-300">
            <span className="text-blue-400 font-semibold">AI Interviewer: </span>
            Hello! Let's get started. Could you write a function to solve the Two Sum problem?
          </p>
        </div>
      </div>

      {/* Right Panel: Code Editor (65% width) */}
      <div className="w-[65%]">
        <CodeEditor />
      </div>

    </div>
  );
}