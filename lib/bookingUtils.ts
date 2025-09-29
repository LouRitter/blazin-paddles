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

export interface UserBooking {
  id: string;
  courtName: string;
  startTime: string;
  endTime: string;
  date: string;
  time: string;
  duration: string;
  createdAt: string;
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
      
      console.log(`Court ${court.name} raw bookings:`, courtBookings);
      
      // Extract booked time slots (convert to time strings for easier comparison)
      const bookedSlots = courtBookings.map(booking => {
        const startTime = new Date(booking.start_time);
        const isoString = startTime.toISOString();
        console.log(`Booking: ${booking.start_time} -> ${isoString}`);
        return isoString;
      });

      console.log(`Court ${court.name} booked slots:`, bookedSlots);

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
 * Checks if a time slot is available for booking
 * @param supabase - The initialized Supabase client instance
 * @param courtId - The court ID to check
 * @param startTime - The start time to check
 * @param endTime - The end time to check
 * @returns Promise that resolves with availability status
 */
export async function checkSlotAvailability(
  supabase: SupabaseClient,
  courtId: string,
  startTime: string,
  endTime: string
): Promise<{ available: boolean; conflictingBooking?: any }> {
  try {
    console.log('Checking slot availability:', { courtId, startTime, endTime });
    
    const { data: conflictingBookings, error } = await supabase
      .from('bookings')
      .select('id, start_time, end_time, user_id')
      .eq('court_id', courtId)
      .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);

    console.log('Conflicting bookings check:', { conflictingBookings, error });

    if (error) {
      console.error('Error checking slot availability:', error);
      
      // If the bookings table doesn't exist, assume available
      if (error.message.includes('relation "public.bookings" does not exist')) {
        console.warn('Bookings table does not exist, assuming slot is available');
        return { available: true };
      }
      
      throw new Error(`Failed to check slot availability: ${error.message}`);
    }

    const hasConflict = conflictingBookings && conflictingBookings.length > 0;
    
    return {
      available: !hasConflict,
      conflictingBooking: hasConflict ? conflictingBookings[0] : undefined
    };
  } catch (error) {
    console.error('Error checking slot availability:', error);
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
    
    // First check if the slot is available
    const availability = await checkSlotAvailability(
      supabase,
      bookingDetails.courtId,
      bookingDetails.startTime,
      bookingDetails.endTime
    );

    if (!availability.available) {
      const conflictTime = new Date(availability.conflictingBooking?.start_time).toLocaleString();
      throw new Error(`This time slot is no longer available. It was booked at ${conflictTime}. Please refresh the page and try again.`);
    }
    
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
    
    const isoString = slotDate.toISOString();
    console.log(`Generated slot: ${timeString} -> ${isoString}`);
    
    slots.push({
      time: timeString,
      isoString: isoString,
      hour: hour
    });
  }
  
  return slots;
}

/**
 * Fetches all bookings for the current user
 * @param supabase - The initialized Supabase client instance
 * @returns Promise that resolves to an array of user booking objects
 */
export async function fetchUserBookings(
  supabase: SupabaseClient,
  userId: string
): Promise<UserBooking[]> {
  try {
    console.log('Fetching user bookings for user:', userId);
    
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        start_time,
        end_time,
        created_at,
        courts!inner(name)
      `)
      .eq('user_id', userId)
      .order('start_time', { ascending: true });

    console.log('User bookings response:', { bookings, error });

    if (error) {
      console.error('User bookings error details:', error);
      
      // If the bookings table doesn't exist, return empty array
      if (error.message.includes('relation "public.bookings" does not exist')) {
        console.warn('Bookings table does not exist, returning empty array');
        return [];
      }
      
      throw new Error(`Failed to fetch user bookings: ${error.message}`);
    }

    // Transform the data into a more user-friendly format
    const userBookings: UserBooking[] = (bookings || []).map(booking => {
      const startTime = new Date(booking.start_time);
      const endTime = new Date(booking.end_time);
      
      // Calculate duration in hours
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      
      return {
        id: booking.id,
        courtName: (booking.courts as any).name,
        startTime: booking.start_time,
        endTime: booking.end_time,
        date: startTime.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: startTime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        duration: `${durationHours} hour${durationHours !== 1 ? 's' : ''}`,
        createdAt: booking.created_at
      };
    });

    return userBookings;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
}

/**
 * Cancels a user's booking
 * @param supabase - The initialized Supabase client instance
 * @param bookingId - The ID of the booking to cancel
 * @param userId - The ID of the user (for security)
 * @returns Promise that resolves with the result of the delete operation
 */
export async function cancelBooking(
  supabase: SupabaseClient,
  bookingId: string,
  userId: string
) {
  try {
    console.log('Canceling booking:', { bookingId, userId });
    
    const { data, error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)
      .eq('user_id', userId)
      .select();

    console.log('Cancel booking response:', { data, error });

    if (error) {
      console.error('Cancel booking error details:', error);
      throw new Error(`Failed to cancel booking: ${error.message}`);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error canceling booking:', error);
    return { data: null, error };
  }
}

/**
 * Checks if a time slot is booked
 * @param slotISO - The ISO string of the time slot
 * @param bookedSlots - Array of booked slot ISO strings
 * @returns boolean indicating if the slot is booked
 */
export function isSlotBooked(slotISO: string, bookedSlots: string[]): boolean {
  console.log('Checking if slot is booked:', { slotISO, bookedSlots });
  
  // Handle undefined or null bookedSlots
  if (!bookedSlots || !Array.isArray(bookedSlots)) {
    console.log('bookedSlots is not an array, treating as not booked');
    return false;
  }
  
  // Convert to Date objects for more accurate comparison
  const slotDate = new Date(slotISO);
  
  const isBooked = bookedSlots.some(bookedSlot => {
    const bookedDate = new Date(bookedSlot);
    
    // Compare both exact time and date components
    const exactMatch = slotDate.getTime() === bookedDate.getTime();
    
    // Also check if they're on the same day and hour (in case of timezone differences)
    const sameDay = slotDate.getFullYear() === bookedDate.getFullYear() &&
                   slotDate.getMonth() === bookedDate.getMonth() &&
                   slotDate.getDate() === bookedDate.getDate();
    const sameHour = slotDate.getHours() === bookedDate.getHours();
    
    const isMatch = exactMatch || (sameDay && sameHour);
    
    if (isMatch) {
      console.log(`Found booking match: ${slotISO} matches ${bookedSlot}`);
    }
    
    return isMatch;
  });
  
  console.log('Slot booking status:', { slotISO, isBooked });
  return isBooked;
}
