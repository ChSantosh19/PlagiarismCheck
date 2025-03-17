
import * as pdfjs from 'pdfjs-dist';

// Set PDF.js worker source
const pdfjsWorker = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = getFileType(file);
  
  switch (fileType) {
    case 'pdf':
      return extractTextFromPdf(file);
    case 'docx':
      return extractTextFromDocx(file);
    case 'code':
    case 'text':
    default:
      return extractTextFromTextFile(file);
  }
}

function getFileType(file: File): string {
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

function isCodeFile(extension: string): boolean {
  const codeExtensions = ['js', 'ts', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rb', 'php', 'html', 'css', 'jsx', 'tsx'];
  return codeExtensions.includes(extension);
}

async function extractTextFromTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text || '');
    };
    
    reader.onerror = (e) => {
      reject(new Error('Error reading text file'));
    };
    
    reader.readAsText(file);
  });
}

async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      text += pageText + '\n';
    }
    
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Could not extract text from PDF');
  }
}

async function extractTextFromDocx(file: File): Promise<string> {
  try {
    // Load mammoth.js from CDN
    if (!window.mammoth) {
      await loadMammoth();
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Could not extract text from DOCX');
  }
}

// Load mammoth.js dynamically
async function loadMammoth() {
  return new Promise<void>((resolve, reject) => {
    if (window.mammoth) {
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

// Add the mammoth library to Window interface
declare global {
  interface Window {
    mammoth: any;
  }
}
