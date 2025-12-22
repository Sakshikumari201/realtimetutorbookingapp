// Feedback form with Heroicons
import React, { useState } from 'react';
import { useFeedback } from '../hooks/useFeedback';
import { 
  StarIcon, 
  PlusIcon, 
  XMarkIcon, 
  ArrowPathIcon,
  ChatBubbleLeftIcon,
  AcademicCapIcon
} from '@heroicons/react/24/solid';
import { ChartBarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

const INDICATORS = [
  { value: 'problem_solving', label: 'Problem Solving' },
  { value: 'concept_clarity', label: 'Concept Clarity' },
  { value: 'speed', label: 'Speed & Efficiency' },
  { value: 'confidence', label: 'Confidence' },
  { value: 'understanding', label: 'Deep Understanding' },
];

export const FeedbackForm = ({ booking, onSuccess, onCancel }) => {
  const { submitFeedback, loading, error } = useFeedback();
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [outcomes, setOutcomes] = useState([
    { indicator: 'concept_clarity', before_level: 5, after_level: 7 },
  ]);

  const addOutcome = () => {
    const usedIndicators = outcomes.map(o => o.indicator);
    const available = INDICATORS.find(i => !usedIndicators.includes(i.value));
    if (available) {
      setOutcomes([...outcomes, { indicator: available.value, before_level: 5, after_level: 5 }]);
    }
  };

  const removeOutcome = (index) => {
    if (outcomes.length > 1) {
      setOutcomes(outcomes.filter((_, i) => i !== index));
    }
  };

  const updateOutcome = (index, field, value) => {
    const updated = [...outcomes];
    updated[index] = { ...updated[index], [field]: value };
    setOutcomes(updated);
  };

  const handleSubmit = async () => {
    const result = await submitFeedback(
      booking.id,
      booking.student_id,
      rating,
      comment,
      outcomes
    );

    if (result) {
      onSuccess?.(result);
    }
  };

  const getRatingLabel = () => {
    const labels = ['Poor', 'Fair', 'Good', 'Great!', 'Excellent!'];
    return labels[rating - 1];
  };

  return (
    <div className="card max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <ChatBubbleLeftIcon className="w-6 h-6 text-primary-light" />
        <h3 className="text-2xl font-bold">Session Feedback</h3>
      </div>
      <p className="text-text-muted mb-6">Help us improve by sharing your experience</p>

      {/* Star Rating */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">How was your session?</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              className="p-0 bg-transparent border-none cursor-pointer transition-transform hover:scale-110"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHoveredRating(i)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              <StarIcon 
                className={`w-8 h-8 transition-all ${
                  i <= (hoveredRating || rating) ? 'text-warning' : 'text-gray-600'
                }`} 
              />
            </button>
          ))}
          <span className="ml-4 font-semibold text-warning">{getRatingLabel()}</span>
        </div>
      </div>

      {/* Comments */}
      <div className="mb-6">
        <label className="form-label">Comments (optional)</label>
        <textarea
          className="form-input resize-none"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about the session..."
          rows="3"
        />
      </div>

      {/* Learning Outcomes */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ChartBarIcon className="w-5 h-5 text-primary-light" />
          <label className="font-semibold">Learning Progress</label>
        </div>
        <p className="text-text-muted text-sm mb-4">Track how much you improved in each area</p>
        
        <div className="flex flex-col gap-4">
          {outcomes.map((outcome, idx) => (
            <div key={idx} className="bg-bg-elevated rounded-xl p-4">
              <div className="flex gap-3 mb-4">
                <select
                  className="form-select flex-1"
                  value={outcome.indicator}
                  onChange={(e) => updateOutcome(idx, 'indicator', e.target.value)}
                >
                  {INDICATORS.map(ind => (
                    <option key={ind.value} value={ind.value}>{ind.label}</option>
                  ))}
                </select>
                {outcomes.length > 1 && (
                  <button 
                    className="w-8 h-8 flex items-center justify-center bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors"
                    onClick={() => removeOutcome(idx)}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-sm text-text-secondary">
                    Before: <strong className="text-text-primary">{outcome.before_level}</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={outcome.before_level}
                    onChange={(e) => updateOutcome(idx, 'before_level', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <label className="text-sm text-text-secondary">
                    After: <strong className="text-text-primary">{outcome.after_level}</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={outcome.after_level}
                    onChange={(e) => updateOutcome(idx, 'after_level', parseInt(e.target.value))}
                  />
                </div>

                <div className={`inline-flex items-center gap-1 self-start px-3 py-1 rounded-full text-sm font-semibold
                  ${outcome.after_level > outcome.before_level ? 'bg-success/15 text-success' : 
                    outcome.after_level < outcome.before_level ? 'bg-error/15 text-error' : 
                    'bg-gray-500/15 text-text-muted'}`}>
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                  {outcome.after_level > outcome.before_level ? '+' : ''}{outcome.after_level - outcome.before_level} improvement
                </div>
              </div>
            </div>
          ))}
        </div>

        {outcomes.length < INDICATORS.length && (
          <button className="btn btn-secondary mt-4" onClick={addOutcome}>
            <PlusIcon className="w-4 h-4" />
            Add Another Skill
          </button>
        )}
      </div>

      {error && <p className="text-error mb-4">{error}</p>}

      <div className="flex gap-3 justify-end pt-6 border-t border-gray-700">
        {onCancel && (
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        )}
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : 'Submit Feedback'}
        </button>
      </div>
    </div>
  );
};

export default FeedbackForm;
