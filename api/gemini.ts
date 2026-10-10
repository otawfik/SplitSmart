import { GoogleGenAI } from "@google/genai";

// Gemini runs here, server-side, so the API key never ships to the browser.
// Only the models this app actually uses are allowed through.
const MODELS = new Set(["gemini-2.5-flash-image", "gemini-3-pro-preview"]);
const MAX_BODY = 6_000_000;

export async function POST(request: Request): Promise<Response> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "GEMINI_API_KEY is not configured on the server." }, { status: 503 });

  const raw = await request.text();
  if (raw.length > MAX_BODY) return Response.json({ error: "Request too large." }, { status: 413 });
  let body: { model?: string; contents?: unknown; config?: Record<string, unknown> };
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!body.model || !MODELS.has(body.model)) return Response.json({ error: "Model not allowed." }, { status: 400 });

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await ai.models.generateContent({ model: body.model, contents: body.contents as any, config: body.config as any });
    return Response.json({ text: res.text ?? "", candidates: res.candidates ?? [] });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Gemini request failed." }, { status: 502 });
  }
}
