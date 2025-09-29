'use client';

import { useState } from 'react';

interface SessionCardProps {
  booking: {
    id: string;
    courtName: string;
    startTime: string;
    endTime: string;
    date: string;
    time: string;
    duration: string;
    createdAt: string;
  };
  onCancel: (bookingId: string) => void;
  isCanceling?: boolean;
}

export default function SessionCard({ booking, onCancel, isCanceling = false }: SessionCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancelClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmCancel = () => {
    onCancel(booking.id);
    setShowConfirm(false);
  };

  const handleCancelCancel = () => {
    setShowConfirm(false);
  };

  const isUpcoming = new Date(booking.startTime) > new Date();
  const isToday = new Date(booking.startTime).toDateString() === new Date().toDateString();

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg p-6 transition-all duration-200 hover:border-lime-500/50 ${
      isUpcoming ? 'opacity-100' : 'opacity-75'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            isUpcoming ? 'bg-lime-500' : 'bg-gray-500'
          }`}></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">{booking.courtName}</h3>
            <p className="text-sm text-gray-400">
              {isToday ? 'Today' : isUpcoming ? 'Upcoming' : 'Past Session'}
            </p>
          </div>
        </div>
        
        {isUpcoming && (
          <button
            onClick={handleCancelClick}
            disabled={isCanceling}
            className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isCanceling ? 'Canceling...' : 'Cancel'}
          </button>
        )}
      </div>

      {/* Session Details */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-300">{booking.date}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-300">{booking.time}</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">{booking.duration}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-gray-300">Court Booking</span>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm mb-3">
            Are you sure you want to cancel this booking? This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleConfirmCancel}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Yes, Cancel
            </button>
            <button
              onClick={handleCancelCancel}
              className="bg-gray-600 text-gray-200 px-3 py-1 rounded text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Keep Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
