import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useCrm();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 bg-[#F4F7F6] border-2 border-[#55CDB3] rounded-2xl shadow-dropdown animate-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#55CDB3] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[#080B0C]" />
            </div>
            <p className="text-xs font-bold text-[#080B0C] leading-snug">{t.message}</p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="p-1 rounded-lg text-[#493548] hover:bg-[#55CDB3]/20 shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
