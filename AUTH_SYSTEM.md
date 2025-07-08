# Authentication System Documentation

This document provides an overview of the custom authentication system implemented for the Business Expense Tracker application using Supabase.

## Overview

The authentication system provides a complete solution for user authentication and session management, including:

- User registration
- Login with email and password
- Password hashing with salt for security
- JWT token-based session management
- Password reset functionality
- Profile management
- Role-based access control
- Protection against brute force attacks

## Database Structure

The authentication system uses two main tables in Supabase:

1. **profiles** - Stores user information

   - id (UUID, primary key)
   - name (VARCHAR)
   - email (VARCHAR, unique)
   - password (VARCHAR, hashed)
   - role (VARCHAR)
   - is_active (BOOLEAN)
   - is_deleted (BOOLEAN)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)
   - last_login (TIMESTAMP)

2. **password_resets** - Stores password reset tokens
   - id (SERIAL, primary key)
   - user_id (UUID, foreign key to profiles.id)
   - token (VARCHAR, hashed)
   - expires_at (TIMESTAMP)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

## Setup Instructions

### 1. Database Setup

Run the SQL migration to create the necessary tables:

```bash
# Apply the password_resets migration
psql -U your_username -d your_database -f app/server/db/migrations/password_resets.sql
```

### 2. Environment Variables

Ensure your `.env` file contains the following variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### 3. Install Dependencies

Make sure you have the required dependencies:

```bash
pnpm add crypto-js
pnpm add -D @types/crypto-js
```

## Authentication Flow

### Registration

1. User fills out the registration form
2. Password is hashed with SHA-256 and a salt
3. User data is stored in the profiles table
4. JWT token is generated and stored in localStorage
5. User is redirected to the home page

### Login

1. User enters email and password
2. System checks for rate limiting (prevents brute force attacks)
3. Password is hashed and compared with the stored hash
4. If valid, JWT token is generated and stored in localStorage
5. User is redirected to the home page

### Password Reset

1. User requests a password reset by providing their email
2. System generates a reset token and stores it in the password_resets table
3. In a real application, an email would be sent with a reset link
4. User clicks the link and is taken to the reset password form
5. User enters a new password
6. System verifies the token, updates the password, and deletes the token

### Session Management

- JWT tokens are used to maintain user sessions
- Tokens are stored in localStorage
- Tokens include user ID, name, email, role, and expiration time
- Tokens are verified on each page load
- Expired tokens are automatically invalidated

## Security Features

1. **Password Hashing**: All passwords are hashed using SHA-256 with a salt
2. **Rate Limiting**: Failed login attempts are tracked and users are locked out after 5 failed attempts
3. **JWT Token Verification**: Tokens are verified on each page load
4. **Role-Based Access Control**: Different pages are accessible based on user roles
5. **SQL Injection Protection**: Supabase provides protection against SQL injection attacks

## Components

The authentication system consists of the following components:

1. **Auth Store** (`app/stores/auth.js`): Manages authentication state and provides methods for login, registration, etc.
2. **Auth Plugin** (`app/plugins/auth.js`): Initializes authentication state on app startup
3. **Auth Middleware** (`app/middleware/auth.js`): Protects routes that require authentication
4. **Guest Middleware** (`app/middleware/guest.js`): Redirects authenticated users away from guest-only pages
5. **Auth Layout** (`app/layouts/auth.vue`): Layout for authentication pages
6. **Auth Page** (`app/pages/auth.vue`): Page that manages different authentication forms
7. **Login Form** (`app/components/LoginForm.vue`): Form for user login
8. **Register Form** (`app/components/RegisterForm.vue`): Form for user registration
9. **Forgot Password Form** (`app/components/ForgotPasswordForm.vue`): Form for requesting password reset
10. **Reset Password Form** (`app/components/ResetPasswordForm.vue`): Form for resetting password
11. **Profile Page** (`app/pages/profile.vue`): Page for managing user profile

## Usage

### Protecting Routes

To protect a route that requires authentication, add the auth middleware to the page:

```javascript
// Define page metadata
definePageMeta({
  middleware: ["auth"],
});
```

### Role-Based Access Control

To restrict a page to specific roles, use the validate function:

```javascript
// Define page metadata
definePageMeta({
  middleware: ["auth"],
  // Only allow admin and editor roles to access this page
  validate: async () => {
    const authStore = useAuthStore();
    await authStore.checkAuth();
    return authStore.isAdmin || authStore.isEditor;
  },
});
```

### Accessing Auth State

You can access the authentication state from any component:

```javascript
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();

// Check if user is authenticated
if (authStore.isAuthenticated) {
  // Do something
}

// Get current user
const user = authStore.currentUser;

// Check user role
if (authStore.isAdmin) {
  // Do something for admins
}
```

## Production Considerations

For a production environment, consider the following enhancements:

1. Use a more secure hashing algorithm like bcrypt or Argon2
2. Implement email verification for new accounts
3. Add two-factor authentication
4. Use secure HTTP-only cookies instead of localStorage for token storage
5. Implement CSRF protection
6. Add more comprehensive logging for security events
7. Set up automated security scanning and penetration testing
8. Implement IP-based rate limiting
9. Use a unique salt for each user
10. Store sensitive configuration in environment variables
11. jj
