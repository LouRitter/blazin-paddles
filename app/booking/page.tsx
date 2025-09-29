'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';

interface TimeSlot {
  time: string;
  reserved: boolean;
}

interface DayData {
  day: string;
  date: number;
  timeSlots: TimeSlot[];
}

export default function BookingPage() {
  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday is index 1
  const [showModal, setShowModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{day: string, time: string} | null>(null);
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);

  // Generate time slots from 8 AM to 8 PM
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 8; hour <= 20; hour++) {
      const timeString = hour <= 12 ? 
        `${hour === 12 ? 12 : hour} ${hour < 12 ? 'AM' : 'PM'}` :
        `${hour - 12} PM`;
      slots.push({
        time: timeString,
        reserved: Math.random() < 0.3 // 30% chance of being reserved
      });
    }
    return slots;
  };

  // Generate current week dates
  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay); // Start from Sunday
    
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    setCurrentWeek(week);
  }, []);

  // Generate week data
  const generateWeekData = (): DayData[] => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return currentWeek.map((date, index) => ({
      day: days[index],
      date: date.getDate(),
      timeSlots: generateTimeSlots()
    }));
  };

  const weekData = generateWeekData();

  const handleTimeSlotClick = (day: string, time: string, reserved: boolean) => {
    if (!reserved) {
      setSelectedTimeSlot({ day, time });
      setShowModal(true);
    }
  };

  const handleConfirmBooking = () => {
    // Here you would typically send the booking to a backend
    console.log('Booking confirmed:', selectedTimeSlot);
    setShowModal(false);
    setSelectedTimeSlot(null);
  };

  const handleCancelBooking = () => {
    setShowModal(false);
    setSelectedTimeSlot(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-gray-100 pt-20">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Title */}
        <h2 className="text-2xl sm:text-4xl font-bold text-center mb-6 sm:mb-8">Court / Bay Availability</h2>

        {/* Filter System */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold mb-3">Filter System</h3>
          <div className="border border-gray-700 rounded-lg p-3 sm:p-4 bg-gray-900">
            <input
              type="text"
              placeholder="Search for Court or Bay, Search for Week of the Year"
              className="w-full bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 rounded px-3 py-2 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Calendar Container */}
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-3 sm:p-6">
          {/* Calendar Grid */}
          <div className="grid grid-cols-8 gap-0 border border-gray-700 rounded-lg overflow-hidden overflow-x-auto">
            {/* Time Column Header */}
            <div className="bg-gray-800 border-r border-gray-700 p-2 sm:p-4 min-w-[60px] sm:min-w-[80px]">
              <div className="text-xs sm:text-sm font-semibold text-gray-300">Time</div>
            </div>

            {/* Day Headers */}
            {weekData.map((day, dayIndex) => (
              <div key={dayIndex} className="bg-gray-800 border-r border-gray-700 p-2 sm:p-4 text-center min-w-[60px] sm:min-w-[80px]">
                <div className="text-xs sm:text-sm font-semibold text-gray-300 mb-1">{day.day}</div>
                <div 
                  className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                    selectedDay === dayIndex 
                      ? 'bg-lime-500 text-black' 
                      : 'text-gray-100 hover:bg-gray-700 cursor-pointer transition-colors'
                  }`}
                  onClick={() => setSelectedDay(dayIndex)}
                >
                  {day.date}
                </div>
              </div>
            ))}

            {/* Time Slots */}
            {Array.from({ length: 13 }, (_, timeIndex) => (
              <React.Fragment key={timeIndex}>
                {/* Time Label */}
                <div className="bg-gray-900 border-r border-gray-700 border-t border-gray-700 p-2 sm:p-3 text-xs sm:text-sm text-gray-300 min-w-[60px] sm:min-w-[80px]">
                  {timeIndex === 0 ? '8 AM' : 
                   timeIndex === 4 ? '12 PM' : 
                   timeIndex === 8 ? '4 PM' : 
                   timeIndex === 12 ? '8 PM' : ''}
                </div>

                {/* Day Columns */}
                {weekData.map((day, dayIndex) => {
                  const timeSlot = day.timeSlots[timeIndex];
                  return (
                    <div
                      key={`${dayIndex}-${timeIndex}`}
                      className={`border-r border-gray-700 border-t border-gray-700 p-2 sm:p-3 min-h-[40px] sm:min-h-[60px] flex items-center justify-center min-w-[60px] sm:min-w-[80px] ${
                        timeSlot?.reserved
                          ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                          : 'bg-black hover:border-lime-500 hover:bg-gray-900 cursor-pointer transition-all duration-200'
                      }`}
                      onClick={() => handleTimeSlotClick(day.day, timeSlot?.time || '', timeSlot?.reserved || false)}
                    >
                      {timeSlot?.reserved && (
                        <span className="text-xs text-center leading-tight">All Courts Reserved</span>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Instruction Text */}
          <p className="text-center text-gray-400 mt-4 sm:mt-6 text-sm sm:text-base">
            Click on any portion of the calendar to open the booking page.
          </p>
        </div>
      </main>

      {/* Booking Modal */}
      {showModal && selectedTimeSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-t-4 border-lime-500 rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-lg sm:text-xl font-bold text-gray-100 mb-4">Confirm Your Booking</h3>
            <p className="text-gray-300 mb-6 text-sm sm:text-base">
              {selectedTimeSlot.day}, {selectedTimeSlot.time}
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleConfirmBooking}
                className="flex-1 bg-lime-500 text-black font-semibold py-2 px-4 rounded-lg hover:bg-lime-400 transition-colors text-sm sm:text-base"
              >
                Confirm
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 border border-gray-600 text-gray-300 font-semibold py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
