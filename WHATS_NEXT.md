# What's Next - Production Roadmap

## Immediate Next Steps (Priority 1)

### 1. Environment & Security Hardening
- [ ] **Move from localStorage to secure token storage**
  - Implement httpOnly cookies for token storage
  - Add token refresh mechanism before expiration
  - Consider using next-auth or similar for session management

- [ ] **Environment Configuration**
  ```bash
  # Create production environment variables
  SPOTIFY_CLIENT_ID=your_production_client_id
  SPOTIFY_CLIENT_SECRET=your_client_secret  # For server-side token refresh
  NEXTAUTH_URL=https://yourdomain.com
  NEXTAUTH_SECRET=your_nextauth_secret
  ```

- [ ] **Add Error Boundaries**
  - Wrap components in React Error Boundaries
  - Add fallback UI for API failures
  - Implement proper error logging (consider Sentry)

### 2. Code Quality & Performance
- [ ] **Add TypeScript strict mode**
  ```json
  // tsconfig.json
  {
    "compilerOptions": {
      "strict": true,
      "noUncheckedIndexedAccess": true
    }
  }
  ```

- [ ] **Implement proper loading states**
  - Add skeleton components for loading data
  - Replace hardcoded fallbacks with proper loading indicators
  - Add suspense boundaries where appropriate

- [ ] **Optimize API calls**
  - Implement proper caching with SWR or React Query
  - Add request deduplication
  - Consider WebSocket connection for real-time updates

### 3. User Experience Enhancements
- [ ] **Implement the features from idea.txt**
  - Single click: Pause/Play toggle
  - Double click: Restart current song
  - Triple click: Shuffle and skip
  - Mouse hover: Show next album cover

- [ ] **Add responsive design**
  - Test on mobile devices
  - Implement touch gestures for mobile
  - Add proper viewport meta tags

- [ ] **Accessibility improvements**
  - Add ARIA labels to interactive elements
  - Ensure keyboard navigation works
  - Add screen reader support

## Production Deployment (Priority 2)

### 1. Infrastructure Setup
- [ ] **Choose deployment platform**
  - **Recommended**: Vercel (seamless Next.js integration)
  - **Alternative**: Netlify, Railway, or AWS Amplify

- [ ] **Domain and SSL**
  - Purchase custom domain
  - Configure DNS settings
  - Enable HTTPS (automatic with most platforms)

- [ ] **Database consideration**
  - For user preferences: PostgreSQL with Prisma
  - For caching: Redis
  - For analytics: Consider Mixpanel or PostHog

### 2. Monitoring & Analytics
- [ ] **Error tracking**
  ```bash
  npm install @sentry/nextjs
  ```

- [ ] **Performance monitoring**
  - Add Web Vitals tracking
  - Implement real user monitoring
  - Set up uptime monitoring

- [ ] **User analytics**
  - Track user interactions with widgets
  - Monitor API usage patterns
  - A/B test different widget designs

### 3. Content Delivery
- [ ] **Image optimization**
  - Use Next.js Image component for album artwork
  - Implement proper caching headers
  - Consider CDN for static assets

## Advanced Features (Priority 3)

### 1. Widget Customization
- [ ] **Theme system**
  - Light/dark mode toggle
  - Custom color schemes
  - Widget size variations

- [ ] **Widget marketplace**
  - Multiple widget designs
  - User-created themes
  - Export/import widget configurations

### 2. Social Features
- [ ] **Sharing capabilities**
  - Share currently playing track
  - Share widget configurations
  - Social media integration

- [ ] **Multi-user support**
  - User accounts and profiles
  - Save favorite widgets
  - Follow other users' music

---

# Migrating to Spotify Web Playback SDK

## Why Migrate to Web Playback SDK?

The Spotify Web Playback SDK provides several advantages over the current Web API approach:

### Current Limitations (Web API Only)
- **Read-only access**: Can only read playback state, not control it
- **External dependency**: Requires Spotify app to be playing
- **Limited control**: No direct playback control from your app
- **Polling required**: Must constantly poll for updates

### Web Playback SDK Benefits
- **Full playback control**: Play, pause, skip, seek directly from your app
- **Real-time updates**: WebSocket-based real-time playback state
- **Independent playback**: Your app becomes a Spotify Connect device
- **Better UX**: Seamless control without external dependencies

## Migration Strategy

### Phase 1: Setup and Integration

#### 1. Update Spotify App Settings
```bash
# Required scopes for Web Playback SDK
- user-read-playback-state
- user-modify-playback-state  # NEW
- streaming                   # NEW
- user-read-email
- user-read-private
```

#### 2. Install Web Playback SDK
```typescript
// Add to your HTML head or load dynamically
<script src="https://sdk.scdn.co/spotify-player.js"></script>

// Or use the npm package
npm install @spotify/web-playback-sdk
```

#### 3. Create Player Context
```typescript
// src/contexts/SpotifyPlayerContext.tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react';

interface SpotifyPlayerContextType {
  player: Spotify.Player | null;
  deviceId: string | null;
  isReady: boolean;
  currentTrack: Spotify.Track | null;
  isPlaying: boolean;
  position: number;
  duration: number;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | null>(null);

export function SpotifyPlayerProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Spotify.Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Initialize player when access token is available
    const token = localStorage.getItem('spotify_access_token');
    if (!token) return;

    const initializePlayer = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Build WidgetLearn Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(token);
        },
        volume: 0.5
      });

      // Player event listeners
      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setIsReady(true);
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setIsReady(false);
      });

      spotifyPlayer.addListener('player_state_changed', (state) => {
        if (!state) return;
        
        setCurrentTrack(state.track_window.current_track);
        setIsPlaying(!state.paused);
        setPosition(state.position);
        setDuration(state.duration);
      });

      // Connect to the player
      spotifyPlayer.connect().then((success) => {
        if (success) {
          console.log('Successfully connected to Spotify!');
          setPlayer(spotifyPlayer);
        }
      });
    };

    if (window.Spotify) {
      initializePlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initializePlayer;
    }

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, []);

  return (
    <SpotifyPlayerContext.Provider value={{
      player,
      deviceId,
      isReady,
      currentTrack,
      isPlaying,
      position,
      duration
    }}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
}

export const useSpotifyPlayer = () => {
  const context = useContext(SpotifyPlayerContext);
  if (!context) {
    throw new Error('useSpotifyPlayer must be used within SpotifyPlayerProvider');
  }
  return context;
};
```

### Phase 2: Update Components

#### 1. Enhanced QueueCard with Playback Control
```typescript
// src/app/QueueCard.tsx - Updated version
'use client'
import { useSpotifyPlayer } from '@/contexts/SpotifyPlayerContext';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';

export default function QueueCard() {
  const { 
    player, 
    deviceId, 
    isReady, 
    currentTrack, 
    isPlaying, 
    position, 
    duration 
  } = useSpotifyPlayer();

  const handlePlayPause = async () => {
    if (!player) return;
    
    if (isPlaying) {
      await player.pause();
    } else {
      await player.resume();
    }
  };

  const handleSkip = async (direction: 'next' | 'previous') => {
    if (!player) return;
    
    if (direction === 'next') {
      await player.nextTrack();
    } else {
      await player.previousTrack();
    }
  };

  const handleSeek = async (positionMs: number) => {
    if (!player) return;
    await player.seek(positionMs);
  };

  // Rest of your component with enhanced controls
  return (
    <div className="bg-zinc-900/45 w-48 h-60 rounded-xl shadow-lg backdrop-blur-xs flex flex-col items-center">
      {/* Album cover with click-to-play */}
      <div 
        className="cursor-pointer"
        onClick={handlePlayPause}
      >
        {currentTrack?.album?.images?.[0]?.url && (
          <img 
            src={currentTrack.album.images[0].url} 
            alt={currentTrack.name}
            className="w-30 h-30 rounded-md mt-4"
          />
        )}
      </div>

      {/* Playback controls */}
      <div className="flex items-center space-x-2 mt-2">
        <button onClick={() => handleSkip('previous')}>
          <SkipBack className="w-4 h-4 text-white" />
        </button>
        <button onClick={handlePlayPause}>
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white" />
          )}
        </button>
        <button onClick={() => handleSkip('next')}>
          <SkipForward className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Interactive progress bar */}
      <div 
        className="w-32 h-2 bg-gray-700 rounded mt-2 cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = x / rect.width;
          handleSeek(Math.floor(percentage * duration));
        }}
      >
        <div 
          className="h-2 bg-white rounded"
          style={{ width: `${(position / duration) * 100}%` }}
        />
      </div>

      {/* Track info */}
      <div className="text-white text-center mt-2">
        <div className="text-sm font-semibold">{currentTrack?.name}</div>
        <div className="text-xs text-gray-400">
          {currentTrack?.artists?.[0]?.name}
        </div>
      </div>
    </div>
  );
}
```

#### 2. Real-time Queue Updates
```typescript
// src/hooks/useSpotifyQueue.ts
import { useState, useEffect } from 'react';
import { useSpotifyPlayer } from '@/contexts/SpotifyPlayerContext';

export function useSpotifyQueue() {
  const [queue, setQueue] = useState<Spotify.Track[]>([]);
  const { deviceId } = useSpotifyPlayer();

  useEffect(() => {
    const fetchQueue = async () => {
      const token = localStorage.getItem('spotify_access_token');
      if (!token || !deviceId) return;

      try {
        const response = await fetch('https://api.spotify.com/v1/me/player/queue', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setQueue(data.queue || []);
        }
      } catch (error) {
        console.error('Failed to fetch queue:', error);
      }
    };

    // Fetch queue less frequently since we have real-time updates for current track
    const interval = setInterval(fetchQueue, 10000); // Every 10 seconds
    fetchQueue();

    return () => clearInterval(interval);
  }, [deviceId]);

  return queue;
}
```

### Phase 3: Advanced Features

#### 1. Device Transfer
```typescript
// Transfer playback to your web player
const transferPlayback = async (deviceId: string) => {
  const token = localStorage.getItem('spotify_access_token');
  
  await fetch('https://api.spotify.com/v1/me/player', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      device_ids: [deviceId],
      play: true
    })
  });
};
```

#### 2. Volume Control
```typescript
const VolumeControl = () => {
  const { player } = useSpotifyPlayer();
  const [volume, setVolume] = useState(0.5);

  const handleVolumeChange = async (newVolume: number) => {
    if (!player) return;
    await player.setVolume(newVolume);
    setVolume(newVolume);
  };

  return (
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={volume}
      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
    />
  );
};
```

## Migration Timeline

### Week 1: Foundation
- Set up Web Playback SDK
- Create player context
- Basic play/pause functionality

### Week 2: Enhanced Controls
- Add skip controls
- Implement seek functionality
- Update progress tracking

### Week 3: Advanced Features
- Device transfer
- Volume control
- Queue management

### Week 4: Polish & Testing
- Error handling
- Loading states
- Cross-browser testing

## Testing Strategy

### 1. Development Testing
```bash
# Test with different Spotify Premium accounts
# Test device switching
# Test network interruptions
# Test token expiration
```

### 2. Browser Compatibility
- Chrome (primary support)
- Firefox (limited support)
- Safari (limited support)
- Mobile browsers (test thoroughly)

### 3. Edge Cases
- No internet connection
- Spotify Premium required
- Multiple device conflicts
- Token refresh scenarios

## Production Considerations

### 1. Premium Account Requirement
- Web Playback SDK requires Spotify Premium
- Add clear messaging for free users
- Consider fallback to read-only mode

### 2. Rate Limiting
- Implement exponential backoff
- Cache responses appropriately
- Monitor API usage

### 3. Performance
- Lazy load SDK
- Optimize re-renders
- Consider service worker for offline handling

This migration will transform your app from a passive music display into a full-featured Spotify player widget, giving users complete control over their music directly from your interface.