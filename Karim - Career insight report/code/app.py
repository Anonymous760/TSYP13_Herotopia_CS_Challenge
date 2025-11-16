import os
import json
from flask import Flask, render_template, request, jsonify, send_file
from werkzeug.utils import secure_filename
import pandas as pd
import numpy as np
from openai import OpenAI
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
import hdbscan
from fpdf import FPDF
import plotly.express as px
import plotly.graph_objects as go
from sklearn.decomposition import PCA
import io
import base64

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'txt'}

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('static', exist_ok=True)
os.makedirs('templates', exist_ok=True)

# Configuration
NIM_API_KEY = "YOUR_NVIDIA_NIM_API_KEY_HERE"
NIM_BASE_URL = "https://integrate.api.nvidia.com/v1"
MODEL_NAME = "meta/llama-3.1-405b-instruct"
DEMANDED_SKILLS_CSV_PATH = 'skill_summary_ranked.csv'
TOP_N_DEMANDED_SKILLS = 10

# Initialize OpenAI client
client = OpenAI(base_url=NIM_BASE_URL, api_key=NIM_API_KEY)

# Initialize sentence transformer model (lazy loading)
sentence_model = None

def get_sentence_model():
    global sentence_model
    if sentence_model is None:
        sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
    return sentence_model

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def read_cv_text(file_path):
    """Reads text content from a file (supports .pdf and .txt)."""
    text = ""
    if file_path.lower().endswith('.pdf'):
        reader = PdfReader(file_path)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    elif file_path.lower().endswith('.txt'):
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
    return text

def extract_skills_from_text(text):
    """Uses the LLM to extract a list of technical skills from text."""
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
            messages=[{"role": "system", "content": system_prompt}, 
                     {"role": "user", "content": user_prompt}],
            temperature=0.0,
            max_tokens=500,
        )
        response = completion.choices[0].message.content.strip()
        if response.upper() == "NONE":
            return []
        return [skill.strip() for skill in response.split(',') if skill.strip()]
    except Exception as e:
        print(f"Error extracting skills: {e}")
        return []

def cluster_skills(skills_list):
    """Cluster skills and create visualization data."""
    if not skills_list or len(skills_list) < 3:
        return None
    
    model = get_sentence_model()
    unique_skills = list(set(skills_list))
    
    # Generate embeddings
    skill_embeddings = np.array([model.encode(skill) for skill in unique_skills])
    
    # Cluster with HDBSCAN
    clusterer = hdbscan.HDBSCAN(
        min_cluster_size=max(2, len(unique_skills) // 10),
        min_samples=1,
        metric='euclidean',
        cluster_selection_epsilon=0.05,
        cluster_selection_method='leaf'
    )
    clusterer.fit(skill_embeddings)
    
    # Create dataframe
    df = pd.DataFrame({
        'skill': unique_skills,
        'cluster': clusterer.labels_
    })
    
    # PCA for visualization
    pca = PCA(n_components=2, random_state=42)
    embedding_2d = pca.fit_transform(skill_embeddings)
    df['x'] = embedding_2d[:, 0]
    df['y'] = embedding_2d[:, 1]
    
    # Label clusters using LLM
    cluster_labels = {}
    for cluster_id in df[df['cluster'] != -1]['cluster'].unique():
        skills_in_cluster = df[df['cluster'] == cluster_id]['skill'].tolist()
        if len(skills_in_cluster) > 0:
            skills_str = ", ".join(skills_in_cluster[:10])  # Limit to 10 skills
            prompt = f"""
            You are an expert technical recruiter. Based on the following skills, provide ONE concise category name (2-3 words max).
            Skills: [{skills_str}]
            Respond with ONLY the category name.
            """
            try:
                completion = client.chat.completions.create(
                    model=MODEL_NAME,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.1,
                    max_tokens=20
                )
                cluster_labels[cluster_id] = completion.choices[0].message.content.strip()
            except:
                cluster_labels[cluster_id] = f"Cluster {cluster_id}"
    
    df['category'] = df['cluster'].map(lambda x: cluster_labels.get(x, 'Uncategorized'))
    
    return df

def generate_roadmap(user_cv_skills, missing_categories_details):
    """Generate personalized roadmap using LLM."""
    system_prompt = (
        "You are a world-class career coach and technical mentor. "
        "You create highly personalized, detailed, and actionable learning roadmaps in Markdown format."
    )
    
    user_prompt = f"""
Create a detailed, actionable learning roadmap for the following missing skills:

**Missing Skill Categories:**
{json.dumps(missing_categories_details, indent=2)}

**User's Current Skills:**
{', '.join(user_cv_skills) if user_cv_skills else 'None detected'}

**Your Task:**
Create a structured roadmap in **Markdown format** with:
1. A positive introduction
2. For each missing skill category:
   - Why it's crucial
   - Core concepts to learn
   - Practical first steps
   - Project ideas
   - Resource recommendations
3. A motivational conclusion

Use proper Markdown formatting:
- Use # for main title, ## for major sections, ### for subsections
- Use **bold** for emphasis and key terms
- Use bullet points with - or * for lists
- Use numbered lists (1., 2., 3.) for sequential steps
- Use > for blockquotes/important tips
- Use `backticks` for technical terms, tools, and code
- Use --- for horizontal dividers between sections

Respond with clean, well-structured Markdown code.
"""
    
    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "system", "content": system_prompt}, 
                     {"role": "user", "content": user_prompt}],
            temperature=0.6,
            max_tokens=2048
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error generating roadmap: {str(e)}"

def create_pdf(content, filename="roadmap.pdf"):
    """Create a PDF from text content."""
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.set_left_margin(15)
        pdf.set_right_margin(15)
        
        # Add title
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(0, 10, "Your Personalized Career Roadmap", ln=True, align='C')
        pdf.ln(5)
        
        # Add content with better text handling
        pdf.set_font("Arial", size=10)
        
        # Clean content - remove emojis and special characters that cause issues
        clean_content = content.encode('latin-1', 'ignore').decode('latin-1')
        
        for line in clean_content.split("\n"):
            if line.strip():
                # Handle long lines by breaking them
                try:
                    pdf.multi_cell(0, 6, line.strip())
                except:
                    # If multi_cell fails, try with simpler text
                    simple_line = ''.join(c for c in line if ord(c) < 128)
                    if simple_line.strip():
                        pdf.multi_cell(0, 6, simple_line.strip())
            else:
                pdf.ln(3)
        
        pdf_path = os.path.join('static', filename)
        pdf.output(pdf_path)
        return pdf_path
    except Exception as e:
        print(f"PDF generation error: {e}")
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/market-insights')
def market_insights():
    """Return top 10 demanded skills from the CSV"""
    try:
        demanded_df = pd.read_csv(DEMANDED_SKILLS_CSV_PATH)
        top_10_skills = []
        
        for idx, row in demanded_df.head(TOP_N_DEMANDED_SKILLS).iterrows():
            top_10_skills.append({
                'category': row['final_label'],
                'count': int(row['count']),
                'skills': row['original_skills']
            })
        
        return jsonify({
            'top_10_skills': top_10_skills
        })
    except Exception as e:
        print(f"Error loading market insights: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_cv():
    if 'cv_file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['cv_file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Extract text from CV
            cv_text = read_cv_text(filepath)
            
            # Extract skills
            user_cv_skills = extract_skills_from_text(cv_text)
            
            if not user_cv_skills:
                return jsonify({'error': 'No technical skills found in CV'}), 400
            
            # Store in session or return
            return jsonify({
                'success': True,
                'skills': user_cv_skills,
                'filename': filename
            })
        except Exception as e:
            return jsonify({'error': f'Error processing CV: {str(e)}'}), 500
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/analyze', methods=['POST'])
def analyze_skills():
    data = request.json
    user_skills = data.get('skills', [])
    
    if not user_skills:
        return jsonify({'error': 'No skills provided'}), 400
    
    try:
        # Load demanded skills
        demanded_df = pd.read_csv(DEMANDED_SKILLS_CSV_PATH)
        top_demanded_categories = set(demanded_df.head(TOP_N_DEMANDED_SKILLS)['final_label'])
        demanded_skills_details = demanded_df.head(TOP_N_DEMANDED_SKILLS).set_index('final_label')['original_skills'].to_dict()
        
        # Categorize user skills
        categorization_prompt = f"""
        You are an expert skills analyst. Categorize these skills into these categories: {list(top_demanded_categories)}
        User's skills: {user_skills}
        Return a comma-separated list of matching categories. If none match, return NONE.
        """
        
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
        
        missing_categories = top_demanded_categories - user_has_categories
        
        # Get top 10 demanded skills with details
        top_10_skills = []
        for _, row in demanded_df.head(10).iterrows():
            top_10_skills.append({
                'category': row['final_label'],
                'count': int(row['count']),
                'skills': row['original_skills']
            })
        
        # Use existing skill clusters visualization image
        visualization_image = 'skill_clusters_visualization.png'
        
        result = {
            'user_categories': list(user_has_categories),
            'missing_categories': list(missing_categories),
            'demanded_categories': list(top_demanded_categories),
            'visualization_image': visualization_image,
            'top_10_skills': top_10_skills
        }
        
        # Generate roadmap if there are missing categories
        if missing_categories:
            missing_details = {cat: demanded_skills_details[cat] for cat in missing_categories}
            roadmap = generate_roadmap(user_skills, missing_details)
            result['roadmap'] = roadmap
        else:
            roadmap = "Congratulations! Your skills are highly aligned with market demands!\n\nYour current skills cover all the top demanded categories in the market. Keep enhancing your expertise and stay updated with the latest trends in your field."
            result['roadmap'] = roadmap
        
        # Always generate PDF
        import time
        timestamp = int(time.time())
        pdf_filename = f"roadmap_{timestamp}.pdf"
        pdf_path = create_pdf(roadmap, pdf_filename)
        
        if pdf_path and os.path.exists(pdf_path):
            result['pdf_url'] = f'/static/{os.path.basename(pdf_path)}'
            print(f"PDF created successfully: {pdf_path}")
        else:
            print("PDF creation failed")
            result['pdf_url'] = None
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Analysis error: {str(e)}'}), 500

@app.route('/download/<filename>')
def download_pdf(filename):
    filepath = os.path.join('static', secure_filename(filename))
    return send_file(filepath, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
