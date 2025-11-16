// Global variables
let uploadedSkills = [];
let currentFilename = '';
let pdfUrl = '';

// Load market insights on page load
async function loadMarketInsights() {
    try {
        const response = await fetch('/api/market-insights');
        if (!response.ok) throw new Error('Failed to load market insights');
        
        const data = await response.json();
        
        // Display top 10 skills in compact format
        const top10List = document.getElementById('top10SkillsList');
        if (data.top_10_skills && top10List) {
            top10List.innerHTML = data.top_10_skills.map((skill, index) => `
                <div class="skill-item" title="${skill.skills}">
                    <div class="skill-rank">${index + 1}</div>
                    <div class="skill-details">
                        <div class="skill-category">${skill.category}</div>
                        <div class="skill-count">${skill.count} mentions</div>
                    </div>
                </div>
            `).join('');
        }
        
        console.log('Market insights loaded successfully');
    } catch (error) {
        console.error('Error loading market insights:', error);
    }
}

// Image modal functionality
function initializeImageModal() {
    const vizContainer = document.getElementById('vizContainer');
    const imageModal = document.getElementById('imageModal');
    
    if (vizContainer && imageModal) {
        vizContainer.addEventListener('click', function() {
            imageModal.classList.add('active');
        });
        
        imageModal.addEventListener('click', function() {
            imageModal.classList.remove('active');
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeUpload();
    initializeAnalyze();
    loadMarketInsights();
    initializeImageModal();
});

// Upload functionality
function initializeUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('cvFile');
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    
    // File input change handler
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

// Handle file upload
async function handleFileUpload(file) {
    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
        showError('Please upload a PDF or TXT file');
        return;
    }
    
    // Validate file size (16MB max)
    if (file.size > 16 * 1024 * 1024) {
        showError('File size must be less than 16MB');
        return;
    }
    
    // Show file info
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileInfo').style.display = 'flex';
    currentFilename = file.name;
    
    // Show progress
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    progressContainer.style.display = 'block';
    progressFill.style.width = '30%';
    
    // Create form data
    const formData = new FormData();
    formData.append('cv_file', file);
    
    try {
        // Upload file
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.error) {
            showError(data.error);
            progressContainer.style.display = 'none';
            return;
        }
        
        // Update progress
        progressFill.style.width = '100%';
        
        // Store skills
        uploadedSkills = data.skills;
        
        // Show skills section
        setTimeout(() => {
            progressContainer.style.display = 'none';
            displaySkills(data.skills);
        }, 500);
        
    } catch (error) {
        showError('Error uploading file: ' + error.message);
        progressContainer.style.display = 'none';
    }
}

// Display extracted skills
function displaySkills(skills) {
    const skillsSection = document.getElementById('skillsSection');
    const skillsContainer = document.getElementById('skillsContainer');
    
    // Clear previous skills
    skillsContainer.innerHTML = '';
    
    // Create skill tags with various gradient colors
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    ];
    
    skills.forEach((skill, index) => {
        const tag = document.createElement('div');
        tag.className = 'skill-tag';
        tag.style.background = gradients[index % gradients.length];
        tag.innerHTML = `<i class="fas fa-check-circle"></i>${skill}`;
        tag.style.animationDelay = `${index * 0.05}s`;
        skillsContainer.appendChild(tag);
    });
    
    // Show section with animation
    skillsSection.style.display = 'block';
    setTimeout(() => {
        skillsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Initialize analyze button
function initializeAnalyze() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.addEventListener('click', analyzeSkills);
}

// Analyze skills
async function analyzeSkills() {
    if (uploadedSkills.length === 0) {
        showError('No skills to analyze');
        return;
    }
    
    // Show loading overlay
    document.getElementById('loadingOverlay').style.display = 'flex';
    
    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                skills: uploadedSkills,
                filename: currentFilename
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            showError(data.error);
            document.getElementById('loadingOverlay').style.display = 'none';
            return;
        }
        
        // Hide loading
        document.getElementById('loadingOverlay').style.display = 'none';
        
        // Display results
        displayVisualization(data);
        displayRoadmap(data.roadmap, data.pdf_url);
        
    } catch (error) {
        document.getElementById('loadingOverlay').style.display = 'none';
        showError('Error analyzing skills: ' + error.message);
    }
}

// Display visualization (career gap analysis)
function displayVisualization(data) {
    const insightsSection = document.getElementById('insightsSection');
    const statsGrid = document.getElementById('statsGrid');
    
    console.log('Career gap analysis data:', data);
    
    // Create gap analysis cards with missing skills details
    let gapHTML = '';
    
    // Missing skills card
    if (data.missing_categories && data.missing_categories.length > 0) {
        gapHTML += `
            <div class="stat-card" style="grid-column: 1 / -1;">
                <h3 style="color: var(--warning-color); font-size: 1.2rem; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-exclamation-triangle"></i> Skills Gap Identified
                </h3>
                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 15px;">
                    You are missing <strong style="color: var(--warning-color);">${data.missing_categories.length}</strong> key skill categories that are highly demanded in the market.
                </div>
                <div style="display: grid; gap: 10px; margin-top: 15px;">
        `;
        
        data.missing_categories.forEach((category, idx) => {
            gapHTML += `
                <div style="background: rgba(217, 119, 6, 0.1); border-left: 3px solid var(--warning-color); padding: 12px 15px; border-radius: 6px;">
                    <div style="color: var(--text-primary); font-weight: 600; margin-bottom: 5px;">${idx + 1}. ${category}</div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem;">High market demand - Priority for learning</div>
                </div>
            `;
        });
        
        gapHTML += `
                </div>
            </div>
        `;
    }
    
    // Your skills card
    if (data.user_cv_categories && data.user_cv_categories.length > 0) {
        gapHTML += `
            <div class="stat-card">
                <h3 style="color: var(--success-color); font-size: 1.1rem; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-check-circle"></i> Your Skills
                </h3>
                <div class="stat-number" style="color: var(--success-color);">${data.user_cv_categories.length}</div>
                <div class="stat-label">Skill Categories Found</div>
                <div style="margin-top: 10px; font-size: 0.85rem; color: var(--text-secondary);">
                    ${data.user_cv_categories.slice(0, 3).join(', ')}${data.user_cv_categories.length > 3 ? '...' : ''}
                </div>
            </div>
        `;
    }
    
    // Market demand card
    gapHTML += `
        <div class="stat-card">
            <h3 style="color: var(--primary-color); font-size: 1.1rem; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-chart-line"></i> Market Demand
            </h3>
            <div class="stat-number" style="color: var(--primary-color);">${data.demanded_categories.length}</div>
            <div class="stat-label">Total In-Demand Skills</div>
            <div style="margin-top: 10px; font-size: 0.85rem; color: var(--text-secondary);">
                Based on job market analysis
            </div>
        </div>
    `;
    
    statsGrid.innerHTML = gapHTML;
    
    // Show insights section
    insightsSection.style.display = 'block';
    setTimeout(() => {
        insightsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Display roadmap
function displayRoadmap(roadmap, pdf_url) {
    const roadmapSection = document.getElementById('roadmapSection');
    const roadmapContent = document.getElementById('roadmapContent');
    const downloadBtn = document.getElementById('downloadBtn');
    
    console.log('Roadmap data received:', { roadmap: roadmap ? 'exists' : 'null', pdf_url });
    
    // Render Markdown to HTML using marked.js
    if (typeof marked !== 'undefined') {
        const htmlContent = marked.parse(roadmap);
        roadmapContent.innerHTML = htmlContent;
    } else {
        // Fallback to basic formatting if marked.js isn't loaded
        const formattedRoadmap = formatRoadmap(roadmap);
        roadmapContent.innerHTML = formattedRoadmap;
    }
    
    // Setup download button
    if (pdf_url) {
        console.log('PDF URL available:', pdf_url);
        pdfUrl = pdf_url;
        downloadBtn.disabled = false;
        downloadBtn.style.opacity = '1';
        downloadBtn.onclick = (e) => {
            e.preventDefault();
            console.log('Opening PDF:', pdf_url);
            window.open(pdf_url, '_blank');
        };
    } else {
        console.warn('No PDF URL available');
        downloadBtn.disabled = true;
        downloadBtn.style.opacity = '0.5';
        downloadBtn.onclick = (e) => {
            e.preventDefault();
            alert('PDF is being generated. Please wait a moment and try again.');
        };
    }
    
    // Show section
    roadmapSection.style.display = 'block';
    setTimeout(() => {
        roadmapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Format roadmap text to HTML (LaTeX/Markdown style)
function formatRoadmap(text) {
    // First, handle special success messages
    if (text.includes('🎉') && text.includes('Congratulations')) {
        return `<div class="success-message">${text}</div>`;
    }
    
    let lines = text.split('\n');
    let formatted = '';
    let inList = false;
    let listType = null;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        if (!line) {
            if (inList) {
                formatted += listType === 'ul' ? '</ul>' : '</ol>';
                inList = false;
                listType = null;
            }
            formatted += '<p></p>';
            continue;
        }
        
        // Headers (support multiple # levels like markdown)
        if (line.startsWith('####')) {
            if (inList) { formatted += listType === 'ul' ? '</ul>' : '</ol>'; inList = false; }
            formatted += `<h4>${line.replace(/^####\s*/, '')}</h4>`;
        } else if (line.startsWith('###')) {
            if (inList) { formatted += listType === 'ul' ? '</ul>' : '</ol>'; inList = false; }
            formatted += `<h3>${line.replace(/^###\s*/, '')}</h3>`;
        } else if (line.startsWith('##')) {
            if (inList) { formatted += listType === 'ul' ? '</ul>' : '</ol>'; inList = false; }
            formatted += `<h2>${line.replace(/^##\s*/, '')}</h2>`;
        } else if (line.startsWith('#')) {
            if (inList) { formatted += listType === 'ul' ? '</ul>' : '</ol>'; inList = false; }
            formatted += `<h1>${line.replace(/^#\s*/, '')}</h1>`;
        }
        // Unordered lists
        else if (line.match(/^[-*]\s/)) {
            if (!inList || listType !== 'ul') {
                if (inList) formatted += '</ol>';
                formatted += '<ul>';
                inList = true;
                listType = 'ul';
            }
            formatted += `<li>${line.replace(/^[-*]\s/, '')}</li>`;
        }
        // Ordered lists
        else if (line.match(/^\d+\.\s/)) {
            if (!inList || listType !== 'ol') {
                if (inList) formatted += '</ul>';
                formatted += '<ol>';
                inList = true;
                listType = 'ol';
            }
            formatted += `<li>${line.replace(/^\d+\.\s/, '')}</li>`;
        }
        // Horizontal rule
        else if (line.match(/^(-{3,}|\*{3,})$/)) {
            if (inList) { formatted += listType === 'ul' ? '</ul>' : '</ol>'; inList = false; }
            formatted += '<hr>';
        }
        // Regular paragraphs
        else {
            if (inList) {
                formatted += listType === 'ul' ? '</ul>' : '</ol>';
                inList = false;
                listType = null;
            }
            formatted += `<p>${line}</p>`;
        }
    }
    
    // Close any open lists
    if (inList) {
        formatted += listType === 'ul' ? '</ul>' : '</ol>';
    }
    
    // Apply inline formatting (bold, italic, code)
    formatted = formatted
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/🎉|🎯|✨|💡|🚀|⭐|📚|🔧|💪|🌟|👨‍💻|📊|🏆|💻|🎓|⚡|🔥/g, 
            (emoji) => `<span style="font-size: 1.4em; margin: 0 4px;">${emoji}</span>`);
    
    return formatted;
}

// Show error message
function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle" style="font-size: 1.5rem;"></i>
        <div>
            <strong>Error</strong><br>
            <span style="font-size: 0.9rem;">${message}</span>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
