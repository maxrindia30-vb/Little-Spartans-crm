import React, { useState } from 'react';
import { 
  MessageSquare, 
  Bell, 
  LifeBuoy, 
  Star, 
  Send, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Users
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import FeedbackModule from './FeedbackModule';

export default function CommunicationModule() {
  const { data, activeSubTab, setActiveSubTab, addToast, addTicketReply, updateTicketStatus } = useCrm();

  // Active subtab: 'announcements' | 'feedback' | 'parent_comm' | 'support_requests'
  const currentTab = activeSubTab || 'announcements';

  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnTarget, setNewAnnTarget] = useState('All Parents & Students');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [replyTextMap, setReplyTextMap] = useState({});

  const handlePublishAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;

    data.announcements.unshift({
      id: `ANN-${data.announcements.length + 1}`,
      title: newAnnTitle,
      date: new Date().toISOString().split('T')[0],
      target: newAnnTarget,
      content: newAnnContent
    });

    addToast(`Announcement "${newAnnTitle}" published to ${newAnnTarget}!`);
    setNewAnnTitle('');
    setNewAnnContent('');
  };

  const handleSendTicketReply = (ticketId) => {
    const text = replyTextMap[ticketId];
    if (!text || !text.trim()) return;
    addTicketReply(ticketId, text.trim(), 'Admin Desk');
    setReplyTextMap(prev => ({ ...prev, [ticketId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Module Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#172B501A] pb-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Academy Communication & Support
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Broadcast announcements, parent reviews, SMS dispatch and resolution ticketing
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#172B5018] shadow-xs self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveSubTab('announcements')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'announcements'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Announcements ({data.announcements.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('feedback')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'feedback'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Parent Reviews ({data.feedback.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('parent_comm')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'parent_comm'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Broadcasts & SMS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('support_requests')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'support_requests'
                ? 'bg-[#172B50] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-[#F4510B]" />
            <span>Support Requests ({data.supportTickets.filter(t => t.status !== 'Resolved').length})</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Announcements */}
      {currentTab === 'announcements' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Create Announcement Form */}
          <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
            <h2 className="text-base font-extrabold text-[#172B50] mb-3">Publish New Academy Circular</h2>
            <form onSubmit={handlePublishAnnouncement} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Announcement Title (e.g., Annual Sports Day Date Announced)"
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
                  />
                </div>
                <div>
                  <select
                    value={newAnnTarget}
                    onChange={(e) => setNewAnnTarget(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#172B5020] rounded-xl font-semibold text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
                  >
                    <option value="All Parents & Students">All Parents & Students</option>
                    <option value="Coaches & Staff">Coaches & Staff</option>
                    <option value="Gymnastics Batches">Gymnastics Batches</option>
                    <option value="Football League Squads">Football League Squads</option>
                  </select>
                </div>
              </div>
              <div>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed circular text, guidelines, uniform instructions or arena directions..."
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Circular</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Announcements */}
          <div className="space-y-3">
            {data.announcements.map(ann => (
              <div key={ann.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#172B50] text-white">
                      {ann.target}
                    </span>
                    <h3 className="font-extrabold text-base text-[#172B50] mt-1.5">{ann.title}</h3>
                  </div>
                  <span className="text-[11px] text-[#172B50]/60 shrink-0 font-semibold">{ann.date}</span>
                </div>
                <p className="text-xs text-[#172B50]/80 mt-2 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: Parent Feedback Module */}
      {currentTab === 'feedback' && (
        <FeedbackModule />
      )}

      {/* SUBTAB 3: Broadcasts & SMS */}
      {currentTab === 'parent_comm' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
            <h2 className="text-base font-extrabold text-[#172B50] mb-2">SMS & WhatsApp Broadcast Gateway</h2>
            <p className="text-xs text-[#172B50]/70 mb-4">Instant alert delivery for emergency rain cancellations, bus updates and fee reminders</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <span className="font-bold text-xs text-emerald-800 block">Class Delay / Weather Alert</span>
                <p className="text-[11px] text-emerald-700 mt-1">Dispatches to 48 parents of evening outdoor batches</p>
                <button
                  onClick={() => addToast('Weather alert SMS dispatched to 48 guardians.')}
                  className="mt-3 px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 cursor-pointer"
                >
                  Send Weather Notice
                </button>
              </div>
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
                <span className="font-bold text-xs text-blue-800 block">Tournament Registration Alert</span>
                <p className="text-[11px] text-blue-700 mt-1">Direct link for Agility Cup 2026 entry</p>
                <button
                  onClick={() => addToast('Tournament broadcast dispatched.')}
                  className="mt-3 px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Send Cup Notice
                </button>
              </div>
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                <span className="font-bold text-xs text-amber-800 block">Monthly Fee Reminders</span>
                <p className="text-[11px] text-amber-700 mt-1">Automated payment link delivery</p>
                <button
                  onClick={() => addToast('Fee reminder broadcast dispatched to pending list.')}
                  className="mt-3 px-3 py-1.5 bg-[#F4510B] text-white font-bold text-xs rounded-lg hover:brightness-110 cursor-pointer"
                >
                  Send Fee Alerts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Support Requests (Tickets) */}
      {currentTab === 'support_requests' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {data.supportTickets.map(t => (
            <div key={t.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#172B5010]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#F4510B]">{t.id}</span>
                    <span className="font-bold text-sm text-[#172B50]">{t.subject}</span>
                  </div>
                  <span className="text-[11px] text-[#172B50]/60 block mt-0.5">
                    From: {t.customerName} &bull; Category: {t.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                    t.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {t.status}
                  </span>
                  {t.status !== 'Resolved' && (
                    <button
                      type="button"
                      onClick={() => updateTicketStatus(t.id, 'Resolved')}
                      className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>

              {/* Message thread */}
              <div className="space-y-2 bg-[#FFF4E8]/20 p-3 rounded-xl border border-[#172B5010]">
                {t.messages.map((m, idx) => (
                  <div key={idx} className="text-xs">
                    <span className="font-bold text-[#172B50]">{m.sender}: </span>
                    <span className="text-[#172B50]/80">{m.text}</span>
                    <span className="text-[10px] text-[#172B50]/50 block mt-0.5">{m.time}</span>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              {t.status !== 'Resolved' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Type official reply to parent..."
                    value={replyTextMap[t.id] || ''}
                    onChange={(e) => setReplyTextMap({ ...replyTextMap, [t.id]: e.target.value })}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#172B5020] rounded-xl text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendTicketReply(t.id)}
                    className="px-3.5 py-1.5 bg-[#172B50] text-white text-xs font-bold rounded-xl hover:bg-[#20365F] transition-colors cursor-pointer"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
