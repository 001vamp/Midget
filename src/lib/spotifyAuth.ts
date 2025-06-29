// spotifyAuth.ts
// This file helps you log in to Spotify using PKCE (the safe way for web apps)
// It has functions to make the code verifier, code challenge, and handle the login flow

// Make a random string for the code verifier (like a password)
export function generateCodeVerifier(length: number = 128): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let verifier = '';
    for (let i = 0; i < length; i++) {
        verifier += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return verifier;
}

// Turn the code verifier into a code challenge (hash it and make it URL safe)
export async function generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    return base64;
}

// Build the Spotify login URL with all the right info
export function buildSpotifyAuthUrl({ clientId, redirectUri, codeChallenge, scopes }: { clientId: string; redirectUri: string; codeChallenge: string; scopes: string[] }): string {
    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        scope: scopes.join(' '),
    });
    return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Exchange the code for an access token (call this on your callback page)
export async function exchangeCodeForToken({ clientId, code, redirectUri, codeVerifier }: { clientId: string; code: string; redirectUri: string; codeVerifier: string }): Promise<any> {
    const params = new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
    });
    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
    });
    if (!res.ok) throw new Error('Failed to get token');
    return await res.json(); // { access_token, refresh_token, ... }
} 