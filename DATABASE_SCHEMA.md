# Supabase Database Schema

## Tables

### 1. courts
Stores information about each available pickleball court.

```sql
CREATE TABLE public.courts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

-- Allow all users to read courts
CREATE POLICY "Allow all users to read courts" ON public.courts
    FOR SELECT USING (true);
```

### 2. bookings
Stores a record of every confirmed booking, linking a user to a court at a specific time.

```sql
CREATE TABLE public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can only read their own bookings
CREATE POLICY "Users can read own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Users can create bookings for themselves
CREATE POLICY "Users can create own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own bookings
CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy 4: Users can delete their own bookings
CREATE POLICY "Users can delete own bookings" ON public.bookings
    FOR DELETE USING (auth.uid() = user_id);
```

## Sample Data

### Insert sample courts
```sql
INSERT INTO public.courts (name, is_active) VALUES
('Court 1', true),
('Court 2', true),
('Court 3', true),
('Court 4', true),
('Court 5', true),
('Court 6', true);
```

## Indexes (Optional but recommended for performance)

```sql
-- Index on bookings for faster queries by date range
CREATE INDEX idx_bookings_start_time ON public.bookings(start_time);

-- Index on bookings for faster queries by user
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);

-- Index on bookings for faster queries by court
CREATE INDEX idx_bookings_court_id ON public.bookings(court_id);
```

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the table creation scripts above
4. Run the sample data insertion script
5. Verify the tables are created in the Table Editor
6. Test the RLS policies by trying to insert/select data
