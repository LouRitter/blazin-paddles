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
  checkSlotAvailability,
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
      
      console.log('Generated time slots:', timeSlots);
      console.log('Court availability:', courtAvailability);
      
      const courtsData: Court[] = courtAvailability.map(court => {
        const courtTimeSlots = timeSlots.map(slot => {
          const isBooked = isSlotBooked(slot.isoString, court.bookedSlots);
          console.log(`Court ${court.name}, Slot ${slot.time}: ${slot.isoString} -> Booked: ${isBooked}`);
          return {
            time: slot.time,
            available: true,
            booked: isBooked,
            isoString: slot.isoString
          };
        });
        
        return {
          id: court.id,
          name: court.name,
          timeSlots: courtTimeSlots
        };
      });
      
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

  // Set up real-time subscription for court availability updates
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for bookings...');
    
    const subscription = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Real-time booking update received:', payload);
          // Reload court data when any booking changes
          loadCourtData();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription...');
      subscription.unsubscribe();
    };
  }, [user]);

  // Set up periodic refresh as fallback (every 30 seconds)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      console.log('Periodic refresh of court data...');
      loadCourtData();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setShowSummary(false);
    setBookingSuccess(false);
    setError(null); // Clear any previous errors
  };

  const handleSlotSelect = async (courtName: string, time: string) => {
    const slotKey = `${courtName}-${time}`;
    
    if (selectedSlot === slotKey) {
      // Deselect if clicking the same slot
      setSelectedSlot(null);
      setShowSummary(false);
      return;
    }

    // Find the court and time slot
    const court = courts.find(c => c.name === courtName);
    if (!court) {
      console.error('Court not found:', courtName);
      return;
    }

    const timeSlot = court.timeSlots.find(slot => slot.time === time);
    if (!timeSlot) {
      console.error('Time slot not found:', time);
      return;
    }

    // Check if slot is already booked
    if (timeSlot.booked) {
      console.log('Slot is already booked, cannot select');
      setError('This time slot is no longer available. Please refresh and try again.');
      return;
    }

    // Double-check availability with the backend before showing summary
    try {
      const startTime = new Date(timeSlot.isoString);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      
      const { available } = await checkSlotAvailability(
        supabase,
        court.id,
        startTime.toISOString(),
        endTime.toISOString()
      );

      if (!available) {
        console.log('Slot is no longer available on backend');
        setError('This time slot was just booked by another user. Please refresh and try again.');
        // Refresh the court data to get the latest state
        await loadCourtData();
        return;
      }

      // Slot is available, proceed with selection
      setSelectedSlot(slotKey);
      setShowSummary(true);
      setError(null); // Clear any previous errors
      
    } catch (err) {
      console.error('Error checking slot availability:', err);
      setError('Unable to verify slot availability. Please try again.');
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
      
      // Force reload court data to reflect the new booking and prevent double bookings
      console.log('Booking successful, reloading court data...');
      // Small delay to ensure database has been updated
      setTimeout(async () => {
        await loadCourtData();
      }, 500);
      
      // Hide success message after 3 seconds
      setTimeout(() => setBookingSuccess(false), 3000);
      
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      
      // Reload court data to get the latest availability
      await loadCourtData();
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
          <div className="flex justify-between items-center mb-6">
            <DateSelector 
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
            <button
              onClick={loadCourtData}
              disabled={isLoading}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <svg 
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>

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
