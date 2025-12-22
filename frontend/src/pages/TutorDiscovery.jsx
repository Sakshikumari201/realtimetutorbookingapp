// Tutor discovery page with Heroicons
import React, { useState } from 'react';
import { useTutorSearch, useAllTutors } from '../hooks/useTutorSearch';
import TutorCard from '../components/TutorCard';
import BookingModal from '../components/BookingModal';
import { 
  MagnifyingGlassIcon, 
  AcademicCapIcon,
  CurrencyRupeeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const SUBJECTS = ['Math', 'Physics', 'Chemistry', 'Biology', 'Science', 'English', 'History', 'Computer Science'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const TutorDiscovery = () => {
  const [searchParams, setSearchParams] = useState({
    subject: '',
    student_level: 'Intermediate',
    budget_per_hour: 1000,
  });
  
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const student = { id: 1, name: 'Alex Student' };

  const { tutors, loading, error, totalFound } = useTutorSearch(
    searchParams.subject ? searchParams : null
  );
  
  const { tutors: allTutors, loading: loadingAll } = useAllTutors();

  const displayTutors = searchParams.subject ? tutors : allTutors;
  const isLoading = searchParams.subject ? loading : loadingAll;

  const handleSearch = (field, value) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const handleBookClick = (tutor) => {
    setSelectedTutor(tutor);
    setShowModal(true);
  };

  const handleBookingSuccess = () => {
    setShowModal(false);
    setSelectedTutor(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center justify-center gap-3">
          <SparklesIcon className="w-10 h-10 text-primary-light" />
          Find Your Perfect Tutor
        </h1>
        <p className="text-lg text-text-muted mt-2">Discover expert tutors tailored to your learning needs</p>
      </header>

      {/* Search Filters */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="form-label flex items-center gap-2">
              <AcademicCapIcon className="w-4 h-4" />
              Subject
            </label>
            <select
              className="form-select"
              value={searchParams.subject}
              onChange={(e) => handleSearch('subject', e.target.value)}
            >
              <option value="">All Subjects</option>
              {SUBJECTS.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label flex items-center gap-2">
              <MagnifyingGlassIcon className="w-4 h-4" />
              Your Level
            </label>
            <select
              className="form-select"
              value={searchParams.student_level}
              onChange={(e) => handleSearch('student_level', e.target.value)}
            >
              {LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label flex items-center gap-2">
              <CurrencyRupeeIcon className="w-4 h-4" />
              Max Budget: ₹{searchParams.budget_per_hour}/hr
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={searchParams.budget_per_hour}
              onChange={(e) => handleSearch('budget_per_hour', parseInt(e.target.value))}
            />
          </div>
        </div>

        {searchParams.subject && (
          <div className="mt-4 pt-4 border-t border-gray-700 text-text-secondary">
            Searching for <strong className="text-text-primary">{searchParams.subject}</strong> tutors 
            up to <strong className="text-text-primary">₹{searchParams.budget_per_hour}/hr</strong>
            {totalFound > 0 && <span className="badge badge-success ml-2">{totalFound} found</span>}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-error/10 border border-error rounded-xl p-4 mb-6">
          <p className="text-error">{error}</p>
        </div>
      )}

      {/* Results */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-6">
          {searchParams.subject ? `${searchParams.subject} Tutors` : 'Featured Tutors'}
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-8 animate-pulse">
                <div className="w-20 h-20 rounded-full bg-bg-elevated mx-auto mb-4"></div>
                <div className="h-6 bg-bg-elevated rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-bg-elevated rounded w-1/2 mx-auto mb-4"></div>
                <div className="h-10 bg-bg-elevated rounded"></div>
              </div>
            ))}
          </div>
        ) : displayTutors.length === 0 ? (
          <div className="card text-center py-12">
            <MagnifyingGlassIcon className="w-16 h-16 mx-auto mb-4 text-text-muted" />
            <h3 className="text-xl font-bold mb-2">No Tutors Found</h3>
            <p className="text-text-muted">
              {searchParams.subject 
                ? 'Try adjusting your filters or increasing your budget'
                : 'No tutors available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTutors.map(tutor => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                onBookClick={handleBookClick}
              />
            ))}
          </div>
        )}
      </section>

      {/* Booking Modal */}
      {showModal && selectedTutor && (
        <BookingModal
          tutor={selectedTutor}
          student={student}
          onClose={() => setShowModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default TutorDiscovery;
