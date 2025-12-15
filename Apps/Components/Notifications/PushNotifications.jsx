import { useState, useEffect } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/* =========================
   Notification Handler
========================= */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/* =========================
   Helpers
========================= */
const handleRegistrationError = (message) => {
  alert(message);
  throw new Error(message);
};

const sendPushNotification = async (expoPushToken) => {
  if (!expoPushToken) return;

  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
};

const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) {
    handleRegistrationError('Must use physical device for push notifications');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    handleRegistrationError('Permission not granted to get push token!');
    return;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    handleRegistrationError('Project ID not found');
    return;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
};

/* =========================
   Component
========================= */
export default function PushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token || ''))
      .catch((err) => console.log(err));

    const notificationListener =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
      <Text>Your Expo push token:</Text>
      <Text selectable>{expoPushToken}</Text>

      <View style={{ alignItems: 'center' }}>
        <Text>Title: {notification?.request?.content?.title}</Text>
        <Text>Body: {notification?.request?.content?.body}</Text>
        <Text>
          Data:{' '}
          {notification
            ? JSON.stringify(notification.request.content.data)
            : ''}
        </Text>
      </View>

      <Button
        title="Press to Send Notification"
        onPress={() => sendPushNotification(expoPushToken)}
      />
    </View>
  );
}
