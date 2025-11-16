import os
import io
import json
import re
import ast
from pypdf import PdfReader
import pandas as pd
import torch
import numpy as np
from flask import Flask, request, jsonify, render_template # <-- ADD render_template
from openai import OpenAI
from sentence_transformers import SentenceTransformer,util
import datetime
current_date = str(datetime.datetime.now())

# --- 1. Initial Configuration & Model Loading (Runs Once on Startup) ---
def extract_text_from_pdf(pdf_stream):
    """
    Extracts text content from a PDF file stream using pypdf.
    """
    # Create a PdfReader object from the file stream
    reader = PdfReader(pdf_stream)
    text = ""
    # Iterate through each page in the PDF
    for page in reader.pages:
        # Extract text from the page and append it
        page_text = page.extract_text()
        if page_text: # Ensure text was actually extracted
            text += page_text
    return text
print("--- Initializing API: Loading models and data... ---")

# --- Environment Variable Setup ---
# Load your API key from an environment variable for security.
# In your terminal: export LLM_API_KEY="your_key_here"


# --- LLM and Embedding Model Configuration ---
client = OpenAI(base_url="https://api.llm7.io/v1",api_key="4LPcl/IAgbPijsDc3iQXFSSYy9Mb1Xj1ieIZnRb1ZDtzNDW0Kmwisz7mphyed3oN+srfcqMqx2PnbOc19cvE0TgJE02HeZgndZPxUU5haEVpOCKj0Fq3xTrUZaSirYgxUSE=")
EMBEDDING_MODEL_NAME = 'all-MiniLM-L6-v2'
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
print(DEVICE)
try:
    print("embed")
    EMBEDDING_MODEL = SentenceTransformer("/home/guest/job/embedding_model", device=DEVICE)
    print(f"Embedding model '{EMBEDDING_MODEL_NAME}' loaded on {DEVICE}.")
except Exception as e:
    raise RuntimeError(f"Failed to load SentenceTransformer model: {e}")
print("sucess")
# --- Load and Pre-process Job Database ---
try:
    JOBS_DF = pd.read_csv("main.csv")
    # `ast.literal_eval` is a key step to parse the string representation of the embedding list back into a real list.
    JOBS_DF['embedding'] = JOBS_DF['embedding'].apply(ast.literal_eval)
    # Convert the list of embeddings into a single NumPy matrix for fast computation.
    JOB_EMBEDDINGS = np.array(JOBS_DF['embedding'].tolist(), dtype=np.float32)
    print(f"Job database loaded successfully. {len(JOBS_DF)} jobs available.")
except FileNotFoundError:
    raise RuntimeError("The job database CSV file was not found. Make sure it's in the same directory.")
except Exception as e:
    raise RuntimeError(f"Error processing the job database CSV: {e}")

# --- LLM Prompt Definition ---
cv_extraction_prompt="""You are a seasoned Principal Engineer acting as a hiring manager. Your task is to review a candidate's resume and distill their experience into a structured JSON object for an internal recruiting tool. Your primary goal is to identify their most significant and demonstrated technical skills and calculate their total experience.

You will be given the current date to accurately calculate experience for roles listed as "Present".

Your response must be ONLY the valid JSON object.

---
### **JSON SCHEMA, Instructions AND GUIDELINES**

{
  "match_context": "string",
  "hard_skills": ["string"],
  "domain_keywords": ["string"],
  "job_title": "string",
  "total_years_of_experience": "integer | null"
}

*   **`match_context`**:
    *   In your own words as an engineer, write a brief, 3-4 sentence summary of the candidate's professional profile.
    *   **Focus on their core actions and business outcomes** (e.g., 'specializes in building scalable backend services,' 'proven experience in cloud infrastructure migration').
    *   **Do not list specific technologies or tools in this summary.**

*   **`hard_skills`**:
    *   As a hiring manager, identify all technical hard skills demonstrated by the candidate.
    *   Scan the entire resume, including summaries, skill sections, and work experience descriptions.
    *   **CRITICAL FORMATTING RULE:** The final list must contain **ONLY the technology name itself.** For example, if the text says "Experience with Python", the value in the list must be `"Python"`, not `"Experience with Python"`.

*   **`domain_keywords`**:
    *   List the key business or process-related terms that define the candidate's experience (e.g., "SaaS", "FinTech", "Agile", "CI/CD", "Data Governance").

*   **`job_title`**:
    *   Extract the candidate's most recent or current job title.

*   **`total_years_of_experience`**:
    *   Calculate the candidate's total years of professional experience as an integer.
    *   Parse the start and end dates from their work history.
    *   Use the provided **Current Date** as the end date for any role listed as "Present" or without an end date.
    *   Sum the duration of all roles. Round the final number to the nearest whole integer.
    *   If no work history or dates are provided, return null.

ABSOLUTELY CRITICAL - READ THIS CAREFULLY:
1. NO markdown formatting whatsoever
2. NO ```json or ``` in your response
3. Start with "{{" and end with "}}"
4. ONLY GIVE OUTPUT IN ENGLISH
---

### **BEGIN REVIEW**

Review the following resume text and produce the JSON object.

**Current Date:**"""+current_date+'\n**Resume Text:**'
print("--- API Initialization Complete. Ready for requests. ---")


# --- 2. Helper Functions ---



def get_structured_cv_data(cv_text: str) -> dict:
    """Uses the LLM to extract a structured JSON from the CV text."""
    prompt = cv_extraction_prompt + cv_text
    try:
        response = client.chat.completions.create(
            model="gemini-2.5-pro",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        # We trust the API to return valid JSON when using `response_format`
        return response.choices[0].message.content
    except Exception as e:
        # If the API call fails for any reason, we raise an exception to be caught by the API endpoint.
        print(f"LLM API call failed: {e}")
        raise

# --- 3. Flask Application ---

app = Flask(__name__)
@app.route('/')
def index():
    """Serves the main HTML page for the frontend."""
    # This tells Flask to look in the 'templates' folder for 'index.html'
    return render_template('index.html')
@app.route('/match-cv', methods=['POST'])
def match_cv_endpoint():
    """
    API endpoint to match a CV (PDF) against the job database.
    Expects a POST request with a file upload under the key 'cv_pdf'.
    """
    # --- Input Validation ---
    if 'cv_pdf' not in request.files:
        return jsonify({"error": "No 'cv_pdf' file part in the request"}), 400

    file = request.files['cv_pdf']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "File must be a PDF"}), 400

    try:
        # --- Core Logic ---
        # 1. Extract text from the uploaded PDF
        cv_text = extract_text_from_pdf(file.stream)
        if not cv_text.strip():
            return jsonify({"error": "Could not extract text from PDF"}), 400
        print("1")
        # 2. Get structured data (including match_context) from the LLM
        structured_cv_data = get_structured_cv_data(cv_text)
        cv_match_context = structured_cv_data
        if not cv_match_context:
            return jsonify({"error": "LLM failed to generate a match_context from the CV"}), 500

        # 3. Embed the CV's match_context
        cv_embedding = EMBEDDING_MODEL.encode(cv_match_context, normalize_embeddings=True)
        print("3")
        # 4. Perform the semantic search
        top_k = 6
        # `util.semantic_search` requires the query embedding to be a Tensor.
        search_results = util.semantic_search(torch.tensor(cv_embedding), torch.tensor(JOB_EMBEDDINGS), top_k=top_k)

        # 5. Format the output
        top_matches = []
        print("5")
        for result in search_results[0]: # search_results is a list containing one list of results
            job_index = result['corpus_id']
            job_data = JOBS_DF.iloc[job_index]
            top_matches.append({
                "title": job_data.get("title", "N/A"),
                "description": job_data.get("description", "N/A"),
                "job_url":job_data.get("job_url", "N/A")
            })

        return jsonify(top_matches)

    except Exception as e:
        print(f"An internal error occurred: {e}")
        return jsonify({"error": "An internal server error occurred during processing."}), 500


# --- 4. Run the Application ---

if __name__ == '__main__':
    # To run in production, use a proper WSGI server like Gunicorn or Waitress.
    # Example: gunicorn --workers 4 --bind 0.0.0.0:5000 app:app
    app.run(host='0.0.0.0', port=5000, debug=True)
