import React, { useEffect, useRef, useState } from 'react';
import { X, Users, Mic, MicOff, Video, VideoOff, Monitor, PhoneOff } from 'lucide-react';

interface JitsiMeetProps {
  roomName: string;
  userName?: string;
  onClose: () => void;
  programName?: string;
}

interface JitsiMeetAPI {
  dispose: () => void;
  addEventListener: (event: string, listener: (data?: unknown) => void) => void;
  executeCommand: (command: string) => void;
}

interface AudioVideoData {
  muted: boolean;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (domain: string, options: unknown) => JitsiMeetAPI;
  }
}

const JitsiMeet: React.FC<JitsiMeetProps> = ({ 
  roomName, 
  userName = 'Người tham gia', 
  onClose,
  programName 
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<JitsiMeetAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  useEffect(() => {
    // Load Jitsi Meet API script
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve(window.JitsiMeetExternalAPI);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => resolve(window.JitsiMeetExternalAPI);
        script.onerror = () => reject(new Error('Failed to load Jitsi Meet API'));
        document.head.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      try {
        await loadJitsiScript();
        
        if (!jitsiContainerRef.current) return;

        const domain = 'meet.jit.si';
        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: userName
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            disableInviteFunctions: false,
            enableClosePage: false,
            toolbarButtons: [
              'microphone', 'camera', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat',
              'recording', 'livestreaming', 'etherpad', 'sharedvideo',
              'settings', 'raisehand', 'videoquality', 'filmstrip',
              'invite', 'feedback', 'stats', 'shortcuts', 'tileview',
              'select-background', 'download', 'help', 'mute-everyone',
              'security'
            ]
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat',
              'recording', 'livestreaming', 'etherpad', 'sharedvideo',
              'settings', 'raisehand', 'videoquality', 'filmstrip',
              'invite', 'feedback', 'stats', 'shortcuts', 'tileview',
              'select-background', 'download', 'help', 'mute-everyone',
              'security'
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            SHOW_POWERED_BY: false,
            DEFAULT_BACKGROUND: '#1e3a8a'
          }
        };

        const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
        setApi(jitsiApi);

        // Event listeners
        jitsiApi.addEventListener('videoConferenceJoined', () => {
          setIsLoading(false);
          console.log('Joined conference');
        });

        jitsiApi.addEventListener('videoConferenceLeft', () => {
          console.log('Left conference');
          onClose();
        });

        jitsiApi.addEventListener('participantJoined', (participant) => {
          console.log('Participant joined:', participant);
          setParticipantCount(prev => prev + 1);
        });

        jitsiApi.addEventListener('participantLeft', (participant) => {
          console.log('Participant left:', participant);
          setParticipantCount(prev => Math.max(0, prev - 1));
        });

        jitsiApi.addEventListener('audioMuteStatusChanged', (data) => {
          const audioData = data as AudioVideoData;
          setIsMuted(audioData.muted);
        });

        jitsiApi.addEventListener('videoMuteStatusChanged', (data) => {
          const videoData = data as AudioVideoData;
          setIsVideoMuted(videoData.muted);
        });

        jitsiApi.addEventListener('readyToClose', () => {
          onClose();
        });

      } catch (err) {
        console.error('Error initializing Jitsi:', err);
        setError('Không thể khởi tạo phòng họp. Vui lòng thử lại.');
        setIsLoading(false);
      }
    };

    initializeJitsi();

    // Cleanup
    return () => {
      if (api) {
        api.dispose();
      }
      // Remove script if needed
      const script = document.querySelector('script[src="https://meet.jit.si/external_api.js"]');
      if (script) {
        script.remove();
      }
    };
  }, [roomName, userName, onClose, api]);

  const handleToggleAudio = () => {
    if (api) {
      api.executeCommand('toggleAudio');
    }
  };

  const handleToggleVideo = () => {
    if (api) {
      api.executeCommand('toggleVideo');
    }
  };

  const handleScreenShare = () => {
    if (api) {
      api.executeCommand('toggleShareScreen');
    }
  };

  const handleLeave = () => {
    if (api) {
      api.executeCommand('hangup');
    }
    onClose();
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi kết nối</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">
            {programName || 'Phòng họp trực tuyến'}
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <Users className="h-4 w-4" />
            <span>{participantCount} người tham gia</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Custom control buttons */}
          <button
            onClick={handleToggleAudio}
            className={`p-2 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-700'} hover:bg-opacity-80`}
            title={isMuted ? 'Bật mic' : 'Tắt mic'}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          
          <button
            onClick={handleToggleVideo}
            className={`p-2 rounded-full ${isVideoMuted ? 'bg-red-600' : 'bg-gray-700'} hover:bg-opacity-80`}
            title={isVideoMuted ? 'Bật camera' : 'Tắt camera'}
          >
            {isVideoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </button>
          
          <button
            onClick={handleScreenShare}
            className="p-2 rounded-full bg-gray-700 hover:bg-opacity-80"
            title="Chia sẻ màn hình"
          >
            <Monitor className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleLeave}
            className="p-2 rounded-full bg-red-600 hover:bg-red-700"
            title="Rời khỏi cuộc họp"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
          
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
            title="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Đang kết nối phòng họp...</p>
            <p className="text-sm text-gray-300 mt-2">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      )}

      {/* Jitsi Meet Container */}
      <div 
        ref={jitsiContainerRef} 
        className="flex-1 w-full h-full"
        style={{ minHeight: '500px' }}
      />
    </div>
  );
};

export default JitsiMeet;
