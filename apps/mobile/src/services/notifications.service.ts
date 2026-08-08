import Constants from "expo-constants";
import { Platform } from "react-native";
import { fetchClient } from "./config";
import { storage } from "./storage";

let Notifications: typeof import("expo-notifications") | null = null;

function isExpoGo(): boolean {
  return Constants.appOwnership === "expo";
}

async function getNotificationsModule() {
  if (isExpoGo()) return null;
  if (Notifications) return Notifications;
  try {
    Notifications = await import("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    return Notifications;
  } catch {
    return null;
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (isExpoGo()) {
    console.log(
      "[notifications] Expo Go no soporta push remotas (SDK 53+). Usá development build.",
    );
    return null;
  }

  const NotificationsMod = await getNotificationsModule();
  if (!NotificationsMod) return null;

  if (Platform.OS === "web") return null;

  const { status: existing } =
    await NotificationsMod.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await NotificationsMod.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;

  const tokenData = await NotificationsMod.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );
  const token = tokenData.data;

  const authToken = await storage.getToken();
  if (authToken && token) {
    await fetchClient(
      "/notifications/register-token",
      {
        method: "POST",
        body: JSON.stringify({
          token,
          platform: Platform.OS,
        }),
      },
      authToken,
    ).catch(() => null);
  }

  return token;
}

export async function unregisterPushToken(token: string) {
  if (isExpoGo()) return;
  const authToken = await storage.getToken();
  if (!authToken) return;
  await fetchClient(
    "/notifications/unregister-token",
    {
      method: "DELETE",
      body: JSON.stringify({ token }),
    },
    authToken,
  ).catch(() => null);
}
