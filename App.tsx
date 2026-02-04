
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

  const currentPeople = useMemo(() => {
    const people = new Set<string>();
    assignments.forEach(a => a.assignedTo.forEach(p => people.add(p)));
    return Array.from(people);
  }, [assignments]);

  const totals: PersonTotal[] = useMemo(() => {
    if (!receipt) return [];
    return calculateTotals(receipt, assignments);
  }, [receipt, assignments]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus(ParsingStatus.PARSING);
    setMessages([{ role: 'model', text: "Analyzing your receipt... One moment." }]);

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
            text: `Perfect. Found ${data.items.length} items. Total: ${data.currency}${data.total.toFixed(2)}. Who's paying for what?` 
          }]);
        } catch (err) {
          console.error(err);
          setStatus(ParsingStatus.ERROR);
          setMessages(prev => [...prev, { role: 'model', text: "I couldn't read that clearly. Can you upload a sharper photo?" }]);
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
        { role: 'model', text: "Upload a receipt first, and then tell me who had what!" }
      ]);
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsProcessingChat(true);

    try {
      const result = await parseChatCommand(text, receipt.items, currentPeople);
      
      setAssignments(prev => {
        let next = [...prev];
        result.assignments.forEach(change => {
          change.items.forEach(itemId => {
            let existingIdx = next.findIndex(a => a.itemId === itemId);
            
            if (change.action === 'add') {
              if (existingIdx !== -1) {
                const updated = { ...next[existingIdx] };
                if (!updated.assignedTo.includes(change.person)) {
                  updated.assignedTo = [...updated.assignedTo, change.person];
                  next[existingIdx] = updated;
                }
              } else {
                next.push({ itemId, assignedTo: [change.person] });
              }
            } else if (change.action === 'remove') {
              if (existingIdx !== -1) {
                const updated = { ...next[existingIdx] };
                updated.assignedTo = updated.assignedTo.filter(p => p !== change.person);
                if (updated.assignedTo.length === 0) {
                  next.splice(existingIdx, 1);
                } else {
                  next[existingIdx] = updated;
                }
              }
            } else if (change.action === 'clear') {
              // Remove this person from EVERY item
              next = next.map(a => ({
                ...a,
                assignedTo: a.assignedTo.filter(p => p !== change.person)
              })).filter(a => a.assignedTo.length > 0);
            }
          });
        });
        return next;
      });

      setMessages(prev => [...prev, { role: 'model', text: "Updated the totals for you." }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I missed that. Try something like 'Sarah had the fries'." }]);
    } finally {
      setIsProcessingChat(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Header */}
      <div className="md:hidden p-4 bg-white border-b border-slate-200 flex justify-between items-center z-50 shadow-sm">
        <h1 className="text-xl font-black text-slate-900 tracking-tighter">SplitSmart<span className="text-blue-600">.AI</span></h1>
        <label className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer shadow-lg active:scale-95 transition-all">
          Scan
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden h-full">
        {/* Left Side: Receipt */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 relative group">
           <ReceiptPane 
              receipt={receipt} 
              status={status} 
              assignments={assignments}
            />
            
            {/* Desktop Upload Button */}
            <div className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
               <label className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl cursor-pointer hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 border border-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  {receipt ? 'New Scan' : 'Scan Receipt'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
               </label>
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
