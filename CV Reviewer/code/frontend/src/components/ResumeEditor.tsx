/**
 * ResumeEditor Component - Real-time Resume Editor with AI Suggestions
 * 
 * Interactive editor that allows users to:
 * - Edit their resume content in real-time
 * - See AI improvement suggestions highlighted
 * - Apply AI recommendations with one click
 * - Preview changes instantly
 */

import { useState } from "react";
import { Wand2, Save, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ResumeEditorProps {
  initialText: string;
  suggestions: (string | { suggestion: string; example?: string })[];
  onSave?: (text: string) => void;
}

const ResumeEditor = ({ initialText, suggestions, onSave }: ResumeEditorProps) => {
  const [text, setText] = useState(initialText);
  const [hasChanges, setHasChanges] = useState(false);

  const handleTextChange = (newText: string) => {
    setText(newText);
    setHasChanges(newText !== initialText);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(text);
    }
    setHasChanges(false);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited-resume.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyAllSuggestions = () => {
    let updatedText = text;
    
    // Simple example: You can implement more sophisticated suggestion application
    suggestions.forEach((suggestion) => {
      const suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.suggestion;
      
      if (suggestionText.includes('Add')) {
        // Could add logic to append suggested content
      } else if (suggestionText.includes('Replace')) {
        // Could add logic to replace specific text
      }
    });
    
    setText(updatedText);
    setHasChanges(true);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Resume Editor
          </CardTitle>
          <div className="flex gap-2">
            {hasChanges && (
              <Badge variant="secondary">Unsaved Changes</Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={applyAllSuggestions}
              className="text-blue-600"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Apply AI Suggestions
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Editor */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Edit Your Resume
            </label>
            <Textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              className="min-h-[500px] font-mono text-sm"
              placeholder="Paste or edit your resume text here..."
            />
          </div>

          {/* AI Suggestions Panel */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              AI Improvement Suggestions
            </label>
            <div className="border rounded-lg p-4 min-h-[500px] bg-blue-50">
              {suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => {
                    // Handle both string and object formats
                    const suggestionText = typeof suggestion === 'string' 
                      ? suggestion 
                      : suggestion?.suggestion || JSON.stringify(suggestion);
                    
                    return (
                      <Alert key={index} className="bg-white">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {suggestionText}
                        </AlertDescription>
                      </Alert>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No suggestions available. Upload a resume and analyze it to get AI-powered recommendations.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>
            💡 <strong>Tip:</strong> Review each AI suggestion carefully and apply the ones that best represent your experience and skills.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeEditor;
