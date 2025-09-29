'use client';

import { useState, useEffect } from 'react';

interface DateSelectorProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function DateSelector({ selectedDate, onDateSelect }: DateSelectorProps) {
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  useEffect(() => {
    // Generate 7 days starting from the selected date's week
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day); // Start from Sunday
    
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    setWeekDates(dates);
  }, [selectedDate]);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  };

  const formatDate = (date: Date) => {
    return date.getDate().toString();
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">Select a Date</h3>
      <div className="flex space-x-3 overflow-x-auto pb-2">
        {weekDates.map((date, index) => (
          <button
            key={index}
            onClick={() => onDateSelect(date)}
            className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg transition-all duration-200 min-w-[60px] ${
              isSelected(date)
                ? 'bg-lime-500 text-black'
                : 'bg-gray-800 text-gray-100 hover:bg-gray-700'
            }`}
          >
            <span className="text-xs font-medium mb-1">{formatDay(date)}</span>
            <div className="relative">
              <span className="text-lg font-bold">{formatDate(date)}</span>
              {isToday(date) && !isSelected(date) && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-lime-500 rounded-full"></div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
