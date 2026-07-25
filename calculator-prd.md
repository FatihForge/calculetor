# Product Requirements Document (PRD): Web-Based Calculator

## 1. Overview
The goal is to build a fully functional, standard calculator web application. The application must run entirely in the browser using HTML5, JavaScript, and Tailwind CSS (via CDN) for styling. 

## 2. Tech Stack
*   **HTML5:** Semantic structure.
*   **Tailwind CSS (CDN):** All styling, utilizing utility classes for layout (Grid/Flexbox), spacing, and typography.
*   **Vanilla JavaScript (ES6+):** DOM manipulation and calculator logic.

## 3. UI / UX Design Requirements
The interface must feature a strictly **minimalist and simple aesthetic**. 
*   **Color Palette:** Use neutral, sophisticated tones (e.g., Tailwind's `zinc` or `slate` scale). The background should be a subtle off-white or dark gray, with buttons in flat, slightly contrasting shades. 
*   **Layout:** 
    *   A perfectly centered calculator container using Flexbox (`flex items-center justify-center min-h-screen`).
    *   The keypad must use a uniform CSS Grid. Because of the new advanced math buttons, a 4-column or 5-column grid should be utilized.
*   **Display:** A two-tier display screen at the top. 
    *   **Upper tier:** Shows the previous operand and the chosen operator (smaller text, muted color like `text-zinc-400`).
    *   **Lower tier:** Shows the current operand (larger text, prominent color like `text-zinc-800` or `text-zinc-100` if dark mode).
*   **Styling Elements:**
    *   Clean lines, flat design, and absolutely no heavy drop-shadows or complex gradients.
    *   Ample padding and whitespace within the calculator and buttons to maintain an uncluttered look.
    *   Subtle hover and active states (`hover:bg-zinc-200`, `active:scale-95`) for buttons to provide tactile user feedback.
*   **External Links:** Below the calculator, include two minimalist, pill-shaped buttons centered on the page:
    *   "GitHub Repo" (redirects to the repository).
    *   "Other Projects" (redirects to a portfolio or other projects link).
*   **Responsiveness:** Use Tailwind's responsive prefixes (like `md:`, `sm:`) to ensure it scales down cleanly for mobile screens.

## 4. Functional Requirements
### Core Calculator Operations
*   **Addition (`+`)**, **Subtraction (`-`)**, **Multiplication (`*`)**, **Division (`/`)**.
*   **Equals (`=`)**: Computes the result.

### Advanced Math Features
*   **Percentage (`%`):** Calculates the percentage of the current operand.
*   **Logarithm (`log`):** Calculates the base-10 logarithm of the current number.
*   **Exponentiation (`^`):** Calculates the power of a number (e.g., x^y).

### Additional Controls
*   **All Clear (AC):** Clears the entire display and resets the calculator's internal state.
*   **Delete (DEL):** Removes the last typed character from the current operand.
*   **Decimal (`.`):** Allows for floating-point numbers. (Logic must prevent multiple decimals in a single number).

### Logic Constraints
*   The calculator should handle long numbers gracefully (e.g., limit display length or scale font size down).
*   Prevent division by zero and undefined log operations (e.g., log of <= 0). Display an "Error" message.
*   **Do not use the dangerous `eval()` function** in JavaScript; rely on a structured switch/case or the native `Math` object (e.g., `Math.log10()`, `Math.pow()`) for operations.

## 5. File Structure
The project should be divided into two distinct files for clean architecture:
*   `index.html` (Includes the structural HTML and Tailwind CDN script `<script src="https://cdn.tailwindcss.com"></script>`).
*   `script.js` (Handles the logic).

---

## How to use this with GitHub Copilot

Copy and paste the PRD above into your Copilot chat, then ask it to generate the files step-by-step using these prompts:

1.  **Prompt 1:** *"I want to build this calculator. Based on the PRD above, please generate the complete `index.html` file. Ensure you use the Tailwind CSS CDN, strictly apply the minimal `zinc` or `slate` color palette for a flat design, include the external link buttons at the bottom, and link to `script.js`."*
2.  **Prompt 2:** *"Now, generate the `script.js` file to handle all the math logic and DOM updates. Make sure to implement the new %, log, and ^ features using the `Math` object, avoid `eval()`, and handle edge cases like multiple decimals and division by zero."*
