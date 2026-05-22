import { useState } from 'react';
import { Upload, Briefcase, Award, ArrowRight } from 'lucide-react';

interface DashboardProps {
  onStartInterview: (config: { role: string; level: string }) => void;
}

export default function Dashboard({ onStartInterview }: DashboardProps) {
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('Junior');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    setIsAnalyzing(true);
    
    // Simulate AI analyzing the resume for 2 seconds before starting
    setTimeout(() => {
      setIsAnalyzing(false);
      onStartInterview({ role, level });
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent sm:text-5xl">
          AI Mock Interview Platform
        </h1>
        <p className="mt-3 text-lg text-gray-400">
          Upload your resume and configure your target role to start a realistic, interactive interview.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Role Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Briefcase size={16} className="text-blue-400" /> Target Role
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Full Stack Engineer, Frontend Developer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Experience Level Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Award size={16} className="text-blue-400" /> Experience Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Intern">Internship</option>
              <option value="Junior">Junior (0-2 years)</option>
              <option value="Mid">Mid-Level (2-5 years)</option>
              <option value="Senior">Senior (5+ years)</option>
            </select>
          </div>
        </div>

        {/* Resume Upload Box */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Upload size={16} className="text-blue-400" /> Upload Resume (PDF)
          </label>
          <div className="border-2 border-dashed border-gray-700 hover:border-blue-500/50 bg-gray-900/50 rounded-2xl p-8 text-center cursor-pointer transition-colors group">
            <input type="file" accept=".pdf" className="hidden" id="resume-upload" />
            <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
              <Upload size={32} className="text-gray-500 group-hover:text-blue-400 mb-3 transition-colors" />
              <span className="text-sm font-medium text-gray-300">Click to upload your resume</span>
              <span className="text-xs text-gray-500 mt-1">PDF files up to 5MB</span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isAnalyzing}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.99]"
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              AI Analyzing Resume & Generating Questions...
            </>
          ) : (
            <>
              Generate Custom Interview <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}