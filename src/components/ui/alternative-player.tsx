"use client";

import React from 'react';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import '@vidstack/react/player/styles/base.css';
import { FullscreenIcon, PlayIcon, PauseIcon, VolumeHighIcon, MuteIcon } from '@vidstack/react/icons';

interface AlternativePlayerProps {
  videoId: string;
  title?: string;
}

export default function AlternativePlayer({ videoId, title }: AlternativePlayerProps) {
  return (
    <div className="w-full h-full bg-black relative group">
      <MediaPlayer
        title={title || "Video Player"}
        src={`youtube/${videoId}`}
        playsInline
        className="w-full h-full"
      >
        <MediaProvider className="w-full h-full" />
        
        {/* Simple minimal controls overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
            <PlayIcon size={32} className="text-white fill-current ml-1" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlayIcon size={20} className="text-white" />
            <VolumeHighIcon size={20} className="text-white" />
          </div>
          <FullscreenIcon size={20} className="text-white" />
        </div>
      </MediaPlayer>
    </div>
  );
}
