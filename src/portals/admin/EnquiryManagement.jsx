import React, { useState } from 'react';
import { 
  PhoneCall, 
  Search, 
  Plus, 
  Filter, 
  CheckCircle2, 
  Calendar, 
  UserCheck, 
  Clock, 
  AlertCircle,
  ArrowRight,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import { getCommonLocations, filterEnquiries } from '../../services/locationService';

export default function EnquiryManagement() {
  const { data, addEnquiry, updateEnquiryStage, addStudent } = useCrm();

  const commonLocations = getCommonLocations(data);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('6');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [interestedProgram, setInterestedProgram] = useState(data.programs[0]?.name || '');
  const [center, setCenter] = useState(commonLocations[0]?.name || 'KK NAGAR');
  const [notes, setNotes] = useState('');

  const stages = ['All', 'New', 'Contacted', 'Trial Scheduled', 'Trial Completed', 'Enrolled'];

  const locationScopedEnquiries = filterEnquiries(data.enquiries || [], {
    location: selectedLocation,
    date: selectedDate,
  });

  const filteredEnquiries = filterEnquiries(data.enquiries || [], {
    location: selectedLocation,
    stage: selectedStage,
    date: selectedDate,
    search: searchTerm,
  });

  const totalPages = Math.max(1, Math.ceil(filteredEnquiries.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedEnquiries = filteredEnquiries.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleLocationChange = (locName) => {
    setSelectedLocation(locName);
    setCurrentPage(1);
    if (locName !== 'All') {
      setCenter(locName);
    }
  };

  const handleOpenModal = () => {
    if (selectedLocation !== 'All') {
      setCenter(selectedLocation);
    } else {
      setCenter(commonLocations[0]?.name || 'KK NAGAR');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!childName.trim() || !parentName.trim() || !phone.trim()) return;

    addEnquiry({
      childName,
      childAge: parseInt(childAge) || 6,
      parentName,
      phone,
      email: email || `${parentName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      interestedProgram,
      center,
      notes: notes || 'Enquiry received via front desk.',
      trialDate: '-',
      assignedTo: 'Support Agent Priya',
      source: 'Direct Phone / Walk-in',
      stage: 'New'
    });

    setIsModalOpen(false);
    setChildName('');
    setParentName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  const convertToStudent = (enq) => {
    addStudent({
      name: enq.childName,
      age: enq.childAge,
      gender: 'Youth',
      parentName: enq.parentName,
      parentPhone: enq.phone,
      parentEmail: enq.email,
      program: enq.interestedProgram,
      center: enq.center,
      coachName: data.coaches[0]?.name || 'Unassigned Coach',
      rank: 'Little Spartan Recruit',
      medicalNote: enq.notes
    });
    updateEnquiryStage(enq.id, 'Enrolled');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Enquiry & Lead Management
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Track prospective young athletes, trial sessions & enrollment conversions
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>New Admission Lead</span>
        </button>
      </div>

      {/* Filter and Search Bar: Pure White (#FFFFFF) */}
      <div className="bg-white rounded-2xl p-4 border border-[#172B501A] shadow-card space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            {/* Location Filter Dropdown (Shared Common Locations) */}
            <div className="relative min-w-[210px]">
              <MapPin className="w-4 h-4 text-[#F4510B] absolute left-3 top-2.5 pointer-events-none" />
              <select
                aria-label="Filter enquiries by academy location"
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5025] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B] cursor-pointer"
              >
                <option value="All">All Locations ({(data.enquiries || []).length})</option>
                {commonLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name} ({(data.enquiries || []).filter(e => e.center === loc.name).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#172B50] opacity-50 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by child, parent or phone..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] placeholder-[#172B5080] border border-[#172B5020] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-[#172B50] opacity-60 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="date"
                  aria-label="Filter enquiries by created or trial date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 pr-2.5 py-2 text-xs font-semibold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
                />
              </div>
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate('');
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-2 text-[11px] font-bold text-[#F4510B] bg-[#FFF4E8] border border-[#F4510B30] rounded-xl hover:bg-white transition-all"
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#172B50] opacity-75">
            <span>
              Showing <strong className="text-[#172B50]">{filteredEnquiries.length}</strong>{' '}
              {selectedLocation === 'All' ? 'across all locations' : `at ${selectedLocation}`}
            </span>
          </div>
        </div>

        {/* Stage Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {stages.map(st => (
            <button
              key={st}
              onClick={() => {
                setSelectedStage(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStage === st
                  ? 'bg-[#172B50] text-white shadow-sm'
                  : 'bg-[#FFF4E8] text-[#172B50] hover:bg-white border border-[#172B5015]'
              }`}
            >
              {st}{' '}
              {st !== 'All'
                ? `(${locationScopedEnquiries.filter(e => e.stage === st).length})`
                : `(${locationScopedEnquiries.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Table Card: Pure White (#FFFFFF) */}
      <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FFF4E8] text-[#172B50] font-extrabold uppercase tracking-wider text-[11px] border-b border-[#172B5015]">
                <th className="py-3.5 px-4">Lead ID & Date</th>
                <th className="py-3.5 px-4">Child Athlete</th>
                <th className="py-3.5 px-4">Parent & Contact</th>
                <th className="py-3.5 px-4">Program & Center</th>
                <th className="py-3.5 px-4">Current Stage</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172B5010]">
              {paginatedEnquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#172B50] opacity-60">
                    No enquiries match the selected location, stage, date, or search filter.
                  </td>
                </tr>
              ) : (
                paginatedEnquiries.map(enq => (
                  <tr key={enq.id} className="hover:bg-[#FFF4E8]/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-[#172B50] block">{enq.id}</span>
                      <span className="text-[10px] text-[#172B50] opacity-60">{enq.createdAt}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-extrabold text-[#172B50] text-sm block">{enq.childName}</span>
                      <span className="text-[11px] text-[#172B50] opacity-70">{enq.childAge} years old</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-[#172B50]">{enq.parentName}</div>
                      <div className="text-[11px] text-[#172B50] opacity-75">{enq.phone}</div>
                      <div className="text-[10px] text-[#172B50] opacity-50 truncate max-w-[150px]">{enq.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-[#172B50] block">{enq.interestedProgram}</span>
                      <span className="text-[10px] text-[#F4510B] font-semibold">{enq.center}</span>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={enq.stage}
                        onChange={(e) => updateEnquiryStage(enq.id, e.target.value)}
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border border-[#172B5025] cursor-pointer outline-none ${
                          enq.stage === 'Enrolled'
                            ? 'bg-[#172B50] text-white'
                            : enq.stage === 'Trial Scheduled'
                            ? 'bg-[#F4510B] text-white'
                            : 'bg-[#FFF4E8] text-[#172B50]'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Trial Scheduled">Trial Scheduled</option>
                        <option value="Trial Completed">Trial Completed</option>
                        <option value="Enrolled">Enrolled</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {enq.stage !== 'Enrolled' ? (
                        <button
                          onClick={() => convertToStudent(enq)}
                          className="px-3 py-1.5 text-xs font-bold bg-[#F4510B] text-white rounded-lg shadow-sm hover:brightness-110 transition-all inline-flex items-center gap-1"
                        >
                          <span>Convert to Student</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-[#172B50] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-[#F4510B]" />
                          <span>Student Enrolled</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-[#FFF4E8]/60 border-t border-[#172B5015] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#172B50]">
          <span className="font-semibold opacity-75">
            Page {safePage} of {totalPages} • {filteredEnquiries.length} enquiry record{filteredEnquiries.length === 1 ? '' : 's'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1.5 rounded-lg border border-[#172B5020] bg-white font-bold text-[#172B50] disabled:opacity-40 hover:bg-[#FFF4E8] inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1.5 rounded-lg border border-[#172B5020] bg-white font-bold text-[#172B50] disabled:opacity-40 hover:bg-[#FFF4E8] inline-flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Local Data & Backend Integration Note */}
      <div className="flex items-start gap-2.5 px-4 py-2.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015] text-[11px] text-[#172B50]">
        <Info className="w-4 h-4 text-[#F4510B] shrink-0 mt-0.5" />
        <span>
          Filtering uses shared academy location data in local browser state. Backend persistence requires{' '}
          <code className="font-bold">GET /api/v1/locations</code> and{' '}
          <code className="font-bold">GET /api/v1/enquiries?location=&amp;stage=&amp;date=&amp;search=&amp;page=</code>.
        </span>
      </div>

      {/* Add Lead Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Prospective Student Enquiry"
        subtitle="Record lead details for admissions counseling"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Child Athlete Name *</label>
              <input
                type="text"
                required
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="e.g. Samar Sen"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Child Age (Years) *</label>
              <input
                type="number"
                min="3"
                max="16"
                required
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
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
              <label className="text-xs font-bold text-[#172B50] block mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98..."
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Program Choice</label>
              <select
                value={interestedProgram}
                onChange={(e) => setInterestedProgram(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {data.programs.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Preferred Academy Center</label>
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

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Counselor / Trial Notes</label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Needs trial on Saturday morning. Prior gymnastics exposure..."
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Create Enquiry Lead
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
