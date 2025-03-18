
// Similarity Processor
const compareFiles = async (files) => {
  // Create pairs of files to compare
  const filePairs = [];
  
  for (let i = 0; i < files.length; i++) {
    for (let j = i + 1; j < files.length; j++) {
      filePairs.push({
        file1: files[i],
        file2: files[j]
      });
    }
  }
  
  const results = [];
  
  // Process each pair
  for (const pair of filePairs) {
    const result = await comparePair(pair.file1, pair.file2);
    results.push(result);
  }
  
  return results;
};

const comparePair = async (file1, file2) => {
  // Extract and normalize text
  const text1 = normalizeText(file1.content);
  const text2 = normalizeText(file2.content);
  
  // Calculate similarity score
  const { similarity, matches } = calculateSimilarity(text1, text2);
  
  return {
    id: generateId(),
    file1Id: file1.id,
    file2Id: file2.id,
    similarityPercentage: parseFloat((similarity * 100).toFixed(2)),
    matches: matches
  };
};

// Normalize text for comparison
const normalizeText = (text) => {
  if (!text || typeof text !== 'string') {
    console.warn("Text received is not a string:", text);
    return "";
  }
  
  // Remove extra whitespace, convert to lowercase
  return text
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
};

// Calculate similarity between two texts
const calculateSimilarity = (text1, text2) => {
  if (!text1 || !text2) {
    console.warn("Empty text provided for comparison");
    return { similarity: 0, matches: [] };
  }
  
  // Find matching subsequences
  const matches = findMatches(text1, text2);
  
  // Calculate Jaccard similarity
  const words1 = text1.split(' ');
  const words2 = text2.split(' ');
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  let similarity = intersection.size / Math.max(union.size, 1);
  
  // Adjust for sequence matches
  const matchedChars = matches.reduce((sum, match) => {
    return sum + (match.file1End - match.file1Start);
  }, 0);
  
  // Weight by matched character sequences
  const sequenceWeight = 0.5;
  const overallLength = Math.max(text1.length, 1);
  const sequenceSimilarity = Math.min(matchedChars / overallLength, 1);
  
  // Combine Jaccard similarity with sequence matches
  similarity = (similarity * (1 - sequenceWeight)) + (sequenceSimilarity * sequenceWeight);
  
  return {
    similarity: similarity,
    matches: matches
  };
};

// Find matching sequences between texts
const findMatches = (text1, text2) => {
  const minMatchLength = 10; // Minimum characters to consider a match
  const matches = [];
  let startIdx1 = 0;
  
  while (startIdx1 < text1.length) {
    let matchLength = 0;
    let matchStartIdx1 = -1;
    let matchStartIdx2 = -1;
    
    // Try to find a match starting at startIdx1
    for (let i = startIdx1; i < text1.length; i++) {
      const subtext = text1.substring(i, i + minMatchLength);
      
      if (subtext.length < minMatchLength) {
        break;
      }
      
      const idx = text2.indexOf(subtext);
      
      if (idx !== -1) {
        // Found a potential match
        matchStartIdx1 = i;
        matchStartIdx2 = idx;
        
        // Extend the match
        let len = minMatchLength;
        while (
          matchStartIdx1 + len < text1.length && 
          matchStartIdx2 + len < text2.length && 
          text1[matchStartIdx1 + len] === text2[matchStartIdx2 + len]
        ) {
          len++;
        }
        
        if (len > matchLength) {
          matchLength = len;
          break;
        }
      }
    }
    
    if (matchLength >= minMatchLength) {
      matches.push({
        file1Start: matchStartIdx1,
        file1End: matchStartIdx1 + matchLength,
        file2Start: matchStartIdx2,
        file2End: matchStartIdx2 + matchLength
      });
      
      startIdx1 = matchStartIdx1 + matchLength;
    } else {
      startIdx1++;
    }
  }
  
  return matches;
};

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}
