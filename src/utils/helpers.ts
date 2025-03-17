
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Calculate Levenshtein distance between two strings
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  // Create a matrix of size (m+1) x (n+1)
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
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
export function jaccardSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(Boolean));
  const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(Boolean));
  
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// Normalize code by removing whitespace, comments, etc.
export function normalizeCode(code: string, language: string): string {
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
    // Add more languages as needed
  }
  
  // Remove extra whitespace, blank lines, and normalize spacing
  normalizedCode = normalizedCode
    .replace(/\s+/g, ' ')
    .trim();
  
  return normalizedCode;
}
