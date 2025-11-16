/**
 * Results Component - AI Resume Analysis Results Display
 * 
 * Displays comprehensive ATS analysis results from Google Gemini AI.
 * 
 * Analysis Features:
 * - Overall resume score (0-100)
 * - 6 detailed ATS criteria ratings:
 *   • Skill Match Score
 *   • Keyword Match Score  
 *   • Experience Relevance Score
 *   • Resume Formatting Score
 *   • Action Verb Usage Score
 *   • Job Fit Prediction Score
 * - Detailed feedback with pros/cons
 * - Interactive score visualization
 * 
 * Export Features:
 * - Professional PDF generation with proper page breaks
 * - Clean PDF layout (no navigation/buttons)
 * - High-quality formatting for sharing
 * - Analytics tracking for downloads
 * 
 * UX Features:
 * - Animated score circles and progress bars
 * - Color-coded scoring (green/amber/red)
 * - Responsive grid layout
 * - Back navigation and analysis restart options
 */

import { useState, useMemo } from "react";
import { TrendingUp, Download } from "lucide-react";
import { track } from "@vercel/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import ScoreCircle from "@/components/ScoreCircle";
import OverallScoreGauge from "@/components/OverallScoreGauge";
import FeedbackModal from "@/components/FeedbackModal";
import SponsorModal from "@/components/SponsorModal";
import ExtractedTextViewer from "@/components/ExtractedTextViewer";
import ResumeEditor from "@/components/ResumeEditor";
import TopMatchesGaps from "@/components/TopMatchesGaps";
import html2pdf from "html2pdf.js";

interface ResultsProps {
  analysisResult: {
    response?: string;
    overall_score?: number;
    feedback_summary?: string[] | string;
    pros?: string[];
    cons?: string[];
    improvement_suggestions?: string[];
    ats_criteria_ratings?: Record<string, number>;
    extracted_text?: string;
    filename?: string;
    analyzed_at?: string;
  } | any;
  setShowResults: (show: boolean) => void;
}

const Results = ({ analysisResult, setShowResults }: ResultsProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Check if analysisResult is null or undefined
  if (!analysisResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No analysis results available</p>
      </div>
    );
  }

  const downloadPDF = () => {
    const element = document.getElementById('pdf-content');
    if (!element) {
      toast({
        title: "Error",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Temporarily hide navigation and buttons
    const elementsToHide = document.querySelectorAll('.pdf-hide');
    elementsToHide.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    const opt = {
      margin: 0.5,
      filename: 'resume-analysis-results.pdf',
      image: { 
        type: 'jpeg', 
        quality: 0.98
      },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      // Show hidden elements again
      elementsToHide.forEach(el => {
        (el as HTMLElement).style.display = '';
      });
      
      // Track PDF download
      track('pdf_downloaded');
      
      toast({
        title: "PDF Downloaded",
        description: "Your resume analysis results have been saved as PDF.",
      });
    }).catch((error) => {
      console.error('PDF generation failed:', error);
      
      // Show hidden elements again
      elementsToHide.forEach(el => {
        (el as HTMLElement).style.display = '';
      });
      
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    });
  };

  // 1. Parse the raw JSON response - handle both old format (with response property) and new format (direct object)
  let parsed: Record<string, unknown> = {};
  try {
    // Check if analysisResult already has the data directly (new format from InputForm)
    if (analysisResult.overall_score !== undefined) {
      parsed = analysisResult;
    } else if (analysisResult.response) {
      // Old format - has response property
      let resp = analysisResult.response;
      if (typeof resp === 'string') {
        resp = resp.replace(/```json|```/g, '').trim();
        parsed = JSON.parse(resp);
      } else {
        parsed = resp;
      }
    } else {
      parsed = analysisResult;
    }
  } catch (e) {
    console.error('Error parsing analysis result:', e);
    parsed = {};
  }

  // 2. Store each key in its own variable based on your consistent API structure
  const overallScore = (parsed.overall_score as number) ?? 0;
  const feedbackSummary = Array.isArray(parsed.feedback_summary) 
    ? (parsed.feedback_summary as string[])
    : ((parsed.feedback_summary as string) ?? '').split('\n').filter(Boolean);
  const pros = (parsed.pros as string[]) ?? [];
  const cons = (parsed.cons as string[]) ?? [];
  const improvementSuggestions = (parsed.improvement_suggestions as string[]) ?? [];
  const ats = (parsed.ats_criteria_ratings as Record<string, number>) ?? {};
  const extractedText = (parsed.extracted_text as string) ?? '';
  const filename = (parsed.filename as string) ?? 'resume.pdf';
  const topMatches = (parsed.top_matches as Array<{title: string; description: string}>) ?? [];
  const topGaps = (parsed.top_gaps as Array<{title: string; description: string}>) ?? [];

  const totalIssues = 15;
  
  const scoreCategories = [
    { 
      name: "Skill Match Score", 
      score: (ats.skill_match_score ?? 0) * 10, 
      rawScore: ats.skill_match_score ?? 0,
      color: "emerald", 
      description: "How well your skills align with the job requirements"
    },
    { 
      name: "Keyword Match Score", 
      score: (ats.keyword_match_score ?? 0) * 10, 
      rawScore: ats.keyword_match_score ?? 0,
      color: "blue", 
      description: "Relevance of keywords used in your resume"
    },
    { 
      name: "Experience Relevance Score", 
      score: (ats.experience_relevance_score ?? 0) * 10, 
      rawScore: ats.experience_relevance_score ?? 0,
      color: "green", 
      description: "Alignment of your experience with the target role"
    },
    { 
      name: "Resume Formatting Score", 
      score: (ats.resume_formatting_score ?? 0) * 10, 
      rawScore: ats.resume_formatting_score ?? 0,
      color: "amber", 
      description: "Professional presentation and structure of your resume"
    },
    { 
      name: "Action Verbs Usage Score", 
      score: (ats.action_verb_usage_score ?? 0) * 10, 
      rawScore: ats.action_verb_usage_score ?? 0,
      color: "blue", 
      description: "Effectiveness of action verbs in describing achievements"
    },
    { 
      name: "Job Fit Prediction Score", 
      score: (ats.job_fit_score ?? 0) * 10, 
      rawScore: ats.job_fit_score ?? 0,
      color: "emerald", 
      description: "Overall prediction of your fit for the position"
    }
  ];

  const motivationalQuotes = [
    "Your next opportunity is just one optimized resume away!",
    "Every rejection is a redirection to something better.",
    "Success is where preparation meets opportunity.",
    "The best time to plant a tree was 20 years ago. The second best time is now."
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-elevate-emerald-600";
    if (score >= 60) return "text-elevate-amber-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <Sidebar />
      
      <div className="lg:ml-64 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header - hidden in PDF */}
          <div className="pdf-hide mb-8">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Resume Analysis Complete</h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">{motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}</p>
            </div>
          </div>

          {/* PDF Content - This is what gets captured in the PDF */}
          <div id="pdf-content">
            {/* PDF Title */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Analysis Report</h1>
              <p className="text-gray-600">Generated by Utopia Hire AI Assistant</p>
              <hr className="mt-4 border-gray-300" />
            </div>

            {/* Overall Score Card */}
            <Card className="glass-card mb-8 animate-scale-in shadow-2xl border border-blue-100/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Overall Resume Score</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex flex-col items-center justify-center mb-4">
                  <OverallScoreGauge score={overallScore} size={280} />
                </div>
              </CardContent>
            </Card>

            {/* ATS Criteria Ratings - MOVED TO TOP */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">ATS Criteria Ratings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scoreCategories.map((category, index) => (
                  <Card 
                    key={category.name} 
                    className="glass-card cursor-pointer hover:shadow-xl transition-all duration-300 animate-scale-in hover:scale-105 border border-blue-100/50 backdrop-blur-sm"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                      <div className="flex items-center justify-center mb-4">
                        <ScoreCircle score={category.score} rawScore={category.rawScore} size={100} />
                      </div>
                      <h3 className="font-semibold text-gray-800 text-center text-lg">{category.name}</h3>
                      <p className="text-sm text-gray-600 mt-2 text-center">{category.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Top Matches and Gaps */}
            <TopMatchesGaps matches={topMatches} gaps={topGaps} />

            {/* Quick Summary - Simplified */}
            <div className="mb-8">
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-blue-700">
                    <span className="text-2xl">📋</span>
                    <span className="text-xl">Quick Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feedbackSummary.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-gray-800">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Improvement Suggestions - Accordion style */}
            <div className="mb-8">
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-purple-700">
                    <span className="text-2xl">💡</span>
                    <span className="text-xl">Actionable Improvements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {improvementSuggestions.map((suggestion: string | { suggestion: string; example?: string }, idx: number) => {
                      // Handle both string and object formats
                      const suggestionText = typeof suggestion === 'string' 
                        ? suggestion 
                        : suggestion?.suggestion || JSON.stringify(suggestion);
                      
                      return (
                        <div key={idx} className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-purple-100">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-sm text-gray-800">{suggestionText}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div> {/* End of pdf-content */}

          {/* Extracted Text Viewer */}
          <div className="pdf-hide mt-8">
            <ExtractedTextViewer text={extractedText} filename={filename} />
          </div>

          {/* Resume Editor with AI Suggestions */}
          <div className="pdf-hide mt-8">
            <ResumeEditor
              initialText={extractedText}
              suggestions={improvementSuggestions}
            />
          </div>

          {/* Quick Actions */}
          <div className="pdf-hide text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center space-x-2 shadow-lg"
                onClick={downloadPDF}
              >
                <Download className="w-4 h-4" />
                <span>Download Analysis</span>
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                onClick={() => setShowResults(false)}
              >
                Analyze Another Resume
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FeedbackModal
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
      />
      
      <SponsorModal
        isOpen={isSponsorModalOpen}
        onClose={() => setIsSponsorModalOpen(false)}
      />
    </div>
  );
};

export default Results;
