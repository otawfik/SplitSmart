
import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

export const parseReceiptImage = async (base64Image: string): Promise<ReceiptData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: "Extract the items, prices, tax, and tip from this receipt. Return ONLY a JSON object matching this schema: { items: [{ name: string, price: number }], tax: number, tip: number, subtotal: number, total: number, currency: string }. Use UUID-like strings for item IDs if possible, or I will generate them."
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
  
  // Post-process to add IDs
  return {
    ...rawJson,
    items: rawJson.items.map((item: any, idx: number) => ({
      ...item,
      id: `item-${idx}-${Date.now()}`
    }))
  };
};

export const parseChatCommand = async (
  message: string, 
  receiptItems: { id: string; name: string }[]
): Promise<{ assignments: { person: string, items: string[] }[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    The user is splitting a bill. Here are the items on the receipt:
    ${receiptItems.map(i => `- "${i.name}" (ID: ${i.id})`).join('\n')}

    User command: "${message}"

    Determine which person(s) had which item(s).
    A user might say: "Dhruv had the nachos" or "Sarah and Sue shared the pizza".
    Return ONLY a JSON object: { assignments: [{ person: string, items: [string] }] } where items is an array of IDs from the list provided above.
    If multiple people share an item, list that item for each person.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
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
                items: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || '{"assignments": []}');
};
