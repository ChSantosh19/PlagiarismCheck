
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const textArea = document.getElementById('analysis-text');
  const analyzeBtn = document.getElementById('analyze-btn');
  const resetBtn = document.getElementById('reset-btn');
  const errorMsg = document.getElementById('analysis-error');
  const resultsSection = document.getElementById('analysis-results');
  const resultLikelihood = document.getElementById('result-likelihood');
  const resultIndicator = document.getElementById('result-indicator');
  const meterFill = document.getElementById('meter-fill');
  const factorsList = document.getElementById('factors-list');
  const currentYear = document.getElementById('current-year');
  
  // Set current year
  currentYear.textContent = new Date().getFullYear();
  
  // AI detection features to analyze
  const AI_FEATURES = [
    { name: "Repetitive patterns", weight: 0.15 },
    { name: "Unusual vocabulary diversity", weight: 0.15 },
    { name: "Overly formal structure", weight: 0.1 },
    { name: "Lack of personal anecdotes", weight: 0.1 },
    { name: "Consistent writing style", weight: 0.1 },
    { name: "Statistical sentence length variance", weight: 0.1 },
    { name: "Low presence of filler words", weight: 0.1 },
    { name: "Predictable transitions", weight: 0.1 },
    { name: "Reference citation patterns", weight: 0.05 },
    { name: "Technical term consistency", weight: 0.05 }
  ];
  
  // Update button state based on text input
  textArea.addEventListener('input', () => {
    if (textArea.value.trim().length > 0) {
      analyzeBtn.disabled = false;
      resetBtn.classList.remove('hidden');
    } else {
      analyzeBtn.disabled = true;
      resetBtn.classList.add('hidden');
    }
  });
  
  // Analyze text button click handler
  analyzeBtn.addEventListener('click', () => {
    const text = textArea.value.trim();
    
    if (!text) {
      showError("Please enter some text to analyze");
      return;
    }
    
    // Minimum text length requirement
    if (text.length < 50) {
      showError("Please enter at least 50 characters for more accurate results");
      return;
    }
    
    // Clear previous errors
    hideError();
    
    // Show loading state
    setLoading(true);
    
    // Simulate processing delay for better UX
    setTimeout(() => {
      const result = analyzeText(text);
      displayResults(result);
      setLoading(false);
    }, 1500);
  });
  
  // Reset button click handler
  resetBtn.addEventListener('click', () => {
    textArea.value = '';
    analyzeBtn.disabled = true;
    resetBtn.classList.add('hidden');
    resultsSection.classList.add('hidden');
    hideError();
  });
  
  // Show error message
  function showError(message) {
    errorMsg.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      ${message}
    `;
    errorMsg.classList.remove('hidden');
  }
  
  // Hide error message
  function hideError() {
    errorMsg.classList.add('hidden');
    errorMsg.textContent = '';
  }
  
  // Set loading state
  function setLoading(isLoading) {
    if (isLoading) {
      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = `
        <span class="spinner"></span>
        <span>Analyzing...</span>
      `;
    } else {
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = 'Analyze Text';
    }
  }
  
  // Calculate vocabulary diversity (unique words / total words)
  function calculateVocabDiversity(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words);
    return uniqueWords.size / Math.max(words.length, 1);
  }
  
  // Calculate sentence length variance
  function calculateSentenceLengthVariance(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 1) return 0;
    
    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const mean = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
    
    // Normalize variance to a 0-1 scale (higher variance = more human-like)
    return Math.min(1, variance / 25);
  }
  
  // Count common filler words
  function countFillerWords(text) {
    const fillerWords = [
      "um", "uh", "like", "actually", "basically", "literally", 
      "you know", "sort of", "kind of", "i mean", "anyway", "so"
    ];
    
    const lowerText = text.toLowerCase();
    let count = 0;
    
    fillerWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerText.match(regex);
      if (matches) count += matches.length;
    });
    
    const words = text.split(/\s+/).length;
    return count / Math.max(words, 1);
  }
  
  // Detect repetitive patterns
  function detectRepetitivePatterns(text) {
    // Check for repeated phrases (3+ words)
    const phrases = {};
    const words = text.toLowerCase().split(/\s+/);
    
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = words.slice(i, i + 3).join(' ');
      phrases[phrase] = (phrases[phrase] || 0) + 1;
    }
    
    const repeatedPhrases = Object.values(phrases).filter(count => count > 1).length;
    const maxPossiblePhrases = Math.max(1, words.length - 2);
    
    return repeatedPhrases / maxPossiblePhrases;
  }
  
  // Analyze text for AI likelihood
  function analyzeText(text) {
    try {
      // Get the sentences first to fix the reference error
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      // Calculate various linguistic features
      const vocabDiversity = calculateVocabDiversity(text);
      const sentenceVariance = calculateSentenceLengthVariance(text);
      const fillerWordRatio = countFillerWords(text);
      const repetitionScore = detectRepetitivePatterns(text);
      
      // More formal texts tend to have higher average word length
      const words = text.match(/\b\w+\b/g) || [];
      const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / Math.max(words.length, 1);
      const formalityScore = Math.min(1, avgWordLength / 10);
      
      // First person pronouns indicate personal anecdotes
      const firstPersonCount = (text.toLowerCase().match(/\b(i|me|my|mine|myself)\b/g) || []).length;
      const personalAnecdoteScore = firstPersonCount / Math.max(words.length, 1) * 20;
      
      // Technical term consistency
      const technicalTerms = /\b(algorithm|data|system|function|process|analysis|framework|methodology|implementation|interface)\b/gi;
      const techTermMatches = text.match(technicalTerms) || [];
      const techTermConsistency = techTermMatches.length / Math.max(words.length, 1) * 10;
      
      // Predictable transitions
      const transitions = /\b(however|therefore|furthermore|consequently|thus|moreover|additionally|in conclusion|as a result)\b/gi;
      const transitionMatches = text.match(transitions) || [];
      const transitionScore = transitionMatches.length / Math.max(sentences.length, 1);
      
      // Analyze features with confidence scores
      const featureAnalysis = [
        { 
          name: "Repetitive patterns", 
          present: repetitionScore > 0.1,
          confidence: repetitionScore * 100 
        },
        { 
          name: "Unusual vocabulary diversity", 
          present: vocabDiversity > 0.7 || vocabDiversity < 0.4,
          confidence: Math.abs(vocabDiversity - 0.55) * 200 
        },
        { 
          name: "Overly formal structure", 
          present: formalityScore > 0.65,
          confidence: formalityScore * 100 
        },
        { 
          name: "Lack of personal anecdotes", 
          present: personalAnecdoteScore < 0.2,
          confidence: (1 - personalAnecdoteScore) * 100 
        },
        { 
          name: "Statistical sentence length variance", 
          present: sentenceVariance < 0.4,
          confidence: (1 - sentenceVariance) * 100 
        },
        { 
          name: "Low presence of filler words", 
          present: fillerWordRatio < 0.01,
          confidence: (1 - fillerWordRatio * 100) 
        },
        {
          name: "Predictable transitions",
          present: transitionScore > 0.2,
          confidence: transitionScore * 100
        },
        {
          name: "Technical term consistency",
          present: techTermConsistency > 0.3,
          confidence: techTermConsistency * 100
        }
      ];
      
      // Calculate weighted AI score (0-100)
      let aiScore = 0;
      featureAnalysis.forEach(feature => {
        const weight = AI_FEATURES.find(f => f.name === feature.name)?.weight || 0.1;
        if (feature.present) {
          aiScore += (feature.confidence / 100) * weight * 100;
        }
      });
      
      // Determine likelihood category
      let likelihood;
      if (aiScore >= 75) likelihood = "Very likely AI-generated";
      else if (aiScore >= 60) likelihood = "Likely AI-generated";
      else if (aiScore >= 40) likelihood = "Possibly AI-generated";
      else if (aiScore >= 25) likelihood = "Likely human-written";
      else likelihood = "Very likely human-written";
      
      return {
        score: Math.min(100, Math.max(0, aiScore)),
        likelihood,
        features: featureAnalysis
      };
    } catch (err) {
      console.error("Analysis error:", err);
      showError("An error occurred during analysis. Please try again.");
      return null;
    }
  }
  
  // Display analysis results
  function displayResults(result) {
    if (!result) return;
    
    // Set the result likelihood text
    resultLikelihood.textContent = result.likelihood;
    
    // Set the indicator icon
    resultIndicator.innerHTML = result.score > 50 
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ai-indicator">
           <path d="M12 2a9 9 0 0 1 9 9c0 3.1-1.5 5.9-4 7.5M12 2a9 9 0 0 0-9 9c0 3.1 1.5 5.9 4 7.5M12 2v2M12 21v1M21 12h-1M4 12H3M18.5 5.5l-1 1M6.5 5.5l1 1M17.5 18.5l1 1M5.5 17.5l1 1"></path>
           <circle cx="12" cy="12" r="4"></circle>
         </svg>
         <span class="ai-indicator">AI Indicators</span>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="human-indicator">
           <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
           <circle cx="9" cy="7" r="4"></circle>
           <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
           <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
         </svg>
         <span class="human-indicator">Human Indicators</span>`;
    
    // Set the meter fill
    meterFill.style.width = `${result.score}%`;
    
    // Change meter color based on score
    if (result.score >= 75) {
      meterFill.style.background = 'linear-gradient(to right, #ef4444, #b91c1c)';
    } else if (result.score >= 50) {
      meterFill.style.background = 'linear-gradient(to right, #f59e0b, #d97706)';
    } else {
      meterFill.style.background = 'linear-gradient(to right, #10b981, #059669)';
    }
    
    // Populate factors list
    factorsList.innerHTML = '';
    
    result.features.forEach(feature => {
      const factorItem = document.createElement('div');
      factorItem.className = 'factor-item';
      
      factorItem.innerHTML = `
        <span class="factor-name${feature.present ? ' active' : ''}">${feature.name}</span>
        <span class="factor-meter">
          <div class="factor-bar">
            <div class="factor-bar-fill" style="width: ${feature.present ? feature.confidence : 100 - feature.confidence}%"></div>
          </div>
          <span class="factor-value${feature.present ? ' active' : ' inactive'}">
            ${feature.present ? Math.round(feature.confidence) + '%' : 'No'}
          </span>
        </span>
      `;
      
      factorsList.appendChild(factorItem);
    });
    
    // Show results section
    resultsSection.classList.remove('hidden');
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }
});
