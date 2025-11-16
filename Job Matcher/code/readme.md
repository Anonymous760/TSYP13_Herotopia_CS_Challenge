# LinkedIn Job Scraper & CV Matcher

## Setup Instructions

### Step 1: Download the Embedding Model

First run `download_model.py` to download the embedding model:

```bash
python download_model.py
```

This will download the necessary model files for creating embeddings from job descriptions and your CV.

### Step 2: Configure Your Search Parameters

Modify `full.py` to choose a location and search keyword:

```python
LOCATION = "Egypt"
SEARCH_KEYWORDS = "Software"
```

You can change these values to any location and keyword combination you're interested in:
- Examples: "United States" / "Data Science", "Germany" / "Backend Developer", etc.

### Step 3: Scrape and Process Jobs

Run `full.py`:

```bash
python full.py
```

This script will:
1. **Scrape LinkedIn**: Collect up to 990 jobs from LinkedIn that match your specified location and keywords
2. **LLM Feature Extraction**: For each job posting, an LLM will analyze and extract key features such as:
   - Job requirements
   - Required skills and qualifications
   - Job responsibilities
   - Company information
3. **Generate Summary**: The LLM will create a comprehensive summary of each job
4. **Create Embeddings**: The LLM response will be converted into vector embeddings for similarity matching
5. **Update Database**: All processed data will be saved to `main.csv`

**Note**: This module is designed to be run weekly to keep job listings fresh and up-to-date. It will be later integrated into an SQL database for better performance and scalability.

### Step 4: Find Matching Jobs

Run `app.py`:

```bash
python app.py
```

Then:
1. Open your web browser and navigate to the local URL displayed in the terminal
2. Upload your CV (supported formats: PDF, DOCX, TXT)
3. Click the search button
4. Your CV will be embedded and compared with the job database using similarity search
5. You will receive a list of the top matching jobs with their LinkedIn links

The similarity search uses vector embeddings to find jobs that best match your skills, experience, and qualifications based on your CV content.

## Technical Overview

**Data Flow:**
```
LinkedIn Jobs → LLM Analysis → Feature Extraction → Embeddings → main.csv
Your CV → Embedding → Similarity Search → Top Matches → LinkedIn Links
```

**Future Enhancements:**
- SQL database integration for improved query performance
- Automated weekly job updates via scheduled tasks
- Advanced filtering and sorting options
