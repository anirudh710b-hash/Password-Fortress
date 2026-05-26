// DOM elements
const passwordField = document.getElementById('passwordInput');
const toggleBtn = document.getElementById('toggleEye');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const resetBtn = document.getElementById('resetBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const strengthFill = document.getElementById('strengthFill');
const strengthPercentLabel = document.getElementById('strengthPercentLabel');
const strengthBadge = document.getElementById('strengthBadge');
const scoreValueSpan = document.getElementById('scoreValue');
const suggestionBox = document.getElementById('suggestionBox');
const entropyHint = document.getElementById('entropyHint');

// Criteria elements
const critLength = document.getElementById('crit-length');
const critUpper = document.getElementById('crit-upper');
const critLower = document.getElementById('crit-lower');
const critDigit = document.getElementById('crit-digit');
const critSpecial = document.getElementById('crit-special');
const critLengthBonus = document.getElementById('crit-lengthBonus');
const critMixBonus = document.getElementById('crit-mixBonus');

// Toast notification
function showToast(message) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// Apply criterion class
function applyCriterionClass(element, isValid) {
  if (isValid) {
    element.classList.add('valid');
    element.classList.remove('invalid');
    const iconSpan = element.querySelector('span:first-child');
    if (iconSpan && iconSpan.innerText !== '✅') iconSpan.innerText = '✅';
  } else {
    element.classList.add('invalid');
    element.classList.remove('valid');
    const iconSpan = element.querySelector('span:first-child');
    if (iconSpan && iconSpan.innerText !== '🔹') iconSpan.innerText = '🔹';
  }
}

function updateCriteriaUI(password) {
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);
  const longBonus = len >= 12;
  let varietyCount = 0;
  if (hasUpper) varietyCount++;
  if (hasLower) varietyCount++;
  if (hasDigit) varietyCount++;
  if (hasSpecial) varietyCount++;
  const highMix = varietyCount >= 4 && len >= 10;
  
  applyCriterionClass(critLength, len >= 8);
  applyCriterionClass(critUpper, hasUpper);
  applyCriterionClass(critLower, hasLower);
  applyCriterionClass(critDigit, hasDigit);
  applyCriterionClass(critSpecial, hasSpecial);
  applyCriterionClass(critLengthBonus, longBonus);
  applyCriterionClass(critMixBonus, highMix);
  return { len, hasUpper, hasLower, hasDigit, hasSpecial, varietyCount };
}

function evaluateStrength(password) {
  if (password.length === 0) {
    return { score: 0, strengthLabel: 'No Password', barColor: '#475569', suggestion: '🔐 Enter or generate a password.' };
  }
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);
  let varietyCount = 0;
  if (hasUpper) varietyCount++;
  if (hasLower) varietyCount++;
  if (hasDigit) varietyCount++;
  if (hasSpecial) varietyCount++;
  
  let lengthPoints = 0;
  if (len >= 20) lengthPoints = 40;
  else if (len >= 16) lengthPoints = 36;
  else if (len >= 14) lengthPoints = 32;
  else if (len >= 12) lengthPoints = 28;
  else if (len >= 10) lengthPoints = 22;
  else if (len >= 8) lengthPoints = 16;
  else if (len >= 6) lengthPoints = 9;
  else lengthPoints = len * 1.2;
  
  let varietyPoints = 0;
  if (varietyCount === 4) varietyPoints = 35;
  else if (varietyCount === 3) varietyPoints = 26;
  else if (varietyCount === 2) varietyPoints = 15;
  else if (varietyCount === 1) varietyPoints = 6;
  
  let entropyBonus = 0;
  if (hasUpper && hasLower) entropyBonus += 4;
  if (hasDigit && hasSpecial) entropyBonus += 5;
  if (varietyCount >= 3 && len >= 12) entropyBonus += 8;
  if (varietyCount === 4 && len >= 14) entropyBonus += 8;
  if (len >= 18 && varietyCount >= 3) entropyBonus += 6;
  if (len >= 24) entropyBonus += 5;
  
  let penalty = 0;
  if (/(.)\1{3,}/.test(password)) penalty += 4;
  if (/^(?=.*password|123456|qwerty|admin)/i.test(password)) penalty += 10;
  
  let rawScore = lengthPoints + varietyPoints + entropyBonus - penalty;
  let finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));
  if (len >= 12 && varietyCount >= 3 && finalScore < 75) finalScore = Math.min(100, finalScore + 8);
  if (len >= 16 && varietyCount >= 4 && hasUpper && hasLower && hasDigit && hasSpecial) {
    finalScore = Math.max(finalScore, 96);
    if (len >= 20) finalScore = 100;
  }
  finalScore = Math.min(100, finalScore);
  
  let strengthLabel = '', barColor = '', suggestionMsg = '';
  if (finalScore >= 95) { strengthLabel = '🏆 IMPENETRABLE'; barColor = '#10b981'; suggestionMsg = '🌟 Flawless! Military-grade entropy.'; }
  else if (finalScore >= 85) { strengthLabel = '🛡️ VERY STRONG'; barColor = '#22c55e'; suggestionMsg = '✅ Excellent for critical accounts.'; }
  else if (finalScore >= 72) { strengthLabel = '🔒 STRONG'; barColor = '#3b82f6'; suggestionMsg = '👍 Good! Add more length/symbols for perfection.'; }
  else if (finalScore >= 55) { strengthLabel = '⚠️ MEDIUM'; barColor = '#eab308'; suggestionMsg = '📈 Decent. Mix uppercase, digits, specials, aim for 12+ length.'; }
  else if (finalScore >= 35) { strengthLabel = '🍂 WEAK'; barColor = '#f97316'; suggestionMsg = '⚠️ Too guessable. Add variety and length.'; }
  else { strengthLabel = '🔥 VERY WEAK'; barColor = '#ef4444'; suggestionMsg = '🚨 Dangerous! Use 8+ chars with mix of cases, numbers, symbols.'; }
  
  return { score: finalScore, strengthLabel, barColor, suggestion: suggestionMsg };
}

function refreshStrength() {
  const password = passwordField.value;
  updateCriteriaUI(password);
  if (password.length === 0) {
    strengthFill.style.width = '0%';
    strengthPercentLabel.innerText = '0%';
    strengthBadge.innerHTML = `⚡ No password`;
    scoreValueSpan.innerText = `Score: 0/100`;
    strengthFill.style.backgroundColor = '#475569';
    suggestionBox.innerHTML = `💡 Start typing or generate a strong password.`;
    entropyHint.innerHTML = `🔒 Real-time cryptographic-style strength`;
    return;
  }
  const result = evaluateStrength(password);
  strengthFill.style.width = `${result.score}%`;
  strengthPercentLabel.innerText = `${result.score}%`;
  strengthFill.style.backgroundColor = result.barColor;
  strengthBadge.innerHTML = `${result.strengthLabel}`;
  scoreValueSpan.innerText = `Score: ${result.score}/100`;
  suggestionBox.innerHTML = `💡 ${result.suggestion}`;
  if (result.score >= 95) entropyHint.innerHTML = `✨ Top-tier entropy! Maximum security.`;
  else if (result.score >= 80) entropyHint.innerHTML = `🔐 Excellent complexity — very resistant.`;
  else if (result.score >= 60) entropyHint.innerHTML = `📊 Good start, aim for 80+ score.`;
  else entropyHint.innerHTML = `🔄 Add length & character classes to boost score.`;
}

// Password Generator (secure, 16 chars with mix)
function generateSecurePassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const specials = '!@#$%^&*';
  const all = upper + lower + digits + specials;
  let password = '';
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += specials[Math.floor(Math.random() * specials.length)];
  for (let i = 4; i < 16; i++) password += all[Math.floor(Math.random() * all.length)];
  password = password.split('').sort(() => Math.random() - 0.5).join('');
  return password;
}

function copyPassword() {
  if (!passwordField.value) { showToast('❌ No password to copy'); return; }
  navigator.clipboard.writeText(passwordField.value).then(() => showToast('✅ Password copied!')).catch(() => showToast('❌ Failed to copy'));
}

function resetApp() {
  passwordField.value = '';
  refreshStrength();
  passwordField.focus();
  showToast('✨ Cleared');
}

// Dark/Light mode with localStorage
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggleBtn.textContent = '☀️';
  } else {
    document.body.classList.remove('dark');
    themeToggleBtn.textContent = '🌙';
  }
}
function toggleTheme() {
  if (document.body.classList.contains('dark')) {
    document.body.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    themeToggleBtn.textContent = '🌙';
  } else {
    document.body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    themeToggleBtn.textContent = '☀️';
  }
}

// Toggle password visibility
function toggleVisibility() {
  const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordField.setAttribute('type', type);
  toggleBtn.textContent = type === 'password' ? 'Show' : 'Hide';
}

// Event listeners
passwordField.addEventListener('input', refreshStrength);
toggleBtn.addEventListener('click', toggleVisibility);
generateBtn.addEventListener('click', () => {
  const newPwd = generateSecurePassword();
  passwordField.value = newPwd;
  refreshStrength();
  showToast('🔐 Strong password generated!');
});
copyBtn.addEventListener('click', copyPassword);
resetBtn.addEventListener('click', resetApp);
themeToggleBtn.addEventListener('click', toggleTheme);

// Initialize
initTheme();
refreshStrength();
const initCriteria = [critLength, critUpper, critLower, critDigit, critSpecial, critLengthBonus, critMixBonus];
initCriteria.forEach(crit => { crit.classList.add('invalid'); crit.classList.remove('valid'); });