// Booking modal with Heroicons
import React, { useState, useEffect } from 'react';
import { useBooking } from '../hooks/useBooking';
import { 
  XMarkIcon, 
  ClockIcon, 
  AcademicCapIcon, 
  CurrencyRupeeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { CalendarDaysIcon, UserIcon } from '@heroicons/react/24/solid';

export const BookingModal = ({ tutor, student, onClose, onSuccess }) => {
  const { booking, loading, error, createBooking, pollBookingStatus, resetBooking } = useBooking();
  const [selectedSlot, setSelectedSlot] = useState(null);

  const slots = tutor?.available_slots || [];

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    const slotTime = selectedSlot.slot || selectedSlot;
    const result = await createBooking(
      student?.id || 1,
      tutor.id,
      slotTime,
      60,
      tutor.subjects?.[0] || 'General'
    );

    if (result?.booking_id) {
      pollBookingStatus(result.booking_id);
    }
  };

  useEffect(() => {
    if (booking?.status === 'accepted') {
      setTimeout(() => onSuccess?.(), 1500);
    }
  }, [booking?.status, onSuccess]);

  const handleClose = () => {
    resetBooking();
    onClose?.();
  };

  const formatSlotTime = (slot) => {
    const date = new Date(slot.slot || slot);
    return date.toLocaleString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-4 p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all" onClick={handleClose}>
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Initial State: Slot Selection */}
        {!booking && (
          <>
            <div className="text-center mb-6">
              <img 
                src={tutor.profile_pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.name}`}
                alt={tutor.name}
                className="w-16 h-16 rounded-full border-2 border-primary mx-auto mb-4"
              />
              <h2 className="text-xl font-bold">Book with {tutor.name}</h2>
              <p className="text-text-muted text-sm">Select a time slot for your session</p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {slots.length === 0 ? (
                <p className="col-span-3 text-center text-text-muted">No available slots</p>
              ) : (
                slots.slice(0, 9).map((slot, idx) => (
                  <button
                    key={slot.id || idx}
                    className={`p-3 text-xs rounded-lg border transition-all
                      ${selectedSlot === slot 
                        ? 'bg-gradient-to-r from-primary to-accent border-transparent text-white' 
                        : 'bg-bg-elevated border-gray-700 text-text-secondary hover:border-primary hover:text-text-primary'}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {formatSlotTime(slot)}
                  </button>
                ))
              )}
            </div>

            <div className="bg-bg-elevated rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 py-2 border-b border-gray-700">
                <AcademicCapIcon className="w-5 h-5 text-primary-light" />
                <span className="text-text-secondary flex-1">Subject</span>
                <span className="font-semibold">{tutor.subjects?.[0] || 'General'}</span>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-gray-700">
                <ClockIcon className="w-5 h-5 text-primary-light" />
                <span className="text-text-secondary flex-1">Duration</span>
                <span className="font-semibold">60 minutes</span>
              </div>
              <div className="flex items-center gap-3 py-2">
                <CurrencyRupeeIcon className="w-5 h-5 text-success" />
                <span className="text-text-secondary flex-1">Rate</span>
                <span className="font-semibold text-success">₹{tutor.hourly_rate}</span>
              </div>
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={handleConfirmBooking}
              disabled={!selectedSlot || loading}
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Confirming...
                </>
              ) : 'Confirm Booking'}
            </button>
          </>
        )}

        {/* Waiting State */}
        {booking?.status === 'requested' && (
          <div className="text-center py-6">
            <ArrowPathIcon className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
            <h2 className="text-xl font-bold mb-2">Waiting for Response</h2>
            <p className="text-text-muted mb-6">
              Your booking request has been sent to {tutor.name}.<br/>
              They will respond shortly.
            </p>
          </div>
        )}

        {/* Accepted State */}
        {booking?.status === 'accepted' && (
          <div className="text-center py-6">
            <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-success" />
            <h2 className="text-xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-text-muted mb-6">Your session has been scheduled.</p>
            <div className="bg-bg-elevated rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-3 py-2">
                <UserIcon className="w-5 h-5 text-primary-light" />
                <span>{booking.tutor_name || tutor.name}</span>
              </div>
              <div className="flex items-center gap-3 py-2">
                <CalendarDaysIcon className="w-5 h-5 text-primary-light" />
                <span>{new Date(booking.time_slot).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3 py-2">
                <AcademicCapIcon className="w-5 h-5 text-primary-light" />
                <span>{booking.subject}</span>
              </div>
            </div>
            <button className="btn btn-primary w-full" onClick={handleClose}>Done</button>
          </div>
        )}

        {/* Rejected State */}
        {booking?.status === 'rejected' && (
          <div className="text-center py-6">
            <XCircleIcon className="w-16 h-16 mx-auto mb-4 text-error" />
            <h2 className="text-xl font-bold mb-2">Booking Declined</h2>
            <p className="text-text-muted mb-6">
              Unfortunately, the tutor couldn't accept this booking.<br/>
              Please try a different time slot or tutor.
            </p>
            <button className="btn btn-secondary w-full" onClick={handleClose}>Back to Search</button>
          </div>
        )}

        {error && (
          <div className="mt-4">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
