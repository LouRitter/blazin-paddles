'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import DateSelector from '../components/DateSelector';
import CourtTimelineArea from '../components/CourtTimelineArea';
import BookingSummaryPanel from '../components/BookingSummaryPanel';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { 
  fetchCourtAvailability, 
  createBooking, 
  generateTimeSlots, 
  isSlotBooked,
  type CourtAvailability,
  type BookingDetails 
} from '../../lib/bookingUtils';

interface TimeSlot {
  time: string;
  available: boolean;
  booked: boolean;
  isoString: string;
}

interface Court {
  id: string;
  name: string;
  timeSlots: TimeSlot[];
}

export default function BookingPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Load court availability data
  const loadCourtData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const courtAvailability = await fetchCourtAvailability(supabase, selectedDate);
      const timeSlots = generateTimeSlots(selectedDate);
      
      const courtsData: Court[] = courtAvailability.map(court => ({
        id: court.id,
        name: court.name,
        timeSlots: timeSlots.map(slot => ({
          time: slot.time,
          available: true,
          booked: isSlotBooked(slot.isoString, court.bookedSlots),
          isoString: slot.isoString
        }))
      }));
      
      setCourts(courtsData);
    } catch (err) {
      console.error('Error loading court data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load court availability');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when date changes or component mounts
  useEffect(() => {
    loadCourtData();
  }, [selectedDate, user]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setShowSummary(false);
    setBookingSuccess(false);
  };

  const handleSlotSelect = (courtName: string, time: string) => {
    const slotKey = `${courtName}-${time}`;
    
    if (selectedSlot === slotKey) {
      // Deselect if clicking the same slot
      setSelectedSlot(null);
      setShowSummary(false);
    } else {
      // Select new slot
      setSelectedSlot(slotKey);
      setShowSummary(true);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !user) return;
    
    try {
      const [courtName, time] = selectedSlot.split('-');
      const court = courts.find(c => c.name === courtName);
      
      if (!court) {
        throw new Error('Court not found');
      }
      
      // Find the selected time slot to get the ISO string
      const selectedTimeSlot = court.timeSlots.find(slot => slot.time === time);
      if (!selectedTimeSlot) {
        throw new Error('Time slot not found');
      }
      
      // Calculate end time (1 hour duration)
      const startTime = new Date(selectedTimeSlot.isoString);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour
      
      const bookingDetails: BookingDetails = {
        userId: user.id,
        courtId: court.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      };
      
      const { data, error } = await createBooking(supabase, bookingDetails);
      
      if (error) {
        throw error;
      }
      
      // Reset selection and show success
      setSelectedSlot(null);
      setShowSummary(false);
      setBookingSuccess(true);
      
      // Reload court data to reflect the new booking
      await loadCourtData();
      
      // Hide success message after 3 seconds
      setTimeout(() => setBookingSuccess(false), 3000);
      
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    }
  };

  const handleCloseSummary = () => {
    setSelectedSlot(null);
    setShowSummary(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-gray-100 pt-20">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Title */}
          <h2 className="text-2xl sm:text-4xl font-bold text-center mb-6 sm:mb-8">
            Book Your Court
          </h2>

          {/* Success Message */}
          {bookingSuccess && (
            <div className="mb-6 bg-green-900/50 border border-green-500 text-green-300 px-4 py-3 rounded-lg text-center">
              ✅ Booking confirmed successfully! Your court is reserved.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center">
              ❌ {error}
            </div>
          )}

          {/* Date Selector */}
          <DateSelector 
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />

          {/* Loading State */}
          {isLoading ? (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading court availability...</p>
            </div>
          ) : (
            <>
              {/* Court Timeline Area */}
              <CourtTimelineArea
                courts={courts}
                selectedSlot={selectedSlot}
                onSlotSelect={handleSlotSelect}
              />

              {/* Instructions */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm sm:text-base">
                  Select a date above, then choose your preferred court and time slot below.
                </p>
              </div>
            </>
          )}
        </main>

        {/* Booking Summary Panel */}
        <BookingSummaryPanel
          isVisible={showSummary}
          selectedCourt={selectedSlot ? selectedSlot.split('-')[0] : null}
          selectedTime={selectedSlot ? selectedSlot.split('-')[1] : null}
          selectedDate={selectedDate}
          onConfirm={handleConfirmBooking}
          onClose={handleCloseSummary}
        />
      </div>
    </ProtectedRoute>
  );
}
