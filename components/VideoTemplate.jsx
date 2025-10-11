import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, Monitor, MoreVertical, Users } from 'lucide-react';

export default function VideoTemplate() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-white font-medium">Meeting in Progress</span>
          <span className="text-gray-400 text-sm">{formatTime(seconds)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <Users className="w-5 h-5 text-gray-300" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative p-6">
        <div className="w-full h-full bg-gray-800 rounded-2xl overflow-hidden relative shadow-2xl">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/30 to-purple-900/30">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white text-4xl font-bold">Ak</span>
              </div>
              <h3 className="text-white text-2xl font-semibold">Aakash Kandel</h3>
              <p className="text-gray-400 mt-1">Speaking...</p>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg">
            <p className="text-white font-medium">Aakash Kandel</p>
          </div>

          <div className="absolute top-6 left-6 w-64 h-48 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700 hover:border-blue-500 transition-all cursor-pointer group">
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 relative">
              {isVideoOn ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-white text-2xl font-bold">You</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <VideoOff className="w-12 h-12 text-gray-500 mb-2" />
                  <p className="text-gray-400 text-sm">Camera Off</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs">Your Video</span>
              </div>
            </div>
            {isMuted && (
              <div className="absolute top-2 left-2 bg-red-500 p-1.5 rounded-full">
                <MicOff className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-900/80 backdrop-blur-lg border-t border-gray-800 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all transform hover:scale-110 ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-4 rounded-full transition-all transform hover:scale-110 ${
              !isVideoOn 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoOn ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-4 rounded-full transition-all transform hover:scale-110 ${
              isScreenSharing 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Share screen"
          >
            <Monitor className="w-6 h-6 text-white" />
          </button>

          <button
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all transform hover:scale-110 ml-2"
            title="End call"
          >
            <Phone className="w-6 h-6 text-white transform rotate-135" />
          </button>
        </div>

        <div className="max-w-2xl mx-auto flex items-center justify-center gap-4 mt-2">
          <span className="text-xs text-gray-400 w-14 text-center">
            {isMuted ? 'Unmute' : 'Mute'}
          </span>
          <span className="text-xs text-gray-400 w-14 text-center">
            {isVideoOn ? 'Stop' : 'Start'}
          </span>
          <span className="text-xs text-gray-400 w-14 text-center">
            {isScreenSharing ? 'Stop' : 'Share'}
          </span>
          <span className="text-xs text-red-400 w-14 text-center ml-2">
            Leave
          </span>
        </div>
      </div>
    </div>
  );
}