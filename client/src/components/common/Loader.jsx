import React from 'react';

export const Loader = ({ message = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div
            className="absolute inset-2 rounded-full border-4 border-purple-500/20 border-b-purple-500 animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          />
        </div>
        <p className="text-sm text-zinc-400 font-medium tracking-wide animate-pulse">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 gap-3">
      <div className="w-5 h-5 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      <span className="text-xs text-zinc-400">{message}</span>
    </div>
  );
};

export default Loader;
