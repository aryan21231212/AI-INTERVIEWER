import { useState } from 'react';
import { Upload, Briefcase, Award, ArrowRight } from 'lucide-react';
import type { InterviewConfig } from '../types'; // <-- Import the new type!

interface DashboardProps {
  // Use the shared type here instead of writing it out manually
  onStartInterview: (config: InterviewConfig) => void; 
}

export default function Dashboard({ onStartInterview }: DashboardProps) {
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('Junior');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !resumeFile) {
      alert("Please enter a role and upload a resume.");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // 1. Prepare the file to be sent to our backend
      const formData = new FormData();
      formData.append('resume', resumeFile);

      // 2. Send it to the new PDF parser endpoint we are about to build
      const response = await fetch('https://eval-ai-3.onrender.com/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.text) {
        // 3. Start the interview with the extracted text!
        onStartInterview({ role, level, resumeText: data.text });
      } else {
        throw new Error("Could not extract text from PDF");
      }
    } catch (error) {
      console.error("Resume parsing error:", error);
      alert("Failed to parse resume. Please try a different PDF.");
    } finally {
      setIsAnalyzing(false);
    }
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
          <div className="border-2 border-dashed border-gray-700 hover:border-blue-500/50 bg-gray-900/50 rounded-2xl p-8 text-center cursor-pointer transition-colors group relative">
            
            {/* Added onChange to actually grab the file! */}
            <input 
              type="file" 
              accept=".pdf" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setResumeFile(e.target.files[0]);
                }
              }} 
            />
            
            <div className="flex flex-col items-center pointer-events-none">
              <Upload size={32} className={`${resumeFile ? 'text-blue-400' : 'text-gray-500'} mb-3 transition-colors`} />
              <span className="text-sm font-medium text-gray-300">
                {resumeFile ? resumeFile.name : "Click to upload your resume"}
              </span>
              <span className="text-xs text-gray-500 mt-1">PDF files up to 5MB</span>
            </div>
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
              Extracting Resume Data...
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