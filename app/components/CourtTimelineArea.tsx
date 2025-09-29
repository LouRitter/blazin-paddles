'use client';

import CourtCard from './CourtCard';

interface TimeSlot {
  time: string;
  available: boolean;
  booked: boolean;
}

interface Court {
  name: string;
  timeSlots: TimeSlot[];
}

interface CourtTimelineAreaProps {
  courts: Court[];
  selectedSlot: string | null;
  onSlotSelect: (courtName: string, time: string) => void;
}

export default function CourtTimelineArea({ courts, selectedSlot, onSlotSelect }: CourtTimelineAreaProps) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">Available Courts</h3>
      
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {courts.map((court, index) => (
          <CourtCard
            key={index}
            courtName={court.name}
            timeSlots={court.timeSlots}
            selectedSlot={selectedSlot}
            onSlotSelect={onSlotSelect}
          />
        ))}
      </div>
      
      {/* Scroll indicator for mobile */}
      <div className="md:hidden text-center mt-2">
        <p className="text-xs text-gray-500">← Swipe to see more courts →</p>
      </div>
    </div>
  );
}
