import React, { useState } from 'react';
import { 
  PhoneCall, 
  LifeBuoy, 
  Users, 
  Calendar, 
  Bell, 
  MessageSquare, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Send,
  Search,
  Filter
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import KpiCard from '../../components/common/KpiCard';
import Modal from '../../components/common/Modal';

export default function SupportPortalView() {
  const { 
    currentView, 
    setCurrentView, 
    data, 
    createTicket, 
    updateTicketStatus, 
    addTicketReply, 
    updateEnquiryStage, 
    addToast 
  } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Create ticket modal states
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCustomer, setTicketCustomer] = useState(data.parents[0]?.name || '');
  const [ticketCategory, setTicketCategory] = useState('Batch Reschedule');
  const [ticketPriority, setTicketPriority] = useState('Medium');
  const [ticketDescription, setTicketDescription] = useState('');

  // Follow up completion state
  const [followupsList, setFollowupsList] = useState(data.followups);

  const openTickets = data.supportTickets.filter(t => t.status === 'Open').length;
  const inProgressTickets = data.supportTickets.filter(t => t.status === 'In Progress').length;

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;

    createTicket({
      subject: ticketSubject,
      customerName: ticketCustomer,
      category: ticketCategory,
      priority: ticketPriority,
      description: ticketDescription,
      assignedTo: 'Support Agent Priya'
    });

    setIsCreateTicketOpen(false);
    setTicketSubject('');
    setTicketDescription('');
  };

  const handleSendReply = (ticketId) => {
    if (!ticketReplyText.trim()) return;
    addTicketReply(ticketId, ticketReplyText, 'Support Agent Priya');
    setTicketReplyText('');
  };

  const handleMarkFollowupDone = (id) => {
    setFollowupsList(prev => prev.map(f => f.id === id ? { ...f, status: 'Completed' } : f));
    addToast('Follow-up call logged as completed.');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. SUPPORT DASHBOARD */}
      {currentView === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Customer Support & Admissions Desk
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Priya Menon (Lead Relations Officer) • Managing Inquiries, Grievances & Parent Concierge
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreateTicketOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Create Support Ticket</span>
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Active Inquiries"
              value={data.enquiries.length}
              subtitle="Prospective Leads"
              icon={PhoneCall}
              trend={15.0}
              trendLabel="this week"
              highlight={true}
            />
            <KpiCard
              title="Open Tickets"
              value={openTickets}
              subtitle={`${inProgressTickets} in progress`}
              icon={LifeBuoy}
            />
            <KpiCard
              title="Avg Response Time"
              value="12 Mins"
              subtitle="Target SLA < 30 mins"
              icon={Clock}
            />
            <KpiCard
              title="Resolution Rate"
              value="97.4%"
              subtitle="Parent satisfaction index"
              icon={CheckCircle2}
            />
          </div>

          {/* Today's Follow-up Calls & Active Inquiries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Follow-up Queue */}
            <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
              <div className="flex items-center justify-between pb-3 border-b border-[#172B5012]">
                <h3 className="text-sm font-extrabold text-[#172B50] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#F4510B]" />
                  <span>Scheduled Parent Calls & Follow-ups</span>
                </h3>
                <span className="text-xs font-bold text-[#F4510B]">Today's Queue</span>
              </div>

              <div className="space-y-3 mt-3.5">
                {followupsList.map(flw => (
                  <div key={flw.id} className="p-3.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-[#172B50] block">{flw.leadName}</span>
                      <p className="text-[11px] text-[#172B50] opacity-75 mt-0.5">{flw.type} • {flw.scheduledTime}</p>
                      <p className="text-[10px] text-[#172B50] opacity-60 mt-1 italic">"{flw.notes}"</p>
                    </div>

                    {flw.status === 'Completed' ? (
                      <span className="px-2 py-1 rounded-lg text-[10px] font-black bg-[#172B50] text-white">
                        Done
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkFollowupDone(flw.id)}
                        className="px-3 py-1.5 text-xs font-bold bg-[#F4510B] text-white rounded-lg hover:brightness-110"
                      >
                        Call Done
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Active Tickets Quick View */}
            <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
              <div className="flex items-center justify-between pb-3 border-b border-[#172B5012]">
                <h3 className="text-sm font-extrabold text-[#172B50] flex items-center gap-1.5">
                  <LifeBuoy className="w-4 h-4 text-[#F4510B]" />
                  <span>Recent Parent Support Requests</span>
                </h3>
                <button
                  onClick={() => setCurrentView('tickets')}
                  className="text-xs font-bold text-[#F4510B] hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3 mt-3.5">
                {data.supportTickets.slice(0, 3).map(ticket => (
                  <div key={ticket.id} className="p-3.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[#172B50]">{ticket.subject}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          ticket.priority === 'High' ? 'bg-[#F4510B] text-white' : 'bg-[#172B50] text-white'
                        }`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#172B50] opacity-75 mt-0.5">
                        {ticket.customerName} • Updated {ticket.lastUpdate}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setCurrentView('tickets');
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-[#172B50] text-white rounded-lg hover:bg-[#F4510B]"
                    >
                      Reply
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. ENQUIRIES & PIPELINE */}
      {currentView === 'enquiries' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
              Admissions Enquiry Pipeline
            </h1>
          </div>

          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF4E8] text-[#172B50] font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Child & Age</th>
                  <th className="p-3.5">Parent Contact</th>
                  <th className="p-3.5">Program</th>
                  <th className="p-3.5">Pipeline Stage</th>
                  <th className="p-3.5 text-right">Update Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B5010]">
                {data.enquiries.map(enq => (
                  <tr key={enq.id}>
                    <td className="p-3.5">
                      <span className="font-extrabold text-[#172B50] block">{enq.childName}</span>
                      <span className="text-[10px] text-[#172B50] opacity-60">{enq.childAge} yrs old</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-[#172B50] block">{enq.parentName}</span>
                      <span className="text-[10px] text-[#172B50] opacity-75">{enq.phone}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-[#172B50]">{enq.interestedProgram}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020]">
                        {enq.stage}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <select
                        value={enq.stage}
                        onChange={(e) => updateEnquiryStage(enq.id, e.target.value)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[#172B5020] bg-white text-[#172B50] outline-none"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Trial Scheduled">Trial Scheduled</option>
                        <option value="Trial Completed">Trial Completed</option>
                        <option value="Enrolled">Enrolled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CUSTOMER DIRECTORY */}
      {currentView === 'directory' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
              Customer Directory (Quick Search)
            </h1>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#172B501A] shadow-card">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-[#172B50] opacity-50 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search parent by name, phone or address..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] placeholder-[#172B5080] border border-[#172B5020] rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.parents
              .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone.includes(searchTerm))
              .map(p => (
                <div key={p.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
                  <span className="text-[10px] font-bold uppercase text-[#F4510B]">{p.id} • {p.center}</span>
                  <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{p.name}</h3>
                  <p className="text-xs text-[#172B50] opacity-75 mt-1">Children: {p.children.join(', ')}</p>
                  <div className="mt-3 pt-3 border-t border-[#172B5015] text-xs space-y-1 text-[#172B50]">
                    <p><span className="font-bold">Phone:</span> {p.phone}</p>
                    <p><span className="font-bold">Email:</span> {p.email}</p>
                    <p><span className="font-bold">Address:</span> {p.address}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 4. SUPPORT TICKETS */}
      {currentView === 'tickets' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
              Support Tickets & Grievance Desk
            </h1>
            <button
              onClick={() => setIsCreateTicketOpen(true)}
              className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              New Ticket
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Tickets List */}
            <div className="lg:col-span-1 space-y-3">
              {data.supportTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedTicket?.id === ticket.id
                      ? 'bg-white border-[#F4510B] shadow-dropdown ring-2 ring-[#F4510B]'
                      : 'bg-white border-[#172B501A] hover:bg-[#FFF4E8]/50 shadow-card'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase text-[#F4510B]">{ticket.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      ticket.status === 'Resolved' ? 'bg-[#172B50] text-white' : 'bg-[#F4510B] text-white'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-[#172B50] mt-1 line-clamp-1">{ticket.subject}</h4>
                  <p className="text-[11px] text-[#172B50] opacity-75 mt-0.5">{ticket.customerName}</p>
                </div>
              ))}
            </div>

            {/* Ticket Detail / Thread */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card flex flex-col justify-between min-h-[400px]">
              {selectedTicket ? (
                <div>
                  <div className="flex justify-between items-start pb-4 border-b border-[#172B5015]">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#F4510B]">{selectedTicket.category}</span>
                      <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{selectedTicket.subject}</h3>
                      <p className="text-xs text-[#172B50] opacity-75">
                        Customer: <span className="font-bold">{selectedTicket.customerName}</span> • Assigned to: {selectedTicket.assignedTo}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[#172B5020] bg-[#FFF4E8] text-[#172B50] outline-none"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  {/* Messages Thread */}
                  <div className="space-y-3 my-4 max-h-64 overflow-y-auto pr-2">
                    {selectedTicket.messages.map((m, idx) => {
                      const isSupport = m.sender.includes('Support') || m.sender.includes('Desk');
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl max-w-md ${
                            isSupport
                              ? 'ml-auto bg-[#172B50] text-white'
                              : 'mr-auto bg-[#FFF4E8] text-[#172B50] border border-[#172B5015]'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] opacity-75 mb-1 font-bold">
                            <span>{m.sender}</span>
                            <span>{m.time}</span>
                          </div>
                          <p className="text-xs leading-relaxed">{m.text}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Input */}
                  <div className="pt-3 border-t border-[#172B5015] flex gap-2">
                    <input
                      type="text"
                      value={ticketReplyText}
                      onChange={(e) => setTicketReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendReply(selectedTicket.id)}
                      placeholder="Type response to parent..."
                      className="flex-1 px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] placeholder-[#172B5080] border border-[#172B5020] rounded-xl outline-none"
                    />
                    <button
                      onClick={() => handleSendReply(selectedTicket.id)}
                      className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl hover:brightness-110 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center my-auto text-center py-12">
                  <LifeBuoy className="w-12 h-12 text-[#172B50] opacity-30 mb-2" />
                  <p className="text-sm font-bold text-[#172B50]">Select a support ticket to view conversation</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 5. COMMUNICATION LOG */}
      {currentView === 'communication' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Parent Communication Logs
          </h1>
          <div className="space-y-3">
            {data.announcements.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-[#172B501A] shadow-card text-center text-xs text-[#172B50] opacity-65">
                No communication logs recorded yet.
              </div>
            ) : (
              data.announcements.map((ann, i) => (
                <div key={ann.id || i} className="p-4 bg-white rounded-2xl border border-[#172B501A] shadow-card flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#F4510B] uppercase">{ann.category || 'Broadcast'}</span>
                    <p className="text-xs font-semibold text-[#172B50] mt-1">{ann.title || ann.content}</p>
                  </div>
                  <span className="text-[10px] text-[#172B50] opacity-60 font-semibold">{ann.date || ''}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. FOLLOW-UPS */}
      {currentView === 'followups' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Follow-up Call Register
          </h1>
          <div className="space-y-3">
            {followupsList.map(flw => (
              <div key={flw.id} className="p-4 bg-white rounded-2xl border border-[#172B501A] shadow-card flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-[#172B50] block">{flw.leadName}</span>
                  <p className="text-[11px] text-[#172B50] opacity-75">{flw.type} • {flw.scheduledTime}</p>
                  <p className="text-[11px] text-[#172B50] opacity-80 mt-1 italic">"{flw.notes}"</p>
                </div>
                {flw.status === 'Completed' ? (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#172B50] text-white">
                    Completed
                  </span>
                ) : (
                  <button
                    onClick={() => handleMarkFollowupDone(flw.id)}
                    className="px-3 py-1.5 text-xs font-bold bg-[#F4510B] text-white rounded-lg hover:brightness-110"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. FEEDBACK MANAGEMENT */}
      {currentView === 'feedback' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Parent Grievances & Testimonials
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.feedback.map(fb => (
              <div key={fb.id} className="p-5 bg-white rounded-2xl border border-[#172B501A] shadow-card">
                <span className="text-[10px] font-bold text-[#F4510B] uppercase">{fb.category}</span>
                <h4 className="text-sm font-extrabold text-[#172B50] mt-0.5">{fb.parentName}</h4>
                <p className="text-xs text-[#172B50] opacity-80 mt-2 italic bg-[#FFF4E8] p-3 rounded-xl">
                  "{fb.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. REPORTS */}
      {currentView === 'reports' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Support Desk Performance & SLA Reports
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-[#172B501A] shadow-card">
              <span className="text-[10px] font-bold text-[#172B50] opacity-60 uppercase">Average First Response</span>
              <h3 className="text-2xl font-black text-[#172B50] mt-1">11.8 Mins</h3>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-[#172B501A] shadow-card">
              <span className="text-[10px] font-bold text-[#172B50] opacity-60 uppercase">Ticket Resolution SLA</span>
              <h3 className="text-2xl font-black text-[#F4510B] mt-1">98.5%</h3>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-[#172B501A] shadow-card">
              <span className="text-[10px] font-bold text-[#172B50] opacity-60 uppercase">Trial Turnout Rate</span>
              <h3 className="text-2xl font-black text-[#172B50] mt-1">89.2%</h3>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isCreateTicketOpen}
        onClose={() => setIsCreateTicketOpen(false)}
        title="Create Parent Support Ticket"
        subtitle="Log issue, grievance or request into CRM queue"
      >
        <form onSubmit={handleCreateTicket} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Parent Customer Name *</label>
            <input
              type="text"
              required
              value={ticketCustomer}
              onChange={(e) => setTicketCustomer(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Ticket Subject *</label>
            <input
              type="text"
              required
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              placeholder="e.g. Request to change training batch slot"
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Category</label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                <option value="Batch Reschedule">Batch Reschedule</option>
                <option value="Billing & Invoices">Billing & Invoices</option>
                <option value="Academy Kit & Uniform">Academy Kit & Uniform</option>
                <option value="Coach Consultation">Coach Consultation</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Priority</label>
              <select
                value={ticketPriority}
                onChange={(e) => setTicketPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Details & Description *</label>
            <textarea
              rows="3"
              required
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
              placeholder="Describe customer's issue or inquiry..."
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateTicketOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              Log Ticket
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
