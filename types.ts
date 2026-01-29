
export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
}

export interface ReceiptData {
  items: ReceiptItem[];
  tax: number;
  tip: number;
  subtotal: number;
  total: number;
  currency: string;
}

export interface Assignment {
  itemId: string;
  assignedTo: string[]; // List of person names
}

export interface PersonTotal {
  name: string;
  subtotal: number;
  taxShare: number;
  tipShare: number;
  total: number;
  items: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum ParsingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PARSING = 'PARSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
