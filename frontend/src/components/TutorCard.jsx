// Tutor card component with Heroicons
import React from 'react';
import { StarIcon, CurrencyRupeeIcon, ClockIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

export const TutorCard = ({ tutor, onBookClick }) => {
  const matchPercent = Math.round((tutor.match_score || 0) * 100);
  const slots = tutor.available_slots || [];
  const slotsCount = slots.length;
  const rating = Number(tutor.rating) || 5;

  return (
    <div className="card hover:-translate-y-1 transition-transform duration-300 flex flex-col gap-4">
      {/* Header */}
      <div className="relative flex justify-center">
        <img 
          src={tutor.profile_pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.name}`} 
          alt={tutor.name} 
          className="w-20 h-20 rounded-full object-cover border-[3px] border-primary shadow-glow"
        />
        {tutor.match_score && (
          <div className={`absolute top-0 right-0 flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full
            ${matchPercent >= 80 ? 'bg-success/20 text-success' : 
              matchPercent >= 60 ? 'bg-warning/20 text-warning' : 
              'bg-primary/20 text-primary-light'}`}>
            <CheckBadgeIcon className="w-3.5 h-3.5" />
            {matchPercent}%
          </div>
        )}
      </div>
      
      {/* Body */}
      <div className="flex-1 flex flex-col gap-3 text-center">
        <h3 className="text-xl font-bold text-text-primary">{tutor.name}</h3>
        
        {/* Rating */}
        <div className="flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <StarIcon 
              key={i} 
              className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-warning' : 'text-gray-600'}`} 
            />
          ))}
          <span className="ml-2 font-semibold text-warning">{rating.toFixed(1)}</span>
          <span className="text-text-muted text-sm">({tutor.reviews_count || 0})</span>
        </div>

        <p className="text-sm text-text-secondary line-clamp-2">
          {tutor.bio || 'Experienced tutor ready to help you succeed.'}
        </p>
        
        {/* Subjects */}
        <div className="flex flex-wrap justify-center gap-2">
          {(tutor.subjects || []).slice(0, 3).map((subject, idx) => (
            <span key={idx} className="px-3 py-1 bg-primary/15 text-primary-light text-xs font-medium rounded-full">
              {subject}
            </span>
          ))}
        </div>

        {/* Meta */}
        <div className="flex justify-center gap-6 pt-3 border-t border-gray-700">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-text-muted">
              <CurrencyRupeeIcon className="w-3.5 h-3.5" />
              <span className="text-xs uppercase tracking-wide">Rate</span>
            </div>
            <span className="text-sm font-semibold text-success">₹{tutor.hourly_rate}/hr</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-text-muted">
              <CalendarDaysIcon className="w-3.5 h-3.5" />
              <span className="text-xs uppercase tracking-wide">Slots</span>
            </div>
            <span className={`text-sm font-semibold ${slotsCount > 0 ? 'text-accent' : 'text-text-muted'}`}>
              {slotsCount > 0 ? `${slotsCount} available` : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <button 
          className="btn btn-primary w-full"
          onClick={() => onBookClick?.(tutor)}
          disabled={slotsCount === 0}
        >
          {slotsCount > 0 ? 'Book Now' : 'No Slots Available'}
        </button>
      </div>
    </div>
  );
};

export default TutorCard;
