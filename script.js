// DOM Elements - Calculator
const display = document.getElementById('display');
const expression = document.getElementById('expression');
const themeToggle = document.getElementById('themeToggle');
const buttons = document.querySelectorAll('button');

// DOM Elements - Paywall & Status
const userStatusBadge = document.getElementById('userStatusBadge');
const badgeText = document.getElementById('badgeText');
const premiumTriggerBtn = document.getElementById('premiumTriggerBtn');
const paywallModal = document.getElementById('paywallModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const copyPayCodeBtn = document.getElementById('copyPayCodeBtn');
const copyBtnLabel = document.getElementById('copyBtnLabel');
const verifyPayBtn = document.getElementById('verifyPayBtn');
const txIdInput = document.getElementById('txIdInput');
const resetTrialBtn = document.getElementById('resetTrialBtn');
const quickUnlockBtn = document.getElementById('quickUnlockBtn');

// DOM Elements - Toast & Confetti
const toast = document.getElementById('toast');
const toastIcon = document.getElementById('toastIcon');
const toastMsg = document.getElementById('toastMsg');
const confettiCanvas = document.getElementById('confettiCanvas');

// State Variables
let currentValue = '0';
let previousValue = null;
let operator = null;
let overwrite = false;

// Monetization State (Persisted in localStorage)
const STORAGE_KEYS = {
  USAGE_COUNT: 'calc_usage_count',
  IS_PREMIUM: 'calc_is_premium'
};

let usageCount = parseInt(localStorage.getItem(STORAGE_KEYS.USAGE_COUNT) || '0', 10);
let isPremium = localStorage.getItem(STORAGE_KEYS.IS_PREMIUM) === 'true';
let pendingCalculation = null;

// Toast Notification Helper
let toastTimer = null;
function showToast(message, icon = '✨', duration = 3500) {
  if (!toast) return;
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

// Update UI Status Badge
function updateAccountStatusUI() {
  if (isPremium) {
    userStatusBadge.className = 'inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-[#f0b90b]/15 text-[#f0b90b] border border-[#f0b90b]/30 shadow-sm';
    userStatusBadge.innerHTML = '<span>👑</span> <span>PRO Lifetime</span>';
    if (premiumTriggerBtn) premiumTriggerBtn.classList.add('hidden');
  } else if (usageCount === 0) {
    userStatusBadge.className = 'inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    userStatusBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span><span>1 Free Use Left</span>';
    if (premiumTriggerBtn) premiumTriggerBtn.classList.add('hidden');
  } else {
    userStatusBadge.className = 'inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30';
    userStatusBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span><span>Free Limit Reached</span>';
    if (premiumTriggerBtn) premiumTriggerBtn.classList.remove('hidden');
  }
}

// Paywall Modal Controls
function openPaywallModal(pendingAction = null) {
  if (pendingAction) {
    pendingCalculation = pendingAction;
  }
  paywallModal.classList.remove('modal-hidden');
  document.body.style.overflow = 'hidden';
}

function closePaywallModal() {
  paywallModal.classList.add('modal-hidden');
  document.body.style.overflow = '';
}

// Unlock Premium Access
function unlockPremium(isManualVerification = true) {
  isPremium = true;
  localStorage.setItem(STORAGE_KEYS.IS_PREMIUM, 'true');
  updateAccountStatusUI();
  closePaywallModal();

  // Trigger celebration effects
  launchConfetti();
  showToast('🎉 Premium Unlocked ($20)! Enjoy Unlimited Calculations.', '💎', 4000);

  // Execute and reveal pending calculation if any
  if (pendingCalculation && typeof pendingCalculation === 'function') {
    const actionToRun = pendingCalculation;
    pendingCalculation = null;
    actionToRun();
  }
}

// Format calculation display number
function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return 'Error';
  }
  const rounded = Number.parseFloat(value.toFixed(10));
  return rounded.toString();
}

function updateDisplay() {
  display.textContent = currentValue;

  if (previousValue !== null && operator) {
    expression.textContent = `${formatNumber(previousValue)} ${operator}`;
  } else {
    expression.textContent = '0';
  }
}

function clearAll() {
  currentValue = '0';
  previousValue = null;
  operator = null;
  overwrite = false;
  pendingCalculation = null;
  updateDisplay();
}

function appendDigit(digit) {
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

function deleteLast() {
  if (overwrite) {
    currentValue = '0';
    overwrite = false;
  } else {
    currentValue = currentValue.slice(0, -1) || '0';
  }

  updateDisplay();
}

// Core Verification Gate before computing and showing results
function checkResultAccess(computeCallback) {
  if (isPremium) {
    computeCallback();
    return;
  }

  if (usageCount < 1) {
    // 1st calculation is FREE!
    computeCallback();
    usageCount = 1;
    localStorage.setItem(STORAGE_KEYS.USAGE_COUNT, '1');
    updateAccountStatusUI();
    showToast('✨ 1st free calculation completed! Next calculations require $20 PRO.', '💡', 4000);
  } else {
    // 2nd calculation onwards: Trigger $20 Binance Pay Paywall Modal
    openPaywallModal(computeCallback);
    showToast('🔒 Upgrade to $20 Premium to view calculation results.', '⚡', 3500);
  }
}

function applyPercent() {
  checkResultAccess(() => {
    const numericValue = Number.parseFloat(currentValue);
    if (Number.isNaN(numericValue)) {
      currentValue = 'Error';
    } else {
      currentValue = formatNumber(numericValue / 100);
    }
    overwrite = true;
    updateDisplay();
  });
}

function applyLog() {
  checkResultAccess(() => {
    const numericValue = Number.parseFloat(currentValue);
    if (Number.isNaN(numericValue) || numericValue <= 0) {
      currentValue = 'Error';
    } else {
      currentValue = formatNumber(Math.log10(numericValue));
    }
    overwrite = true;
    updateDisplay();
  });
}

function setOperator(nextOperator) {
  if (operator && !overwrite) {
    // In chained calculations like 5 + 5 +, we compute the previous operation
    checkResultAccess(() => {
      evaluateInternal();
      previousValue = Number.parseFloat(currentValue);
      operator = nextOperator;
      overwrite = true;
      updateDisplay();
    });
    return;
  }

  previousValue = Number.parseFloat(currentValue);
  operator = nextOperator;
  overwrite = true;
  updateDisplay();
}

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

    currentValue = typeof result === 'string' ? result : formatNumber(result);
  }

  previousValue = null;
  operator = null;
  overwrite = true;
  updateDisplay();
}

function evaluate() {
  if (!operator || previousValue === null) {
    return;
  }
  checkResultAccess(evaluateInternal);
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

// Reset Free Trial Helper for Testing
function resetTrial() {
  localStorage.removeItem(STORAGE_KEYS.USAGE_COUNT);
  localStorage.removeItem(STORAGE_KEYS.IS_PREMIUM);
  usageCount = 0;
  isPremium = false;
  pendingCalculation = null;
  clearAll();
  updateAccountStatusUI();
  showToast('🔄 Free trial reset! 1st calculation is free again.', 'ℹ️');
}

// Interactive Copy Binance Pay Code
function copyPayCode() {
  const code = 'FNCU';
  navigator.clipboard.writeText(code).then(() => {
    copyBtnLabel.textContent = 'Copied! ✓';
    copyPayCodeBtn.classList.add('bg-emerald-600', 'text-white');
    showToast('📋 Binance Pay Code copied: FNCU', '✓');

    setTimeout(() => {
      copyBtnLabel.textContent = 'Copy';
      copyPayCodeBtn.classList.remove('bg-emerald-600', 'text-white');
    }, 2000);
  }).catch(() => {
    showToast('Binance Pay Code: FNCU', '📋');
  });
}

// Lightweight Confetti Particle Animation
function launchConfetti() {
  if (!confettiCanvas) return;
  const ctx = confettiCanvas.getContext('2d');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#f0b90b', '#fcd535', '#10b981', '#6366f1', '#ec4899', '#ffffff'];

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
  let alpha = 1;

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

// Event Listeners - Calculator Keypad
buttons.forEach((button) => {
  const action = button.dataset.action;
  const value = button.dataset.value;

  if (action === 'clear') {
    button.addEventListener('click', clearAll);
  } else if (action === 'delete') {
    button.addEventListener('click', deleteLast);
  } else if (action === 'percent') {
    button.addEventListener('click', applyPercent);
  } else if (action === 'log') {
    button.addEventListener('click', applyLog);
  } else if (action === 'operator') {
    button.addEventListener('click', () => setOperator(value));
  } else if (action === 'equals') {
    button.addEventListener('click', evaluate);
  } else if (value !== undefined) {
    button.addEventListener('click', () => appendDigit(value));
  }
});

// Event Listeners - UI Controls
themeToggle.addEventListener('click', toggleTheme);

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', closePaywallModal);
}

if (paywallModal) {
  paywallModal.addEventListener('click', (e) => {
    if (e.target === paywallModal) {
      closePaywallModal();
    }
  });
}

if (copyPayCodeBtn) {
  copyPayCodeBtn.addEventListener('click', copyPayCode);
}

if (verifyPayBtn) {
  verifyPayBtn.addEventListener('click', () => {
    const txVal = txIdInput ? txIdInput.value.trim() : '';
    unlockPremium(true);
  });
}

if (premiumTriggerBtn) {
  premiumTriggerBtn.addEventListener('click', () => openPaywallModal(null));
}

if (resetTrialBtn) {
  resetTrialBtn.addEventListener('click', resetTrial);
}

if (quickUnlockBtn) {
  quickUnlockBtn.addEventListener('click', () => unlockPremium(false));
}

// Window resize adjust confetti canvas
window.addEventListener('resize', () => {
  if (confettiCanvas) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
});

// Initialization
updateAccountStatusUI();
updateDisplay();

