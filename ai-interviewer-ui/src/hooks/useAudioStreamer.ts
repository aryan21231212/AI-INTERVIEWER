import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Pass the config into the hook as an argument
export function useAudioStreamer(config: any) {
  const [isRecording, setIsRecording] = useState(false);
  const [aiTranscript, setAiTranscript] = useState('Waiting to start...');
  const [interviewReport, setInterviewReport] = useState<any>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Audio Queue System for seamless playback and interruption
  const audioQueue = useRef<Blob[]>([]);
  const isPlaying = useRef(false);
  const currentAudio = useRef<HTMLAudioElement | null>(null);

  const playNextAudio = () => {
    if (audioQueue.current.length === 0) {
      isPlaying.current = false;
      return;
    }
    
    isPlaying.current = true;
    const audioBlob = audioQueue.current.shift()!;
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    currentAudio.current = audio;

    // When this audio finishes, play the next one in the queue
    audio.onended = () => playNextAudio();
    audio.play().catch(e => console.error("Audio play error:", e));
  };

  useEffect(() => {
    socketRef.current = io('https://eval-ai-dbvz.onrender.com');
    
    // ==========================================
    // NEW: Initialize the AI Brain instantly!
    // ==========================================
    if (config) {
      socketRef.current.emit('initialize_session', config);
    }
    
    socketRef.current.on('ai_text_response', (data) => {
      setAiTranscript(data.text);
    });
    
    // Catch the final grading report
    socketRef.current.on('interview_report', (report) => {
      setInterviewReport(report);
    });

    // Modified to use the Queue system
    socketRef.current.on('ai_audio_response', (data) => {
      const audioBlob = new Blob([data.audio], { type: 'audio/mp3' });
      audioQueue.current.push(audioBlob);
      
      if (!isPlaying.current) {
        playNextAudio();
      }
    });

    // The Interruption Listener!
    socketRef.current.on('ai_interrupted', () => {
      console.log("🛑 AI Interrupted by user!");
      setAiTranscript("Listening...");
      audioQueue.current = []; // Clear the pending sentences
      if (currentAudio.current) {
        currentAudio.current.pause();
        currentAudio.current.currentTime = 0;
      }
      isPlaying.current = false;
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [config]); // Added config as dependency

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

  const sendCodeUpdate = (code: string, testResults: any) => {
    if (socketRef.current) {
      socketRef.current.emit('code_update', { code, testResults });
    }
  };

  const endInterview = () => {
    if (socketRef.current) {
      socketRef.current.emit('end_interview');
    }
  };

  return { isRecording, toggleMicrophone, aiTranscript, sendCodeUpdate, endInterview, interviewReport };
}