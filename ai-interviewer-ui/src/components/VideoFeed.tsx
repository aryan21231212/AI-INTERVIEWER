import { useRef } from 'react';
import Webcam from 'react-webcam';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

export default function VideoFeed() {
  const webcamRef = useRef<Webcam>(null);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* AI Interviewer Video/Avatar Box */}
      <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-24 h-24 bg-blue-500 rounded-full animate-pulse flex items-center justify-center mb-4">
           <span className="text-2xl font-bold">AI</span>
        </div>
        <p className="text-gray-400">Interviewer is listening...</p>
        <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-md text-sm">
          AI Interviewer
        </div>
      </div>

      {/* User Webcam Box */}
      <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 relative overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={false} // We handle audio streaming separately
          mirrored={true}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-md text-sm">
          You
        </div>
        
        {/* Mock Controls */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
            <Mic size={18} />
          </button>
          <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
            <Video size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}