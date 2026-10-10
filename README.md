# SplitSmart

[![build](https://github.com/otawfik/SplitSmart/actions/workflows/ci.yml/badge.svg)](https://github.com/otawfik/SplitSmart/actions/workflows/ci.yml)

**Split a group bill by photographing the receipt and saying who had what.**

Snap the receipt and Gemini's vision model reads every line item, the tax, the tip and the
total. Then type it the way you'd say it — *"Alice had the salad"*, *"everyone shared the
nachos"*, *"move the beer from Alex to Sam"* — and the assignments update live, with tax and
tip distributed in proportion to what each person actually ordered.

## How it works

1. **Scan.** The receipt photo goes to `gemini-2.5-flash-image` with a JSON response schema
   (items, tax, tip, subtotal, total, currency), so the result is structured data rather than
   text to be parsed.
2. **Chat.** Each message goes to `gemini-3-pro-preview` together with the receipt's item IDs
   and the people so far, and comes back as structured `add` / `remove` / `clear` assignments.
3. **Settle.** Per-person totals are computed locally (`utils/calculations.ts`): each person's
   share of tax and tip is proportional to their share of the subtotal.

**The API key never reaches the browser.** All Gemini calls go through one server function,
`api/gemini.ts`, which holds `GEMINI_API_KEY`, accepts only the two models above, and caps
request size. The browser talks to `/api/gemini` (`services/geminiClient.ts`).

## Run locally

```bash
npm install
echo "GEMINI_API_KEY=your-key" > .env.local   # never committed — .gitignore covers it
npm run dev                                    # http://localhost:3000
```

In development, Vite answers `/api/gemini` with the same server function, so there's nothing
else to run.

## Deploy

Deploys to Vercel as-is: the Vite app is built as static files and `api/gemini.ts` becomes a
serverless function. Set `GEMINI_API_KEY` in the project's environment variables. Because the
endpoint is public, give the key a quota or budget limit in Google AI Studio.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · Google Gemini API (`@google/genai`) · Vercel
Functions
