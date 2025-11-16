# imports 
import pandas as pd
from openai import OpenAI
import os
import json
from tqdm import tqdm
import time
import re

INPUT_CSV_PATH = 'jobs_dataset.csv'
OUTPUT_JSON_PATH = 'extracted_skills.json'

# name of the column in the CSV that contains job descriptions
JOB_DESCRIPTION_COLUMN = 'description' 

# LLM API config 
NIM_API_KEY = "OUR_NVIDIA_NIM_API_KEY_HERE"
NIM_BASE_URL = "https://integrate.api.nvidia.com/v1"
MODEL_NAME = "meta/llama-3.1-405b-instruct" 


# ==============================================================================
# SECTION 2: SKILL EXTRACTION FUNCTION (IMPROVED)
# ==============================================================================

def extract_skills_with_nim(job_description_text: str, client: OpenAI) -> list[str]:
    """
    Uses a highly-structured prompt with an LLM via NVIDIA NIM to extract technical skills.

    Args:
        job_description_text: The full text of the job description.
        client: The initialized OpenAI client for making API calls.

    Returns:
        A cleanly parsed list of extracted skills.
    """
    if not isinstance(job_description_text, str) or not job_description_text.strip():
        return []

    # --- NEW: System Prompt defining the AI's role and strict rules ---
    system_prompt = """
    You are a highly specialized AI assistant for text processing. Your sole function is to extract technical skills from a given text and return them in a specific, machine-readable format.
    **Your Rules:**
    1. You MUST identify and extract technical skills. These include programming languages, frameworks, libraries, cloud technologies, databases, tools, and technical methodologies.
    2. You MUST ignore soft skills (e.g., communication, teamwork) and generic business terms.
    3. Your response MUST BE a single line of text containing a comma-separated list of the skills you found.
    4. You MUST NOT include ANY introductory text, preamble, explanations, or conversational filler. Do not start your response with "Here are the skills:" or any similar phrase.
    5. If no technical skills are found in the text, you MUST return the single word: NONE
    """

    # --- NEW: User Prompt providing a clear example (few-shot) and the actual task ---
    user_prompt = f"""
    **EXAMPLE TASK:**
    Job Description:
    ---
    We need a Python developer with experience in Django and PostgreSQL. Familiarity with AWS and Git is required. Strong communication is a plus.
    ---
    Extracted Skills:
    Python, Django, PostgreSQL, AWS, Git

    **ACTUAL TASK:**
    Job Description:
    ---
    {job_description_text}
    ---
    Extracted Skills:
    """

    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.0,
            max_tokens=250,
        )

        response_text = completion.choices[0].message.content.strip()

        if not response_text or response_text.upper() == "NONE":
            return []

        # --- NEW: More robust parsing logic ---
        # 1. Remove any potential preamble that might slip through
        if ":" in response_text:
            response_text = response_text.split(":")[-1].strip()
        
        # 2. Split by newline first, then by comma, to handle multi-line outputs
        lines = response_text.split('\n')
        all_skills = []
        for line in lines:
            # Split each line by comma and extend the main list
            skills_on_line = [skill.strip() for skill in line.split(',') if skill.strip()]
            all_skills.extend(skills_on_line)
            
        # 3. Final cleanup to remove non-skill artifacts
        # This regex removes common conversational filler words that might still appear
        cleaned_skills = [re.sub(r'^\W+|\W+$', '', s) for s in all_skills if len(s) > 1 and not s.lower().startswith(('note', 'here are'))]
        
        return cleaned_skills

    except Exception as e:
        print(f"\nAn error occurred during API call: {e}. Retrying after 5 seconds...")
        time.sleep(5)
        return []

# ==============================================================================
# SECTION 3: MAIN EXECUTION LOGIC (No changes needed here)
# ==============================================================================

def main():
    """Main function to run the skill extraction pipeline."""
    
    print("--- Starting Skill Extraction Script with Improved Prompt ---")

    if NIM_API_KEY == "YOUR_NVIDIA_API_KEY_HERE":
        raise ValueError("NVIDIA_API_KEY is not set. Please configure it in Section 1 or via environment variables.")
    
    client = OpenAI(base_url=NIM_BASE_URL, api_key=NIM_API_KEY)
    print(f"Connected to NIM endpoint with model: {MODEL_NAME}")

    try:
        df = pd.read_csv(INPUT_CSV_PATH, nrows=200)
    except FileNotFoundError:
        print(f"Error: The file '{INPUT_CSV_PATH}' was not found.")
        return

    if JOB_DESCRIPTION_COLUMN not in df.columns:
        print(f"Error: The column '{JOB_DESCRIPTION_COLUMN}' was not found in the CSV.")
        return
        
    print(f"Successfully loaded {len(df)} job descriptions.")
    tqdm.pandas(desc="Extracting Skills")
    
    df['extracted_skills'] = df[JOB_DESCRIPTION_COLUMN].progress_apply(
        lambda desc: extract_skills_with_nim(desc, client)
    )
    
    print("\nSkill extraction complete.")
    all_skills_list = df['extracted_skills'].explode().dropna().tolist()
    print(f"Aggregated a total of {len(all_skills_list)} skills (including duplicates).")

    with open(OUTPUT_JSON_PATH, 'w') as f:
        json.dump(all_skills_list, f, indent=4)
    print(f"Successfully saved skills to '{OUTPUT_JSON_PATH}'.")
    print("\n--- Script Finished Successfully ---")

if __name__ == "__main__":
    main()