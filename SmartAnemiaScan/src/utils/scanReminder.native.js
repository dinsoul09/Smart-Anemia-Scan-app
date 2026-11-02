import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

// Weekly scan reminder: a local notification every Monday at 9:00.
// The scheduled notification's id is kept so the toggle can find and cancel it.

const ID_KEY = 'scanReminderId';
const WEEKDAY_MONDAY = 2; // expo-notifications counts from Sunday = 1

export const remindersSupported = true;
export const REMINDER_SCHEDULE = 'Mondays, 9:00';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export const isReminderOn = async () => {
  const id = await SecureStore.getItemAsync(ID_KEY);
  if (!id) return false;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.some((n) => n.identifier === id);
};

// Returns the state that was actually applied: false when notifications aren't allowed
export const setReminderOn = async (on) => {
  const id = await SecureStore.getItemAsync(ID_KEY);
  if (id) await Notifications.cancelScheduledNotificationAsync(id);
  await SecureStore.deleteItemAsync(ID_KEY);
  if (!on) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  let { granted } = await Notifications.getPermissionsAsync();
  if (!granted) ({ granted } = await Notifications.requestPermissionsAsync());
  if (!granted) return false;

  const newId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time for your weekly scan',
      body: 'It takes under a minute and helps you notice changes early.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: WEEKDAY_MONDAY,
      hour: 9,
      minute: 0,
    },
  });
  await SecureStore.setItemAsync(ID_KEY, newId);
  return true;
};
