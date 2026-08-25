// =========================================================
// Minimal Calculator - Free Standard Tier & PRO Scientific Suite ($5)
// =========================================================

// DOM Elements - Calculator Display & Container
const calcContainer = document.getElementById('calcContainer');
const display = document.getElementById('display');
const expression = document.getElementById('expression');
const copyResultBtn = document.getElementById('copyResultBtn');
const memoryIndicator = document.getElementById('memoryIndicator');
const angleModeDisplay = document.getElementById('angleModeDisplay');
const themeToggle = document.getElementById('themeToggle');
const buttons = document.querySelectorAll('button');

// DOM Elements - PRO Toolbar & Sections
const proScientificSection = document.getElementById('proScientificSection');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');
const historyToggleBtn = document.getElementById('historyToggleBtn');
const angleToggleBtn = document.getElementById('angleToggleBtn');

// DOM Elements - Account Status & Triggers
const userStatusBadge = document.getElementById('userStatusBadge');
const badgeText = document.getElementById('badgeText');
const badgeDot = document.getElementById('badgeDot');
const premiumTriggerBtn = document.getElementById('premiumTriggerBtn');
const quickUnlockBtn = document.getElementById('quickUnlockBtn');
const resetTrialBtn = document.getElementById('resetTrialBtn');

// DOM Elements - Binance Pay Modal
const paywallModal = document.getElementById('paywallModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const copyPayCodeBtn = document.getElementById('copyPayCodeBtn');
const copyBtnLabel = document.getElementById('copyBtnLabel');
const verifyPayBtn = document.getElementById('verifyPayBtn');
const txIdInput = document.getElementById('txIdInput');
const txErrorContainer = document.getElementById('txErrorContainer');
const openSupportFromErrorBtn = document.getElementById('openSupportFromErrorBtn');

// DOM Elements - History Modal
const historyModal = document.getElementById('historyModal');
const closeHistoryModalBtn = document.getElementById('closeHistoryModalBtn');
const historyListContainer = document.getElementById('historyListContainer');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// DOM Elements - Support Modal
const supportModal = document.getElementById('supportModal');
const closeSupportModalBtn = document.getElementById('closeSupportModalBtn');
const openSupportModalBtn = document.getElementById('openSupportModalBtn');
const supportForm = document.getElementById('supportForm');
const supportName = document.getElementById('supportName');
const supportEmail = document.getElementById('supportEmail');
const supportSubject = document.getElementById('supportSubject');
const supportMessage = document.getElementById('supportMessage');

// DOM Elements - Toast & Confetti
const toast = document.getElementById('toast');
const toastIcon = document.getElementById('toastIcon');
const toastMsg = document.getElementById('toastMsg');
const confettiCanvas = document.getElementById('confettiCanvas');

// =========================================================
// Storage Keys & Persistent State
// =========================================================
const STORAGE_KEYS = {
  IS_PREMIUM: 'calc_is_premium',
  HISTORY: 'calc_history_list',
  SOUND_ENABLED: 'calc_sound_enabled',
  ANGLE_MODE: 'calc_angle_mode',
  THEME: 'calc_theme'
};

// Initialize persistent state
let isPremium = localStorage.getItem(STORAGE_KEYS.IS_PREMIUM) === 'true';
let soundEnabled = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED) !== 'false';
let angleMode = localStorage.getItem(STORAGE_KEYS.ANGLE_MODE) || 'DEG'; // 'DEG' or 'RAD'
let memoryValue = 0;
let calculationHistory = [];
try {
  calculationHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
} catch {
  calculationHistory = [];
}

// Calculator Internal Arithmetic State
let currentValue = '0';
let previousValue = null;
let operator = null;
let overwrite = false;

// =========================================================
// Web Audio API Synthesizer (Click Sound FX - PRO Exclusive)
// =========================================================
let audioCtx = null;
function playKeySound(type = 'default') {
  if (!soundEnabled || !isPremium) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (type === 'equals') {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'clear') {
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.07);
    } else {
      osc.frequency.setValueAtTime(420, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch {
    // Audio unsupported or blocked by browser policy
  }
}

// =========================================================
// Toast Notification Utility
// =========================================================
let toastTimer = null;
function showToast(message, icon = '✨', duration = 3500) {
  if (!toast || !toastMsg || !toastIcon) return;
  toastIcon.textContent = icon;
  toastMsg.textContent = message;

  toast.classList.remove('-translate-y-12', 'opacity-0', 'pointer-events-none');
  toast.classList.add('translate-y-0', 'opacity-100');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('-translate-y-12', 'opacity-0', 'pointer-events-none');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, duration);
}

// =========================================================
// Account Status & UI Mode Management
// =========================================================
function updateAccountStatusUI() {
  if (isPremium) {
    // 👑 LIFETIME PRO MODE: Unlocks Scientific Suite, History, Memory, Sound FX
    if (userStatusBadge) {
      userStatusBadge.className = 'inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm transition-all';
      userStatusBadge.innerHTML = '<span>👑</span> <span>PRO Lifetime Active</span>';
    }

    if (premiumTriggerBtn) premiumTriggerBtn.classList.add('hidden');
    if (soundToggleBtn) soundToggleBtn.classList.remove('hidden');
    if (historyToggleBtn) historyToggleBtn.classList.remove('hidden');
    if (angleModeDisplay) {
      angleModeDisplay.classList.remove('hidden');
      angleModeDisplay.textContent = angleMode;
    }
    if (angleToggleBtn) angleToggleBtn.textContent = angleMode;

    if (proScientificSection) {
      proScientificSection.classList.remove('hidden');
    }

    if (calcContainer) {
      calcContainer.classList.remove('max-w-sm');
      calcContainer.classList.add('max-w-md');
    }

    if (quickUnlockBtn) {
      quickUnlockBtn.innerHTML = '<span>👑</span> <span>PRO Lifetime Active</span>';
      quickUnlockBtn.className = 'link-pill rounded-full px-3.5 py-1.5 text-xs font-semibold text-emerald-500 border-emerald-500/30 transition flex items-center gap-1 shadow-sm whitespace-nowrap cursor-default';
    }

    if (memoryIndicator) {
      if (memoryValue !== 0) {
        memoryIndicator.classList.remove('hidden');
      } else {
        memoryIndicator.classList.add('hidden');
      }
    }

  } else {
    // 🆓 FREE PLAN: Standard Calculator (100% Free & Unlimited basic calculations)
    if (userStatusBadge) {
      userStatusBadge.className = 'inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 shadow-sm transition-all';
      userStatusBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span><span>Free Plan</span>';
    }

    if (premiumTriggerBtn) premiumTriggerBtn.classList.remove('hidden');
    if (soundToggleBtn) soundToggleBtn.classList.add('hidden');
    if (historyToggleBtn) historyToggleBtn.classList.add('hidden');
    if (angleModeDisplay) angleModeDisplay.classList.add('hidden');
    if (memoryIndicator) memoryIndicator.classList.add('hidden');

    if (proScientificSection) {
      proScientificSection.classList.add('hidden');
    }

    if (calcContainer) {
      calcContainer.classList.remove('max-w-md');
      calcContainer.classList.add('max-w-sm');
    }

    if (quickUnlockBtn) {
      quickUnlockBtn.innerHTML = '<span>⚡</span> <span>Upgrade PRO ($5)</span>';
      quickUnlockBtn.className = 'link-pill rounded-full px-3.5 py-1.5 text-xs font-semibold text-amber-600 dark:text-[#f0b90b] border-amber-500/40 hover:bg-amber-500/10 transition flex items-center gap-1 cursor-pointer shadow-sm whitespace-nowrap';
    }
  }
}

// Reset Plan back to Free Tier
function resetPlan() {
  localStorage.removeItem(STORAGE_KEYS.IS_PREMIUM);
  localStorage.removeItem(STORAGE_KEYS.HISTORY);

  isPremium = false;
  memoryValue = 0;
  calculationHistory = [];

  clearAll();
  updateAccountStatusUI();
  renderHistoryList();
  showToast('🔄 Reset to Free Plan! Standard calculator is 100% free.', '✨', 3500);
}

// =========================================================
// Paywall Modal Management & Lifetime Unlock
// =========================================================
function openPaywallModal() {
  if (txErrorContainer) txErrorContainer.classList.add('hidden');
  if (txIdInput) {
    txIdInput.classList.remove('border-rose-500');
    txIdInput.classList.add('border-[#2e333e]');
  }
  if (paywallModal) {
    paywallModal.classList.remove('modal-hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closePaywallModal() {
  if (paywallModal) {
    paywallModal.classList.add('modal-hidden');
    document.body.style.overflow = '';
  }
}

// Validate Binance Transaction ID (18-19 digits, starts with 43+)
function validateBinanceTxId(txId) {
  const cleanTx = (txId || '').trim();
  if (!/^\d{18,19}$/.test(cleanTx)) {
    return false;
  }
  const firstTwoDigits = parseInt(cleanTx.substring(0, 2), 10);
  return firstTwoDigits >= 43;
}

// Unlock PRO Lifetime Access
function unlockPremium() {
  isPremium = true;
  localStorage.setItem(STORAGE_KEYS.IS_PREMIUM, 'true');

  updateAccountStatusUI();
  closePaywallModal();
  launchConfetti();
  showToast('🎉 PRO Lifetime Access Unlocked! Thank you for your support.', '👑', 5000);
}

// =========================================================
// Core Calculator Logic & Formatting (Free & Unlimited)
// =========================================================
function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return 'Error';
  }
  const rounded = Number.parseFloat(value.toFixed(10));
  return rounded.toString();
}

function updateDisplay() {
  if (display) {
    display.textContent = currentValue;
  }

  if (expression) {
    if (previousValue !== null && operator) {
      expression.textContent = `${formatNumber(previousValue)} ${operator}`;
    } else {
      expression.textContent = '0';
    }
  }
}

function clearAll() {
  playKeySound('clear');
  currentValue = '0';
  previousValue = null;
  operator = null;
  overwrite = false;
  updateDisplay();
}

function deleteLast() {
  playKeySound('default');
  if (overwrite || currentValue === 'Error') {
    currentValue = '0';
    overwrite = false;
  } else {
    currentValue = currentValue.slice(0, -1) || '0';
  }
  updateDisplay();
}

function appendDigit(digit) {
  playKeySound('default');
  if (currentValue === 'Error') {
    currentValue = '0';
    overwrite = false;
  }

  if (digit === '.' && currentValue.includes('.')) {
    return;
  }

  if (overwrite || (currentValue === '0' && digit !== '.')) {
    currentValue = digit;
    overwrite = false;
  } else {
    currentValue += digit;
  }

  updateDisplay();
}

function toggleSign() {
  playKeySound('default');
  if (currentValue === 'Error' || currentValue === '0') return;
  if (currentValue.startsWith('-')) {
    currentValue = currentValue.slice(1);
  } else {
    currentValue = '-' + currentValue;
  }
  updateDisplay();
}

function setOperator(nextOperator) {
  playKeySound('default');
  if (currentValue === 'Error') return;

  if (operator && !overwrite) {
    evaluateInternal();
    previousValue = Number.parseFloat(currentValue);
    operator = nextOperator;
    overwrite = true;
    updateDisplay();
    return;
  }

  previousValue = Number.parseFloat(currentValue);
  operator = nextOperator;
  overwrite = true;
  updateDisplay();
}

function applyPercent() {
  playKeySound('default');
  if (currentValue === 'Error') return;

  const numericValue = Number.parseFloat(currentValue);
  if (Number.isNaN(numericValue)) {
    currentValue = 'Error';
  } else {
    currentValue = formatNumber(numericValue / 100);
    recordHistory(`${numericValue} %`, currentValue);
  }
  overwrite = true;
  updateDisplay();
}

// Factorial calculation helper
function factorial(n) {
  if (n < 0 || !Number.isInteger(n) || n > 170) return 'Error';
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

// Scientific Single-Operand & Math Suite (PRO Only)
function executeScientificFunction(fnName) {
  if (!isPremium) {
    openPaywallModal();
    return;
  }
  playKeySound('default');

  const numericValue = Number.parseFloat(currentValue);
  if (Number.isNaN(numericValue)) {
    currentValue = 'Error';
    updateDisplay();
    return;
  }

  let result;
  let exprLabel = `${fnName}(${currentValue})`;

  // Angle conversion for Trig
  const angleRad = angleMode === 'DEG' ? (numericValue * Math.PI) / 180 : numericValue;

  switch (fnName) {
    case 'sin':
      result = Math.sin(angleRad);
      break;
    case 'cos':
      result = Math.cos(angleRad);
      break;
    case 'tan':
      result = Math.tan(angleRad);
      break;
    case 'sqrt':
      exprLabel = `√(${currentValue})`;
      result = numericValue < 0 ? 'Error' : Math.sqrt(numericValue);
      break;
    case 'sq':
      exprLabel = `(${currentValue})²`;
      result = numericValue * numericValue;
      break;
    case 'log':
      exprLabel = `log(${currentValue})`;
      result = numericValue <= 0 ? 'Error' : Math.log10(numericValue);
      break;
    case 'ln':
      exprLabel = `ln(${currentValue})`;
      result = numericValue <= 0 ? 'Error' : Math.log(numericValue);
      break;
    case 'fact':
      exprLabel = `${currentValue}!`;
      result = factorial(numericValue);
      break;
    case 'inv':
      exprLabel = `1/(${currentValue})`;
      result = numericValue === 0 ? 'Error' : 1 / numericValue;
      break;
    default:
      result = numericValue;
  }

  if (expression) {
    expression.textContent = exprLabel;
  }

  const formatted = typeof result === 'string' ? result : formatNumber(result);
  currentValue = formatted;
  overwrite = true;
  updateDisplay();

  if (formatted !== 'Error') {
    recordHistory(exprLabel, formatted);
  }
}

// Insert Constant (π, e - PRO Only)
function insertConstant(constType) {
  if (!isPremium) {
    openPaywallModal();
    return;
  }
  playKeySound('default');

  if (constType === 'pi') {
    currentValue = formatNumber(Math.PI);
  } else if (constType === 'e') {
    currentValue = formatNumber(Math.E);
  }
  overwrite = true;
  updateDisplay();
}

// Memory Functions (MC, MR, M+, M- - PRO Only)
function handleMemory(fn) {
  if (!isPremium) {
    openPaywallModal();
    return;
  }
  playKeySound('default');

  const currentNum = Number.parseFloat(currentValue) || 0;

  switch (fn) {
    case 'mc':
      memoryValue = 0;
      showToast('Memory Cleared (MC)', '🧹', 2000);
      break;
    case 'mr':
      currentValue = formatNumber(memoryValue);
      overwrite = true;
      updateDisplay();
      showToast(`Recalled from Memory: ${formatNumber(memoryValue)}`, '💾', 2000);
      break;
    case 'm-plus':
      memoryValue += currentNum;
      showToast(`Added to Memory: ${formatNumber(memoryValue)}`, '➕', 2000);
      break;
    case 'm-minus':
      memoryValue -= currentNum;
      showToast(`Subtracted from Memory: ${formatNumber(memoryValue)}`, '➖', 2000);
      break;
  }

  updateAccountStatusUI();
}

// Angle Mode Toggle (DEG / RAD - PRO Only)
function toggleAngleMode() {
  if (!isPremium) return;
  playKeySound('default');

  angleMode = angleMode === 'DEG' ? 'RAD' : 'DEG';
  localStorage.setItem(STORAGE_KEYS.ANGLE_MODE, angleMode);
  updateAccountStatusUI();
  showToast(`Angle Mode set to ${angleMode}`, '📐', 2000);
}

// Calculation History Logger (PRO Only)
function recordHistory(calcExpr, calcResult) {
  if (!isPremium || calcResult === 'Error') return;

  const entry = {
    id: Date.now(),
    expr: calcExpr,
    result: calcResult,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  calculationHistory.unshift(entry);
  if (calculationHistory.length > 30) calculationHistory.pop();

  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(calculationHistory));
  renderHistoryList();
}

function renderHistoryList() {
  if (!historyListContainer) return;
  if (calculationHistory.length === 0) {
    historyListContainer.innerHTML = '<p class="text-xs text-zinc-500 text-center py-8">No calculations recorded yet.</p>';
    return;
  }

  historyListContainer.innerHTML = calculationHistory.map(item => `
    <div class="bg-[#0f1217] hover:bg-[#1a1f29] p-3 rounded-xl border border-zinc-800 transition cursor-pointer flex items-center justify-between history-item"
         data-value="${item.result}">
      <div>
        <div class="text-[11px] text-zinc-400 font-mono">${item.expr}</div>
        <div class="text-sm font-bold text-white font-mono mt-0.5">${item.result}</div>
      </div>
      <span class="text-[10px] text-zinc-500 font-mono">${item.time}</span>
    </div>
  `).join('');

  if (typeof historyListContainer.querySelectorAll === 'function') {
    historyListContainer.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const val = item.dataset.value;
        if (val) {
          currentValue = val;
          overwrite = true;
          updateDisplay();
          closeHistoryModal();
          showToast(`Loaded ${val} into calculator`, '📋', 2000);
        }
      });
    });
  }
}

// Internal Evaluation Logic (Always free & unrestricted)
function evaluateInternal() {
  if (!operator || previousValue === null) {
    return;
  }

  const left = previousValue;
  const right = Number.parseFloat(currentValue);

  if (Number.isNaN(left) || Number.isNaN(right)) {
    currentValue = 'Error';
  } else {
    let result;
    switch (operator) {
      case '+':
        result = left + right;
        break;
      case '-':
        result = left - right;
        break;
      case '*':
        result = left * right;
        break;
      case '/':
        result = right === 0 ? 'Error' : left / right;
        break;
      case '^':
        result = Math.pow(left, right);
        break;
      default:
        result = right;
    }

    const calcExpr = `${formatNumber(left)} ${operator} ${formatNumber(right)}`;
    if (expression) {
      expression.textContent = `${calcExpr} =`;
    }

    currentValue = typeof result === 'string' ? result : formatNumber(result);

    if (currentValue !== 'Error') {
      recordHistory(calcExpr, currentValue);
    }
  }

  previousValue = null;
  operator = null;
  overwrite = true;
  updateDisplay();
}

function evaluate() {
  playKeySound('equals');
  evaluateInternal();
}

// Copy Display Result to Clipboard
function copyDisplayResult() {
  if (!currentValue || currentValue === 'Error') return;
  navigator.clipboard.writeText(currentValue).then(() => {
    showToast(`📋 Copied "${currentValue}" to clipboard!`, '✓', 2500);
  }).catch(() => {
    showToast(`Display: ${currentValue}`, '📋', 2500);
  });
}

// =========================================================
// Sound Toggle & Theme Toggle
// =========================================================
function toggleSound() {
  if (!isPremium) return;
  soundEnabled = !soundEnabled;
  localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, soundEnabled ? 'true' : 'false');
  if (soundIcon) soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
  showToast(`Audio FX ${soundEnabled ? 'Enabled' : 'Muted'}`, soundEnabled ? '🔊' : '🔇', 2000);
}

function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  const isDark = savedTheme === 'dark' || savedTheme === null; // Dark mode by default
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }
  if (themeToggle) {
    themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  }
}

function toggleTheme() {
  const isDark = !document.documentElement.classList.contains('dark');
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }
  localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
  if (themeToggle) {
    themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  }
}

// =========================================================
// Binance Pay & Copy Code Helper
// =========================================================
function copyPayCode() {
  const codeElem = document.getElementById('payCodeText');
  const code = codeElem ? codeElem.textContent.trim() : '512867796';

  navigator.clipboard.writeText(code).then(() => {
    if (copyBtnLabel) copyBtnLabel.textContent = 'Copied! ✓';
    if (copyPayCodeBtn) copyPayCodeBtn.classList.add('bg-emerald-600', 'text-white');
    showToast(`📋 Binance Pay Code copied: ${code}`, '✓');

    setTimeout(() => {
      if (copyBtnLabel) copyBtnLabel.textContent = 'Copy';
      if (copyPayCodeBtn) copyPayCodeBtn.classList.remove('bg-emerald-600', 'text-white');
    }, 2000);
  }).catch(() => {
    showToast(`Binance Pay Code: ${code}`, '📋');
  });
}

// History Modal Controls (PRO Only)
function openHistoryModal() {
  if (!isPremium) {
    openPaywallModal();
    return;
  }
  renderHistoryList();
  if (historyModal) {
    historyModal.classList.remove('modal-hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeHistoryModal() {
  if (historyModal) {
    historyModal.classList.add('modal-hidden');
    document.body.style.overflow = '';
  }
}

// =========================================================
// Support Modal Functions
// =========================================================
function openSupportModal() {
  if (supportModal) {
    supportModal.classList.remove('modal-hidden');
    document.body.style.overflow = 'hidden';

    const enteredTx = txIdInput ? txIdInput.value.trim() : '';
    if (enteredTx && supportMessage && !supportMessage.value) {
      supportMessage.value = `Hello Support,\n\nI need help verifying my Binance Transaction ID: ${enteredTx}\nPlease verify and help me unlock PRO lifetime access.`;
    }
  }
}

function closeSupportModal() {
  if (supportModal) {
    supportModal.classList.add('modal-hidden');
    if (paywallModal && !paywallModal.classList.contains('modal-hidden')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
}

async function handleSupportSubmit(e) {
  e.preventDefault();
  const name = supportName ? supportName.value.trim() : '';
  const email = supportEmail ? supportEmail.value.trim() : '';
  const subject = supportSubject && supportSubject.value.trim() ? supportSubject.value.trim() : 'Calculator Binance Pay Support Request';
  const message = supportMessage ? supportMessage.value.trim() : '';

  if (!name || !email || !message) {
    showToast('⚠️ Please fill in all required fields.', '❗', 3000);
    return;
  }

  const sendBtn = document.getElementById('sendSupportMsgBtn');
  const btnText = document.getElementById('sendSupportBtnText');
  const targetEmail = 'ashikbsngal@gmail.com';

  if (sendBtn) sendBtn.disabled = true;
  if (btnText) btnText.textContent = 'Sending Message...';

  try {
    await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        _subject: `[Calculator Support] ${subject} from ${name}`,
        message: message,
        _captcha: 'false'
      })
    });

    closeSupportModal();
    showToast(`✅ Message sent directly to support! We will reply soon.`, '📩', 5000);
    if (supportForm) supportForm.reset();
  } catch {
    // Fallback to mailto
    const emailSubject = `[Support] ${subject} - from ${name}`;
    const emailBody = `Sender Name: ${name}\nSender Email: ${email}\n\nMessage:\n${message}\n\nSent from Calculator Web App`;
    const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoUrl, '_blank');

    closeSupportModal();
    showToast('✉️ Prepared email draft in your email client!', '📬', 5000);
    if (supportForm) supportForm.reset();
  } finally {
    if (sendBtn) sendBtn.disabled = false;
    if (btnText) btnText.textContent = 'Send Message to Support';
  }
}

// =========================================================
// Confetti Animation Effect
// =========================================================
function launchConfetti() {
  if (!confettiCanvas || typeof confettiCanvas.getContext !== 'function') return;
  const ctx = confettiCanvas.getContext('2d');
  if (!ctx) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#f0b90b', '#fcd535', '#10b981', '#38bdf8', '#a855f7', '#ffffff'];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 + 50,
      r: Math.random() * 6 + 3,
      d: Math.random() * 90,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.8) * 16,
      gravity: 0.35,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    });
  }

  let animationFrame;

  function render() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotationSpeed;

      if (p.y < confettiCanvas.height + 50) {
        alive = true;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.5);
      ctx.restore();
    });

    if (alive) {
      animationFrame = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  render();
}

// =========================================================
// Keypad & Event Listeners
// =========================================================
buttons.forEach((button) => {
  const action = button.dataset.action;
  const value = button.dataset.value;
  const fn = button.dataset.fn;

  if (action === 'clear') {
    button.addEventListener('click', clearAll);
  } else if (action === 'delete') {
    button.addEventListener('click', deleteLast);
  } else if (action === 'percent') {
    button.addEventListener('click', applyPercent);
  } else if (action === 'toggle-sign') {
    button.addEventListener('click', toggleSign);
  } else if (action === 'scientific') {
    if (fn === 'pow') {
      button.addEventListener('click', () => {
        if (!isPremium) {
          openPaywallModal();
        } else {
          setOperator('^');
        }
      });
    } else if (fn) {
      button.addEventListener('click', () => executeScientificFunction(fn));
    }
  } else if (action === 'constant') {
    button.addEventListener('click', () => insertConstant(value));
  } else if (action === 'memory') {
    button.addEventListener('click', () => handleMemory(fn));
  } else if (action === 'operator') {
    button.addEventListener('click', () => setOperator(value));
  } else if (action === 'equals') {
    button.addEventListener('click', evaluate);
  } else if (value !== undefined) {
    button.addEventListener('click', () => appendDigit(value));
  }
});

// UI Event Listeners
if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
if (soundToggleBtn) soundToggleBtn.addEventListener('click', toggleSound);
if (historyToggleBtn) historyToggleBtn.addEventListener('click', openHistoryModal);
if (closeHistoryModalBtn) closeHistoryModalBtn.addEventListener('click', closeHistoryModal);
if (angleToggleBtn) angleToggleBtn.addEventListener('click', toggleAngleMode);
if (copyResultBtn) copyResultBtn.addEventListener('click', copyDisplayResult);

if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener('click', () => {
    calculationHistory = [];
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    renderHistoryList();
    showToast('History cleared', '🧹', 2000);
  });
}

if (closeModalBtn) closeModalBtn.addEventListener('click', closePaywallModal);

if (paywallModal) {
  paywallModal.addEventListener('click', (e) => {
    if (e.target === paywallModal) {
      closePaywallModal();
    }
  });
}

if (historyModal) {
  historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) {
      closeHistoryModal();
    }
  });
}

if (copyPayCodeBtn) copyPayCodeBtn.addEventListener('click', copyPayCode);

if (txIdInput) {
  txIdInput.addEventListener('input', () => {
    if (txErrorContainer) txErrorContainer.classList.add('hidden');
    txIdInput.classList.remove('border-rose-500');
    txIdInput.classList.add('border-[#2e333e]');
  });
}

if (verifyPayBtn) {
  verifyPayBtn.addEventListener('click', () => {
    const txVal = txIdInput ? txIdInput.value.trim() : '';
    const isValid = validateBinanceTxId(txVal);

    if (!isValid) {
      if (txErrorContainer) {
        txErrorContainer.classList.remove('hidden');
      }
      if (txIdInput) {
        txIdInput.classList.add('border-rose-500');
        txIdInput.classList.remove('border-[#2e333e]');
        txIdInput.focus();
      }
      showToast('⚠️ Invalid Binance Transaction ID (starts with 43, 18-19 digits)', '❌', 3500);
      return;
    }

    if (txErrorContainer) txErrorContainer.classList.add('hidden');
    if (txIdInput) {
      txIdInput.classList.remove('border-rose-500');
      txIdInput.classList.add('border-[#2e333e]');
    }

    unlockPremium();
  });
}

if (premiumTriggerBtn) {
  premiumTriggerBtn.addEventListener('click', () => openPaywallModal());
}

if (quickUnlockBtn) {
  quickUnlockBtn.addEventListener('click', () => {
    if (isPremium) {
      showToast('👑 Lifetime PRO is active!', '✨');
    } else {
      openPaywallModal();
    }
  });
}

if (resetTrialBtn) {
  resetTrialBtn.addEventListener('click', resetPlan);
}

// Support Modal Listeners
if (openSupportModalBtn) openSupportModalBtn.addEventListener('click', openSupportModal);
if (openSupportFromErrorBtn) openSupportFromErrorBtn.addEventListener('click', openSupportModal);
if (closeSupportModalBtn) closeSupportModalBtn.addEventListener('click', closeSupportModal);

if (supportModal) {
  supportModal.addEventListener('click', (e) => {
    if (e.target === supportModal) {
      closeSupportModal();
    }
  });
}

if (supportForm) supportForm.addEventListener('submit', handleSupportSubmit);

// Keyboard Support
window.addEventListener('keydown', (e) => {
  if (
    (paywallModal && !paywallModal.classList.contains('modal-hidden')) ||
    (historyModal && !historyModal.classList.contains('modal-hidden')) ||
    (supportModal && !supportModal.classList.contains('modal-hidden')) ||
    ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
  ) {
    if (e.key === 'Escape') {
      closePaywallModal();
      closeHistoryModal();
      closeSupportModal();
    }
    return;
  }

  if (e.key >= '0' && e.key <= '9') {
    appendDigit(e.key);
  } else if (e.key === '.') {
    appendDigit('.');
  } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
    setOperator(e.key);
  } else if (e.key === '^') {
    if (isPremium) {
      setOperator('^');
    } else {
      openPaywallModal();
    }
  } else if (e.key === '%') {
    applyPercent();
  } else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    evaluate();
  } else if (e.key === 'Backspace') {
    deleteLast();
  } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
    clearAll();
  }
});

// Window resize handler for confetti canvas
window.addEventListener('resize', () => {
  if (confettiCanvas) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
});

// Initialization
initTheme();
updateAccountStatusUI();
updateDisplay();
renderHistoryList();
