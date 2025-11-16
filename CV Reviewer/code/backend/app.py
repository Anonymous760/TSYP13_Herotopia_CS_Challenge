from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import os
from openai import OpenAI
from dotenv import load_dotenv
from pathlib import Path
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import pdfplumber
import json
from resume_parser import ResumeParser
import time
import random

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Get NVIDIA API key from environment variables (OpenAI-compatible backend)
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

if not NVIDIA_API_KEY:
    raise ValueError("NVIDIA_API_KEY not found in environment variables")

origins = [
    "https://hiremeats.vercel.app",
    "http://localhost:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)






@app.get("/ping")
def ping():
    return {"message": "Server is running"}


@app.post("/analyze-resume")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    job_title: Optional[str] = Form(None),
    company: Optional[str] = Form(None),
    experience: Optional[int] = Form(None)
):
    try:
        # Create upload directory if it doesn't exist
        save_folder = "uploaded_files"
        Path(save_folder).mkdir(parents=True, exist_ok=True)
        
        # Save the uploaded file
        save_path = Path(save_folder, file.filename)
        with open(save_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Initialize the resume parser
        parser = ResumeParser()

        # Parse and structure the resume data
        try:
            structured_data = parser.parse(save_path)
            # Get a concise summary for API (reduces token usage)
            resume_summary = parser.get_summary_for_analysis(structured_data, max_chars=3000)
            # Keep full extracted text for return to frontend
            extracted_text = parser.extract_text_from_pdf(save_path)
        except Exception as e:
            print(f"Error parsing resume: {e}")
            resume_summary = "Could not parse resume properly"
            extracted_text = "Could not extract text from PDF"
            structured_data = {}

        # Initialize NVIDIA NIM-compatible client (OpenAI protocol)
        client = OpenAI(
            api_key=NVIDIA_API_KEY,
            base_url="https://integrate.api.nvidia.com/v1",
        )

        # Get current date for timeline accuracy
        current_date = datetime.now().strftime("%B %d, %Y")
        
        # Prepare structured resume info
        detected_skills = ', '.join(structured_data.get('skills', [])[:15]) if structured_data.get('skills') else 'Not detected'
        detected_experience = structured_data.get('estimated_experience_years', 'Not detected')

        # Compose job description prompt with structured data
        prompt = f"""
Current date is {current_date}. You are an expert ATS (Applicant Tracking System) resume analyst with extensive knowledge of hiring best practices across industries. Your role is to provide comprehensive, actionable feedback that helps candidates improve their resumes for both ATS systems and human recruiters.

## Input Data:
- **Resume File**: {file.filename}
- **Job Title**: {job_title}
- **Company**: {company}
- **Job Description**: {job_description if job_description else f'Use your knowledge of typical {job_title} roles at {company} to infer the requirements'}
- **Candidate's Experience Level**: {experience if experience else detected_experience}
- **Detected Key Skills**: {detected_skills}

## Resume Content (Structured Summary):
{resume_summary}

## Analysis Instructions:

### 1. Overall Resume Score (0-100)
Calculate based on weighted average of all ATS criteria:
- Skill Match (25%) - Technical/functional skills alignment
- Keyword Match (20%) - Industry-specific terms and job requirements
- Experience Relevance (20%) - Past roles and achievements relevance
- Resume Formatting (15%) - ATS-friendly structure and readability
- Action Verb Usage (10%) - Strong action verbs demonstrating impact
- Job Fit (10%) - Overall candidate-role compatibility

**Scoring Guidelines:**
- 90-100: Exceptional resume, minimal improvements needed
- 80-89: Strong resume, few minor enhancements
- 70-79: Good resume, some important improvements needed
- 60-69: Average resume, significant improvements required
- Below 60: Needs major restructuring and content improvements

### 2. Feedback Summary (Exactly 5 lines)
**Lines 1-2: Highlight Top Strengths** - Be specific and cite examples
- Mention the most impactful skills, achievements, or experiences that stand out
- Highlight effective use of metrics and quantifiable results

**Lines 3-5: Critical Improvement Areas** - Provide ACTIONABLE recommendations
- Identify the most important missing keywords or skills from job description
- Suggest the highest-impact formatting or content improvements
- Recommend adding quantifiable achievements where most needed

### 3. Pros and Cons Analysis
**Pros (Exactly 3)**: Be SPECIFIC with examples from the resume
- Example: "Strong quantification: 'Reduced deployment time by 40% through CI/CD automation'"
- Focus on: impactful achievements, relevant skills, good formatting, keyword usage

**Cons (Exactly 3)**: Provide SPECIFIC improvement suggestions
- Example: "Missing key skills: Add 'Docker' and 'Kubernetes' to skills section"
- Example: "Weak action verb: Replace 'Responsible for' with 'Led', 'Managed', or 'Orchestrated'"
- Example: "Formatting issue: Use consistent date formatting (MM/YYYY) throughout"
- Focus on: missing keywords, weak verbs, formatting issues, content gaps

### 4. ATS Criteria Ratings (Each scored 0-10)

**Skill Match Score (0-10):**
- 9-10: All required and preferred skills present with strong evidence
- 7-8: Most required skills present, some preferred skills missing
- 5-6: Core skills present but lacking depth or key preferred skills
- 3-4: Several required skills missing or poorly demonstrated
- 0-2: Most required skills absent

**Keyword Match Score (0-10):**
- 9-10: Excellent keyword density, industry terminology, job-specific terms
- 7-8: Good keyword usage, minor gaps in terminology
- 5-6: Adequate keywords but missing important industry terms
- 3-4: Poor keyword optimization, many gaps
- 0-2: Minimal or no relevant keywords

**Experience Relevance Score (0-10):**
- 9-10: Highly relevant experience with clear progression and achievements
- 7-8: Good experience match with minor gaps
- 5-6: Somewhat relevant experience, needs better positioning
- 3-4: Limited relevant experience or poorly presented
- 0-2: Experience not relevant to role

**Resume Formatting Score (0-10):**
- 9-10: Perfect ATS formatting - clean, organized, consistent, scannable
- 7-8: Good formatting with minor inconsistencies
- 5-6: Acceptable but has formatting issues (tables, columns, graphics)
- 3-4: Poor formatting that may confuse ATS
- 0-2: Major formatting issues, likely unparseable

**Action Verb Usage Score (0-10):**
- 9-10: Consistent use of powerful action verbs, demonstrates impact
- 7-8: Good action verbs with some weak phrases
- 5-6: Mix of strong and weak verbs, some passive language
- 3-4: Mostly weak verbs or passive voice
- 0-2: No action verbs, entirely passive

**Job Fit Score (0-10):**
- 9-10: Excellent fit, clearly qualified for role
- 7-8: Good fit with minor gaps
- 5-6: Moderate fit, requires some positioning
- 3-4: Questionable fit, significant gaps
- 0-2: Poor fit for role

### 5. Confidence Score (0-100)
Rate your confidence in the assessment accuracy based on:
- Resume completeness and clarity (30%)
- Job description specificity (30%)
- Industry/role knowledge availability (20%)
- Resume quality and formatting (20%)

### 6. Top Matches and Gaps (3 each)
**Top 3 Matching Criteria**: List the 3 strongest aspects that align with the job
- Be SPECIFIC with examples from resume
- Format: Short title (3-5 words) + brief explanation

**Top 3 Missing/Gap Criteria**: List the 3 most critical gaps or weaknesses
- Be SPECIFIC about what's missing or needs improvement
- Format: Short title (3-5 words) + brief explanation

## Output Format:
RESPONSE FORMAT: Return ONLY the JSON object. No markdown, no code blocks, no additional text.
WRONG: ```json{{...}}```
RIGHT: `{{...}}`

-```json
-{{
-  "overall_score": 85,
-  "top_matches": [
-    {{"title": "Cloud Infrastructure Expertise", "description": "Demonstrated experience with AWS, Docker, and Kubernetes aligning perfectly with job requirements"}},
-    {{"title": "Quantified Achievements", "description": "Strong use of metrics like '40% deployment time reduction' showing measurable impact"}},
-    {{"title": "Relevant Tech Stack", "description": "Python, CI/CD, and automation skills directly match the tech stack mentioned in job description"}}
-  ],
-  "top_gaps": [
-    {{"title": "Missing Key Tools", "description": "Terraform and Jenkins are required but not mentioned in the resume"}},
-    {{"title": "Weak Action Verbs", "description": "Passive phrases like 'Responsible for' should be replaced with strong verbs like 'Led' or 'Engineered'"}},
-    {{"title": "Incomplete Metrics", "description": "Only 3 out of 8 bullet points include quantifiable results - needs more numbers and percentages"}}
-  ],
-  "feedback_summary": [
-    "Strong quantifiable achievement: 'Reduced deployment time by 40% using CI/CD automation' demonstrates clear impact",
-    "Excellent keyword usage: Resume includes key terms like 'Python', 'Docker', 'Kubernetes' matching job requirements", 
-    "Missing key skills: Add 'Terraform' and 'Jenkins' explicitly mentioned in job description",
-    "Weak action verbs: Replace 'Responsible for' with 'Led', 'Managed', or 'Orchestrated'",
-    "Add metrics: Include quantifiable results (e.g., 'Improved system performance by X%') to more bullet points"
-  ],
-  "pros": [
-    "Strong quantification: 'Reduced costs by 30% through infrastructure optimization' - demonstrates measurable impact",
-    "Excellent keyword alignment: Resume contains 15 out of 18 key technical terms from job description including Python, AWS, and Docker", 
-    "Professional formatting: Clean structure with clear sections, consistent fonts, and ATS-friendly layout without tables or graphics"
-  ],
-  "cons": [
-    "Missing critical skills: Add 'Terraform', 'Jenkins', and 'GitLab CI/CD' explicitly mentioned in job requirements to technical skills section",
-    "Weak action verbs detected: Replace passive phrases like 'Was responsible for' and 'Helped with' with strong verbs like 'Engineered', 'Architected', 'Spearheaded'",
-    "Insufficient quantification: Only 3 out of 8 bullet points include metrics - add numbers, percentages, or outcomes to demonstrate impact (e.g., 'Reduced deployment time from 2 hours to 15 minutes')"
-  ],
-  "improvement_suggestions": [
-    "Add missing keywords: Include 'Terraform', 'Jenkins', 'GitLab CI/CD', and 'Infrastructure as Code' in your skills or experience sections",
-    "Quantify achievements: Add metrics to each bullet point - numbers, percentages, time saved, money saved, or scale (e.g., 'managed 50+ servers')",
-    "Strengthen action verbs: Replace weak verbs - 'Did'→'Executed', 'Helped'→'Collaborated', 'Worked on'→'Engineered', 'Responsible for'→'Led'",
-    "Optimize formatting: Use consistent date format (MM/YYYY), remove any tables/columns, use standard fonts (Arial, Calibri, Times New Roman)",
-    "Add relevant certifications: Consider adding AWS, Azure, or Google Cloud certifications if you have them",
-    "Tailor summary/objective: Include a professional summary at the top highlighting your {experience}+ years of experience and key skills matching this {job_title} role",
-    "Remove irrelevant content: Consider removing experience older than 10-15 years or unrelated to {job_title} positions to keep resume focused",
-    "Use industry terminology: Include terms like 'microservices architecture', 'containerization', 'orchestration' that are common in {job_title} roles",
-    "Highlight soft skills: Add leadership, collaboration, or problem-solving examples where you 'Led cross-functional teams' or 'Mentored junior developers'",
-    "Include relevant projects: Add a projects section showcasing personal or open-source work that demonstrates skills mentioned in job description"
-  ],
-  "ats_criteria_ratings": {{
-    "skill_match_score": 8,
-    "keyword_match_score": 7,
-    "experience_relevance_score": 9,
-    "resume_formatting_score": 6,
-    "action_verb_usage_score": 8,
-    "job_fit_score": 7
-  }},
-  "confidence_score": 85
-}}
-```

 ## Invalid Resume Response Format:
 If the uploaded file is not a valid resume (e.g., random document, image without resume content, etc.), return this exact format:
-```json
-{{
-  "overall_score": 0,
-  "feedback_summary": [
-    "Not a valid resume file - the uploaded document does not appear to contain resume content"
-  ],
-  "pros": [
-    "Not a valid resume file"
-  ],
-  "cons": [
-    "Not a valid resume file"
-  ],
-  "improvement_suggestions": [
-    "Please upload a valid resume file in PDF format containing your professional experience, education, and skills"
-  ],
-  "ats_criteria_ratings": {{
-    "skill_match_score": 0,
-    "keyword_match_score": 0,
-    "experience_relevance_score": 0,
-    "resume_formatting_score": 0,
-    "action_verb_usage_score": 0,
-    "job_fit_score": 0
-  }},
-  "confidence_score": 0
-}}
-```

 ## Critical Guidelines:
 - **Be SPECIFIC**: Always cite examples from the resume and provide concrete suggestions
 - **Be ACTIONABLE**: Every improvement should tell the candidate exactly what to do
 - **Use Examples**: When suggesting changes, show before/after examples
 - **Prioritize Impact**: Focus suggestions on changes that will most improve ATS score
 - **Stay Professional**: Use encouraging, constructive language
 - **Be Thorough**: Provide 8-10 specific improvement suggestions covering keywords, formatting, content, and metrics
 - Return ONLY pure JSON without markdown wrappers (```json), code blocks, or any additional text
 - Output must start with {{ and end with }} - no extra characters or formatting
 - MUST include the improvement_suggestions field with 8-10 actionable recommendations

ABSOLUTELY CRITICAL - READ THIS CAREFULLY:
1. NO markdown formatting whatsoever
2. NO ```json or ``` in your response
3. Start with "{{" and end with "}}"
4. MUST include confidence_score field
- MUST include improvement_suggestions array with 8-10 specific actionable items
6. If you include any formatting other than pure JSON, the response is INVALID
"""
        # Call chat/completions model with simple retry on rate limits
        def generate_with_retries(
            client,
            messages,
            model: str = "meta/llama3-8b-instruct",
            max_retries: int = 4,
            base_delay: float = 1.0,
            max_delay: float = 10.0,
        ):
            """Generate content with exponential backoff + jitter for 429 / resource exhausted errors."""
            attempt = 0
            while True:
                try:
                    return client.chat.completions.create(
                        model=model,
                        messages=messages,
                    )
                except Exception as e:
                    err_text = str(e).lower()
                    is_rate_limit = (
                        "429" in err_text
                        or "resource_exhausted" in err_text
                        or "resource exhausted" in err_text
                        or "rate limit" in err_text
                    )
                    attempt += 1
                    if not is_rate_limit or attempt > max_retries:
                        # Non-rate-limit error or retries exhausted
                        raise
                    delay = min(max_delay, base_delay * (2 ** (attempt - 1)))
                    jitter = random.uniform(0, delay * 0.1)
                    sleep_time = delay + jitter
                    print(
                        f"NVIDIA LLM rate limit encountered (attempt {attempt}/{max_retries}). "
                        f"Retrying in {sleep_time:.1f}s..."
                    )
                    time.sleep(sleep_time)

        messages = [
            {"role": "system", "content": "You are an expert ATS resume analyst."},
            {"role": "user", "content": prompt},
        ]

        try:
            completion = generate_with_retries(client, messages)
            llm_text = completion.choices[0].message.content
        except Exception as e:
            err_msg = str(e)
            print(f"NVIDIA LLM API error after retries: {err_msg}")
            raise HTTPException(
                status_code=503,
                detail=(
                    "AI service temporarily unavailable due to rate limits. "
                    "Please try again in a few moments."
                ),
            )

        # Clean the response text to remove markdown formatting and extract the JSON object
        try:
            # Find the start and end of the JSON object
            llm_text = completion.choices[0].message.content
            start_index = llm_text.find('{')
            end_index = llm_text.rfind('}')

            if start_index == -1 or end_index == -1:
                raise ValueError("Could not find a JSON object in the LLM response.")

            json_str = llm_text[start_index : end_index + 1]
            response_json = json.loads(json_str)

            # Add additional data to the response
            response_json['extracted_text'] = extracted_text
            response_json['filename'] = file.filename
            response_json['analyzed_at'] = current_date
            final_response = json.dumps(response_json)

        except (ValueError, json.JSONDecodeError) as e:
            print(f"Error parsing LLM response: {e}")
            # Send the raw text for debugging, but flag it as an error for the frontend
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse the analysis from the AI model. Raw response: {llm_text}",
            )

        # Clean up: remove the uploaded file
        if save_path.exists():
            save_path.unlink()

        return {"response": final_response}

    except Exception as e:
        # Clean up in case of error
        if 'save_path' in locals() and save_path.exists():
            save_path.unlink()
        raise HTTPException(status_code=500, detail=str(e))
