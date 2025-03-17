
import React, { useState } from "react";
import { ComparisonResult, FileData } from "@/types/fileTypes";
import { ComparisonView } from "./ComparisonView";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";

interface ResultsTableProps {
  results: ComparisonResult[];
  files: FileData[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results, files }) => {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  
  // Sort results by similarity percentage (descending)
  const sortedResults = [...results].sort((a, b) => b.similarityPercentage - a.similarityPercentage);
  
  const getFileName = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    return file ? file.name : 'Unknown file';
  };
  
  const getSimilarityClass = (percentage: number) => {
    if (percentage >= 80) return "bg-red-100 text-red-800";
    if (percentage >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };
  
  const toggleExpand = (resultId: string) => {
    setExpandedResult(expandedResult === resultId ? null : resultId);
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Similarity Results</h2>
      
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Files Compared
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Similarity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedResults.map((result) => (
              <React.Fragment key={result.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getFileName(result.file1Id)} <span className="text-gray-500">vs.</span> {getFileName(result.file2Id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSimilarityClass(result.similarityPercentage)}`}>
                      {result.similarityPercentage.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => toggleExpand(result.id)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      {expandedResult === result.id ? (
                        <>
                          <ChevronUp className="mr-1 h-4 w-4" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </>
                      )}
                    </button>
                  </td>
                </tr>
                {expandedResult === result.id && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4">
                      <ComparisonView 
                        file1={files.find(f => f.id === result.file1Id)!}
                        file2={files.find(f => f.id === result.file2Id)!}
                        matches={result.matches} 
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
