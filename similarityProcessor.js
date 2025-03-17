// Normalization and Similarity Processing

// Normalize code by removing whitespace, comments, etc.
function normalizeCode(code, language) {
  // Remove comments based on language
  let normalizedCode = code;
  
  switch (language.toLowerCase()) {
    case 'javascript':
    case 'js':
    case 'typescript':
    case 'ts':
    case 'java':
    case 'c':
    case 'cpp':
    case 'c++':
    case 'csharp':
    case 'c#':
      // Remove both // and /* */ style comments
      normalizedCode = normalizedCode
        .replace(/\/\/.*?$/gm, '') // Remove single line comments
        .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
      break;
    case 'python':
    case 'py':
      // Remove # comments and """ docstrings
      normalizedCode = normalizedCode
        .replace(/#.*?$/gm, '') // Remove # comments
        .replace(/["']{3}[\s\S]*?["']{3}/g, ''); // Remove docstrings
      break;
    case 'html':
      // Remove HTML comments
      normalizedCode = normalizedCode.replace(/<!--[\s\S]*?-->/g, '');
      break;
  }
  
  // Remove extra whitespace, blank lines, and normalize spacing
  normalizedCode = normalizedCode
    .replace(/\s+/g, ' ')
    .trim();
  
  return normalizedCode;
}

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  
  // Create a matrix of size (m+1) x (n+1)
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  // Fill the first row and column
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  // Fill the rest of the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        );
      }
    }
  }
  
  return dp[m][n];
}

// Calculate Jaccard similarity between two strings (treating them as sets of words)
function jaccardSimilarity(str1, str2) {
  const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(Boolean));
  const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(Boolean));
  
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// Detect if content is likely code
function isCodeContent(content, fileType) {
  // Check file extension first
  const codeExtensions = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'go', 'rb'];
  const extension = fileType.split('/').pop()?.toLowerCase() || '';
  
  if (codeExtensions.includes(extension)) {
    return true;
  }
  
  // Check content characteristics for common code patterns
  const codePatterns = [
    /function\s+\w+\s*\(.*\)\s*{/,  // function declarations
    /class\s+\w+/,                  // class declarations
    /import\s+.*from/,              // import statements
    /const\s+\w+\s*=/,              // const declarations
    /if\s*\(.*\)\s*{/,              // if statements
    /for\s*\(.*\)\s*{/,             // for loops
    /while\s*\(.*\)\s*{/,           // while loops
    /def\s+\w+\s*\(.*\):/,          // Python function
    /public\s+class/,               // Java class
  ];
  
  return codePatterns.some(pattern => pattern.test(content));
}

// Find matching sections between two texts
function findMatches(text1, text2, minMatchLength = 20) {
  const matches = [];
  
  // Simplified algorithm to find common substrings
  for (let i = 0; i < text1.length - minMatchLength; i++) {
    const potentialMatch = text1.substring(i, i + minMatchLength);
    let matchIndex = text2.indexOf(potentialMatch);
    
    while (matchIndex !== -1) {
      // Extend the match as far as possible
      let endPos1 = i + minMatchLength;
      let endPos2 = matchIndex + minMatchLength;
      
      while (
        endPos1 < text1.length && 
        endPos2 < text2.length && 
        text1[endPos1] === text2[endPos2]
      ) {
        endPos1++;
        endPos2++;
      }
      
      // Create a match entry
      matches.push({
        file1Start: i,
        file1End: endPos1,
        file2Start: matchIndex,
        file2End: endPos2
      });
      
      // Skip ahead in text1 to avoid overlapping matches
      i = endPos1 - 1;
      
      // Find next occurrence (if any)
      matchIndex = text2.indexOf(potentialMatch, matchIndex + 1);
    }
  }
  
  // Filter out overlapping matches (keeping the longest ones)
  return filterOverlappingMatches(matches);
}

function filterOverlappingMatches(matches) {
  if (matches.length <= 1) return matches;
  
  // Sort by length (descending)
  const sortedMatches = [...matches].sort((a, b) => {
    const lengthA = a.file1End - a.file1Start;
    const lengthB = b.file1End - b.file1Start;
    return lengthB - lengthA;
  });
  
  const filteredMatches = [];
  
  for (const match of sortedMatches) {
    let overlaps = false;
    
    for (const filtered of filteredMatches) {
      // Check for overlap in file1
      const overlapsFile1 = (
        (match.file1Start >= filtered.file1Start && match.file1Start < filtered.file1End) ||
        (match.file1End > filtered.file1Start && match.file1End <= filtered.file1End) ||
        (match.file1Start <= filtered.file1Start && match.file1End >= filtered.file1End)
      );
      
      // Check for overlap in file2
      const overlapsFile2 = (
        (match.file2Start >= filtered.file2Start && match.file2Start < filtered.file2End) ||
        (match.file2End > filtered.file2Start && match.file2End <= filtered.file2End) ||
        (match.file2Start <= filtered.file2Start && match.file2End >= filtered.file2End)
      );
      
      if (overlapsFile1 || overlapsFile2) {
        overlaps = true;
        break;
      }
    }
    
    if (!overlaps) {
      filteredMatches.push(match);
    }
  }
  
  return filteredMatches;
}

// Calculate similarity percentage based on matches
function calculateSimilarityPercentage(text1, text2, matches) {
  // Calculate total characters matched
  const totalMatched = matches.reduce((sum, match) => {
    return sum + (match.file1End - match.file1Start);
  }, 0);
  
  // Calculate combined similarity based on matched text and text length
  const matchedRatio = (totalMatched / Math.max(text1.length, 1)) * 100;
  
  // Calculate Jaccard similarity (word-based)
  const jaccardScore = jaccardSimilarity(text1, text2) * 100;
  
  // Weighted combination
  return (matchedRatio * 0.7) + (jaccardScore * 0.3);
}

// Process files and compare them
async function compareFiles(files) {
  const results = [];
  
  // Compare each file with every other file
  for (let i = 0; i < files.length; i++) {
    for (let j = i + 1; j < files.length; j++) {
      const file1 = files[i];
      const file2 = files[j];
      
      let content1 = file1.content;
      let content2 = file2.content;
      
      // If code files, normalize code
      if (isCodeContent(content1, file1.type) || isCodeContent(content2, file2.type)) {
        content1 = normalizeCode(content1, file1.type);
        content2 = normalizeCode(content2, file2.type);
      }
      
      // Find matching sections
      const matches = findMatches(file1.content, file2.content);
      
      // Calculate similarity percentage
      const similarityPercentage = calculateSimilarityPercentage(file1.content, file2.content, matches);
      
      // Create result
      results.push({
        id: generateId(),
        file1Id: file1.id,
        file2Id: file2.id,
        similarityPercentage,
        matches,
      });
    }
  }
  
  return results;
}
