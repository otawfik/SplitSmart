# SplitSmart AI 🧾✨

SplitSmart AI is a modern, intelligent web application designed to take the headache out of splitting group bills. By leveraging advanced Vision AI and Natural Language Processing, it transforms a simple photo of a receipt into a shared digital ledger.

## 🚀 Overview

Tired of manually typing in every item from a long dinner receipt? SplitSmart AI does the heavy lifting for you. Simply upload a photo, and our AI engine parses every line item, tax, and tip. Once parsed, you can assign items to friends using simple chat commands like "Alice had the burger" or "Bob and I shared the nachos."

## ✨ Key Features

- **AI Vision OCR**: Automatically extracts items and prices from receipt images with high accuracy.
- **Natural Language Assignment**: A "Smart Chat" interface that understands human instructions for splitting costs.
- **Proportional Splitting**: Automatically calculates tax and tip shares based on the items each person ordered.
- **Split-Screen UI**: A beautiful, responsive interface that keeps the receipt and the split summary visible at all times.
- **Real-time Totals**: See exactly how much everyone owes as you assign items.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Intelligence**: Gemini Pro Vision (via Google GenAI SDK) for receipt parsing and intent recognition.
- **Styling**: Modern, minimalist aesthetic using the Inter and JetBrains Mono typefaces.

## 📦 Getting Started

### Prerequisites

- Node.js installed on your machine.
- A valid API Key for the GenAI service.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/splitsmart-ai.git
   cd splitsmart-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment:
   - Create a `.env` file in the root directory.
   - Add your API key: `API_KEY=your_actual_key_here`

4. Start the development server:
   ```bash
   npm run dev
   ```

## 💡 Usage Tips

- **Clear Photos**: For best results, ensure the receipt is well-lit and flat.
- **Multi-Assignments**: You can say "The wine was shared by everyone" to split a single item across all participants.
- **Corrections**: If an item is assigned wrongly, just tell the chat: "Remove the coffee from Sarah."

---
*Developed with a focus on seamless UX and AI-driven efficiency.*
