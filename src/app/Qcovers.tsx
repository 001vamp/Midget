'use client'
import { useEffect, useState } from 'react';

export default function Qcovers() {
    // State to hold the array of cover URLs: [nowPlaying, next, 3rd]
    const [covers, setCovers] = useState<string[]>([]);
    // Track the current song's Spotify ID so we only update on change
    const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        async function fetchCovers() {
            const accessToken = localStorage.getItem('spotify_access_token');
            if (!accessToken) return;
            try {
                // Fetch currently playing track
                const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                if (!res.ok) return;
                const data = await res.json();
                const nowPlayingId = data?.item?.id;
                const nowPlayingCover = data?.item?.album?.images?.[0]?.url;
                // Only update if the song has changed
                if (nowPlayingId && nowPlayingId !== currentTrackId) {
                    setCurrentTrackId(nowPlayingId);
                    // Fetch the queue
                    const queueRes = await fetch('https://api.spotify.com/v1/me/player/queue', {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    let nextCover = null;
                    let thirdCover = null;
                    if (queueRes.ok) {
                        const queueData = await queueRes.json();
                        // Debug: log the full queue array so you can see what Spotify is returning
                        console.log('Spotify queue:', queueData?.queue);
                        // Log the position and name of each track in the queue
                        if (Array.isArray(queueData?.queue)) {
                            queueData.queue.forEach((track: any, idx: number) => {
                                // Print the position (1-based) and track name
                                console.log(`Queue position ${idx + 1}: ${track?.name} (id: ${track?.id})`);
                            });
                        }
                        nextCover = queueData?.queue?.[0]?.album?.images?.[0]?.url;
                        thirdCover = queueData?.queue?.[1]?.album?.images?.[0]?.url;
                    }
                    // Build the covers array: [nowPlaying, next, third]
                    setCovers([
                        nowPlayingCover || 'https://media.pitchfork.com/photos/682ca1b181b971ad1da2139a/master/w_1280%2Cc_limit/skaiwater-pinkPrint.jpeg',
                        nextCover || 'https://media.pitchfork.com/photos/6453ab5e575213cbefca6d9a/master/w_1280%2Cc_limit/Destroy-Lonely-If-Looks-Could-Kill.jpg',
                        thirdCover || 'https://i.scdn.co/image/ab67616d0000b273f7c26ba8a592c4921cb083b3'
                    ]);
                }
            } catch (e) {
                // If error, do nothing (could add fallback)
            }
        }
        // Poll every 2 seconds
        interval = setInterval(fetchCovers, 2000);
        fetchCovers(); // Run once immediately
        return () => clearInterval(interval); // Cleanup on unmount
    }, [currentTrackId]);

    return (
        <div>
            {/* now playing cover (dynamic from Spotify) */}
            <div id="AlbumCover" className="bg-contain bg-center w-30 h-30 rounded-md mt-4 absolute z-10 top-0 left-4 shadow-[1px_0px_4px_2px] shadow-blue-500/50"
                style={{ backgroundImage: `url('${covers[0]}')` }}></div>

            {/* next in queue cover (dynamic if available) */}
            <div id="AlbumCover" className="bg-contain bg-center w-28 h-28 shadow-[10px_7px_10px_rgba(3,5,30,0.35)] rounded-md mt-2 absolute z-8 top-8 bottom-0 right-0 left-11"
                style={{ backgroundImage: `url('${covers[1]}')` }}></div>
            {/* 3rd in queue cover (dynamic if available) */}
            <div id="AlbumCover" className="bg-contain bg-center w-26 h-26 rounded-md mt-2 absolute z-4 top-14 bottom-0 right-2 left-18  shadow-[15px_12px_10px_rgba(3,5,30,0.35)]"
                style={{ backgroundImage: `url('${covers[2]}')` }}></div>
        </div>
    );
}