import { addHours, format, isSameDay, startOfDay, getDay } from 'date-fns';

export const generateDailySchedule = (medications, targetDate) => {
    let schedule = [];

    medications.forEach(med => {
        // 1. Daily
        if (med.frequency === 'daily' || !med.frequency) {
            schedule.push(createScheduleItem(med, med.time));
            return;
        }

        // 2. Every Other Day (Logic: Check if days since creation is even number)
        if (med.frequency === 'every_other_day') {
            const createdAt = new Date(med.createdAt);
            const dayDiff = Math.floor((targetDate - createdAt) / (1000 * 60 * 60 * 24));
            if (dayDiff % 2 === 0) {
                schedule.push(createScheduleItem(med, med.time));
            }
            return;
        }

        // 3. Every X Hours (Interval)
        // Needs a start time reference. Assuming med.time is the FIRST dose.
        if (med.frequency === 'interval') {
            // Only if user selects 'interval', we expect 'intervalHours' in med object
            // For simple mvp, let's assume intervals start from 'time'
            // and run until end of day
            const interval = parseInt(med.intervalHours) || 8;
            let cursorTime = parseInt(med.time.split(':')[0]);

            // If schedule is infinite, we just calc for today
            // E.g. 08:00, 16:00, 00:00 (Next day)
            // This is a simplified logic that assumes intervals restart/align daily or relative to start
            // Reliable interval logic usually requires a base anchor date.
            // Here we simplistically project slots for *today* based on the base time.

            // Slots: [08:00, 16:00, 00:00]
            for (let i = 0; i < 24 / interval; i++) {
                let nextHour = cursorTime + (i * interval);
                if (nextHour >= 24) continue; // Next day

                const timeStr = `${nextHour.toString().padStart(2, '0')}:${med.time.split(':')[1]}`;
                schedule.push(createScheduleItem(med, timeStr, `Dose ${i + 1}`));
            }
            return;
        }
    });

    // Sort by time
    return schedule.sort((a, b) => a.time.localeCompare(b.time));
};

const createScheduleItem = (med, time, labelOverride) => ({
    ...med,
    time, // Overwrite single time with specific slot time
    label: labelOverride || med.name
});
