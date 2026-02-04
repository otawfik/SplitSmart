
import React from 'react';
import { ReceiptData, ParsingStatus, Assignment } from '../types';

interface ReceiptPaneProps {
  receipt: ReceiptData | null;
  status: ParsingStatus;
  assignments: Assignment[];
}

const ReceiptPane: React.FC<ReceiptPaneProps> = ({ receipt, status, assignments }) => {
  const getAssignees = (itemId: string) => {
    return assignments.find(a => a.itemId === itemId)?.assignedTo || [];
  };

  const isUnassigned = (itemId: string) => getAssignees(itemId).length === 0;

  return (
    <div className="flex flex-col h-full bg-slate-100/50 border-r border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-lg shadow-sm">
            🧾
          </div>
          <div className="flex flex-col">
            <span>Receipt View</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
              {status === ParsingStatus.SUCCESS ? 'Ready to Split' : 'Waiting for Input'}
            </span>
          </div>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
        {status === ParsingStatus.PARSING && (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Digitizing receipt...</p>
          </div>
        )}

        {status === ParsingStatus.IDLE && (
          <div className="flex flex-col items-center justify-center h-full opacity-30 select-none">
             <div className="text-8xl mb-6">📸</div>
             <p className="text-slate-500 text-center max-w-[200px] leading-relaxed font-medium">
               Snap a photo of your receipt to start splitting.
             </p>
          </div>
        )}

        {receipt && status === ParsingStatus.SUCCESS && (
          <div className="w-full max-w-md bg-white shadow-2xl rounded-sm p-8 pb-12 relative overflow-hidden receipt-font">
            {/* Thermal Receipt Paper Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
            
            {/* Receipt Header */}
            <div className="text-center mb-10 border-b border-slate-200 pb-6">
              <div className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">SplitSmart AI</div>
              <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Digital Audit • {new Date().toLocaleDateString()}</div>
            </div>

            {/* Items */}
            <div className="space-y-6">
              {receipt.items.map((item) => {
                const assigned = getAssignees(item.id);
                return (
                  <div key={item.id} className={`group transition-opacity ${isUnassigned(item.id) ? 'opacity-100' : 'opacity-80'}`}>
                    <div className="flex justify-between items-baseline gap-2">
                      <div className="flex flex-col flex-1">
                        <span className={`text-sm font-bold ${isUnassigned(item.id) ? 'text-slate-800' : 'text-slate-500 line-through'}`}>
                          {item.name.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {receipt.currency || '$'}{item.price.toFixed(2)}
                      </span>
                    </div>
                    
                    {assigned.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {assigned.map((p, i) => (
                          <span key={i} className="text-[9px] px-2 py-0.5 bg-slate-900 text-white rounded font-sans uppercase font-black tracking-wider">
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></div>
                        <span className="text-[9px] text-red-500 font-sans uppercase font-bold tracking-tight">Needs Assignment</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Totals Section */}
            <div className="mt-12 pt-6 border-t-4 border-double border-slate-900 space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>SUBTOTAL</span>
                <span>{receipt.currency}{receipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>TAX</span>
                <span>{receipt.currency}{receipt.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>TIP / GRATUITY</span>
                <span>{receipt.currency}{receipt.tip.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-slate-900 pt-4 border-t border-slate-200">
                <span>TOTAL</span>
                <span>{receipt.currency}{receipt.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Receipt Footer Decorative Element */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-white" style={{ 
              clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' 
            }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptPane;
