
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  const compareBtn = document.getElementById('compare-btn');
  const clearBtn = document.getElementById('clear-btn');
  const errorMessage = document.getElementById('error-message');
  const resultsSection = document.getElementById('results-section');
  const resultsTable = document.getElementById('results-table');
  const resultsBody = document.getElementById('results-body');
  const comparisonModal = document.getElementById('comparison-modal');
  const closeModal = document.querySelector('.close-modal');
  const file1Header = document.getElementById('file1-header');
  const file2Header = document.getElementById('file2-header');
  const file1Content = document.getElementById('file1-content');
  const file2Content = document.getElementById('file2-content');
  const spinner = document.querySelector('.spinner');
  const buttonText = document.querySelector('.button-text');
  const currentYear = document.getElementById('current-year');
  
  // Set current year in the footer
  currentYear.textContent = new Date().getFullYear();
  
  // State
  let files = [];
  let results = [];
  
  // Event Listeners for Drag and Drop
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });
  
  function highlight() {
    dropArea.classList.add('highlight');
  }
  
  function unhighlight() {
    dropArea.classList.remove('highlight');
  }
  
  // Handle dropped files
  dropArea.addEventListener('drop', handleDrop, false);
  
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const droppedFiles = dt.files;
    handleFiles(droppedFiles);
  }
  
  // Handle file input change
  fileInput.addEventListener('change', function() {
    handleFiles(this.files);
  });
  
  // Process the uploaded files
  async function handleFiles(uploadedFiles) {
    if (!uploadedFiles.length) return;
    
    const newFiles = [];
    
    for (const file of uploadedFiles) {
      try {
        const content = await extractTextFromFile(file);
        const fileData = {
          id: generateId(),
          name: file.name,
          type: file.type || getFileType(file),
          size: file.size,
          content: content
        };
        
        newFiles.push(fileData);
      } catch (error) {
        showError(`Failed to process file ${file.name}: ${error.message}`);
      }
    }
    
    // Add new files to state
    files = [...files, ...newFiles];
    
    // Update UI
    updateFileList();
    updateButtonState();
    clearError();
  }
  
  // Update the file list in the UI
  function updateFileList() {
    fileList.innerHTML = '';
    
    if (files.length === 0) {
      clearBtn.classList.add('hidden');
      return;
    }
    
    clearBtn.classList.remove('hidden');
    
    files.forEach(file => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <div class="file-icon">${getFileIcon(file.name)}</div>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
        <button class="file-remove" data-id="${file.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
      
      fileList.appendChild(fileItem);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.file-remove').forEach(button => {
      button.addEventListener('click', () => {
        const fileId = button.getAttribute('data-id');
        removeFile(fileId);
      });
    });
  }
  
  // Remove a file from the list
  function removeFile(fileId) {
    files = files.filter(file => file.id !== fileId);
    updateFileList();
    updateButtonState();
  }
  
  // Update the state of the compare button
  function updateButtonState() {
    if (files.length >= 2) {
      compareBtn.disabled = false;
    } else {
      compareBtn.disabled = true;
    }
  }
  
  // Show error message
  function showError(message) {
    errorMessage.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      ${message}
    `;
    errorMessage.classList.remove('hidden');
  }
  
  // Clear error message
  function clearError() {
    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';
  }
  
  // Handle the compare button click
  compareBtn.addEventListener('click', async () => {
    if (files.length < 2) {
      showError('Please upload at least 2 files to compare');
      return;
    }
    
    // Show loading state
    setLoading(true);
    clearError();
    
    try {
      // Process the comparison
      results = await compareFiles(files);
      
      // Update UI with results
      updateResultsTable();
      resultsSection.classList.remove('hidden');
      
      // Scroll to results section
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error processing files:', error);
      showError('An error occurred while processing files. Please try again.');
    } finally {
      setLoading(false);
    }
  });
  
  // Set loading state
  function setLoading(isLoading) {
    if (isLoading) {
      spinner.classList.remove('hidden');
      buttonText.textContent = 'Processing...';
      compareBtn.disabled = true;
    } else {
      spinner.classList.add('hidden');
      buttonText.textContent = 'Compare Files';
      updateButtonState();
    }
  }
  
  // Update the results table
  function updateResultsTable() {
    resultsBody.innerHTML = '';
    
    if (results.length === 0) {
      resultsSection.classList.add('hidden');
      return;
    }
    
    results.forEach(result => {
      const file1 = files.find(f => f.id === result.file1Id);
      const file2 = files.find(f => f.id === result.file2Id);
      
      if (!file1 || !file2) return;
      
      const row = document.createElement('tr');
      
      const similarityClass = getSimilarityClass(result.similarityPercentage);
      
      row.innerHTML = `
        <td>${file1.name}</td>
        <td>${file2.name}</td>
        <td>
          <span class="similarity-badge ${similarityClass}">
            ${Math.round(result.similarityPercentage)}%
          </span>
        </td>
        <td>
          <button class="view-btn" data-result-id="${result.id}">View Comparison</button>
        </td>
      `;
      
      resultsBody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-btn').forEach(button => {
      button.addEventListener('click', () => {
        const resultId = button.getAttribute('data-result-id');
        openComparisonModal(resultId);
      });
    });
  }
  
  // Get similarity class based on percentage
  function getSimilarityClass(percentage) {
    if (percentage >= 70) {
      return 'similarity-high';
    } else if (percentage >= 40) {
      return 'similarity-medium';
    } else {
      return 'similarity-low';
    }
  }
  
  // Open the comparison modal
  function openComparisonModal(resultId) {
    const result = results.find(r => r.id === resultId);
    
    if (!result) return;
    
    const file1 = files.find(f => f.id === result.file1Id);
    const file2 = files.find(f => f.id === result.file2Id);
    
    if (!file1 || !file2) return;
    
    // Set file headers
    file1Header.textContent = file1.name;
    file2Header.textContent = file2.name;
    
    // Render highlighted content
    file1Content.innerHTML = renderHighlightedContent(file1.content, result.matches, true);
    file2Content.innerHTML = renderHighlightedContent(file2.content, result.matches, false);
    
    // Show modal
    comparisonModal.classList.remove('hidden');
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }
  
  // Render highlighted content
  function renderHighlightedContent(content, matches, isFile1) {
    if (!matches.length) return `<pre>${escapeHtml(content)}</pre>`;
    
    let lastIndex = 0;
    let html = '';
    
    matches.forEach((match, idx) => {
      const start = isFile1 ? match.file1Start : match.file2Start;
      const end = isFile1 ? match.file1End : match.file2End;
      
      // Add text before the match
      if (start > lastIndex) {
        html += escapeHtml(content.substring(lastIndex, start));
      }
      
      // Add the matched text
      html += `<span class="highlight" title="Match ${idx + 1}">${escapeHtml(content.substring(start, end))}</span>`;
      
      lastIndex = end;
    });
    
    // Add any remaining text
    if (lastIndex < content.length) {
      html += escapeHtml(content.substring(lastIndex));
    }
    
    return `<pre>${html}</pre>`;
  }
  
  // Escape HTML special characters
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Close the comparison modal
  closeModal.addEventListener('click', closeComparisonModal);
  
  // Close modal when clicking outside of it
  comparisonModal.addEventListener('click', (e) => {
    if (e.target === comparisonModal) {
      closeComparisonModal();
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !comparisonModal.classList.contains('hidden')) {
      closeComparisonModal();
    }
  });
  
  function closeComparisonModal() {
    comparisonModal.classList.add('hidden');
    document.body.style.overflow = '';
  }
  
  // Clear all files and results
  clearBtn.addEventListener('click', () => {
    files = [];
    results = [];
    updateFileList();
    updateButtonState();
    resultsSection.classList.add('hidden');
    clearError();
  });
});
