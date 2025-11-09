# Healthify - Healthcare Mobile Application

<div align="center">

![Healthify Logo](./assets/icon.png)

**Your health, simplified with AI.**

A modern, cross-platform healthcare mobile application built with React Native and Expo, featuring secure authentication, AI-powered health insights, and comprehensive health tracking.

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.18-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![Clerk](https://img.shields.io/badge/Clerk-2.18.2-purple.svg)](https://clerk.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Authentication Flow](#authentication-flow)
- [API Integration](#api-integration)
- [Setup & Installation](#setup--installation)
- [Configuration](#configuration)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Healthify is a comprehensive healthcare mobile application that provides users with AI-powered health insights, appointment management, and health tracking capabilities. The application is built with modern technologies to ensure security, scalability, and a seamless user experience across iOS and Android platforms.

### Key Features

- 🔐 **Secure Authentication** - Multiple authentication methods (Email/Password, Google OAuth, Apple Sign In)
- 🤖 **AI Health Checks** - AI-powered health assessment and insights
- 📅 **Appointment Management** - Schedule and track medical appointments
- 📊 **Health Dashboard** - Comprehensive health metrics and insights
- 🔒 **Secure Data Storage** - Encrypted storage using Expo SecureStore
- 🎨 **Modern UI/UX** - Beautiful, intuitive interface built with Tailwind CSS
- 📱 **Cross-Platform** - Works seamlessly on iOS and Android

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Application                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Expo/RN    │  │   Expo Router│  │  React Native│      │
│  │   Framework  │  │   Navigation │  │   Components │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Clerk      │  │   Context    │  │   API Layer  │      │
│  │   Auth       │  │   Providers  │  │   (Axios)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   NestJS     │  │   Clerk      │  │   Database   │      │
│  │   API Server │  │   Backend    │  │   (Future)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ OAuth Callbacks
                            │
┌─────────────────────────────────────────────────────────────┐
│                 External Services                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Google     │  │   Apple      │  │   AI Service │      │
│  │   OAuth      │  │   Sign In    │  │   (Future)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Application Architecture Layers

#### 1. **Presentation Layer**
- **React Native Components**: UI components built with React Native
- **Expo Router**: File-based routing system for navigation
- **Tailwind CSS (twrnc)**: Utility-first styling
- **Context API**: Global state management for authentication and user data

#### 2. **Business Logic Layer**
- **AuthContext**: Authentication state management
- **API Services**: Business logic for API interactions
- **Navigation Logic**: Route protection and navigation flow
- **Onboarding Logic**: User onboarding state management

#### 3. **Data Access Layer**
- **Clerk SDK**: Authentication and user management
- **Axios**: HTTP client for API requests
- **Expo SecureStore**: Secure token storage
- **Expo WebBrowser**: OAuth flow handling

#### 4. **Infrastructure Layer**
- **Expo Framework**: Build system and native module access
- **TypeScript**: Type safety and developer experience
- **Environment Variables**: Configuration management

### Authentication Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
│                                                              │
│  1. User Initiates Login                                    │
│     │                                                        │
│     ├─ Email/Password ──────────┐                           │
│     ├─ Google OAuth ────────────┤                           │
│     └─ Apple Sign In (iOS) ─────┤                           │
│                                  │                           │
│  2. Clerk Provider              │                           │
│     │                           │                           │
│     ├─ Validates Credentials    │                           │
│     ├─ Creates Session          │                           │
│     └─ Returns JWT Token        │                           │
│                                  │                           │
│  3. Token Storage               │                           │
│     │                           │                           │
│     ├─ SecureStore (Local)      │                           │
│     └─ Clerk Token Cache        │                           │
│                                  │                           │
│  4. Session Management          │                           │
│     │                           │                           │
│     ├─ AuthContext Updates      │                           │
│     ├─ Navigation Protection    │                           │
│     └─ API Request Interceptor  │                           │
│                                  │                           │
│  5. API Authentication          │                           │
│     │                           │                           │
│     └─ Bearer Token in Headers  │                           │
└─────────────────────────────────────────────────────────────┘
```

### Navigation Architecture

The application uses Expo Router's file-based routing system with route groups:

```
app/
├── _layout.tsx              # Root layout with providers
├── index.tsx                # Entry point
├── (auth)/                  # Auth route group
│   ├── _layout.tsx          # Auth layout with protection
│   ├── sign-in.tsx          # Sign in screen
│   └── sign-up.tsx          # Sign up screen
├── (home)/                  # Home route group
│   ├── _layout.tsx          # Home layout
│   └── index.tsx            # Dashboard/home screen
└── (onboarding)/            # Onboarding route group
    └── onboarding.tsx       # Onboarding screen
```

### State Management Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    State Management                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           ClerkProvider (Root Level)               │    │
│  │  - Provides Clerk authentication context          │    │
│  │  - Manages global authentication state            │    │
│  └────────────────────────────────────────────────────┘    │
│                        │                                     │
│                        ▼                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │           AuthProvider (Context API)               │    │
│  │  - userId: string | null                          │    │
│  │  - token: string | null                           │    │
│  │  - isLoading: boolean                             │    │
│  │  - isSignedIn: boolean                            │    │
│  │  - hasCompletedOnboarding: boolean                │    │
│  └────────────────────────────────────────────────────┘    │
│                        │                                     │
│                        ▼                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Component-Level State (useState)           │    │
│  │  - Form inputs                                     │    │
│  │  - Loading states                                  │    │
│  │  - Error messages                                  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.81.5 | Mobile app framework |
| **Expo** | ~54.0.18 | Development platform and tooling |
| **Expo Router** | ~6.0.14 | File-based routing |
| **TypeScript** | ~5.9.2 | Type safety |
| **React** | ^19.1.0 | UI library |
| **Tailwind CSS (twrnc)** | ^4.10.1 | Utility-first styling |

### Authentication & Security

| Technology | Version | Purpose |
|------------|---------|---------|
| **Clerk** | ^2.18.2 | Authentication service |
| **Expo SecureStore** | ^15.0.7 | Secure token storage |
| **Expo WebBrowser** | ^15.0.9 | OAuth flow handling |
| **Expo Apple Authentication** | ~7.0.0 | Apple Sign In integration |

### API & Networking

| Technology | Version | Purpose |
|------------|---------|---------|
| **Axios** | ^1.13.1 | HTTP client |
| **Expo Linking** | ~8.0.8 | Deep linking |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | ^11.0.1 | Backend framework |
| **TypeScript** | ^5.7.3 | Type safety |

### Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | Latest | Code linting |
| **Prettier** | Latest | Code formatting |
| **Jest** | Latest | Testing framework |

---

## 📁 Project Structure

```
Health-Care-App/
│
├── app/                          # Expo Router app directory
│   ├── _layout.tsx              # Root layout with providers
│   ├── index.tsx                # Entry point/redirect logic
│   ├── (auth)/                  # Authentication route group
│   │   ├── _layout.tsx          # Auth layout with protection
│   │   ├── sign-in.tsx          # Sign in screen
│   │   └── sign-up.tsx          # Sign up screen
│   ├── (home)/                  # Home route group
│   │   ├── _layout.tsx          # Home layout
│   │   └── index.tsx            # Dashboard/home screen
│   ├── (onboarding)/            # Onboarding route group
│   │   └── onboarding.tsx       # Onboarding screen
│   └── components/              # Shared components
│       └── SignOutButton.tsx    # Sign out button component
│
├── api/                          # API layer
│   ├── api.ts                   # Axios instance with interceptors
│   ├── index.ts                 # API exports
│   └── request/                 # API request functions
│       ├── authRequests.ts      # Authentication API requests
│       └── userRequest.ts       # User API requests
│
├── context/                      # React Context providers
│   └── AuthContext.tsx          # Authentication context
│
├── assets/                       # Static assets
│   ├── icon.png                 # App icon
│   ├── adaptive-icon.png        # Android adaptive icon
│   ├── splash-icon.png          # Splash screen icon
│   └── favicon.png              # Web favicon
│
├── android/                      # Android native code
│   └── app/
│       └── src/
│           └── main/
│               ├── AndroidManifest.xml  # Android manifest
│               └── java/                # Kotlin/Java code
│
├── Backend/                      # NestJS backend
│   ├── src/                     # Source code
│   │   ├── app.controller.ts   # Main controller
│   │   ├── app.module.ts       # Main module
│   │   ├── app.service.ts      # Main service
│   │   └── main.ts             # Entry point
│   ├── test/                    # Tests
│   └── package.json            # Backend dependencies
│
├── app.json                      # Expo configuration
├── package.json                  # Frontend dependencies
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

### Key Files Explanation

#### `app/_layout.tsx`
- Root layout component that wraps the entire application
- Sets up `ClerkProvider` for authentication
- Initializes `AuthProvider` for global auth state
- Configures token caching with SecureStore
- Handles splash screen display

#### `context/AuthContext.tsx`
- Manages global authentication state
- Handles user session initialization
- Manages onboarding flow
- Provides navigation protection logic
- Exposes auth state to all components

#### `api/api.ts`
- Configures Axios instance with base URL
- Sets up request interceptor for automatic token injection
- Configures response interceptor for error handling
- Centralizes API configuration

#### `app/(auth)/sign-in.tsx` & `sign-up.tsx`
- Authentication screens with multiple OAuth options
- Google OAuth integration (Android & iOS)
- Apple Sign In integration (iOS only)
- Email/password authentication
- Error handling and loading states

---

## ✨ Features

### Authentication Features

- ✅ **Email/Password Authentication**
  - Secure email and password login
  - Email verification
  - Password reset functionality

- ✅ **Google OAuth**
  - Seamless Google sign-in on Android and iOS
  - Automatic account creation
  - Secure token management

- ✅ **Apple Sign In**
  - Native Apple Sign In on iOS
  - Privacy-focused authentication
  - Seamless user experience

- ✅ **Session Management**
  - Persistent sessions
  - Secure token storage
  - Automatic token refresh
  - Session expiration handling

### User Experience Features

- ✅ **Onboarding Flow**
  - Guided onboarding for new users
  - User preference collection
  - First-time user experience

- ✅ **Dashboard**
  - Health metrics overview
  - Quick access to features
  - Personalized insights

- ✅ **Navigation**
  - Protected routes
  - Smooth transitions
  - Deep linking support

### Security Features

- ✅ **Secure Storage**
  - Encrypted token storage
  - Secure credential management
  - Protected user data

- ✅ **API Security**
  - JWT token authentication
  - Automatic token injection
  - Secure API communication

---

## 🔐 Authentication Flow

### Sign In Flow

1. **User initiates sign-in**
   - User selects authentication method (Email/Password, Google, or Apple)
   - App displays appropriate authentication screen

2. **Authentication process**
   - **Email/Password**: Clerk validates credentials
   - **Google OAuth**: Redirects to Google, user authorizes, callback handled
   - **Apple Sign In**: Native Apple authentication flow

3. **Session creation**
   - Clerk creates user session
   - JWT token generated
   - Token stored in SecureStore

4. **State updates**
   - AuthContext updates with user data
   - Navigation redirects based on onboarding status
   - API interceptors configured with token

5. **Navigation**
   - If onboarding incomplete → Onboarding screen
   - If onboarding complete → Dashboard

### Sign Up Flow

1. **User initiates sign-up**
   - User selects sign-up method
   - App displays sign-up screen

2. **Account creation**
   - **Email/Password**: User enters email and password, receives verification code
   - **OAuth**: Automatic account creation after OAuth flow

3. **Email verification** (Email/Password only)
   - User receives verification code
   - User enters code to verify email
   - Account activated

4. **Onboarding**
   - User completes onboarding flow
   - Onboarding status stored in user metadata
   - User redirected to dashboard

### OAuth Flow (Google/Apple)

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│   App    │         │  Clerk   │         │  Google/ │         │   App    │
│          │         │          │         │  Apple   │         │          │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │ 1. Start OAuth     │                    │                    │
     │───────────────────>│                    │                    │
     │                    │                    │                    │
     │                    │ 2. Get Auth URL    │                    │
     │                    │───────────────────>│                    │
     │                    │                    │                    │
     │                    │ 3. Return URL      │                    │
     │                    │<───────────────────│                    │
     │                    │                    │                    │
     │ 4. Open Browser    │                    │                    │
     │<───────────────────│                    │                    │
     │                    │                    │                    │
     │ 5. User Authorizes │                    │                    │
     │────────────────────────────────────────>│                    │
     │                    │                    │                    │
     │ 6. Callback URL    │                    │                    │
     │<────────────────────────────────────────│                    │
     │                    │                    │                    │
     │ 7. Handle Callback │                    │                    │
     │───────────────────>│                    │                    │
     │                    │                    │                    │
     │ 8. Create Session  │                    │                    │
     │                    │                    │                    │
     │ 9. Return Token    │                    │                    │
     │<───────────────────│                    │                    │
     │                    │                    │                    │
     │ 10. Store Token    │                    │                    │
     │     & Navigate     │                    │                    │
     │                    │                    │                    │
```

---

## 🔌 API Integration

### API Configuration

The application uses Axios for API communication with the following configuration:

- **Base URL**: Configured via `EXPO_PUBLIC_API_BASE_URL` environment variable
- **Timeout**: 10 seconds
- **Headers**: JSON content type
- **Authentication**: Bearer token in Authorization header

### API Interceptors

#### Request Interceptor
- Automatically attaches JWT token from SecureStore
- Adds Authorization header to all requests
- Handles token retrieval errors

#### Response Interceptor
- Logs API errors
- Handles authentication errors
- Provides error context for debugging

### API Structure

```typescript
// api/api.ts
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
```

### API Request Examples

```typescript
// api/request/authRequests.ts
import api from '../api';

export const getUserProfile = async () => {
  const response = await api.get('/user/profile');
  return response.data;
};

export const updateUserProfile = async (data: UserProfile) => {
  const response = await api.put('/user/profile', data);
  return response.data;
};
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **iOS Development** (for iOS): Xcode and CocoaPods
- **Android Development** (for Android): Android Studio and JDK

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Health-Care-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies** (iOS only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Create environment file**
   ```bash
   cp .env.example .env
   ```

5. **Configure environment variables**
   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   EXPO_PUBLIC_API_BASE_URL=your_api_base_url
   ```

6. **Start the development server**
   ```bash
   npm start
   ```

### Running on Devices

#### iOS
```bash
npm run ios
```

#### Android
```bash
npm run android
```

#### Web
```bash
npm run web
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://your-api-url.com/api

# Apple Authentication (iOS)
APPLE_TEAM_ID=your_apple_team_id
```

### Expo Configuration (`app.json`)

Key configuration options:

```json
{
  "expo": {
    "name": "Health-Care-App",
    "slug": "Health-Care-App",
    "scheme": "healthcareapp",
    "ios": {
      "bundleIdentifier": "com.anonymous.HealthCareApp",
      "usesAppleSignIn": true
    },
    "android": {
      "package": "com.anonymous.HealthCareApp",
      "intentFilters": [...]
    }
  }
}
```

### Clerk Dashboard Configuration

1. **Create Clerk Account**
   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application

2. **Configure OAuth Providers**
   - Enable Google OAuth
   - Enable Apple Sign In (iOS)
   - Add redirect URLs:
     - `healthcareapp://oauth`
     - `exp://127.0.0.1:8081` (development)

3. **Get Publishable Key**
   - Copy publishable key from Clerk dashboard
   - Add to `.env` file

### Android Configuration

1. **Configure OAuth in Google Cloud Console**
   - Create OAuth 2.0 client ID for Android
   - Add package name and SHA-1 certificate fingerprint
   - Configure in Clerk dashboard

2. **Update AndroidManifest.xml**
   - Intent filters for deep linking are already configured
   - Verify package name matches `app.json`

### iOS Configuration

1. **Configure Apple Sign In**
   - Enable Sign in with Apple in Apple Developer account
   - Configure in Clerk dashboard
   - Update `appleTeamId` in `app.json`

2. **Configure OAuth in Google Cloud Console**
   - Create OAuth 2.0 client ID for iOS
   - Add bundle identifier
   - Configure in Clerk dashboard

---

## 💻 Development

### Development Workflow

1. **Start development server**
   ```bash
   npm start
   ```

2. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

3. **Make changes**
   - Edit files in `app/` directory
   - Changes reflect immediately (Fast Refresh)

4. **Test authentication**
   - Test email/password flow
   - Test Google OAuth
   - Test Apple Sign In (iOS only)

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React Native
- **Prettier**: Code formatting
- **Naming**: PascalCase for components, camelCase for functions

### Project Scripts

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Debugging

#### React Native Debugger
- Enable debugger in Expo Dev Tools
- Use Chrome DevTools for debugging
- Inspect network requests

#### Logging
- Use `console.log()` for debugging
- Check Expo Dev Tools for logs
- Use React Native Debugger for detailed inspection

---

## 🏗️ Building for Production

### Pre-build Steps

1. **Update version**
   - Update version in `app.json`
   - Update version in `package.json`

2. **Configure environment**
   - Set production environment variables
   - Update API base URL
   - Verify Clerk configuration

3. **Prebuild native projects**
   ```bash
   npx expo prebuild --clean
   ```

### iOS Build

1. **Build with EAS**
   ```bash
   eas build --platform ios
   ```

2. **Or build locally**
   ```bash
   cd ios
   xcodebuild -workspace HealthCareApp.xcworkspace -scheme HealthCareApp -configuration Release
   ```

### Android Build

1. **Build with EAS**
   ```bash
   eas build --platform android
   ```

2. **Or build locally**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

### Environment-Specific Builds

```bash
# Development build
eas build --profile development --platform ios

# Staging build
eas build --profile staging --platform android

# Production build
eas build --profile production --platform all
```

---

## 🧪 Testing

### Unit Testing

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Integration Testing

- Test authentication flows
- Test API integration
- Test navigation flows
- Test error handling

### Manual Testing Checklist

- [ ] Email/password authentication
- [ ] Google OAuth (Android)
- [ ] Google OAuth (iOS)
- [ ] Apple Sign In (iOS)
- [ ] Session persistence
- [ ] Token refresh
- [ ] Navigation protection
- [ ] Onboarding flow
- [ ] API requests
- [ ] Error handling

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Clerk Key Not Found
**Problem**: "Clerk Publishable Key not found" error

**Solution**:
- Verify `.env` file exists
- Check `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- Restart development server
- Clear Expo cache: `expo start -c`

#### 2. OAuth Redirect Not Working
**Problem**: OAuth callback not redirecting to app

**Solution**:
- Verify scheme in `app.json` matches Clerk configuration
- Check AndroidManifest.xml has intent filters
- Verify redirect URLs in Clerk dashboard
- Rebuild native projects: `npx expo prebuild --clean`

#### 3. Apple Sign In Not Showing
**Problem**: Apple Sign In button not appearing

**Solution**:
- Verify `usesAppleSignIn: true` in `app.json`
- Check iOS device/simulator (not available on Android)
- Verify Apple Team ID is configured
- Rebuild iOS project

#### 4. Token Not Persisting
**Problem**: User logged out after app restart

**Solution**:
- Verify SecureStore is working
- Check token cache configuration
- Verify Clerk session is valid
- Check token expiration

#### 5. API Requests Failing
**Problem**: API requests returning 401/403

**Solution**:
- Verify token is being sent in headers
- Check token is valid and not expired
- Verify API base URL is correct
- Check API interceptors are working

### Debugging Tips

1. **Check Logs**
   - Expo Dev Tools console
   - React Native Debugger
   - Device logs (Android: `adb logcat`, iOS: Xcode console)

2. **Verify Configuration**
   - Environment variables
   - Clerk dashboard settings
   - OAuth provider configurations

3. **Clear Cache**
   ```bash
   # Clear Expo cache
   expo start -c
   
   # Clear Metro bundler cache
   npm start -- --reset-cache
   
   # Clear node modules
   rm -rf node_modules
   npm install
   ```

---

## 📱 Platform-Specific Notes

### iOS

- **Apple Sign In**: Only available on iOS devices
- **Bundle Identifier**: Must match Apple Developer account
- **Capabilities**: Sign in with Apple must be enabled
- **Testing**: Requires physical device or simulator with iOS 13+

### Android

- **Google OAuth**: Works on both Android and iOS
- **Package Name**: Must match Google Cloud Console configuration
- **SHA-1 Fingerprint**: Required for Google OAuth
- **Intent Filters**: Configured for deep linking

---

## 🤝 Contributing

### Contribution Guidelines

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow code style guidelines
   - Write tests for new features
   - Update documentation

4. **Commit your changes**
   ```bash
   git commit -m "Add your feature description"
   ```

5. **Push to branch**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Describe your changes
   - Reference any related issues
   - Request review from maintainers

### Code Review Process

1. **Automated Checks**
   - TypeScript compilation
   - ESLint checks
   - Test execution

2. **Manual Review**
   - Code quality
   - Architecture decisions
   - Security considerations

3. **Approval**
   - At least one approval required
   - All checks must pass
   - No conflicts with main branch

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- [Clerk](https://clerk.com) for authentication services
- [Expo](https://expo.dev) for the development platform
- [React Native](https://reactnative.dev) for the mobile framework
- [NestJS](https://nestjs.com) for the backend framework

---

## 📞 Support

For support, email support@healthify.app or open an issue in the repository.

---

## 🔮 Future Enhancements

- [ ] AI-powered health insights
- [ ] Appointment scheduling
- [ ] Health metrics tracking
- [ ] Push notifications
- [ ] Offline mode
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Biometric authentication
- [ ] Health data export
- [ ] Integration with health devices

---

<div align="center">

**Built with ❤️ by the Healthify Team**

[Documentation](https://docs.healthify.app) • [Website](https://healthify.app) • [Support](https://support.healthify.app)

</div>
