
// Set PDF.js worker source
const pdfjsWorker = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

async function extractTextFromFile(file) {
  const fileType = getFileType(file);
  
  try {
    switch (fileType) {
      case 'pdf':
        return await extractTextFromPdf(file);
      case 'docx':
        return await extractTextFromDocx(file);
      case 'code':
      case 'text':
      default:
        return await extractTextFromTextFile(file);
    }
  } catch (error) {
    console.error(`Error extracting text from ${file.name}:`, error);
    return ""; // Return empty string on error
  }
}

function getFileType(file) {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  if (file.type === 'application/pdf' || extension === 'pdf') {
    return 'pdf';
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension === 'docx') {
    return 'docx';
  } else if (isCodeFile(extension)) {
    return 'code';
  } else {
    return 'text';
  }
}

function isCodeFile(extension) {
  const codeExtensions = ['js', 'ts', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rb', 'php', 'html', 'css', 'jsx', 'tsx'];
  return codeExtensions.includes(extension);
}

async function extractTextFromTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        // Make sure we're returning a valid string
        if (typeof text === 'string') {
          resolve(text);
        } else {
          console.warn("Text file didn't return a string, returning empty string");
          resolve("");
        }
      } catch (err) {
        console.error("Error reading text content:", err);
        resolve("");
      }
    };
    
    reader.onerror = (e) => {
      console.error("FileReader error:", e);
      reject(new Error('Error reading text file'));
    };
    
    reader.readAsText(file);
  });
}

async function extractTextFromPdf(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(' ');
      text += pageText + '\n';
    }
    
    return text || ""; // Ensure we return a string even if text is empty
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return ""; // Return empty string rather than throwing
  }
}

async function extractTextFromDocx(file) {
  try {
    // Check if mammoth.js is available
    if (typeof mammoth === 'undefined') {
      await loadMammoth();
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || "";
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    return ""; // Return empty string rather than throwing
  }
}

// Load mammoth.js dynamically
async function loadMammoth() {
  return new Promise((resolve, reject) => {
    if (typeof mammoth !== 'undefined') {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.0/mammoth.browser.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load mammoth.js'));
    document.head.appendChild(script);
  });
}

// Helper functions for file UI
function getFileIcon(fileName) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const iconMap = {
    'pdf': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    'docx': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    'txt': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    'js': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
    'py': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
    'html': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
    'css': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
  };
  
  return iconMap[extension] || '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}
