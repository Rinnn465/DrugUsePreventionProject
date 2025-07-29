import React, { useState, useEffect } from 'react';
import AgoraRTC, {
    IAgoraRTCRemoteUser,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
    IRemoteVideoTrack,
    IRemoteAudioTrack
} from 'agora-rtc-sdk-ng';
import { AGORA_CONFIG, generateChannelName } from '../../config/agoraConfig';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface VideoCallProps {
    appointmentId: number;
    isConsultant: boolean;
    onCallEnd: () => void;
}

const VideoCallComponent: React.FC<VideoCallProps> = ({
    appointmentId,
    isConsultant,
    onCallEnd
}) => {
    const [isJoined, setIsJoined] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
    const [client] = useState(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));

    useEffect(() => {
        const initializeAgora = async () => {
            // Set up event listeners
            client.on('user-published', handleUserPublished);
            client.on('user-unpublished', handleUserUnpublished);
            client.on('user-left', handleUserLeft);

            try {
                const channelName = generateChannelName(appointmentId);
                const data = await getAgoraToken(channelName);

                await client.join(AGORA_CONFIG.appId, channelName, data?.token, data?.uid);

                const videoTrack = await AgoraRTC.createCameraVideoTrack();
                const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

                setLocalVideoTrack(videoTrack);
                setLocalAudioTrack(audioTrack);

                await client.publish([videoTrack, audioTrack]);

                videoTrack.play('local-video');

                setIsJoined(true);
            } catch (error) {
                console.error('Failed to join channel:', error);
            }
        };

        initializeAgora();

        return () => {
            cleanup();
        };
    }, [appointmentId]);

    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
        await client.subscribe(user, mediaType);

        if (mediaType === 'video') {
            const remoteVideoTrack = user.videoTrack as IRemoteVideoTrack;
            remoteVideoTrack?.play(`remote-video-${user.uid}`);
        }

        if (mediaType === 'audio') {
            const remoteAudioTrack = user.audioTrack as IRemoteAudioTrack;
            remoteAudioTrack?.play();
        }

        setRemoteUsers(prevUsers => [...prevUsers.filter(u => u.uid !== user.uid), user]);
    };

    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
        setRemoteUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
    };

    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
        setRemoteUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
    };

    const toggleVideo = async () => {
        if (localVideoTrack) {
            await localVideoTrack.setEnabled(!isVideoEnabled);
            setIsVideoEnabled(!isVideoEnabled);
        }
    };

    const toggleAudio = async () => {
        if (localAudioTrack) {
            await localAudioTrack.setEnabled(!isAudioEnabled);
            setIsAudioEnabled(!isAudioEnabled);
        }
    };

    const endCall = async () => {
        await cleanup();
        onCallEnd();
    };

    const cleanup = async () => {
        if (localVideoTrack) {
            localVideoTrack.stop();
            localVideoTrack.close();
        }
        if (localAudioTrack) {
            localAudioTrack.stop();
            localAudioTrack.close();
        }
        if (client) {
            await client.leave();
        }
        setIsJoined(false);
    };

    const getAgoraToken = async (channelName: string): Promise<object | null> => {
        try {
            const response = await fetch(`http://localhost:5000/api/agora/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    channelName,
                    appointmentId,
                    role: isConsultant ? 'host' : 'audience'
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data
            }
        } catch (error) {
            console.error('Failed to get Agora token:', error);
        }
        return null;
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="flex-1 relative">
                <div className="w-full h-full bg-gray-900">
                    {remoteUsers.length > 0 ? (
                        remoteUsers.map(user => (
                            <div
                                key={user.uid}
                                id={`remote-video-${user.uid}`}
                                className="w-full h-full"
                            />
                        ))
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                            <div className="text-center">
                                <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <Video className="w-16 h-16" />
                                </div>
                                <p className="text-xl">Waiting for {isConsultant ? 'patient' : 'consultant'} to join...</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
                    <div id="local-video" className="w-full h-full" />
                </div>

                <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg">
                    <p className="text-sm">Appointment #{appointmentId}</p>
                    <p className="text-xs text-gray-300">
                        {isConsultant ? 'Consultant View' : 'Patient View'}
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-900 p-6">
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={toggleAudio}
                        className={`p-4 rounded-full transition-colors ${isAudioEnabled
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                    >
                        {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-colors ${isVideoEnabled
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                    >
                        {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={endCall}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                    >
                        <PhoneOff className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCallComponent;