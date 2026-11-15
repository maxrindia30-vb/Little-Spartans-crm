import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

const PIPELINE_STEPS = [
  { id: 'new', label: 'New Enquiry', short: 'Enquiry', desc: 'Inbound leads & walk-ins' },
  { id: 'followup', label: 'Follow-up', short: 'Follow-up', desc: 'Call / WhatsApp outreach' },
  { id: 'interested', label: 'Interested', short: 'Interested', desc: 'Parent expressed interest' },
  { id: 'enroll', label: 'Enroll Student', short: 'Book Demo', desc: 'Trial class scheduling' },
  { id: 'created', label: 'Student Created', short: 'Profile Created', desc: 'Athlete profile generated' },
  { id: 'parent_linked', label: 'Parent Linked/Created', short: 'Parent Linked', desc: 'Guardian account sync' },
  { id: 'enrolled', label: 'Enrolled', short: 'Enrolled', desc: 'Verified admission' },
];

export default function AdmissionPipelineStepper({ activeStep = 'enrolled', onStepClick, className = '' }) {
  const { data, setCurrentView } = useCrm();

  const enquiriesCount = (data.enquiries || []).length;
  const demosCount = (data.demos || []).length;
  const studentsCount = (data.students || []).length;

  const getStepCount = (index) => {
    switch (index) {
      case 0: return enquiriesCount;
      case 1: return (data.enquiries || []).filter(e => e.stage === 'Follow-up').length;
      case 2: return (data.enquiries || []).filter(e => e.stage === 'Interested').length;
      case 3: return demosCount;
      case 4: return (data.demos || []).filter(d => d.status === 'Completed').length;
      case 5: return (data.students || []).filter(s => s.parentName).length;
      case 6: return studentsCount;
      default: return 0;
    }
  };

  return (
    <div
      className={`bg-white/95 backdrop-blur-md rounded-[22px] px-4 py-3.5 border border-[#172B5014] shadow-xs flex flex-wrap items-center justify-between gap-3 transition-all ${className}`}
    >
      {/* Title / Badge */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F4510B] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F4510B]"></span>
        </span>
        <span className="text-[11px] font-black uppercase text-[#F4510B] tracking-wider select-none">
          ADMISSION PIPELINE:
        </span>
      </div>

      {/* Stepper Steps */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-1 min-w-0">
        {PIPELINE_STEPS.map((step, idx) => {
          const count = getStepCount(idx);
          const isLast = idx === PIPELINE_STEPS.length - 1;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => {
                  if (onStepClick) {
                    onStepClick(step.id);
                  } else {
                    if (idx <= 2) setCurrentView('enquiries');
                    else if (idx === 3) setCurrentView('demos');
                    else setCurrentView('people');
                  }
                }}
                title={step.desc}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5012] hover:bg-[#F4510B] hover:text-white hover:border-[#F4510B] hover:shadow-sm active:scale-95 transition-all cursor-pointer select-none"
              >
                <span className="text-[#172B50]/60 group-hover:text-white/80 text-[10px] font-black">
                  {idx + 1}.
                </span>
                <span>{step.label}</span>
                {count !== null && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[9.5px] font-black bg-white/80 group-hover:bg-white group-hover:text-[#F4510B] text-[#172B50]/70 border border-[#172B5010]">
                    {count}
                  </span>
                )}
              </button>

              {!isLast && (
                <ArrowRight className="w-3.5 h-3.5 text-[#F4510B] shrink-0 opacity-80" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Conversion summary pill on the right */}
      <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-[#172B5012] shrink-0 text-[11px] font-bold text-[#172B50]">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Automated Ingestion</span>
      </div>
    </div>
  );
}
