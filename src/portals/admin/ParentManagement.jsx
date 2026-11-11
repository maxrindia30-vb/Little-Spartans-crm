import React, { useState } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  Plus,
  Key,
  ShieldCheck
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import { getCommonLocations } from '../../services/locationService';

export default function ParentManagement() {
  const { data, addParent, addToast } = useCrm();
  const commonLocations = getCommonLocations(data);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add Parent Modal form states
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [center, setCenter] = useState(commonLocations[0]?.name || 'KK NAGAR');
  const [address, setAddress] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [customChildName, setCustomChildName] = useState('');
  const [grantPortalAccess, setGrantPortalAccess] = useState(true);

  const filteredParents = (data.parents || []).filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone || '').includes(searchTerm) ||
      (p.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'All' || p.center === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const locationStudents = (data.students || []).filter(
    s => s.center === center
  );

  const handleOpenAddModal = () => {
    if (selectedLocation !== 'All') {
      setCenter(selectedLocation);
    } else {
      setCenter(commonLocations[0]?.name || 'KK NAGAR');
    }
    setSelectedStudentIds([]);
    setIsAddOpen(true);
  };

  const handleLocationFormChange = (nextLoc) => {
    setCenter(nextLoc);
    setSelectedStudentIds([]);
  };

  const handleAddParentSubmit = (e) => {
    e.preventDefault();
    if (!parentName.trim() || !phone.trim() || !email.trim()) {
      addToast('Please fill in Parent Name, Phone Number, and Email ID.', 'error');
      return;
    }

    const linkedNames = (data.students || [])
      .filter(s => selectedStudentIds.includes(s.id))
      .map(s => s.name);

    const extraChildren = customChildName
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const allChildren = Array.from(new Set([...linkedNames, ...extraChildren]));

    const res = addParent({
      name: parentName,
      phone,
      email,
      center,
      address,
      children: allChildren,
      linkedStudentIds: selectedStudentIds,
      grantPortalAccess,
    });

    if (res?.success) {
      setIsAddOpen(false);
      setParentName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setSelectedStudentIds([]);
      setCustomChildName('');
      setGrantPortalAccess(true);
    }
  };

  const handleSendReminder = (name) => {
    addToast(`SMS payment reminder dispatched to ${name}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Parent Directory &amp; Billing
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Add parents by academy location, link their children &amp; issue Parent Portal access
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add Parent</span>
        </button>
      </div>

      {/* Search & Location Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#172B501A] shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#172B50] opacity-50 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search parent by name, phone or email..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] placeholder-[#172B5080] border border-[#172B5020] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#172B50] whitespace-nowrap inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
              <span>Location:</span>
            </label>
            <select
              aria-label="Filter parents by academy location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none cursor-pointer focus:ring-2 focus:ring-[#F4510B]"
            >
              <option value="All">All Locations ({(data.parents || []).length})</option>
              {commonLocations.map(loc => (
                <option key={loc.id} value={loc.name}>
                  {loc.name} ({(data.parents || []).filter(p => p.center === loc.name).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs font-bold text-[#172B50] whitespace-nowrap">
          Total Guardians: {filteredParents.length}
        </span>
      </div>

      {/* Parents Grid or Empty State */}
      {filteredParents.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-[#172B501A] shadow-card text-center space-y-3">
          <Users className="w-10 h-10 text-[#F4510B] opacity-75 mx-auto" />
          <h3 className="text-sm font-extrabold text-[#172B50]">
            {selectedLocation === 'All'
              ? 'No Parents Added Yet'
              : `No Parents Registered Under ${selectedLocation}`}
          </h3>
          <p className="text-xs text-[#172B50] opacity-70 max-w-md mx-auto">
            Click <strong>Add Parent</strong> to register a guardian under a Chennai branch location, link their children, and grant immediate Parent Portal login access.
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Parent</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredParents.map(parent => {
            const linkedAccount = (data.userAccounts || []).find(
              acc => acc.role === 'parent' && acc.email.toLowerCase() === (parent.email || '').toLowerCase()
            );

            return (
              <div key={parent.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card flex flex-col justify-between hover:shadow-dropdown transition-shadow">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F4510B]">
                        {parent.id} • {parent.center}
                      </span>
                      <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{parent.name}</h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      parent.pendingDue === '₹0'
                        ? 'bg-[#172B50] text-white'
                        : 'bg-[#F4510B] text-white'
                    }`}>
                      {parent.pendingDue === '₹0' ? 'No Dues' : `Due ${parent.pendingDue}`}
                    </span>
                  </div>

                  {/* Portal Access Pill */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {linkedAccount ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Parent Portal: {linkedAccount.status}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-[#172B50] opacity-70">
                        Directory Record
                      </span>
                    )}
                    {linkedAccount?.tempPasswordDisplay && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5015]">
                        <Key className="w-2.5 h-2.5 text-[#F4510B]" />
                        {linkedAccount.tempPasswordDisplay}
                      </span>
                    )}
                  </div>

                  {/* Children enrolled */}
                  <div className="mt-3 p-2.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015]">
                    <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-65 block mb-1">
                      Enrolled Spartan Children:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(parent.children || []).length === 0 ? (
                        <span className="text-[11px] text-[#172B50] opacity-60">No children linked yet</span>
                      ) : (
                        parent.children.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md text-xs font-extrabold bg-white text-[#172B50] border border-[#172B5020]">
                            {c}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="mt-3 space-y-1.5 text-xs text-[#172B50]">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#F4510B]" />
                      <span className="font-semibold">{parent.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#F4510B]" />
                      <span className="opacity-80 truncate">{parent.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                      <span className="opacity-75 truncate">{parent.address}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#172B5015] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#172B50] opacity-60 block">Lifetime Tuition</span>
                    <span className="text-xs font-extrabold text-[#172B50]">{parent.totalFeesPaid}</span>
                  </div>

                  {parent.pendingDue !== '₹0' ? (
                    <button
                      onClick={() => handleSendReminder(parent.name)}
                      className="px-3 py-1.5 text-xs font-bold bg-[#F4510B] text-white rounded-lg shadow-sm hover:brightness-110 transition-all flex items-center gap-1"
                    >
                      <Send className="w-3 h-3 text-white" />
                      <span>Send Reminder</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-[#172B50] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-[#F4510B]" />
                      <span>All Clear</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Parent Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Parent & Grant Portal Access"
        subtitle="Register guardian with academy location and enable Parent Portal login"
      >
        <form onSubmit={handleAddParentSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Karthik Subramanian"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Academy Location *</label>
              <select
                value={center}
                onChange={(e) => handleLocationFormChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {commonLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Parent Email ID *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Residential Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={`e.g. ${center}, Chennai`}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          {locationStudents.length > 0 && (
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">
                Link Enrolled Children ({center})
              </label>
              <div className="max-h-28 overflow-y-auto border border-[#172B5020] rounded-xl p-2 space-y-1 bg-[#FFF4E8]/40">
                {locationStudents.map(stu => (
                  <label key={stu.id} className="flex items-center gap-2 text-xs text-[#172B50] cursor-pointer hover:bg-white p-1.5 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(stu.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIds([...selectedStudentIds, stu.id]);
                        } else {
                          setSelectedStudentIds(selectedStudentIds.filter(id => id !== stu.id));
                        }
                      }}
                      className="rounded border-[#172B5030] text-[#F4510B] focus:ring-[#F4510B]"
                    />
                    <span className="font-bold">{stu.name}</span>
                    <span className="opacity-65">({stu.program})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">
              Child Name(s) {locationStudents.length > 0 ? '(Optional / Additional)' : ''}
            </label>
            <input
              type="text"
              value={customChildName}
              onChange={(e) => setCustomChildName(e.target.value)}
              placeholder="e.g. Pranav Karthik (comma-separated for siblings)"
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FFF4E8] border border-[#172B5015] cursor-pointer">
            <input
              type="checkbox"
              checked={grantPortalAccess}
              onChange={(e) => setGrantPortalAccess(e.target.checked)}
              className="rounded border-[#172B5030] text-[#F4510B] focus:ring-[#F4510B]"
            />
            <div>
              <span className="text-xs font-extrabold text-[#172B50] block">
                Grant Parent Portal Login Access Immediately
              </span>
              <span className="text-[10px] text-[#172B50] opacity-70">
                Issues a Parent account in Account Management with a temporary login password
              </span>
            </div>
          </label>

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
              Save Parent &amp; Grant Access
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
