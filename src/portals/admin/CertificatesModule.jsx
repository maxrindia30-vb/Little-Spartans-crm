import React, { useState } from 'react';
import { Award, Plus, Download, Printer, Shield, Trophy, CheckCircle2 } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';

export default function CertificatesModule() {
  const { data, setData, addToast } = useCrm();

  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState(null);

  // Form states
  const [studentId, setStudentId] = useState(data.students[0]?.id || '');
  const [title, setTitle] = useState('Spartan Agility Master Level 1');
  const [category, setCategory] = useState('Milestone Achievement');
  const [issuer, setIssuer] = useState('Academy Director, Little Spartans');

  const handleIssue = (e) => {
    e.preventDefault();
    const stu = data.students.find(s => s.id === studentId) || data.students[0];
    if (!stu) {
      addToast('Enroll a student first before issuing a certificate.', 'error');
      return;
    }

    const newCert = {
      id: `CERT-${String(data.certificates.length + 1).padStart(3, '0')}`,
      studentId: stu.id,
      studentName: stu.name,
      title,
      category,
      issuer,
      issuedDate: new Date().toISOString().split('T')[0],
      badgeIcon: 'Shield'
    };

    setData(prev => ({
      ...prev,
      certificates: [newCert, ...prev.certificates]
    }));
    addToast(`Spartan Certificate issued to ${stu.name}!`);
    setIsIssueOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Certificates & Spartan Honors
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Issue verified milestone awards, tournament medals and course graduation certificates
          </p>
        </div>

        <button
          onClick={() => setIsIssueOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Issue New Certificate</span>
        </button>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.certificates.map(cert => (
          <div key={cert.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card flex flex-col justify-between hover:shadow-dropdown transition-shadow">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F4510B]">
                    {cert.category}
                  </span>
                  <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{cert.title}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#FFF4E8] flex items-center justify-center shrink-0 border border-[#172B5015]">
                  <Trophy className="w-5 h-5 text-[#F4510B]" />
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-[#FFF4E8] border border-[#172B5015]">
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">Awarded To</span>
                <p className="text-sm font-black text-[#172B50] mt-0.5">{cert.studentName}</p>
                <p className="text-[11px] text-[#172B50] opacity-75 mt-1">Issued: {cert.issuedDate}</p>
              </div>

              <p className="mt-3 text-[11px] text-[#172B50] opacity-70">
                Authorized By: <span className="font-bold">{cert.issuer}</span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#172B5015] flex items-center justify-between">
              <span className="text-[10px] text-[#172B50] opacity-50">{cert.id}</span>
              <button
                onClick={() => setPreviewCert(cert)}
                className="px-3 py-1.5 text-xs font-bold bg-[#172B50] text-white hover:bg-[#F4510B] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-white" />
                <span>View Certificate</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Issue Certificate Modal */}
      <Modal
        isOpen={isIssueOpen}
        onClose={() => setIsIssueOpen(false)}
        title="Issue Spartan Academy Certificate"
        subtitle="Generate milestone achievement award for student"
      >
        <form onSubmit={handleIssue} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Select Athlete *</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            >
              {data.students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.program})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Certificate Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Spartan Sprint Gold Medalist"
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Award Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                <option value="Milestone Achievement">Milestone Achievement</option>
                <option value="Tournament Medal">Tournament Medal</option>
                <option value="Character & Value">Character & Value</option>
                <option value="Term Graduation">Term Graduation</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Signing Authority</label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsIssueOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Generate Certificate
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview Certificate Dialog: Gorgeous Spartan styling */}
      {previewCert && (
        <Modal
          isOpen={!!previewCert}
          onClose={() => setPreviewCert(null)}
          title="Certificate of Spartan Achievement"
          subtitle={`Credential ID: ${previewCert.id}`}
          maxWidth="max-w-2xl"
        >
          <div className="p-8 rounded-2xl bg-[#FFF4E8] border-4 border-[#172B50] text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-2 left-2 text-[#172B50] opacity-20 font-serif text-3xl">❖</div>
            <div className="absolute top-2 right-2 text-[#172B50] opacity-20 font-serif text-3xl">❖</div>
            <div className="absolute bottom-2 left-2 text-[#172B50] opacity-20 font-serif text-3xl">❖</div>
            <div className="absolute bottom-2 right-2 text-[#172B50] opacity-20 font-serif text-3xl">❖</div>

            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#172B50] flex items-center justify-center shadow-card border-2 border-[#F4510B]">
              <Shield className="w-8 h-8 text-[#F4510B] fill-[#F4510B]" />
            </div>

            <div className="uppercase tracking-widest text-xs font-extrabold text-[#F4510B]">
              LITTLE SPARTANS SPORTS ACADEMY
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">
              CERTIFICATE OF EXCELLENCE
            </h2>

            <p className="text-xs text-[#172B50] opacity-75">
              This official honors certificate is proudly awarded to:
            </p>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] border-b-2 border-[#F4510B] inline-block pb-1 px-8">
              {previewCert.studentName}
            </h3>

            <p className="text-xs text-[#172B50] max-w-md mx-auto leading-relaxed pt-2">
              For exemplary sportsmanship, discipline, motor agility and heroic effort in:
            </p>

            <p className="text-sm font-extrabold text-[#F4510B]">
              {previewCert.title}
            </p>

            <div className="pt-6 flex items-center justify-between border-t border-[#172B5020] text-xs">
              <div className="text-left">
                <span className="text-[10px] text-[#172B50] opacity-60 block">Date of Conferral</span>
                <span className="font-bold text-[#172B50]">{previewCert.issuedDate}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#172B50] opacity-60 block">Authorized Signatory</span>
                <span className="font-bold text-[#172B50]">{previewCert.issuer}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  addToast('Certificate downloaded in high-res PDF format.');
                  setPreviewCert(null);
                }}
                className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl hover:brightness-110 flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Download Printable PDF</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
