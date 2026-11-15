import React, { useState, useMemo } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Shield, 
  Key, 
  MapPin, 
  CheckSquare, 
  History, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  AlertTriangle, 
  AlertCircle, 
  RefreshCw, 
  Send, 
  UserX, 
  UserCheck, 
  MoreVertical, 
  ChevronDown, 
  ChevronRight, 
  Download, 
  Calendar, 
  Award, 
  GraduationCap, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Copy,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';

// All Little Spartans Centers
const ACADEMY_CENTERS = [
  'KK NAGAR',
  'KILPAUK',
  'MAHALINGAPURAM',
  'ANNA NAGAR',
  'KOLATHUR'
];

// Initial High-Fidelity Demonstration User Accounts
const INITIAL_USERS = [
  {
    id: 'USR-001',
    name: 'Balavivek S',
    email: 'admin@littlespartans.co.in',
    phone: '+91 98765 43210',
    role: 'super_admin',
    locations: ['KK NAGAR', 'KILPAUK', 'MAHALINGAPURAM', 'ANNA NAGAR', 'KOLATHUR'],
    status: 'Active',
    lastLogin: 'Today, 10:15 AM',
    createdAt: '01 Aug 2026',
    twoFactorEnabled: true,
    avatarBg: 'bg-indigo-600',
    notes: 'Master Academy Administrator & Franchise Director'
  },
  {
    id: 'USR-002',
    name: 'Kavitha Raman',
    email: 'kavitha.ops@littlespartans.co.in',
    phone: '+91 98401 22334',
    role: 'admin',
    locations: ['KK NAGAR', 'KILPAUK'],
    status: 'Active',
    lastLogin: 'Today, 09:30 AM',
    createdAt: '15 Aug 2026',
    twoFactorEnabled: true,
    avatarBg: 'bg-sky-600',
    notes: 'Lead Operations Desk & Admissions Coordinator'
  },
  {
    id: 'USR-003',
    name: 'Coach Kapil',
    email: 'kapil.coach@littlespartans.co.in',
    phone: '+91 97910 88776',
    role: 'coach',
    locations: ['KK NAGAR', 'KILPAUK'],
    status: 'Active',
    lastLogin: 'Yesterday, 04:20 PM',
    createdAt: '01 Sep 2026',
    twoFactorEnabled: false,
    avatarBg: 'bg-[#F4510B]',
    assignedPrograms: ['Junior Football Champions', 'Spartan Athletics & Sprinting'],
    assignedBatches: ['Morning Batch A (09:00 AM)', 'Weekend Premier Squad'],
    notes: 'Head Football & Agility Trainer'
  },
  {
    id: 'USR-004',
    name: 'Coach Dibi',
    email: 'dibi.coach@littlespartans.co.in',
    phone: '+91 98840 55667',
    role: 'coach',
    locations: ['MAHALINGAPURAM'],
    status: 'Active',
    lastLogin: '14 Nov 2026, 02:45 PM',
    createdAt: '05 Sep 2026',
    twoFactorEnabled: false,
    avatarBg: 'bg-[#F4510B]',
    assignedPrograms: ['Spartan Gymnastics & Agility'],
    assignedBatches: ['Cadet Agility (10:30 AM)', 'Junior Tumblers'],
    notes: 'Senior Gymnastics Instructor'
  },
  {
    id: 'USR-005',
    name: 'Coach Hanif',
    email: 'hanif.coach@littlespartans.co.in',
    phone: '+91 97100 33445',
    role: 'coach',
    locations: ['ANNA NAGAR'],
    status: 'Pending',
    lastLogin: 'Never (Invite Sent)',
    createdAt: '12 Nov 2026',
    twoFactorEnabled: false,
    avatarBg: 'bg-amber-600',
    assignedPrograms: ['Basketball Rising Stars'],
    assignedBatches: ['Weekend Cubs (02:00 PM)'],
    notes: 'Onboarding Basketball Specialist'
  },
  {
    id: 'USR-006',
    name: 'Coach Teja',
    email: 'teja.coach@littlespartans.co.in',
    phone: '+91 96001 99882',
    role: 'coach',
    locations: ['KOLATHUR'],
    status: 'Inactive',
    lastLogin: '02 Nov 2026, 11:00 AM',
    createdAt: '10 Aug 2026',
    twoFactorEnabled: false,
    avatarBg: 'bg-slate-600',
    assignedPrograms: ['Spartan Martial Arts & Karate'],
    assignedBatches: ['Dojo Masters (05:00 PM)'],
    notes: 'Seasonal Martial Arts Instructor'
  },
  {
    id: 'USR-007',
    name: 'Coach Vikram',
    email: 'vikram.coach@littlespartans.co.in',
    phone: '+91 98402 77119',
    role: 'coach',
    locations: ['KK NAGAR'],
    status: 'Suspended',
    lastLogin: '28 Oct 2026, 05:15 PM',
    createdAt: '20 Jul 2026',
    twoFactorEnabled: false,
    avatarBg: 'bg-rose-600',
    assignedPrograms: ['Little Cubs Multi-Sport'],
    assignedBatches: ['Early Years Agility'],
    notes: 'Suspended pending arena discipline compliance review'
  },
  {
    id: 'USR-008',
    name: 'Suresh Kumar',
    email: 'suresh.kumar@gmail.com',
    phone: '+91 98841 12345',
    role: 'parent',
    locations: ['KK NAGAR'],
    status: 'Active',
    lastLogin: 'Today, 08:00 AM',
    createdAt: '18 Aug 2026',
    twoFactorEnabled: false,
    avatarBg: 'bg-emerald-600',
    linkedChildren: [
      { name: 'Aarav Kumar', age: 7, program: 'Junior Football Champions', center: 'KK NAGAR', batch: '09:00 AM Daily' }
    ],
    notes: 'Parent of Aarav Kumar (Primary contact)'
  },
  {
    id: 'USR-009',
    name: 'Meera Krishnan',
    email: 'meera.k@gmail.com',
    phone: '+91 97909 33221',
    role: 'parent',
    locations: ['KILPAUK'],
    status: 'Active',
    lastLogin: 'Yesterday, 07:15 PM',
    createdAt: '22 Aug 2026',
    twoFactorEnabled: false,
    avatarBg: 'bg-emerald-600',
    linkedChildren: [
      { name: 'Diya Krishnan', age: 6, program: 'Spartan Gymnastics & Agility', center: 'KILPAUK', batch: '10:30 AM Weekend' }
    ],
    notes: 'Guardian of Diya Krishnan'
  },
  {
    id: 'USR-010',
    name: 'Ramesh Varma',
    email: 'ramesh.varma@outlook.com',
    phone: '+91 98400 99112',
    role: 'parent',
    locations: ['MAHALINGAPURAM'],
    status: 'Suspended',
    lastLogin: '25 Oct 2026, 06:40 PM',
    createdAt: '01 Sep 2026',
    twoFactorEnabled: false,
    avatarBg: 'bg-rose-600',
    linkedChildren: [
      { name: 'Rohan Varma', age: 8, program: 'Basketball Rising Stars', center: 'MAHALINGAPURAM', batch: '02:00 PM Daily' }
    ],
    notes: 'Account suspended due to repeated fee recovery bounce'
  },
  {
    id: 'USR-011',
    name: 'Anitha Sundaram',
    email: 'anitha.sundaram@yahoo.co.in',
    phone: '+91 99401 44556',
    role: 'parent',
    locations: ['ANNA NAGAR'],
    status: 'Active',
    lastLogin: '12 Nov 2026, 03:10 PM',
    createdAt: '05 Sep 2026',
    twoFactorEnabled: false,
    avatarBg: 'bg-emerald-600',
    linkedChildren: [
      { name: 'Varun Sundaram', age: 5, program: 'Little Cubs Multi-Sport', center: 'ANNA NAGAR', batch: '04:00 PM Weekend' }
    ],
    notes: 'Parent of Varun Sundaram'
  },
  {
    id: 'USR-012',
    name: 'Deepak Raj',
    email: 'deepak.raj@gmail.com',
    phone: '+91 98412 66778',
    role: 'parent',
    locations: ['KOLATHUR'],
    status: 'Inactive',
    lastLogin: '01 Nov 2026, 09:20 AM',
    createdAt: '12 Sep 2026',
    twoFactorEnabled: false,
    avatarBg: 'bg-slate-600',
    linkedChildren: [
      { name: 'Nikhil Raj', age: 9, program: 'Spartan Athletics & Sprinting', center: 'KOLATHUR', batch: '07:30 AM Morning' }
    ],
    notes: 'Seasonal leave requested for child'
  }
];

// Initial RBAC Permissions Matrix Configuration across 13 modules
const INITIAL_PERMISSION_MATRIX = {
  super_admin: {
    dashboard: { view: true, create: true, edit: true, delete: true, export: true },
    enquiries: { view: true, create: true, edit: true, delete: true, export: true },
    demos: { view: true, create: true, edit: true, delete: true, export: true },
    students: { view: true, create: true, edit: true, delete: true, export: true },
    parents: { view: true, create: true, edit: true, delete: true, export: true },
    coaches: { view: true, create: true, edit: true, delete: true, export: true },
    programs: { view: true, create: true, edit: true, delete: true, export: true },
    locations: { view: true, create: true, edit: true, delete: true, export: true },
    attendance: { view: true, create: true, edit: true, delete: true, export: true },
    payments: { view: true, create: true, edit: true, delete: true, export: true },
    equipment: { view: true, create: true, edit: true, delete: true, export: true },
    reports: { view: true, create: true, edit: true, delete: true, export: true },
    settings: { view: true, create: true, edit: true, delete: true, export: true }
  },
  admin: {
    dashboard: { view: true, create: false, edit: false, delete: false, export: true },
    enquiries: { view: true, create: true, edit: true, delete: true, export: true },
    demos: { view: true, create: true, edit: true, delete: true, export: true },
    students: { view: true, create: true, edit: true, delete: false, export: true },
    parents: { view: true, create: true, edit: true, delete: false, export: true },
    coaches: { view: true, create: true, edit: true, delete: false, export: true },
    programs: { view: true, create: true, edit: true, delete: false, export: true },
    locations: { view: true, create: false, edit: true, delete: false, export: false },
    attendance: { view: true, create: true, edit: true, delete: false, export: true },
    payments: { view: true, create: true, edit: true, delete: false, export: true },
    equipment: { view: true, create: true, edit: true, delete: false, export: true },
    reports: { view: true, create: false, edit: false, delete: false, export: true },
    settings: { view: true, create: false, edit: true, delete: false, export: false }
  },
  coach: {
    dashboard: { view: true, create: false, edit: false, delete: false, export: false },
    enquiries: { view: false, create: false, edit: false, delete: false, export: false },
    demos: { view: true, create: false, edit: true, delete: false, export: false },
    students: { view: true, create: false, edit: false, delete: false, export: false },
    parents: { view: false, create: false, edit: false, delete: false, export: false },
    coaches: { view: true, create: false, edit: false, delete: false, export: false },
    programs: { view: true, create: false, edit: false, delete: false, export: false },
    locations: { view: true, create: false, edit: false, delete: false, export: false },
    attendance: { view: true, create: true, edit: true, delete: false, export: false },
    payments: { view: false, create: false, edit: false, delete: false, export: false },
    equipment: { view: true, create: true, edit: false, delete: false, export: false },
    reports: { view: false, create: false, edit: false, delete: false, export: false },
    settings: { view: false, create: false, edit: false, delete: false, export: false }
  },
  parent: {
    dashboard: { view: true, create: false, edit: false, delete: false, export: false },
    enquiries: { view: false, create: false, edit: false, delete: false, export: false },
    demos: { view: true, create: true, edit: false, delete: false, export: false },
    students: { view: true, create: false, edit: false, delete: false, export: false },
    parents: { view: true, create: false, edit: true, delete: false, export: false },
    coaches: { view: true, create: false, edit: false, delete: false, export: false },
    programs: { view: true, create: false, edit: false, delete: false, export: false },
    locations: { view: true, create: false, edit: false, delete: false, export: false },
    attendance: { view: true, create: false, edit: false, delete: false, export: false },
    payments: { view: true, create: true, edit: false, delete: false, export: true },
    equipment: { view: false, create: false, edit: false, delete: false, export: false },
    reports: { view: false, create: false, edit: false, delete: false, export: false },
    settings: { view: false, create: false, edit: false, delete: false, export: false }
  }
};

// 13 Specification Modules
const PERMISSION_MODULES = [
  { id: 'dashboard', label: 'Dashboard', desc: 'Main command center, KPIs & live session metrics' },
  { id: 'enquiries', label: 'Enquiries', desc: 'Prospective lead capture & qualification funnel' },
  { id: 'demos', label: 'Demo Management', desc: 'Free trial booking, assessments & lead conversion' },
  { id: 'students', label: 'Students', desc: 'Enrolled student directory, health & athlete cards' },
  { id: 'parents', label: 'Parents', desc: 'Guardian records, emergency contacts & linked children' },
  { id: 'coaches', label: 'Coaches', desc: 'Faculty profiles, discipline specialties & payroll' },
  { id: 'programs', label: 'Programs & Classes', desc: 'Curriculum catalog, age groups, timetable & batches' },
  { id: 'locations', label: 'Locations', desc: 'Academy centers, courts, branches & arena settings' },
  { id: 'attendance', label: 'Attendance', desc: 'Daily check-in logs, absence alerts & makeups' },
  { id: 'payments', label: 'Payments', desc: 'Tuition fees, invoices, outstanding dues & ledger' },
  { id: 'equipment', label: 'Equipment Management', desc: 'Multi-location gear inventory & condition reports' },
  { id: 'reports', label: 'Reports', desc: 'Executive intelligence, retention & revenue analytics' },
  { id: 'settings', label: 'Settings', desc: 'Little Spartans branding, academic year & credentials' }
];

// Initial High-Fidelity Activity Audit Log
const INITIAL_ACTIVITY_LOGS = [
  {
    id: 'ACT-101',
    user: 'Balavivek S',
    role: 'super_admin',
    action: 'Assigned location KILPAUK to Coach Kapil',
    location: 'Global',
    timestamp: '15 Nov 2026, 10:15 AM',
    status: 'Success'
  },
  {
    id: 'ACT-102',
    user: 'Kavitha Raman',
    role: 'admin',
    action: 'Reset temporary password for Parent Suresh Kumar',
    location: 'KK NAGAR',
    timestamp: '15 Nov 2026, 09:42 AM',
    status: 'Success'
  },
  {
    id: 'ACT-103',
    user: 'Coach Kapil',
    role: 'coach',
    action: 'Recorded daily attendance for Junior Football Batch A',
    location: 'KK NAGAR',
    timestamp: '15 Nov 2026, 09:15 AM',
    status: 'Success'
  },
  {
    id: 'ACT-104',
    user: 'Suresh Kumar',
    role: 'parent',
    action: 'Initiated UPI Tuition payment ₹4,500 for Aarav Kumar',
    location: 'KK NAGAR',
    timestamp: '15 Nov 2026, 08:30 AM',
    status: 'Success'
  },
  {
    id: 'ACT-105',
    user: 'Kavitha Raman',
    role: 'admin',
    action: 'Dispatched onboarding invitation email to Coach Hanif',
    location: 'ANNA NAGAR',
    timestamp: '14 Nov 2026, 04:50 PM',
    status: 'Success'
  },
  {
    id: 'ACT-106',
    user: 'Security Sentinel',
    role: 'super_admin',
    action: 'Suspended account Ramesh Varma (Overdue fee audit lock)',
    location: 'MAHALINGAPURAM',
    timestamp: '14 Nov 2026, 03:22 PM',
    status: 'Warning'
  },
  {
    id: 'ACT-107',
    user: 'Coach Dibi',
    role: 'coach',
    action: 'Submitted Equipment Condition Report: Gymnastics Floor Mats',
    location: 'MAHALINGAPURAM',
    timestamp: '14 Nov 2026, 02:40 PM',
    status: 'Success'
  },
  {
    id: 'ACT-108',
    user: 'Balavivek S',
    role: 'super_admin',
    action: 'Modified RBAC Matrix: Disabled data export permissions for Coaches',
    location: 'Global',
    timestamp: '14 Nov 2026, 11:10 AM',
    status: 'Success'
  },
  {
    id: 'ACT-109',
    user: 'Coach Vikram',
    role: 'coach',
    action: 'Failed login challenge: 3 incorrect PIN entries detected',
    location: 'KK NAGAR',
    timestamp: '13 Nov 2026, 06:14 PM',
    status: 'Failed'
  },
  {
    id: 'ACT-110',
    user: 'Kavitha Raman',
    role: 'admin',
    action: 'Deactivated seasonal coach account for Coach Teja',
    location: 'KOLATHUR',
    timestamp: '12 Nov 2026, 01:25 PM',
    status: 'Success'
  }
];

export default function AccessManagementModule() {
  const { addToast } = useCrm();

  // Active module tab: 'overview' | 'users' | 'locations' | 'permissions' | 'activity'
  const [activeTab, setActiveTab] = useState('overview');

  // User list state
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // RBAC Permission Matrix state
  const [permissionMatrix, setPermissionMatrix] = useState(INITIAL_PERMISSION_MATRIX);
  const [selectedRoleForMatrix, setSelectedRoleForMatrix] = useState('coach');

  // Activity Log state
  const [activityLogs, setActivityLogs] = useState(INITIAL_ACTIVITY_LOGS);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityStatusFilter, setActivityStatusFilter] = useState('ALL');

  // Modals
  const [modalType, setModalType] = useState(null); // 'add_user' | 'edit_user' | 'view_profile' | 'assign_locations' | 'reset_password' | 'confirm_status' | 'invite_user'
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states for Add / Edit User
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('coach');
  const [formLocations, setFormLocations] = useState(['KK NAGAR']);
  const [formSendInvite, setFormSendInvite] = useState(true);
  const [formNotes, setFormNotes] = useState('');

  // Password reset modal state
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Status toggle confirmation
  const [pendingStatusTarget, setPendingStatusTarget] = useState(null); // { user, newStatus, reason }
  const [statusReason, setStatusReason] = useState('');

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone.includes(searchQuery);
      
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesLocation = locationFilter === 'ALL' || u.locations.includes(locationFilter);
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesLocation && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, locationFilter, statusFilter]);

  // Filtered Activity Logs
  const filteredActivityLogs = useMemo(() => {
    return activityLogs.filter(a => {
      const matchesSearch = 
        a.user.toLowerCase().includes(activitySearch.toLowerCase()) ||
        a.action.toLowerCase().includes(activitySearch.toLowerCase()) ||
        a.location.toLowerCase().includes(activitySearch.toLowerCase());
      
      const matchesStatus = activityStatusFilter === 'ALL' || a.status === activityStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activityLogs, activitySearch, activityStatusFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'Active').length;
    const inactive = users.filter(u => u.status === 'Inactive').length;
    const pending = users.filter(u => u.status === 'Pending').length;
    const suspended = users.filter(u => u.status === 'Suspended').length;
    return { total, active, inactive, pending, suspended };
  }, [users]);

  // Handlers
  const handleOpenAddUser = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('coach');
    setFormLocations(['KK NAGAR']);
    setFormSendInvite(true);
    setFormNotes('');
    setModalType('add_user');
  };

  const handleOpenEditUser = (user) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRole(user.role);
    setFormLocations([...user.locations]);
    setFormNotes(user.notes || '');
    setModalType('edit_user');
  };

  const handleOpenViewProfile = (user) => {
    setSelectedUser(user);
    setModalType('view_profile');
  };

  const handleOpenAssignLocations = (user) => {
    setSelectedUser(user);
    setFormLocations([...user.locations]);
    setModalType('assign_locations');
  };

  const handleOpenResetPassword = (user) => {
    setSelectedUser(user);
    const newPass = `Spartan#${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedPassword(newPass);
    setModalType('reset_password');
  };

  const handleToggleLocationInForm = (loc) => {
    if (formLocations.includes(loc)) {
      if (formLocations.length === 1) {
        addToast('User must have at least one assigned location.', 'error');
        return;
      }
      setFormLocations(formLocations.filter(l => l !== loc));
    } else {
      setFormLocations([...formLocations, loc]);
    }
  };

  const handleSaveAddUser = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      addToast('Please enter full name and email.', 'error');
      return;
    }

    const newUser = {
      id: `USR-${String(users.length + 1).padStart(3, '0')}`,
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim() || '+91 98765 00000',
      role: formRole,
      locations: formLocations,
      status: formSendInvite ? 'Pending' : 'Active',
      lastLogin: formSendInvite ? 'Never (Invite Sent)' : 'Never',
      createdAt: 'Today',
      twoFactorEnabled: false,
      avatarBg: formRole === 'coach' ? 'bg-[#F4510B]' : formRole === 'parent' ? 'bg-emerald-600' : 'bg-sky-600',
      notes: formNotes || `Assigned ${formRole.toUpperCase()} credentials`
    };

    setUsers([newUser, ...users]);

    // Add activity log
    const newLog = {
      id: `ACT-${Date.now()}`,
      user: 'Balavivek S',
      role: 'super_admin',
      action: `Created new user account for ${newUser.name} (${newUser.role})`,
      location: newUser.locations[0] || 'KK NAGAR',
      timestamp: 'Just now',
      status: 'Success'
    };
    setActivityLogs([newLog, ...activityLogs]);

    setModalType(null);
    addToast(formSendInvite ? `User created and invitation dispatched to ${newUser.email}` : `User ${newUser.name} created successfully!`);
  };

  const handleSaveEditUser = (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setUsers(users.map(u => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          phone: formPhone.trim(),
          role: formRole,
          locations: formLocations,
          notes: formNotes
        };
      }
      return u;
    }));

    // Add activity log
    const newLog = {
      id: `ACT-${Date.now()}`,
      user: 'Balavivek S',
      role: 'super_admin',
      action: `Updated account details & role clearance for ${formName}`,
      location: formLocations[0] || 'KK NAGAR',
      timestamp: 'Just now',
      status: 'Success'
    };
    setActivityLogs([newLog, ...activityLogs]);

    setModalType(null);
    addToast(`Account details for ${formName} updated successfully!`);
  };

  const handleSaveLocations = () => {
    if (!selectedUser) return;
    setUsers(users.map(u => {
      if (u.id === selectedUser.id) {
        return { ...u, locations: formLocations };
      }
      return u;
    }));

    const newLog = {
      id: `ACT-${Date.now()}`,
      user: 'Balavivek S',
      role: 'super_admin',
      action: `Reassigned location clearances for ${selectedUser.name}: [${formLocations.join(', ')}]`,
      location: formLocations[0] || 'Global',
      timestamp: 'Just now',
      status: 'Success'
    };
    setActivityLogs([newLog, ...activityLogs]);

    setModalType(null);
    addToast(`Location access updated for ${selectedUser.name}`);
  };

  const handleInitiateStatusChange = (user, newStatus) => {
    setPendingStatusTarget({ user, newStatus });
    setStatusReason('');
    setModalType('confirm_status');
  };

  const handleConfirmStatusChange = () => {
    if (!pendingStatusTarget) return;
    const { user, newStatus } = pendingStatusTarget;

    setUsers(users.map(u => {
      if (u.id === user.id) {
        return { ...u, status: newStatus };
      }
      return u;
    }));

    const newLog = {
      id: `ACT-${Date.now()}`,
      user: 'Balavivek S',
      role: 'super_admin',
      action: `Changed status for ${user.name} to ${newStatus}${statusReason ? ` (Reason: ${statusReason})` : ''}`,
      location: user.locations[0] || 'Global',
      timestamp: 'Just now',
      status: newStatus === 'Suspended' ? 'Warning' : 'Success'
    };
    setActivityLogs([newLog, ...activityLogs]);

    setModalType(null);
    setPendingStatusTarget(null);
    addToast(`Account status for ${user.name} changed to ${newStatus}.`);
  };

  const handleSendInvite = (user) => {
    const newLog = {
      id: `ACT-${Date.now()}`,
      user: 'Balavivek S',
      role: 'super_admin',
      action: `Re-sent activation invitation to ${user.email}`,
      location: user.locations[0] || 'Global',
      timestamp: 'Just now',
      status: 'Success'
    };
    setActivityLogs([newLog, ...activityLogs]);
    addToast(`Activation invitation sent to ${user.email}!`);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    addToast('Temporary password copied to clipboard!');
  };

  const handleTogglePermission = (moduleKey, controlKey) => {
    setPermissionMatrix(prev => {
      const currentRoleObj = prev[selectedRoleForMatrix] || {};
      const currentModuleObj = currentRoleObj[moduleKey] || { view: false, create: false, edit: false, delete: false, export: false };
      const currentVal = !!currentModuleObj[controlKey];

      return {
        ...prev,
        [selectedRoleForMatrix]: {
          ...currentRoleObj,
          [moduleKey]: {
            ...currentModuleObj,
            [controlKey]: !currentVal
          }
        }
      };
    });
  };

  const handleSavePermissions = () => {
    const newLog = {
      id: `ACT-${Date.now()}`,
      user: 'Balavivek S',
      role: 'super_admin',
      action: `Saved updated RBAC permissions matrix for role: ${selectedRoleForMatrix.toUpperCase()}`,
      location: 'Global',
      timestamp: 'Just now',
      status: 'Success'
    };
    setActivityLogs([newLog, ...activityLogs]);
    addToast(`Permissions matrix for ${selectedRoleForMatrix.toUpperCase()} saved successfully!`);
  };

  const handleResetPermissions = () => {
    setPermissionMatrix(INITIAL_PERMISSION_MATRIX);
    addToast('Permissions matrix reset to default factory role presets.');
  };

  // Helper formatting badges
  const renderRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Shield className="w-3 h-3 text-indigo-600" />
            Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-sky-50 text-sky-700 border border-sky-200">
            <ShieldCheck className="w-3 h-3 text-sky-600" />
            Admin
          </span>
        );
      case 'coach':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-[#FFF5ED] text-[#F4510B] border border-[#FED7AA]">
            <Award className="w-3 h-3 text-[#F4510B]" />
            Coach
          </span>
        );
      case 'parent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            <GraduationCap className="w-3 h-3 text-emerald-600" />
            Parent
          </span>
        );
      default:
        return <span className="text-xs font-bold capitalize">{role}</span>;
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
            Inactive
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            <Clock className="w-3 h-3 text-[#D97706]" />
            Pending Invite
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]">
            <AlertTriangle className="w-3 h-3 text-[#E11D48]" />
            Suspended
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up pb-12">
      
      {/* ============================================================ */}
      {/* 1. TOP HEADER & PRIMARY ACTIONS                              */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#172B5012]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF5ED] text-[#F4510B] border border-[#F4510B25] shadow-2xs flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#F4510B]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">
                Access Management
              </h1>
              <p className="text-xs sm:text-sm font-medium text-[#172B50]/65 mt-0.5">
                User governance, multi-location clearances and role-based permissions
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              addToast('User directory exported as Little-Spartans-Users-Audit.csv');
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#172B5018] text-[#172B50] text-xs font-bold flex items-center gap-2 hover:bg-[#FFF4E8] hover:border-[#F4510B30] transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-[#172B50]" />
            <span>Export Directory</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddUser}
            className="px-4 py-2 rounded-xl bg-[#F4510B] text-white text-xs font-extrabold flex items-center gap-2 hover:bg-[#d94406] shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. NAVIGATION SUBTABS (5 KEY PILLARS)                        */}
      {/* ============================================================ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#172B500C]">
        {[
          { id: 'overview', label: 'Access Overview', icon: ShieldCheck, badge: null },
          { id: 'users', label: 'User Accounts', icon: Users, badge: users.length },
          { id: 'locations', label: 'Location Access', icon: MapPin, badge: ACADEMY_CENTERS.length },
          { id: 'permissions', label: 'Roles & Permissions', icon: CheckSquare, badge: '13 Modules' },
          { id: 'activity', label: 'Activity History', icon: History, badge: activityLogs.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#172B50] text-white shadow-sm'
                  : 'bg-white text-[#172B50]/70 hover:bg-[#FFF4E8] hover:text-[#172B50] border border-[#172B5010]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#F4510B]' : 'text-[#172B50]/60'}`} />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#172B500C] text-[#172B50]'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 3. TAB 1: ACCESS MANAGEMENT DASHBOARD & OVERVIEW             */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary KPI Cards (5 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {/* Total Accounts */}
            <div 
              onClick={() => { setActiveTab('users'); setStatusFilter('ALL'); }}
              className="bg-white rounded-[22px] p-4.5 border border-[#172B5012] shadow-2xs flex flex-col justify-between hover:border-[#172B5030] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#172B50]/65 uppercase tracking-wider">Total Accounts</span>
                <div className="w-8 h-8 rounded-xl bg-[#F0F7FF] text-[#0284C7] flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#0284C7]" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight">{metrics.total}</p>
                <p className="text-[10.5px] font-medium text-[#172B50]/60 mt-0.5">All registered credentials</p>
              </div>
            </div>

            {/* Active Accounts */}
            <div 
              onClick={() => { setActiveTab('users'); setStatusFilter('Active'); }}
              className="bg-gradient-to-br from-[#F0FDF4] to-white rounded-[22px] p-4.5 border border-[#BBF7D0] shadow-2xs flex flex-col justify-between hover:border-[#16A34A] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Active</span>
                <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-[#16A34A]" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight">{metrics.active}</p>
                <p className="text-[10.5px] font-medium text-emerald-700/70 mt-0.5">Fully operational users</p>
              </div>
            </div>

            {/* Inactive Accounts */}
            <div 
              onClick={() => { setActiveTab('users'); setStatusFilter('Inactive'); }}
              className="bg-gradient-to-br from-[#F8FAFC] to-white rounded-[22px] p-4.5 border border-[#CBD5E1] shadow-2xs flex flex-col justify-between hover:border-[#64748B] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Inactive</span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <UserX className="w-4 h-4 text-slate-600" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{metrics.inactive}</p>
                <p className="text-[10.5px] font-medium text-slate-500 mt-0.5">Dormant & seasonal</p>
              </div>
            </div>

            {/* Pending Invitations */}
            <div 
              onClick={() => { setActiveTab('users'); setStatusFilter('Pending'); }}
              className="bg-gradient-to-br from-[#FEFCE8] to-white rounded-[22px] p-4.5 border border-[#FDE68A] shadow-2xs flex flex-col justify-between hover:border-[#D97706] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Invites</span>
                <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                  <Send className="w-4 h-4 text-[#D97706]" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-amber-900 tracking-tight">{metrics.pending}</p>
                <p className="text-[10.5px] font-medium text-amber-700/70 mt-0.5">Awaiting first sign-in</p>
              </div>
            </div>

            {/* Suspended Accounts */}
            <div 
              onClick={() => { setActiveTab('users'); setStatusFilter('Suspended'); }}
              className="bg-gradient-to-br from-[#FFF1F2] to-white rounded-[22px] p-4.5 border border-[#FECDD3] shadow-2xs flex flex-col justify-between hover:border-[#E11D48] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Suspended</span>
                <div className="w-8 h-8 rounded-xl bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-[#E11D48]" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-rose-900 tracking-tight">{metrics.suspended}</p>
                <p className="text-[10.5px] font-medium text-rose-700/70 mt-0.5">Compliance & fee lock</p>
              </div>
            </div>
          </div>

          {/* Quick User Management Table Preview */}
          <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#172B5012] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#172B500C]">
              <div>
                <h3 className="text-base font-black text-[#172B50] tracking-tight">Active User Directory</h3>
                <p className="text-xs font-medium text-[#172B50]/60">Manage permissions, center access and credentials</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className="text-xs font-black text-[#F4510B] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>View Full Management Table ({users.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Compact Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#172B5010] text-[#172B50]/60 font-black uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Assigned Locations</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Last Login</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B500C]">
                  {users.slice(0, 6).map((u) => (
                    <tr key={u.id} className="hover:bg-[#FFF4E8]/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl ${u.avatarBg} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs`}>
                            {u.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-[#172B50] truncate">{u.name}</p>
                            <p className="text-[10.5px] font-medium text-[#172B50]/60 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">{renderRoleBadge(u.role)}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 flex-wrap max-w-xs">
                          {u.locations.length === ACADEMY_CENTERS.length ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF4E8] text-[#F4510B] border border-[#FED7AA]">
                              All Centers (5)
                            </span>
                          ) : (
                            u.locations.map(loc => (
                              <span key={loc} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#172B500C] text-[#172B50]">
                                {loc}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">{renderStatusBadge(u.status)}</td>
                      <td className="py-3 px-3 text-[#172B50]/75 font-medium text-[11px]">{u.lastLogin}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenViewProfile(u)}
                            className="p-1.5 rounded-lg border border-[#172B5015] hover:bg-[#FFF4E8] hover:text-[#F4510B] text-[#172B50] transition-colors cursor-pointer"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditUser(u)}
                            className="p-1.5 rounded-lg border border-[#172B5015] hover:bg-[#FFF4E8] hover:text-[#F4510B] text-[#172B50] transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAssignLocations(u)}
                            className="p-1.5 rounded-lg border border-[#172B5015] hover:bg-sky-50 hover:text-sky-600 text-[#172B50] transition-colors cursor-pointer"
                            title="Assign Locations"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. TAB 2: FULL USER ACCOUNTS DIRECTORY                       */}
      {/* ============================================================ */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-[#172B5012] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#172B50]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user by name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FFF4E8]/40 border border-[#172B5015] rounded-xl text-xs font-bold text-[#172B50] placeholder:text-[#172B50]/40 focus:outline-none focus:border-[#F4510B]"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5015] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B] cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="coach">Coach</option>
                <option value="parent">Parent</option>
              </select>

              {/* Location filter */}
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5015] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B] cursor-pointer"
              >
                <option value="ALL">All Locations</option>
                {ACADEMY_CENTERS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5015] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B] cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending Invite</option>
                <option value="Suspended">Suspended</option>
              </select>

              {(searchQuery || roleFilter !== 'ALL' || locationFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setRoleFilter('ALL');
                    setLocationFilter('ALL');
                    setStatusFilter('ALL');
                  }}
                  className="px-2.5 py-2 text-xs font-bold text-[#F4510B] hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-[24px] border border-[#172B5012] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#172B5010] bg-[#FFF4E8]/30 text-[#172B50]/65 font-black uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">User Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Mobile Number</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Assigned Locations</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B500C]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#172B50]/60">
                        <Users className="w-8 h-8 text-[#172B50]/30 mx-auto mb-2" />
                        <p className="font-bold text-sm">No user accounts found matching your filter</p>
                        <p className="text-xs mt-1">Try resetting search keywords or role filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#FFF4E8]/40 transition-colors group">
                        {/* Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8.5 h-8.5 rounded-xl ${u.avatarBg} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs`}>
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-[#172B50]">{u.name}</p>
                              <span className="text-[10px] font-bold text-[#172B50]/50">{u.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 font-bold text-[#172B50]/80">
                          {u.email}
                        </td>

                        {/* Mobile */}
                        <td className="py-3.5 px-4 font-bold text-[#172B50]/80">
                          {u.phone}
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          {renderRoleBadge(u.role)}
                        </td>

                        {/* Locations */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 flex-wrap max-w-xs">
                            {u.locations.length === ACADEMY_CENTERS.length ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFF4E8] text-[#F4510B] border border-[#FED7AA]">
                                All Centers (5)
                              </span>
                            ) : (
                              u.locations.map(loc => (
                                <span key={loc} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#172B500C] text-[#172B50]">
                                  {loc}
                                </span>
                              ))
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {renderStatusBadge(u.status)}
                        </td>

                        {/* Last Login */}
                        <td className="py-3.5 px-4 text-[#172B50]/75 font-medium text-[11px]">
                          {u.lastLogin}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Profile */}
                            <button
                              type="button"
                              onClick={() => handleOpenViewProfile(u)}
                              className="w-7 h-7 rounded-lg border border-[#172B5018] bg-white hover:bg-[#FFF4E8] hover:text-[#F4510B] text-[#172B50] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                              title="View Full Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(u)}
                              className="w-7 h-7 rounded-lg border border-[#172B5018] bg-white hover:bg-[#FFF4E8] hover:text-[#F4510B] text-[#172B50] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                              title="Edit User"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Assign Locations */}
                            <button
                              type="button"
                              onClick={() => handleOpenAssignLocations(u)}
                              className="w-7 h-7 rounded-lg border border-[#172B5018] bg-white hover:bg-sky-50 hover:text-sky-600 text-[#172B50] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                              title="Assign Locations"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </button>

                            {/* Reset Password */}
                            <button
                              type="button"
                              onClick={() => handleOpenResetPassword(u)}
                              className="w-7 h-7 rounded-lg border border-[#172B5018] bg-white hover:bg-amber-50 hover:text-amber-600 text-[#172B50] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                              title="Reset Password"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>

                            {/* Activate / Deactivate Toggle */}
                            {u.status === 'Active' ? (
                              <button
                                type="button"
                                onClick={() => handleInitiateStatusChange(u, 'Inactive')}
                                className="w-7 h-7 rounded-lg border border-[#172B5018] bg-white hover:bg-slate-100 hover:text-slate-700 text-[#172B50] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                                title="Deactivate Account"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            ) : u.status === 'Inactive' ? (
                              <button
                                type="button"
                                onClick={() => handleInitiateStatusChange(u, 'Active')}
                                className="w-7 h-7 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                                title="Reactivate Account"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            ) : null}

                            {/* Suspend / Reactivate */}
                            {u.status !== 'Suspended' ? (
                              <button
                                type="button"
                                onClick={() => handleInitiateStatusChange(u, 'Suspended')}
                                className="w-7 h-7 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                                title="Suspend Account"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleInitiateStatusChange(u, 'Active')}
                                className="w-7 h-7 rounded-lg border border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                                title="Restore from Suspension"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Send / Resend Invitation */}
                            <button
                              type="button"
                              onClick={() => handleSendInvite(u)}
                              className="w-7 h-7 rounded-lg border border-[#172B5018] bg-white hover:bg-[#FFF4E8] hover:text-[#F4510B] text-[#172B50] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                              title="Send / Resend Invitation"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3 bg-[#FFF4E8]/20 border-t border-[#172B500C] flex items-center justify-between text-xs text-[#172B50]/65 font-bold">
              <span>Showing {filteredUsers.length} of {users.length} accounts</span>
              <span>All changes reflected in real-time demonstration mode</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. TAB 3: LOCATION ACCESS INTERFACE                          */}
      {/* ============================================================ */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#172B5012] shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-[#172B50] tracking-tight">Location Access &amp; Center Clearances</h3>
                <p className="text-xs font-medium text-[#172B50]/65">
                  Visual multi-location assignment interface for Coaches, Parents and Administrators
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#FFF4E8] text-[#F4510B] border border-[#FED7AA]">
                  5 Active Centers
                </span>
              </div>
            </div>

            {/* Visual Center Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-[#172B500C]">
              {ACADEMY_CENTERS.map((center) => {
                const centerUserCount = users.filter(u => u.locations.includes(center)).length;
                const coachCount = users.filter(u => u.role === 'coach' && u.locations.includes(center)).length;
                const parentCount = users.filter(u => u.role === 'parent' && u.locations.includes(center)).length;

                return (
                  <div key={center} className="bg-[#FFF4E8]/30 rounded-2xl p-3.5 border border-[#172B5010] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#172B50]">{center}</span>
                      <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                    </div>
                    <div className="mt-2.5">
                      <p className="text-lg font-black text-[#172B50]">{centerUserCount} Users</p>
                      <p className="text-[10px] font-bold text-[#172B50]/60 mt-0.5">
                        {coachCount} Coaches • {parentCount} Parents
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group 1: Coach Profiles with Assigned Programs, Batches & Locations */}
          <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#172B5012] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#172B500C]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center">
                  <Award className="w-4 h-4 text-[#F4510B]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#172B50]">Coaching Faculty – Programs &amp; Batches Clearances</h4>
                  <p className="text-[11px] font-medium text-[#172B50]/60">Assigned arena courts, curriculum disciplines and class batches</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.filter(u => u.role === 'coach').map((coach) => (
                <div key={coach.id} className="bg-[#FFF9F5] rounded-2xl p-4 border border-[#F4510B20] flex flex-col justify-between space-y-3 shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#F4510B] text-white font-black text-xs flex items-center justify-center">
                          {coach.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#172B50]">{coach.name}</p>
                          <p className="text-[10px] font-bold text-[#172B50]/55">{coach.email}</p>
                        </div>
                      </div>
                      {renderStatusBadge(coach.status)}
                    </div>

                    {/* Assigned Programs */}
                    <div className="mt-3 space-y-1">
                      <p className="text-[10.5px] font-black uppercase tracking-wider text-[#172B50]/50">Assigned Programs:</p>
                      <div className="flex flex-wrap gap-1">
                        {(coach.assignedPrograms || ['General Multi-Sport']).map((prog, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white text-[#172B50] border border-[#172B5010]">
                            {prog}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Assigned Batches */}
                    <div className="mt-2.5 space-y-1">
                      <p className="text-[10.5px] font-black uppercase tracking-wider text-[#172B50]/50">Assigned Batches:</p>
                      <div className="flex flex-wrap gap-1">
                        {(coach.assignedBatches || ['Regular Session']).map((b, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#172B500C] text-[#172B50]">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Centers & Quick Action */}
                  <div className="pt-2.5 border-t border-[#F4510B15] flex items-center justify-between">
                    <div className="flex items-center gap-1 flex-wrap">
                      {coach.locations.map(loc => (
                        <span key={loc} className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-[#F4510B] text-white">
                          {loc}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenAssignLocations(coach)}
                      className="text-[11px] font-black text-[#F4510B] hover:underline cursor-pointer"
                    >
                      Reassign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group 2: Parent Profiles with Linked Children & Respective Locations */}
          <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#172B5012] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#172B500C]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#172B50]">Parent Profiles – Linked Children &amp; Training Locations</h4>
                  <p className="text-[11px] font-medium text-[#172B50]/60">Guardians restricted strictly to the arenas where their athletes train</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.filter(u => u.role === 'parent').map((parent) => (
                <div key={parent.id} className="bg-[#F4FDF7] rounded-2xl p-4 border border-[#16A34A20] flex flex-col justify-between space-y-3 shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                          {parent.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#172B50]">{parent.name}</p>
                          <p className="text-[10px] font-bold text-[#172B50]/55">{parent.email}</p>
                        </div>
                      </div>
                      {renderStatusBadge(parent.status)}
                    </div>

                    {/* Linked Children List */}
                    <div className="mt-3 space-y-2">
                      <p className="text-[10.5px] font-black uppercase tracking-wider text-[#172B50]/50">Linked Children &amp; Programs:</p>
                      {(parent.linkedChildren || []).map((ch, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-2.5 border border-[#172B500C] text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-[#172B50]">{ch.name} ({ch.age} yrs)</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#DCFCE7] text-[#16A34A]">
                              {ch.center}
                            </span>
                          </div>
                          <p className="text-[10px] font-medium text-[#172B50]/65 mt-0.5">{ch.program} • {ch.batch}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Centers & Quick Action */}
                  <div className="pt-2.5 border-t border-[#16A34A15] flex items-center justify-between">
                    <div className="flex items-center gap-1 flex-wrap">
                      {parent.locations.map(loc => (
                        <span key={loc} className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-emerald-700 text-white">
                          {loc}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenAssignLocations(parent)}
                      className="text-[11px] font-black text-emerald-700 hover:underline cursor-pointer"
                    >
                      Reassign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. TAB 4: ROLES & PERMISSIONS (RBAC MATRIX)                  */}
      {/* ============================================================ */}
      {activeTab === 'permissions' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#172B5012] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-[#172B50] tracking-tight">Role-Based Access Control (RBAC)</h3>
                <p className="text-xs font-medium text-[#172B50]/65">
                  Configure granular View, Create, Edit, Delete and Export authorizations across 13 core CRM modules
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleResetPermissions}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#172B5018] text-[#172B50] text-xs font-bold hover:bg-[#FFF4E8] transition-all cursor-pointer shadow-2xs"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  className="px-4 py-2 rounded-xl bg-[#F4510B] text-white text-xs font-extrabold hover:bg-[#d94406] transition-all shadow-sm cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>Save Matrix</span>
                </button>
              </div>
            </div>

            {/* Role Switcher Tabs */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#172B500C] overflow-x-auto">
              {[
                { id: 'super_admin', label: 'Super Admin', icon: Shield, desc: 'Master governance clearance' },
                { id: 'admin', label: 'Admin', icon: ShieldCheck, desc: 'Academy operations & admissions' },
                { id: 'coach', label: 'Coach', icon: Award, desc: 'Session training & attendance' },
                { id: 'parent', label: 'Parent', icon: GraduationCap, desc: 'Family portal & tuition' }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRoleForMatrix(r.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                    selectedRoleForMatrix === r.id
                      ? 'bg-[#F4510B] text-white shadow-sm'
                      : 'bg-[#FFF4E8]/50 text-[#172B50]/70 hover:bg-[#FFF4E8] hover:text-[#172B50] border border-[#172B5010]'
                  }`}
                >
                  <r.icon className={`w-3.5 h-3.5 ${selectedRoleForMatrix === r.id ? 'text-white' : 'text-[#F4510B]'}`} />
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 13-Module Permission Matrix Table */}
          <div className="bg-white rounded-[24px] border border-[#172B5012] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#172B5010] bg-[#FFF4E8]/40 text-[#172B50] font-black text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-1/3">Module / Capability</th>
                    <th className="py-3.5 px-4 text-center">View</th>
                    <th className="py-3.5 px-4 text-center">Create</th>
                    <th className="py-3.5 px-4 text-center">Edit</th>
                    <th className="py-3.5 px-4 text-center">Delete</th>
                    <th className="py-3.5 px-4 text-center">Export</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B500C]">
                  {PERMISSION_MODULES.map((mod) => {
                    const rolePerms = permissionMatrix[selectedRoleForMatrix] || {};
                    const modPerms = rolePerms[mod.id] || { view: false, create: false, edit: false, delete: false, export: false };

                    return (
                      <tr key={mod.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                        {/* Module Info */}
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-black text-[#172B50] text-sm">{mod.label}</p>
                            <p className="text-[10.5px] font-medium text-[#172B50]/60 mt-0.5">{mod.desc}</p>
                          </div>
                        </td>

                        {/* View Switch */}
                        <td className="py-3.5 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!modPerms.view}
                              onChange={() => handleTogglePermission(mod.id, 'view')}
                              className="w-4.5 h-4.5 rounded text-[#F4510B] focus:ring-[#F4510B] border-[#172B5025] cursor-pointer accent-[#F4510B]"
                            />
                          </label>
                        </td>

                        {/* Create Switch */}
                        <td className="py-3.5 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!modPerms.create}
                              onChange={() => handleTogglePermission(mod.id, 'create')}
                              className="w-4.5 h-4.5 rounded text-[#F4510B] focus:ring-[#F4510B] border-[#172B5025] cursor-pointer accent-[#F4510B]"
                            />
                          </label>
                        </td>

                        {/* Edit Switch */}
                        <td className="py-3.5 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!modPerms.edit}
                              onChange={() => handleTogglePermission(mod.id, 'edit')}
                              className="w-4.5 h-4.5 rounded text-[#F4510B] focus:ring-[#F4510B] border-[#172B5025] cursor-pointer accent-[#F4510B]"
                            />
                          </label>
                        </td>

                        {/* Delete Switch */}
                        <td className="py-3.5 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!modPerms.delete}
                              onChange={() => handleTogglePermission(mod.id, 'delete')}
                              className="w-4.5 h-4.5 rounded text-[#F4510B] focus:ring-[#F4510B] border-[#172B5025] cursor-pointer accent-[#F4510B]"
                            />
                          </label>
                        </td>

                        {/* Export Switch */}
                        <td className="py-3.5 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!modPerms.export}
                              onChange={() => handleTogglePermission(mod.id, 'export')}
                              className="w-4.5 h-4.5 rounded text-[#F4510B] focus:ring-[#F4510B] border-[#172B5025] cursor-pointer accent-[#F4510B]"
                            />
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#FFF4E8]/20 border-t border-[#172B500C] flex items-center justify-between text-xs text-[#172B50]/65 font-bold">
              <span>Configuring visual permissions for: <strong className="text-[#172B50] capitalize">{selectedRoleForMatrix.replace('_', ' ')}</strong></span>
              <span className="flex items-center gap-1.5 text-[#F4510B]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Frontend demonstration matrix</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. TAB 5: ACTIVITY HISTORY AUDIT LOG                         */}
      {/* ============================================================ */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-[#172B5012] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#172B50]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail by user, action or center..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FFF4E8]/40 border border-[#172B5015] rounded-xl text-xs font-bold text-[#172B50] placeholder:text-[#172B50]/40 focus:outline-none focus:border-[#F4510B]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={activityStatusFilter}
                onChange={(e) => setActivityStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5015] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B] cursor-pointer"
              >
                <option value="ALL">All Outcomes</option>
                <option value="Success">Success</option>
                <option value="Warning">Warning</option>
                <option value="Failed">Failed</option>
              </select>

              <button
                type="button"
                onClick={() => addToast('Activity audit log exported to CSV')}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#172B5018] text-[#172B50] text-xs font-bold flex items-center gap-1.5 hover:bg-[#FFF4E8] transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Log</span>
              </button>
            </div>
          </div>

          {/* Activity Log Table */}
          <div className="bg-white rounded-[24px] border border-[#172B5012] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#172B5010] bg-[#FFF4E8]/30 text-[#172B50]/65 font-black uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">User Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B500C]">
                  {filteredActivityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#172B50]/60">
                        <History className="w-8 h-8 text-[#172B50]/30 mx-auto mb-2" />
                        <p className="font-bold text-sm">No activity records match your filter</p>
                      </td>
                    </tr>
                  ) : (
                    filteredActivityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#FFF4E8]/40 transition-colors">
                        {/* User */}
                        <td className="py-3.5 px-4 font-black text-[#172B50]">
                          {log.user}
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          {renderRoleBadge(log.role)}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 font-bold text-[#172B50]/90">
                          {log.action}
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#172B500C] text-[#172B50]">
                            {log.location}
                          </span>
                        </td>

                        {/* Timestamp */}
                        <td className="py-3.5 px-4 text-[#172B50]/65 font-medium text-[11px]">
                          {log.timestamp}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-right">
                          {log.status === 'Success' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                              <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                              Success
                            </span>
                          )}
                          {log.status === 'Warning' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                              <AlertTriangle className="w-3 h-3 text-[#D97706]" />
                              Warning
                            </span>
                          )}
                          {log.status === 'Failed' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]">
                              <X className="w-3 h-3 text-[#E11D48]" />
                              Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#FFF4E8]/20 border-t border-[#172B500C] text-xs text-[#172B50]/65 font-bold">
              Showing {filteredActivityLogs.length} audit trail records
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. MODAL 1: ADD USER                                         */}
      {/* ============================================================ */}
      <Modal
        isOpen={modalType === 'add_user'}
        onClose={() => setModalType(null)}
        title="Add New User Account"
      >
        <form onSubmit={handleSaveAddUser} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-[#172B50] mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Coach Ramesh / Anand Sharma"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FFF4E8]/40 border border-[#172B5018] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-[#172B50] mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="user@littlespartans.co.in"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4E8]/40 border border-[#172B5018] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B]"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#172B50] mb-1">Mobile Number</label>
              <input
                type="tel"
                placeholder="+91 98765 00000"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4E8]/40 border border-[#172B5018] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#172B50] mb-1">Assign Role *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'coach', label: 'Coach', icon: Award },
                { id: 'parent', label: 'Parent', icon: GraduationCap },
                { id: 'admin', label: 'Admin', icon: ShieldCheck },
                { id: 'super_admin', label: 'Super Admin', icon: Shield }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setFormRole(r.id)}
                  className={`p-2.5 rounded-xl border text-xs font-black flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    formRole === r.id
                      ? 'bg-[#172B50] text-white border-[#172B50]'
                      : 'bg-[#FFF4E8]/40 text-[#172B50] border-[#172B5015] hover:bg-[#FFF4E8]'
                  }`}
                >
                  <r.icon className={`w-4 h-4 ${formRole === r.id ? 'text-[#F4510B]' : 'text-[#172B50]/60'}`} />
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#172B50] mb-1">Assign Centers / Locations *</label>
            <p className="text-[10.5px] font-medium text-[#172B50]/60 mb-2">Select one or multiple Little Spartans training centers</p>
            <div className="flex flex-wrap gap-2">
              {ACADEMY_CENTERS.map(c => {
                const isSelected = formLocations.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleToggleLocationInForm(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F4510B] text-white border-[#F4510B] shadow-2xs'
                        : 'bg-white text-[#172B50] border-[#172B5018] hover:bg-[#FFF4E8]'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[#172B5010]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formSendInvite}
                onChange={(e) => setFormSendInvite(e.target.checked)}
                className="w-4 h-4 rounded text-[#F4510B] focus:ring-[#F4510B] border-[#172B5025] accent-[#F4510B]"
              />
              <span className="text-xs font-bold text-[#172B50]">
                Dispatch immediate invitation link with temporary password
              </span>
            </label>
          </div>

          <div className="pt-3 border-t border-[#172B5010] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 rounded-xl border border-[#172B5018] text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#F4510B] text-white text-xs font-extrabold hover:bg-[#d94406] shadow-sm cursor-pointer"
            >
              Save &amp; Create User
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* 9. MODAL 2: EDIT USER                                        */}
      {/* ============================================================ */}
      <Modal
        isOpen={modalType === 'edit_user'}
        onClose={() => setModalType(null)}
        title={selectedUser ? `Edit User: ${selectedUser.name}` : 'Edit User'}
      >
        <form onSubmit={handleSaveEditUser} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-[#172B50] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FFF4E8]/40 border border-[#172B5018] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-[#172B50] mb-1">Email</label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4E8]/40 border border-[#172B5018] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B]"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#172B50] mb-1">Mobile Phone</label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF4E8]/40 border border-[#172B5018] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#172B50] mb-1">Assigned Role</label>
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FFF4E8]/40 border border-[#172B5018] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B]"
            >
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="coach">Coach</option>
              <option value="parent">Parent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-[#172B50] mb-1">Assigned Locations</label>
            <div className="flex flex-wrap gap-2">
              {ACADEMY_CENTERS.map(c => {
                const isSelected = formLocations.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleToggleLocationInForm(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F4510B] text-white border-[#F4510B]'
                        : 'bg-white text-[#172B50] border-[#172B5018] hover:bg-[#FFF4E8]'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#172B50] mb-1">Internal Notes</label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Add administrative notes..."
              className="w-full px-3.5 py-2 bg-[#FFF4E8]/40 border border-[#172B5018] rounded-xl text-xs font-medium text-[#172B50] focus:outline-none focus:border-[#F4510B]"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5010] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 rounded-xl border border-[#172B5018] text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#F4510B] text-white text-xs font-extrabold hover:bg-[#d94406] shadow-sm cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* 10. MODAL 3: VIEW USER PROFILE                                */}
      {/* ============================================================ */}
      <Modal
        isOpen={modalType === 'view_profile'}
        onClose={() => setModalType(null)}
        title={selectedUser ? `Profile: ${selectedUser.name}` : 'User Profile'}
      >
        {selectedUser && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#FFF4E8]/50 border border-[#172B5010]">
              <div className={`w-12 h-12 rounded-2xl ${selectedUser.avatarBg} text-white font-black text-base flex items-center justify-center shadow-sm`}>
                {selectedUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-[#172B50] truncate">{selectedUser.name}</h3>
                  {renderStatusBadge(selectedUser.status)}
                </div>
                <p className="text-xs font-bold text-[#172B50]/70">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {renderRoleBadge(selectedUser.role)}
                  <span className="text-[10px] font-bold text-[#172B50]/50">ID: {selectedUser.id}</span>
                </div>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-[#FFF4E8]/30 rounded-xl border border-[#172B5010]">
                <span className="text-[10.5px] font-bold text-[#172B50]/60">Mobile Phone</span>
                <p className="font-black text-[#172B50] mt-0.5">{selectedUser.phone}</p>
              </div>
              <div className="p-3 bg-[#FFF4E8]/30 rounded-xl border border-[#172B5010]">
                <span className="text-[10.5px] font-bold text-[#172B50]/60">Last Login</span>
                <p className="font-black text-[#172B50] mt-0.5">{selectedUser.lastLogin}</p>
              </div>
              <div className="p-3 bg-[#FFF4E8]/30 rounded-xl border border-[#172B5010]">
                <span className="text-[10.5px] font-bold text-[#172B50]/60">Member Since</span>
                <p className="font-black text-[#172B50] mt-0.5">{selectedUser.createdAt}</p>
              </div>
              <div className="p-3 bg-[#FFF4E8]/30 rounded-xl border border-[#172B5010]">
                <span className="text-[10.5px] font-bold text-[#172B50]/60">Two-Factor Authentication</span>
                <p className="font-black text-[#172B50] mt-0.5">{selectedUser.twoFactorEnabled ? 'Enabled (App/SMS)' : 'Disabled'}</p>
              </div>
            </div>

            {/* Locations */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-[#172B50]/60 mb-1.5">Assigned Locations:</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedUser.locations.map(loc => (
                  <span key={loc} className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#172B50] text-white">
                    {loc}
                  </span>
                ))}
              </div>
            </div>

            {/* Role-Specific Content */}
            {selectedUser.role === 'parent' && selectedUser.linkedChildren && (
              <div className="pt-2 border-t border-[#172B5010]">
                <p className="text-[11px] font-black uppercase tracking-wider text-[#172B50]/60 mb-2">Linked Children ({selectedUser.linkedChildren.length}):</p>
                <div className="space-y-2">
                  {selectedUser.linkedChildren.map((ch, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-[#172B5015] shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-[#172B50] text-xs">{ch.name} (Age {ch.age})</span>
                        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-[#DCFCE7] text-[#16A34A]">
                          {ch.center}
                        </span>
                      </div>
                      <p className="text-[10.5px] font-medium text-[#172B50]/65 mt-0.5">{ch.program} • {ch.batch}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedUser.role === 'coach' && (
              <div className="pt-2 border-t border-[#172B5010] space-y-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-[#172B50]/60">Coaching Allocations:</p>
                <div className="p-3 rounded-xl bg-white border border-[#172B5015] text-xs space-y-1.5 shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#172B50]/60">Disciplines: </span>
                    <span className="font-black text-[#172B50]">{(selectedUser.assignedPrograms || ['Junior Football']).join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#172B50]/60">Batches: </span>
                    <span className="font-black text-[#172B50]">{(selectedUser.assignedBatches || ['Morning Regular']).join(', ')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedUser.notes && (
              <div className="p-3 rounded-xl bg-[#FFF4E8]/40 border border-[#172B5010] text-xs text-[#172B50]/80">
                <span className="font-bold">Administrative Note: </span>
                <span>{selectedUser.notes}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-[#172B5010] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-xl bg-[#172B50] text-white text-xs font-bold hover:bg-[#0f1f3a] cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* 11. MODAL 4: ASSIGN LOCATIONS                                 */}
      {/* ============================================================ */}
      <Modal
        isOpen={modalType === 'assign_locations'}
        onClose={() => setModalType(null)}
        title={selectedUser ? `Location Clearances: ${selectedUser.name}` : 'Assign Locations'}
      >
        <div className="space-y-4">
          <p className="text-xs font-medium text-[#172B50]/70">
            Select one or multiple Little Spartans training centers to grant operational clearance for this account.
          </p>

          <div className="space-y-2">
            {ACADEMY_CENTERS.map((center) => {
              const isSelected = formLocations.includes(center);
              return (
                <div
                  key={center}
                  onClick={() => handleToggleLocationInForm(center)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#FFF5ED] border-[#F4510B] shadow-2xs'
                      : 'bg-white border-[#172B5015] hover:bg-[#FFF4E8]/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#F4510B]' : 'text-[#172B50]/40'}`} />
                    <span className="text-xs font-black text-[#172B50]">{center}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                    isSelected ? 'bg-[#F4510B] border-[#F4510B] text-white' : 'border-[#172B5025] bg-white'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#172B5010] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setFormLocations([...ACADEMY_CENTERS])}
              className="text-xs font-black text-[#F4510B] hover:underline cursor-pointer"
            >
              Select All 5 Centers
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#172B5018] text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLocations}
                className="px-4 py-1.5 rounded-xl bg-[#F4510B] text-white text-xs font-extrabold hover:bg-[#d94406] shadow-sm cursor-pointer"
              >
                Apply Clearances
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* 12. MODAL 5: RESET PASSWORD                                   */}
      {/* ============================================================ */}
      <Modal
        isOpen={modalType === 'reset_password'}
        onClose={() => setModalType(null)}
        title="Temporary Password Reset"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Key className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">A new temporary password has been generated for {selectedUser?.name}.</p>
              <p className="text-[11px] text-amber-800/80 mt-0.5">The user will be required to change this upon next login.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#172B50] mb-1">Temporary Password</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedPassword}
                className="flex-1 px-3.5 py-2.5 bg-white border border-[#172B5018] rounded-xl text-sm font-black text-[#172B50] tracking-wider"
              />
              <button
                type="button"
                onClick={handleCopyPassword}
                className="px-3.5 py-2.5 rounded-xl bg-[#172B50] text-white text-xs font-black hover:bg-[#0f1f3a] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[#172B5010] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                addToast(`New password emailed to ${selectedUser?.email}`);
                setModalType(null);
              }}
              className="px-4 py-2 rounded-xl bg-[#F4510B] text-white text-xs font-extrabold hover:bg-[#d94406] shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Email to User &amp; Done</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* 13. MODAL 6: CONFIRM STATUS CHANGE (ACTIVATE/SUSPEND)         */}
      {/* ============================================================ */}
      <Modal
        isOpen={modalType === 'confirm_status'}
        onClose={() => setModalType(null)}
        title={pendingStatusTarget ? `Confirm ${pendingStatusTarget.newStatus}: ${pendingStatusTarget.user.name}` : 'Confirm Action'}
      >
        <div className="space-y-4">
          <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            pendingStatusTarget?.newStatus === 'Suspended'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : pendingStatusTarget?.newStatus === 'Inactive'
              ? 'bg-slate-50 border-slate-200 text-slate-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-sm">
                Are you sure you want to change status to "{pendingStatusTarget?.newStatus}"?
              </p>
              <p className="mt-1 leading-relaxed">
                {pendingStatusTarget?.newStatus === 'Suspended'
                  ? 'The user will immediately be blocked from logging into the portal and ongoing court authorizations will be revoked.'
                  : pendingStatusTarget?.newStatus === 'Inactive'
                  ? 'Account will be placed in dormant mode. Can be reactivated at any time.'
                  : 'Full portal access and assigned center clearances will be immediately restored.'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#172B50] mb-1">Reason / Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. End of term / Fee recovery resolution / Seasonal leave"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#FFF4E8]/40 border border-[#172B5018] rounded-xl text-xs font-medium text-[#172B50] focus:outline-none focus:border-[#F4510B]"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5010] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 rounded-xl border border-[#172B5018] text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmStatusChange}
              className={`px-5 py-2 rounded-xl text-white text-xs font-extrabold shadow-sm cursor-pointer ${
                pendingStatusTarget?.newStatus === 'Suspended'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-[#F4510B] hover:bg-[#d94406]'
              }`}
            >
              Confirm Status Change
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
