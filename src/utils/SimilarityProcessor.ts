import { FileData, ComparisonResult, Match } from "@/types/fileTypes";
import { generateId, levenshteinDistance, jaccardSimilarity, normalizeCode } from "./helpers";

export class SimilarityProcessor {
  // Detect if content is likely code
  private isCodeContent(content: string, fileType: string): boolean {
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
  private findMatches(text1: string, text2: string, minMatchLength: number = 20): Match[] {
    const matches: Match[] = [];
    
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
    return this.filterOverlappingMatches(matches);
  }
  
  private filterOverlappingMatches(matches: Match[]): Match[] {
    if (matches.length <= 1) return matches;
    
    // Sort by length (descending)
    const sortedMatches = [...matches].sort((a, b) => {
      const lengthA = a.file1End - a.file1Start;
      const lengthB = b.file1End - b.file1Start;
      return lengthB - lengthA;
    });
    
    const filteredMatches: Match[] = [];
    
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
  private calculateSimilarityPercentage(text1: string, text2: string, matches: Match[]): number {
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
  public async compareFiles(files: FileData[]): Promise<ComparisonResult[]> {
    const results: ComparisonResult[] = [];
    
    // Compare each file with every other file
    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const file1 = files[i];
        const file2 = files[j];
        
        let content1 = file1.content;
        let content2 = file2.content;
        
        // If code files, normalize code
        if (this.isCodeContent(content1, file1.type) || this.isCodeContent(content2, file2.type)) {
          content1 = normalizeCode(content1, file1.type);
          content2 = normalizeCode(content2, file2.type);
        }
        
        // Find matching sections
        const matches = this.findMatches(file1.content, file2.content);
        
        // Calculate similarity percentage
        const similarityPercentage = this.calculateSimilarityPercentage(file1.content, file2.content, matches);
        
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
}
