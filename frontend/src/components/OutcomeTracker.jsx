// Learning progress tracker with Heroicons
import React, { useEffect, useState } from 'react';
import { useFeedback } from '../hooks/useFeedback';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  AcademicCapIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

export const OutcomeTracker = ({ studentId }) => {
  const { fetchOutcomes, loading, error } = useFeedback();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (studentId) {
      fetchOutcomes(studentId).then(setData);
    }
  }, [studentId, fetchOutcomes]);

  if (loading) {
    return (
      <div className="card text-center py-12">
        <ArrowPathIcon className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
        <p className="text-text-muted">Loading your progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  if (!data || data.total_outcomes === 0) {
    return (
      <div className="card text-center py-12">
        <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-text-muted" />
        <h3 className="text-xl font-bold mb-2">No Progress Data Yet</h3>
        <p className="text-text-muted">Complete sessions and submit feedback to track your learning progress.</p>
      </div>
    );
  }

  const { outcomes_by_subject, subject_progress } = data;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <ChartBarIcon className="w-7 h-7 text-primary-light" />
        <h2 className="text-2xl font-bold">Learning Progress</h2>
      </div>
      
      {/* Subject Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Object.entries(subject_progress || {}).map(([subject, stats]) => (
          <div key={subject} className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <AcademicCapIcon className="w-5 h-5 text-primary-light" />
              <h4 className="text-lg font-semibold">{subject}</h4>
            </div>
            <div className="flex justify-between mb-4">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl font-bold">{stats.sessions}</span>
                <span className="text-xs text-text-muted uppercase">Sessions</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl font-bold text-success">+{(stats.avg_improvement * 100).toFixed(0)}%</span>
                <span className="text-xs text-text-muted uppercase">Improvement</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl font-bold text-primary-light">{stats.latest_level}/10</span>
                <span className="text-xs text-text-muted uppercase">Level</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${stats.latest_level * 10}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Outcomes */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Session History</h3>
        {Object.entries(outcomes_by_subject || {}).map(([subject, outcomes]) => (
          <div key={subject} className="mb-6 last:mb-0">
            <h4 className="text-base text-text-secondary mb-3 pb-2 border-b border-gray-700">{subject}</h4>
            <div className="flex flex-col gap-2">
              {outcomes.slice(0, 5).map((outcome, idx) => (
                <div key={outcome.id || idx} className="flex justify-between items-center p-3 bg-bg-elevated rounded-lg">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium capitalize">{outcome.indicator.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-1 text-sm text-text-muted">
                      <UserCircleIcon className="w-4 h-4" />
                      <span>{outcome.tutor_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-card text-text-muted text-sm font-semibold">
                      {outcome.before_level}
                    </span>
                    <ArrowTrendingUpIcon className="w-4 h-4 text-text-muted" />
                    <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/20 text-primary-light text-sm font-semibold">
                      {outcome.after_level}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm font-semibold
                      ${outcome.after_level > outcome.before_level ? 'bg-success/15 text-success' : 'bg-gray-500/15 text-text-muted'}`}>
                      {outcome.after_level > outcome.before_level ? '+' : ''}{outcome.after_level - outcome.before_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutcomeTracker;
