# Supabase Integration Setup Guide

## Overview
This guide will help you set up the Supabase backend for the Blazing Paddles booking system with live data and persistent bookings.

## Prerequisites
- Supabase project created
- Environment variables configured (see main SETUP.md)
- Database access in Supabase dashboard

## Step 1: Database Schema Setup

### 1.1 Create Tables
Go to your Supabase project → SQL Editor and run the following:

```sql
-- Create courts table
CREATE TABLE public.courts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 1.2 Enable Row Level Security (RLS)
```sql
-- Enable RLS on both tables
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
```

### 1.3 Create RLS Policies
```sql
-- Courts: Allow all users to read
CREATE POLICY "Allow all users to read courts" ON public.courts
    FOR SELECT USING (true);

-- Bookings: Users can only access their own bookings
CREATE POLICY "Users can read own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookings" ON public.bookings
    FOR DELETE USING (auth.uid() = user_id);
```

### 1.4 Insert Sample Data
```sql
-- Insert sample courts
INSERT INTO public.courts (name, is_active) VALUES
('Court 1', true),
('Court 2', true),
('Court 3', true),
('Court 4', true),
('Court 5', true),
('Court 6', true);
```

### 1.5 Create Performance Indexes (Optional)
```sql
-- Create indexes for better performance
CREATE INDEX idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_court_id ON public.bookings(court_id);
```

## Step 2: Verify Setup

### 2.1 Check Tables
1. Go to Table Editor in Supabase dashboard
2. Verify both `courts` and `bookings` tables exist
3. Check that sample courts are inserted

### 2.2 Test RLS Policies
1. Go to Authentication → Users
2. Create a test user or use existing user
3. Go to SQL Editor and test queries:

```sql
-- This should work (reading courts)
SELECT * FROM public.courts;

-- This should work (reading user's own bookings)
SELECT * FROM public.bookings WHERE user_id = auth.uid();

-- This should fail (reading other users' bookings)
SELECT * FROM public.bookings;
```

## Step 3: Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 4: Test the Application

### 4.1 Start the Development Server
```bash
npm run dev
```

### 4.2 Test the Booking Flow
1. Navigate to `http://localhost:3001`
2. Sign up or log in
3. Go to the booking page
4. Select a date
5. Choose a court and time slot
6. Confirm the booking
7. Verify the booking appears in the Supabase dashboard

### 4.3 Verify Real-time Updates
1. Make a booking
2. Refresh the page
3. The booked slot should show as "Booked"
4. Try to book the same slot again (should fail)

## Features Implemented

✅ **Live Data**: Court availability fetched from Supabase
✅ **Real-time Updates**: Bookings immediately reflect in the UI
✅ **User Authentication**: Only authenticated users can book
✅ **Data Persistence**: Bookings saved to database
✅ **Error Handling**: Comprehensive error messages
✅ **Loading States**: User feedback during operations
✅ **Success Feedback**: Confirmation messages for successful bookings

## Troubleshooting

### Common Issues

1. **"Failed to fetch courts" error**
   - Check if courts table exists and has data
   - Verify RLS policies are correct
   - Check Supabase URL and key in environment variables

2. **"Failed to create booking" error**
   - Check if user is authenticated
   - Verify bookings table exists
   - Check RLS policies for bookings table

3. **Bookings not showing as "Booked"**
   - Check if the booking was actually created in database
   - Verify the time slot matching logic
   - Check browser console for errors

### Debug Queries

```sql
-- Check all courts
SELECT * FROM public.courts ORDER BY name;

-- Check all bookings
SELECT b.*, c.name as court_name, u.email as user_email
FROM public.bookings b
JOIN public.courts c ON b.court_id = c.id
JOIN auth.users u ON b.user_id = u.id
ORDER BY b.start_time;

-- Check bookings for a specific date
SELECT b.*, c.name as court_name
FROM public.bookings b
JOIN public.courts c ON b.court_id = c.id
WHERE DATE(b.start_time) = '2025-01-15'
ORDER BY b.start_time;
```

## Next Steps

1. **Add Court Management**: Admin interface to manage courts
2. **Booking History**: User dashboard to view past bookings
3. **Email Notifications**: Send confirmation emails
4. **Recurring Bookings**: Allow weekly/monthly recurring bookings
5. **Payment Integration**: Add payment processing for bookings
6. **Court Features**: Add court-specific features (lighting, surface type, etc.)

The booking system is now fully integrated with Supabase and ready for production use!
