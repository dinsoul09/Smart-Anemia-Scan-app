// Browsers can't schedule local notifications, so the reminder is only available in the mobile app

export const remindersSupported = false;
export const REMINDER_SCHEDULE = 'Mondays, 9:00';

export const isReminderOn = async () => false;

export const setReminderOn = async () => false;
