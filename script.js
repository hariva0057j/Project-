document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('appContainer');
  const themeToggle = document.getElementById('themeToggle');
  const form = document.getElementById('calcForm');
  const totalClassesInput = document.getElementById('totalClasses');
  const attendedInput = document.getElementById('attended');
  const absentInput = document.getElementById('absent');
  const resetBtn = document.getElementById('resetBtn');
  const resultsContainer = document.getElementById('resultsContainer');
  const thresholdSlider = document.getElementById('thresholdSlider');
  const thresholdValue = document.getElementById('thresholdValue');

  // Initialize state
  let attendanceThreshold = 75;

  // Load saved theme or default to light
  let theme = localStorage.getItem('theme') || 'light';
  appContainer.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';

  // Toggle theme handler
  themeToggle.addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light';
    appContainer.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
  });

  // Update threshold display on slider input
  thresholdSlider.addEventListener('input', (e) => {
    attendanceThreshold = Number(e.target.value);
    thresholdValue.textContent = attendanceThreshold;
  });

  // Auto-calculate absent when attending value or total changes
  function autoCalculateAbsent() {
    const total = parseInt(totalClassesInput.value) || 0;
    const attended = parseInt(attendedInput.value) || 0;

    if (total > 0 && attended >= 0 && attended <= total) {
      absentInput.value = total - attended;
    } else {
      absentInput.value = '';
    }
  }

  totalClassesInput.addEventListener('input', autoCalculateAbsent);
  attendedInput.addEventListener('input', autoCalculateAbsent);

  // Form submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateAttendance();
  });

  // Reset button handler
  resetBtn.addEventListener('click', () => {
    form.reset();
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = 'none';
    thresholdValue.textContent = '75';
    attendanceThreshold = 75;
  });

  function calculateAttendance() {
    const total = parseInt(totalClassesInput.value);
    const attended = parseInt(attendedInput.value);
    const absent = parseInt(absentInput.value);

    if (!total || total <= 0) {
      alert('Please enter a valid number of total classes');
      return;
    }

    if (attended < 0 || attended > total) {
      alert('Classes attended cannot be negative or exceed total classes');
      return;
    }

    const attendancePercentage = (attended / total) * 100;
    const requiredPercentage = attendanceThreshold;

    let statusClass, statusIcon, statusMessage;
    let recoverySection = '';
    let skipSection = '';

    // Determine attendance status
    if (attendancePercentage >= requiredPercentage) {
      statusClass = 'good';
      statusIcon = '🎉';
      statusMessage = `Excellent! Your attendance is above the required ${requiredPercentage}%.`;

      const classesCanSkip = Math.floor(attended / (requiredPercentage / 100) - total);

      if (classesCanSkip > 0) {
        skipSection = `
          <div class="skip-section">
            <div class="skip-title">🎯 Freedom Calculator</div>
            <div class="skip-classes">You can skip up to <strong>${classesCanSkip}</strong> upcoming classes and still maintain ${requiredPercentage}% attendance!</div>
            <div class="skip-warning">⚠️ <strong>Use Wisely:</strong> This is your maximum buffer - consider saving it for emergencies!</div>
          </div>
        `;
      } else {
        skipSection = `
          <div class="skip-section warning-skip">
            <div class="skip-title">⚡ Just Above the Line</div>
            <div class="skip-classes">You're doing great at <strong>${attendancePercentage.toFixed(1)}%</strong>, but can't skip any more classes now.</div>
            <div class="skip-advice">💪 Keep attending regularly to build a buffer!</div>
          </div>
        `;
      }
    } else if (attendancePercentage >= 65) {
      statusClass = 'warning';
      statusIcon = '⚠️';
      statusMessage = `Warning: Attendance is below ${requiredPercentage}%, but you can still recover!`;
    } else {
      statusClass = 'danger';
      statusIcon = '🚨';
      statusMessage = `Critical: Attendance is too low! Immediate action required!`;
    }

    // For low attendance, calculate classes needed to recover
    if (attendancePercentage < requiredPercentage) {
      const classesNeeded = Math.ceil((requiredPercentage * total - 100 * attended) / (100 - requiredPercentage));
      recoverySection = `
        <div class="recovery-section">
          <div class="recovery-title">🎯 Path to Recovery</div>
          <div class="needed-classes">To reach ${requiredPercentage}% attendance, you need <strong>${classesNeeded}</strong> consecutive classes without absences.</div>
          <div class="alternatives">
            <h4>Alternative approaches:</h4>
            <ul>
              <li>Focus on perfect attendance going forward</li>
              <li>Speak with your instructor about make-up opportunities</li>
              <li>Consider audit/withdrawal options if applicable</li>
              <li>Attend extra tutorials or classes</li>
            </ul>
          </div>
        </div>
      `;
    }

    // Build and display results HTML
    const resultsHTML = `
      <div class="attendance-status">
        <span class="status-icon">${statusIcon}</span>
        <div class="percentage percentage-${statusClass}">${attendancePercentage.toFixed(2)}%</div>
        <div class="status-message">${statusMessage}</div>
      </div>

      <div class="breakdown-grid" role="list">
        <div class="breakdown-item" role="listitem">
          <div class="label">Total Classes</div>
          <div class="value">${total}</div>
        </div>
        <div class="breakdown-item" role="listitem">
          <div class="label">Attended</div>
          <div class="value">${attended}</div>
        </div>
        <div class="breakdown-item" role="listitem">
          <div class="label">Absent</div>
          <div class="value">${absent}</div>
        </div>
      </div>

      ${skipSection}
      ${recoverySection}

      <div class="motivation-section">
        🌟 Every class you attend builds your knowledge and brings you closer to success. You've got this! 🌟
      </div>
    `;

    resultsContainer.innerHTML = resultsHTML;
    resultsContainer.style.display = 'block';
    resultsContainer.focus();
  }

  // Accessibility: focus styling on inputs
  document.querySelectorAll('input, button').forEach(el => {
    el.addEventListener('focus', () => el.classList.add('focus-visible'));
    el.addEventListener('blur', () => el.classList.remove('focus-visible'));
  });

});
