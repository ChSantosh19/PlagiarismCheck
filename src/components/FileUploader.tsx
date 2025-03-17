
import React, { useCallback, useState } from "react";
import { FileData } from "@/types/fileTypes";
import { generateId } from "@/utils/helpers";
import { extractTextFromFile } from "@/utils/fileUtils";
import { FileX, Upload, File as FileIcon, X } from "lucide-react";

interface FileUploaderProps {
  onFilesAdded: (files: FileData[]) => void;
  files: FileData[];
  onFileRemove: (fileId: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFilesAdded, 
  files,
  onFileRemove,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback(async (fileList: FileList) => {
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      const newFilesData: FileData[] = [];
      
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const id = generateId();
        
        try {
          const text = await extractTextFromFile(file);
          
          newFilesData.push({
            id,
            name: file.name,
            type: file.type || 'text/plain',
            size: file.size,
            content: text,
          });
        } catch (err) {
          console.error(`Error processing file ${file.name}:`, err);
          // Continue with next file
        }
      }
      
      if (newFilesData.length > 0) {
        onFilesAdded(newFilesData);
      } else {
        setProcessingError("Could not process any of the selected files");
      }
    } catch (err) {
      console.error("Error processing files:", err);
      setProcessingError("An error occurred while processing files");
    } finally {
      setIsProcessing(false);
    }
  }, [onFilesAdded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input value so the same file can be uploaded again if needed
      e.target.value = '';
    }
  }, [processFiles]);

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm font-medium text-gray-900">
          Drag and drop files here, or
        </p>
        <label htmlFor="file-upload" className="relative cursor-pointer">
          <span className="mt-2 inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
            Browse files
          </span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            multiple
            className="sr-only"
            onChange={handleFileInputChange}
            disabled={isProcessing}
          />
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Supports TXT, PDF, DOCX, and code files (JS, PY, etc.)
        </p>
      </div>

      {isProcessing && (
        <div className="text-center py-2">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-gray-300 border-t-purple-600"></div>
          <p className="mt-2 text-sm text-gray-600">Processing files...</p>
        </div>
      )}

      {processingError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          <FileX className="inline-block mr-2 h-5 w-5" />
          {processingError}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files ({files.length})</h3>
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <div className="flex items-center">
                  <FileIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate" style={{ maxWidth: '200px' }}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onFileRemove(file.id)}
                  className="text-gray-400 hover:text-red-500"
                  title="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
