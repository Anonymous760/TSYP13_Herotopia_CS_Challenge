# ----------------------------------------------------------
# Flask Backend API for AI Interviewer
# ----------------------------------------------------------

from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid
from demo import Interviewer, pdf_to_text, summarize_resume

app = Flask(__name__)
app.secret_key = os.urandom(24)  # For session management
CORS(app, supports_credentials=True)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Store active interview sessions
interview_sessions = {}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "AI Interviewer API is running"})


@app.route('/api/upload-cv', methods=['POST'])
def upload_cv():
    """Upload and process CV"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        role = request.form.get('role', 'Software Engineer')
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Only PDF files are allowed"}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        session_id = str(uuid.uuid4())
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}_{filename}")
        file.save(filepath)
        
        # Extract and summarize CV
        cv_text = pdf_to_text(filepath)
        if cv_text.startswith("[pdf_to_text_error]"):
            return jsonify({"error": "Failed to extract text from PDF"}), 500
        
        cv_summary = summarize_resume(cv_text)
        
        # Create interviewer instance
        interviewer = Interviewer(role=role)
        first_question = interviewer.ask_first_question(cv_summary)
        
        # Store session
        interview_sessions[session_id] = {
            'interviewer': interviewer,
            'cv_summary': cv_summary,
            'role': role,
            'filepath': filepath
        }
        
        return jsonify({
            "session_id": session_id,
            "cv_summary": cv_summary,
            "first_question": first_question,
            "role": role,
            "is_finished": False
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/answer', methods=['POST'])
def submit_answer():
    """Submit candidate answer and get next question"""
    try:
        data = request.json
        session_id = data.get('session_id')
        answer = data.get('answer')
        is_code = data.get('is_code', False)
        
        if not session_id or not answer:
            return jsonify({"error": "session_id and answer are required"}), 400
        
        if session_id not in interview_sessions:
            return jsonify({"error": "Invalid session ID"}), 404
        
        interviewer = interview_sessions[session_id]['interviewer']
        
        if interviewer.is_interview_finished():
            return jsonify({
                "response": "Interview has already concluded.",
                "is_finished": True,
                "question_count": interviewer.question_count
            })
        
        # Get AI response
        ai_response = interviewer.respond_to_candidate(answer, is_code=is_code)
        
        # Get scores
        scores_data = interviewer.get_scores()
        
        return jsonify({
            "response": ai_response,
            "is_finished": interviewer.is_interview_finished(),
            "question_count": interviewer.question_count,
            "scores": scores_data
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/history/<session_id>', methods=['GET'])
def get_history(session_id):
    """Get interview history"""
    try:
        if session_id not in interview_sessions:
            return jsonify({"error": "Invalid session ID"}), 404
        
        interviewer = interview_sessions[session_id]['interviewer']
        history = interviewer.get_history()
        
        # Format history
        formatted_history = []
        for msg in history:
            formatted_history.append({
                "role": msg.role,
                "content": msg.parts[0].text if msg.parts else ""
            })
        
        return jsonify({
            "history": formatted_history,
            "question_count": interviewer.question_count,
            "is_finished": interviewer.is_interview_finished()
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/scores/<session_id>', methods=['GET'])
def get_scores(session_id):
    """Get interview scores"""
    try:
        if session_id not in interview_sessions:
            return jsonify({"error": "Invalid session ID"}), 404
        
        interviewer = interview_sessions[session_id]['interviewer']
        scores_data = interviewer.get_scores()
        
        return jsonify({
            "scores": scores_data,
            "is_finished": interviewer.is_interview_finished()
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/request-code-question/<session_id>', methods=['POST'])
def request_code_question(session_id):
    """Request AI to provide a properly formatted code question"""
    try:
        if session_id not in interview_sessions:
            return jsonify({"error": "Invalid session ID"}), 404
        
        interviewer = interview_sessions[session_id]['interviewer']
        
        prompt = """Please provide a coding question now. Remember to use EXACTLY this format:

[CODE_QUESTION]
[Your problem description here]
[LANGUAGE] python [/LANGUAGE]
[STARTER_CODE]
def solution():
    # starter code
    pass
[/STARTER_CODE]

Make sure to include all the markers."""
        
        response = interviewer.chat.send_message(prompt)
        
        return jsonify({
            "response": response.text,
            "is_finished": interviewer.is_interview_finished()
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/end-session/<session_id>', methods=['DELETE'])
def end_session(session_id):
    """End interview session and cleanup"""
    try:
        if session_id in interview_sessions:
            # Delete uploaded file
            filepath = interview_sessions[session_id]['filepath']
            if os.path.exists(filepath):
                os.remove(filepath)
            
            # Remove session
            del interview_sessions[session_id]
            
            return jsonify({"message": "Session ended successfully"})
        else:
            return jsonify({"error": "Session not found"}), 404
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
