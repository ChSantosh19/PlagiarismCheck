
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
  
  // Add pulsing animation to drop area periodically
  function startPulseAnimation() {
    setTimeout(() => {
      if (files.length === 0) {
        dropArea.classList.add('highlight');
        setTimeout(() => {
          dropArea.classList.remove('highlight');
          startPulseAnimation();
        }, 1500);
      } else {
        startPulseAnimation();
      }
    }, 5000);
  }
  
  // Start the animation
  startPulseAnimation();
  
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
    
    // Show loading indicator
    dropArea.innerHTML = `
      <div class="upload-prompt">
        <div class="spinner"></div>
        <p>Processing files...</p>
      </div>
    `;
    
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
        console.error(`Error processing file ${file.name}:`, error);
        showError(`Failed to process file ${file.name}: ${error.message}`);
      }
    }
    
    // Reset drop area
    dropArea.innerHTML = `
      <div class="upload-prompt">
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <p>Drag & drop files or <label for="file-input" class="browse-link">browse</label></p>
        <input type="file" id="file-input" multiple hidden />
      </div>
    `;
    
    // Re-attach event listener to file input
    document.getElementById('file-input').addEventListener('change', function() {
      handleFiles(this.files);
    });
    
    // Add new files to state
    files = [...files, ...newFiles];
    
    // Update UI
    updateFileList();
    updateButtonState();
    clearError();
    
    // Show success animation for each file
    if (newFiles.length > 0) {
      showNotification(`Successfully processed ${newFiles.length} file(s)`);
    }
  }
  
  // Show a notification
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
      <div class="notification-content">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'var(--success)',
      color: 'white',
      padding: '10px 15px',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow)',
      zIndex: '100',
      transform: 'translateX(100%)',
      opacity: '0',
      transition: 'all 0.3s ease'
    });
    
    // Show notification with animation
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 100);
    
    // Remove notification after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
  
  // Update the file list in the UI
  function updateFileList() {
    fileList.innerHTML = '';
    
    if (files.length === 0) {
      clearBtn.classList.add('hidden');
      return;
    }
    
    clearBtn.classList.remove('hidden');
    
    files.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.style.animationDelay = `${index * 0.1}s`;
      fileItem.innerHTML = `
        <div class="file-icon">${getFileIcon(file.name)}</div>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
        <button class="file-remove" data-id="${file.id}" title="Remove file">
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
    const fileToRemove = files.find(file => file.id === fileId);
    const fileElement = document.querySelector(`.file-item .file-remove[data-id="${fileId}"]`).closest('.file-item');
    
    // Animate removal
    fileElement.style.opacity = '0';
    fileElement.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
      files = files.filter(file => file.id !== fileId);
      updateFileList();
      updateButtonState();
      
      // Show removal notification
      if (fileToRemove) {
        showNotification(`Removed ${fileToRemove.name}`);
      }
    }, 300);
  }
  
  // Update the state of the compare button
  function updateButtonState() {
    if (files.length >= 2) {
      compareBtn.disabled = false;
      compareBtn.classList.add('ready');
    } else {
      compareBtn.disabled = true;
      compareBtn.classList.remove('ready');
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
    
    // Animate error message
    errorMessage.style.animation = 'none';
    setTimeout(() => {
      errorMessage.style.animation = 'slideIn 0.3s ease-out';
    }, 10);
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
    
    // Simulate processing steps with visual feedback
    const totalSteps = 3;
    let currentStep = 1;
    
    buttonText.textContent = `Processing... Step ${currentStep}/${totalSteps}`;
    
    // Create a promise to process the comparison
    const processWithAnimation = async () => {
      // Step 1: Parsing files
      await new Promise(resolve => setTimeout(resolve, 800));
      buttonText.textContent = `Parsing files... Step ${currentStep}/${totalSteps}`;
      
      currentStep++;
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Step 2: Computing similarities
      buttonText.textContent = `Computing similarities... Step ${currentStep}/${totalSteps}`;
      
      try {
        // Process the comparison
        results = await compareFiles(files);
        
        currentStep++;
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Step 3: Generating report
        buttonText.textContent = `Generating report... Step ${currentStep}/${totalSteps}`;
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Update UI with results
        updateResultsTable();
        resultsSection.classList.remove('hidden');
        
        // Scroll to results section
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Show success notification
        showNotification('Comparison completed successfully!');
      } catch (error) {
        console.error('Error processing files:', error);
        showError('An error occurred while processing files. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    // Start the processing animation
    processWithAnimation();
  });
  
  // Set loading state
  function setLoading(isLoading) {
    if (isLoading) {
      spinner.classList.remove('hidden');
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
    
    // Animate the results section appearance
    resultsSection.style.animation = 'none';
    setTimeout(() => {
      resultsSection.style.animation = 'fadeIn 0.8s ease-out';
    }, 10);
    
    results.forEach((result, index) => {
      const file1 = files.find(f => f.id === result.file1Id);
      const file2 = files.find(f => f.id === result.file2Id);
      
      if (!file1 || !file2) return;
      
      const row = document.createElement('tr');
      row.style.animationDelay = `${index * 0.1}s`;
      
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
    if (!content) return '<pre>No content available</pre>';
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
    if (!text) return '';
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
    // Animate clearing
    document.querySelectorAll('.file-item').forEach((item, index) => {
      item.style.transition = 'all 0.3s ease';
      item.style.transitionDelay = `${index * 0.05}s`;
      item.style.opacity = '0';
      item.style.transform = 'translateX(20px)';
    });
    
    setTimeout(() => {
      files = [];
      results = [];
      updateFileList();
      updateButtonState();
      resultsSection.classList.add('hidden');
      clearError();
      
      // Show notification
      showNotification('All files cleared');
    }, 300);
  });
});
