import { Request, Response } from 'express';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { poolPromise } from '../config/database'; // Adjust the import path as necessary
import sql from 'mssql';

const AGORA_APP_ID = process.env.AGORA_APP_ID!;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;

export async function generateAgoraToken(req: Request, res: Response): Promise<void> {
    console.log(req.body);
    try {
        const { channelName, appointmentId, role } = req.body;
        const userId = (req as any).user?.user?.AccountID;
        const isConsultant = role === 'host'; // Assuming 'host' indicates consultant from the client

        console.log('=== AGORA TOKEN REQUEST ===');
        console.log('Channel Name:', channelName);
        console.log('Appointment ID:', appointmentId);
        console.log('User ID:', userId);
        console.log('Role:', role);
        console.log('AGORA_APP_ID:', AGORA_APP_ID ? 'Set' : 'Missing');
        console.log('AGORA_APP_CERTIFICATE:', AGORA_APP_CERTIFICATE ? 'Set' : 'Missing');

        if (!userId || !channelName || !appointmentId) {
            console.error('Missing required parameters');
            res.status(400).json({ message: 'Missing required parameters' });
            return;
        }

        if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
            console.error('Missing Agora credentials');
            res.status(500).json({ message: 'Agora configuration missing' });
            return;
        }

        // Verify user has access to this appointment
        const hasAccess = await verifyAppointmentAccess(userId, appointmentId);
        if (!hasAccess) {
            console.error('Access denied for user:', userId, 'appointment:', appointmentId);
            res.status(403).json({ message: 'Access denied to this appointment' });
            return;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTime + 3600; // 1 hour

        // Set role based on isConsultant
        const agoraRole = isConsultant ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

        console.log('Generating token with params:', {
            appId: AGORA_APP_ID,
            channelName,
            userId,
            role: agoraRole,
            expiry: privilegeExpiredTs
        });

        const token = RtcTokenBuilder.buildTokenWithUid(
            AGORA_APP_ID,
            AGORA_APP_CERTIFICATE,
            channelName,
            userId,
            agoraRole,
            privilegeExpiredTs
        );

        console.log('Generated token successfully for user:', userId);

        res.json({
            token,
            channelName,
            appId: AGORA_APP_ID,
            uid: userId
        });
    } catch (error) {
        console.error('Error generating Agora token:', error);
        res.status(500).json({ message: 'Failed to generate token', error: error });
    }
}

async function verifyAppointmentAccess(userId: number, appointmentId: number): Promise<boolean> {
    try {
        const pool = await poolPromise;

        // Check if user is either the consultant or the patient for this appointment
        const result = await pool.request()
            .input('UserId', sql.Int, userId)
            .input('AppointmentId', sql.Int, appointmentId)
            .query(`
        SELECT COUNT(*) as AccessCount
        FROM Appointment a
        LEFT JOIN Consultant c ON a.ConsultantID = c.AccountID
        WHERE a.AppointmentID = @AppointmentId 
        AND (a.AccountID = @UserId OR c.AccountID = @UserId)
      `);

        return result.recordset[0].AccessCount > 0;
    } catch (error) {
        console.error('Error verifying appointment access:', error);
        return false;
    }
}