import { defineStore } from 'pinia';
import { useSupabase } from '~/utils/supabase';
import CryptoJS from 'crypto-js';
// We'll use this later when we need to sync user data
// import { useUserStore } from './user';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    loading: false,
    error: null,
    resetToken: null,
    loginAttempts: {},
    isLockedOut: {}
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role || null,
    isAdmin: (state) => state.user?.role === 'Admin',
    isEditor: (state) => state.user?.role === 'Editor',
    isUser: (state) => state.user?.role === 'User',
  },

  actions: {
    // Helper function to hash passwords
    hashPassword(password) {
      // Using SHA-256 for hashing with a salt
      const salt = 'business-expense-tracker-salt'; // In production, use a secure random salt for each user
      return CryptoJS.SHA256(password + salt).toString();
    },

    // Check if user is locked out due to too many failed login attempts
    isUserLockedOut(email) {
      const now = new Date().getTime();
      if (this.isLockedOut[email] && this.isLockedOut[email] > now) {
        // User is locked out
        const remainingTime = Math.ceil((this.isLockedOut[email] - now) / 1000 / 60);
        return `Too many failed login attempts. Please try again in ${remainingTime} minutes.`;
      }
      return false;
    },

    // Record a failed login attempt
    recordFailedLoginAttempt(email) {
      if (!this.loginAttempts[email]) {
        this.loginAttempts[email] = { count: 0, timestamp: new Date().getTime() };
      }
      
      const now = new Date().getTime();
      const oneHour = 60 * 60 * 1000;
      
      // Reset counter if last attempt was more than an hour ago
      if (now - this.loginAttempts[email].timestamp > oneHour) {
        this.loginAttempts[email] = { count: 1, timestamp: now };
      } else {
        this.loginAttempts[email].count++;
        this.loginAttempts[email].timestamp = now;
        
        // Lock out after 5 failed attempts
        if (this.loginAttempts[email].count >= 5) {
          // Lock out for 30 minutes
          const lockoutTime = now + (30 * 60 * 1000);
          this.isLockedOut[email] = lockoutTime;
        }
      }
    },

    // Register a new user
    async register(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        // We'll use userStore later when we need to sync user data
        // const userStore = useUserStore();
        
        // Check if email already exists
        const { data: existingUsers } = await supabase
          .from('active_profiles')
          .select('email')
          .eq('email', userData.email);
          
        if (existingUsers && existingUsers.length > 0) {
          throw new Error('Email already in use');
        }
        
        // Create user in profiles table
        const hashedPassword = this.hashPassword(userData.password);
        const newUser = {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role || 'User',
          is_active: true,
          is_deleted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('profiles')
          .insert(newUser)
          .select();
          
        if (error) throw error;
        
        if (!data || data.length === 0) {
          throw new Error('Failed to create user');
        }
        
        // Update local state
        this.user = data[0];
        
        // Generate JWT token
        const token = this.generateToken(data[0]);
        this.session = { token };
        
        // Store token in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_id', data[0].id);
        
        return data[0];
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Login user
    async login(email, password) {
      this.loading = true;
      this.error = null;
      
      try {
        // Check if user is locked out
        const lockoutMessage = this.isUserLockedOut(email);
        if (lockoutMessage) {
          throw new Error(lockoutMessage);
        }
        
        const supabase = useSupabase();
        
        // Get user by email
        const { data: users, error } = await supabase
          .from('active_profiles')
          .select('*')
          .eq('email', email);
          
        if (error) throw error;
        
        if (!users || users.length === 0) {
          this.recordFailedLoginAttempt(email);
          throw new Error('Invalid email or password');
        }
        
        const user = users[0];
        
        // Check if user is active
        if (!user.is_active) {
          throw new Error('Your account is inactive. Please contact an administrator.');
        }
        
        // Check if user is deleted
        if (user.is_deleted) {
          throw new Error('Your account has been deleted. Please contact an administrator.');
        }
        
        // Verify password
        const hashedPassword = this.hashPassword(password);
        if (user.password !== hashedPassword) {
          this.recordFailedLoginAttempt(email);
          throw new Error('Invalid email or password');
        }
        
        // Reset login attempts on successful login
        delete this.loginAttempts[email];
        delete this.isLockedOut[email];
        
        // Update user's last login timestamp
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', user.id);
        
        // Set user in state
        this.user = user;
        
        // Generate JWT token
        const token = this.generateToken(user);
        this.session = { token };
        
        // Store token in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_id', user.id);
        
        return user;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Logout user
    async logout() {
      this.user = null;
      this.session = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
    },

    // Check if user is authenticated
    async checkAuth() {
      this.loading = true;
      
      try {
        const token = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('user_id');
        
        if (!token || !userId) {
          return false;
        }
        
        // Verify token
        try {
          const isValid = this.verifyToken(token);
          if (!isValid) {
            this.logout();
            return false;
          }
        } catch {
          this.logout();
          return false;
        }
        
        // Get user data
        const supabase = useSupabase();
        const { data: user, error } = await supabase
          .from('active_profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error || !user) {
          this.logout();
          return false;
        }
        
        // Check if user is active and not deleted
        if (!user.is_active || user.is_deleted) {
          this.logout();
          return false;
        }
        
        this.user = user;
        this.session = { token };
        return true;
      } catch (error) {
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Generate a JWT token
    generateToken(user) {
      // In a real app, you would use a proper JWT library
      // This is a simplified version for demonstration
      const header = {
        alg: 'HS256',
        typ: 'JWT'
      };
      
      const payload = {
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
      };
      
      const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
      const encodedHeader = this.base64url(stringifiedHeader);
      
      const stringifiedPayload = CryptoJS.enc.Utf8.parse(JSON.stringify(payload));
      const encodedPayload = this.base64url(stringifiedPayload);
      
      const signature = CryptoJS.HmacSHA256(
        encodedHeader + '.' + encodedPayload,
        'your-secret-key' // In production, use a secure environment variable
      );
      const encodedSignature = this.base64url(signature);
      
      return encodedHeader + '.' + encodedPayload + '.' + encodedSignature;
    },

    // Verify a JWT token
    verifyToken(token) {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          return false;
        }
        
        const [encodedHeader, encodedPayload, encodedSignature] = parts;
        
        // Verify signature
        const signature = CryptoJS.HmacSHA256(
          encodedHeader + '.' + encodedPayload,
          'your-secret-key' // In production, use a secure environment variable
        );
        const calculatedSignature = this.base64url(signature);
        
        if (encodedSignature !== calculatedSignature) {
          return false;
        }
        
        // Decode payload
        const payload = JSON.parse(
          CryptoJS.enc.Utf8.stringify(
            this.base64urlDecode(encodedPayload)
          )
        );
        
        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
          return false;
        }
        
        return true;
      } catch {
        return false;
      }
    },

    // Base64Url encode
    base64url(source) {
      // Encode in classical base64
      let encodedSource = CryptoJS.enc.Base64.stringify(source);
      
      // Remove padding equal characters
      encodedSource = encodedSource.replace(/=+$/, '');
      
      // Replace characters according to base64url specifications
      encodedSource = encodedSource.replace(/\+/g, '-');
      encodedSource = encodedSource.replace(/\//g, '_');
      
      return encodedSource;
    },

    // Base64Url decode
    base64urlDecode(str) {
      // Add removed padding equal characters
      let padding = '';
      if (str.length % 4 === 2) {
        padding = '==';
      } else if (str.length % 4 === 3) {
        padding = '=';
      }
      
      // Replace characters according to base64url specifications
      str = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
      
      return CryptoJS.enc.Base64.parse(str);
    },

    // Request password reset
    async requestPasswordReset(email) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        
        // Check if email exists
        const { data: users, error } = await supabase
          .from('active_profiles')
          .select('id, email, name')
          .eq('email', email);
          
        if (error) throw error;
        
        if (!users || users.length === 0) {
          // Don't reveal that the email doesn't exist for security reasons
          // Instead, pretend we sent an email
          return true;
        }
        
        const user = users[0];
        
        // Generate reset token
        const resetToken = CryptoJS.lib.WordArray.random(32).toString();
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour
        
        // Store reset token in database
        await supabase
          .from('password_resets')
          .upsert({
            user_id: user.id,
            token: this.hashPassword(resetToken), // Store hashed token
            expires_at: tokenExpiry.toISOString(),
            created_at: new Date().toISOString()
          });
        
        // In a real app, you would send an email with the reset link
        // For this demo, we'll just store the token in state
        this.resetToken = resetToken;
        
        console.log(`Password reset requested for ${email}. Token: ${resetToken}`);
        
        return true;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Reset password
    async resetPassword(token, newPassword) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        
        // Get reset token from database
        const { data: resetData, error: resetError } = await supabase
          .from('password_resets')
          .select('user_id, token, expires_at')
          .eq('token', this.hashPassword(token))
          .gt('expires_at', new Date().toISOString());
          
        if (resetError) throw resetError;
        
        if (!resetData || resetData.length === 0) {
          throw new Error('Invalid or expired reset token');
        }
        
        const userId = resetData[0].user_id;
        
        // Update user's password
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            password: this.hashPassword(newPassword),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
          
        if (updateError) throw updateError;
        
        // Delete used reset token
        await supabase
          .from('password_resets')
          .delete()
          .eq('user_id', userId);
        
        return true;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Update user profile
    async updateProfile(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        if (!this.user) {
          throw new Error('You must be logged in to update your profile');
        }
        
        const supabase = useSupabase();
        
        const updates = {
          name: userData.name,
          email: userData.email,
          updated_at: new Date().toISOString()
        };
        
        // Only update password if provided
        if (userData.password) {
          updates.password = this.hashPassword(userData.password);
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', this.user.id)
          .select();
          
        if (error) throw error;
        
        if (!data || data.length === 0) {
          throw new Error('Failed to update profile');
        }
        
        // Update local state
        this.user = data[0];
        
        return data[0];
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Change password
    async changePassword(currentPassword, newPassword) {
      this.loading = true;
      this.error = null;
      
      try {
        if (!this.user) {
          throw new Error('You must be logged in to change your password');
        }
        
        const supabase = useSupabase();
        
        // Verify current password
        const hashedCurrentPassword = this.hashPassword(currentPassword);
        if (this.user.password !== hashedCurrentPassword) {
          throw new Error('Current password is incorrect');
        }
        
        // Update password
        const { error } = await supabase
          .from('profiles')
          .update({
            password: this.hashPassword(newPassword),
            updated_at: new Date().toISOString()
          })
          .eq('id', this.user.id);
          
        if (error) throw error;
        
        return true;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});