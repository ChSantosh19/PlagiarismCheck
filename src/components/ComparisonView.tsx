
import React from "react";
import { FileData, Match } from "@/types/fileTypes";

interface ComparisonViewProps {
  file1: FileData;
  file2: FileData;
  matches: Match[];
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  file1,
  file2,
  matches,
}) => {
  const renderHighlightedContent = (content: string, matches: Match[], isFile1: boolean) => {
    if (!matches.length) return <pre className="text-sm whitespace-pre-wrap">{content}</pre>;

    let lastIndex = 0;
    const segments = [];

    matches.forEach((match, idx) => {
      const start = isFile1 ? match.file1Start : match.file2Start;
      const end = isFile1 ? match.file1End : match.file2End;

      // Add text before the match
      if (start > lastIndex) {
        segments.push(
          <span key={`pre-${idx}`} className="whitespace-pre-wrap">
            {content.substring(lastIndex, start)}
          </span>
        );
      }

      // Add the matched text
      segments.push(
        <span
          key={`match-${idx}`}
          className="bg-yellow-200 whitespace-pre-wrap"
          title={`Match ${idx + 1}`}
        >
          {content.substring(start, end)}
        </span>
      );

      lastIndex = end;
    });

    // Add any remaining text
    if (lastIndex < content.length) {
      segments.push(
        <span key="post" className="whitespace-pre-wrap">
          {content.substring(lastIndex)}
        </span>
      );
    }

    return <pre className="text-sm">{segments}</pre>;
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="grid grid-cols-2 divide-x">
        <div className="p-4">
          <div className="font-medium text-sm mb-2">{file1.name}</div>
          <div className="bg-gray-50 p-4 rounded-md max-h-[500px] overflow-auto">
            {renderHighlightedContent(file1.content, matches, true)}
          </div>
        </div>
        <div className="p-4">
          <div className="font-medium text-sm mb-2">{file2.name}</div>
          <div className="bg-gray-50 p-4 rounded-md max-h-[500px] overflow-auto">
            {renderHighlightedContent(file2.content, matches, false)}
          </div>
        </div>
      </div>
    </div>
  );
};
