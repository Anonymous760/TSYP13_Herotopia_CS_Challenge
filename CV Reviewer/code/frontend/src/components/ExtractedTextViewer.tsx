/**
 * ExtractedTextViewer Component - Display Extracted Resume Text
 * 
 * Shows the raw text extracted from the PDF resume
 * Useful for verifying what the ATS system "sees"
 */

import { FileText, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExtractedTextViewerProps {
  text: string;
  filename?: string;
}

const ExtractedTextViewer = ({ text, filename }: ExtractedTextViewerProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!text || text === "Could not extract text from PDF") {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Extracted Resume Text
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Unable to extract text from the PDF. The file might be an image-based PDF or encrypted.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Extracted Resume Text
          {filename && <span className="text-sm font-normal text-gray-500">({filename})</span>}
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={copyToClipboard}
          className="flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Text
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700">
            {text}
          </pre>
        </ScrollArea>
        <p className="text-xs text-gray-500 mt-3">
          ℹ️ This is what ATS systems see when they parse your resume. Make sure all important information is visible and properly formatted.
        </p>
      </CardContent>
    </Card>
  );
};

export default ExtractedTextViewer;
