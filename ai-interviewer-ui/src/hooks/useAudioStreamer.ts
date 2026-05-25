import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useAudioStreamer() {
  const [isRecording, setIsRecording] = useState(false);
  const [aiTranscript, setAiTranscript] = useState('Waiting to start...');
  
  // FIX: Explicitly typed as Socket or null
  const socketRef = useRef<Socket | null>(null);
  
  // FIX: Explicitly typed as MediaRecorder or null
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    // 1. Connect to the Node.js backend
    socketRef.current = io('http://localhost:3001');
    
    // 2. Listen for the AI's text response (for closed captions)
    socketRef.current.on('ai_text_response', (data) => {
      setAiTranscript(data.text);
    });

    // 3. Listen for the AI's audio response and play it
    socketRef.current.on('ai_audio_response', (data) => {
      const audioBlob = new Blob([data.audio], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const toggleMicrophone = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socketRef.current) {
          // Emit raw audio chunks to the backend
          socketRef.current.emit('user_audio_chunk', event.data);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone error:", error);
      alert("Could not access microphone.");
    }
  };

  // Add this new function to send code context
interface TestResults {
  success: boolean;
  errors: string[];
}

const sendCodeUpdate = (code: string, testResults: TestResults) => {
  if (socketRef.current) {
    socketRef.current.emit('code_update', { code, testResults });
  }
};

  return { isRecording, toggleMicrophone, aiTranscript,sendCodeUpdate };
}