import cron from 'node-cron';
import { poolPromise, sql } from "../config/database";

export const updateProgramStatus = () => {
    cron.schedule('0 0 * * *', async () => { // Chạy hàng ngày lúc 00:00
        try {
            const pool = await poolPromise;
            await pool.request().query(`
                UPDATE CommunityProgram
                SET Status = CASE
                    WHEN Date > GETDATE() THEN 'upcoming'
                    WHEN Date = CAST(GETDATE() AS DATE) THEN 'ongoing'
                    ELSE 'completed'
                END
                WHERE IsDisabled = 0
            `);
        } catch (err) {
            console.error('Error updating program statuses:', err);
        }
    });
};