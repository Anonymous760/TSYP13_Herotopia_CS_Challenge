import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import UploadCV from './components/UploadCV';
import InterviewChat from './components/InterviewChat';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [cvSummary, setCvSummary] = useState('');
  const [role, setRole] = useState('');
  const [messages, setMessages] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [scores, setScores] = useState(null);

  const handleUploadSuccess = (data) => {
    setSessionId(data.session_id);
    setCvSummary(data.cv_summary);
    setRole(data.role);
    setMessages([
      {
        sender: 'ai',
        text: data.first_question,
        timestamp: new Date()
      }
    ]);
    setIsFinished(false);
  };

  const handleSendAnswer = async (answer, isCode = false) => {
    // Add user message
    const userMessage = {
      sender: 'user',
      text: isCode ? '[Code Submitted]' : answer,
      timestamp: new Date(),
      fullCode: isCode ? answer : null
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await axios.post('http://localhost:5000/api/answer', {
        session_id: sessionId,
        answer: answer,
        is_code: isCode
      });

      // Parse score from response text
      const scoreMatch = response.data.response.match(/\[SCORES\]\s*Technical=(\d+),\s*Communication=(\d+),\s*Problem_Solving=(\d+),\s*Relevance=(\d+)\s*\[\/SCORES\]/);
      const messageScore = scoreMatch ? {
        technical: parseInt(scoreMatch[1]),
        communication: parseInt(scoreMatch[2]),
        problem_solving: parseInt(scoreMatch[3]),
        relevance: parseInt(scoreMatch[4])
      } : null;

      // Add AI response
      const aiMessage = {
        sender: 'ai',
        text: response.data.response,
        timestamp: new Date(),
        score: messageScore
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Update scores from backend
      if (response.data.scores) {
        setScores(response.data.scores);
      }
      
      if (response.data.is_finished) {
        setIsFinished(true);
      }
    } catch (error) {
      console.error('Error sending answer:', error);
      const errorMessage = {
        sender: 'system',
        text: 'Error: Failed to send message. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleReset = async () => {
    if (sessionId) {
      try {
        await axios.delete(`http://localhost:5000/api/end-session/${sessionId}`);
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }
    
    setSessionId(null);
    setCvSummary('');
    setRole('');
    setMessages([]);
    setIsFinished(false);
    setScores(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-brand">
          <div className="logo">AI</div>
          <div className="brand-text">
            <h1>Interview Assistant</h1>
            <p>Powered by Advanced AI Technology</p>
          </div>
        </div>
      </header>

      <main className="App-main">
        {!sessionId ? (
          <UploadCV onSuccess={handleUploadSuccess} />
        ) : (
          <InterviewChat
            messages={messages}
            onSendAnswer={handleSendAnswer}
            isFinished={isFinished}
            role={role}
            cvSummary={cvSummary}
            onReset={handleReset}
            scores={scores}
            sessionId={sessionId}
          />
        )}
      </main>

      <footer className="App-footer">
        <p>© 2025 AI Interview Assistant. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
