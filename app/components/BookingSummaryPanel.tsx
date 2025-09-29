'use client';

interface BookingSummaryPanelProps {
  isVisible: boolean;
  selectedCourt: string | null;
  selectedTime: string | null;
  selectedDate: Date;
  onConfirm: () => void;
  onClose: () => void;
}

export default function BookingSummaryPanel({
  isVisible,
  selectedCourt,
  selectedTime,
  selectedDate,
  onConfirm,
  onClose
}: BookingSummaryPanelProps) {
  if (!isVisible || !selectedCourt || !selectedTime) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 transform transition-transform duration-300 ease-in-out ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Selection Summary */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-100 mb-1">Your Selection</h3>
            <p className="text-gray-300">
              {selectedCourt} on {formatDate(selectedDate)} at {selectedTime}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="bg-lime-500 text-black font-bold py-2 px-6 rounded-lg hover:bg-lime-400 transition-all duration-300 transform hover:scale-105"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
