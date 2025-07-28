import axios from 'axios';
import dotenv from 'dotenv';
import { CommunityProgram } from '../types/type';

dotenv.config();

export async function getZoomAccessToken(): Promise<string> {
    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'account_credentials');
        params.append('account_id', process.env.ZOOM_ACCOUNT_ID || '');

        const credentials = `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`;
        const encodedCredentials = Buffer.from(credentials).toString('base64');

        const response = await axios.post('https://zoom.us/oauth/token', params, {
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data.access_token;
    } catch (error: any) {
        console.error('Error getting Zoom Access Token:', error.response?.data || error.message);
        throw new Error('Failed to get Zoom Access Token');
    }
}

export async function updateZoomAccountSettings(): Promise<void> {
    try {
        const accessToken = await getZoomAccessToken();
        
        const accountSettings = {
            security: {
                require_password_for_all_meetings: false,
                require_password_for_instant_meetings: false,
                require_password_for_pmi_meetings: "none",
                require_password_for_scheduling_new_meetings: false,
                waiting_room: false,
                meeting_authentication: false,
                enforce_login: false
            },
            schedule_meeting: {
                join_before_host: true,
                require_password_for_scheduling_new_meetings: false,
                require_password_for_instant_meetings: false
            }
        };

        await axios.patch(
            'https://api.zoom.us/v2/accounts/me/settings',
            accountSettings,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
            
    } catch (error: any) {
        console.error('Error updating account settings:', error.response?.data || error.message);
    }
}

// Cải tiến: Cập nhật user settings để cho phép tham gia không cần host
export async function updateZoomUserSettings(): Promise<void> {
    try {
        const accessToken = await getZoomAccessToken();
        
        const userSettings = {
            feature: {
                require_password_for_all_meetings: false,
                require_password_for_instant_meetings: false,
                require_password_for_pmi_meetings: "none",
                join_before_host: true
            },
            in_meeting: {
                waiting_room: false,
                meeting_authentication: false,
                enforce_login: false
            },
            scheduled_meeting: {
                join_before_host: true,
                require_password_for_scheduling_new_meetings: false
            }
        };

        await axios.patch(
            'https://api.zoom.us/v2/users/me/settings',
            userSettings,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
    } catch (error: any) {
        console.error('Error updating user settings:', error.response?.data || error.message);
    }
}

export async function createZoomMeeting(program: CommunityProgram): Promise<{ join_url: string; meeting_id: string }> {
    try {
        // Cập nhật settings trước khi tạo meeting
        await updateZoomAccountSettings();
        await updateZoomUserSettings();
        
        const accessToken = await getZoomAccessToken();
        
        // Format date properly for Zoom API (ISO 8601 format)
        let programDate: Date;
        
        // Assume program.Date is always string (converted in caller)
        const dateString = program.Date;
        
        // Check if date is in dd/mm/yyyy format and convert to ISO
        if (dateString.includes('/')) {
            const [day, month, year] = dateString.split('/');
            programDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        } else {
            programDate = new Date(dateString);
        }
        
        // Validate the date
        if (isNaN(programDate.getTime())) {
            throw new Error(`Invalid date format: ${program.Date}`);
        }
        
        programDate.setHours(10, 0, 0, 0); // Set to 10:00 AM
        const startTime = programDate.toISOString();
        
       
        
        const meetingSettings = {
            topic: program.ProgramName,
            type: 2, // Scheduled meeting
            start_time: startTime,
            duration: 90,
            timezone: 'Asia/Ho_Chi_Minh',
            agenda: program.Description || 'Hội thảo cộng đồng',
            password: "",
            settings: {
                host_video: false,
                participant_video: true,
                join_before_host: true, // Cho phép tham gia trước host
                mute_upon_entry: false,
                audio: 'voip',
                auto_recording: 'none',
                waiting_room: false, // Tắt phòng chờ
                password: "",
                use_pmi: false,
                approval_type: 0, // Tự động approve
                enforce_login: false, // Không bắt buộc đăng nhập
                meeting_authentication: false,
                embed_password_in_join_link: false
            }
        };
        
        const response = await axios.post(
            'https://api.zoom.us/v2/users/me/meetings',
            meetingSettings,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const meetingId = response.data.id.toString();
        const joinUrl = response.data.join_url;
        
       
        
        // Verify meeting settings
        const isPasswordFree = await verifyMeetingSettings(meetingId);
        
        if (!isPasswordFree) {
            
            await forceRemovePassword(meetingId);
        }
        
        return {
            join_url: joinUrl,
            meeting_id: meetingId
        };
    } catch (error: any) {
        console.error('Error creating Zoom meeting:', error.response?.data || error.message);
        throw new Error('Failed to create Zoom meeting');
    }
}

export async function deleteZoomMeeting(meetingId: string): Promise<void> {
    try {
        const accessToken = await getZoomAccessToken();
        await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
    } catch (error: any) {
        console.error('Error deleting Zoom meeting:', error.response?.data || error.message);
        throw new Error('Failed to delete Zoom meeting');
    }
}

export async function getMeetingDetails(meetingId: string): Promise<any> {
    try {
        const accessToken = await getZoomAccessToken();
        const response = await axios.get(`https://api.zoom.us/v2/meetings/${meetingId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error fetching Zoom meeting details:', error.response?.data || error.message);
        throw new Error('Failed to fetch Zoom meeting details');
    }
}

// Cải tiến: Verify meeting settings
export async function verifyMeetingSettings(meetingId: string): Promise<boolean> {
    try {
        const meetingDetails = await getMeetingDetails(meetingId);
        
        const isPasswordFree = (
            !meetingDetails.password && 
            meetingDetails.settings?.join_before_host === true &&
            meetingDetails.settings?.waiting_room === false &&
            meetingDetails.settings?.meeting_authentication === false
        );
        
        return isPasswordFree;
    } catch (error: any) {
        console.error('Error verifying meeting settings:', error.response?.data || error.message);
        return false;
    }
}

//Force remove password nếu cần
export async function forceRemovePassword(meetingId: string): Promise<void> {
    try {
        const accessToken = await getZoomAccessToken();
        
        await axios.patch(
            `https://api.zoom.us/v2/meetings/${meetingId}`,
            {
                password: "",
                settings: {
                    password: "",
                    waiting_room: false,
                    join_before_host: true,
                    meeting_authentication: false,
                    enforce_login: false,
                    approval_type: 0,
                    embed_password_in_join_link: false
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        
    } catch (error: any) {
        console.error('Error applying force fix:', error.response?.data || error.message);
    }
}

