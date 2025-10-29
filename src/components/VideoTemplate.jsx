import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Mic, MicOff, Video, VideoOff, Phone, Monitor, MoreVertical, Users } from 'lucide-react';
import ZoomVideo from '@zoom/videosdk'


export default function VideoTemplate() {
  const { data: sessionData } = useSelector((state) => state.userSession);
  const [client, setClient] = useState(null);
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [activeParticipant, setActiveParticipant] = useState(null);

  // Initialize Zoom client and join session
  useEffect(() => {
    if (sessionData && !client) {
      initializeZoomSession();
    }
  }, [sessionData, client]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const initializeZoomSession = async () => {
    try {
      const zoomClient = ZoomVideo.createClient();
      setClient(zoomClient);

      await zoomClient.init('en-US', 'Global', { patchJsMedia: true });

      const mediaStream = zoomClient.getMediaStream();
      setStream(mediaStream);

      await zoomClient.join(
        sessionData.session_name,
        sessionData.signature,
        sessionData.user_name,
        sessionData.session_passcode
      );

      setIsConnected(true);

      // Set up event listeners
      zoomClient.on('user-added', (payload) => updateParticipants(zoomClient));
      zoomClient.on('user-removed', (payload) => updateParticipants(zoomClient));
      zoomClient.on('user-updated', (payload) => updateParticipants(zoomClient));
      zoomClient.on('peer-video-state-change', (payload) => handleVideoStateChange(payload, zoomClient));

      // Request camera and microphone permissions first
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      // Start video and audio
      await mediaStream.startAudio();
      await mediaStream.startVideo();

      updateVideoDisplay(zoomClient);

    } catch (error) {
      console.error('Failed to initialize Zoom session:', error);
      // Handle permission denied or other errors
      if (error.name === 'NotAllowedError') {
        alert('Camera and microphone permissions are required for video calls.');
      }
    }
  };

  const updateParticipants = async (zoomClient) => {
    const participantList = zoomClient.getAllUser();
    setParticipants(participantList);

    // Prioritize doctor's video in big screen
    const selfUserId = zoomClient.getCurrentUserInfo().userId;
    const otherParticipants = participantList.filter(p => p.userId !== selfUserId);
    const doctorParticipant = otherParticipants.find(p => p.role === 1);

    if (doctorParticipant) {
      setActiveParticipant(doctorParticipant);
    } else if (otherParticipants.length > 0) {
      setActiveParticipant(otherParticipants[0]);
    } else {
      setActiveParticipant(null);
    }

    updateVideoDisplay(zoomClient);
  };

  const updateVideoDisplay = async (zoomClient) => {
    const bigContainer = document.querySelector('#video-player-container');
    const smallContainer = document.querySelector('#self-video-container');

    bigContainer.innerHTML = '';
    smallContainer.innerHTML = '';

    const selfUserId = zoomClient.getCurrentUserInfo().userId;

    if (activeParticipant) {
      // Show self in small screen, participant in big screen
      if (isVideoOn) {
        const selfVideo = await stream.attachVideo(selfUserId, 3);
        smallContainer.appendChild(selfVideo);
      }
      if (activeParticipant.bVideoOn) {
        const participantVideo = await stream.attachVideo(activeParticipant.userId, 3);
        bigContainer.appendChild(participantVideo);
      }
    } else {
      // No participants, show self in big screen
      if (isVideoOn) {
        const selfVideo = await stream.attachVideo(selfUserId, 3);
        bigContainer.appendChild(selfVideo);
      }
    }
  };

  const handleVideoStateChange = async (payload, zoomClient) => {
    const { userId, action } = payload;

    if (action === 'Start') {
      const userVideo = await stream.attachVideo(userId, 3);
      document.querySelector('#video-player-container').appendChild(userVideo);
    } else if (action === 'Stop') {
      stream.detachVideo(userId);
    }

    updateVideoDisplay(zoomClient);
  };

  // Control handlers
  const handleToggleMute = async () => {
    if (!stream) return;

    try {
      if (isMuted) {
        await stream.unmuteAudio();
      } else {
        await stream.muteAudio();
      }
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const handleToggleVideo = async () => {
    if (!stream) return;

    try {
      if (isVideoOn) {
        await stream.stopVideo();
      } else {
        await stream.startVideo();
      }
      setIsVideoOn(!isVideoOn);
      updateVideoDisplay(client);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  const handleToggleScreenShare = async () => {
    if (!stream) return;

    try {
      if (isScreenSharing) {
        await stream.stopShareScreen();
      } else {
        await stream.startShareScreen();
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  const handleLeaveSession = async () => {
    if (!client) return;

    try {
      // Detach all videos
      const allUsers = client.getAllUser();
      for (const user of allUsers) {
        try {
          await stream.detachVideo(user.userId);
        } catch (error) {
          console.error('Error detaching video for user:', user.userId, error);
        }
      }

      // Clear containers
      document.querySelector('#video-player-container').innerHTML = '';
      document.querySelector('#self-video-container').innerHTML = '';

      await client.leave();
      setIsConnected(false);
      setClient(null);
      setStream(null);
      setActiveParticipant(null);
      window.location.href = '/sessionauth';
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
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

      {/* Video area */}
      <div className="flex-1 relative p-6">
        <div className="w-full h-full bg-gray-800 rounded-2xl overflow-hidden relative shadow-2xl">
          {/* Main participant video area */}
          {/* Main participant video area */}
          <div className="w-full h-full relative">
            <div id="video-player-container" className="w-full h-full">
              {!activeParticipant && !isVideoOn && (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/30 to-purple-900/30">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-white text-4xl font-bold">W</span>
                    </div>
                    <h3 className="text-white text-2xl font-semibold">Waiting for participants...</h3>
                    <p className="text-gray-400 mt-1">Share the session details to invite others</p>
                  </div>
                </div>
              )}
            </div>

            {activeParticipant && (
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg">
                <p className="text-white font-medium">{activeParticipant.displayName || 'Participant'}</p>
              </div>
            )}
          </div>

          {/* Self video - only when participants present */}
          {activeParticipant && (
            <div className="absolute top-6 right-6 w-64 h-48 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700 hover:border-blue-500 transition-all cursor-pointer group">
              <div id="self-video-container" className="w-full h-full">
                {!isVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center">
                      <VideoOff className="w-12 h-12 text-gray-500 mb-2" />
                      <p className="text-gray-400 text-sm">Camera Off</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs">Your Video</span>
              </div>
              {isMuted && (
                <div className="absolute top-2 left-2 bg-red-500 p-1.5 rounded-full">
                  <MicOff className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900/80 backdrop-blur-lg border-t border-gray-800 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-4">
          <button
            onClick={handleToggleMute}
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
            onClick={handleToggleVideo}
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
            onClick={handleToggleScreenShare}
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
            onClick={handleLeaveSession}
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