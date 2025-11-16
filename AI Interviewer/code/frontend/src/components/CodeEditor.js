import React, { useState, useEffect } from 'react';
import './CodeEditor.css';

function CodeEditor({ language, starterCode, onSubmit, onClose }) {
  const [code, setCode] = useState(starterCode || '');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (starterCode) {
      setCode(starterCode);
    }
  }, [starterCode]);

  const handleSubmit = () => {
    if (code.trim()) {
      onSubmit(code);
      setOutput('');
    }
  };

  const handleReset = () => {
    setCode(starterCode || '');
    setOutput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="code-editor-overlay">
      <div className="code-editor-modal">
        <div className="code-editor-header">
          <div className="header-left">
            <div className="code-icon">{'</>'}</div>
            <div>
              <h3>Code Editor</h3>
              <p>Language: {language || 'Python'}</p>
            </div>
          </div>
          <button className="close-editor-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="code-editor-body">
          <div className="editor-container">
            <div className="line-numbers">
              {lineNumbers.map((num) => (
                <div key={num} className="line-number">
                  {num}
                </div>
              ))}
            </div>
            <textarea
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your code here..."
              spellCheck="false"
            />
          </div>

          {output && (
            <div className="output-container">
              <div className="output-header">Output</div>
              <pre className="output-content">{output}</pre>
            </div>
          )}
        </div>

        <div className="code-editor-footer">
          <div className="footer-left">
            <span className="char-count">{code.length} characters</span>
            <span className="line-count">{lineCount} lines</span>
          </div>
          <div className="footer-right">
            <button className="reset-code-btn" onClick={handleReset}>
              Reset Code
            </button>
            <button className="submit-code-btn" onClick={handleSubmit} disabled={!code.trim()}>
              Submit Solution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeEditor;
