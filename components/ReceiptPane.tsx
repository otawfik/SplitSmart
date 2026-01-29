
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

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
            🧾
          </span>
          Receipt Details
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {status === ParsingStatus.SUCCESS ? 'Scanned successfully' : 'Upload a receipt to start'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {status === ParsingStatus.PARSING && (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Analyzing Receipt...</p>
          </div>
        )}

        {status === ParsingStatus.IDLE && (
          <div className="flex flex-col items-center justify-center h-full opacity-40 grayscale">
             <span className="text-6xl mb-4">📸</span>
             <p className="text-slate-500 text-center">Your parsed items will appear here</p>
          </div>
        )}

        {receipt && status === ParsingStatus.SUCCESS && (
          <div className="receipt-font text-sm space-y-4">
            <div className="space-y-3">
              {receipt.items.map((item) => {
                const assigned = getAssignees(item.id);
                return (
                  <div key={item.id} className="group">
                    <div className="flex justify-between items-baseline border-b border-dashed border-slate-200 pb-1">
                      <span className="text-slate-800 font-medium">{item.name}</span>
                      <span className="text-slate-600">{receipt.currency || '$'}{item.price.toFixed(2)}</span>
                    </div>
                    {assigned.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {assigned.map((p, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-sans uppercase font-bold tracking-tighter">
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-sans italic">Unassigned</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-4 border-t-2 border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{receipt.currency}{receipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax</span>
                <span>{receipt.currency}{receipt.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tip</span>
                <span>{receipt.currency}{receipt.tip.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2">
                <span>Total</span>
                <span>{receipt.currency}{receipt.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptPane;
