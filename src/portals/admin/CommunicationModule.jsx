import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Inbox as InboxIcon,
  Megaphone,
  Radio,
  Layers,
  Send,
  Calendar,
  BarChart2,
  Filter,
  Star,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  CheckCheck,
  Check,
  Plus,
  Users,
  MapPin,
  Clock,
  Sparkles,
  Trophy,
  ChevronLeft,
  X,
  ChevronDown,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  FileCheck,
  Eye,
  Trash2,
  Copy,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';

export default function CommunicationModule() {
  const {
    data,
    currentUser,
    activeSubTab,
    setActiveSubTab,
    addToast,
    sendConversationMessage,
    markConversationRead,
    toggleConversationStar,
    createOrOpenConversation,
    sendBroadcastMessage,
    scheduleNewMessage,
    publishAnnouncementRecord,
  } = useCrm();

  // Secondary Navigation Subtabs
  // 'inbox' | 'announcements' | 'broadcasts' | 'templates' | 'sent' | 'scheduled' | 'reports'
  const currentTab = activeSubTab || 'inbox';

  // Conversations from CRM data (with fallback to initial mock data)
  const conversations = useMemo(() => {
    return data.conversations || [];
  }, [data.conversations]);

  // Selected Conversation ID (default to first conversation e.g. Priya R)
  const [selectedConvId, setSelectedConvId] = useState(() => {
    return conversations[0]?.id || 'CONV-1';
  });

  // Ensure selected conversation exists
  useEffect(() => {
    if (conversations.length > 0 && !conversations.some((c) => c.id === selectedConvId)) {
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, selectedConvId]);

  // Selected Conversation Object
  const selectedConv = useMemo(() => {
    return conversations.find((c) => c.id === selectedConvId) || conversations[0] || null;
  }, [conversations, selectedConvId]);

  // Mark conversation read on select
  useEffect(() => {
    if (selectedConv && selectedConv.unread > 0 && markConversationRead) {
      markConversationRead(selectedConv.id);
    }
  }, [selectedConvId]);

  // Inbox Filter Tabs: 'all' | 'unread' | 'starred'
  const [inboxTab, setInboxTab] = useState('all');
  const [inboxSearch, setInboxSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [showLocationFilterDropdown, setShowLocationFilterDropdown] = useState(false);

  // Mobile view state: when true, mobile displays the active chat full-screen
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Chat message input & attachments
  const [messageInput, setMessageInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [showEmojiTray, setShowEmojiTray] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const chatBottomRef = useRef(null);
  const fileInputRef = useRef(null);

  // Modals state
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isClassUpdateModalOpen, setIsClassUpdateModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Header Dropdown States
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [topSearchQuery, setTopSearchQuery] = useState('');

  // Call / Video action simulation modals
  const [callTargetParent, setCallTargetParent] = useState(null);
  const [videoTargetParent, setVideoTargetParent] = useState(null);

  // Form states
  const [newMsgForm, setNewMsgForm] = useState({
    parentName: '',
    childName: '',
    phone: '',
    location: 'KK Nagar',
    initialText: '',
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    target: 'All Parents & Students',
    content: '',
  });

  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    target: 'All Centers',
    content: '',
  });

  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    target: 'All Centers',
    scheduledDate: '',
    scheduledTime: '08:00',
    content: '',
  });

  const [classUpdateForm, setClassUpdateForm] = useState({
    location: 'KK Nagar',
    batch: 'Mixed Age',
    updateType: 'Schedule Confirmation',
    content: 'Class will be conducted as per regular timetable today. Please arrive 5 minutes early in training shoes.',
  });

  const [eventNotificationForm, setEventNotificationForm] = useState({
    eventName: 'Little Spartans Agility Championship 2026',
    target: 'Selected Nominees',
    content: 'Official invitations for the State Agility Championship have been dispatched. Please review tournament schedule & consent form.',
  });

  // Calculate unread counts dynamically
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((sum, c) => sum + (c.unread || 0), 0);
  }, [conversations]);

  const starredCount = useMemo(() => {
    return conversations.filter((c) => c.starred).length;
  }, [conversations]);

  // Filtered conversation list
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // Tab filter
      if (inboxTab === 'unread' && (!conv.unread || conv.unread === 0)) return false;
      if (inboxTab === 'starred' && !conv.starred) return false;

      // Location filter
      if (locationFilter !== 'All' && conv.location !== locationFilter) return false;

      // Search query filter (matches parent, child, or latest message)
      const q = (inboxSearch || topSearchQuery).toLowerCase().trim();
      if (q) {
        const matchParent = (conv.parentName || '').toLowerCase().includes(q);
        const matchChild = (conv.childName || '').toLowerCase().includes(q);
        const matchMsg = (conv.lastMessage || '').toLowerCase().includes(q);
        if (!matchParent && !matchChild && !matchMsg) return false;
      }

      return true;
    });
  }, [conversations, inboxTab, inboxSearch, topSearchQuery, locationFilter]);

  // Auto-scroll chat history to bottom
  const scrollToBottom = (smooth = true) => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [selectedConvId]);

  useEffect(() => {
    scrollToBottom(true);
  }, [selectedConv?.messages?.length]);

  // Handle Send Message
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() && !attachedFile) return;
    if (!selectedConv) return;

    sendConversationMessage(selectedConv.id, messageInput.trim(), attachedFile);
    setMessageInput('');
    setAttachedFile(null);
    setShowEmojiTray(false);
  };

  // Handle file attachment
  const handleAttachmentUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      addToast('File exceeds 15MB limit.', 'error');
      return;
    }
    setAttachedFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    addToast(`Attached "${file.name}"`, 'info');
  };

  // Handle New Message Form Submission
  const handleCreateNewMessage = (e) => {
    e.preventDefault();
    if (!newMsgForm.parentName.trim()) {
      addToast('Please enter or select a parent name.', 'error');
      return;
    }

    const res = createOrOpenConversation(newMsgForm);
    if (res.success && res.conversation) {
      setSelectedConvId(res.conversation.id);
      setIsMobileChatOpen(true);
      setIsNewMessageModalOpen(false);
      setNewMsgForm({
        parentName: '',
        childName: '',
        phone: '',
        location: 'KK Nagar',
        initialText: '',
      });
      addToast(`Conversation opened with ${res.conversation.parentName}.`, 'success');
    }
  };

  // Handle Publish Announcement
  const handlePublishAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      addToast('Please enter both title and content for the announcement.', 'error');
      return;
    }
    publishAnnouncementRecord(announcementForm);
    setIsAnnouncementModalOpen(false);
    setAnnouncementForm({
      title: '',
      target: 'All Parents & Students',
      content: '',
    });
  };

  // Handle Broadcast Dispatch
  const handleDispatchBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.content.trim()) {
      addToast('Title and content are required for broadcast.', 'error');
      return;
    }
    sendBroadcastMessage(broadcastForm);
    setIsBroadcastModalOpen(false);
    setBroadcastForm({
      title: '',
      target: 'All Centers',
      content: '',
    });
  };

  // Handle Schedule Message
  const handleScheduleDispatch = (e) => {
    e.preventDefault();
    if (!scheduleForm.title.trim() || !scheduleForm.content.trim() || !scheduleForm.scheduledDate) {
      addToast('Please specify title, content and scheduled date.', 'error');
      return;
    }
    const fullDate = `${scheduleForm.scheduledDate} ${scheduleForm.scheduledTime}`;
    scheduleNewMessage({
      title: scheduleForm.title,
      target: scheduleForm.target,
      content: scheduleForm.content,
      scheduledDate: fullDate,
    });
    setIsScheduleModalOpen(false);
    setScheduleForm({
      title: '',
      target: 'All Centers',
      scheduledDate: '',
      scheduledTime: '08:00',
      content: '',
    });
  };

  // Handle Use Template
  const handleApplyTemplate = (tpl) => {
    if (!selectedConv) {
      addToast('Please select a parent conversation first.', 'info');
      return;
    }
    let filledText = tpl.content
      .replace('{parent_name}', selectedConv.parentName)
      .replace('{child_name}', selectedConv.childName)
      .replace('{location}', selectedConv.location || 'KK Nagar')
      .replace('{day}', 'Tomorrow')
      .replace('{time}', '5:00 PM – 6:00 PM')
      .replace('{batch}', 'Mixed Age')
      .replace('{original_coach}', 'Coach A')
      .replace('{replacement_coach}', 'Coach D');

    setMessageInput(filledText);
    setIsTemplateModalOpen(false);
    addToast(`Template "${tpl.title}" inserted into chat input.`, 'info');
  };

  // Handle Class Update Dispatch
  const handleSendClassUpdate = (e) => {
    e.preventDefault();
    const updateTitle = `Class Update: ${classUpdateForm.location} • ${classUpdateForm.batch}`;
    sendBroadcastMessage({
      title: updateTitle,
      target: `${classUpdateForm.location} - ${classUpdateForm.batch}`,
      content: classUpdateForm.content,
    });
    setIsClassUpdateModalOpen(false);
  };

  // Handle Event Notification Dispatch
  const handleSendEventNotification = (e) => {
    e.preventDefault();
    sendBroadcastMessage({
      title: `Event Alert: ${eventNotificationForm.eventName}`,
      target: eventNotificationForm.target,
      content: eventNotificationForm.content,
    });
    setIsEventModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-[#172B5014] shadow-card">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B50] tracking-tight">
            Communication Center
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50]/70 font-medium mt-0.5">
            Stay connected with parents and keep everyone updated
          </p>
        </div>

        {/* Header Right Actions: Search, Notifications, Admin Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-auto">
          {/* Search messages, parents... */}
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#172B50]/40 absolute left-3 top-2.5" />
            <input
              type="text"
              value={topSearchQuery}
              onChange={(e) => setTopSearchQuery(e.target.value)}
              placeholder="Search messages, parents..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white text-[#172B50] placeholder-[#172B50]/45 border border-[#172B5018] rounded-full focus:outline-none focus:ring-2 focus:ring-[#F4510B]/30 focus:border-[#F4510B] transition-all font-medium"
            />
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotificationsDropdown(!showNotificationsDropdown);
              }}
              className="relative p-2 rounded-full bg-white border border-[#172B5018] text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B35] transition-all shadow-2xs cursor-pointer active:scale-95"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-[#172B50]" />
              {totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#F4510B] rounded-full ring-2 ring-white" />
              )}
            </button>

            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-dropdown border border-[#172B501A] p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#172B5010] mb-2">
                  <span className="text-xs font-black text-[#172B50]">Communication Alerts</span>
                  <span className="text-[10px] font-bold text-[#F4510B] bg-[#FFF4E8] px-2 py-0.5 rounded-full">
                    {totalUnreadCount} Unread
                  </span>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
                  {conversations
                    .filter((c) => c.unread > 0)
                    .map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedConvId(c.id);
                          setShowNotificationsDropdown(false);
                        }}
                        className="p-2 rounded-xl bg-[#FFF4E8]/50 hover:bg-[#FFF4E8] border border-[#F4510B20] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between font-bold text-[#172B50]">
                          <span>{c.parentName}</span>
                          <span className="text-[10px] text-[#F4510B]">{c.lastTime}</span>
                        </div>
                        <p className="text-[11px] text-[#172B50]/75 truncate mt-0.5">
                          {c.lastMessage}
                        </p>
                      </div>
                    ))}
                  {totalUnreadCount === 0 && (
                    <p className="text-center text-xs text-slate-400 py-4">No unread alerts</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN THREE-COLUMN LAYOUT (Secondary Nav + Inbox List + Chat Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ======================================================== */}
        {/* COLUMN 1: SECONDARY NAVIGATION (Span 3 on desktop)       */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 space-y-3">
          {/* New Message Button */}
          <button
            type="button"
            onClick={() => setIsNewMessageModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-extrabold text-xs bg-[#F4510B] text-white hover:bg-[#d84306] shadow-sm transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Message</span>
          </button>

          {/* Secondary Nav Items */}
          <div className="bg-white rounded-2xl border border-[#172B5014] p-2 shadow-card space-y-1">
            {[
              { id: 'inbox', label: 'Inbox', icon: InboxIcon, badge: totalUnreadCount },
              { id: 'announcements', label: 'Announcements', icon: Megaphone, badge: (data.announcements || []).length },
              { id: 'broadcasts', label: 'Broadcasts', icon: Radio },
              { id: 'templates', label: 'Templates', icon: Layers, badge: (data.messageTemplates || []).length },
              { id: 'sent', label: 'Sent Messages', icon: Send },
              { id: 'scheduled', label: 'Scheduled Messages', icon: Calendar, badge: (data.scheduledMessages || []).length },
              { id: 'reports', label: 'Message Reports', icon: BarChart2 },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSubTab(item.id);
                    setIsMobileChatOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FFF0E6] text-[#F4510B] border border-[#F4510B25] shadow-2xs font-extrabold'
                      : 'text-[#172B50] hover:bg-[#FFF4E8]/60 hover:text-[#F4510B]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F4510B]' : 'text-[#172B50]/70'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                        isActive
                          ? 'bg-[#F4510B] text-white'
                          : 'bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SUBTAB VIEWS: If non-inbox selected, show dedicated views */}
        {/* Otherwise show standard INBOX & CHAT side-by-side!       */}
        {/* ======================================================== */}
        {currentTab === 'inbox' ? (
          <>
            {/* ======================================================== */}
            {/* COLUMN 2: INBOX PANEL (Span 4 on desktop)                */}
            {/* ======================================================== */}
            <div
              className={`lg:col-span-4 bg-white rounded-2xl border border-[#172B5014] p-3.5 shadow-card flex flex-col h-[560px] lg:h-[620px] ${
                isMobileChatOpen ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {/* Inbox Header: Title, Search, Filter */}
              <div className="flex items-center justify-between pb-3 border-b border-[#172B5010]">
                <h2 className="text-base font-extrabold text-[#172B50]">Inbox</h2>
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowLocationFilterDropdown(!showLocationFilterDropdown)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        locationFilter !== 'All'
                          ? 'bg-[#FFF4E8] text-[#F4510B] border-[#F4510B30]'
                          : 'bg-white text-[#172B50]/70 border-[#172B5018] hover:border-[#F4510B]'
                      }`}
                      title="Filter conversations by center"
                    >
                      <Filter className="w-3.5 h-3.5" />
                    </button>

                    {showLocationFilterDropdown && (
                      <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-[#172B5015] p-2 z-40 text-xs">
                        <span className="text-[10px] font-black text-[#172B50]/60 uppercase block mb-1">Center Location</span>
                        {['All', 'KK Nagar', 'Mahalingapuram', 'Arumbakkam', 'Kilpauk'].map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => {
                              setLocationFilter(loc);
                              setShowLocationFilterDropdown(false);
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                              locationFilter === loc ? 'bg-[#F4510B] text-white font-bold' : 'hover:bg-slate-50 text-[#172B50]'
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Filter Tabs: All, Unread (12), Starred */}
              <div className="flex items-center gap-1.5 py-3 border-b border-[#172B500C]">
                <button
                  type="button"
                  onClick={() => setInboxTab('all')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    inboxTab === 'all'
                      ? 'bg-[#172B50] text-white shadow-xs'
                      : 'text-[#172B50]/70 hover:bg-slate-100'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setInboxTab('unread')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    inboxTab === 'unread'
                      ? 'bg-[#172B50] text-white shadow-xs'
                      : 'text-[#172B50]/70 hover:bg-slate-100'
                  }`}
                >
                  <span>Unread</span>
                  {totalUnreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-[#F4510B] text-white text-[9.5px] font-black rounded-full">
                      {totalUnreadCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setInboxTab('starred')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    inboxTab === 'starred'
                      ? 'bg-[#172B50] text-white shadow-xs'
                      : 'text-[#172B50]/70 hover:bg-slate-100'
                  }`}
                >
                  Starred {starredCount > 0 && `(${starredCount})`}
                </button>
              </div>

              {/* Search Inside Inbox List */}
              <div className="pt-2.5 pb-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#172B50]/40 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={inboxSearch}
                    onChange={(e) => setInboxSearch(e.target.value)}
                    placeholder="Search parent or child..."
                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#172B5014] rounded-xl focus:bg-white focus:outline-none focus:border-[#F4510B]"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {filteredConversations.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-12">
                    No conversations found matching filters.
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isSelected = conv.id === selectedConvId;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          setSelectedConvId(conv.id);
                          setIsMobileChatOpen(true);
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-[#F0FDF4] border-[#10B981]/50 shadow-xs ring-1 ring-[#10B981]/30'
                            : 'bg-white border-transparent hover:bg-[#FFF4E8]/50 hover:border-[#172B5010]'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black ${
                              conv.avatarColor || 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {conv.initial || conv.parentName.charAt(0)}
                          </div>
                          {conv.online && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs truncate ${isSelected ? 'font-black text-[#172B50]' : 'font-bold text-[#172B50]'}`}>
                              {conv.parentName}
                            </span>
                            <span className="text-[10px] text-[#172B50]/55 shrink-0 font-medium">
                              {conv.lastTime}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[#172B50]/60 font-medium truncate">
                            Parent of {conv.childName}
                          </p>
                          <p className="text-[11px] text-[#172B50]/75 truncate mt-0.5 font-normal">
                            {conv.lastMessage}
                          </p>
                        </div>

                        {/* Unread Pill Badge */}
                        {conv.unread > 0 && (
                          <div className="shrink-0 flex items-center">
                            <span className="w-5 h-5 rounded-full bg-[#F4510B] text-white text-[10px] font-black flex items-center justify-center">
                              {conv.unread}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ======================================================== */}
            {/* COLUMN 3: CHAT PANEL (Span 5 on desktop)                 */}
            {/* ======================================================== */}
            <div
              className={`lg:col-span-5 bg-white rounded-2xl border border-[#172B5014] shadow-card flex flex-col h-[560px] lg:h-[620px] overflow-hidden ${
                !isMobileChatOpen ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {selectedConv ? (
                <>
                  {/* Chat Header: Parent Info + Actions */}
                  <div className="p-3.5 border-b border-[#172B5012] flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Back button on mobile */}
                      <button
                        type="button"
                        onClick={() => setIsMobileChatOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg text-[#172B50] hover:bg-slate-100 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Parent Avatar */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          selectedConv.avatarColor || 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {selectedConv.initial || selectedConv.parentName.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-[#172B50] truncate leading-tight">
                          {selectedConv.parentName}
                        </h3>
                        <p className="text-[11px] text-[#172B50]/65 font-medium truncate">
                          Parent of {selectedConv.childName}
                        </p>
                      </div>
                    </div>

                    {/* Chat Header Action Icons: Star, Call, Video, More Options */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleConversationStar(selectedConv.id)}
                        title={selectedConv.starred ? 'Starred' : 'Star conversation'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          selectedConv.starred
                            ? 'text-amber-500 hover:bg-amber-50'
                            : 'text-[#172B50]/60 hover:text-[#172B50] hover:bg-slate-100'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${selectedConv.starred ? 'fill-amber-400' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setCallTargetParent(selectedConv)}
                        title="Call Parent"
                        className="p-1.5 rounded-lg text-[#172B50]/70 hover:text-[#172B50] hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setVideoTargetParent(selectedConv)}
                        title="Start Video Meeting"
                        className="p-1.5 rounded-lg text-[#172B50]/70 hover:text-[#172B50] hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                      </button>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowChatOptions(!showChatOptions)}
                          title="More options"
                          className="p-1.5 rounded-lg text-[#172B50]/70 hover:text-[#172B50] hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {showChatOptions && (
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-[#172B5015] p-1.5 z-40 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                handleApplyTemplate(data.messageTemplates?.[0] || {
                                  title: 'Class Reminder',
                                  content: 'Reminder: Training session scheduled today at KK Nagar.',
                                });
                                setShowChatOptions(false);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-[#172B50] font-semibold cursor-pointer"
                            >
                              Insert Quick Template
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                addToast(`Parent contact: ${selectedConv.phone || '+91 98401 23456'}`, 'info');
                                setShowChatOptions(false);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-[#172B50] font-semibold cursor-pointer"
                            >
                              View Contact Info
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Chat Message History Container (with warm cream / doodle background) */}
                  <div
                    className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FFFDF9]"
                    style={{
                      backgroundImage: 'radial-gradient(#172B5008 1px, transparent 1px)',
                      backgroundSize: '18px 18px',
                    }}
                  >
                    {/* Date Separator */}
                    <div className="flex items-center justify-center my-2">
                      <span className="px-3 py-0.5 rounded-full text-[10.5px] font-bold text-[#172B50]/65 bg-[#172B50]/5 border border-[#172B5010]">
                        Today
                      </span>
                    </div>

                    {/* Messages List */}
                    {(selectedConv.messages || []).map((msg) => {
                      const isOutgoing = msg.sender === 'admin';

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`p-3 rounded-2xl text-xs max-w-[85%] sm:max-w-[78%] space-y-1 shadow-2xs leading-relaxed ${
                              isOutgoing
                                ? 'bg-[#DCF8C6] border border-[#BDEAA6] text-[#172B50] rounded-tr-xs'
                                : 'bg-white border border-[#172B5012] text-[#172B50] rounded-tl-xs'
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.text}</p>

                            {/* Attachment Link if present */}
                            {msg.attachment && (
                              <div className="pt-1">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 border border-[#172B5015] text-[11px] font-bold text-[#172B50]">
                                  <Paperclip className="w-3 h-3 text-[#F4510B]" />
                                  <span className="truncate max-w-[160px]">{msg.attachment.name}</span>
                                </div>
                              </div>
                            )}

                            {/* Timestamp & Read Receipt */}
                            <div className="flex items-center justify-end gap-1 text-[10px] text-[#172B50]/55 pt-0.5">
                              <span>{msg.time}</span>
                              {isOutgoing && (
                                <CheckCheck className="w-3 h-3 text-sky-500 shrink-0" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div ref={chatBottomRef} />
                  </div>

                  {/* Message Input Bar */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-3 bg-white border-t border-[#172B5012] shrink-0"
                  >
                    {/* Attachment preview chip if selected */}
                    {attachedFile && (
                      <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-[#FFF5ED] border border-[#F4510B30] text-xs font-bold text-[#F4510B]">
                        <span className="truncate max-w-[240px]">📎 {attachedFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setAttachedFile(null)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Emoji Quick Bar if toggled */}
                    {showEmojiTray && (
                      <div className="flex items-center gap-2 p-2 mb-2 bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto text-base">
                        {['👍', '⚽', '🥋', '🏆', '😊', '📅', '🙏', '❤️', '✅', '🥇'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setMessageInput((prev) => prev + emoji)}
                            className="p-1 hover:scale-125 transition-transform cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAttachmentUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach file"
                        className="p-2 rounded-full text-slate-500 hover:text-[#172B50] hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>

                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="Type a message..."
                          className="w-full px-4 py-2 text-xs bg-white text-[#172B50] border border-[#172B501A] rounded-full focus:outline-none focus:ring-2 focus:ring-[#00AFA3]/30 focus:border-[#00AFA3] transition-all font-medium"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowEmojiTray(!showEmojiTray)}
                        title="Add emoji"
                        className="p-2 rounded-full text-slate-500 hover:text-[#172B50] hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Smile className="w-4 h-4" />
                      </button>

                      <button
                        type="submit"
                        disabled={!messageInput.trim() && !attachedFile}
                        className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center hover:bg-[#047857] disabled:opacity-40 transition-all cursor-pointer shadow-xs shrink-0 active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs p-6">
                  <InboxIcon className="w-8 h-8 mb-2 opacity-50 text-[#172B50]" />
                  <span>Select a conversation to start chatting</span>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ======================================================== */
          /* NON-INBOX SECONDARY VIEWS (Span 9 on desktop)            */
          /* ======================================================== */
          <div className="lg:col-span-9 space-y-4">
            {/* VIEW: ANNOUNCEMENTS */}
            {currentTab === 'announcements' && (
              <div className="bg-white rounded-2xl border border-[#172B5014] p-5 shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#172B5010]">
                  <div>
                    <h3 className="text-base font-extrabold text-[#172B50] flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-[#F4510B]" />
                      Academy Announcements
                    </h3>
                    <p className="text-xs text-[#172B50]/65">Broadcast news, tournament schedules and holiday updates.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAnnouncementModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#F4510B] text-white hover:bg-[#d84306] cursor-pointer"
                  >
                    + Post Announcement
                  </button>
                </div>

                <div className="space-y-3">
                  {(data.announcements || []).map((ann) => (
                    <div key={ann.id} className="p-4 rounded-xl border border-[#172B5012] bg-[#FFF4E8]/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-[#172B50]">{ann.title}</span>
                        <span className="text-[10px] font-bold text-[#F4510B] bg-[#FFF4E8] px-2 py-0.5 rounded-full border border-[#F4510B20]">
                          {ann.date}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#172B50]/60 font-semibold block">Target: {ann.target}</span>
                      <p className="text-xs text-[#172B50]/80 whitespace-pre-line">{ann.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW: BROADCASTS */}
            {currentTab === 'broadcasts' && (
              <div className="bg-white rounded-2xl border border-[#172B5014] p-5 shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#172B5010]">
                  <div>
                    <h3 className="text-base font-extrabold text-[#172B50] flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-600" />
                      Dispatched Broadcasts & SMS
                    </h3>
                    <p className="text-xs text-[#172B50]/65">Multi-channel instant messages sent to parents.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBroadcastModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    + New Broadcast
                  </button>
                </div>

                <div className="space-y-3">
                  {(data.broadcasts || []).map((bc) => (
                    <div key={bc.id} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-[#172B50]">{bc.title}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Sent: {bc.sentAt}
                        </span>
                      </div>
                      <p className="text-xs text-[#172B50]/80">{bc.content}</p>
                      <div className="flex items-center gap-4 text-[11px] font-bold text-[#172B50]/70 pt-1 border-t border-emerald-100">
                        <span>Target: {bc.target}</span>
                        <span>Delivered: {bc.deliveredCount || 45}</span>
                        <span className="text-emerald-700">Status: Sent ✓✓</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW: TEMPLATES */}
            {currentTab === 'templates' && (
              <div className="bg-white rounded-2xl border border-[#172B5014] p-5 shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#172B5010]">
                  <div>
                    <h3 className="text-base font-extrabold text-[#172B50] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-600" />
                      Message Templates Library
                    </h3>
                    <p className="text-xs text-[#172B50]/65">Pre-configured message formats for speedy replies.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(data.messageTemplates || []).map((tpl) => (
                    <div key={tpl.id} className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-purple-900">{tpl.title}</span>
                          <span className="text-[9.5px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                            {tpl.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#172B50]/80 mt-1 italic">"{tpl.content}"</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleApplyTemplate(tpl);
                          setActiveSubTab('inbox');
                        }}
                        className="mt-2 text-xs font-bold text-purple-700 bg-white border border-purple-200 hover:bg-purple-600 hover:text-white py-1.5 px-3 rounded-lg transition-colors cursor-pointer self-start"
                      >
                        Use in Active Chat
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW: SENT MESSAGES */}
            {currentTab === 'sent' && (
              <div className="bg-white rounded-2xl border border-[#172B5014] p-5 shadow-card space-y-4">
                <h3 className="text-base font-extrabold text-[#172B50] flex items-center gap-2 pb-3 border-b border-[#172B5010]">
                  <Send className="w-4 h-4 text-sky-600" />
                  Sent Messages History
                </h3>
                <div className="space-y-2">
                  {conversations.flatMap((c) =>
                    (c.messages || [])
                      .filter((m) => m.sender === 'admin')
                      .map((m) => (
                        <div key={m.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-[#172B50]">To: {c.parentName} ({c.childName})</span>
                            <p className="text-[#172B50]/75 truncate max-w-md mt-0.5">{m.text}</p>
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold">{m.date} • {m.time}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* VIEW: SCHEDULED MESSAGES */}
            {currentTab === 'scheduled' && (
              <div className="bg-white rounded-2xl border border-[#172B5014] p-5 shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#172B5010]">
                  <div>
                    <h3 className="text-base font-extrabold text-[#172B50] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#0284C7]" />
                      Scheduled Messages
                    </h3>
                    <p className="text-xs text-[#172B50]/65">Automatic future dispatches and reminders.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0284C7] text-white hover:bg-[#0369a1] cursor-pointer"
                  >
                    + Schedule Message
                  </button>
                </div>

                <div className="space-y-3">
                  {(data.scheduledMessages || []).map((sch) => (
                    <div key={sch.id} className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-[#172B50]">{sch.title}</span>
                        <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                          ⏰ {sch.scheduledDate}
                        </span>
                      </div>
                      <span className="text-[10.5px] text-[#172B50]/65 block font-semibold">Target: {sch.target}</span>
                      <p className="text-xs text-[#172B50]/80">{sch.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW: MESSAGE REPORTS */}
            {currentTab === 'reports' && (
              <div className="bg-white rounded-2xl border border-[#172B5014] p-5 shadow-card space-y-5">
                <h3 className="text-base font-extrabold text-[#172B50] flex items-center gap-2 pb-3 border-b border-[#172B5010]">
                  <BarChart2 className="w-4 h-4 text-[#172B50]" />
                  Message Delivery &amp; Parent Engagement Reports
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#FFF4E8] border border-[#F4510B20]">
                    <span className="text-[10.5px] font-bold text-[#172B50]/65 uppercase block">Total Dispatched</span>
                    <span className="text-xl font-black text-[#F4510B] mt-1 block">142</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10.5px] font-bold text-emerald-800 uppercase block">Delivery Rate</span>
                    <span className="text-xl font-black text-emerald-800 mt-1 block">99.4%</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200">
                    <span className="text-[10.5px] font-bold text-sky-800 uppercase block">Read Rate</span>
                    <span className="text-xl font-black text-sky-800 mt-1 block">88.2%</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200">
                    <span className="text-[10.5px] font-bold text-purple-800 uppercase block">Avg Response</span>
                    <span className="text-xl font-black text-purple-800 mt-1 block">&lt; 15 mins</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. QUICK ACTIONS ROW (Spanning full available content width) */}
      <div className="space-y-3 pt-2">
        <h2 className="text-sm font-extrabold text-[#172B50]">Quick Actions</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Send Announcement */}
          <button
            type="button"
            onClick={() => setIsAnnouncementModalOpen(true)}
            className="p-3.5 rounded-2xl bg-[#FFF4E8] border border-[#F4510B25] hover:border-[#F4510B] hover:shadow-xs transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center text-[#EA580C] group-hover:scale-110 transition-transform">
              <Megaphone className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-[#172B50] group-hover:text-[#F4510B] leading-tight">
              Send Announcement
            </span>
          </button>

          {/* Card 2: Broadcast Message */}
          <button
            type="button"
            onClick={() => setIsBroadcastModalOpen(true)}
            className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-emerald-200 hover:border-emerald-500 hover:shadow-xs transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center text-[#059669] group-hover:scale-110 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-[#172B50] group-hover:text-emerald-700 leading-tight">
              Broadcast Message
            </span>
          </button>

          {/* Card 3: Use Template */}
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="p-3.5 rounded-2xl bg-[#F5F3FF] border border-purple-200 hover:border-purple-500 hover:shadow-xs transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center text-[#7C3AED] group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-[#172B50] group-hover:text-purple-700 leading-tight">
              Use Template
            </span>
          </button>

          {/* Card 4: Schedule Message */}
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="p-3.5 rounded-2xl bg-[#F0F9FF] border border-sky-200 hover:border-sky-500 hover:shadow-xs transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center text-[#0284C7] group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-[#172B50] group-hover:text-sky-700 leading-tight">
              Schedule Message
            </span>
          </button>

          {/* Card 5: Class Update */}
          <button
            type="button"
            onClick={() => setIsClassUpdateModalOpen(true)}
            className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-amber-200 hover:border-amber-500 hover:shadow-xs transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center text-[#D97706] group-hover:scale-110 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-[#172B50] group-hover:text-amber-700 leading-tight">
              Class Update
            </span>
          </button>

          {/* Card 6: Event Notification */}
          <button
            type="button"
            onClick={() => setIsEventModalOpen(true)}
            className="p-3.5 rounded-2xl bg-[#FFF1F2] border border-rose-200 hover:border-rose-500 hover:shadow-xs transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center text-[#E11D48] group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-[#172B50] group-hover:text-rose-700 leading-tight">
              Event Notification
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FUNCTIONAL WORKFLOW MODALS                               */}
      {/* ======================================================== */}

      {/* Modal: New Message */}
      <Modal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        title="Start New Parent Conversation"
        subtitle="Select a parent from directory or enter recipient details"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateNewMessage} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-[#172B50] mb-1">Parent Name *</label>
            <input
              type="text"
              required
              value={newMsgForm.parentName}
              onChange={(e) => setNewMsgForm({ ...newMsgForm, parentName: e.target.value })}
              placeholder="e.g. Priya R"
              className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#172B50] mb-1">Student / Child Name</label>
              <input
                type="text"
                value={newMsgForm.childName}
                onChange={(e) => setNewMsgForm({ ...newMsgForm, childName: e.target.value })}
                placeholder="e.g. Arjun"
                className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#172B50] mb-1">Center Location</label>
              <select
                value={newMsgForm.location}
                onChange={(e) => setNewMsgForm({ ...newMsgForm, location: e.target.value })}
                className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50] bg-white font-semibold"
              >
                <option value="KK Nagar">KK Nagar</option>
                <option value="Mahalingapuram">Mahalingapuram</option>
                <option value="Arumbakkam">Arumbakkam</option>
                <option value="Kilpauk">Kilpauk</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#172B50] mb-1">Initial Message</label>
            <textarea
              rows={3}
              value={newMsgForm.initialText}
              onChange={(e) => setNewMsgForm({ ...newMsgForm, initialText: e.target.value })}
              placeholder="Type your opening message to parent..."
              className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#172B5014]">
            <button
              type="button"
              onClick={() => setIsNewMessageModalOpen(false)}
              className="px-4 py-2 rounded-xl font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-extrabold bg-[#F4510B] text-white hover:bg-[#d84306] cursor-pointer"
            >
              Start Conversation
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Send Announcement */}
      <Modal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        title="Send Announcement"
        subtitle="Broadcast officially across academy parent community"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handlePublishAnnouncement} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-[#172B50] mb-1">Announcement Title *</label>
            <input
              type="text"
              required
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              placeholder="e.g. Little Spartans State Agility Championship 2026"
              className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#172B50] mb-1">Target Audience</label>
            <select
              value={announcementForm.target}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, target: e.target.value })}
              className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50] bg-white font-semibold"
            >
              <option value="All Parents & Students">All Parents &amp; Students</option>
              <option value="KK Nagar Center">KK Nagar Center</option>
              <option value="Mahalingapuram Center">Mahalingapuram Center</option>
              <option value="Arumbakkam Center">Arumbakkam Center</option>
              <option value="Kilpauk Center">Kilpauk Center</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#172B50] mb-1">Content Body *</label>
            <textarea
              rows={4}
              required
              value={announcementForm.content}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
              placeholder="Enter announcement text, schedules, instructions..."
              className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#172B5014]">
            <button
              type="button"
              onClick={() => setIsAnnouncementModalOpen(false)}
              className="px-4 py-2 rounded-xl font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-extrabold bg-[#F4510B] text-white hover:bg-[#d84306] cursor-pointer"
            >
              Publish Announcement
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Broadcast Message */}
      <Modal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        title="Broadcast Message"
        subtitle="Instant multi-recipient SMS & push delivery"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleDispatchBroadcast} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-[#172B50] mb-1">Broadcast Subject *</label>
            <input
              type="text"
              required
              value={broadcastForm.title}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
              placeholder="e.g. Rainy Season Training & Indoor Court Notice"
              className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#172B50] mb-1">Target Center</label>
            <select
              value={broadcastForm.target}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, target: e.target.value })}
              className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50] bg-white font-semibold"
            >
              <option value="All Centers">All Centers (48 Active Parents)</option>
              <option value="KK Nagar">KK Nagar</option>
              <option value="Mahalingapuram">Mahalingapuram</option>
              <option value="Arumbakkam">Arumbakkam</option>
              <option value="Kilpauk">Kilpauk</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#172B50] mb-1">Message Body *</label>
            <textarea
              rows={4}
              required
              value={broadcastForm.content}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, content: e.target.value })}
              placeholder="Type message to broadcast to all parents..."
              className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#172B5014]">
            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(false)}
              className="px-4 py-2 rounded-xl font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-extrabold bg-[#059669] text-white hover:bg-[#047857] cursor-pointer"
            >
              Dispatch Broadcast
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Use Template */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title="Select Message Template"
        subtitle="Choose from approved academy message templates"
        maxWidth="max-w-xl"
      >
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {(data.messageTemplates || []).map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => handleApplyTemplate(tpl)}
                className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 transition-all cursor-pointer space-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#172B50]">{tpl.title}</span>
                    <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#172B50]/75 line-clamp-3 mt-1 italic">
                    "{tpl.content}"
                  </p>
                </div>
                <span className="text-[10px] font-bold text-purple-700 self-end mt-1">
                  Click to Use →
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t border-[#172B5014]">
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(false)}
              className="px-4 py-2 rounded-xl font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Schedule Message */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Message Dispatch"
        subtitle="Automate notification delivery at a chosen date and time"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleScheduleDispatch} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-[#172B50] mb-1">Message Subject *</label>
            <input
              type="text"
              required
              value={scheduleForm.title}
              onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
              placeholder="e.g. Weekend Batch Hydration & Warmup Reminder"
              className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#172B50] mb-1">Scheduled Date *</label>
              <input
                type="date"
                required
                value={scheduleForm.scheduledDate}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#172B50] mb-1">Scheduled Time</label>
              <input
                type="time"
                value={scheduleForm.scheduledTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })}
                className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#172B50] mb-1">Message Content *</label>
            <textarea
              rows={3}
              required
              value={scheduleForm.content}
              onChange={(e) => setScheduleForm({ ...scheduleForm, content: e.target.value })}
              placeholder="Enter message text to be delivered automatically..."
              className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#172B5014]">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 rounded-xl font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-extrabold bg-[#0284C7] text-white hover:bg-[#0369a1] cursor-pointer"
            >
              Confirm Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Class Update */}
      <Modal
        isOpen={isClassUpdateModalOpen}
        onClose={() => setIsClassUpdateModalOpen(false)}
        title="Dispatch Class Update"
        subtitle="Notify parents regarding schedule, coach cover, or court changes"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSendClassUpdate} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#172B50] mb-1">Location</label>
              <select
                value={classUpdateForm.location}
                onChange={(e) => setClassUpdateForm({ ...classUpdateForm, location: e.target.value })}
                className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50] bg-white font-semibold"
              >
                <option value="KK Nagar">KK Nagar</option>
                <option value="Mahalingapuram">Mahalingapuram</option>
                <option value="Arumbakkam">Arumbakkam</option>
                <option value="Kilpauk">Kilpauk</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#172B50] mb-1">Batch</label>
              <input
                type="text"
                value={classUpdateForm.batch}
                onChange={(e) => setClassUpdateForm({ ...classUpdateForm, batch: e.target.value })}
                placeholder="e.g. Mixed Age"
                className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#172B50] mb-1">Update Message</label>
            <textarea
              rows={3}
              required
              value={classUpdateForm.content}
              onChange={(e) => setClassUpdateForm({ ...classUpdateForm, content: e.target.value })}
              className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#172B5014]">
            <button
              type="button"
              onClick={() => setIsClassUpdateModalOpen(false)}
              className="px-4 py-2 rounded-xl font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-extrabold bg-[#D97706] text-white hover:bg-[#b45309] cursor-pointer"
            >
              Send Class Update
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Event Notification */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Send Event Notification"
        subtitle="Invite or alert parents regarding agility meets and cups"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSendEventNotification} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-[#172B50] mb-1">Event / Tournament Title</label>
            <input
              type="text"
              required
              value={eventNotificationForm.eventName}
              onChange={(e) => setEventNotificationForm({ ...eventNotificationForm, eventName: e.target.value })}
              className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#172B50] mb-1">Event Notice Content</label>
            <textarea
              rows={4}
              required
              value={eventNotificationForm.content}
              onChange={(e) => setEventNotificationForm({ ...eventNotificationForm, content: e.target.value })}
              className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#172B5014]">
            <button
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              className="px-4 py-2 rounded-xl font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-extrabold bg-[#E11D48] text-white hover:bg-[#be123c] cursor-pointer"
            >
              Dispatch Event Notice
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Call Simulation */}
      {callTargetParent && (
        <Modal
          isOpen={Boolean(callTargetParent)}
          onClose={() => setCallTargetParent(null)}
          title={`Call ${callTargetParent.parentName}`}
          subtitle={`Parent of ${callTargetParent.childName} • Center: ${callTargetParent.location || 'KK Nagar'}`}
          maxWidth="max-w-sm"
        >
          <div className="text-center space-y-4 py-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <Phone className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#172B50]">{callTargetParent.phone || '+91 98401 23456'}</p>
              <p className="text-xs text-slate-500 mt-1">Direct Academy VoIP Line connected.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                addToast(`Call ended with ${callTargetParent.parentName}.`, 'info');
                setCallTargetParent(null);
              }}
              className="w-full py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700"
            >
              End Call
            </button>
          </div>
        </Modal>
      )}

      {/* Modal: Video Simulation */}
      {videoTargetParent && (
        <Modal
          isOpen={Boolean(videoTargetParent)}
          onClose={() => setVideoTargetParent(null)}
          title={`Video Session with ${videoTargetParent.parentName}`}
          subtitle={`Parent Consultation for ${videoTargetParent.childName}`}
          maxWidth="max-w-sm"
        >
          <div className="text-center space-y-4 py-3">
            <div className="w-14 h-14 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mx-auto shadow-sm">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#172B50]/80">
                Encrypted Parent Consultation Room generated. A link has been dispatched to {videoTargetParent.parentName}.
              </p>
              <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono select-all">
                https://meet.littlespartans.co.in/{videoTargetParent.id.toLowerCase()}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                addToast('Meeting link copied and sent to parent.', 'success');
                setVideoTargetParent(null);
              }}
              className="w-full py-2 bg-[#0284C7] text-white rounded-xl font-bold text-xs hover:bg-[#0369a1]"
            >
              Join Consultation Room
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
