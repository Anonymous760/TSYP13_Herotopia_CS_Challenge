# Code Editor Feature - Documentation

## Overview
The AI Interviewer now includes an integrated code editor that allows the AI to ask coding questions, provide a professional code interface for candidates, and review submitted solutions.

## How It Works

### 1. AI Asks a Coding Question
When the AI wants to test coding skills, it formats the question with special markers:

```
[CODE_QUESTION]
Write a function to reverse a string without using built-in reverse methods.
[LANGUAGE] python [/LANGUAGE]
[STARTER_CODE]
def reverse_string(s):
    # Your code here
    pass
[/STARTER_CODE]
```

### 2. Code Editor Opens Automatically
- When the AI sends a code question, a full-screen code editor opens
- Features:
  - ✅ Syntax highlighting friendly dark theme
  - ✅ Line numbers
  - ✅ Tab key support (4 spaces)
  - ✅ Character and line count
  - ✅ Starter code provided by AI
  - ✅ Reset functionality
  - ✅ Professional Monaco-like interface

### 3. Candidate Writes Code
- Full-featured text editor with monospace font
- Tab indentation support
- Clean, distraction-free interface
- Real-time character/line counting

### 4. Code Submission
- Candidate clicks "Submit Solution"
- Code is sent to backend with `is_code: true` flag
- Message shows "[Code Submitted]" with preview

### 5. AI Reviews Code
- AI receives the full code
- Provides comprehensive review:
  - Code quality assessment
  - Bug identification
  - Performance analysis
  - Best practices recommendations
  - Scoring on all criteria

## API Changes

### Updated `/api/answer` Endpoint
```json
{
  "session_id": "xxx",
  "answer": "code or text",
  "is_code": true  // NEW: indicates code submission
}
```

## Frontend Components

### New Component: `CodeEditor.js`
Full-featured code editor modal with:
- Header with language indicator
- Line numbers panel
- Code textarea with tab support
- Optional output display area
- Footer with stats and actions

### Updated: `InterviewChat.js`
- Detects code questions in AI responses
- Automatically opens code editor
- Shows "Open Code Editor" button
- Displays code preview for submissions

### Updated: `App.js`
- Handles code submissions separately
- Passes `is_code` flag to backend

## Scoring for Code Questions

Code submissions are scored on:
1. **Technical Knowledge (1-10)**
   - Correctness of solution
   - Understanding of algorithms
   - Language syntax mastery

2. **Communication (1-10)**
   - Code readability
   - Comments and documentation
   - Variable naming

3. **Problem Solving (1-10)**
   - Algorithm efficiency
   - Edge case handling
   - Creative solutions

4. **Relevance (1-10)**
   - Meets requirements
   - Follows constraints
   - Appropriate approach

## Usage Example

### For Software Engineering Roles:
The AI might ask:
1. 2 theoretical questions
2. 2 coding questions (algorithms, data structures)
3. 1 system design question
4. 1 behavioral question

### For Data Science Roles:
1. Statistics/ML theory questions
2. Pandas/NumPy coding challenges
3. Data analysis problem
4. Model evaluation question

## Benefits

✅ **Realistic Assessment**: Tests actual coding ability, not just theoretical knowledge

✅ **Professional Experience**: Candidates use a real code editor interface

✅ **Comprehensive Review**: AI provides detailed code review feedback

✅ **Flexible**: Works for any programming language (Python, JavaScript, Java, C++, etc.)

✅ **Integrated Scoring**: Code quality factors into overall interview performance

✅ **Time-Stamped**: All code submissions tracked with timestamps

## Technical Implementation

### Parsing Code Questions
```javascript
const parseCodeQuestion = (text) => {
  const match = text.match(/\[CODE_QUESTION\]([\s\S]*?)\[LANGUAGE\]\s*(\w+)\s*\[\/LANGUAGE\]([\s\S]*?)\[STARTER_CODE\]([\s\S]*?)\[\/STARTER_CODE\]/);
  return {
    question: match[1],
    language: match[2],
    starterCode: match[4]
  };
};
```

### Backend Code Handling
```python
def respond_to_candidate(self, answer: str, is_code: bool = False):
    if is_code:
        prompt = f"Review this code:\n\n{answer}\n\nProvide detailed feedback..."
    else:
        prompt = f"Candidate answer: {answer}..."
```

## Future Enhancements

Potential additions:
- [ ] Code execution with output
- [ ] Multiple test cases
- [ ] Syntax highlighting
- [ ] Auto-completion
- [ ] Multiple file support
- [ ] Git integration
- [ ] Code diff visualization
- [ ] Real-time collaboration

## Example AI Code Question

```
I'd like to test your Python skills with a coding challenge.

[CODE_QUESTION]
Write a function that finds the two numbers in an array that add up to a target sum.

Requirements:
- Time complexity should be O(n)
- Return the indices of the two numbers
- Assume exactly one solution exists

Example:
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1] (because nums[0] + nums[1] = 2 + 7 = 9)

[LANGUAGE] python [/LANGUAGE]
[STARTER_CODE]
def two_sum(nums, target):
    """
    Find two numbers that add up to target.
    
    Args:
        nums: List of integers
        target: Target sum
        
    Returns:
        List containing indices of the two numbers
    """
    # Your code here
    pass

# Test your function
print(two_sum([2, 7, 11, 15], 9))  # Should print [0, 1]
[/STARTER_CODE]
```

When the candidate sees this, the code editor opens automatically with the starter code!
