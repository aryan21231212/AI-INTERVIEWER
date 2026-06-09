import { useState } from 'react';
import Dashboard from './components/Dashboard';
import InterviewRoom from './components/InterviewRoom';
import type { InterviewConfig } from './types';



function App() {
  const [config, setConfig] = useState<InterviewConfig | null>(null);

  return (
    <div className="bg-gray-950 min-h-screen">
      {config ? (
        <InterviewRoom config={config} />
      ) : (
        <Dashboard onStartInterview={(data) => setConfig(data)} />
      )}
    </div>
  );
}

export default App;