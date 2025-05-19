# User Management System with Supabase

A comprehensive user management system built with Nuxt.js and Supabase, featuring a clean, responsive interface for managing user records.

## Features

- **Interactive Data Table**: Display user records with sorting, pagination, and filtering
- **Modal Dialogs**: Add, edit, and view user details through intuitive modal interfaces
- **Form Validation**: Client-side validation with appropriate error messages
- **Advanced Filtering**: Search and filter users by multiple criteria
- **Supabase Integration**: Backend powered by Supabase for data storage and retrieval

## Prerequisites

- Node.js (v16 or later)
- pnpm (v7 or later)
- Supabase account (for backend functionality)

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Set up Supabase (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for details)
4. Create a `.env` file with your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-supabase-anon-key
   ```
5. Start the development server:
   ```
   pnpm dev
   ```

## Usage

1. Navigate to `/users` to access the user management interface
2. Use the search bar to find specific users
3. Click on the filter button to access advanced filtering options
4. Use the action buttons to view, edit, or delete users
5. Click "Add User" to create a new user record

## Fallback Mode

The system includes a fallback mode that uses mock data if the Supabase connection fails. This ensures that the application remains functional even without a backend connection.

## Project Structure

- `app/pages/users.vue`: Main user management interface
- `app/components/UserForm.vue`: Reusable form component for adding/editing users
- `app/stores/user.js`: Pinia store for user data management with Supabase integration
- `app/utils/supabase.js`: Supabase client configuration

## Technologies Used

- **Nuxt.js**: Vue.js framework for building the application
- **Nuxt UI**: UI component library for the interface
- **Pinia**: State management
- **Supabase**: Backend-as-a-Service for data storage
- **Tailwind CSS**: Utility-first CSS framework for styling

## License

MIT
