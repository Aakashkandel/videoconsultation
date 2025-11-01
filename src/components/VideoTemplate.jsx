import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Mic, MicOff, Video, VideoOff, Phone, Monitor, MoreVertical, Users } from 'lucide-react';
import ZoomVideo from '@zoom/videosdk';
import './VideoTemplate.css';

export default function VideoTemplate() {
  const { data: sessionData } = useSelector((state) => state.userSession);

  const [client, setClient] = useState(null);
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [activeParticipant, setActiveParticipant] = useState(null);
  const [seconds, setSeconds] = useState(0);

  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isTogglingVideo, setIsTogglingVideo] = useState(false);
  const [isTogglingAudio, setIsTogglingAudio] = useState(false);

  const videoPlayerRef = useRef(null);
  const selfVideoPlayerRef = useRef(null);

  useEffect(() => {
    if (sessionData && !client) initializeZoomSession();
  }, [sessionData, client]);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (client && stream && isConnected && !isTogglingVideo && !isTogglingAudio) {
      const timer = setTimeout(() => updateVideoDisplay(client), 100);
      return () => clearTimeout(timer);
    }
  }, [activeParticipant, isVideoOn, client, stream, isConnected]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (stream && client) {
        (async () => {
          try {
            if (videoPlayerRef.current) videoPlayerRef.current.innerHTML = '';
            if (selfVideoPlayerRef.current) selfVideoPlayerRef.current.innerHTML = '';

            const allUsers = client.getAllUser();
            for (const user of allUsers) {
              await stream.detachVideo(user.userId).catch(() => {});
            }
          } catch (error) {
            console.error('Cleanup error:', error);
          }
        })();
      }
    };
  }, [stream, client]);

  /** Initialize Zoom session and join */
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

      zoomClient.on('user-added', () => updateParticipants(zoomClient));
      zoomClient.on('user-removed', (user) => {
        if (mediaStream && user) mediaStream.detachVideo(user.userId).catch(() => {});
        updateParticipants(zoomClient);
      });
      zoomClient.on('user-updated', () => updateParticipants(zoomClient));

      zoomClient.on('peer-video-state-change', async (payload) => {
        if (payload?.userId) {
          updateParticipants(zoomClient);
          await new Promise((r) => setTimeout(r, 300));
          await updateVideoDisplay(zoomClient);
        }
      });

      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      await mediaStream.startAudio();
      await mediaStream.startVideo();
      setIsVideoOn(true);
      setIsVideoLoading(false);

      await new Promise((r) => setTimeout(r, 500));
      updateVideoDisplay(zoomClient);
    } catch (error) {
      console.error('Failed to initialize Zoom session:', error);
      if (error.name === 'NotAllowedError') {
        alert('Camera and microphone permissions are required.');
      }
    }
  };

  /** Update participant list and active participant (doctor prioritized) */
  const updateParticipants = (zoomClient) => {
    const allUsers = zoomClient.getAllUser();
    setParticipants(allUsers);

    const selfUserId = zoomClient.getCurrentUserInfo().userId;
    const others = allUsers.filter((u) => u.userId !== selfUserId);
    const doctor = others.find((u) => u.role === 1);
    const newActive = doctor || others[0] || null;

    if (newActive?.userId !== activeParticipant?.userId) {
      setActiveParticipant(newActive);
    }
  };

  /** Attach/detach and render active and self videos */
  const updateVideoDisplay = async (zoomClient) => {
    if (!stream || !zoomClient) return;

    const selfUserId = zoomClient.getCurrentUserInfo().userId;
    const currentUser = zoomClient.getCurrentUserInfo();

    try {
      const allUsers = zoomClient.getAllUser();
      for (const user of allUsers) await stream.detachVideo(user.userId).catch(() => {});

      if (videoPlayerRef.current) videoPlayerRef.current.innerHTML = '';
      if (selfVideoPlayerRef.current) selfVideoPlayerRef.current.innerHTML = '';

      // Show other participant if available, else show self
      if (activeParticipant) {
        if (activeParticipant.bVideoOn && videoPlayerRef.current) {
          const participantVideo = await stream.attachVideo(activeParticipant.userId, 3);
          if (participantVideo) videoPlayerRef.current.appendChild(participantVideo);
        }

        if (currentUser?.bVideoOn && isVideoOn && selfVideoPlayerRef.current) {
          const selfVideo = await stream.attachVideo(selfUserId, 3);
          if (selfVideo) selfVideoPlayerRef.current.appendChild(selfVideo);
        }
      } else if (currentUser?.bVideoOn && isVideoOn && videoPlayerRef.current) {
        const selfVideo = await stream.attachVideo(selfUserId, 3);
        if (selfVideo) videoPlayerRef.current.appendChild(selfVideo);
      }
    } catch (error) {
      console.error('Error updating video display:', error);
    }
  };

  /** Mute/unmute microphone */
  const handleToggleMute = async () => {
    if (!stream || !client) return;
    setIsTogglingAudio(true);
    try {
      isMuted ? await stream.unmuteAudio() : await stream.muteAudio();
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling mute:', error);
    } finally {
      await new Promise((r) => setTimeout(r, 150));
      setIsTogglingAudio(false);
    }
  };

  /** Start/stop video stream */
  const handleToggleVideo = async () => {
    if (!stream || !client || isTogglingVideo) return;
    setIsTogglingVideo(true);
    try {
      const selfUserId = client.getCurrentUserInfo().userId;

      if (isVideoOn) {
        await stream.detachVideo(selfUserId).catch(() => {});
        if (videoPlayerRef.current && !activeParticipant) videoPlayerRef.current.innerHTML = '';
        if (selfVideoPlayerRef.current && activeParticipant) selfVideoPlayerRef.current.innerHTML = '';
        await stream.stopVideo();
        setIsVideoOn(false);
      } else {
        await stream.startVideo();
        setIsVideoOn(true);
        await new Promise((r) => setTimeout(r, 150));

        const selfVideo = await stream.attachVideo(selfUserId, 3);
        if (activeParticipant && selfVideoPlayerRef.current) {
          selfVideoPlayerRef.current.innerHTML = '';
          selfVideoPlayerRef.current.appendChild(selfVideo);
        } else if (videoPlayerRef.current) {
          videoPlayerRef.current.innerHTML = '';
          videoPlayerRef.current.appendChild(selfVideo);
        }
      }
    } catch (error) {
      console.error('Error toggling video:', error);
    } finally {
      await new Promise((r) => setTimeout(r, 100));
      setIsTogglingVideo(false);
    }
  };

  /** Start/stop screen sharing */
  const handleToggleScreenShare = async () => {
    if (!stream) return;
    try {
      isScreenSharing ? await stream.stopShareScreen() : await stream.startShareScreen();
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  /** Leave Zoom session */
  const handleLeaveSession = async () => {
    if (!client || !stream) return;
    try {
      const users = client.getAllUser();
      for (const user of users) await stream.detachVideo(user.userId).catch(() => {});
      await stream.stopVideo();
      await stream.stopAudio();
      await client.leave();
    } catch {}
    window.location.href = '/sessionauth';
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
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white font-medium">Video Consultation</span>
          <span className="text-gray-400 text-sm">{formatTime(seconds)}</span>
          {sessionData?.role === 1 && <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">Doctor</span>}
          {sessionData?.role === 0 && <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Patient</span>}
        </div>

        <div className="flex items-center gap-2">
          <div className="text-gray-300 text-sm">Participants: {participants.length}</div>
          <button className="p-2 hover:bg-gray-700 rounded-lg"><Users className="w-5 h-5 text-gray-300" /></button>
          <button className="p-2 hover:bg-gray-700 rounded-lg"><MoreVertical className="w-5 h-5 text-gray-300" /></button>
        </div>
      </div>

      {/* Video Section */}
      <div className="flex-1 relative p-6">
        <div className="w-full h-full bg-gray-800 rounded-2xl overflow-hidden relative shadow-2xl">
          <video-player-container style={{ width: '100%', height: '100%', position: 'absolute' }}>
            {activeParticipant ? (
              <>
                <video-player ref={videoPlayerRef} style={{ width: '100%', height: '100%' }} />
                <div className="absolute bottom-4 left-4 bg-black/60 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{activeParticipant.displayName || 'Participant'}</p>
                    {activeParticipant.role === 1 && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">Dr.</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <video-player
                  ref={videoPlayerRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: isVideoOn ? 'block' : 'none',
                  }}
                />
                {!isVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/30 to-purple-900/30">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white text-4xl font-bold">
                          {sessionData?.user_name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <h3 className="text-white text-2xl font-semibold">Camera is off</h3>
                      <p className="text-gray-400 mt-1">Click the video button to turn on your camera</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </video-player-container>

          {activeParticipant && (
            <div className="absolute top-6 right-6 w-64 h-48 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700 hover:border-blue-500 transition-all cursor-pointer group z-20">
              <video-player-container style={{ width: '100%', height: '100%' }}>
                <video-player
                  ref={selfVideoPlayerRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: isVideoOn ? 'block' : 'none',
                  }}
                />
                {!isVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <div className="text-center">
                      <VideoOff className="w-12 h-12 text-gray-500 mb-2" />
                      <p className="text-gray-400 text-sm">Camera Off</p>
                    </div>
                  </div>
                )}
                {isMuted && isVideoOn && (
                  <div className="absolute top-2 left-2 bg-red-500 p-1.5 rounded-full z-10">
                    <MicOff className="w-3 h-3 text-white" />
                  </div>
                )}
              </video-player-container>
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
                <span className="text-white text-xs">Your Video</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900/80 backdrop-blur-lg border-t border-gray-800 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-4">
          <button
            onClick={handleToggleMute}
            className={`p-4 rounded-full ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </button>

          <button
            onClick={handleToggleVideo}
            disabled={isTogglingVideo}
            className={`p-4 rounded-full ${!isVideoOn ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} ${
              isTogglingVideo ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isTogglingVideo ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isVideoOn ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={handleToggleScreenShare}
            className={`p-4 rounded-full ${isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <Monitor className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={handleLeaveSession}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 ml-2"
          >
            <Phone className="w-6 h-6 text-white rotate-[135deg]" />
          </button>
        </div>

        <div className="max-w-2xl mx-auto flex items-center justify-center gap-4 mt-2">
          <span className="text-xs text-gray-400 w-14 text-center">{isMuted ? 'Unmute' : 'Mute'}</span>
          <span className="text-xs text-gray-400 w-14 text-center">{isVideoOn ? 'Stop' : 'Start'}</span>
          <span className="text-xs text-gray-400 w-14 text-center">{isScreenSharing ? 'Stop' : 'Share'}</span>
          <span className="text-xs text-red-400 w-14 text-center ml-2">Leave</span>
        </div>
      </div>
    </div>
  );
}
