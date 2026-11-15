import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = "max-w-xl" }) {
  if (!isOpen) return null;

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B0C]/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
    >
      <div 
        className={`w-full ${maxWidth} my-auto bg-[#F4F7F6] text-[#080B0C] rounded-2xl shadow-dropdown border border-[#493548]/30 overflow-hidden flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#493548]/20 bg-[#F4F7F6]">
          <div>
            <h3 className="text-base font-extrabold text-[#080B0C] tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#493548] mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#493548] hover:bg-[#55CDB3]/20 hover:text-[#080B0C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-4">
          {children}
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
