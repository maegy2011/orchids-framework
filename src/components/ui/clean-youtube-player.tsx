"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MediaPlayer, MediaProvider, MediaPlayerInstance } from '@vidstack/react';
import { PlyrLayout, plyrLayoutIcons } from '@vidstack/react/player/layouts/plyr';
import '@vidstack/react/player/styles/base.css';
import '@vidstack/react/player/styles/plyr/theme.css';
import { 
  Lock, 
  Unlock,
  Maximize,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n-context';

interface CleanYouTubePlayerProps {
  videoId: string;
  startTime?: number;
  onReady?: (event: any) => void;
  onStateChange?: (event: any) => void;
  isLocked?: boolean;
  onLockToggle?: (locked: boolean) => void;
}

export default function CleanYouTubePlayer({ 
  videoId, 
  startTime = 0,
  onReady,
  onStateChange,
  isLocked = false,
  onLockToggle
}: CleanYouTubePlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  
  const { t } = useI18n();

  // Handle player ready
  const onVidstackReady = () => {
    if (onReady && playerRef.current) {
      const shim = {
        target: {
          getCurrentTime: () => playerRef.current?.currentTime || 0,
          getDuration: () => playerRef.current?.duration || 0,
          seekTo: (seconds: number) => { 
            if (playerRef.current) playerRef.current.currentTime = seconds; 
          },
          playVideo: () => {
            if (playerRef.current) {
              playerRef.current.play().catch(() => {});
            }
          },
          pauseVideo: () => {
            if (playerRef.current) {
              playerRef.current.pause().catch(() => {});
            }
          },
          getPlayerState: () => playerRef.current?.paused ? 2 : 1,
          unMute: () => { if (playerRef.current) playerRef.current.muted = false; },
          mute: () => { if (playerRef.current) playerRef.current.muted = true; },
          setPlaybackRate: (rate: number) => { if (playerRef.current) playerRef.current.playbackRate = rate; },
        }
      };
      onReady(shim);
    }
  };

    const handlePlayChange = (playing: boolean) => {
      setIsPlaying(playing);
      if (onStateChange) {
        onStateChange({ data: playing ? 1 : 2 });
      }
    };

    const toggleFullscreen = () => {
      if (!playerRef.current) return;
      if (playerRef.current.fullscreen.active) {
        playerRef.current.fullscreen.exit();
      } else {
        playerRef.current.fullscreen.enter();
      }
    };

  return (
    <div className="relative w-full h-full bg-black group overflow-hidden select-none">
      <MediaPlayer
        ref={playerRef}
        title="Video Player"
        src={`https://www.youtube.com/watch?v=${videoId}`}
        playsInline
        onCanPlay={onVidstackReady}
        onPlay={() => handlePlayChange(true)}
        onPause={() => handlePlayChange(false)}
        currentTime={startTime}
        className="w-full h-full"
        viewType="video"
        load="eager"
        crossOrigin
        key={videoId}
        fullscreen="provider"
      >
        <MediaProvider className="w-full h-full">
          <div className="absolute inset-0 pointer-events-none z-10" />
        </MediaProvider>
        <PlyrLayout 
          icons={plyrLayoutIcons} 
          toggleTime={true}
          clickToPlay={true}
        />

        {/* Custom Fullscreen Fallback Button (Visible only if Plyr fullscreen fails or as extra) */}
        <div className="absolute bottom-16 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md border border-white/20 transition-all"
            title="Toggle Fullscreen"
          >
            <Maximize size={20} />
          </button>
        </div>


        {/* Lock Button */}
        <div className="absolute top-4 left-4 z-30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLockToggle?.(!isLocked);
            }}
            className={cn(
              "p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 border border-white/20",
              isLocked 
                ? "bg-red-600/80 text-white opacity-100 scale-110 shadow-lg shadow-red-600/40" 
                : "bg-black/40 text-white/70 hover:bg-black/60 hover:text-white opacity-0 group-hover:opacity-100"
            )}
          >
            {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
          </button>
        </div>

        {/* Lock Overlay */}
        {isLocked && (
          <div 
            className="absolute inset-0 z-[25] cursor-default bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          />
        )}
      </MediaPlayer>
    </div>
  );
}
