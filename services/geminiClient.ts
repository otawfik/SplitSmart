// Browser side of the Gemini proxy: the same call shape as ai.models.generateContent,
// but it goes through /api/gemini so the API key stays on the server.
export interface GenerateParams {
  model: string;
  contents: unknown;
  config?: Record<string, unknown>;
}
export interface GenerateResult {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  candidates: any[];
}

export async function generateContent(params: GenerateParams): Promise<GenerateResult> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Gemini request failed (${res.status})`);
  return data as GenerateResult;
}
