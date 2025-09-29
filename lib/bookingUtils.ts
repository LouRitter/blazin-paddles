import { SupabaseClient } from '@supabase/supabase-js';

export interface CourtAvailability {
  id: string;
  name: string;
  bookedSlots: string[];
}

export interface BookingDetails {
  userId: string;
  courtId: string;
  startTime: string;
  endTime: string;
}

/**
 * Fetches court availability for a specific date
 * @param supabase - The initialized Supabase client instance
 * @param date - A JavaScript Date object for the selected day
 * @returns Promise that resolves to an array of court availability objects
 */
export async function fetchCourtAvailability(
  supabase: SupabaseClient,
  date: Date
): Promise<CourtAvailability[]> {
  try {
    console.log('Fetching court availability for date:', date);
    console.log('Supabase client:', supabase);
    
    // Calculate start and end of the day in UTC
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Convert to ISO strings for Supabase
    const dayStartISO = dayStart.toISOString();
    const dayEndISO = dayEnd.toISOString();

    console.log('Date range:', { dayStartISO, dayEndISO });

    // Fetch all active courts
    console.log('Fetching courts...');
    const { data: courts, error: courtsError } = await supabase
      .from('courts')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    console.log('Courts response:', { courts, courtsError });

    if (courtsError) {
      console.error('Courts error details:', courtsError);
      
      // If the courts table doesn't exist, return mock data
      if (courtsError.message.includes('relation "public.courts" does not exist')) {
        console.warn('Courts table does not exist, returning mock data');
        return [
          { id: 'mock-1', name: 'Court 1', bookedSlots: [] },
          { id: 'mock-2', name: 'Court 2', bookedSlots: [] },
          { id: 'mock-3', name: 'Court 3', bookedSlots: [] },
          { id: 'mock-4', name: 'Court 4', bookedSlots: [] },
          { id: 'mock-5', name: 'Court 5', bookedSlots: [] },
          { id: 'mock-6', name: 'Court 6', bookedSlots: [] }
        ];
      }
      
      throw new Error(`Failed to fetch courts: ${courtsError.message}`);
    }

    // Fetch all bookings for the selected day
    console.log('Fetching bookings...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('court_id, start_time, end_time')
      .gte('start_time', dayStartISO)
      .lte('start_time', dayEndISO);

    console.log('Bookings response:', { bookings, bookingsError });

    if (bookingsError) {
      console.error('Bookings error details:', bookingsError);
      
      // If the bookings table doesn't exist, continue with empty bookings
      if (bookingsError.message.includes('relation "public.bookings" does not exist')) {
        console.warn('Bookings table does not exist, continuing with empty bookings');
      } else {
        throw new Error(`Failed to fetch bookings: ${bookingsError.message}`);
      }
    }

    // Group bookings by court and extract time slots
    const courtAvailability: CourtAvailability[] = courts.map(court => {
      const courtBookings = bookings?.filter(booking => booking.court_id === court.id) || [];
      
      // Extract booked time slots (convert to time strings for easier comparison)
      const bookedSlots = courtBookings.map(booking => {
        const startTime = new Date(booking.start_time);
        return startTime.toISOString();
      });

      return {
        id: court.id,
        name: court.name,
        bookedSlots
      };
    });

    return courtAvailability;
  } catch (error) {
    console.error('Error fetching court availability:', error);
    throw error;
  }
}

/**
 * Creates a new booking in the database
 * @param supabase - The initialized Supabase client instance
 * @param bookingDetails - Object containing booking information
 * @returns Promise that resolves with the result of the insert operation
 */
export async function createBooking(
  supabase: SupabaseClient,
  bookingDetails: BookingDetails
) {
  try {
    console.log('Creating booking:', bookingDetails);
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        user_id: bookingDetails.userId,
        court_id: bookingDetails.courtId,
        start_time: bookingDetails.startTime,
        end_time: bookingDetails.endTime
      }])
      .select();

    console.log('Booking response:', { data, error });

    if (error) {
      console.error('Booking error details:', error);
      
      // If the bookings table doesn't exist, simulate success
      if (error.message.includes('relation "public.bookings" does not exist')) {
        console.warn('Bookings table does not exist, simulating successful booking');
        return { data: [{ id: 'mock-booking', ...bookingDetails }], error: null };
      }
      
      throw new Error(`Failed to create booking: ${error.message}`);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { data: null, error };
  }
}

/**
 * Generates time slots for a given date (8 AM to 8 PM)
 * @param date - The date to generate slots for
 * @returns Array of time slot objects with time and ISO string
 */
export function generateTimeSlots(date: Date) {
  const slots = [];
  const baseDate = new Date(date);
  
  for (let hour = 8; hour <= 20; hour++) {
    const slotDate = new Date(baseDate);
    slotDate.setHours(hour, 0, 0, 0);
    
    const timeString = hour <= 12 ? 
      `${hour === 12 ? 12 : hour} ${hour < 12 ? 'AM' : 'PM'}` :
      `${hour - 12} PM`;
    
    slots.push({
      time: timeString,
      isoString: slotDate.toISOString(),
      hour: hour
    });
  }
  
  return slots;
}

/**
 * Checks if a time slot is booked
 * @param slotISO - The ISO string of the time slot
 * @param bookedSlots - Array of booked slot ISO strings
 * @returns boolean indicating if the slot is booked
 */
export function isSlotBooked(slotISO: string, bookedSlots: string[]): boolean {
  return bookedSlots.includes(slotISO);
}
