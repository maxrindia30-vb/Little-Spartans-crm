import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Trash2, 
  Eye, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Trophy,
  Heart,
  Phone
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';

export default function StudentManagement() {
  const { data, addStudent, deleteStudent } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState('7');
  const [gender, setGender] = useState('Male');
  const [program, setProgram] = useState(data.programs[0]?.name || '');
  const [center, setCenter] = useState(data.academy.centers[0] || 'Indiranagar Arena');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [medicalNote, setMedicalNote] = useState('');

  const filteredStudents = data.students.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = selectedProgram === 'All' || s.program === selectedProgram;
    return matchesSearch && matchesProgram;
  });

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
      coachName: 'Coach Vikram Singh'
    });

    setIsAddOpen(false);
    setName('');
    setParentName('');
    setParentPhone('');
    setMedicalNote('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Spartan Student Roster
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Manage athletes, track fitness progression, attendance and academy ranks
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Enroll New Athlete</span>
        </button>
      </div>

      {/* Filter and Search Bar: Pure White (#FFFFFF) */}
      <div className="bg-white rounded-2xl p-4 border border-[#172B501A] shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#172B50] opacity-50 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student, ID, or parent..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] placeholder-[#172B5080] border border-[#172B5020] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-bold text-[#172B50] whitespace-nowrap">Program:</label>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none"
          >
            <option value="All">All Sports Programs</option>
            {data.programs.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Cards & Table: Pure White (#FFFFFF) */}
      <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FFF4E8] text-[#172B50] font-extrabold uppercase tracking-wider text-[11px] border-b border-[#172B5015]">
                <th className="py-3.5 px-4">Athlete</th>
                <th className="py-3.5 px-4">Program & Center</th>
                <th className="py-3.5 px-4">Spartan Rank</th>
                <th className="py-3.5 px-4">Parent Details</th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4">Fee Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172B5010]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-[#172B50] opacity-60">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-[#FFF4E8]/40 transition-colors">
                    
                    {/* Athlete Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#172B5020] shrink-0"
                        />
                        <div>
                          <span className="font-extrabold text-[#172B50] text-sm block leading-tight">
                            {student.name}
                          </span>
                          <span className="text-[10px] text-[#172B50] opacity-60 font-semibold">
                            {student.id} • {student.age} yrs ({student.gender})
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Program */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#172B50] block">{student.program}</span>
                      <span className="text-[10px] text-[#F4510B] font-semibold">{student.center}</span>
                    </td>

                    {/* Rank */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020]">
                        <Shield className="w-3 h-3 text-[#F4510B]" />
                        <span>{student.rank}</span>
                      </span>
                    </td>

                    {/* Parent */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#172B50]">{student.parentName}</div>
                      <div className="text-[10px] text-[#172B50] opacity-70">{student.parentPhone}</div>
                    </td>

                    {/* Attendance */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-[#FFF4E8] rounded-full overflow-hidden border border-[#172B5015]">
                          <div
                            style={{ width: `${student.attendanceRate}%` }}
                            className="h-full bg-[#F4510B] rounded-full"
                          />
                        </div>
                        <span className="font-bold text-[#172B50] text-[11px]">{student.attendanceRate}%</span>
                      </div>
                    </td>

                    {/* Fee Status */}
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        student.feeStatus === 'Paid'
                          ? 'bg-[#172B50] text-white'
                          : 'bg-[#F4510B] text-white'
                      }`}>
                        {student.feeStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewStudent(student)}
                          className="p-1.5 rounded-lg text-[#172B50] hover:bg-[#FFF4E8] transition-colors"
                          title="View Athlete Profile & Badges"
                        >
                          <Eye className="w-4 h-4 text-[#172B50]" />
                        </button>
                        <button
                          onClick={() => deleteStudent(student.id)}
                          className="p-1.5 rounded-lg text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] transition-colors"
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
                <h4 className="text-base font-extrabold text-[#172B50]">{viewStudent.name}</h4>
                <p className="text-xs font-bold text-[#F4510B]">{viewStudent.rank}</p>
                <p className="text-xs text-[#172B50] opacity-75 mt-0.5">
                  {viewStudent.program} • {viewStudent.center}
                </p>
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
                {data.academy.centers.map(c => (
                  <option key={c} value={c}>{c}</option>
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

    </div>
  );
}
