/**
 * ResumeHistory Component - Display Previously Analyzed Resumes
 * 
 * Shows a list of previously analyzed resumes stored in localStorage
 * Allows users to:
 * - View past analysis results
 * - Delete history items
 * - Clear all history
 */

import { useState, useEffect } from "react";
import { Clock, FileText, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HistoryItem {
  id: string;
  filename: string;
  jobTitle: string;
  company?: string;
  overall_score: number;
  analyzed_at: string;
  timestamp: number;
  fullResult: any;
}

interface ResumeHistoryProps {
  onViewResult: (result: any) => void;
}

const ResumeHistory = ({ onViewResult }: ResumeHistoryProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const savedHistory = localStorage.getItem('resumeAnalysisHistory');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.sort((a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const deleteItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('resumeAnalysisHistory', JSON.stringify(updatedHistory));
  };

  const clearAll = () => {
    setHistory([]);
    localStorage.removeItem('resumeAnalysisHistory');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Analysis History
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={clearAll}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{item.filename}</h3>
                    <Badge variant="outline" className="text-xs">
                      {item.jobTitle}
                    </Badge>
                    {item.company && (
                      <Badge variant="secondary" className="text-xs">
                        {item.company}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{item.analyzed_at}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className={`text-2xl font-bold text-white ${getScoreColor(item.overall_score)} rounded-full w-16 h-16 flex items-center justify-center`}>
                      {item.overall_score}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">ATS Score</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onViewResult(item.fullResult)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeHistory;
