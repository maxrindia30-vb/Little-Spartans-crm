import React, { useState, useMemo, useRef } from 'react';
import {
  UserCheck,
  Star,
  Award,
  Phone,
  Mail,
  Calendar,
  Plus,
  CheckCircle2,
  User,
  UploadCloud,
  CreditCard,
  Landmark,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Search,
  Filter,
  ShieldCheck,
  Check,
  AlertCircle,
  FileCheck,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  Building2,
  MapPin,
  Sparkles,
  Download,
  Grid,
  List,
  Shield,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

// Spartan Helmet Logo matching the reference modal header
const SpartanHelmetIcon = ({ className = "w-8 h-8 text-[#F4510B]" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="currentColor">
    {/* Helmet Crest Feathers */}
    <path d="M26 3C17 3 10 9 7 17c3-2 7-3 11-3 8 0 15 5 18 12 1-3 2-6 2-9 0-9-5-14-12-14z" />
    {/* Helmet Body & Brow */}
    <path d="M11 18C6 21 3 26 3 33c0 8 6 14 14 15v-6c-3-1-5-4-5-8 0-2 1-5 3-6 2 2 4 4 7 4h5c3 0 5-2 7-4 2 2 3 4 3 6 0 4-2 7-5 8v6c8-1 14-7 14-15 0-7-3-12-8-15-3 2-7 4-12 4s-9-2-12-4z" />
    {/* Nose & Cheek Protector */}
    <path d="M22 28h4v12l-2 3-2-3V28z" />
  </svg>
);

// 8 Mandatory & Optional Document Definitions
const DOCUMENT_DEFINITIONS = [
  { key: 'resume', label: 'Resume / CV', required: true, icon: FileText, hint: 'PDF, DOCX (Max 5 MB)' },
  { key: 'aadhaar', label: 'Aadhaar Card', required: true, icon: ShieldCheck, hint: 'Govt. Photo Identity Proof' },
  { key: 'pan', label: 'PAN Card', required: true, icon: CreditCard, hint: 'Tax Identification Document' },
  { key: 'education', label: 'Educational Certificates', required: false, icon: FileCheck, hint: 'Degree / Diploma Certificate' },
  { key: 'coaching', label: 'Coaching Certificates', required: false, icon: Award, hint: 'Sports Federation / Level 1/2' },
  { key: 'contract', label: 'Signed Employment Contract', required: false, icon: FileText, hint: 'Academy Agreement Copy' },
  { key: 'photo', label: 'Passport-size Photo', required: false, icon: ImageIcon, hint: 'White background, JPG/PNG' },
  { key: 'bankProof', label: 'Bank Proof / Cancelled Cheque', required: false, icon: Landmark, hint: 'Passbook or Cancelled Cheque' },
];

const SPECIALIZATION_OPTIONS = [
  'Spartan Gymnastics & Agility',
  'Junior Football Champions',
  'Spartan Athletics & Sprinting',
  'Basketball Rising Stars',
  'Spartan Martial Arts & Karate',
  'Badminton & Racket Skills',
  'Cricket Youth Foundation',
  'Gymnastics & Conditioning',
  'Multi-Sport Motor Skills',
  'Other Specialization'
];

const BANK_OPTIONS = [
  'HDFC Bank',
  'State Bank of India',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Other Scheduled Bank'
];

const INITIAL_FORM_STATE = {
  // Step 1: Personal Information
  photo: null,
  name: '',
  dob: '',
  gender: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',

  // Step 2: Professional Information (Strictly only these 5)
  specialization: 'Spartan Gymnastics & Agility',
  experience: '5',
  certification: 'Certified Youth Specialist (Level 1)',
  sportsQualifications: 'B.P.Ed / State Championship Gold Medalist',
  skills: 'Agility Drills, Youth Biomechanics, Strength Conditioning, Injury Prevention',

  // Step 3: Documents Upload
  documents: {
    resume: { name: 'resume_profile.pdf', size: '1.2 MB', uploadedAt: '2026-11-20', status: 'uploaded' },
    aadhaar: { name: 'aadhaar_card_verified.pdf', size: '950 KB', uploadedAt: '2026-11-20', status: 'uploaded' },
    pan: { name: 'pan_card_copy.pdf', size: '820 KB', uploadedAt: '2026-11-20', status: 'uploaded' },
  },

  // Step 4: Salary & Bank Details
  accountHolderName: '',
  bankName: 'HDFC Bank',
  accountNumber: '',
  ifscCode: '',
  branchName: '',
  salaryType: 'Monthly',
  salaryAmount: '45,000',
  effectiveDate: '2026-12-01'
};

export default function CoachManagement() {
  const { data, addCoach, updateCoach, deleteCoach, addToast } = useCrm();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1 to 5 (Review)
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [uploadProgress, setUploadProgress] = useState({});

  // View / Edit / Delete modals
  const [viewingCoach, setViewingCoach] = useState(null);
  const [viewTab, setViewTab] = useState('personal'); // 'personal' | 'professional' | 'documents' | 'salary' | 'audit'
  const [showSensitiveBankDetails, setShowSensitiveBankDetails] = useState(false);

  const [editingCoach, setEditingCoach] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [editTab, setEditTab] = useState('personal');
  const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);

  const [coachToDelete, setCoachToDelete] = useState(null);

  // File input refs for Add Form
  const profilePhotoInputRef = useRef(null);
  const documentInputRefs = useRef({});

  // File input refs for Edit Form
  const editProfilePhotoInputRef = useRef(null);
  const editDocInputRefs = useRef({});

  // Filtered coaches
  const filteredCoaches = useMemo(() => {
    return (data.coaches || []).filter(coach => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (coach.name && coach.name.toLowerCase().includes(q)) ||
        (coach.id && coach.id.toLowerCase().includes(q)) ||
        (coach.email && coach.email.toLowerCase().includes(q)) ||
        (coach.phone && coach.phone.includes(q)) ||
        (coach.specialization && coach.specialization.toLowerCase().includes(q));

      const matchesSpec = selectedSpecialization === 'ALL' || coach.specialization === selectedSpecialization;
      const matchesStatus = selectedStatus === 'ALL' || coach.status === selectedStatus;

      return matchesSearch && matchesSpec && matchesStatus;
    });
  }, [data.coaches, searchQuery, selectedSpecialization, selectedStatus]);

  // KPIs
  const totalCoaches = (data.coaches || []).length;
  const activeCoaches = (data.coaches || []).filter(c => c.status === 'Active').length;
  const certifiedSpecialists = (data.coaches || []).filter(c => c.certification).length;
  const averageRating = useMemo(() => {
    const list = data.coaches || [];
    if (!list.length) return '5.0';
    const sum = list.reduce((acc, c) => acc + (parseFloat(c.rating) || 5.0), 0);
    return (sum / list.length).toFixed(1);
  }, [data.coaches]);

  // Handle Photo Upload
  const handlePhotoSelect = (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('Profile photo must be less than 2 MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (isEdit) {
        setEditFormData(prev => ({ ...prev, photo: dataUrl }));
      } else {
        setFormData(prev => ({ ...prev, photo: dataUrl }));
      }
      addToast('Profile photo attached successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Handle Document Upload Simulation
  const handleDocumentSelect = (docKey, e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('File size must be under 5 MB', 'error');
      return;
    }

    // Set simulated progress
    setUploadProgress(prev => ({ ...prev, [docKey]: 35 }));
    setTimeout(() => {
      setUploadProgress(prev => ({ ...prev, [docKey]: 75 }));
    }, 150);

    setTimeout(() => {
      setUploadProgress(prev => {
        const next = { ...prev };
        delete next[docKey];
        return next;
      });

      const docObj = {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'uploaded'
      };

      if (isEdit) {
        setEditFormData(prev => ({
          ...prev,
          documents: {
            ...(prev.documents || {}),
            [docKey]: docObj
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [docKey]: docObj
          }
        }));
      }

      addToast(`Document "${file.name}" uploaded successfully!`, 'success');
    }, 350);
  };

  const handleRemoveDocument = (docKey, isEdit = false) => {
    if (isEdit) {
      setEditFormData(prev => {
        const nextDocs = { ...(prev.documents || {}) };
        delete nextDocs[docKey];
        return { ...prev, documents: nextDocs };
      });
    } else {
      setFormData(prev => {
        const nextDocs = { ...prev.documents };
        delete nextDocs[docKey];
        return { ...prev, documents: nextDocs };
      });
    }
    addToast('Document removed', 'info');
  };

  // Validate step before advancing
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        addToast('Please enter Coach Full Name *', 'error');
        return;
      }
      if (!formData.dob) {
        addToast('Please provide Date of Birth *', 'error');
        return;
      }
      if (!formData.phone.trim()) {
        addToast('Please enter Phone Number *', 'error');
        return;
      }
      if (!formData.email.trim()) {
        addToast('Please enter Email Address *', 'error');
        return;
      }
      if (!formData.address.trim()) {
        addToast('Please enter Current Address *', 'error');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.specialization.trim()) {
        addToast('Please enter Coach Specialization *', 'error');
        return;
      }
    } else if (currentStep === 3) {
      // Step 3 Documents (Warn if mandatory docs missing but permit proceeding if confirmed)
      if (!formData.documents.resume && !formData.documents.aadhaar) {
        addToast('Tip: Resume and Aadhaar Card are highly recommended for verification.', 'info');
      }
    } else if (currentStep === 4) {
      // Step 4 Salary
      if (!formData.accountHolderName.trim()) {
        // Auto fill holder name from coach name if empty
        setFormData(prev => ({ ...prev, accountHolderName: prev.name }));
      }
    }

    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Submit new Coach Registration
  const handleSubmitNewCoach = () => {
    // Generate unique coach id internally
    const registeredCoach = addCoach({
      name: formData.name.trim(),
      dob: formData.dob,
      gender: formData.gender || 'Not Specified',
      phone: formData.phone.trim(),
      whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
      address: formData.address.trim(),
      photo: formData.photo || null,
      specialization: formData.specialization,
      experience: formData.experience ? `${formData.experience} Yrs` : '1 Yr',
      experienceYears: formData.experience,
      certification: formData.certification || 'Certified Spartan Coach',
      sportsQualifications: formData.sportsQualifications || 'Youth Coaching Certification',
      skills: formData.skills || 'Sports Training & Agility',
      documents: formData.documents,
      bankDetails: {
        accountHolderName: formData.accountHolderName.trim() || formData.name.trim(),
        bankName: formData.bankName,
        accountNumber: formData.accountNumber.trim() || '••••••••1234',
        ifscCode: (formData.ifscCode || 'HDFC0001234').toUpperCase().trim(),
        branchName: formData.branchName.trim() || 'Main Branch',
        salaryType: formData.salaryType,
        salaryAmount: formData.salaryAmount.trim() || '40,000',
        effectiveDate: formData.effectiveDate || new Date().toISOString().split('T')[0]
      },
      status: 'Active',
      rating: '5.0',
      activeBatches: 0,
      studentsCount: 0,
      auditLog: [
        {
          action: 'Coach Onboarded',
          performedBy: 'Admin (Super Admin)',
          timestamp: new Date().toISOString(),
          details: 'Official academy registration submitted via multi-step wizard.'
        }
      ]
    });

    addToast(`Coach ${registeredCoach.name} successfully registered with ID ${registeredCoach.id}!`, 'success');
    setIsAddOpen(false);
    setCurrentStep(1);
    setFormData(INITIAL_FORM_STATE);
  };

  // Open View Coach Profile
  const handleOpenViewProfile = (coach) => {
    // Fill in realistic fallback metadata for legacy coaches if not yet set
    const enrichedCoach = {
      ...coach,
      dob: coach.dob || '1995-04-12',
      gender: coach.gender || 'Male',
      whatsapp: coach.whatsapp || coach.phone || '+91 98840 55441',
      address: coach.address || '45, Spartan Avenue, Shanthi Colony, Chennai - 600040',
      sportsQualifications: coach.sportsQualifications || 'B.P.Ed, Senior State Champion & Gold Medalist',
      skills: coach.skills || 'Agility Drills, Youth Biomechanics, Strength Conditioning, Injury Prevention',
      documents: coach.documents || {
        resume: { name: `${coach.name.toLowerCase().replace(/\s+/g, '_')}_cv.pdf`, size: '1.4 MB', uploadedAt: '2026-01-10', status: 'uploaded' },
        aadhaar: { name: 'aadhaar_card_verified.pdf', size: '1.1 MB', uploadedAt: '2026-01-10', status: 'uploaded' },
        pan: { name: 'pan_card_copy.pdf', size: '780 KB', uploadedAt: '2026-01-10', status: 'uploaded' },
        education: { name: 'bped_degree_cert.pdf', size: '2.1 MB', uploadedAt: '2026-01-12', status: 'uploaded' },
        coaching: { name: 'national_federation_cert.pdf', size: '1.8 MB', uploadedAt: '2026-01-15', status: 'uploaded' }
      },
      bankDetails: coach.bankDetails || {
        accountHolderName: coach.name,
        bankName: 'HDFC Bank',
        accountNumber: '50100482910345',
        ifscCode: 'HDFC0001042',
        branchName: 'Anna Nagar, Chennai',
        salaryType: 'Monthly',
        salaryAmount: '48,000',
        effectiveDate: '2026-01-01'
      },
      auditLog: coach.auditLog || [
        {
          action: 'Initial Faculty Record Created',
          performedBy: 'System Administrator',
          timestamp: '2026-01-01T10:00:00.000Z',
          details: 'Certified Faculty profile added to academy roster'
        }
      ]
    };

    setViewingCoach(enrichedCoach);
    setViewTab('personal');
    setShowSensitiveBankDetails(false);
  };

  // Open Edit Coach Profile
  const handleOpenEditProfile = (coach) => {
    const enrichedCoach = {
      ...coach,
      dob: coach.dob || '1995-04-12',
      gender: coach.gender || 'Male',
      whatsapp: coach.whatsapp || coach.phone || '+91 98840 55441',
      address: coach.address || '45, Spartan Avenue, Shanthi Colony, Chennai - 600040',
      sportsQualifications: coach.sportsQualifications || 'B.P.Ed, Senior State Champion & Gold Medalist',
      skills: coach.skills || 'Agility Drills, Youth Biomechanics, Strength Conditioning, Injury Prevention',
      documents: coach.documents || {
        resume: { name: `${coach.name.toLowerCase().replace(/\s+/g, '_')}_cv.pdf`, size: '1.4 MB', uploadedAt: '2026-01-10', status: 'uploaded' },
        aadhaar: { name: 'aadhaar_card_verified.pdf', size: '1.1 MB', uploadedAt: '2026-01-10', status: 'uploaded' },
        pan: { name: 'pan_card_copy.pdf', size: '780 KB', uploadedAt: '2026-01-10', status: 'uploaded' },
      },
      bankDetails: coach.bankDetails || {
        accountHolderName: coach.name,
        bankName: 'HDFC Bank',
        accountNumber: '50100482910345',
        ifscCode: 'HDFC0001042',
        branchName: 'Anna Nagar, Chennai',
        salaryType: 'Monthly',
        salaryAmount: '48,000',
        effectiveDate: '2026-01-01'
      }
    };

    setEditingCoach(coach);
    setEditFormData({
      name: enrichedCoach.name,
      dob: enrichedCoach.dob,
      gender: enrichedCoach.gender,
      phone: enrichedCoach.phone,
      whatsapp: enrichedCoach.whatsapp,
      email: enrichedCoach.email,
      address: enrichedCoach.address,
      photo: enrichedCoach.photo || null,
      specialization: enrichedCoach.specialization,
      experience: enrichedCoach.experience?.replace(/\s*yrs?/i, '') || '5',
      certification: enrichedCoach.certification,
      sportsQualifications: enrichedCoach.sportsQualifications,
      skills: enrichedCoach.skills,
      documents: enrichedCoach.documents || {},
      accountHolderName: enrichedCoach.bankDetails.accountHolderName,
      bankName: enrichedCoach.bankDetails.bankName,
      accountNumber: enrichedCoach.bankDetails.accountNumber,
      ifscCode: enrichedCoach.bankDetails.ifscCode,
      branchName: enrichedCoach.bankDetails.branchName,
      salaryType: enrichedCoach.bankDetails.salaryType,
      salaryAmount: enrichedCoach.bankDetails.salaryAmount,
      effectiveDate: enrichedCoach.bankDetails.effectiveDate,
      status: enrichedCoach.status || 'Active'
    });
    setEditTab('personal');
    if (viewingCoach) setViewingCoach(null);
  };

  // Save changes to Coach Profile
  const handleConfirmSaveEdit = () => {
    if (!editFormData.name.trim()) {
      addToast('Coach Full Name is required', 'error');
      return;
    }

    const updates = {
      name: editFormData.name.trim(),
      dob: editFormData.dob,
      gender: editFormData.gender,
      phone: editFormData.phone.trim(),
      whatsapp: editFormData.whatsapp.trim(),
      email: editFormData.email.trim(),
      address: editFormData.address.trim(),
      photo: editFormData.photo,
      specialization: editFormData.specialization,
      experience: `${editFormData.experience} Yrs`,
      certification: editFormData.certification,
      sportsQualifications: editFormData.sportsQualifications,
      skills: editFormData.skills,
      documents: editFormData.documents,
      status: editFormData.status,
      bankDetails: {
        accountHolderName: editFormData.accountHolderName,
        bankName: editFormData.bankName,
        accountNumber: editFormData.accountNumber,
        ifscCode: editFormData.ifscCode,
        branchName: editFormData.branchName,
        salaryType: editFormData.salaryType,
        salaryAmount: editFormData.salaryAmount,
        effectiveDate: editFormData.effectiveDate
      },
      auditAction: 'Profile Updated',
      auditNote: 'Coach profile and credentials updated by Administrator'
    };

    updateCoach(editingCoach.id, updates);
    addToast(`Coach ${editFormData.name} profile updated successfully!`, 'success');
    setShowConfirmSaveModal(false);
    setEditingCoach(null);
    setEditFormData(null);
  };

  // Toggle coach active status
  const handleToggleStatus = (coach) => {
    const nextStatus = coach.status === 'Active' ? 'Inactive' : 'Active';
    updateCoach(coach.id, {
      status: nextStatus,
      auditAction: `Status changed to ${nextStatus}`,
      auditNote: `Coach status updated to ${nextStatus} by Administrator`
    });
    addToast(`Coach ${coach.name} marked as ${nextStatus}.`, 'info');
  };

  return (
    <div className="space-y-6">

      {/* ======================================================== */}
      {/* 1. Header with Spartan Helmet Badge & Add New Coach CTA   */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#F4510B] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#F4510B]/25">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight">
              Coach Management &amp; Faculty
            </h1>
            <p className="text-xs sm:text-sm text-[#172B50]/75 mt-0.5 font-medium">
              Faculty credentials, national certifications, assigned training batches and performance ratings
            </p>
          </div>
        </div>

        {/* Action Button: Matches reference image media_1795356270472_d6b08c80.png */}
        <button
          type="button"
          onClick={() => {
            setFormData(INITIAL_FORM_STATE);
            setCurrentStep(1);
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold bg-[#F4510B] text-white rounded-full shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white stroke-[2.5]" />
          <span>Add New Coach</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. Top 4 KPI Cards                                       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Faculty */}
        <div className="bg-white border border-[#172B5018] rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#172B50]/70">Total Faculty</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-[#F4510B]" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#172B50] mt-2">{totalCoaches}</div>
          <p className="text-[11px] font-semibold text-[#172B50]/60 mt-0.5">Official Roster</p>
        </div>

        {/* KPI 2: Active Faculty */}
        <div className="bg-white border border-[#172B5018] rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#172B50]/70">Active Coaches</span>
            <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#16A34A] mt-2">{activeCoaches}</div>
          <p className="text-[11px] font-semibold text-[#172B50]/60 mt-0.5">On Active Rotations</p>
        </div>

        {/* KPI 3: Certified Specialists */}
        <div className="bg-white border border-[#172B5018] rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#172B50]/70">Certified Faculty</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center">
              <Award className="w-4 h-4 text-[#F4510B]" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#172B50] mt-2">{certifiedSpecialists}</div>
          <p className="text-[11px] font-semibold text-[#172B50]/60 mt-0.5">National / Federation Lic.</p>
        </div>

        {/* KPI 4: Faculty Rating */}
        <div className="bg-white border border-[#172B5018] rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#172B50]/70">Avg. Rating</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center">
              <Star className="w-4 h-4 text-[#F4510B] fill-[#F4510B]" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#F4510B] mt-2">{averageRating} <span className="text-xs font-bold text-[#172B50]/60">/ 5.0</span></div>
          <p className="text-[11px] font-semibold text-[#172B50]/60 mt-0.5">Parent & Student Feedback</p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. Search & Filter Bar + View Toggle                     */}
      {/* ======================================================== */}
      <div className="bg-white border border-[#172B5018] rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#172B50]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by coach name, specialization, phone, email..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FFF4E8]/40 text-[#172B50] placeholder-[#172B50]/45 border border-[#172B5018] rounded-xl focus:ring-2 focus:ring-[#F4510B] focus:bg-white outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#172B50]/40 hover:text-[#172B50]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters & View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Specialization Filter */}
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-white text-[#172B50] border border-[#172B5018] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
          >
            <option value="ALL">All Disciplines</option>
            {SPECIALIZATION_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-white text-[#172B50] border border-[#172B5018] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Grid vs Table View Mode */}
          <div className="flex items-center bg-[#FFF4E8] p-1 rounded-xl border border-[#172B5015]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-[#F4510B] text-white shadow-2xs' : 'text-[#172B50]/70 hover:text-[#172B50]'
              }`}
              title="Card Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-[#F4510B] text-white shadow-2xs' : 'text-[#172B50]/70 hover:text-[#172B50]'
              }`}
              title="Table Directory View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. Coach Directory: Grid View vs Table View              */}
      {/* ======================================================== */}
      {filteredCoaches.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#172B5018] shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#FFF4E8] text-[#F4510B] mx-auto flex items-center justify-center mb-3">
            <UserCheck className="w-6 h-6 text-[#F4510B]" />
          </div>
          <h3 className="text-base font-extrabold text-[#172B50]">No Coaches Found</h3>
          <p className="text-xs text-[#172B50]/65 mt-1 max-w-sm mx-auto">
            No faculty profiles matched your search or filters. Try adjusting filters or register a new coach into the academy.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialization('ALL');
              setSelectedStatus('ALL');
            }}
            className="mt-4 px-4 py-2 text-xs font-bold text-[#F4510B] bg-[#FFF4E8] rounded-xl hover:bg-[#F4510B] hover:text-white transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCoaches.map((coach) => {
            const initials = coach.name
              ? coach.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
              : 'SC';

            return (
              <div
                key={coach.id}
                className="bg-white rounded-2xl p-5 border border-[#172B5018] shadow-card flex flex-col justify-between hover:shadow-dropdown transition-all group"
              >
                <div>
                  {/* Top card bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar / Photo */}
                      {coach.photo ? (
                        <img
                          src={coach.photo}
                          alt={coach.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-[#F4510B30] shadow-2xs shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30] font-black text-sm flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-[#F4510B] uppercase tracking-wider">
                            {coach.id}
                          </span>
                          <span className="text-[#172B50]/30">•</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            coach.status === 'Active' ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A20]' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {coach.status || 'Active'}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-[#172B50] group-hover:text-[#F4510B] transition-colors leading-tight mt-0.5">
                          {coach.name}
                        </h3>
                        <p className="text-[11px] font-semibold text-[#172B50]/75 line-clamp-1 mt-0.5">
                          {coach.specialization}
                        </p>
                      </div>
                    </div>

                    {/* Rating badge */}
                    <div className="flex items-center gap-1 bg-[#FFF4E8] px-2 py-1 rounded-xl border border-[#F4510B20] shrink-0">
                      <Star className="w-3.5 h-3.5 text-[#F4510B] fill-[#F4510B]" />
                      <span className="text-xs font-black text-[#172B50]">{coach.rating || '5.0'}</span>
                    </div>
                  </div>

                  {/* Certification highlight */}
                  <div className="mt-3.5 p-2.5 rounded-xl bg-[#FFF4E8]/70 border border-[#F4510B18] flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#F4510B] shrink-0" />
                    <span className="text-[11px] font-bold text-[#172B50] truncate">
                      {coach.certification || 'Certified Youth Coach'}
                    </span>
                  </div>

                  {/* Experience & stats */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#172B5010] text-xs">
                    <div className="p-2 rounded-xl bg-gray-50/60 border border-[#172B5010]">
                      <span className="text-[10px] font-semibold text-[#172B50]/60 block">Coaching Experience</span>
                      <span className="font-extrabold text-[#172B50] text-xs">{coach.experience || '5 Yrs'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-gray-50/60 border border-[#172B5010]">
                      <span className="text-[10px] font-semibold text-[#172B50]/60 block">Active Batches</span>
                      <span className="font-extrabold text-[#F4510B] text-xs">{coach.activeBatches || 2} Batches</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-3 space-y-1.5 text-xs text-[#172B50]">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                      <span className="font-semibold">{coach.phone || '+91 98840 55441'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                      <span className="font-medium text-[#172B50]/80 truncate">{coach.email}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-4 pt-3 border-t border-[#172B5012] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenViewProfile(coach)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#172B50] bg-[#FFF4E8] hover:bg-[#F4510B] hover:text-white rounded-xl transition-all cursor-pointer"
                      title="View Complete Profile & Documents"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditProfile(coach)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#172B50] bg-gray-100 hover:bg-[#172B50] hover:text-white rounded-xl transition-all cursor-pointer"
                      title="Edit Coach Profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(coach)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      coach.status === 'Active'
                        ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    {coach.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-[#172B5018] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF4E8]/60 border-b border-[#172B5015] text-[#172B50] font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Coach</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B5010]">
                {filteredCoaches.map((coach) => {
                  const initials = coach.name
                    ? coach.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                    : 'SC';

                  return (
                    <tr key={coach.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {coach.photo ? (
                            <img
                              src={coach.photo}
                              alt={coach.name}
                              className="w-9 h-9 rounded-xl object-cover border border-[#F4510B30]"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-[#FFF4E8] text-[#F4510B] font-bold text-xs flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-[#172B50]">{coach.name}</div>
                            <span className="text-[10px] font-bold text-[#F4510B]">{coach.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#172B50]">{coach.specialization}</div>
                        <div className="text-[10px] text-[#172B50]/60 truncate max-w-xs">{coach.certification}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#172B50]">
                        {coach.experience || '5 Yrs'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#172B50]">{coach.phone}</div>
                        <div className="text-[10px] text-[#172B50]/65 truncate">{coach.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 bg-[#FFF4E8] px-2 py-0.5 rounded-lg border border-[#F4510B18] w-fit">
                          <Star className="w-3 h-3 text-[#F4510B] fill-[#F4510B]" />
                          <span className="font-bold text-[#172B50]">{coach.rating || '5.0'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          coach.status === 'Active'
                            ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A20]'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {coach.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenViewProfile(coach)}
                            className="p-1.5 text-[#172B50] bg-[#FFF4E8] hover:bg-[#F4510B] hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="View Full Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditProfile(coach)}
                            className="p-1.5 text-[#172B50] bg-gray-100 hover:bg-[#172B50] hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Edit Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. ADD SPARTAN ACADEMY COACH MODAL (MULTI-STEP WIZARD)   */}
      {/*    Matching reference screenshot media_1795356284273      */}
      {/* ======================================================== */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-[#172B50]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#172B501A] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto flex flex-col max-h-[92vh]">

            {/* Header: Matches media_1795356284273_9f6b50ec.jpg */}
            <div className="bg-[#FFF4E8]/60 border-b border-[#172B5015] px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <SpartanHelmetIcon className="w-9 h-9 text-[#F4510B]" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#172B50] tracking-tight">
                    Add Spartan Academy Coach
                  </h2>
                  <p className="text-xs text-[#172B50]/70 font-medium">
                    Register a certified coach into the academy
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#172B50]/60 hover:text-[#172B50] hover:bg-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Horizontal Step Tabs: 4 Steps + Review */}
            <div className="px-5 sm:px-6 pt-4 pb-2 border-b border-[#172B5010] bg-white shrink-0">
              <div className="grid grid-cols-4 gap-2 text-xs">
                {/* Step 1 Tab */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left ${
                    currentStep === 1
                      ? 'border-[#F4510B] bg-[#FFF4E8] text-[#F4510B] font-extrabold shadow-2xs'
                      : currentStep > 1
                      ? 'border-[#172B5015] bg-gray-50 text-[#172B50] font-bold'
                      : 'border-[#172B5010] text-[#172B50]/50 font-medium'
                  }`}
                >
                  <User className="w-4 h-4 shrink-0" />
                  <div className="truncate">
                    <span className="hidden sm:inline">1. </span>Personal Info
                  </div>
                </button>

                {/* Step 2 Tab */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left ${
                    currentStep === 2
                      ? 'border-[#F4510B] bg-[#FFF4E8] text-[#F4510B] font-extrabold shadow-2xs'
                      : currentStep > 2
                      ? 'border-[#172B5015] bg-gray-50 text-[#172B50] font-bold'
                      : 'border-[#172B5010] text-[#172B50]/50 font-medium'
                  }`}
                >
                  <Award className="w-4 h-4 shrink-0" />
                  <div className="truncate">
                    <span className="hidden sm:inline">2. </span>Professional
                  </div>
                </button>

                {/* Step 3 Tab */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left ${
                    currentStep === 3
                      ? 'border-[#F4510B] bg-[#FFF4E8] text-[#F4510B] font-extrabold shadow-2xs'
                      : currentStep > 3
                      ? 'border-[#172B5015] bg-gray-50 text-[#172B50] font-bold'
                      : 'border-[#172B5010] text-[#172B50]/50 font-medium'
                  }`}
                >
                  <UploadCloud className="w-4 h-4 shrink-0" />
                  <div className="truncate">
                    <span className="hidden sm:inline">3. </span>Documents
                  </div>
                </button>

                {/* Step 4 Tab */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left ${
                    currentStep === 4 || currentStep === 5
                      ? 'border-[#F4510B] bg-[#FFF4E8] text-[#F4510B] font-extrabold shadow-2xs'
                      : 'border-[#172B5010] text-[#172B50]/50 font-medium'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <div className="truncate">
                    <span className="hidden sm:inline">4. </span>Salary &amp; Bank
                  </div>
                </button>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">

              {/* =================================================== */}
              {/* STEP 1: PERSONAL INFORMATION                        */}
              {/* =================================================== */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#172B50] font-extrabold text-sm pb-1 border-b border-[#172B5010]">
                    <User className="w-4 h-4 text-[#F4510B]" />
                    <span>Personal Information</span>
                  </div>

                  {/* Row 1: Profile Photo on left, Coach Full Name + DOB + Gender on right */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                    {/* Photo Box: Matches layout in screenshot */}
                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">
                        Profile Photo
                      </label>
                      <input
                        type="file"
                        ref={profilePhotoInputRef}
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={(e) => handlePhotoSelect(e, false)}
                        className="hidden"
                      />
                      <div
                        onClick={() => profilePhotoInputRef.current?.click()}
                        className="border-2 border-dashed border-[#F4510B40] hover:border-[#F4510B] bg-[#FFF4E8]/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer min-h-[148px] transition-all group"
                      >
                        {formData.photo ? (
                          <div className="relative">
                            <img
                              src={formData.photo}
                              alt="Coach Preview"
                              className="w-20 h-20 rounded-xl object-cover shadow-sm border border-[#F4510B40]"
                            />
                            <span className="mt-1.5 block text-[10px] font-bold text-[#F4510B] group-hover:underline">
                              Change Photo
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="w-9 h-9 rounded-full bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                              <UploadCloud className="w-5 h-5 text-[#F4510B]" />
                            </div>
                            <span className="text-xs font-bold text-[#172B50] block">Upload Photo</span>
                            <span className="text-[10px] text-[#172B50]/60 mt-0.5">JPG, PNG (Max 2 MB)</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right: Full Name + DOB + Gender */}
                    <div className="sm:col-span-2 space-y-3">
                      <div>
                        <label className="text-xs font-bold text-[#172B50] block mb-1">
                          Coach Full Name <span className="text-[#F4510B]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Coach Siddharth Rao"
                          className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-[#172B50] block mb-1">
                            Date of Birth <span className="text-[#F4510B]">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.dob}
                            onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                            className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-[#172B50] block mb-1">
                            Gender
                          </label>
                          <select
                            value={formData.gender}
                            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                            className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: 3 Columns: Phone, WhatsApp, Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">
                        Phone Number <span className="text-[#F4510B]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">
                        Email Address <span className="text-[#F4510B]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="coach@email.com"
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 3: Current Address */}
                  <div>
                    <label className="text-xs font-bold text-[#172B50] block mb-1">
                      Current Address <span className="text-[#F4510B]">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter complete current address"
                      className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* STEP 2: PROFESSIONAL INFORMATION                    */}
              {/* Strictly only: Specialization, Experience,          */}
              {/* Certifications, Sports Qualifications, Skills       */}
              {/* =================================================== */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#172B50] font-extrabold text-sm pb-1 border-b border-[#172B5010]">
                    <Award className="w-4 h-4 text-[#F4510B]" />
                    <span>Professional Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">
                        Specialization <span className="text-[#F4510B]">*</span>
                      </label>
                      <select
                        value={formData.specialization}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      >
                        {SPECIALIZATION_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">
                        Coaching Experience (Years)
                      </label>
                      <input
                        type="text"
                        value={formData.experience}
                        onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                        placeholder="e.g. 5"
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172B50] block mb-1">
                      Certifications &amp; Licenses
                    </label>
                    <input
                      type="text"
                      value={formData.certification}
                      onChange={(e) => setFormData(prev => ({ ...prev, certification: e.target.value }))}
                      placeholder="e.g. FIG Level 1 / AFC Diploma / BFI Certified"
                      className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172B50] block mb-1">
                      Sports Qualifications
                    </label>
                    <input
                      type="text"
                      value={formData.sportsQualifications}
                      onChange={(e) => setFormData(prev => ({ ...prev, sportsQualifications: e.target.value }))}
                      placeholder="e.g. B.P.Ed / State Championship Gold Medalist / NIS Certified"
                      className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172B50] block mb-1">
                      Skills &amp; Expertise
                    </label>
                    <textarea
                      rows={3}
                      value={formData.skills}
                      onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                      placeholder="e.g. Agility Drills, Youth Biomechanics, Strength Conditioning, Injury Prevention"
                      className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* STEP 3: DOCUMENTS UPLOAD (8 SPECIFIED SLOTS)        */}
              {/* =================================================== */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1 border-b border-[#172B5010]">
                    <div className="flex items-center gap-2 text-[#172B50] font-extrabold text-sm">
                      <UploadCloud className="w-4 h-4 text-[#F4510B]" />
                      <span>Documents Upload</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#F4510B] bg-[#FFF4E8] px-2 py-0.5 rounded-lg border border-[#F4510B20]">
                      {Object.keys(formData.documents || {}).length} of 8 Uploaded
                    </span>
                  </div>

                  <p className="text-xs text-[#172B50]/70">
                    Upload verification documents for coach credentialing. (Max 5 MB each, PDF, JPG, PNG)
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DOCUMENT_DEFINITIONS.map(doc => {
                      const DocIcon = doc.icon;
                      const uploadedDoc = formData.documents?.[doc.key];
                      const isUploading = Boolean(uploadProgress[doc.key]);

                      return (
                        <div
                          key={doc.key}
                          className="border border-[#172B5018] rounded-2xl p-3 bg-white hover:border-[#F4510B40] transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0">
                                  <DocIcon className="w-3.5 h-3.5 text-[#F4510B]" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-[#172B50]">
                                    {doc.label} {doc.required && <span className="text-[#F4510B]">*</span>}
                                  </div>
                                  <div className="text-[10px] text-[#172B50]/60">{doc.hint}</div>
                                </div>
                              </div>

                              {uploadedDoc && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                  <Check className="w-3 h-3" />
                                  <span>Ready</span>
                                </span>
                              )}
                            </div>

                            {/* Upload Progress Bar if active */}
                            {isUploading && (
                              <div className="mt-2.5">
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-[#F4510B] h-full transition-all duration-200"
                                    style={{ width: `${uploadProgress[doc.key]}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-[#F4510B] font-semibold mt-0.5 block">Uploading...</span>
                              </div>
                            )}

                            {/* Uploaded File Pill */}
                            {uploadedDoc && !isUploading && (
                              <div className="mt-2 p-1.5 rounded-xl bg-gray-50 border border-[#172B5010] flex items-center justify-between text-xs">
                                <div className="truncate pr-2">
                                  <span className="font-semibold text-[#172B50] block truncate text-[11px]">{uploadedDoc.name}</span>
                                  <span className="text-[10px] text-[#172B50]/60">{uploadedDoc.size} • {uploadedDoc.uploadedAt}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDocument(doc.key, false)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 shrink-0"
                                  title="Remove Document"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Upload Trigger Input */}
                          <div className="mt-3 pt-2 border-t border-[#172B500C] flex items-center justify-end">
                            <input
                              type="file"
                              ref={el => (documentInputRefs.current[doc.key] = el)}
                              onChange={(e) => handleDocumentSelect(doc.key, e, false)}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => documentInputRefs.current[doc.key]?.click()}
                              className="text-[11px] font-bold text-[#F4510B] hover:bg-[#FFF4E8] px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>{uploadedDoc ? 'Replace File' : 'Browse File'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* STEP 4: SALARY & BANK DETAILS                       */}
              {/* =================================================== */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1 border-b border-[#172B5010]">
                    <div className="flex items-center gap-2 text-[#172B50] font-extrabold text-sm">
                      <CreditCard className="w-4 h-4 text-[#F4510B]" />
                      <span>Salary &amp; Bank Details</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#172B50]/60 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-[#16A34A]" />
                      <span>Admin Confidential</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        value={formData.accountHolderName}
                        onChange={(e) => setFormData(prev => ({ ...prev, accountHolderName: e.target.value }))}
                        placeholder={formData.name || "e.g. Siddharth Rao"}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">
                        Bank Name
                      </label>
                      <select
                        value={formData.bankName}
                        onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      >
                        {BANK_OPTIONS.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                        placeholder="e.g. 50100234567890"
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        value={formData.ifscCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                        placeholder="e.g. HDFC0001234"
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none uppercase font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">
                        Branch Name
                      </label>
                      <input
                        type="text"
                        value={formData.branchName}
                        onChange={(e) => setFormData(prev => ({ ...prev, branchName: e.target.value }))}
                        placeholder="e.g. Anna Nagar Branch, Chennai"
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">
                        Salary Type
                      </label>
                      <select
                        value={formData.salaryType}
                        onChange={(e) => setFormData(prev => ({ ...prev, salaryType: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      >
                        <option value="Monthly">Monthly Retainer</option>
                        <option value="Per Session">Per Session Fee</option>
                        <option value="Hourly">Hourly Rate</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">
                        Salary / Payment Amount (₹)
                      </label>
                      <input
                        type="text"
                        value={formData.salaryAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, salaryAmount: e.target.value }))}
                        placeholder="e.g. 45,000"
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none font-bold text-[#172B50]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">
                        Payment Effective Date
                      </label>
                      <input
                        type="date"
                        value={formData.effectiveDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* STEP 5: FINAL REVIEW & SUBMIT                       */}
              {/* =================================================== */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#172B50] font-extrabold text-sm pb-1 border-b border-[#172B5010]">
                    <CheckCircle2 className="w-4 h-4 text-[#F4510B]" />
                    <span>Review Coach Registration</span>
                  </div>

                  <p className="text-xs text-[#172B50]/75">
                    Please review all coach credentials and banking details before submitting. Coach ID will be generated automatically.
                  </p>

                  {/* Summary 1: Personal */}
                  <div className="bg-[#FFF4E8]/40 border border-[#F4510B25] rounded-2xl p-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F4510B15]">
                      <span className="text-xs font-extrabold text-[#172B50] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#F4510B]" /> Personal Information
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-[11px] font-bold text-[#F4510B] hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="mt-3 flex items-start gap-3">
                      {formData.photo ? (
                        <img
                          src={formData.photo}
                          alt="Coach"
                          className="w-12 h-12 rounded-xl object-cover border border-[#F4510B30] shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#FFF4E8] text-[#F4510B] font-black text-sm flex items-center justify-center shrink-0 border border-[#F4510B30]">
                          {formData.name ? formData.name[0] : 'C'}
                        </div>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs flex-1">
                        <div>
                          <span className="text-[10px] text-[#172B50]/60 block">Full Name</span>
                          <span className="font-bold text-[#172B50]">{formData.name}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#172B50]/60 block">Date of Birth</span>
                          <span className="font-semibold text-[#172B50]">{formData.dob}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#172B50]/60 block">Phone</span>
                          <span className="font-semibold text-[#172B50]">{formData.phone}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#172B50]/60 block">Email</span>
                          <span className="font-semibold text-[#172B50] truncate block">{formData.email}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] text-[#172B50]/60 block">Address</span>
                          <span className="font-medium text-[#172B50] truncate block">{formData.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary 2: Professional */}
                  <div className="bg-white border border-[#172B5018] rounded-2xl p-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#172B5010]">
                      <span className="text-xs font-extrabold text-[#172B50] flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#F4510B]" /> Professional Details
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-[11px] font-bold text-[#F4510B] hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mt-3">
                      <div>
                        <span className="text-[10px] text-[#172B50]/60 block">Specialization</span>
                        <span className="font-bold text-[#F4510B]">{formData.specialization}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#172B50]/60 block">Experience</span>
                        <span className="font-semibold text-[#172B50]">{formData.experience} Years</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-[#172B50]/60 block">Certification</span>
                        <span className="font-semibold text-[#172B50] truncate block">{formData.certification}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary 3: Documents */}
                  <div className="bg-white border border-[#172B5018] rounded-2xl p-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#172B5010]">
                      <span className="text-xs font-extrabold text-[#172B50] flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5 text-[#F4510B]" /> Uploaded Documents ({Object.keys(formData.documents || {}).length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-[11px] font-bold text-[#F4510B] hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {Object.keys(formData.documents || {}).length === 0 ? (
                        <span className="text-xs text-gray-500 italic">No documents attached yet</span>
                      ) : (
                        Object.entries(formData.documents).map(([k, d]) => (
                          <div key={k} className="flex items-center gap-1 bg-[#FFF4E8] text-[#172B50] px-2.5 py-1 rounded-xl text-[11px] font-semibold border border-[#F4510B20]">
                            <Check className="w-3 h-3 text-[#16A34A]" />
                            <span>{d.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Summary 4: Salary & Bank */}
                  <div className="bg-white border border-[#172B5018] rounded-2xl p-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#172B5010]">
                      <span className="text-xs font-extrabold text-[#172B50] flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[#F4510B]" /> Salary &amp; Bank Details
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="text-[11px] font-bold text-[#F4510B] hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-3">
                      <div>
                        <span className="text-[10px] text-[#172B50]/60 block">Bank</span>
                        <span className="font-bold text-[#172B50]">{formData.bankName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#172B50]/60 block">Account Number</span>
                        <span className="font-mono text-[#172B50]">
                          {formData.accountNumber ? `•••• ${formData.accountNumber.slice(-4)}` : '•••• 1234'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#172B50]/60 block">Salary Type</span>
                        <span className="font-semibold text-[#172B50]">{formData.salaryType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#172B50]/60 block">Amount</span>
                        <span className="font-extrabold text-[#F4510B]">₹ {formData.salaryAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer: Matches Cancel on left, Previous and Next on right */}
            <div className="bg-gray-50/80 border-t border-[#172B5015] px-5 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#172B50] bg-white border border-[#172B5020] rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentStep === 1}
                  onClick={handlePrevStep}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    currentStep === 1
                      ? 'bg-gray-100 text-[#172B50]/30 border border-transparent cursor-not-allowed'
                      : 'bg-white text-[#172B50] border border-[#172B5020] hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitNewCoach}
                    className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Confirm &amp; Register Coach</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. VIEW COACH PROFILE MODAL                              */}
      {/* ======================================================== */}
      {viewingCoach && (
        <div className="fixed inset-0 z-50 bg-[#172B50]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#172B501A] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto flex flex-col max-h-[92vh]">

            {/* Profile Header Banner */}
            <div className="bg-[#FFF4E8] border-b border-[#172B5015] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-4">
                {viewingCoach.photo ? (
                  <img
                    src={viewingCoach.photo}
                    alt={viewingCoach.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#F4510B35] shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#F4510B] text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                    {viewingCoach.name ? viewingCoach.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'C'}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#F4510B] uppercase tracking-wider">
                      {viewingCoach.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      viewingCoach.status === 'Active'
                        ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A20]'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {viewingCoach.status || 'Active'}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-[#172B50] tracking-tight mt-0.5">
                    {viewingCoach.name}
                  </h2>
                  <p className="text-xs font-semibold text-[#172B50]/75">
                    {viewingCoach.specialization} • {viewingCoach.experience || '5 Yrs'} Experience
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleOpenEditProfile(viewingCoach)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-xs hover:brightness-110 cursor-pointer transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingCoach(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#172B50]/60 hover:text-[#172B50] hover:bg-white cursor-pointer transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* View Tabs */}
            <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-[#172B5010] bg-white flex items-center gap-2 overflow-x-auto shrink-0">
              {[
                { id: 'personal', label: 'Personal Info', icon: User },
                { id: 'professional', label: 'Professional Info', icon: Award },
                { id: 'documents', label: 'Documents', icon: UploadCloud },
                { id: 'salary', label: 'Salary & Bank Details', icon: CreditCard },
                { id: 'audit', label: 'Audit History', icon: RotateCcw },
              ].map(t => {
                const TabIcon = t.icon;
                const isActive = viewTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setViewTab(t.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#F4510B] text-white shadow-2xs'
                        : 'text-[#172B50]/70 hover:bg-[#FFF4E8] hover:text-[#172B50]'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* View Tab Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {viewTab === 'personal' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-[#172B5010]">
                    <span className="text-[10px] font-bold text-[#172B50]/60 uppercase block">Phone Number</span>
                    <span className="text-sm font-extrabold text-[#172B50] mt-0.5 block">{viewingCoach.phone}</span>
                  </div>
                  <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-[#172B5010]">
                    <span className="text-[10px] font-bold text-[#172B50]/60 uppercase block">WhatsApp Number</span>
                    <span className="text-sm font-extrabold text-[#172B50] mt-0.5 block">{viewingCoach.whatsapp || viewingCoach.phone}</span>
                  </div>
                  <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-[#172B5010]">
                    <span className="text-[10px] font-bold text-[#172B50]/60 uppercase block">Email Address</span>
                    <span className="text-sm font-extrabold text-[#172B50] mt-0.5 block truncate">{viewingCoach.email}</span>
                  </div>
                  <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-[#172B5010]">
                    <span className="text-[10px] font-bold text-[#172B50]/60 uppercase block">Date of Birth &amp; Gender</span>
                    <span className="text-sm font-extrabold text-[#172B50] mt-0.5 block">{viewingCoach.dob} • {viewingCoach.gender || 'Not specified'}</span>
                  </div>
                  <div className="sm:col-span-2 p-3.5 bg-gray-50/80 rounded-2xl border border-[#172B5010]">
                    <span className="text-[10px] font-bold text-[#172B50]/60 uppercase block">Current Address</span>
                    <span className="text-xs font-semibold text-[#172B50] mt-0.5 block">{viewingCoach.address}</span>
                  </div>
                </div>
              )}

              {viewTab === 'professional' && (
                <div className="space-y-3.5 text-xs">
                  <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-[#172B5010]">
                    <span className="text-[10px] font-bold text-[#172B50]/60 uppercase block">Specialization</span>
                    <span className="text-sm font-extrabold text-[#F4510B] mt-0.5 block">{viewingCoach.specialization}</span>
                  </div>
                  <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-[#172B5010]">
                    <span className="text-[10px] font-bold text-[#172B50]/60 uppercase block">Certifications &amp; Licenses</span>
                    <span className="text-xs font-bold text-[#172B50] mt-0.5 block">{viewingCoach.certification}</span>
                  </div>
                  <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-[#172B5010]">
                    <span className="text-[10px] font-bold text-[#172B50]/60 uppercase block">Sports Qualifications</span>
                    <span className="text-xs font-semibold text-[#172B50] mt-0.5 block">{viewingCoach.sportsQualifications}</span>
                  </div>
                  <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-[#172B5010]">
                    <span className="text-[10px] font-bold text-[#172B50]/60 uppercase block">Skills &amp; Expertise</span>
                    <span className="text-xs font-medium text-[#172B50] mt-0.5 block">{viewingCoach.skills}</span>
                  </div>
                </div>
              )}

              {viewTab === 'documents' && (
                <div className="space-y-3">
                  <div className="text-xs text-[#172B50]/70">
                    Official verified certificates and documents uploaded for {viewingCoach.name}:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DOCUMENT_DEFINITIONS.map(doc => {
                      const DocIcon = doc.icon;
                      const uploaded = viewingCoach.documents?.[doc.key];

                      return (
                        <div key={doc.key} className="p-3 rounded-2xl border border-[#172B5015] bg-white flex items-center justify-between">
                          <div className="flex items-center gap-2.5 truncate pr-2">
                            <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0">
                              <DocIcon className="w-4 h-4 text-[#F4510B]" />
                            </div>
                            <div className="truncate">
                              <span className="text-xs font-bold text-[#172B50] block truncate">{doc.label}</span>
                              <span className="text-[10px] text-[#172B50]/60 block truncate">
                                {uploaded ? `${uploaded.name} (${uploaded.size})` : 'Not uploaded'}
                              </span>
                            </div>
                          </div>

                          {uploaded ? (
                            <button
                              type="button"
                              onClick={() => addToast(`Opening ${uploaded.name}...`, 'info')}
                              className="text-xs font-bold text-[#F4510B] bg-[#FFF4E8] px-2 py-1 rounded-lg hover:bg-[#F4510B] hover:text-white transition-colors cursor-pointer shrink-0"
                            >
                              Download
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic shrink-0">Pending</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {viewTab === 'salary' && (
                <div className="space-y-4">
                  <div className="bg-[#FFF4E8] border border-[#F4510B25] rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-[#172B50] block">Administrator Access Only</span>
                      <span className="text-[11px] text-[#172B50]/70">Sensitive banking and compensation credentials</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSensitiveBankDetails(!showSensitiveBankDetails)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white text-[#F4510B] border border-[#F4510B30] rounded-xl hover:bg-[#F4510B] hover:text-white transition-colors cursor-pointer"
                    >
                      {showSensitiveBankDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showSensitiveBankDetails ? 'Mask Details' : 'View Full Details'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-[#172B5010]">
                      <span className="text-[10px] font-bold text-[#172B50]/60 uppercase block">Account Holder</span>
                      <span className="text-sm font-extrabold text-[#172B50] mt-0.5 block">
                        {viewingCoach.bankDetails?.accountHolderName || viewingCoach.name}
                      </span>
                    </div>

                    <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-[#172B5010]">
                      <span className="text-[10px] font-bold text-[#172B50]/60 uppercase block">Bank Name</span>
                      <span className="text-sm font-extrabold text-[#172B50] mt-0.5 block">
                        {viewingCoach.bankDetails?.bankName || 'HDFC Bank'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-[#172B5010]">
                      <span className="text-[10px] font-bold text-[#172B50]/60 uppercase block">Account Number</span>
                      <span className="text-sm font-mono font-extrabold text-[#172B50] mt-0.5 block">
                        {showSensitiveBankDetails
                          ? viewingCoach.bankDetails?.accountNumber || '50100482910345'
                          : `•••• •••• •••• ${(viewingCoach.bankDetails?.accountNumber || '3456').slice(-4)}`}
                      </span>
                    </div>

                    <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-[#172B5010]">
                      <span className="text-[10px] font-bold text-[#172B50]/60 uppercase block">IFSC Code &amp; Branch</span>
                      <span className="text-sm font-extrabold text-[#172B50] mt-0.5 block">
                        {viewingCoach.bankDetails?.ifscCode || 'HDFC0001042'} • {viewingCoach.bankDetails?.branchName || 'Anna Nagar'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-[#172B5010]">
                      <span className="text-[10px] font-bold text-[#172B50]/60 uppercase block">Salary Arrangement</span>
                      <span className="text-sm font-extrabold text-[#172B50] mt-0.5 block">
                        {viewingCoach.bankDetails?.salaryType || 'Monthly'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-[#172B5010]">
                      <span className="text-[10px] font-bold text-[#172B50]/60 uppercase block">Payment / Salary Amount</span>
                      <span className="text-base font-black text-[#F4510B] mt-0.5 block">
                        ₹ {viewingCoach.bankDetails?.salaryAmount || '48,000'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {viewTab === 'audit' && (
                <div className="space-y-3">
                  <div className="text-xs text-[#172B50]/70">
                    Audit log history of changes made to this faculty record:
                  </div>

                  <div className="space-y-2">
                    {(viewingCoach.auditLog || []).map((log, idx) => (
                      <div key={idx} className="p-3 rounded-2xl border border-[#172B5010] bg-gray-50/60 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-[#172B50]">{log.action}</span>
                          <span className="text-[10px] text-[#172B50]/60">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#172B50]/80 mt-1">{log.details}</p>
                        <span className="text-[10px] font-bold text-[#F4510B] mt-1 block">
                          By: {log.performedBy}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* View Modal Footer */}
            <div className="bg-gray-50/80 border-t border-[#172B5015] px-5 sm:px-6 py-3 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setViewingCoach(null)}
                className="px-5 py-2 text-xs font-bold text-[#172B50] bg-white border border-[#172B5020] rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. EDIT COACH PROFILE MODAL                              */}
      {/* ======================================================== */}
      {editingCoach && editFormData && (
        <div className="fixed inset-0 z-50 bg-[#172B50]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#172B501A] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto flex flex-col max-h-[92vh]">

            {/* Edit Header */}
            <div className="bg-[#FFF4E8]/70 border-b border-[#172B5015] px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F4510B] text-white flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#172B50]">
                    Edit Coach Profile: {editingCoach.name}
                  </h2>
                  <p className="text-xs text-[#172B50]/70">
                    ID: {editingCoach.id} • Updates require admin confirmation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingCoach(null);
                  setEditFormData(null);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#172B50]/60 hover:text-[#172B50] hover:bg-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edit Tabs */}
            <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-[#172B5010] bg-white flex items-center gap-2 overflow-x-auto shrink-0">
              {[
                { id: 'personal', label: '1. Personal Info' },
                { id: 'professional', label: '2. Professional' },
                { id: 'documents', label: '3. Documents' },
                { id: 'salary', label: '4. Salary & Bank' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEditTab(t.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    editTab === t.id
                      ? 'bg-[#F4510B] text-white shadow-2xs'
                      : 'bg-gray-50 text-[#172B50]/70 hover:bg-[#FFF4E8]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Edit Form Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {editTab === 'personal' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">Profile Photo</label>
                      <input
                        type="file"
                        ref={editProfilePhotoInputRef}
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={(e) => handlePhotoSelect(e, true)}
                        className="hidden"
                      />
                      <div
                        onClick={() => editProfilePhotoInputRef.current?.click()}
                        className="border-2 border-dashed border-[#F4510B40] hover:border-[#F4510B] bg-[#FFF4E8]/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px] transition-all"
                      >
                        {editFormData.photo ? (
                          <div className="text-center">
                            <img
                              src={editFormData.photo}
                              alt="Coach"
                              className="w-16 h-16 rounded-xl object-cover mx-auto shadow-2xs border border-[#F4510B40]"
                            />
                            <span className="text-[10px] font-bold text-[#F4510B] mt-1 block">Change Photo</span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="w-5 h-5 text-[#F4510B] mb-1" />
                            <span className="text-xs font-bold text-[#172B50]">Upload Photo</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2 space-y-3">
                      <div>
                        <label className="text-xs font-bold text-[#172B50] block mb-1">Coach Full Name *</label>
                        <input
                          type="text"
                          required
                          value={editFormData.name}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-[#172B50] block mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={editFormData.dob}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, dob: e.target.value }))}
                            className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[#172B50] block mb-1">Gender</label>
                          <select
                            value={editFormData.gender}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, gender: e.target.value }))}
                            className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">WhatsApp Number</label>
                      <input
                        type="tel"
                        value={editFormData.whatsapp}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172B50] block mb-1">Current Address</label>
                    <textarea
                      rows={2}
                      value={editFormData.address}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {editTab === 'professional' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">Specialization *</label>
                      <select
                        value={editFormData.specialization}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, specialization: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      >
                        {SPECIALIZATION_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">Coaching Experience (Years)</label>
                      <input
                        type="text"
                        value={editFormData.experience}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, experience: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172B50] block mb-1">Certifications &amp; Licenses</label>
                    <input
                      type="text"
                      value={editFormData.certification}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, certification: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172B50] block mb-1">Sports Qualifications</label>
                    <input
                      type="text"
                      value={editFormData.sportsQualifications}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, sportsQualifications: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172B50] block mb-1">Skills &amp; Expertise</label>
                    <textarea
                      rows={3}
                      value={editFormData.skills}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, skills: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {editTab === 'documents' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#172B50]/70">
                    Replace or add verification documents for this coach:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DOCUMENT_DEFINITIONS.map(doc => {
                      const DocIcon = doc.icon;
                      const uploaded = editFormData.documents?.[doc.key];

                      return (
                        <div key={doc.key} className="p-3 rounded-2xl border border-[#172B5015] bg-white flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate pr-2">
                            <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0">
                              <DocIcon className="w-4 h-4 text-[#F4510B]" />
                            </div>
                            <div className="truncate">
                              <span className="text-xs font-bold text-[#172B50] block truncate">{doc.label}</span>
                              <span className="text-[10px] text-[#172B50]/60 block truncate">
                                {uploaded ? uploaded.name : 'Not uploaded'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <input
                              type="file"
                              ref={el => (editDocInputRefs.current[doc.key] = el)}
                              onChange={(e) => handleDocumentSelect(doc.key, e, true)}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => editDocInputRefs.current[doc.key]?.click()}
                              className="text-[10px] font-bold text-[#F4510B] bg-[#FFF4E8] px-2 py-1 rounded-lg hover:bg-[#F4510B] hover:text-white transition-colors cursor-pointer"
                            >
                              {uploaded ? 'Replace' : 'Upload'}
                            </button>
                            {uploaded && (
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(doc.key, true)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Remove"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {editTab === 'salary' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        value={editFormData.accountHolderName}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, accountHolderName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">Bank Name</label>
                      <select
                        value={editFormData.bankName}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, bankName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      >
                        {BANK_OPTIONS.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">Account Number</label>
                      <input
                        type="text"
                        value={editFormData.accountNumber}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={editFormData.ifscCode}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none uppercase font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">Branch Name</label>
                      <input
                        type="text"
                        value={editFormData.branchName}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, branchName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">Salary Type</label>
                      <select
                        value={editFormData.salaryType}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, salaryType: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Per Session">Per Session</option>
                        <option value="Hourly">Hourly</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">Payment / Salary Amount (₹)</label>
                      <input
                        type="text"
                        value={editFormData.salaryAmount}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, salaryAmount: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] block mb-1">Status</label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Edit Modal Footer */}
            <div className="bg-gray-50/80 border-t border-[#172B5015] px-5 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  setEditingCoach(null);
                  setEditFormData(null);
                }}
                className="px-4 py-2 text-xs font-bold text-[#172B50] bg-white border border-[#172B5020] rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmSaveModal(true)}
                className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 text-white" />
                <span>Save Changes</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Confirmation Dialog before Saving Profile Edits */}
      {showConfirmSaveModal && (
        <div className="fixed inset-0 z-60 bg-[#172B50]/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[#172B501A] text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[#FFF4E8] text-[#F4510B] mx-auto flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-[#F4510B]" />
            </div>
            <h3 className="text-base font-extrabold text-[#172B50]">Confirm Changes?</h3>
            <p className="text-xs text-[#172B50]/70 mt-1">
              Are you sure you want to save updates to Coach <span className="font-bold text-[#172B50]">{editingCoach?.name}</span>? This action will be logged in the audit history.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowConfirmSaveModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#172B50] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveEdit}
                className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 transition-all"
              >
                Confirm &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
