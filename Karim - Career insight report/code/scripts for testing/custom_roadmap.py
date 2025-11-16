import pandas as pd
import os
from openai import OpenAI
from pypdf import PdfReader # For reading PDF resumes
import time

# ==============================================================================
# SECTION 1: CONFIGURATION
# ==============================================================================

# -- FILE PATHS --
# IMPORTANT: Update this to the path of the user's resume/CV.
CV_PATH = 'cv.pdf' 
DEMANDED_SKILLS_CSV_PATH = 'skill_summary_ranked.csv'

# -- ANALYSIS PARAMETERS --
# How many of the top skills from our analysis should we consider for the gap analysis?
TOP_N_DEMANDED_SKILLS = 10


# LLM API config 
NIM_API_KEY = "OUR_NVIDIA_NIM_API_KEY_HERE"
NIM_BASE_URL = "https://integrate.api.nvidia.com/v1"
MODEL_NAME = "meta/llama-3.1-405b-instruct" 

# ==============================================================================
# SECTION 2: HELPER FUNCTIONS
# ==============================================================================

def read_cv_text(file_path: str) -> str:
    """Reads text content from a file (currently supports .pdf and .txt)."""
    print(f"[INFO] Reading content from '{file_path}'...")
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"The CV file was not found at '{file_path}'. Please check the path.")
    
    text = ""
    if file_path.lower().endswith('.pdf'):
        reader = PdfReader(file_path)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    elif file_path.lower().endswith('.txt'):
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
    else:
        raise NotImplementedError("Unsupported file format. Please use a .pdf or .txt file.")
        
    return text

def extract_skills_from_text(text: str, client: OpenAI) -> list[str]:
    """Uses the LLM to extract a list of technical skills from a block of text."""
    print("[INFO] Extracting skills from your CV using the AI...")
    system_prompt = "You are an AI assistant that extracts technical skills from text. Your response must be a single, comma-separated string of skills. If no skills are found, return NONE."
    user_prompt = f"""
    Based on the following resume text, extract all technical skills.
    Focus on programming languages, frameworks, libraries, cloud platforms, databases, and tools.
    ---
    {text}
    ---
    Extracted Skills:
    """
    
    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            temperature=0.0,
            max_tokens=500,
        )
        response = completion.choices[0].message.content.strip()
        if response.upper() == "NONE":
            return []
        return [skill.strip() for skill in response.split(',') if skill.strip()]
    except Exception as e:
        print(f"[ERROR] Could not extract skills from CV. Reason: {e}")
        return []

from fpdf import FPDF

def save_as_pdf(content: str, filename: str = "personalized_roadmap.pdf"):
    """Save the roadmap content as a PDF file."""
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.set_font("Arial", size=12)

        # Split content into lines and write
        for line in content.split("\n"):
            # Allow for multi-line text
            pdf.multi_cell(0, 8, line)
        
        pdf.output(filename)
        print(f"[INFO] Roadmap saved as PDF: {filename}")
    except Exception as e:
        print(f"[ERROR] Could not save PDF file: {e}")







# ==============================================================================
# SECTION 3: MAIN EXECUTION LOGIC
# ==============================================================================





def main():
    """Main function to run the custom roadmap generation pipeline."""
    
    print("--- Starting Your Personalized Career Gap Analysis ---")

    # --- Step 1: Setup and Initial Checks ---
    if NIM_API_KEY == "YOUR_NVIDIA_API_KEY_HERE":
        raise ValueError("NVIDIA_API_KEY is not set.")
    
    client = OpenAI(base_url=NIM_BASE_URL, api_key=NIM_API_KEY)

    # --- Step 2: Load and Process Demanded Skills ---
    print(f"[INFO] Loading the top {TOP_N_DEMANDED_SKILLS} most in-demand skill categories...")
    try:
        demanded_df = pd.read_csv(DEMANDED_SKILLS_CSV_PATH)
        top_demanded_categories = set(demanded_df.head(TOP_N_DEMANDED_SKILLS)['final_label'])
        # Also get the specific skills for context later
        demanded_skills_details = demanded_df.head(TOP_N_DEMANDED_SKILLS).set_index('final_label')['original_skills'].to_dict()
    except FileNotFoundError:
        print(f"[ERROR] The demanded skills file was not found: '{DEMANDED_SKILLS_CSV_PATH}'")
        print("Please run 'cluster_and_normalize.py' first.")
        return

    # --- Step 3: Extract Skills from User's CV ---
    try:
        cv_text = read_cv_text(CV_PATH)
        user_cv_skills = extract_skills_from_text(cv_text, client)
        if not user_cv_skills:
            print("[WARNING] No technical skills were extracted from your CV. The roadmap will include all top skills.")
    except Exception as e:
        print(f"[ERROR] Failed to process your CV. Reason: {e}")
        return

    # --- Step 4: Perform the Gap Analysis ---
    print("[INFO] Performing gap analysis: Comparing your skills to market demand...")
    
    # To perform the comparison, we ask the LLM to categorize the user's skills
    # This is more robust than simple string matching.
    categorization_prompt = f"""
    You are an expert skills analyst. Your task is to categorize a given list of skills.
    Here are the only allowed categories: {list(top_demanded_categories)}
    Here is the list of skills from a user's resume: {user_cv_skills}
    
    Return a comma-separated list of the categories that the user's skills fall into. Do not include categories they don't have. If none of their skills match any category, return NONE.
    """
    
    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": categorization_prompt}],
            temperature=0.0,
            max_tokens=300
        )
        response = completion.choices[0].message.content.strip()
        user_has_categories = set()
        if response.upper() != "NONE":
            user_has_categories = set([cat.strip() for cat in response.split(',')])
    except Exception as e:
        print(f"[ERROR] Could not categorize user skills. Reason: {e}")
        user_has_categories = set() # Assume no matching skills on error
        
    # The core logic: find the difference between demanded skills and what the user has
    missing_categories = top_demanded_categories - user_has_categories
    
    # --- Step 5: Generate the Personalized Roadmap with the LLM ---
    print("[INFO] Generating your personalized roadmap with an AI career coach...")
    
    if not missing_categories :
        
        print("\n" + "="*80)
        print("🎉 Congratulations! Your skills are highly aligned with the top market demands! 🎉")
        print("Based on this analysis, you possess skills in all the top categories. Keep honing your expertise!")
        print("="*80)
        return

    # Prepare data about missing skills for the final prompt
    missing_skills_details = {cat: demanded_skills_details[cat] for cat in missing_categories}

    system_prompt = (
    "You are a world-class career coach and technical mentor. "
    "You create highly personalized, detailed, and actionable learning roadmaps that guide users step-by-step to fill skill gaps and become top candidates. "
    "Your roadmaps are structured like a practical career playbook, combining strategy, clear instructions, and motivation."
)

    user_prompt = f"""
A user is requesting a personalized, step-by-step learning roadmap. You have access to their resume and an analysis of the job market.

**User's Existing Skill Categories (Acknowledge and frame positively):**
{list(user_has_categories) if user_has_categories else "None detected"}

**High-Demand Skill Categories the User is MISSING (Focus on these):**
{missing_skills_details}

**Your Task:**
Create a detailed, actionable, and appealing roadmap that focuses *only on the missing skill categories*.

**Guidelines for the Roadmap:**
1. Start with a positive introduction highlighting the user's existing strengths and explaining how these provide a strong foundation for growth.
2. For each missing skill category:
    - Provide a compelling explanation of *why this skill is crucial* in today’s job market.
    - Describe *how it complements the user's current skills* to make their profile stronger.
    - Break the category into *core concepts* or sub-skills.
    - Suggest a *practical, first step* the user can take immediately.
    - Optionally include a small *mini-project, exercise, or real-world application* to solidify learning.
    - Recommend resources, tools, or platforms if relevant.
3. Organize the roadmap in a logical sequence: start from foundational skills and progress to advanced applications.
4. Include *tips, motivational insights, and warnings about common pitfalls* to make the guide feel practical and human.
5. Conclude with a motivational summary emphasizing the benefits of mastering these skills and encouraging consistent progress.

**Format and Tone:**  
- Write in clear, engaging, and encouraging language.  
- Use headings, bullet points, and step numbers for readability.  
- Make the roadmap feel like a detailed, ready-to-use guide rather than a generic list.  

Write the roadmap directly, fully detailed, actionable, and ready for the user to implement.
"""


    
    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            temperature=0.6,
            max_tokens=2048
        )
        custom_roadmap = completion.choices[0].message.content
        
        # --- Step 6: Display the Final Roadmap ---
        print("\n" + "="*80)
        print("    🎯 YOUR PERSONALIZED SKILL-UP ROADMAP 🎯")
        print("="*80)
        print(custom_roadmap)
        print("="*80)
        save_as_pdf(custom_roadmap)

    except Exception as e:
        print(f"[ERROR] Failed to generate the final roadmap. Reason: {e}")


if __name__ == "__main__":
    main()