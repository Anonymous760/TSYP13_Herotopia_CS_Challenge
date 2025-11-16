/**
 * InputForm Component - Core Resume Analysis Form
 * 
 * This is the main component that handles the entire resume analysis workflow:
 * 1. Resume file upload (PDF support)
 * 2. Job details input (title, company, description)
 * 3. Experience level selection
 * 4. AI-powered analysis using Gemini API
 * 5. Results display with ATS scoring
 *
 * Features:
 * - Real-time form validation
 * - File upload with validation
 * - Loading states and error handling
 * - Analytics tracking for user interactions
 * - Responsive design for all devices
 */

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { track } from "@vercel/analytics";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ResumeUpload from "@/components/ResumeUpload";
import JobDetailsForm from "@/components/JobDetailsForm";
import JobDescriptionInput from "@/components/JobDescriptionInput";
import ExperienceSlider from "@/components/ExperienceSlider";
import LoadingAnimation from "@/components/LoadingAnimation";
import SponsorModal from "@/components/SponsorModal";
import ResumeHistory from "@/components/ResumeHistory";
import Results from "./Results";

const InputForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [experience, setExperience] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  const { toast } = useToast();

  const saveToHistory = (result: any) => {
    try {
      const historyItem = {
        id: Date.now().toString(),
        filename: result.filename || file?.name || 'resume.pdf',
        jobTitle: jobTitle,
        company: companyName,
        overall_score: result.overall_score,
        analyzed_at: result.analyzed_at || new Date().toLocaleDateString(),
        timestamp: Date.now(),
        fullResult: result
      };

      const existingHistory = localStorage.getItem('resumeAnalysisHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.unshift(historyItem);
      
      // Keep only last 10 items
      const limitedHistory = history.slice(0, 10);
      localStorage.setItem('resumeAnalysisHistory', JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const handleViewHistoryResult = (result: any) => {
    setAnalysisResult(result);
    setShowResults(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!file) {
      newErrors.file = "Please upload your resume";
    }
    
    if (!jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyze = async () => {
    if (!validateForm()) {
      toast({
        title: "Please fill in all required fields",
        description: "Make sure to provide all required information",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file!);
      
      // Only append non-empty fields
      if (jobDescription.trim()) {
        formData.append('job_description', jobDescription);
      }
      
      if (jobTitle.trim()) {
        formData.append('job_title', jobTitle);
      }
      
      if (companyName.trim()) {
        formData.append('company', companyName);
      }
      
      // Append experience as integer
      formData.append('experience', experience.toString());
      
      // Debug: Log what we're sending
      console.log('Sending data:', {
        file: file?.name,
        job_title: jobTitle,
        company: companyName,
        job_description: jobDescription ? 'provided' : 'empty',
        experience: experience
      });

      const response = await fetch('http://localhost:8000/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to analyze resume' }));
        console.error('Server error:', errorData);
        
        // Handle FastAPI validation errors (detail is an array)
        let errorMessage = 'Failed to analyze resume';
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // FastAPI validation errors
            errorMessage = errorData.detail.map((err: { loc?: string[]; msg: string }) => 
              `${err.loc?.join(' > ') || 'Field'}: ${err.msg}`
            ).join(', ');
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Parse the response
      const parsedResult = typeof data.response === 'string' ? JSON.parse(data.response) : data.response;
      setAnalysisResult(parsedResult);
      
      // Save to history
      saveToHistory(parsedResult);
      
      toast({
        title: "Analysis Complete!",
        description: "Your resume has been successfully analyzed",
      });
      
      // Track resume analysis completion with Vercel Analytics
      track('resume_analyzed', {
        job_title: jobTitle,
        company: companyName,
        has_job_description: !!jobDescription,
        experience_level: experience
      });
      
      setShowResults(true);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = file && jobTitle && experience >= 0;

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (showResults) {
    return <Results analysisResult={analysisResult} setShowResults={setShowResults} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <Sidebar />

      <div className="lg:ml-64 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <Header />

          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-3xl p-8 md:p-12 animate-scale-in shadow-xl border border-blue-100">
              <div className="space-y-8">

                <ResumeUpload
                  file={file}
                  onFileSelect={setFile}
                  error={errors.file}
                />

              <JobDescriptionInput
                value={jobDescription}
                onChange={setJobDescription}
              />

              <JobDetailsForm
                jobTitle={jobTitle}
                companyName={companyName}
                onJobTitleChange={setJobTitle}
                onCompanyNameChange={setCompanyName}
                errors={{
                  jobTitle: errors.jobTitle,
                }}
              />

              <ExperienceSlider
                value={experience}
                onChange={setExperience}
                error={errors.experience}
              />

                <Button
                  onClick={handleAnalyze}
                  disabled={!isFormValid}
                  className={`
                    w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300
                    ${
                      isFormValid
                        ? "gradient-primary gradient-primary-hover text-white shadow-lg hover:shadow-xl animate-pulse-glow"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  <ArrowUp className="w-5 h-5 mr-2" />
                  Analyze Resume
                </Button>
              </div>
            </div>

            <ResumeHistory onViewResult={handleViewHistoryResult} />
          </div>
        </div>
      </div>

      <SponsorModal
        isOpen={isSponsorModalOpen}
        onClose={() => setIsSponsorModalOpen(false)}
      />
    </div>
  );
};

export default InputForm;
