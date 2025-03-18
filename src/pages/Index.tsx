
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FileUploader } from "@/components/FileUploader";
import { ResultsTable } from "@/components/ResultsTable";
import { SimilarityProcessor } from "@/utils/SimilarityProcessor";
import { FileData, ComparisonResult } from "@/types/fileTypes";
import { Loader2, AlertCircle, Brain, ArrowUpToLine } from "lucide-react";

const Index = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processorRef = useRef<SimilarityProcessor | null>(null);

  const handleFilesAdded = (newFiles: FileData[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setError(null);
  };

  const handleFileRemove = (fileId: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
    setError(null);
  };

  const processFiles = async () => {
    if (files.length < 2) {
      setError("Please upload at least 2 files to compare");
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      if (!processorRef.current) {
        processorRef.current = new SimilarityProcessor();
      }
      
      const comparisonResults = await processorRef.current.compareFiles(files);
      setResults(comparisonResults);
    } catch (err) {
      console.error("Error processing files:", err);
      setError("An error occurred while processing files. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6 animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-purple-800 relative">
                Detectify
                <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-gradient-to-r from-purple-600 to-transparent"></span>
              </h1>
              <p className="text-gray-600 mt-2">Similarity Scanner & Plagiarism Detection</p>
            </div>
            <Link 
              to="/ai-detector" 
              className="flex items-center text-purple-600 hover:text-purple-800 transition-colors hover:scale-105 transform duration-200 bg-purple-50 px-4 py-2 rounded-lg"
            >
              <Brain className="h-5 w-5 mr-2" />
              AI Text Detector
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl animate-fade-in">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-purple-800">
            <ArrowUpToLine className="h-5 w-5 mr-2 text-purple-600" />
            Upload Files for Comparison
          </h2>
          <p className="text-gray-600 mb-6 border-l-4 border-purple-200 pl-3">
            Upload multiple files to check for similarities. Supports text documents, PDFs, and code files.
          </p>
          
          <FileUploader 
            onFilesAdded={handleFilesAdded} 
            files={files}
            onFileRemove={handleFileRemove}
          />

          {error && (
            <div className="flex items-center p-4 mt-4 text-red-800 bg-red-50 rounded-md border-l-4 border-red-500 animate-fade-in">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={processFiles}
              disabled={isProcessing || files.length < 2}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-700 to-purple-800 text-white font-medium rounded-md hover:from-purple-800 hover:to-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Compare Files"
              )}
            </button>
            
            {files.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-all duration-300 hover:border-purple-300 hover:text-purple-600"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        {results.length > 0 && <ResultsTable results={results} files={files} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="animate-fade-in">Detectify - Similarity Scanner &copy; {new Date().getFullYear()}</p>
          <div className="mt-2 flex justify-center space-x-4">
            <a href="#" className="text-purple-500 hover:text-purple-700 transition-colors">Privacy Policy</a>
            <a href="#" className="text-purple-500 hover:text-purple-700 transition-colors">Terms of Service</a>
            <a href="#" className="text-purple-500 hover:text-purple-700 transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
