import React, { useEffect, useState } from 'react';
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
  MapPin
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import { getCommonLocations } from '../../services/locationService';

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

  const filteredStudents = data.students.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'All' || s.center === selectedLocation;
    const matchesProgram = selectedProgram === 'All' || s.program === selectedProgram;
    return matchesSearch && matchesLocation && matchesProgram;
  });

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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#080B0C] tracking-tight">
            Spartan Student Roster
          </h1>
          <p className="text-xs sm:text-sm text-[#080B0C] opacity-75 mt-0.5">
            Manage athletes, track fitness progression, attendance and academy ranks
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#55CDB3] text-[#080B0C] font-bold rounded-xl shadow-sm hover:bg-[#55CDB3]/90 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Enroll New Athlete</span>
        </button>
      </div>

      {/* Filter and Search Bar: Pure White (#FFFFFF) */}
      <div className="bg-[#F4F7F6] rounded-2xl p-4 border border-[#493548]/20 shadow-card flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-[#493548] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student, ID, or parent..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#493548]/15 text-[#080B0C] placeholder-[#493548] border border-[#493548]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#55CDB3]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#080B0C] whitespace-nowrap inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#55CDB3]" />
              <span>Location:</span>
            </label>
            <select
              aria-label="Filter students by location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-[#493548]/15 text-[#080B0C] border border-[#493548]/20 outline-none cursor-pointer focus:ring-2 focus:ring-[#55CDB3]"
            >
              <option value="All">All Locations ({data.students.length})</option>
              {commonLocations.map(loc => (
                <option key={loc.id} value={loc.name}>
                  {loc.name} ({data.students.filter(s => s.center === loc.name).length})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#080B0C] whitespace-nowrap">Program:</label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-[#493548]/15 text-[#080B0C] border border-[#493548]/20 outline-none cursor-pointer focus:ring-2 focus:ring-[#55CDB3]"
            >
              <option value="All">All Sports Programs</option>
              {data.programs.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student Cards & Table: Pure White (#FFFFFF) */}
      <div className="bg-[#F4F7F6] rounded-2xl border border-[#493548]/20 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#493548]/15 text-[#080B0C] font-extrabold uppercase tracking-wider text-[11px] border-b border-[#493548]/20">
                <th className="py-3.5 px-4">Athlete</th>
                <th className="py-3.5 px-4">Program & Center</th>
                <th className="py-3.5 px-4">Spartan Rank</th>
                <th className="py-3.5 px-4">Parent Details</th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4">Fee Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#493548]/15">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-[#493548]">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-[#55CDB3]/15/40 transition-colors">
                    
                    {/* Athlete Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#493548]/30 shrink-0"
                        />
                        <div>
                          <span className="font-extrabold text-[#080B0C] text-sm block leading-tight">
                            {student.name}
                          </span>
                          <span className="text-[10px] text-[#493548] font-semibold">
                            {student.id} • {student.age} yrs ({student.gender})
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Program */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#080B0C] block">{student.program}</span>
                      <span className="text-[10px] text-[#55CDB3] font-semibold block">{student.center}</span>
                      {(student.batchName || student.enrolledClasses?.length > 0) && (
                        <span className="text-[10px] text-[#493548]">
                          Batch: {student.batchName || student.enrolledClasses.join(', ')}
                        </span>
                      )}
                    </td>

                    {/* Rank */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#493548]/15 text-[#080B0C] border border-[#493548]/20">
                        <Shield className="w-3 h-3 text-[#55CDB3]" />
                        <span>{student.rank}</span>
                      </span>
                    </td>

                    {/* Parent */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#080B0C]">{student.parentName}</div>
                      <div className="text-[10px] text-[#493548]">{student.parentPhone}</div>
                    </td>

                    {/* Attendance */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-[#493548]/15 rounded-full overflow-hidden border border-[#493548]/20">
                          <div
                            style={{ width: `${student.attendanceRate}%` }}
                            className="h-full bg-[#55CDB3] rounded-full"
                          />
                        </div>
                        <span className="font-bold text-[#080B0C] text-[11px]">{student.attendanceRate}%</span>
                      </div>
                    </td>

                    {/* Fee Status */}
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        student.feeStatus === 'Paid'
                          ? 'bg-[#080B0C] text-[#F4F7F6]'
                          : 'bg-[#55CDB3] text-[#080B0C] font-bold'
                      }`}>
                        {student.feeStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewStudent(student)}
                          className="p-1.5 rounded-lg text-[#080B0C] hover:bg-[#55CDB3]/15 transition-colors cursor-pointer"
                          title="View Athlete Profile & Badges"
                        >
                          <Eye className="w-4 h-4 text-[#080B0C]" />
                        </button>
                        <button
                          onClick={() => setEditingStudent({ ...student })}
                          className="p-1.5 rounded-lg text-[#080B0C] hover:bg-[#55CDB3]/15 transition-colors cursor-pointer"
                          title="Edit Student Record"
                        >
                          <Edit3 className="w-4 h-4 text-[#080B0C]" />
                        </button>
                        <button
                          onClick={() => deleteStudent(student.id)}
                          className="p-1.5 rounded-lg text-[#080B0C] hover:bg-[#55CDB3]/15 hover:text-[#55CDB3] transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4 text-[#55CDB3]" />
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
            <div className="p-4 rounded-xl bg-[#493548]/15 border border-[#493548]/20 flex items-center gap-4">
              <img
                src={viewStudent.avatar}
                alt={viewStudent.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#55CDB3]"
              />
              <div>
                <h4 className="text-base font-extrabold text-[#080B0C]">{viewStudent.name}</h4>
                <p className="text-xs font-bold text-[#55CDB3]">{viewStudent.rank} • {viewStudent.status || 'Active'}</p>
                <p className="text-xs text-[#080B0C] opacity-75 mt-0.5">
                  {viewStudent.program} • {viewStudent.center}
                </p>
                {(viewStudent.enquiryId || viewStudent.parentId) && (
                  <p className="text-[10px] font-semibold text-[#493548] mt-0.5">
                    {viewStudent.enquiryId ? `Enquiry: ${viewStudent.enquiryId}` : ''}
                    {viewStudent.enquiryId && viewStudent.parentId ? ' • ' : ''}
                    {viewStudent.parentId ? `Parent: ${viewStudent.parentId}` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Badges Earned */}
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#080B0C] block mb-2">
                Badges & Spartan Honors
              </span>
              <div className="flex flex-wrap gap-2">
                {viewStudent.badges?.map((b, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-[#F4F7F6] text-[#080B0C] border border-[#55CDB3] flex items-center gap-1.5 shadow-sm"
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#55CDB3]" />
                    <span>{b}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Medical / Fitness Notes */}
            <div className="p-3.5 rounded-xl bg-[#F4F7F6] border border-[#493548]/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#080B0C] mb-1">
                <Heart className="w-4 h-4 text-[#55CDB3]" />
                <span>Medical & Physical Conditioning Notes</span>
              </div>
              <p className="text-xs text-[#080B0C] opacity-80 leading-relaxed">
                {viewStudent.medicalNote || 'No special restrictions recorded. Certified fit for agility and strength routines.'}
              </p>
            </div>

            {/* Parent Contact */}
            <div className="p-3.5 rounded-xl bg-[#493548]/15 border border-[#493548]/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#493548]">Parent / Emergency Contact</span>
                <p className="text-xs font-bold text-[#080B0C]">{viewStudent.parentName}</p>
                <p className="text-xs text-[#080B0C] opacity-75">{viewStudent.parentPhone}</p>
              </div>
              <a
                href={`tel:${viewStudent.parentPhone}`}
                className="px-3 py-1.5 rounded-lg bg-[#080B0C] text-[#F4F7F6] text-xs font-bold flex items-center gap-1.5 hover:bg-[#55CDB3] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-white" />
                <span>Call Parent</span>
              </a>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setViewStudent(null)}
                className="px-4 py-2 text-xs font-bold bg-[#080B0C] text-[#F4F7F6] rounded-xl hover:bg-[#55CDB3] transition-colors"
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
            <label className="text-xs font-bold text-[#080B0C] block mb-1">Athlete Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Samarth Reddy"
              className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Age *</label>
              <input
                type="number"
                min="3"
                max="16"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Sport Program *</label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              >
                {data.programs.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Academy Center *</label>
              <select
                value={center}
                onChange={(e) => setCenter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              >
                {commonLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Parent's Name"
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Parent Phone Number *</label>
              <input
                type="tel"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="+91 99..."
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#080B0C] block mb-1">Medical / Health Notes</label>
            <input
              type="text"
              value={medicalNote}
              onChange={(e) => setMedicalNote(e.target.value)}
              placeholder="e.g. Allergies, asthma, past sprains..."
              className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#493548]/20 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#080B0C] hover:bg-[#55CDB3]/15 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#55CDB3] text-[#080B0C] font-bold rounded-xl shadow-sm hover:bg-[#55CDB3]/90 active:scale-95 transition-all"
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
                <label className="text-xs font-bold text-[#080B0C] block mb-1">Student Name *</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#080B0C] block mb-1">Status</label>
                <select
                  value={editingStudent.status || 'Active'}
                  onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl"
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#080B0C] block mb-1">Academy Location *</label>
                <select
                  value={editingStudent.center || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, center: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl"
                >
                  {commonLocations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#080B0C] block mb-1">Sports Program *</label>
                <select
                  value={editingStudent.program || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, program: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl"
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
                <label className="text-xs font-bold text-[#080B0C] block mb-1">Parent Phone</label>
                <input
                  type="tel"
                  value={editingStudent.parentPhone || ''}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, parentPhone: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#080B0C] block mb-1">Parent Email</label>
                <input
                  type="email"
                  value={editingStudent.parentEmail || ''}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, parentEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#493548]/20 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-[#080B0C] hover:bg-[#55CDB3]/15 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-[#55CDB3] text-[#080B0C] font-bold rounded-xl cursor-pointer"
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
