'use client'
// SpotifyCallback.tsx
// This page handles the redirect from Spotify after login
// It grabs the code from the URL, gets the code_verifier, and exchanges for tokens
import { useEffect, useState } from 'react';
import { exchangeCodeForToken } from '@/lib/spotifyAuth';

export default function SpotifyCallback() {
    const [status, setStatus] = useState('Loading...');

    useEffect(() => {
        async function handleCallback() {
            // 1. Get the code from the URL
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            if (!code) {
                setStatus('No code found in URL!');
                return;
            }
            // 2. Get the code_verifier from localStorage
            const codeVerifier = localStorage.getItem('spotify_code_verifier');
            if (!codeVerifier) {
                setStatus('No code_verifier found!');
                return;
            }
            // 3. Get client ID and redirect URI from env (should be /callback)
            const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
            // Force the redirectUri to /callback to match .env.local and dashboard
            const redirectUri = 'http://127.0.0.1:3000/callback';
            try {
                // 4. Exchange the code for tokens
                const tokenData = await exchangeCodeForToken({ clientId, code, redirectUri, codeVerifier });
                // 5. Save the tokens (for now, just localStorage)
                localStorage.setItem('spotify_access_token', tokenData.access_token);
                localStorage.setItem('spotify_refresh_token', tokenData.refresh_token);
                setStatus('Spotify login successful! Redirecting...');
                setTimeout(() => {
                    window.location.replace('/');
                }, 1000); // 1 second delay so user sees the message
            } catch (err) {
                setStatus('Failed to get tokens: ' + (err as Error).message);
            }
        }
        handleCallback();
    }, []);

    return <div style={{ color: 'white', background: '#222', padding: 20 }}>{status}</div>;
} 