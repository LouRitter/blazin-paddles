-- Blazing Paddles Database Setup Script
-- Run this in your Supabase SQL Editor

-- Create courts table
CREATE TABLE IF NOT EXISTS public.courts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all users to read courts" ON public.courts;
DROP POLICY IF EXISTS "Allow all users to read all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete own bookings" ON public.bookings;

-- Create RLS policies
CREATE POLICY "Allow all users to read courts" ON public.courts
    FOR SELECT USING (true);

-- Allow all authenticated users to read ALL bookings (needed for availability checking)
CREATE POLICY "Allow all users to read all bookings" ON public.bookings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookings" ON public.bookings
    FOR DELETE USING (auth.uid() = user_id);

-- Insert sample courts if they don't exist
INSERT INTO public.courts (name, is_active) 
SELECT 'Court 1', true
WHERE NOT EXISTS (SELECT 1 FROM public.courts WHERE name = 'Court 1');

INSERT INTO public.courts (name, is_active) 
SELECT 'Court 2', true
WHERE NOT EXISTS (SELECT 1 FROM public.courts WHERE name = 'Court 2');

INSERT INTO public.courts (name, is_active) 
SELECT 'Court 3', true
WHERE NOT EXISTS (SELECT 1 FROM public.courts WHERE name = 'Court 3');

INSERT INTO public.courts (name, is_active) 
SELECT 'Court 4', true
WHERE NOT EXISTS (SELECT 1 FROM public.courts WHERE name = 'Court 4');

INSERT INTO public.courts (name, is_active) 
SELECT 'Court 5', true
WHERE NOT EXISTS (SELECT 1 FROM public.courts WHERE name = 'Court 5');

INSERT INTO public.courts (name, is_active) 
SELECT 'Court 6', true
WHERE NOT EXISTS (SELECT 1 FROM public.courts WHERE name = 'Court 6');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_court_id ON public.bookings(court_id);

-- Verify the setup
SELECT 'Setup complete! Tables created:' as status;
SELECT 'courts' as table_name, count(*) as record_count FROM public.courts
UNION ALL
SELECT 'bookings' as table_name, count(*) as record_count FROM public.bookings;
