'use client';

interface TimeSlot {
  time: string;
  available: boolean;
  booked: boolean;
  isoString?: string;
}

interface CourtCardProps {
  courtName: string;
  timeSlots: TimeSlot[];
  selectedSlot: string | null;
  onSlotSelect: (courtName: string, time: string) => void;
}

export default function CourtCard({ courtName, timeSlots, selectedSlot, onSlotSelect }: CourtCardProps) {
  const isSlotSelected = (time: string) => {
    return selectedSlot === `${courtName}-${time}`;
  };

  const isSlotBooked = (slot: TimeSlot) => {
    return slot.booked;
  };

  const isSlotAvailable = (slot: TimeSlot) => {
    return slot.available && !slot.booked;
  };

  return (
    <div className="flex-shrink-0 w-80 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
      {/* Court Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-gray-100">{courtName}</h3>
        </div>
      </div>

      {/* Time Slots */}
      <div className="p-4 space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {timeSlots.map((slot, index) => (
          <button
            key={index}
            onClick={() => {
              if (isSlotAvailable(slot)) {
                onSlotSelect(courtName, slot.time);
              }
            }}
            disabled={!isSlotAvailable(slot)}
            className={`w-full p-3 rounded-lg text-left transition-all duration-200 transform ${
              isSlotSelected(slot.time)
                ? 'bg-lime-500 text-black font-semibold scale-105 shadow-lg shadow-lime-500/20'
                : isSlotBooked(slot)
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
                : 'bg-gray-800 text-gray-100 hover:border-lime-500 hover:bg-gray-700 hover:scale-102 border border-transparent cursor-pointer'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{slot.time}</span>
              {isSlotBooked(slot) && (
                <span className="text-xs text-gray-500">Booked</span>
              )}
              {isSlotSelected(slot.time) && (
                <span className="text-xs font-semibold">Selected</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
