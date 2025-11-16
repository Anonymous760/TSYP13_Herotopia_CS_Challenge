import React, { useState, useEffect, useRef } from 'react';
import './InterviewChat.css';
import CodeEditor from './CodeEditor';

function InterviewChat({ messages, onSendAnswer, isFinished, role, cvSummary, onReset, scores, sessionId }) {
  const [inputText, setInputText] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeQuestion, setCodeQuestion] = useState(null);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isFinished && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFinished]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (inputText.trim() && !isFinished) {
      onSendAnswer(inputText.trim());
      setInputText('');
    }
  };

  const formatMessage = (text) => {
    // Remove markers for display
    return text
      .replace('[END_INTERVIEW]', '')
      .replace(/\[SCORES\].*?\[\/SCORES\]/g, '')
      .replace('[EVALUATION]', '')
      .replace('[/EVALUATION]', '')
      .replace(/\[CODE_QUESTION\][\s\S]*?\[\/STARTER_CODE\]/g, '')
      .trim();
  };

  const parseScoresFromMessage = (text) => {
    const match = text.match(/\[SCORES\]\s*Technical=(\d+),\s*Communication=(\d+),\s*Problem_Solving=(\d+),\s*Relevance=(\d+)\s*\[\/SCORES\]/);
    if (match) {
      return {
        technical: parseInt(match[1]),
        communication: parseInt(match[2]),
        problem_solving: parseInt(match[3]),
        relevance: parseInt(match[4])
      };
    }
    return null;
  };

  const parseCodeQuestion = (text) => {
    const codeQuestionMatch = text.match(/\[CODE_QUESTION\]([\s\S]*?)(?:\[LANGUAGE\]\s*(\w+)\s*\[\/LANGUAGE\])?([\s\S]*?)(?:\[STARTER_CODE\]([\s\S]*?)\[\/STARTER_CODE\])?/);
    if (codeQuestionMatch) {
      return {
        question: codeQuestionMatch[1]?.trim() || '',
        language: codeQuestionMatch[2]?.trim() || 'python',
        starterCode: codeQuestionMatch[4]?.trim() || '# Write your code here\n'
      };
    }
    return null;
  };

  const isLikelyCodingQuestion = (text) => {
    // Check if message mentions coding but doesn't have proper markers
    const codingKeywords = /(?:coding|code|programming|function|algorithm|implement|write a|develop)/i;
    const hasMarkers = /\[CODE_QUESTION\]/.test(text);
    return codingKeywords.test(text) && !hasMarkers;
  };

  // Code editor is now only opened manually via buttons

  const handleCodeSubmit = (code) => {
    setShowCodeEditor(false);
    setCodeQuestion(null);
    onSendAnswer(code, true);
  };

  const handleCloseCodeEditor = () => {
    setShowCodeEditor(false);
  };

  return (
    <div className="chat-container fade-in">
      <div className="chat-card">
        {/* Header */}
        <div className="chat-header">
          <div className="header-content">
            <h3>Interview for: {role}</h3>
            <div className="header-buttons">
              <button
                className="toggle-summary-btn"
                onClick={() => setShowSummary(!showSummary)}
              >
                {showSummary ? '📝 Hide Summary' : '📄 View CV Summary'}
              </button>
              {scores && scores.individual_scores && scores.individual_scores.length > 0 && (
                <button
                  className="toggle-scores-btn"
                  onClick={() => setShowScores(!showScores)}
                >
                  {showScores ? '📊 Hide Scores' : '📈 View Scores'}
                </button>
              )}
              <button className="reset-btn" onClick={onReset}>
                🔄 New Interview
              </button>
            </div>
          </div>
          
          {showSummary && (
            <div className="cv-summary-panel">
              <h4>CV Summary</h4>
              <div className="summary-content">
                {cvSummary}
              </div>
            </div>
          )}

          {showScores && scores && (
            <div className="scores-panel">
              <h4>Your Interview Scores</h4>
              <div className="scores-content">
                {scores.individual_scores && scores.individual_scores.map((score, idx) => (
                  <div key={idx} className="score-item">
                    <h5>Question {idx + 1}</h5>
                    <div className="score-bars">
                      <div className="score-bar">
                        <span>Technical:</span>
                        <div className="bar-container">
                          <div className="bar-fill" style={{width: `${score.technical * 10}%`}}></div>
                        </div>
                        <span className="score-value">{score.technical}/10</span>
                      </div>
                      <div className="score-bar">
                        <span>Communication:</span>
                        <div className="bar-container">
                          <div className="bar-fill" style={{width: `${score.communication * 10}%`}}></div>
                        </div>
                        <span className="score-value">{score.communication}/10</span>
                      </div>
                      <div className="score-bar">
                        <span>Problem Solving:</span>
                        <div className="bar-container">
                          <div className="bar-fill" style={{width: `${score.problem_solving * 10}%`}}></div>
                        </div>
                        <span className="score-value">{score.problem_solving}/10</span>
                      </div>
                      <div className="score-bar">
                        <span>Relevance:</span>
                        <div className="bar-container">
                          <div className="bar-fill" style={{width: `${score.relevance * 10}%`}}></div>
                        </div>
                        <span className="score-value">{score.relevance}/10</span>
                      </div>
                    </div>
                  </div>
                ))}
                {scores.final_scores && (
                  <div className="final-scores">
                    <h5>Final Average Scores</h5>
                    <div className="score-bars">
                      <div className="score-bar">
                        <span>Technical:</span>
                        <div className="bar-container">
                          <div className="bar-fill final" style={{width: `${scores.final_scores.technical * 10}%`}}></div>
                        </div>
                        <span className="score-value">{scores.final_scores.technical}/10</span>
                      </div>
                      <div className="score-bar">
                        <span>Communication:</span>
                        <div className="bar-container">
                          <div className="bar-fill final" style={{width: `${scores.final_scores.communication * 10}%`}}></div>
                        </div>
                        <span className="score-value">{scores.final_scores.communication}/10</span>
                      </div>
                      <div className="score-bar">
                        <span>Problem Solving:</span>
                        <div className="bar-container">
                          <div className="bar-fill final" style={{width: `${scores.final_scores.problem_solving * 10}%`}}></div>
                        </div>
                        <span className="score-value">{scores.final_scores.problem_solving}/10</span>
                      </div>
                      <div className="score-bar">
                        <span>Relevance:</span>
                        <div className="bar-container">
                          <div className="bar-fill final" style={{width: `${scores.final_scores.relevance * 10}%`}}></div>
                        </div>
                        <span className="score-value">{scores.final_scores.relevance}/10</span>
                      </div>
                      <div className="overall-score">
                        <h4>Overall Score: {scores.final_scores.overall}/10</h4>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="messages-area">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender}`}
            >
              <div className="message-avatar">
                {message.sender === 'ai' ? 'AI' : message.sender === 'user' ? 'YOU' : '!'}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {formatMessage(message.text)}
                </div>
                {message.sender === 'user' && message.fullCode && (
                  <div className="code-preview">
                    <div className="code-preview-header">Submitted Code</div>
                    <pre className="code-preview-content">{message.fullCode.substring(0, 200)}{message.fullCode.length > 200 ? '...' : ''}</pre>
                  </div>
                )}
                {message.sender === 'ai' && parseCodeQuestion(message.text) && (
                  <button className="open-code-editor-btn" onClick={() => {
                    const cq = parseCodeQuestion(message.text);
                    setCodeQuestion(cq);
                    setShowCodeEditor(true);
                  }}>
                    Open Code Editor
                  </button>
                )}
                {message.sender === 'ai' && !parseCodeQuestion(message.text) && isLikelyCodingQuestion(message.text) && (
                  <button className="open-code-editor-btn manual" onClick={() => {
                    setCodeQuestion({
                      question: 'Coding Challenge',
                      language: 'python',
                      starterCode: '# Write your solution here\n\n'
                    });
                    setShowCodeEditor(true);
                  }}>
                    Open Code Editor (Manual)
                  </button>
                )}
                {message.sender === 'ai' && message.score && (
                  <div className="inline-score">
                    <div className="score-chips">
                      <span className="chip">📚 Tech: {message.score.technical}/10</span>
                      <span className="chip">💬 Comm: {message.score.communication}/10</span>
                      <span className="chip">🧠 Problem: {message.score.problem_solving}/10</span>
                      <span className="chip">🎯 Relevance: {message.score.relevance}/10</span>
                    </div>
                  </div>
                )}
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isFinished && (
            <div className="interview-finished">
              <div className="finished-icon">✅</div>
              <h3>Interview Completed!</h3>
              <p>Thank you for participating in this AI interview session.</p>
              <button className="finish-btn" onClick={onReset}>
                Start New Interview
              </button>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!isFinished && (
          <form className="input-area" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your answer here..."
              className="message-input"
              rows="3"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              className="send-button"
              disabled={!inputText.trim()}
            >
              Send 📤
            </button>
          </form>
        )}
      </div>

      {/* Code Editor Modal */}
      {showCodeEditor && codeQuestion && (
        <CodeEditor
          language={codeQuestion.language}
          starterCode={codeQuestion.starterCode}
          onSubmit={handleCodeSubmit}
          onClose={handleCloseCodeEditor}
        />
      )}
    </div>
  );
}

export default InterviewChat;
