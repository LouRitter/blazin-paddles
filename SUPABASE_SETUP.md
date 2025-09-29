# Supabase Integration Setup Guide

## Overview
This guide will help you set up the Supabase backend for the Blazing Paddles booking system with live data and persistent bookings for both local development and production deployments.

## Prerequisites
- Supabase account (free tier available)
- Node.js and npm installed
- Git repository for deployment (optional)

## Table of Contents
1. [Creating a Supabase Project](#1-creating-a-supabase-project)
2. [Local Development Setup](#2-local-development-setup)
3. [Database Schema Setup](#3-database-schema-setup)
4. [Authentication Configuration](#4-authentication-configuration)
5. [Production Deployment Setup](#5-production-deployment-setup)
6. [Environment Variables](#6-environment-variables)
7. [Testing the Setup](#7-testing-the-setup)
8. [Troubleshooting](#8-troubleshooting)

## 1. Creating a Supabase Project

### 1.1 Sign Up for Supabase
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign up"
3. Sign up with GitHub, Google, or email
4. Verify your email if required

### 1.2 Create New Project
1. Click "New Project"
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `blazing-paddles` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest to your users
4. Click "Create new project"
5. Wait for the project to be set up (2-3 minutes)

### 1.3 Get Your Project Credentials
1. In your project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## 2. Local Development Setup

### 2.1 Clone and Install Dependencies
```bash
# Clone your repository (if not already done)
git clone <your-repo-url>
cd blazing-paddles

# Install dependencies
npm install
```

### 2.2 Environment Variables for Local Development
Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For development debugging
NEXT_PUBLIC_DEBUG=true
```

### 2.3 Start Development Server
```bash
npm run dev
```

Your app will be available at `http://localhost:3000` (or the next available port).

## 3. Database Schema Setup

### 3.1 Create Tables
Go to your Supabase project → **SQL Editor** and run the following:

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

-- Bookings: All authenticated users can read ALL bookings (needed for availability checking)
-- This is required so that the fetchCourtAvailability function can see all bookings
-- to determine which time slots are already taken and prevent double bookings
CREATE POLICY "Allow all users to read all bookings" ON public.bookings
    FOR SELECT USING (auth.role() = 'authenticated');

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

## 4. Authentication Configuration

### 4.1 Configure Authentication Settings
1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure **Site URL**:
   - For local development: `http://localhost:3000`
   - For production: `https://your-domain.com`
4. Add **Redirect URLs**:
   - `http://localhost:3000/**` (for local development)
   - `https://your-domain.com/**` (for production)

### 4.2 Email Templates (Optional)
1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation and reset password emails
3. Add your branding and styling

### 4.3 User Management
1. Go to **Authentication** → **Users**
2. You can manually create test users or let users sign up themselves
3. Test the authentication flow

## 5. Production Deployment Setup

### 5.1 Deploy to Vercel (Recommended)

#### Option A: Deploy from GitHub
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Sign up/login with GitHub
4. Click "New Project"
5. Import your repository
6. Add environment variables (see section 6.2)
7. Click "Deploy"

#### Option B: Deploy with Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts and add environment variables
```

### 5.2 Deploy to Netlify
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables in Site settings
7. Deploy

### 5.3 Deploy to Railway
1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables
6. Deploy

## 6. Environment Variables

### 6.1 Local Development (.env.local)
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Debug mode
NEXT_PUBLIC_DEBUG=true
```

### 6.2 Production Environment Variables
Add these to your deployment platform:

**Vercel:**
1. Go to your project dashboard
2. Settings → Environment Variables
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key-here`

**Netlify:**
1. Site settings → Environment variables
2. Add the same variables as above

**Railway:**
1. Project → Variables
2. Add the same variables as above

### 6.3 Environment-Specific Configuration
For different environments, you can use different Supabase projects:

```env
# Development
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key

# Production
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
```

## 7. Testing the Setup

### 7.1 Local Development Testing
1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Test the complete flow:
   - Sign up for a new account
   - Verify email (if email confirmation is enabled)
   - Log in
   - Book a court session
   - View your sessions
   - Cancel a booking

### 7.2 Production Testing
1. Deploy your application
2. Test the same flow on your production URL
3. Verify data is being saved to Supabase
4. Test authentication and authorization

### 7.3 Database Verification
1. Go to your Supabase dashboard
2. Check **Table Editor**:
   - Verify `courts` table has sample data
   - Verify `bookings` table has your test bookings
3. Check **Authentication** → **Users**:
   - Verify test users are created
4. Check **Logs** for any errors

## 8. Troubleshooting

### 8.1 Common Issues

#### "Failed to fetch courts" error
- **Cause**: Courts table doesn't exist or RLS policies are incorrect
- **Solution**: 
  1. Check if courts table exists in Table Editor
  2. Verify RLS policies are enabled and correct
  3. Check Supabase URL and key in environment variables
  4. Check browser console for detailed error messages

#### "Failed to create booking" error
- **Cause**: User not authenticated or bookings table issues
- **Solution**:
  1. Verify user is logged in
  2. Check if bookings table exists
  3. Verify RLS policies for bookings table
  4. Check user permissions

#### Bookings not showing as "Booked"
- **Cause**: Time slot matching logic or data sync issues
- **Solution**:
  1. Check if booking was created in database
  2. Verify time slot matching logic
  3. Check browser console for errors
  4. Refresh the page to reload data

#### Authentication issues
- **Cause**: Incorrect redirect URLs or email settings
- **Solution**:
  1. Check Authentication → Settings → Site URL
  2. Verify Redirect URLs include your domain
  3. Check email provider settings
  4. Test with different browsers/incognito mode

### 8.2 Debug Queries

Run these in Supabase SQL Editor to debug issues:

```sql
-- Check all courts
SELECT * FROM public.courts ORDER BY name;

-- Check all bookings with user and court info
SELECT 
  b.*, 
  c.name as court_name, 
  u.email as user_email
FROM public.bookings b
JOIN public.courts c ON b.court_id = c.id
JOIN auth.users u ON b.user_id = u.id
ORDER BY b.start_time;

-- Check bookings for a specific date
SELECT 
  b.*, 
  c.name as court_name
FROM public.bookings b
JOIN public.courts c ON b.court_id = c.id
WHERE DATE(b.start_time) = '2025-01-15'
ORDER BY b.start_time;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public';
```

### 8.3 Environment-Specific Issues

#### Local Development
- **Port conflicts**: Use `npm run dev` and let Next.js choose the port
- **Environment variables**: Ensure `.env.local` is in the project root
- **CORS issues**: Check Supabase project settings

#### Production Deployment
- **Build errors**: Check build logs in deployment platform
- **Environment variables**: Verify all required variables are set
- **Domain issues**: Update Supabase redirect URLs after deployment

### 8.4 Performance Issues

#### Slow queries
- **Solution**: Add database indexes (already included in setup script)
- **Monitor**: Use Supabase dashboard → Logs to check query performance

#### Large datasets
- **Solution**: Implement pagination for bookings list
- **Consider**: Using Supabase real-time subscriptions for live updates

## 9. Security Best Practices

### 9.1 Row Level Security (RLS)
- ✅ **Enabled**: All tables have RLS enabled
- ✅ **Policies**: Users can only access their own data
- ✅ **Testing**: Verify policies work correctly

### 9.2 Environment Variables
- ✅ **Secure**: Never commit `.env.local` to version control
- ✅ **Production**: Use secure environment variable management
- ✅ **Rotation**: Regularly rotate API keys

### 9.3 Authentication
- ✅ **Email verification**: Enable for production
- ✅ **Password strength**: Enforce strong passwords
- ✅ **Session management**: Proper logout functionality

## 10. Monitoring and Maintenance

### 10.1 Supabase Dashboard
- **Monitor**: Database usage, API calls, and errors
- **Logs**: Check authentication and database logs
- **Metrics**: Track user signups and bookings

### 10.2 Application Monitoring
- **Error tracking**: Consider adding Sentry or similar
- **Analytics**: Track user behavior and popular time slots
- **Performance**: Monitor page load times and API response times

## 11. Scaling Considerations

### 11.1 Database Scaling
- **Indexes**: Already added for common queries
- **Connection pooling**: Supabase handles this automatically
- **Read replicas**: Available for high-traffic applications

### 11.2 Application Scaling
- **CDN**: Use Vercel's global CDN
- **Caching**: Implement Redis for frequently accessed data
- **Rate limiting**: Consider implementing API rate limits

## 12. Features Implemented

✅ **Live Data**: Court availability fetched from Supabase
✅ **Real-time Updates**: Bookings immediately reflect in the UI
✅ **User Authentication**: Only authenticated users can book
✅ **Data Persistence**: Bookings saved to database
✅ **Error Handling**: Comprehensive error messages
✅ **Loading States**: User feedback during operations
✅ **Success Feedback**: Confirmation messages for successful bookings
✅ **Session Management**: View and cancel bookings
✅ **Responsive Design**: Works on all devices
✅ **Production Ready**: Deploy to any platform

## 13. Next Steps

### 13.1 Immediate Enhancements
1. **Email Notifications**: Send booking confirmations
2. **Admin Dashboard**: Manage courts and view all bookings
3. **Payment Integration**: Add Stripe for paid bookings
4. **Mobile App**: React Native version

### 13.2 Advanced Features
1. **Recurring Bookings**: Weekly/monthly recurring sessions
2. **Court Features**: Lighting, surface type, equipment
3. **User Profiles**: Player stats and preferences
4. **Social Features**: Find playing partners
5. **Analytics**: Detailed usage and revenue reports

### 13.3 Business Features
1. **Membership Tiers**: Different booking privileges
2. **Waitlist System**: Queue for popular time slots
3. **Court Maintenance**: Block times for maintenance
4. **Multi-location**: Support multiple facilities

The booking system is now fully integrated with Supabase and ready for both development and production use!
