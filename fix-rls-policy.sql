-- Fix RLS Policy for Booking Availability
-- Run this in your Supabase SQL Editor

-- First, let's check the current policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'bookings'
ORDER BY policyname;

-- Drop the old policy if it exists
DROP POLICY IF EXISTS "Users can read own bookings" ON public.bookings;

-- Create the new policy that allows all authenticated users to read all bookings
CREATE POLICY "Allow all users to read all bookings" ON public.bookings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Verify the new policy was created
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'bookings'
ORDER BY policyname;

-- Test the policy by trying to read all bookings
SELECT 
    b.id,
    b.court_id,
    b.start_time,
    b.end_time,
    b.user_id,
    c.name as court_name
FROM public.bookings b
JOIN public.courts c ON b.court_id = c.id
ORDER BY b.start_time
LIMIT 10;
