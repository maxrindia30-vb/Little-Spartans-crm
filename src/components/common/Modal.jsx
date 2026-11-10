import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = "max-w-xl" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172B5070] backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`w-full ${maxWidth} bg-white rounded-2xl shadow-dropdown border border-[#172B501A] overflow-hidden flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#172B5015] bg-[#FFF4E8]">
          <div>
            <h3 className="text-base font-extrabold text-[#172B50] tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#172B50] opacity-75 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#172B50] hover:bg-white hover:text-[#F4510B] transition-colors"
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
}
