import React, { useState } from 'react';
import { MessageSquare, Star, ThumbsUp, Plus, ShieldCheck, Heart } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';

export default function FeedbackModule() {
  const { data, addFeedback } = useCrm();
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [parentName, setParentName] = useState(data.parents[0]?.name || '');
  const [studentName, setStudentName] = useState(data.students[0]?.name || '');
  const [coachName, setCoachName] = useState(data.coaches[0]?.name || '');
  const [rating, setRating] = useState('5');
  const [category, setCategory] = useState('Coaching Quality');
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addFeedback({
      parentName,
      studentName,
      coachName,
      rating: parseInt(rating) || 5,
      category,
      comment,
      program: 'Spartan Gymnastics & Agility'
    });

    setIsAddOpen(false);
    setComment('');
  };

  const avgRating = (data.feedback.reduce((sum, f) => sum + f.rating, 0) / (data.feedback.length || 1)).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Parent & Athlete Feedback
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Academy testimonials, coach reviews and satisfaction metrics
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Rating Score Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF4E8] flex items-center justify-center shrink-0 border border-[#172B5015]">
            <Star className="w-8 h-8 text-[#F4510B] fill-[#F4510B]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#172B50]">{avgRating}</span>
              <span className="text-xs font-bold text-[#172B50] opacity-60">/ 5.0 Overall Rating</span>
            </div>
            <p className="text-xs text-[#172B50] opacity-80 mt-1">
              Based on {data.feedback.length} parent evaluations this term. 98% would recommend Little Spartans.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-[#FFF4E8] border border-[#172B5015] text-center">
            <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">Coaching</span>
            <span className="text-sm font-extrabold text-[#F4510B]">4.9 / 5</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#FFF4E8] border border-[#172B5015] text-center">
            <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">Safety</span>
            <span className="text-sm font-extrabold text-[#172B50]">5.0 / 5</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#FFF4E8] border border-[#172B5015] text-center">
            <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">Facilities</span>
            <span className="text-sm font-extrabold text-[#172B50]">4.8 / 5</span>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.feedback.map(fb => (
          <div key={fb.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card flex flex-col justify-between hover:shadow-dropdown transition-shadow">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F4510B]">
                    {fb.category}
                  </span>
                  <h4 className="text-sm font-extrabold text-[#172B50] mt-0.5">{fb.parentName}</h4>
                  <p className="text-[11px] text-[#172B50] opacity-70">
                    Athlete: {fb.studentName} • {fb.coachName}
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-[#FFF4E8] px-2 py-1 rounded-lg border border-[#172B5015]">
                  <Star className="w-3.5 h-3.5 text-[#F4510B] fill-[#F4510B]" />
                  <span className="text-xs font-black text-[#172B50]">{fb.rating}.0</span>
                </div>
              </div>

              <p className="mt-3 text-xs text-[#172B50] opacity-85 leading-relaxed italic bg-[#FFF4E8]/50 p-3 rounded-xl border border-[#172B5010]">
                "{fb.comment}"
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#172B5015] flex items-center justify-between text-[10px] text-[#172B50] opacity-60">
              <span>Date: {fb.date}</span>
              <span className="font-bold text-[#172B50] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F4510B]" />
                <span>Verified Academy Parent</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Feedback Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Submit Parent Feedback / Review"
        subtitle="Log testimonial from parent or athlete review"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Parent Name *</label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Athlete Child</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Review Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                <option value="Coaching Quality">Coaching Quality</option>
                <option value="Facility & Safety">Facility & Safety</option>
                <option value="Child Development">Child Development</option>
                <option value="Curriculum Suggestion">Curriculum Suggestion</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                <option value="5">5 - Exceptional</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Satisfactory</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Review Testimonial *</label>
            <textarea
              rows="3"
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share how Little Spartans impacted the child's discipline, speed or confidence..."
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
              Publish Testimonial
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
