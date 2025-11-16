/**
 * Utopia Hire - AI-Powered Resume Analysis Application
 * 
 * Main App Component - Entry point for the React application
 * 
 * Features:
 * - AI-powered resume analysis using Google Gemini
 * - ATS compatibility scoring with detailed metrics
 * - PDF download functionality for analysis results
 * - Vercel Analytics for usage tracking and insights
 * - Responsive design with Tailwind CSS and shadcn/ui
 * 
 * Tech Stack: React 18 + TypeScript + Vite + FastAPI backend
 * 
 * @version 1.0.0
 */

import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import Templates from "./pages/Templates";
import NotFound from "./pages/NotFound";

// React Query client for server state management
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Toast notifications for user feedback */}
      <Toaster />
      <Sonner />
      
      {/* Client-side routing */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/templates" element={<Templates />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      
      {/* Vercel Analytics for usage tracking and insights */}
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
