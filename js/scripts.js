 let currentStep = 1;
    const totalSteps = 4;
    const responses = {};

    // emoji click handlers
    document.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const question = this.getAttribute('data-question');
        const value = this.getAttribute('data-value');
        const emoji = this.getAttribute('data-emoji');
        
        // Remove previous selection for this question
        document.querySelectorAll(`[data-question="${question}"]`).forEach(b => {
          b.classList.remove('selected');
        });
        
        // Add selection to clicked button
        this.classList.add('selected');
        
        // Store response
        responses[question] = {
          rating: value,
          emoji: emoji,
          timestamp: new Date().toISOString()
        };
        
        // Update JSON display
        //updateJsonDisplay();
        
        // Enable next button
        updateNavigationState();
        
        // Auto-advance after delay (only if comment is not open)
        setTimeout(() => {
          const currentStepEl = document.getElementById(`step${currentStep}`);
          const commentArea = currentStepEl.querySelector('.comment-area');
          
          if (currentStep < totalSteps && (!commentArea || !commentArea.classList.contains('open'))) {
            nextStep();
          }
        }, 1000);
      });
    });

    function updateProgress() {
      const progress = (currentStep / totalSteps) * 100;
      document.getElementById('progressFill').style.width = progress + '%';
    }

    function updateNavigation() {
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      const submitBtn = document.getElementById('submitBtn');
      const skipBtn = document.getElementById('skipBtn');
      
      prevBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
      
      if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
        skipBtn.style.display = 'none';
      } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
        skipBtn.style.display = 'inline-block';
      }
    }

    function updateNavigationState() {
      // Enable buttons when rating is selected for current step
      const questions = ['checkin', 'cleanliness', 'service', 'overall'];
      const currentQuestion = questions[currentStep - 1];
      
      if (responses[currentQuestion]) {
        document.getElementById('nextBtn').disabled = false;
        document.getElementById('submitBtn').disabled = false;
      }
    }

    function showStep(stepNumber) {
      // Hide all steps
      document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active');
        if (index < stepNumber - 1) {
          step.classList.add('prev');
        } else {
          step.classList.remove('prev');
        }
      });
      
      // Show current step
      setTimeout(() => {
        const targetStep = stepNumber <= totalSteps ? 
          document.getElementById(`step${stepNumber}`) : 
          document.getElementById('thankYou');
        
        if (targetStep) {
          targetStep.classList.add('active');
          targetStep.classList.remove('prev');
        }
      }, 100);
      
      updateProgress();
      updateNavigation();
    }

    function nextStep() {
      if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
      }
    }

    function prevStep() {
      if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
      }
    }

    function skipStep() {
      if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
      }
    }

    function toggleComment(stepId) {
      const commentArea = document.getElementById(`comment-${stepId}`);
      const toggle = commentArea.previousElementSibling;
      
      if (commentArea.classList.contains('open')) {
        commentArea.classList.remove('open');
        toggle.classList.remove('active');
        toggle.innerHTML = '💬 Add Comment';
      } else {
        commentArea.classList.add('open');
        toggle.classList.add('active');
        toggle.innerHTML = '✕ Hide Comment';
        
        setTimeout(() => {
          const textarea = commentArea.querySelector('textarea');
          textarea.focus();
        }, 200);
      }
    }

    function collectComments() {
      const comments = {};
      const stepMap = {
        'step1': 'checkin',
        'step2': 'cleanliness', 
        'step3': 'service',
        'step4': 'overall'
      };

      Object.keys(stepMap).forEach(stepId => {
        const textarea = document.querySelector(`#comment-${stepId} textarea`);
        if (textarea && textarea.value.trim()) {
          comments[stepMap[stepId]] = textarea.value.trim();
        }
      });

      return comments;
    }

    function generateFeedbackJson() {
      const comments = collectComments();
      
      // Add comments to responses
      Object.keys(comments).forEach(key => {
        if (responses[key]) {
          responses[key].comment = comments[key];
        }
      });

      return {
        survey_id: `feedback_${Date.now()}`,
        timestamp: new Date().toISOString(),
        device_info: {
          type: 'tablet_kiosk',
          user_agent: navigator.userAgent,
          screen_size: `${screen.width}x${screen.height}`
        },
        responses: responses,
        completion_time: new Date().toISOString(),
        version: '2.0'
      };
    }

    function updateJsonDisplay() {
      const jsonOutput = document.getElementById('jsonOutput');
      const data = generateFeedbackJson();
      jsonOutput.textContent = JSON.stringify(data, null, 2);
      jsonOutput.style.display = 'block';
    }

    /*
    async function submitFeedback() {
      const loading = document.getElementById('loading');
      const submitBtn = document.getElementById('submitBtn');
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      loading.style.display = 'block';
      
      const feedbackData = generateFeedbackJson();
      
      // Log the JSON data to console
      console.log('Feedback Data:', JSON.stringify(feedbackData, null, 2));
      
      try {
       
        const response = await fetch('https://script.google.com/macros/s/AKfycbxqjms2a7jg8CrlUisUEKXebcZsWBD2Z_-OgzD1fr4-zbUW31BjMLd9MmDfjjw0prPY4A/exec', {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedbackData)
        });
        
        // Show success
        document.querySelectorAll('.step').forEach(step => {
          step.classList.remove('active');
        });
        
        document.getElementById('thankYou').classList.add('active');
        document.querySelector('.navigation').style.display = 'none';
        
        // Auto-reset after 5 seconds
        setTimeout(() => {
          location.reload();
        }, 5000);
        
      } catch (error) {
        console.error('Submission error:', error);
        alert('Submission failed. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit 🚀';
      } finally {
        loading.style.display = 'none';
      }
    }
      */

     async function submitFeedback() {
  const loading = document.getElementById('loading');
  const submitBtn = document.getElementById('submitBtn');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  loading.style.display = 'block';

  const feedbackData = generateFeedbackJson();

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbyW5Ou0Pn6WL_W3EmFEpaQNLjYnNqyS-W24w9BgBHTlWqK7xDZZVzoVzgCs5ZtSHX-t/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    });

    const result = await response.json();
    if(result.status === "success"){
      // Show thank you step
      document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
      document.getElementById('thankYou').classList.add('active');
      document.querySelector('.navigation').style.display = 'none';

      setTimeout(() => location.reload(), 5000);
    } else {
      throw new Error(result.message);
    }

  } catch (error) {
    console.error('Submission error:', error);
    alert('Submission failed. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit 🚀';
  } finally {
    loading.style.display = 'none';
  }
}

    // Initialize the form
    updateProgress();
    updateNavigation();
    
    
    // JSON debugging 
    setTimeout(() => {
      document.getElementById('jsonOutput').style.display = 'block';
    }, 1000);