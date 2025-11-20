import { AsyncStorage } from 'react-native';
import { User } from '../types';

// --- MOCK DATABASE ---
// In a real application, this would be your user database.
let users: User[] = [];
const SESSION_KEY = 'user_session_token';

// --- MOCK SERVER API ---
// This is where you would make your actual API calls.

/**
 * Signs a user in.
 * In a real app, this would make a POST request to /api/auth/signin.
 */
const signIn = async (email: string): Promise<{ token: string; user: User }> => {
  console.log(`[AuthService] Attempting to sign in user: ${email}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        const token = `mock-token-for-${user.id}`;
        console.log(`[AuthService] Sign in successful for user: ${user.id}`);
        resolve({ token, user });
      } else {
        console.error(`[AuthService] Sign in failed: User not found`);
        reject(new Error('User not found.'));
      }
    }, 500);
  });
};

/**
 * Signs a user up.
 * In a real app, this would make a POST request to /api/auth/signup.
 */
const signUp = async (userData: Omit<User, 'id'>): Promise<{ token: string; user: User }> => {
  console.log(`[AuthService] Attempting to sign up user: ${userData.email}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userExists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (userExists) {
        console.error(`[AuthService] Sign up failed: Email already in use`);
        return reject(new Error('Email already in use.'));
      }
      const newUser: User = {
        id: `user_${Date.now()}`,
        ...userData,
      };
      users.push(newUser);
      const token = `mock-token-for-${newUser.id}`;
      console.log(`[AuthService] Sign up successful for new user: ${newUser.id}`);
      resolve({ token, user: newUser });
    }, 500);
  });
};

/**
 * Signs the current user out.
 * In a real app, this would make a POST request to /api/auth/signout.
 */
const signOut = async (): Promise<void> => {
  console.log('[AuthService] Signing out user.');
  await AsyncStorage.removeItem(SESSION_KEY);
};

/**
 * Gets the current user from the session token.
 * In a real app, this would make a GET request to /api/auth/me using the token.
 */
const getCurrentUser = async (): Promise<User | null> => {
  console.log('[AuthService] Getting current user from session...');
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      try {
        const token = await AsyncStorage.getItem(SESSION_KEY);
        if (token) {
          const userId = token.replace('mock-token-for-', '');
          const user = users.find(u => u.id === userId);
          if (user) {
            console.log(`[AuthService] Found current user: ${user.id}`);
            resolve(user);
          } else {
            console.error('[AuthService] User ID from token not found in mock DB.');
            resolve(null);
          }
        } else {
          console.log('[AuthService] No session token found.');
          resolve(null);
        }
      } catch (e) {
        console.error('[AuthService] Error getting current user:', e);
        resolve(null);
      }
    }, 500);
  });
};

/**
 * Saves the session token to storage.
 */
const saveSession = async (token: string): Promise<void> => {
  console.log('[AuthService] Saving session token.');
  await AsyncStorage.setItem(SESSION_KEY, token);
};


export const AuthService = {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  saveSession
};
