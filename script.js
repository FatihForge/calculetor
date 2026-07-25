const display = document.getElementById('display');
const expression = document.getElementById('expression');
const themeToggle = document.getElementById('themeToggle');
const buttons = document.querySelectorAll('button');

let currentValue = '0';
let previousValue = null;
let operator = null;
let overwrite = false;

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

function applyPercent() {
  const numericValue = Number.parseFloat(currentValue);
  if (Number.isNaN(numericValue)) {
    currentValue = 'Error';
  } else {
    currentValue = formatNumber(numericValue / 100);
  }
  overwrite = true;
  updateDisplay();
}

function applyLog() {
  const numericValue = Number.parseFloat(currentValue);
  if (Number.isNaN(numericValue) || numericValue <= 0) {
    currentValue = 'Error';
  } else {
    currentValue = formatNumber(Math.log10(numericValue));
  }
  overwrite = true;
  updateDisplay();
}

function setOperator(nextOperator) {
  if (operator && !overwrite) {
    evaluate();
  }

  previousValue = Number.parseFloat(currentValue);
  operator = nextOperator;
  overwrite = true;
  updateDisplay();
}

function evaluate() {
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

function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

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

themeToggle.addEventListener('click', toggleTheme);
updateDisplay();
