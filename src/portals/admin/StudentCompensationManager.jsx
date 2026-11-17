import React, { useState, useMemo } from 'react';
import {
  Users,
  Download,
  Plus,
  Calendar,
  CalendarDays,
  FileText,
  Check,
  Clock,
  ChevronRight,
  Layers,
  History,
  MapPin,
  Search,
  ChevronDown,
  CalendarX,
  AlertCircle,
  Eye,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { getCommonLocations } from '../../services/locationService';
import { 
  COMPENSATION_STATUSES, 
  COMPENSATION_REASONS,
  validateReplacementSlot,
  formatReplacementSlotLabel
} from '../../services/compensationService';
import Modal from '../../components/common/Modal';

export default function StudentCompensationManager() {
  const { 
    data, 
    submitCompensationRequest, 
    updateCompensationRequest, 
    addToast,
    checkScheduleConflictLive 
  } = useCrm();

  const activeLocations = getCommonLocations(data);
  const todayYmd = new Date().toISOString().split('T')[0];

  // Active Tab: 'absent_students' | 'requests' | 'allotments' | 'history'
  const [activeTab, setActiveTab] = useState('absent_students');

  // Filter States
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('All');
  const [searchAthlete, setSearchAthlete] = useState('');

  // Allotment Modal State
  const [isAllotModalOpen, setIsAllotModalOpen] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState('');
  const [targetAbsenceDate, setTargetAbsenceDate] = useState('');
  const [targetRequestId, setTargetRequestId] = useState('');
  const [allotLocation, setAllotLocation] = useState(activeLocations[0]?.name || 'KK NAGAR');
  const [allotProgram, setAllotProgram] = useState((data.programs || [])[0]?.name || '');
  const [allotBatchId, setAllotBatchId] = useState('');
  const [allotDate, setAllotDate] = useState(todayYmd);
  const [allotStartTime, setAllotStartTime] = useState('16:00');
  const [allotEndTime, setAllotEndTime] = useState('17:00');
  const [allotCoachId, setAllotCoachId] = useState((data.coaches || [])[0]?.id || '');
  const [allotNotes, setAllotNotes] = useState('');

  // Detail Modal for Requests
  const [viewRequest, setViewRequest] = useState(null);

  // Rejection Prompt Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Policy limit exceeded / Unable to accommodate');

  // 1. DATA SOURCE A: Absent Students from attendance records
  // Rule: Students marked as Absent automatically appear here
  const absentRecords = useMemo(() => {
    const records = (data.attendanceRecords || []).filter(r => r.status === 'Absent');
    return records.map(rec => {
      const student = (data.students || []).find(s => s.id === rec.studentId) || {
        id: rec.studentId,
        name: rec.studentName,
        parentName: 'Parent on file',
        program: rec.program,
        center: rec.location
      };
      const parent = (data.parents || []).find(p => p.id === student.parentId) || {
        name: student.parentName || 'Parent on file'
      };
      const existingRequest = (data.compensationRequests || []).find(
        req => req.studentId === rec.studentId && req.missedDate === rec.date
      );
      return {
        id: rec.id,
        studentId: student.id,
        studentName: student.name,
        parentName: parent.name || student.parentName || 'Parent on file',
        program: student.program || rec.program || 'Junior Athletics',
        location: student.center || rec.location,
        batchId: rec.batchId,
        batchName: rec.batchName || 'Training Session',
        absenceDate: rec.date,
        markedBy: rec.markedBy || 'Coach',
        existingRequest
      };
    });
  }, [data.attendanceRecords, data.students, data.parents, data.compensationRequests]);

  // Filtered Absent Students
  const filteredAbsentStudents = useMemo(() => {
    return absentRecords.filter(rec => {
      if (selectedLocation !== 'All' && rec.location !== selectedLocation) return false;
      if (selectedDate && rec.absenceDate !== selectedDate) return false;
      if (selectedBatchId !== 'All' && rec.batchId !== selectedBatchId) return false;
      if (searchAthlete.trim()) {
        const q = searchAthlete.toLowerCase();
        const matches = 
          rec.studentName.toLowerCase().includes(q) ||
          rec.studentId.toLowerCase().includes(q) ||
          rec.parentName.toLowerCase().includes(q) ||
          rec.program.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [absentRecords, selectedLocation, selectedDate, selectedBatchId, searchAthlete]);

  // 2. DATA SOURCE B: Compensation Requests
  const compensationRequests = useMemo(() => {
    return (data.compensationRequests || []).filter(req => {
      if (selectedLocation !== 'All' && (req.center !== selectedLocation && req.location !== selectedLocation)) return false;
      if (selectedDate && req.missedDate !== selectedDate) return false;
      if (selectedBatchId !== 'All' && req.batchId !== selectedBatchId) return false;
      if (searchAthlete.trim()) {
        const q = searchAthlete.toLowerCase();
        const matches = 
          (req.studentName || '').toLowerCase().includes(q) ||
          (req.studentId || '').toLowerCase().includes(q) ||
          (req.parentName || '').toLowerCase().includes(q) ||
          (req.id || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [data.compensationRequests, selectedLocation, selectedDate, selectedBatchId, searchAthlete]);

  // 3. DATA SOURCE C: Allotments (Scheduled / Allotted classes)
  const allotmentsList = useMemo(() => {
    return (data.compensationRequests || []).filter(req => {
      const isAllotted = req.status === 'Scheduled' || Boolean(req.replacementDate);
      if (!isAllotted) return false;
      if (selectedLocation !== 'All' && (req.replacementLocation || req.center || req.location) !== selectedLocation) return false;
      if (selectedDate && (req.replacementDate !== selectedDate && req.missedDate !== selectedDate)) return false;
      if (selectedBatchId !== 'All' && req.replacementBatchId !== selectedBatchId) return false;
      if (searchAthlete.trim()) {
        const q = searchAthlete.toLowerCase();
        const matches = 
          (req.studentName || '').toLowerCase().includes(q) ||
          (req.replacementCoach || '').toLowerCase().includes(q) ||
          (req.id || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [data.compensationRequests, selectedLocation, selectedDate, selectedBatchId, searchAthlete]);

  // 4. DATA SOURCE D: Complete History / Audit Trail
  const historyList = useMemo(() => {
    return (data.compensationHistory || []).filter(item => {
      if (selectedLocation !== 'All' && item.location && item.location !== selectedLocation) return false;
      if (selectedDate && item.date && item.date !== selectedDate) return false;
      if (searchAthlete.trim()) {
        const q = searchAthlete.toLowerCase();
        const matches = 
          (item.studentName || '').toLowerCase().includes(q) ||
          (item.studentId || '').toLowerCase().includes(q) ||
          (item.type || '').toLowerCase().includes(q) ||
          (item.details || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [data.compensationHistory, selectedLocation, selectedDate, searchAthlete]);

  // Open Allotment modal for a specific student & absence
  const handleOpenAllotModal = (studentId = '', absenceDate = '', requestId = '') => {
    const student = (data.students || []).find(s => s.id === studentId);
    setTargetStudentId(studentId);
    setTargetAbsenceDate(absenceDate);
    setTargetRequestId(requestId);
    setAllotLocation(student?.center || activeLocations[0]?.name || 'KK NAGAR');
    setAllotProgram(student?.program || (data.programs || [])[0]?.name || '');
    setAllotDate(todayYmd);
    setAllotStartTime('16:00');
    setAllotEndTime('17:00');
    setAllotCoachId((data.coaches || [])[0]?.id || '');
    setAllotNotes(`Compensation allotment for missed class on ${absenceDate || 'scheduled session'}.`);
    setConfirmStep(false);
    setIsAllotModalOpen(true);
  };

  // Validate & Proceed to Confirmation in Allotment Modal
  const handleProceedToConfirm = (e) => {
    e.preventDefault();
    if (!targetStudentId) {
      addToast('Please select a student for compensation allotment.', 'error');
      return;
    }
    if (!targetAbsenceDate) {
      addToast('Original absence date is required.', 'error');
      return;
    }
    if (!allotDate || !allotStartTime || !allotEndTime) {
      addToast('Replacement date and time range are required.', 'error');
      return;
    }

    const coachObj = (data.coaches || []).find(c => c.id === allotCoachId);
    const slotCheck = validateReplacementSlot({
      replacementDate: allotDate,
      replacementStartTime: allotStartTime,
      replacementEndTime: allotEndTime,
      replacementLocation: allotLocation,
      replacementCoachId: allotCoachId,
      replacementCoachName: coachObj?.name || 'Assigned Coach',
      classSchedules: data.classSchedules || []
    });

    if (!slotCheck.valid) {
      addToast(slotCheck.message, 'error');
      return;
    }

    // Pass live conflict check
    const liveConflict = checkScheduleConflictLive({
      location: allotLocation,
      coachId: allotCoachId,
      date: allotDate,
      startTime: allotStartTime,
      endTime: allotEndTime
    });

    if (liveConflict?.hasConflict) {
      addToast(liveConflict.message || 'Schedule conflict detected for the selected coach/slot.', 'error');
      return;
    }

    setConfirmStep(true);
  };

  // Confirm and Save Allotment
  const handleConfirmSaveAllotment = () => {
    const student = (data.students || []).find(s => s.id === targetStudentId);
    const coachObj = (data.coaches || []).find(c => c.id === allotCoachId);
    const batchObj = (data.classes || []).find(c => c.id === allotBatchId);
    const replacementBatchName = batchObj?.name || `${allotProgram} (Compensation)`;

    const slotLabel = formatReplacementSlotLabel({
      replacementDate: allotDate,
      replacementStartTime: allotStartTime,
      replacementEndTime: allotEndTime,
      replacementLocation: allotLocation
    });

    // If an existing compensation request exists, update it
    if (targetRequestId) {
      updateCompensationRequest(targetRequestId, {
        status: 'Scheduled',
        replacementDate: allotDate,
        replacementStartTime: allotStartTime,
        replacementEndTime: allotEndTime,
        replacementLocation: allotLocation,
        replacementProgram: allotProgram,
        replacementBatchId: allotBatchId,
        replacementBatch: replacementBatchName,
        replacementCoachId: allotCoachId,
        replacementCoach: coachObj?.name || 'Assigned Coach',
        replacementSlot: slotLabel,
        approvalNotes: allotNotes || `Allotted on ${allotDate} at ${slotLabel}`,
        reviewedBy: 'Admin Vikramaditya'
      });
    } else {
      // Create a manual approved/scheduled request directly
      const reqRes = submitCompensationRequest({
        studentId: targetStudentId,
        studentName: student?.name || 'Student',
        parentId: student?.parentId,
        parentName: student?.parentName,
        center: allotLocation,
        program: allotProgram,
        missedClass: `${allotProgram} Session`,
        missedDate: targetAbsenceDate,
        reasonCategory: 'Personal Reason',
        explanation: 'Admin direct compensation allotment',
        initialStatus: 'Scheduled',
        adminNotes: allotNotes || 'Directly allotted by Admin',
        requestSource: 'Admin'
      });

      if (reqRes?.success && reqRes.request?.id) {
        updateCompensationRequest(reqRes.request.id, {
          status: 'Scheduled',
          replacementDate: allotDate,
          replacementStartTime: allotStartTime,
          replacementEndTime: allotEndTime,
          replacementLocation: allotLocation,
          replacementProgram: allotProgram,
          replacementBatchId: allotBatchId,
          replacementBatch: replacementBatchName,
          replacementCoachId: allotCoachId,
          replacementCoach: coachObj?.name || 'Assigned Coach',
          replacementSlot: slotLabel,
          approvalNotes: allotNotes
        });
      }
    }

    setIsAllotModalOpen(false);
    setConfirmStep(false);
    addToast(`Compensation class confirmed and allotted for ${student?.name || 'student'} on ${allotDate}.`, 'success');
  };

  // Reject Request
  const handleConfirmReject = () => {
    if (!rejectingRequestId) return;
    updateCompensationRequest(rejectingRequestId, {
      status: 'Rejected',
      approvalNotes: rejectionReason,
      reviewedBy: 'Admin Vikramaditya'
    });
    setRejectModalOpen(false);
    setRejectingRequestId('');
    addToast('Compensation request rejected.', 'info');
  };

  // Export Data for active tab
  const handleExportData = () => {
    let headers = [];
    let rows = [];
    let fileName = `student_compensation_${activeTab}_${todayYmd}.csv`;

    if (activeTab === 'absent_students') {
      headers = ['KID ID', 'KID NAME', 'PARENT NAME', 'PROGRAM', 'LOCATION', 'ABSENCE DATE', 'STATUS'];
      rows = filteredAbsentStudents.map(r => [
        `"${r.studentId}"`,
        `"${r.studentName}"`,
        `"${r.parentName}"`,
        `"${r.program}"`,
        `"${r.location}"`,
        `"${r.absenceDate}"`,
        `"${r.existingRequest ? r.existingRequest.status : 'Pending Allotment'}"`
      ]);
    } else if (activeTab === 'requests') {
      headers = ['REQUEST ID', 'STUDENT ID', 'STUDENT NAME', 'PARENT NAME', 'LOCATION', 'MISSED DATE', 'STATUS', 'REASON'];
      rows = compensationRequests.map(r => [
        `"${r.id}"`,
        `"${r.studentId}"`,
        `"${r.studentName}"`,
        `"${r.parentName}"`,
        `"${r.center || r.location}"`,
        `"${r.missedDate}"`,
        `"${r.status}"`,
        `"${r.reason || ''}"`
      ]);
    } else if (activeTab === 'allotments') {
      headers = ['ALLOTMENT ID', 'STUDENT NAME', 'ORIGINAL DATE', 'REPLACEMENT DATE', 'SLOT', 'LOCATION', 'COACH', 'STATUS'];
      rows = allotmentsList.map(r => [
        `"${r.id}"`,
        `"${r.studentName}"`,
        `"${r.missedDate}"`,
        `"${r.replacementDate}"`,
        `"${r.replacementSlot || ''}"`,
        `"${r.replacementLocation || r.center}"`,
        `"${r.replacementCoach || ''}"`,
        `"${r.status}"`
      ]);
    } else {
      headers = ['TIMESTAMP', 'EVENT TYPE', 'STUDENT NAME', 'DETAILS', 'ACTOR', 'ROLE', 'STATUS'];
      rows = historyList.map(h => [
        `"${h.timestamp}"`,
        `"${h.type}"`,
        `"${h.studentName || ''}"`,
        `"${h.details || ''}"`,
        `"${h.actor || ''}"`,
        `"${h.role || ''}"`,
        `"${h.status || ''}"`
      ]);
    }

    if (rows.length === 0) {
      addToast('No records to export for this view.', 'error');
      return;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Exported ${rows.length} record(s) to CSV.`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ======================================================== */}
      {/* 1. MAIN CARD: Student Compensation & Filter Controls      */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B501A] shadow-xs space-y-5">
        {/* Header Row: Title + Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0 border border-[#F4510B20]">
              <Users className="w-5 h-5 text-[#F4510B]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">
                Student Compensation
              </h2>
              <p className="text-xs text-[#172B50] opacity-75 mt-0.5">
                Manage absences, compensation requests and replacement class allotments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* Export Data Button */}
            <button
              type="button"
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#FFF4E8] text-[#F4510B] hover:bg-[#FFE8D6] transition-all border border-[#F4510B25] shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#F4510B]" />
              <span>Export Data</span>
            </button>

            {/* + Allot Compensation Button */}
            <button
              type="button"
              onClick={() => handleOpenAllotModal()}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#F4510B] text-white hover:bg-[#E04505] transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ Allot Compensation</span>
            </button>
          </div>
        </div>

        {/* 4 Summary / KPI Nav Cards (matching Image 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Absent Students */}
          <button
            type="button"
            onClick={() => setActiveTab('absent_students')}
            className={`p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left border ${
              activeTab === 'absent_students'
                ? 'bg-[#FFF4E8] border-[#F4510B] shadow-xs ring-1 ring-[#F4510B]'
                : 'bg-[#FFF4E8]/60 border-[#F4510B20] hover:bg-[#FFF4E8]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/90 text-[#F4510B] flex items-center justify-center border border-[#F4510B30] shrink-0">
                <CalendarX className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <span className="text-xs font-black text-[#172B50] block">Absent Students</span>
                <span className="text-[11px] font-bold text-[#F4510B]">{absentRecords.length} pending</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#172B50]/50" />
          </button>

          {/* Card 2: Compensation Requests */}
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left border ${
              activeTab === 'requests'
                ? 'bg-[#EFF6FF] border-blue-500 shadow-xs ring-1 ring-blue-500'
                : 'bg-[#EFF6FF]/60 border-blue-200 hover:bg-[#EFF6FF]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/90 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="text-xs font-black text-[#172B50] block">Compensation Requests</span>
                <span className="text-[11px] font-bold text-blue-600">
                  {compensationRequests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length} awaiting review
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#172B50]/50" />
          </button>

          {/* Card 3: Allotments */}
          <button
            type="button"
            onClick={() => setActiveTab('allotments')}
            className={`p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left border ${
              activeTab === 'allotments'
                ? 'bg-[#ECFDF5] border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                : 'bg-[#ECFDF5]/60 border-emerald-200 hover:bg-[#ECFDF5]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/90 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-xs font-black text-[#172B50] block">Allotments</span>
                <span className="text-[11px] font-bold text-emerald-600">{allotmentsList.length} scheduled</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#172B50]/50" />
          </button>

          {/* Card 4: History */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left border ${
              activeTab === 'history'
                ? 'bg-[#FAF5FF] border-purple-500 shadow-xs ring-1 ring-purple-500'
                : 'bg-[#FAF5FF]/60 border-purple-200 hover:bg-[#FAF5FF]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/90 text-purple-600 flex items-center justify-center border border-purple-200 shrink-0">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <span className="text-xs font-black text-[#172B50] block">History</span>
                <span className="text-[11px] font-bold text-purple-600">{historyList.length} logs recorded</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#172B50]/50" />
          </button>
        </div>

        {/* Subtab Pill Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          <div className="inline-flex items-center bg-[#F4F6F9] p-1 rounded-full border border-[#172B5010] gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('absent_students')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'absent_students'
                  ? 'bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30] shadow-2xs'
                  : 'text-[#172B50] hover:text-[#F4510B]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Absent Students</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30] shadow-2xs'
                  : 'text-[#172B50] hover:text-[#F4510B]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Requests</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('allotments')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'allotments'
                  ? 'bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30] shadow-2xs'
                  : 'text-[#172B50] hover:text-[#F4510B]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Allotments</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30] shadow-2xs'
                  : 'text-[#172B50] hover:text-[#F4510B]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row: Academy Location, Absence Date, Batch/Class, Search Athlete */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end pt-1">
          {/* 1. Academy Location */}
          <div>
            <label className="text-[10px] font-extrabold uppercase text-[#172B50] opacity-75 block mb-1">
              Academy Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#F4510B] absolute left-3 top-3 pointer-events-none" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                aria-label="Filter by Academy Location"
                className="w-full pl-9 pr-8 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5018] outline-none focus:ring-2 focus:ring-[#F4510B] appearance-none cursor-pointer"
              >
                <option value="All">All Locations</option>
                {activeLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#172B50] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 2. Absence Date Picker */}
          <div>
            <label className="text-[10px] font-extrabold uppercase text-[#172B50] opacity-75 block mb-1">
              Absence Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#172B50] absolute left-3 top-3 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-label="Filter by Absence Date"
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5018] outline-none focus:ring-2 focus:ring-[#F4510B] cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Batch / Class */}
          <div>
            <label className="text-[10px] font-extrabold uppercase text-[#172B50] opacity-75 block mb-1">
              Batch / Class
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-[#F4510B] absolute left-3 top-3 pointer-events-none" />
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                aria-label="Filter by Batch or Class"
                className="w-full pl-9 pr-8 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5018] outline-none focus:ring-2 focus:ring-[#F4510B] appearance-none cursor-pointer"
              >
                <option value="All">All Batches</option>
                {(data.classes || []).map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.program || b.sport})</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#172B50] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 4. Search Athlete */}
          <div>
            <label className="text-[10px] font-extrabold uppercase text-[#172B50] opacity-75 block mb-1">
              Search Athlete
            </label>
            <div className="relative flex items-center bg-white border border-[#172B5018] rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#F4510B] transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchAthlete}
                onChange={(e) => setSearchAthlete(e.target.value)}
                placeholder="Name or ID..."
                className="w-full text-xs sm:text-sm text-[#172B50] placeholder-slate-400 bg-transparent outline-none font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TAB A: ABSENT STUDENTS (PENDING COMPENSATION)         */}
      {/* ======================================================== */}
      {activeTab === 'absent_students' && (
        <div className="bg-white rounded-3xl border border-[#172B501A] shadow-xs overflow-hidden">
          {/* Card Header matching Image 1 */}
          <div className="p-5 sm:p-6 border-b border-[#172B5012] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#172B50]">
                  Absent Students (Pending Compensation)
                </h3>
                <p className="text-xs text-[#172B50] opacity-70">
                  Attendance marked as Absent by coach will appear here for compensation allotment.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#F4510B]">
              {filteredAbsentStudents.length} Absent Athlete{filteredAbsentStudents.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Table matching Image 1 exact columns */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF4E8] text-[#172B50] font-black uppercase tracking-wider text-[11px] border-b border-[#172B501A]">
                <tr>
                  <th className="px-5 py-4"># KID ID</th>
                  <th className="px-4 py-4">KID NAME</th>
                  <th className="px-4 py-4">PARENT NAME</th>
                  <th className="px-4 py-4">PROGRAM</th>
                  <th className="px-4 py-4">LOCATION</th>
                  <th className="px-4 py-4">ABSENCE DATE</th>
                  <th className="px-5 py-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B5010]">
                {filteredAbsentStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      {/* Illustrated Empty State matching Image 1 */}
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FFF4E8] border border-[#F4510B30] flex items-center justify-center shadow-xs">
                          <CalendarX className="w-10 h-10 text-[#F4510B]" />
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-[#172B50]">
                          No absent students found
                        </h4>
                        <p className="text-xs text-[#172B50] opacity-70 leading-relaxed">
                          Students marked as Absent in attendance will appear here for compensation allotment.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAbsentStudents.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-[#172B50]">{rec.studentId}</td>
                      <td className="px-4 py-4 font-extrabold text-[#172B50] text-[13px]">{rec.studentName}</td>
                      <td className="px-4 py-4 font-semibold text-[#172B50] opacity-85">{rec.parentName}</td>
                      <td className="px-4 py-4 font-bold text-[#172B50]">{rec.program}</td>
                      <td className="px-4 py-4 font-bold text-[#F4510B]">{rec.location}</td>
                      <td className="px-4 py-4 font-bold text-[#172B50]">{rec.absenceDate}</td>
                      <td className="px-5 py-4 text-right">
                        {rec.existingRequest?.status === 'Scheduled' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            <Check className="w-3 h-3" />
                            Allotted
                          </span>
                        ) : rec.existingRequest?.status === 'Pending' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenAllotModal(rec.studentId, rec.absenceDate, rec.existingRequest.id)}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30] hover:bg-[#F4510B] hover:text-white transition-all cursor-pointer"
                          >
                            <span>Allot Class</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenAllotModal(rec.studentId, rec.absenceDate)}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#F4510B] text-white hover:bg-[#E04505] transition-all shadow-2xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Allot Class</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TAB B: COMPENSATION REQUESTS                           */}
      {/* ======================================================== */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-3xl border border-[#172B501A] shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[#172B5012] flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#172B50]">Parent Compensation Requests</h3>
              <p className="text-xs text-[#172B50] opacity-70">
                Review parent-submitted requests, verify reason &amp; approve replacement slots.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600">
              {compensationRequests.length} Total Requests
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF4E8] text-[#172B50] font-black uppercase tracking-wider text-[11px] border-b border-[#172B501A]">
                <tr>
                  <th className="px-5 py-4"># REQUEST ID</th>
                  <th className="px-4 py-4">STUDENT &amp; PARENT</th>
                  <th className="px-4 py-4">PROGRAM &amp; LOCATION</th>
                  <th className="px-4 py-4">MISSED DATE</th>
                  <th className="px-4 py-4">REQUEST DATE</th>
                  <th className="px-4 py-4">STATUS</th>
                  <th className="px-5 py-4 text-right">ADMIN ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B5010]">
                {compensationRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-xs text-[#172B50] opacity-65">
                      No compensation requests match the active filters.
                    </td>
                  </tr>
                ) : (
                  compensationRequests.map(req => (
                    <tr key={req.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-[#172B50]">{req.id}</td>
                      <td className="px-4 py-4">
                        <span className="font-extrabold text-[#172B50] text-[13px] block">{req.studentName}</span>
                        <span className="text-[11px] text-[#172B50] opacity-70 block">{req.parentName || 'Parent'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-[#172B50] block">{req.program || 'Junior Athletics'}</span>
                        <span className="text-[11px] font-bold text-[#F4510B] block">{req.center || req.location}</span>
                      </td>
                      <td className="px-4 py-4 font-bold text-[#172B50]">{req.missedDate}</td>
                      <td className="px-4 py-4 font-semibold text-[#172B50] opacity-80">{req.appliedOn || req.createdAt?.split('T')[0]}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          req.status === 'Approved' ? 'bg-sky-100 text-sky-800' :
                          req.status === 'Scheduled' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                          req.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {req.status === 'Pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenAllotModal(req.studentId, req.missedDate, req.id)}
                                className="px-3 py-1 rounded-xl text-xs font-bold bg-[#F4510B] text-white hover:bg-[#E04505] transition-all cursor-pointer shadow-2xs"
                              >
                                Approve &amp; Allot
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingRequestId(req.id);
                                  setRejectModalOpen(true);
                                }}
                                className="px-3 py-1 rounded-xl text-xs font-bold bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 transition-all cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {req.status === 'Approved' && (
                            <button
                              type="button"
                              onClick={() => handleOpenAllotModal(req.studentId, req.missedDate, req.id)}
                              className="px-3 py-1 rounded-xl text-xs font-bold bg-[#172B50] text-white hover:bg-[#F4510B] transition-all cursor-pointer"
                            >
                              Allot Slot
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setViewRequest(req)}
                            className="p-1.5 rounded-lg text-[#172B50] hover:bg-[#FFF4E8] transition-colors cursor-pointer"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TAB C: ALLOTMENTS                                     */}
      {/* ======================================================== */}
      {activeTab === 'allotments' && (
        <div className="bg-white rounded-3xl border border-[#172B501A] shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[#172B5012] flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#172B50]">Confirmed Compensation Class Allotments</h3>
              <p className="text-xs text-[#172B50] opacity-70">
                Scheduled replacement slots, assigned coaches &amp; completion status across centers.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600">
              {allotmentsList.length} Active Allotments
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF4E8] text-[#172B50] font-black uppercase tracking-wider text-[11px] border-b border-[#172B501A]">
                <tr>
                  <th className="px-5 py-4"># ALLOTMENT ID</th>
                  <th className="px-4 py-4">STUDENT NAME</th>
                  <th className="px-4 py-4">ORIGINAL ABSENCE</th>
                  <th className="px-4 py-4">REPLACEMENT DATE &amp; TIME</th>
                  <th className="px-4 py-4">LOCATION</th>
                  <th className="px-4 py-4">COACH</th>
                  <th className="px-4 py-4">STATUS</th>
                  <th className="px-5 py-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B5010]">
                {allotmentsList.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-xs text-[#172B50] opacity-65">
                      No compensation allotments found. Click <strong>+ Allot Compensation</strong> above to schedule one.
                    </td>
                  </tr>
                ) : (
                  allotmentsList.map(allot => (
                    <tr key={allot.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-[#172B50]">{allot.id}</td>
                      <td className="px-4 py-4 font-extrabold text-[#172B50] text-[13px]">{allot.studentName}</td>
                      <td className="px-4 py-4 font-bold text-[#172B50]">{allot.missedDate}</td>
                      <td className="px-4 py-4">
                        <span className="font-extrabold text-[#172B50] block">{allot.replacementDate}</span>
                        <span className="text-[11px] text-[#F4510B] font-bold block">{allot.replacementSlot}</span>
                      </td>
                      <td className="px-4 py-4 font-bold text-[#172B50]">{allot.replacementLocation || allot.center}</td>
                      <td className="px-4 py-4 font-semibold text-[#172B50]">{allot.replacementCoach || 'Assigned Coach'}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          allot.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {allot.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {allot.status !== 'Completed' && (
                            <button
                              type="button"
                              onClick={() => {
                                updateCompensationRequest(allot.id, { status: 'Completed' });
                                addToast(`Marked replacement class for ${allot.studentName} as Completed.`, 'success');
                              }}
                              className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-2xs"
                            >
                              Mark Completed
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenAllotModal(allot.studentId, allot.missedDate, allot.id)}
                            className="px-3 py-1 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] hover:bg-[#FFE8D6] transition-all cursor-pointer"
                          >
                            Reschedule
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. TAB D: HISTORY / AUDIT TRAIL                          */}
      {/* ======================================================== */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-[#172B501A] shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[#172B5012] flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#172B50]">Attendance &amp; Compensation Audit Trail</h3>
              <p className="text-xs text-[#172B50] opacity-70">
                Immutable operational log of absences, requests, allotments, and attendance edits.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-600">
              {historyList.length} Audit Events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF4E8] text-[#172B50] font-black uppercase tracking-wider text-[11px] border-b border-[#172B501A]">
                <tr>
                  <th className="px-5 py-4">TIMESTAMP</th>
                  <th className="px-4 py-4">EVENT TYPE</th>
                  <th className="px-4 py-4">STUDENT</th>
                  <th className="px-4 py-4">DETAILS</th>
                  <th className="px-4 py-4">ACTOR / ROLE</th>
                  <th className="px-5 py-4 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B5010]">
                {historyList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-xs text-[#172B50] opacity-65">
                      No compensation history events logged yet. Actions taken will record here automatically.
                    </td>
                  </tr>
                ) : (
                  historyList.map(h => (
                    <tr key={h.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                      <td className="px-5 py-4 font-mono text-[11px] text-[#172B50] opacity-75">
                        {h.timestamp ? new Date(h.timestamp).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30]">
                          {h.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-extrabold text-[#172B50]">{h.studentName || '-'}</td>
                      <td className="px-4 py-4 text-[#172B50] font-medium max-w-xs">{h.details}</td>
                      <td className="px-4 py-4 font-semibold text-[#172B50]">
                        {h.actor} <span className="opacity-60 text-[10px]">({h.role})</span>
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-[#172B50]">{h.status || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: ALLOT COMPENSATION CLASS                       */}
      {/* ======================================================== */}
      <Modal
        isOpen={isAllotModalOpen}
        onClose={() => {
          setIsAllotModalOpen(false);
          setConfirmStep(false);
        }}
        title={confirmStep ? "Confirm Compensation Allotment" : "Allot Compensation Class"}
      >
        {!confirmStep ? (
          <form onSubmit={handleProceedToConfirm} className="space-y-4 text-xs">
            {/* Student Selector */}
            <div>
              <label className="text-[11px] font-extrabold uppercase text-[#172B50] opacity-80 block mb-1">
                Student Athlete *
              </label>
              <select
                value={targetStudentId}
                onChange={(e) => {
                  const sId = e.target.value;
                  setTargetStudentId(sId);
                  const st = (data.students || []).find(s => s.id === sId);
                  if (st) {
                    setAllotLocation(st.center || activeLocations[0]?.name);
                    setAllotProgram(st.program || (data.programs || [])[0]?.name);
                  }
                }}
                required
                className="w-full px-3 py-2.5 rounded-xl font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none focus:ring-2 focus:ring-[#F4510B]"
              >
                <option value="">Select Student Athlete</option>
                {(data.students || []).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id}) • {s.center} • {s.program}
                  </option>
                ))}
              </select>
            </div>

            {/* Original Absence Date */}
            <div>
              <label className="text-[11px] font-extrabold uppercase text-[#172B50] opacity-80 block mb-1">
                Original Absence Date *
              </label>
              <input
                type="date"
                value={targetAbsenceDate}
                onChange={(e) => setTargetAbsenceDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>

            {/* Replacement Location & Program */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-extrabold uppercase text-[#172B50] opacity-80 block mb-1">
                  Replacement Center *
                </label>
                <select
                  value={allotLocation}
                  onChange={(e) => setAllotLocation(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none"
                >
                  {activeLocations.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase text-[#172B50] opacity-80 block mb-1">
                  Sport Program *
                </label>
                <select
                  value={allotProgram}
                  onChange={(e) => setAllotProgram(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none"
                >
                  {(data.programs || []).map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Replacement Date & Time Range */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-extrabold uppercase text-[#172B50] opacity-80 block mb-1">
                  Replacement Date *
                </label>
                <input
                  type="date"
                  value={allotDate}
                  onChange={(e) => setAllotDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase text-[#172B50] opacity-80 block mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={allotStartTime}
                  onChange={(e) => setAllotStartTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase text-[#172B50] opacity-80 block mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  value={allotEndTime}
                  onChange={(e) => setAllotEndTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none"
                />
              </div>
            </div>

            {/* Assigned Coach */}
            <div>
              <label className="text-[11px] font-extrabold uppercase text-[#172B50] opacity-80 block mb-1">
                Assigned Replacement Coach *
              </label>
              <select
                value={allotCoachId}
                onChange={(e) => setAllotCoachId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none"
              >
                {(data.coaches || []).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.specialization || 'Coach'}) • {c.center || 'All Centers'}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[11px] font-extrabold uppercase text-[#172B50] opacity-80 block mb-1">
                Admin Instructions / Remarks
              </label>
              <textarea
                value={allotNotes}
                onChange={(e) => setAllotNotes(e.target.value)}
                rows={2}
                placeholder="Remarks visible to Parent and Coach portals..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#172B5015]">
              <button
                type="button"
                onClick={() => setIsAllotModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#F4510B] hover:bg-[#E04505] transition-all shadow-xs cursor-pointer"
              >
                Continue to Confirmation →
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#FFF4E8] border border-[#F4510B30] space-y-2.5">
              <div className="flex items-center gap-2 text-[#F4510B] font-black text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Please Confirm Allotment Details</span>
              </div>
              <p className="text-[#172B50] leading-relaxed">
                You are allotting an authorized replacement session with full capacity validation.
              </p>
              <div className="bg-white p-3 rounded-xl border border-[#172B5015] space-y-1.5 font-medium text-[#172B50]">
                <p><strong>Athlete:</strong> {(data.students || []).find(s => s.id === targetStudentId)?.name} ({targetStudentId})</p>
                <p><strong>Original Absence:</strong> {targetAbsenceDate}</p>
                <p><strong>Allotted Slot:</strong> {allotDate} ({allotStartTime} - {allotEndTime})</p>
                <p><strong>Center &amp; Program:</strong> {allotLocation} • {allotProgram}</p>
                <p><strong>Coach:</strong> {(data.coaches || []).find(c => c.id === allotCoachId)?.name}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmStep(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                ← Back to Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveAllotment}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm cursor-pointer"
              >
                Confirm &amp; Allot Class
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* 7. MODAL: VIEW REQUEST DETAILS                           */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(viewRequest)}
        onClose={() => setViewRequest(null)}
        title="Compensation Request Details"
      >
        {viewRequest && (
          <div className="space-y-3.5 text-xs text-[#172B50]">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015]">
              <div>
                <span className="text-[10px] uppercase font-extrabold opacity-70 block">Student Athlete</span>
                <span className="font-black text-sm block">{viewRequest.studentName}</span>
                <span className="font-mono text-[10px] opacity-75">{viewRequest.studentId}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold opacity-70 block">Parent</span>
                <span className="font-bold text-sm block">{viewRequest.parentName || 'Parent'}</span>
                <span className="text-[11px] opacity-75">{viewRequest.parentPhone || viewRequest.parentEmail}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#172B5015] space-y-1.5">
              <p><strong>Missed Session:</strong> {viewRequest.missedClass} on {viewRequest.missedDate}</p>
              <p><strong>Location:</strong> {viewRequest.center || viewRequest.location}</p>
              <p><strong>Reason:</strong> {viewRequest.reason}</p>
              <p><strong>Status:</strong> <span className="font-bold uppercase text-[#F4510B]">{viewRequest.status}</span></p>
              {viewRequest.replacementSlot && (
                <p><strong>Scheduled Slot:</strong> {viewRequest.replacementSlot} (Coach: {viewRequest.replacementCoach})</p>
              )}
              {viewRequest.approvalNotes && (
                <p><strong>Admin Remarks:</strong> {viewRequest.approvalNotes}</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewRequest(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#172B50] text-white hover:bg-[#F4510B] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* 8. MODAL: REJECT REQUEST PROMPT                          */}
      {/* ======================================================== */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Compensation Request"
      >
        <div className="space-y-4 text-xs text-[#172B50]">
          <p className="leading-relaxed">
            Please provide a rejection note visible to the parent explaining why this compensation request cannot be approved.
          </p>
          <div>
            <label className="text-[11px] font-extrabold uppercase opacity-80 block mb-1">
              Rejection Reason *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              required
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReject}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-xs cursor-pointer"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
