import React, { useEffect, useState } from 'react';
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
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import { getCommonLocations } from '../../services/locationService';

export default function ParentManagement() {
  const { data, addParent, updateParent, addToast, focusedRecord, setFocusedRecord } = useCrm();
  const commonLocations = getCommonLocations(data);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [highlightedParentId, setHighlightedParentId] = useState(null);

  useEffect(() => {
    if (focusedRecord?.type === 'parent' && focusedRecord.id) {
      const target = (data.parents || []).find((p) => p.id === focusedRecord.id);
      if (target) {
        setHighlightedParentId(target.id);
        setSelectedLocation('All');
        setSearchTerm(target.id);
      }
      setFocusedRecord(null);
    }
  }, [focusedRecord, data.parents, setFocusedRecord]);

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
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#080B0C] tracking-tight">
            Parent Directory &amp; Billing
          </h1>
          <p className="text-xs sm:text-sm text-[#080B0C] opacity-75 mt-0.5">
            Add parents by academy location, link their children &amp; issue Parent Portal access
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#55CDB3] text-[#080B0C] font-bold rounded-xl shadow-sm hover:bg-[#55CDB3]/90 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add Parent</span>
        </button>
      </div>

      {/* Search & Location Filter Bar */}
      <div className="bg-[#F4F7F6] rounded-2xl p-4 border border-[#493548]/20 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#493548] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search parent by name, phone or email..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#493548]/15 text-[#080B0C] placeholder-[#493548] border border-[#493548]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#55CDB3]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#080B0C] whitespace-nowrap inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#55CDB3]" />
              <span>Location:</span>
            </label>
            <select
              aria-label="Filter parents by academy location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-[#493548]/15 text-[#080B0C] border border-[#493548]/20 outline-none cursor-pointer focus:ring-2 focus:ring-[#55CDB3]"
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

        <span className="text-xs font-bold text-[#080B0C] whitespace-nowrap">
          Total Guardians: {filteredParents.length}
        </span>
      </div>

      {/* Parents Grid or Empty State */}
      {filteredParents.length === 0 ? (
        <div className="bg-[#F4F7F6] rounded-2xl p-10 border border-[#493548]/20 shadow-card text-center space-y-3">
          <Users className="w-10 h-10 text-[#55CDB3] opacity-75 mx-auto" />
          <h3 className="text-sm font-extrabold text-[#080B0C]">
            {selectedLocation === 'All'
              ? 'No Parents Added Yet'
              : `No Parents Registered Under ${selectedLocation}`}
          </h3>
          <p className="text-xs text-[#493548] max-w-md mx-auto">
            Click <strong>Add Parent</strong> to register a guardian under a Chennai branch location, link their children, and grant immediate Parent Portal login access.
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#55CDB3] text-[#080B0C] font-bold rounded-xl shadow-sm hover:bg-[#55CDB3]/90 transition-all"
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
              <div
                key={parent.id}
                className={`bg-[#F4F7F6] rounded-2xl p-5 border shadow-card flex flex-col justify-between hover:shadow-dropdown transition-shadow ${
                  highlightedParentId === parent.id ? 'border-[#55CDB3] ring-2 ring-[#55CDB3]/40' : 'border-[#493548]/20'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#55CDB3]">
                        {parent.id} • {parent.center}
                      </span>
                      <h3 className="text-base font-extrabold text-[#080B0C] mt-0.5">{parent.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingParent({ ...parent })}
                        title="Edit Parent Record"
                        className="p-1.5 rounded-lg bg-[#493548]/15 text-[#080B0C] hover:text-[#55CDB3] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        parent.pendingDue === '₹0'
                          ? 'bg-[#080B0C] text-[#F4F7F6]'
                          : 'bg-[#55CDB3] text-[#080B0C] font-bold'
                      }`}>
                        {parent.pendingDue === '₹0' ? 'No Dues' : `Due ${parent.pendingDue}`}
                      </span>
                    </div>
                  </div>

                  {/* Portal Access Pill */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {linkedAccount ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Parent Portal: {linkedAccount.status}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-[#493548]">
                        Directory Record
                      </span>
                    )}
                    {linkedAccount?.tempPasswordDisplay && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#493548]/15 text-[#080B0C] border border-[#493548]/20">
                        <Key className="w-2.5 h-2.5 text-[#55CDB3]" />
                        {linkedAccount.tempPasswordDisplay}
                      </span>
                    )}
                  </div>

                  {/* Children enrolled */}
                  <div className="mt-3 p-2.5 rounded-xl bg-[#493548]/15 border border-[#493548]/20">
                    <span className="text-[10px] font-bold uppercase text-[#080B0C] opacity-65 block mb-1">
                      Enrolled Spartan Children:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(parent.children || []).length === 0 ? (
                        <span className="text-[11px] text-[#493548]">No children linked yet</span>
                      ) : (
                        parent.children.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md text-xs font-extrabold bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20">
                            {c}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="mt-3 space-y-1.5 text-xs text-[#080B0C]">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#55CDB3]" />
                      <span className="font-semibold">{parent.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#55CDB3]" />
                      <span className="opacity-80 truncate">{parent.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#55CDB3]" />
                      <span className="opacity-75 truncate">{parent.address}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#493548]/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#493548] block">Lifetime Tuition</span>
                    <span className="text-xs font-extrabold text-[#080B0C]">{parent.totalFeesPaid}</span>
                  </div>

                  {parent.pendingDue !== '₹0' ? (
                    <button
                      onClick={() => handleSendReminder(parent.name)}
                      className="px-3 py-1.5 text-xs font-bold bg-[#55CDB3] text-[#080B0C] font-bold rounded-lg shadow-sm hover:bg-[#55CDB3]/90 transition-all flex items-center gap-1"
                    >
                      <Send className="w-3 h-3 text-white" />
                      <span>Send Reminder</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-[#080B0C] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-[#55CDB3]" />
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
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Karthik Subramanian"
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Academy Location *</label>
              <select
                value={center}
                onChange={(e) => handleLocationFormChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              >
                {commonLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98..."
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Parent Email ID *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#080B0C] block mb-1">Residential Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={`e.g. ${center}, Chennai`}
              className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
            />
          </div>

          {locationStudents.length > 0 && (
            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">
                Link Enrolled Children ({center})
              </label>
              <div className="max-h-28 overflow-y-auto border border-[#493548]/20 rounded-xl p-2 space-y-1 bg-[#493548]/15/40">
                {locationStudents.map(stu => (
                  <label key={stu.id} className="flex items-center gap-2 text-xs text-[#080B0C] cursor-pointer hover:bg-[#F4F7F6] p-1.5 rounded-lg">
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
                      className="rounded border-[#493548]/20 text-[#55CDB3] focus:ring-[#55CDB3]"
                    />
                    <span className="font-bold">{stu.name}</span>
                    <span className="opacity-65">({stu.program})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#080B0C] block mb-1">
              Child Name(s) {locationStudents.length > 0 ? '(Optional / Additional)' : ''}
            </label>
            <input
              type="text"
              value={customChildName}
              onChange={(e) => setCustomChildName(e.target.value)}
              placeholder="e.g. Pranav Karthik (comma-separated for siblings)"
              className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
            />
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#493548]/15 border border-[#493548]/20 cursor-pointer">
            <input
              type="checkbox"
              checked={grantPortalAccess}
              onChange={(e) => setGrantPortalAccess(e.target.checked)}
              className="rounded border-[#493548]/20 text-[#55CDB3] focus:ring-[#55CDB3]"
            />
            <div>
              <span className="text-xs font-extrabold text-[#080B0C] block">
                Grant Parent Portal Login Access Immediately
              </span>
              <span className="text-[10px] text-[#493548]">
                Issues a Parent account in Account Management with a temporary login password
              </span>
            </div>
          </label>

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
              Save Parent &amp; Grant Access
            </button>
          </div>
        </form>
      </Modal>
      {/* Edit Parent Modal */}
      <Modal
        isOpen={Boolean(editingParent)}
        onClose={() => setEditingParent(null)}
        title={editingParent ? `Edit Parent: ${editingParent.id}` : 'Edit Parent'}
        subtitle="Update guardian contact info or academy location"
      >
        {editingParent && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateParent(editingParent.id, {
                name: editingParent.name,
                phone: editingParent.phone,
                email: editingParent.email,
                center: editingParent.center,
                address: editingParent.address,
              });
              setEditingParent(null);
            }}
            className="space-y-3.5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#080B0C] block mb-1">Parent Name *</label>
                <input
                  type="text"
                  required
                  value={editingParent.name || ''}
                  onChange={(e) => setEditingParent({ ...editingParent, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#080B0C] block mb-1">Academy Location *</label>
                <select
                  value={editingParent.center || ''}
                  onChange={(e) => setEditingParent({ ...editingParent, center: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl"
                >
                  {commonLocations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#080B0C] block mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={editingParent.phone || ''}
                  onChange={(e) => setEditingParent({ ...editingParent, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#080B0C] block mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={editingParent.email || ''}
                  onChange={(e) => setEditingParent({ ...editingParent, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Address</label>
              <input
                type="text"
                value={editingParent.address || ''}
                onChange={(e) => setEditingParent({ ...editingParent, address: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/20 rounded-xl"
              />
            </div>

            <div className="pt-3 border-t border-[#493548]/20 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingParent(null)}
                className="px-4 py-2 text-xs font-semibold text-[#080B0C] hover:bg-[#55CDB3]/15 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-[#55CDB3] text-[#080B0C] font-bold rounded-xl cursor-pointer"
              >
                Save Parent
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
