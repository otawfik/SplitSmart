
import React, { useState, useCallback, useMemo } from 'react';
import ReceiptPane from './components/ReceiptPane';
import ChatPane from './components/ChatPane';
import { 
  ReceiptData, 
  ParsingStatus, 
  Assignment, 
  ChatMessage, 
  PersonTotal 
} from './types';
import { parseReceiptImage, parseChatCommand } from './services/geminiService';
import { calculateTotals } from './utils/calculations';

const App: React.FC = () => {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [status, setStatus] = useState<ParsingStatus>(ParsingStatus.IDLE);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessingChat, setIsProcessingChat] = useState(false);

  const totals: PersonTotal[] = useMemo(() => {
    if (!receipt) return [];
    return calculateTotals(receipt, assignments);
  }, [receipt, assignments]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus(ParsingStatus.PARSING);
    setMessages(prev => [...prev, { role: 'model', text: "Got the image! Let me scan that receipt for you..." }]);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const data = await parseReceiptImage(base64);
          setReceipt(data);
          setStatus(ParsingStatus.SUCCESS);
          setMessages(prev => [...prev, { 
            role: 'model', 
            text: `Parsed ${data.items.length} items. Total is ${data.currency}${data.total.toFixed(2)}. Who had what?` 
          }]);
        } catch (err) {
          console.error(err);
          setStatus(ParsingStatus.ERROR);
          setMessages(prev => [...prev, { role: 'model', text: "Sorry, I couldn't read that receipt. Could you try a clearer photo?" }]);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setStatus(ParsingStatus.ERROR);
    }
  };

  const handleChatCommand = async (text: string) => {
    if (!receipt) {
      setMessages(prev => [
        ...prev, 
        { role: 'user', text },
        { role: 'model', text: "Please upload a receipt first so I know what we're splitting!" }
      ]);
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsProcessingChat(true);

    try {
      const result = await parseChatCommand(text, receipt.items);
      
      // Update assignments
      setAssignments(prev => {
        const next = [...prev];
        result.assignments.forEach(newAsgn => {
          newAsgn.items.forEach(itemId => {
            const existing = next.find(a => a.itemId === itemId);
            if (existing) {
              if (!existing.assignedTo.includes(newAsgn.person)) {
                existing.assignedTo.push(newAsgn.person);
              }
            } else {
              next.push({ itemId, assignedTo: [newAsgn.person] });
            }
          });
        });
        return next;
      });

      setMessages(prev => [...prev, { role: 'model', text: "Got it! I've updated the split." }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "I didn't quite catch that. Could you rephrase?" }]);
    } finally {
      setIsProcessingChat(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden">
      {/* Mobile Header / Upload Trigger */}
      <div className="md:hidden p-4 bg-white border-b border-slate-200 flex justify-between items-center z-50">
        <h1 className="text-xl font-bold text-blue-600">SplitSmart AI</h1>
        <label className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer">
          Scan Receipt
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      {/* Main Split Screen */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden h-full">
        {/* Left Side: Receipt (Hide on mobile if not parsed yet, or show stacked) */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0">
          <div className="h-full relative">
             <ReceiptPane 
                receipt={receipt} 
                status={status} 
                assignments={assignments}
              />
              
              {/* Desktop Upload Button (Floating) */}
              <div className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2">
                 <label className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl cursor-pointer hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    {receipt ? 'Scan Another' : 'Scan Receipt'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                 </label>
              </div>
          </div>
        </div>

        {/* Right Side: Chat */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full">
          <ChatPane 
            messages={messages} 
            onSendMessage={handleChatCommand} 
            totals={totals}
            isProcessing={isProcessingChat}
            currency={receipt?.currency || '$'}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
