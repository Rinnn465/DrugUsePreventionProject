export const AGORA_CONFIG = {
    appId: import.meta.env.VITE_AGORA_APP_ID!, // Using Vite's env variable syntax
    token: null as string | null,
    channel: '',
};

export const generateChannelName = (appointmentId: number): string => {
    return `appointment_${appointmentId}`;
};

// Optional: Add more Agora-related configurations
export const AGORA_SETTINGS = {
    // Video settings
    video: {
        width: 1280,
        height: 720,
        frameRate: 30,
        bitrateMin: 400,
        bitrateMax: 1000,
    },

    // Audio settings
    audio: {
        sampleRate: 48000,
        bitrate: 128,
        channels: 2,
    },

    // Call settings
    call: {
        maxDuration: 3600, // 1 hour in seconds
        reconnectAttempts: 3,
        heartbeatInterval: 30000, // 30 seconds
    }
};