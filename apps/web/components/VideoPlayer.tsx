"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";

interface VideoPlayerProps {
  url: string;
  onProgress?: (state: { playedSeconds: number; played: number; loadedSeconds: number; loaded: number }) => void;
  onEnded?: () => void;
}

export default function VideoPlayer({ url, onProgress, onEnded }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isClient, setIsClient] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div className="w-full aspect-video bg-gray-900 rounded-xl animate-pulse"></div>;

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-video shadow-2xl">
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={playing}
        playbackRate={playbackRate}
        controls={true}
        onProgress={onProgress}
        onEnded={onEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload',
            }
          }
        }}
      />
    </div>
  );
}
