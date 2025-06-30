import { Request, Response } from 'express';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

const AGORA_APP_ID = process.env.AGORA_APP_ID!;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;

export async function generateAgoraToken(req: Request, res: Response): Promise<void> {
    try {
        const { channelName, appointmentId, role } = req.body;
        const userId = (req as any).user?.user?.AccountID;

        if (!userId || !channelName || !appointmentId) {
            res.status(400).json({ message: 'Missing required parameters' });
            return;
        }

        // Verify user has access to this appointment
        const hasAccess = await verifyAppointmentAccess(userId, appointmentId);
        if (!hasAccess) {
            res.status(403).json({ message: 'Access denied to this appointment' });
            return;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTime + 3600; // 1 hour
        const agoraRole = role === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

        const token = RtcTokenBuilder.buildTokenWithUid(
            AGORA_APP_ID,
            AGORA_APP_CERTIFICATE,
            channelName,
            userId,
            agoraRole,
            privilegeExpiredTs
        );

        res.json({
            token,
            channelName,
            appId: AGORA_APP_ID,
            uid: userId
        });
    } catch (error) {
        console.error('Error generating Agora token:', error);
        res.status(500).json({ message: 'Failed to generate token' });
    }
}

async function verifyAppointmentAccess(userId: number, appointmentId: number): Promise<boolean> {
    // Implement your logic to verify the user has access to this appointment
    // This should check if the user is either the consultant or the patient for this appointment
    return true; // Placeholder
}