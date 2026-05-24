import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Mic, MicOff, Video, VideoOff, Settings, AlertCircle } from 'lucide-react';
import { useAudioStreamer } from '../hooks/useAudioStreamer';

export default function VideoFeed() {
  const webcamRef = useRef<Webcam>(null);
  const [isCamOn, setIsCamOn] = useState(true);
  const [camError, setCamError] = useState<string | null>(null);
  
  
  // Bring in the real WebRTC microphone logic
  const { isRecording, toggleMicrophone, aiTranscript } = useAudioStreamer();

  // Handle webcam permission errors gracefully
  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error("Webcam Error:", error);
    setCamError("Camera access denied or device busy.");
    setIsCamOn(false);
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full">
      
      {/* AI Interviewer Video/Avatar Box */}
      <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
        {/* Pulsing AI Avatar changes based on REAL mic state */}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${isRecording ? 'bg-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : 'bg-gray-700'}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isRecording ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'}`}>
            <span className="text-2xl font-bold text-white tracking-wider">AI</span>
          </div>
        </div>
        
        <p className="text-sm font-medium text-gray-400 max-w-[80%] text-center">{isRecording ? aiTranscript : 'Microphone is muted'}</p>
        
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-medium text-gray-200 border border-white/10">
          AI Interviewer
        </div>
      </div>

      {/* User Webcam Box */}
      <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 relative overflow-hidden shadow-inner flex items-center justify-center">
        {isCamOn && !camError ? (
          <Webcam
            ref={webcamRef}
            audio={false} 
            mirrored={true}
            onUserMediaError={handleUserMediaError}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center text-gray-500 p-4 text-center">
            {camError ? <AlertCircle size={48} className="mb-2 text-red-500/50" /> : <VideoOff size={48} className="mb-2 opacity-50" />}
            <span className="text-sm font-medium text-gray-300">{camError || "Camera Disabled"}</span>
            {camError && <span className="text-xs mt-2 text-gray-500">Check your URL bar permissions or close other apps using the camera.</span>}
          </div>
        )}
        
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-medium text-gray-200 border border-white/10">
          You
        </div>
        
        {/* Call Controls */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          {/* REAL Microphone Toggle */}
          <button 
            onClick={toggleMicrophone}
            className={`p-2.5 rounded-full transition-all duration-200 shadow-lg ${
              isRecording 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isRecording ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
          
          {/* Local Camera Toggle */}
          <button 
            onClick={() => {
              setCamError(null); // Reset error state on manual toggle
              setIsCamOn(!isCamOn);
            }}
            className={`p-2.5 rounded-full transition-all duration-200 shadow-lg ${
              isCamOn 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isCamOn ? <Video size={18} /> : <VideoOff size={18} />}
          </button>
        </div>
      </div>

    </div>
  );
}