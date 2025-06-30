# Build WidgetLearn - Spotify Music Player Widget Documentation

## Project Overview

**Build WidgetLearn** is a modern Next.js application that creates interactive music player widgets with Spotify integration. The application displays beautiful music cards with album artwork and provides real-time synchronization with your Spotify playback.

### Technology Stack
- **Framework**: Next.js 15.3.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Authentication**: Spotify OAuth 2.0 with PKCE flow
- **Runtime**: React 19

---

## API Integration

### Spotify Web API

The application integrates with the Spotify Web API to provide real-time music data and playback control.

#### Authentication Flow (PKCE)
The app uses the Authorization Code with PKCE (Proof Key for Code Exchange) flow for secure authentication without exposing client secrets.

**Required Scopes:**
- `user-read-playback-state` - Access currently playing track
- `user-read-currently-playing` - Read current playback status

**Environment Variables Required:**
```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
```

#### API Endpoints Used

1. **Currently Playing Track**
   - Endpoint: `https://api.spotify.com/v1/me/player/currently-playing`
   - Method: GET
   - Headers: `Authorization: Bearer {access_token}`
   - Response: Current track information including title, artist, album artwork

2. **Playback Queue**
   - Endpoint: `https://api.spotify.com/v1/me/player/queue`
   - Method: GET
   - Headers: `Authorization: Bearer {access_token}`
   - Response: Array of upcoming tracks in the user's queue

3. **Token Exchange**
   - Endpoint: `https://accounts.spotify.com/api/token`
   - Method: POST
   - Content-Type: `application/x-www-form-urlencoded`
   - Purpose: Exchange authorization code for access and refresh tokens

---

## Components and Widgets

### Core Components

#### 1. MusicCard Widget
**Location**: `src/app/MusicCard.tsx`

A static music card component that displays a fixed track with album artwork.

**Features:**
- Fixed album cover display
- Static track information ("use me" by "skaiwater")
- Gradient text effects
- Responsive design with backdrop blur

**Visual Elements:**
- Card size: 192px × 240px (w-48 h-60)
- Background: Semi-transparent slate with backdrop blur
- Album cover: 160px × 160px (w-40 h-40)
- Typography: Mono font for title, gradient text for artist

#### 2. QueueCard Widget
**Location**: `src/app/QueueCard.tsx`

An interactive music card that connects to Spotify and displays real-time playback information.

**Features:**
- Real-time Spotify integration
- Dynamic track title and artist updates
- Spotify authentication trigger
- Progress bar display
- Album cover carousel via Qcovers component

**State Management:**
- `trackTitle`: Current playing track title (default: "Hells")
- `trackArtist`: Current playing artist (default: "skaiwater")

**Authentication:**
- Click on avatar image triggers Spotify OAuth flow
- Stores code verifier in localStorage
- Redirects to Spotify authorization

**Data Polling:**
- Polls Spotify API every 5 seconds for current track
- Updates UI when track changes
- Graceful error handling for API failures

#### 3. Qcovers Widget
**Location**: `src/app/Qcovers.tsx`

A dynamic album cover carousel that displays the current track and upcoming queue items.

**Features:**
- Three-layer album cover display
- Real-time queue updates
- Fallback images for missing artwork
- Z-index layering for depth effect

**Cover Layers:**
1. **Now Playing** (z-10): Currently playing track cover
2. **Next in Queue** (z-8): Next track in queue
3. **Third Track** (z-4): Second upcoming track

**Fallback Images:**
- Default now playing: skaiwater - pink Print
- Default next: Destroy Lonely - If Looks Could Kill
- Default third: Alternative cover from Spotify CDN

**Update Logic:**
- Polls every 2 seconds for changes
- Only updates when track ID changes
- Logs queue information to console for debugging

#### 4. Progress Component
**Location**: `src/components/ui/progress.tsx`

A reusable progress bar component built on Radix UI primitives.

**Features:**
- Radix UI Progress primitive integration
- Customizable styling via className
- Smooth transitions
- Accessible by default

**Props:**
- `value`: Progress percentage (0-100)
- `className`: Additional CSS classes
- Standard React component props

#### 5. Button Component
**Location**: `src/app/button.tsx`

A comprehensive button component with multiple variants and sizes using class-variance-authority.

**Variants:**
- `default`: Primary button style
- `destructive`: Error/danger actions
- `outline`: Bordered button
- `secondary`: Secondary actions
- `ghost`: Minimal styling
- `link`: Text link appearance

**Sizes:**
- `default`: Standard height (36px)
- `sm`: Small height (32px)
- `lg`: Large height (40px)
- `icon`: Square icon button (36px)

#### 6. OAuth Callback Handler
**Location**: `src/app/callback/page.tsx`

Handles the Spotify OAuth redirect and token exchange.

**Process Flow:**
1. Extracts authorization code from URL parameters
2. Retrieves code verifier from localStorage
3. Exchanges code for access and refresh tokens
4. Stores tokens in localStorage
5. Redirects back to main application

**Error Handling:**
- Missing authorization code
- Missing code verifier
- Token exchange failures
- User feedback via status messages

---

## Utility Functions

### Authentication Utilities
**Location**: `src/lib/spotifyAuth.ts`

#### `generateCodeVerifier(length: number = 128): string`
Generates a cryptographically secure random string for PKCE flow.
- **Parameters**: `length` - Length of verifier (default: 128)
- **Returns**: Random string using URL-safe characters
- **Purpose**: Creates the code verifier for PKCE authentication

#### `generateCodeChallenge(verifier: string): Promise<string>`
Creates a SHA256 hash of the code verifier for secure transmission.
- **Parameters**: `verifier` - The code verifier string
- **Returns**: Base64 URL-safe encoded hash
- **Purpose**: Generates code challenge for PKCE flow

#### `buildSpotifyAuthUrl(params): string`
Constructs the complete Spotify authorization URL.
- **Parameters**:
  - `clientId`: Spotify application client ID
  - `redirectUri`: OAuth callback URL
  - `codeChallenge`: Generated code challenge
  - `scopes`: Array of requested permissions
- **Returns**: Complete authorization URL
- **Purpose**: Builds the URL to redirect users to Spotify login

#### `exchangeCodeForToken(params): Promise<any>`
Exchanges the authorization code for access and refresh tokens.
- **Parameters**:
  - `clientId`: Spotify application client ID
  - `code`: Authorization code from callback
  - `redirectUri`: OAuth callback URL
  - `codeVerifier`: Original code verifier
- **Returns**: Token response object with access_token and refresh_token
- **Purpose**: Completes the OAuth flow by getting usable tokens

### CSS Utilities
**Location**: `src/lib/utils.ts`

#### `cn(...inputs: ClassValue[])`
Combines and merges CSS classes using clsx and tailwind-merge.
- **Parameters**: Variable number of class values
- **Returns**: Optimized class string
- **Purpose**: Prevents Tailwind class conflicts and optimizes CSS output

---

## Application Structure

### Layout and Routing

#### Root Layout
**Location**: `src/app/layout.tsx`
- Basic HTML structure
- Imports global CSS styles
- Provides React context for child components

#### Main Page
**Location**: `src/app/page.tsx`
- Displays MusicCard and QueueCard components
- Animated background using Bocchi the Rock GIF
- Flexbox layout for centering content

#### OAuth Callback
**Location**: `src/app/callback/page.tsx`
- Handles Spotify authentication redirect
- Client-side token processing
- Automatic redirect back to main app

### Styling System

#### Global Styles
**Location**: `src/app/globals.css`
- Tailwind CSS imports and configuration
- Custom CSS variables and overrides
- Base styling for the application

#### Component Styling
- Tailwind CSS utility classes
- Backdrop blur effects for modern glass-morphism
- Gradient text effects
- Shadow and layering for depth
- Responsive design principles

---

## Data Flow

### Authentication Flow
1. User clicks avatar on QueueCard
2. Code verifier generated and stored in localStorage
3. User redirected to Spotify authorization
4. Spotify redirects to `/callback` with authorization code
5. Callback exchanges code for tokens
6. Tokens stored in localStorage
7. User redirected back to main application

### Real-time Updates
1. QueueCard polls Spotify API every 5 seconds
2. Current track information updates in real-time
3. Qcovers polls every 2 seconds for queue changes
4. Album artwork updates when tracks change
5. Progress bar displays current playback position

### Error Handling
- Graceful degradation when API calls fail
- Fallback images for missing album artwork
- Default track information when not authenticated
- Console logging for debugging queue information

---

## Setup and Configuration

### Prerequisites
1. Spotify Developer Account
2. Spotify Application with registered redirect URI
3. Node.js and npm/yarn installed

### Environment Configuration
Create `.env.local` file with:
```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
```

### Spotify App Configuration
- **Redirect URI**: `http://127.0.0.1:3000/callback`
- **Required Scopes**: `user-read-playback-state`, `user-read-currently-playing`

### Development
```bash
npm run dev
# or
yarn dev
```

---

## Future Enhancements

Based on `idea.txt`, planned features include:
- Click to pause/play functionality
- Double-click to restart current song
- Triple-click for shuffle and skip
- Mouse hover effects for album covers
- Interactive album cover controls

---

## Security Considerations

- Uses PKCE flow instead of implicit grant for enhanced security
- Client secret not exposed to frontend
- Tokens stored in localStorage (consider httpOnly cookies for production)
- Code verifier generated with cryptographically secure random strings
- Proper error handling to prevent information leakage