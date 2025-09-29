'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import SessionCard from '../components/SessionCard';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { fetchUserBookings, cancelBooking, type UserBooking } from '../../lib/bookingUtils';

export default function SessionsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load user bookings
  const loadBookings = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const userBookings = await fetchUserBookings(supabase, user.id);
      setBookings(userBookings);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load your sessions');
    } finally {
      setIsLoading(false);
    }
  };

  // Load bookings when component mounts or user changes
  useEffect(() => {
    loadBookings();
  }, [user]);

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string) => {
    if (!user) return;
    
    try {
      setCancelingId(bookingId);
      
      const { data, error } = await cancelBooking(supabase, bookingId, user.id);
      
      if (error) {
        throw error;
      }
      
      // Remove the booking from the list
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      setSuccessMessage('Booking cancelled successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      console.error('Error canceling booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setCancelingId(null);
    }
  };

  // Separate upcoming and past bookings
  const upcomingBookings = bookings.filter(booking => new Date(booking.startTime) > new Date());
  const pastBookings = bookings.filter(booking => new Date(booking.startTime) <= new Date());

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-gray-100 pt-20">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">My Sessions</h1>
          
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-900/50 border border-green-500 text-green-300 px-4 py-3 rounded-lg text-center">
              ✅ {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center">
              ❌ {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading your sessions...</p>
            </div>
          ) : bookings.length === 0 ? (
            /* Empty State */
            <div className="bg-gray-900 rounded-lg p-12 border border-gray-700 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">No Sessions Yet</h3>
              <p className="text-gray-400 mb-6">
                You haven't booked any court sessions yet. Book your first court to get started!
              </p>
              <a
                href="/booking"
                className="inline-flex items-center bg-lime-500 text-black font-bold py-3 px-6 rounded-lg hover:bg-lime-400 transition-all duration-300 transform hover:scale-105"
              >
                Book a Court
              </a>
            </div>
          ) : (
            /* Sessions Content */
            <div className="space-y-8">
              {/* Upcoming Sessions */}
              {upcomingBookings.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-lime-500 rounded-full mr-3"></div>
                    Upcoming Sessions ({upcomingBookings.length})
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingBookings.map((booking) => (
                      <SessionCard
                        key={booking.id}
                        booking={booking}
                        onCancel={handleCancelBooking}
                        isCanceling={cancelingId === booking.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Past Sessions */}
              {pastBookings.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                    Past Sessions ({pastBookings.length})
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pastBookings.map((booking) => (
                      <SessionCard
                        key={booking.id}
                        booking={booking}
                        onCancel={handleCancelBooking}
                        isCanceling={cancelingId === booking.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Need Another Court?</h3>
                <p className="text-gray-400 mb-4">
                  Book another session to keep your game sharp!
                </p>
                <a
                  href="/booking"
                  className="inline-flex items-center bg-lime-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-lime-400 transition-all duration-300 transform hover:scale-105"
                >
                  Book Another Court
                </a>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
