import { useState } from 'react';
import Dashboard from './components/Dashboard';
import InterviewRoom from './components/InterviewRoom';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'interview'>('dashboard');
  const [interviewConfig, setInterviewConfig] = useState<{ role: string; level: string } | null>(null);

  const handleStartInterview = (config: { role: string; level: string }) => {
    setInterviewConfig(config);
    setView('interview');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white antialiased">
      {/* Simple Global Navigation Header */}
      <header className="h-16 border-b border-gray-800 flex items-center px-6 justify-between bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <span className="bg-blue-600 p-1.5 rounded-lg text-white text-xs">AI</span>
          <span>Interviewer</span>
        </div>
        {view === 'interview' && (
          <div className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
            Interviewing for: <span className="text-blue-400 font-medium">{interviewConfig?.role}</span> ({interviewConfig?.level})
          </div>
        )}
      </header>

      {/* Dynamic View Router */}
      <main className="transition-all duration-300">
        {view === 'dashboard' ? (
          <Dashboard onStartInterview={handleStartInterview} />
        ) : (
          <InterviewRoom />
        )}
      </main>
    </div>
  );
}