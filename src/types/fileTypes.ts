
export interface FileData {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
}

export interface Match {
  file1Start: number;
  file1End: number;
  file2Start: number;
  file2End: number;
}

export interface ComparisonResult {
  id: string;
  file1Id: string;
  file2Id: string;
  similarityPercentage: number;
  matches: Match[];
}
