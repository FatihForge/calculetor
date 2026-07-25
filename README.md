# Minimalist Web Calculator

A clean, modern, and minimalist web-based calculator built entirely with core web technologies. This project focuses on a flat design aesthetic, simple user experience, and robust mathematical logic without relying on heavy frameworks or dangerous functions like `eval()`.

## 🚀 Features

*   **Core Arithmetic:** Addition, subtraction, multiplication, and division.
*   **Advanced Math Functions:** Percentage (`%`), Base-10 Logarithm (`log`), and Exponentiation (`^`).
*   **Minimalist UI:** Designed with a sleek, flat aesthetic using Tailwind CSS (Zinc/Slate color palettes) for an uncluttered experience.
*   **Smart Display:** A two-tier screen showing both the current input and the previous operand/operator for better context.
*   **Robust Error Handling:** Safely handles edge cases like division by zero, invalid logarithm operations (e.g., log of $\le 0$), and prevents multiple decimal points.
*   **Responsive Design:** Fully fluid and usable on both desktop and mobile devices.
*   **Quick Links:** Integrated pill-shaped buttons to navigate to the source GitHub repository and other portfolio projects.

## 🛠️ Tech Stack

*   **HTML5:** Semantic page structure.
*   **Tailwind CSS (via CDN):** Rapid, utility-first styling focusing on Grid/Flexbox layouts and minimalist color scales.
*   **Vanilla JavaScript (ES6+):** Pure DOM manipulation and calculation logic utilizing the native `Math` object.

## 📂 File Structure

```text
/
├── index.html        # Main structure, Tailwind CDN, and external links
├── script.js         # Calculator logic and event listeners
└── README.md         # Project documentation