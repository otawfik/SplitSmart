
import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData } from "../types";

// For vision tasks (receipt parsing), flash is excellent and fast.
const VISION_MODEL = 'gemini-2.5-flash-image';
// For complex reasoning (chat parsing), pro is better.
const CHAT_MODEL = 'gemini-3-pro-preview';

export const parseReceiptImage = async (base64Image: string): Promise<ReceiptData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: VISION_MODEL,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: "Extract all items from this receipt. Include item name, quantity (if visible, otherwise 1), and unit price or total price for that line. Also extract Tax, Tip/Gratuity, Subtotal, and the Grand Total. Identify the currency symbol. Return ONLY valid JSON."
        }
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                price: { type: Type.NUMBER }
              },
              required: ["name", "price"]
            }
          },
          tax: { type: Type.NUMBER },
          tip: { type: Type.NUMBER },
          subtotal: { type: Type.NUMBER },
          total: { type: Type.NUMBER },
          currency: { type: Type.STRING }
        },
        required: ["items", "tax", "tip", "total"]
      }
    }
  });

  const rawJson = JSON.parse(response.text || '{}');
  
  return {
    ...rawJson,
    items: (rawJson.items || []).map((item: any, idx: number) => ({
      ...item,
      id: `item-${idx}-${Date.now()}`
    }))
  };
};

export const parseChatCommand = async (
  message: string, 
  receiptItems: { id: string; name: string }[],
  currentPeople: string[]
): Promise<{ 
  assignments: { person: string, items: string[], action: 'add' | 'remove' | 'clear' }[] 
}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Context: A user is splitting a restaurant bill. 
    Current people involved: ${currentPeople.join(', ') || 'None yet'}.
    Items on receipt:
    ${receiptItems.map(i => `- "${i.name}" (ID: ${i.id})`).join('\n')}

    User command: "${message}"

    Goal: Translate the user's natural language into structured assignments.
    Actions:
    - 'add': Assign item(s) to person(s). 
    - 'remove': Unassign item(s) from person(s).
    - 'clear': Remove all assignments for a specific person.

    Special cases:
    - "Everyone" or "Shared" means assign to all currently known people.
    - If a new name is mentioned, add it to the list.

    Return ONLY a JSON object: { assignments: [{ person: string, items: [string], action: 'add'|'remove'|'clear' }] }
    Use the IDs provided for items.
  `;

  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          assignments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                person: { type: Type.STRING },
                items: { type: Type.ARRAY, items: { type: Type.STRING } },
                action: { type: Type.STRING, enum: ['add', 'remove', 'clear'] }
              },
              required: ["person", "items", "action"]
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || '{"assignments": []}');
};
