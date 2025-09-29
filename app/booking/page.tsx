'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import DateSelector from '../components/DateSelector';
import CourtTimelineArea from '../components/CourtTimelineArea';
import BookingSummaryPanel from '../components/BookingSummaryPanel';

interface TimeSlot {
  time: string;
  available: boolean;
  booked: boolean;
}

interface Court {
  name: string;
  timeSlots: TimeSlot[];
}

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [courts, setCourts] = useState<Court[]>([]);

  // Generate time slots from 8 AM to 8 PM
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 8; hour <= 20; hour++) {
      const timeString = hour <= 12 ? 
        `${hour === 12 ? 12 : hour} ${hour < 12 ? 'AM' : 'PM'}` :
        `${hour - 12} PM`;
      slots.push({
        time: timeString,
        available: true,
        booked: Math.random() < 0.3 // 30% chance of being booked
      });
    }
    return slots;
  };

  // Generate courts data
  const generateCourts = (): Court[] => {
    const courtNames = ['Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'Court 6'];
    return courtNames.map(name => ({
      name,
      timeSlots: generateTimeSlots()
    }));
  };

  // Initialize courts data
  useEffect(() => {
    setCourts(generateCourts());
  }, []);

  // Update courts when date changes
  useEffect(() => {
    setCourts(generateCourts());
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setShowSummary(false);
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

  const handleConfirmBooking = () => {
    if (selectedSlot) {
      const [courtName, time] = selectedSlot.split('-');
      console.log(`Booking confirmed for ${courtName} at ${time} on ${selectedDate.toDateString()}`);
      
      // Reset selection
      setSelectedSlot(null);
      setShowSummary(false);
      
      // Here you would typically send the booking to a backend
      // For now, we'll just show a success message
      alert(`Booking confirmed for ${courtName} at ${time}!`);
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

          {/* Date Selector */}
          <DateSelector 
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />

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
