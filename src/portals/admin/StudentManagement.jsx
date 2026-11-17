import React, { useEffect, useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3,
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Trophy,
  Heart,
  Phone,
  MapPin,
  Users,
  User,
  UserCheck,
  UserX,
  CreditCard,
  Settings,
  ChevronDown,
  Layers,
  X,
  Hash
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import { getCommonLocations } from '../../services/locationService';
import { getLocationCode } from '../../services/enrollmentService';

export default function StudentManagement() {
  const { data, addStudent, updateStudent, deleteStudent, focusedRecord, setFocusedRecord } = useCrm();
  const commonLocations = getCommonLocations(data);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    if (focusedRecord?.type === 'student' && focusedRecord.id) {
      const target = (data.students || []).find((s) => s.id === focusedRecord.id);
      if (target) {
        setViewStudent(target);
        setSearchTerm(target.id);
      }
      setFocusedRecord(null);
    }
  }, [focusedRecord, data.students, setFocusedRecord]);

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState('7');
  const [gender, setGender] = useState('Male');
  const [program, setProgram] = useState(data.programs[0]?.name || '');
  const [center, setCenter] = useState(commonLocations[0]?.name || 'KK NAGAR');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [medicalNote, setMedicalNote] = useState('');

  // Flexible Kid ID, Child, Parent, and Mobile Search
  // Supports full Kid ID (e.g. LS-KKN-2026-001), partial year-sequence (e.g. 2026-001 across all locations),
  // location prefix (e.g. LS-KKN, KKN), child name, parent name, and parent mobile number
  const filteredStudents = useMemo(() => {
    const rawQuery = searchTerm.trim().toLowerCase();
    const cleanQuery = rawQuery.replace(/[-\s]/g, '');
    const queryDigits = rawQuery.replace(/\D/g, '');

    return (data.students || []).filter((s) => {
      // 1. Location filter
      const matchesLocation = selectedLocation === 'All' || s.center === selectedLocation;
      if (!matchesLocation) return false;

      // 2. Program filter
      const matchesProgram = selectedProgram === 'All' || s.program === selectedProgram;
      if (!matchesProgram) return false;

      // 3. Search query
      if (!rawQuery) return true;

      const sId = (s.id || '').toLowerCase();
      const sIdClean = sId.replace(/[-\s]/g, '');
      const sName = (s.name || '').toLowerCase();
      const sParentName = (s.parentName || '').toLowerCase();
      const sPhone = (s.parentPhone || '');
      const sPhoneDigits = sPhone.replace(/\D/g, '');
      const sCenter = (s.center || '').toLowerCase();
      const sLocCode = getLocationCode(s.center || '').toLowerCase();

      // Check full or partial ID:
      // - "LS-KKN-2026-001" (exact match)
      // - "2026-001" (matches across every location)
      // - "LS-KKN" or "KKN" (matches all KK Nagar students)
      // - "001" (matches sequence)
      const matchesId =
        sId.includes(rawQuery) ||
        (cleanQuery && sIdClean.includes(cleanQuery)) ||
        sLocCode.includes(rawQuery);

      // Check child name
      const matchesChildName =
        sName.includes(rawQuery) ||
        (cleanQuery && sName.replace(/[-\s]/g, '').includes(cleanQuery));

      // Check parent name
      const matchesParentName = sParentName.includes(rawQuery);

      // Check parent mobile number
      const matchesPhone =
        sPhone.toLowerCase().includes(rawQuery) ||
        (queryDigits.length >= 3 && sPhoneDigits.includes(queryDigits));

      // Check location name
      const matchesCenter = sCenter.includes(rawQuery);

      return matchesId || matchesChildName || matchesParentName || matchesPhone || matchesCenter;
    });
  }, [data.students, searchTerm, selectedLocation, selectedProgram]);

  const handleOpenAddModal = () => {
    if (selectedLocation !== 'All') {
      setCenter(selectedLocation);
    } else {
      setCenter(commonLocations[0]?.name || 'KK NAGAR');
    }
    setIsAddOpen(true);
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!name.trim() || !parentName.trim()) return;

    addStudent({
      name,
      age: parseInt(age) || 7,
      gender,
      program,
      center,
      parentName,
      parentPhone: parentPhone || '+91 98000 00000',
      parentEmail: parentEmail || `${parentName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      medicalNote: medicalNote || 'No special medical conditions reported.',
      rank: 'Junior Warrior',
      feeStatus: 'Paid',
      coachName: data.coaches[0]?.name || 'Unassigned Coach'
    });

    setIsAddOpen(false);
    setName('');
    setParentName('');
    setParentPhone('');
    setParentEmail('');
    setMedicalNote('');
  };

  // Dynamic Student and Location Counting Logic
  const totalKids = (data.students || []).length;
  const activeKids = useMemo(() => {
    return (data.students || []).filter(
      (s) => (s.status || 'Active').toLowerCase() === 'active'
    ).length;
  }, [data.students]);

  const inactiveKids = useMemo(() => {
    return (data.students || []).filter((s) => {
      const st = (s.status || '').toLowerCase();
      return st === 'inactive' || st === 'paused';
    }).length;
  }, [data.students]);

  const locationsCount = useMemo(() => {
    return (
      commonLocations.length ||
      Array.from(new Set((data.students || []).map((s) => s.center).filter(Boolean))).length
    );
  }, [commonLocations, data.students]);

  return (
    <div className="space-y-6">
      {/* 1. Dynamic Student KPI Cards & Filters Container (Matching Reference UI/UX) */}
      <div className="bg-white rounded-3xl sm:rounded-[28px] border border-[#172B5015] shadow-sm p-4 sm:p-5 relative overflow-hidden space-y-4">
        {/* Subtle decorative curved orange wave accent in top-left */}
        <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-[#F4510B] via-[#F4510B30] to-transparent rounded-br-[48px] opacity-20 pointer-events-none" />

        {/* Top Row: 4 Dynamic KPI Cards + Enroll Button */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 flex-1">
            {/* Card 1 – Total Kids */}
            <div className="bg-[#FFF4E8] border border-[#F4510B25] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B18] text-[#F4510B] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Total Kids</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {totalKids}
                </div>
              </div>
            </div>

            {/* Card 2 – Active Kids */}
            <div className="bg-[#F0FDF4] border border-[#16A34A20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#16A34A18] text-[#16A34A] flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Active Kids</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {activeKids}
                </div>
              </div>
            </div>

            {/* Card 3 – Inactive Kids */}
            <div className="bg-[#FFF1F2] border border-[#E11D4820] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#E11D4818] text-[#E11D48] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-[#E11D48]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Inactive Kids</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {inactiveKids}
                </div>
              </div>
            </div>

            {/* Card 4 – Locations */}
            <div className="bg-[#F0F7FF] border border-[#0284C720] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#0284C718] text-[#0284C7] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#0284C7]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Locations</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {locationsCount}
                </div>
              </div>
            </div>
          </div>

          {/* Enroll New Athlete Button (prominent Spartan Orange on right side of KPI row) */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#F4510B] hover:bg-[#d94103] active:scale-95 text-white text-xs sm:text-sm font-bold rounded-full shadow-[0_4px_14px_rgba(244,81,11,0.35)] transition-all cursor-pointer shrink-0 self-stretch sm:self-auto"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Enroll New Athlete</span>
          </button>
        </div>

        {/* Second Row: Search and Filters Container */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1 border-t border-[#172B500C] relative z-10">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-[#172B50]/40 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Kid ID (e.g. 2026-001 or LS-KKN-2026-001), athlete name, or parent..."
              className="w-full pl-10 pr-8 py-2.5 text-xs font-medium bg-[#FFF4E8]/30 text-[#172B50] placeholder-[#172B5060] border border-[#172B5018] rounded-2xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#F4510B20] focus:border-[#F4510B] transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-[#172B50]/40 hover:text-[#172B50] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Location Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#172B50] whitespace-nowrap inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                <span>Location:</span>
              </span>
              <div className="relative inline-flex items-center">
                <select
                  aria-label="Filter students by location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="pl-3.5 pr-8 py-2 text-xs font-bold bg-white text-[#172B50] border border-[#172B5018] rounded-2xl shadow-2xs hover:border-[#F4510B50] focus:outline-none focus:border-[#F4510B] cursor-pointer appearance-none transition-all"
                >
                  <option value="All">All Locations ({(data.students || []).length})</option>
                  {commonLocations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name} ({(data.students || []).filter((s) => s.center === loc.name).length})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/50 absolute right-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Program Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#172B50] whitespace-nowrap inline-flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#F4510B]" />
                <span>Program:</span>
              </span>
              <div className="relative inline-flex items-center">
                <select
                  aria-label="Filter students by program"
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="pl-3.5 pr-8 py-2 text-xs font-bold bg-white text-[#172B50] border border-[#172B5018] rounded-2xl shadow-2xs hover:border-[#F4510B50] focus:outline-none focus:border-[#F4510B] cursor-pointer appearance-none transition-all"
                >
                  <option value="All">All Sports Programs</option>
                  {data.programs.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/50 absolute right-2.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Students Table Container */}
      <div className="bg-white rounded-3xl border border-[#172B5015] shadow-sm overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FFF4E8] text-[#172B50] border-b border-[#172B5012]">
                <th className="py-4 px-5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-[#F4510B]" />
                    <span className="font-extrabold text-[#172B50] text-[11px] uppercase tracking-wider">
                      Kid ID
                    </span>
                  </div>
                </th>
                <th className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#F4510B]" />
                    <span className="font-extrabold text-[#172B50] text-[11px] uppercase tracking-wider">
                      Kid Name
                    </span>
                  </div>
                </th>
                <th className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#F4510B]" />
                    <span className="font-extrabold text-[#172B50] text-[11px] uppercase tracking-wider">
                      Program
                    </span>
                  </div>
                </th>
                <th className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#F4510B]" />
                    <span className="font-extrabold text-[#172B50] text-[11px] uppercase tracking-wider">
                      Location
                    </span>
                  </div>
                </th>
                <th className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#F4510B]" />
                    <span className="font-extrabold text-[#172B50] text-[11px] uppercase tracking-wider">
                      Parent Name
                    </span>
                  </div>
                </th>
                <th className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#F4510B]" />
                    <span className="font-extrabold text-[#172B50] text-[11px] uppercase tracking-wider">
                      Parent Number
                    </span>
                  </div>
                </th>
                <th className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#F4510B]" />
                    <span className="font-extrabold text-[#172B50] text-[11px] uppercase tracking-wider">
                      Fee Status
                    </span>
                  </div>
                </th>
                <th className="py-4 px-5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Settings className="w-4 h-4 text-[#F4510B]" />
                    <span className="font-extrabold text-[#172B50] text-[11px] uppercase tracking-wider">
                      Actions
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172B5010]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 sm:py-20 px-4 text-center relative overflow-hidden">
                    {/* Faint watermark of running kid athletes on the right */}
                    <div className="absolute right-6 bottom-4 opacity-15 pointer-events-none select-none hidden sm:block">
                      <svg className="w-36 h-28 text-[#F4510B]" viewBox="0 0 160 120" fill="currentColor">
                        <circle cx="50" cy="25" r="12" />
                        <path d="M45 40 L35 70 L20 85 L25 90 L40 75 L48 55 L60 70 L75 80 L80 72 L65 62 L55 45 Z" />
                        <path d="M40 45 L25 55 L20 50 L35 40 Z" />
                        <path d="M50 45 L65 52 L75 48 L73 40 L62 45 Z" />
                        <circle cx="110" cy="20" r="14" />
                        <path d="M105 37 L92 68 L75 82 L80 88 L98 73 L108 52 L122 68 L138 78 L142 70 L128 60 L116 42 Z" />
                        <path d="M100 42 L82 52 L78 46 L95 37 Z" />
                        <path d="M112 42 L128 50 L140 45 L138 37 L125 42 Z" />
                      </svg>
                    </div>

                    <div className="flex flex-col items-center justify-center max-w-lg mx-auto relative z-10">
                      {/* Sports-themed clipboard & checklist graphic */}
                      <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                        <div className="absolute inset-0 bg-[#FFF5ED] rounded-full blur-[1px] transform scale-95" />
                        <svg 
                          className="w-20 h-20 relative z-10 text-[#F4510B]" 
                          viewBox="0 0 80 80" 
                          fill="none" 
                          stroke="currentColor" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M55 12L60 8" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M63 19L68 17" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M59 26L64 27" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />
                          <rect 
                            x="22" 
                            y="18" 
                            width="33" 
                            height="43" 
                            rx="6" 
                            stroke="#F4510B" 
                            strokeWidth="2.5" 
                            fill="#FFFFFF" 
                          />
                          <path 
                            d="M31 18V15C31 13.3431 32.3431 12 34 12H43C44.6569 12 46 13.3431 46 15V18" 
                            stroke="#F4510B" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                          />
                          <circle cx="38.5" cy="15" r="1.5" fill="#F4510B" />
                          <path d="M28 29L30.5 31.5L34 28" stroke="#F4510B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="37" y1="29.5" x2="47" y2="29.5" stroke="#F4510B" strokeWidth="2" strokeLinecap="round" />
                          <path d="M28 38L30.5 40.5L34 37" stroke="#F4510B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="37" y1="38.5" x2="44" y2="38.5" stroke="#F4510B" strokeWidth="2" strokeLinecap="round" />
                          <path d="M28 47L30.5 49.5L34 46" stroke="#F4510B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="37" y1="47.5" x2="42" y2="47.5" stroke="#F4510B" strokeWidth="2" strokeLinecap="round" />
                          <circle 
                            cx="47" 
                            cy="48" 
                            r="8" 
                            stroke="#F4510B" 
                            strokeWidth="2.5" 
                            fill="#FFFFFF" 
                          />
                          <line 
                            x1="53" 
                            y1="54" 
                            x2="60" 
                            y2="61" 
                            stroke="#F4510B" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                          />
                        </svg>
                      </div>

                      {/* Heading */}
                      <h3 className="text-xl font-black text-[#172B50] tracking-tight mb-1.5">
                        No students found
                      </h3>

                      {/* Supporting text */}
                      <p className="text-xs sm:text-sm text-[#172B50]/70 max-w-md mx-auto mb-6 leading-relaxed">
                        No students found matching your criteria.
                      </p>

                      {/* CTA Button */}
                      <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#F4510B] hover:bg-[#d94103] active:scale-95 text-white text-xs sm:text-sm font-bold rounded-full shadow-[0_4px_14px_rgba(244,81,11,0.35)] transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                        <span>Enroll New Athlete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-[#FFF4E8]/35 transition-colors">
                    {/* 1. Kid ID */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 font-black text-[#F4510B] bg-[#FFF5ED] px-2.5 py-1 rounded-lg border border-[#F4510B30] text-xs font-mono tracking-wide shadow-2xs">
                        {student.id}
                      </span>
                    </td>

                    {/* 2. Kid Name */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            student.avatar ||
                            'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={student.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#172B5015] shrink-0"
                        />
                        <div>
                          <button
                            type="button"
                            onClick={() => setViewStudent(student)}
                            className="font-extrabold text-[#172B50] hover:text-[#F4510B] text-sm block leading-tight text-left cursor-pointer transition-colors"
                          >
                            {student.name}
                          </button>
                          <span className="text-[11px] text-[#172B50]/70 font-semibold block mt-0.5">
                            {student.age} yrs • {student.gender || 'Athlete'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Program */}
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-[#172B50] block">{student.program}</span>
                      {(student.batchName || student.enrolledClasses?.length > 0) && (
                        <span className="text-[10px] text-[#172B50]/70 block mt-0.5">
                          Batch: {student.batchName || student.enrolledClasses.join(', ')}
                        </span>
                      )}
                    </td>

                    {/* 3. Location */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F4510B]">
                        <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                        <span>{student.center}</span>
                      </span>
                    </td>

                    {/* 4. Parent Name */}
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-[#172B50] block">{student.parentName || 'Guardian'}</span>
                    </td>

                    {/* 5. Parent Number */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {student.parentPhone ? (
                        <a
                          href={`tel:${student.parentPhone}`}
                          className="text-xs font-medium text-[#172B50]/80 hover:text-[#F4510B] transition-colors inline-flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-[#172B50]/50" />
                          <span>{student.parentPhone}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-[#172B50]/40">-</span>
                      )}
                    </td>

                    {/* 6. Fee Status */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-extrabold border ${
                          student.feeStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-[#FFF5ED] text-[#F4510B] border-[#F4510B30]'
                        }`}
                      >
                        {student.feeStatus || 'Paid'}
                      </span>
                    </td>

                    {/* 7. Actions */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewStudent(student)}
                          className="p-1.5 rounded-lg text-[#172B50] hover:bg-[#FFF4E8] transition-colors cursor-pointer"
                          title="View Athlete Profile & Badges"
                        >
                          <Eye className="w-4 h-4 text-[#172B50]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingStudent({ ...student })}
                          className="p-1.5 rounded-lg text-[#172B50] hover:bg-[#FFF4E8] transition-colors cursor-pointer"
                          title="Edit Student Record"
                        >
                          <Edit3 className="w-4 h-4 text-[#172B50]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteStudent(student.id)}
                          className="p-1.5 rounded-lg text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4 text-[#F4510B]" />
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

      {/* View Student Profile Modal */}
      {viewStudent && (
        <Modal
          isOpen={!!viewStudent}
          onClose={() => setViewStudent(null)}
          title={`Spartan Profile: ${viewStudent.name}`}
          subtitle={`Student ID: ${viewStudent.id} • Joined: ${viewStudent.joinDate}`}
        >
          <div className="space-y-4">
            
            {/* Top Athlete Card */}
            <div className="p-4 rounded-xl bg-[#FFF4E8] border border-[#172B501A] flex items-center gap-4">
              <img
                src={viewStudent.avatar}
                alt={viewStudent.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#F4510B]"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-base font-extrabold text-[#172B50]">{viewStudent.name}</h4>
                  <span className="font-extrabold text-[#F4510B] bg-white px-2 py-0.5 rounded-md border border-[#F4510B30] text-xs font-mono tracking-wide">
                    {viewStudent.id}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#F4510B]">{viewStudent.rank} • {viewStudent.status || 'Active'}</p>
                <p className="text-xs text-[#172B50] opacity-75 mt-0.5">
                  {viewStudent.program} • {viewStudent.center}
                </p>
                {(viewStudent.enquiryId || viewStudent.parentId) && (
                  <p className="text-[10px] font-semibold text-[#172B50] opacity-70 mt-0.5">
                    {viewStudent.enquiryId ? `Enquiry: ${viewStudent.enquiryId}` : ''}
                    {viewStudent.enquiryId && viewStudent.parentId ? ' • ' : ''}
                    {viewStudent.parentId ? `Parent: ${viewStudent.parentId}` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Badges Earned */}
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#172B50] block mb-2">
                Badges & Spartan Honors
              </span>
              <div className="flex flex-wrap gap-2">
                {viewStudent.badges?.map((b, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-white text-[#172B50] border border-[#F4510B] flex items-center gap-1.5 shadow-sm"
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#F4510B]" />
                    <span>{b}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Medical / Fitness Notes */}
            <div className="p-3.5 rounded-xl bg-white border border-[#172B5020]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#172B50] mb-1">
                <Heart className="w-4 h-4 text-[#F4510B]" />
                <span>Medical & Physical Conditioning Notes</span>
              </div>
              <p className="text-xs text-[#172B50] opacity-80 leading-relaxed">
                {viewStudent.medicalNote || 'No special restrictions recorded. Certified fit for agility and strength routines.'}
              </p>
            </div>

            {/* Parent Contact */}
            <div className="p-3.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60">Parent / Emergency Contact</span>
                <p className="text-xs font-bold text-[#172B50]">{viewStudent.parentName}</p>
                <p className="text-xs text-[#172B50] opacity-75">{viewStudent.parentPhone}</p>
              </div>
              <a
                href={`tel:${viewStudent.parentPhone}`}
                className="px-3 py-1.5 rounded-lg bg-[#172B50] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#F4510B] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-white" />
                <span>Call Parent</span>
              </a>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setViewStudent(null)}
                className="px-4 py-2 text-xs font-bold bg-[#172B50] text-white rounded-xl hover:bg-[#F4510B] transition-colors"
              >
                Close Profile
              </button>
            </div>

          </div>
        </Modal>
      )}

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Enroll New Spartan Athlete"
        subtitle="Fill in complete athlete and parent profile details"
      >
        <form onSubmit={handleAddStudent} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Athlete Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Samarth Reddy"
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Age *</label>
              <input
                type="number"
                min="3"
                max="16"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Sport Program *</label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {data.programs.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Academy Center *</label>
              <select
                value={center}
                onChange={(e) => setCenter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {commonLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Parent's Name"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Parent Phone Number *</label>
              <input
                type="tel"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="+91 99..."
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Medical / Health Notes</label>
            <input
              type="text"
              value={medicalNote}
              onChange={(e) => setMedicalNote(e.target.value)}
              placeholder="e.g. Allergies, asthma, past sprains..."
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Confirm Enrollment
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
        title={editingStudent ? `Edit Student: ${editingStudent.id}` : 'Edit Student'}
        subtitle="Update athlete, program, academy location, or guardian contact details"
      >
        {editingStudent && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateStudent(editingStudent.id, {
                name: editingStudent.name,
                age: parseInt(editingStudent.age, 10) || editingStudent.age,
                gender: editingStudent.gender,
                center: editingStudent.center,
                program: editingStudent.program,
                parentName: editingStudent.parentName,
                parentPhone: editingStudent.parentPhone,
                parentEmail: editingStudent.parentEmail,
                status: editingStudent.status || 'Active',
                medicalNote: editingStudent.medicalNote,
              });
              setEditingStudent(null);
            }}
            className="space-y-3.5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Student Name *</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Status</label>
                <select
                  value={editingStudent.status || 'Active'}
                  onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl"
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Academy Location *</label>
                <select
                  value={editingStudent.center || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, center: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl"
                >
                  {commonLocations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Sports Program *</label>
                <select
                  value={editingStudent.program || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, program: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl"
                >
                  {data.programs.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Parent Phone</label>
                <input
                  type="tel"
                  value={editingStudent.parentPhone || ''}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, parentPhone: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Parent Email</label>
                <input
                  type="email"
                  value={editingStudent.parentEmail || ''}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, parentEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#172B5015] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl cursor-pointer"
              >
                Save Student
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
