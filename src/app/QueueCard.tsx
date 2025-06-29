'use client'
import Qcovers from './Qcovers';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
// Import the PKCE and Spotify helpers
import { generateCodeVerifier, generateCodeChallenge, buildSpotifyAuthUrl } from '@/lib/spotifyAuth';

export default function QueueCard() {
  // State for track info
  const [trackTitle, setTrackTitle] = useState('Hells');
  const [trackArtist, setTrackArtist] = useState('skaiwater');

  // Fetch currently playing track from Spotify
  useEffect(() => {
    let interval: NodeJS.Timeout;
    async function fetchCurrentTrack() {
      const accessToken = localStorage.getItem('spotify_access_token');
      if (!accessToken) return;
      try {
        const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        const title = data?.item?.name;
        const artist = data?.item?.artists?.[0]?.name;
        if (title) setTrackTitle(title);
        if (artist) setTrackArtist(artist);
      } catch (e) {
        // If error, do nothing
      }
    }
    interval = setInterval(fetchCurrentTrack, 5000); // poll every 5 seconds
    fetchCurrentTrack(); // run once immediately
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  // This function runs when you click the avatar
  async function handleSpotifyLogin() {
    // 1. Make a random code verifier
    const verifier = generateCodeVerifier();
    // 2. Make a code challenge from the verifier
    const challenge = await generateCodeChallenge(verifier);
    // 3. Save the verifier for later (so we can get the token after redirect)
    localStorage.setItem('spotify_code_verifier', verifier);
    // 4. Build the Spotify login URL
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!; // put your client id in .env.local
    // Force the redirectUri to /callback to match .env.local and dashboard
    const redirectUri = 'http://127.0.0.1:3000/callback';
    const scopes = ['user-read-playback-state', 'user-read-currently-playing'];
    const authUrl = buildSpotifyAuthUrl({ clientId, redirectUri, codeChallenge: challenge, scopes });
    // 5. Send the user to Spotify to log in
    window.location.href = authUrl;
  }

  return (<div id="card">
    {/* card */}

    <div className="bg-zinc-900/45 w-48 h-60 rounded-xl shadow-lg backdrop-blur-xs flex flex-col items-center">
      <Qcovers />

      {/* code for new component */}
      <div>
        {/* When you click this avatar, it starts the Spotify login */}
        <div id="loginBtn" className="bg-[url('./Hwaryun_Anime_Profile.png')] bg-contain bg-no-repeat rounded-full absolute bottom-10 right-22 w-7 h-7" onClick={handleSpotifyLogin}></div>
        <h1 className="text-white absolute bottom-11 right-12">⦮ ⦯</h1>
      </div>

      {/* Progress Bar */}
      {/*  <div className="w-30 h-2 bg-gray-700 rounded mb-2">
            <div className="h-2 bg-blue-400 rounded"></div> <h6 className="text-white text-[9px] font-light text-center ">00:00</h6>
          </div> */}

      {/* Song Title - Artist */}
      <div className="flex flex-col items-start absolute bottom-5 left-4">
        <div className="text-white text-md font-semibold">{trackTitle}</div>
        <div className="text-transparent text-xs font-light bg-linear-to-r from-zinc-50 to-neutral-950 bg-clip-text">{trackArtist}</div>
      </div>

      <Progress
        value={78}
        className="absolute bottom-4 left-19 w-24 h-2 rounded mb-2 [&>div]:bg-white [&>div]:bg-opacity-100"
      />

    </div>
  </div>
  );
}