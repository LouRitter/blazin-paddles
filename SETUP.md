# Blazing Paddles - Authentication Setup

## Supabase Configuration

To complete the authentication setup, you need to configure your Supabase project:

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `blazing-paddles`
   - Database Password: (create a strong password)
   - Region: Choose the closest to your users
6. Click "Create new project"

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

### 3. Configure Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with the values from step 2.

### 4. Enable Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure **Site URL** to `http://localhost:3001` (or your development URL)
4. Add `http://localhost:3001/**` to **Redirect URLs**

### 5. Test the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3001`

3. Test the authentication flow:
   - Try to access `/booking` or `/sessions` (should redirect to signup)
   - Create a new account on `/signup`
   - Sign in on `/login`
   - Verify the header shows "Log Out" when authenticated
   - Test logout functionality

## Features Implemented

✅ **User Registration**: Complete signup flow with Supabase
✅ **User Login**: Sign in with email and password
✅ **Session Management**: Persistent authentication state
✅ **Protected Routes**: Booking and Sessions pages require authentication
✅ **Dynamic Header**: Shows Sign Up/Log Out based on auth state
✅ **Error Handling**: Clear error messages for auth failures
✅ **Loading States**: User feedback during auth operations
✅ **Automatic Redirects**: Seamless navigation after auth actions

## File Structure

```
app/
├── components/
│   ├── Header.tsx          # Navigation with auth logic
│   ├── Footer.tsx          # Footer component
│   └── ProtectedRoute.tsx  # Route protection wrapper
├── contexts/
│   └── AuthContext.tsx     # Global auth state management
├── booking/
│   └── page.tsx           # Protected booking page
├── sessions/
│   └── page.tsx           # Protected sessions page
├── login/
│   └── page.tsx           # Login page
├── signup/
│   └── page.tsx           # Registration page
├── landing/
│   └── page.tsx           # Public landing page
└── layout.tsx             # Root layout with AuthProvider

lib/
└── supabaseClient.ts      # Supabase client configuration
```

## Next Steps

1. Set up your Supabase project following the steps above
2. Add your environment variables
3. Test the authentication flow
4. Customize the UI and add additional features as needed

The authentication system is now fully integrated and ready to use!
