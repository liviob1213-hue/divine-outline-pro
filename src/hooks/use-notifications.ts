import { useEffect, useCallback, useState } from "react";

const NOTIFICATION_KEY = "pregai_notification_enabled";
const LAST_NOTIF_KEY = "pregai_last_notification_date";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem(NOTIFICATION_KEY) === "true";
  });

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied" as const;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      localStorage.setItem(NOTIFICATION_KEY, "true");
      setEnabled(true);
    }
    return result;
  }, []);

  const disableNotifications = useCallback(() => {
    localStorage.setItem(NOTIFICATION_KEY, "false");
    setEnabled(false);
  }, []);

  const showVerseNotification = useCallback(
    async (text: string, reference: string) => {
      if (permission !== "granted") return;

      const today = new Date().toISOString().split("T")[0];
      const lastDate = localStorage.getItem(LAST_NOTIF_KEY);
      if (lastDate === today) return; // Already shown today

      localStorage.setItem(LAST_NOTIF_KEY, today);

      // Use service worker notification if available (works in background)
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification("📖 Versículo do Dia — PregAI", {
          body: `"${text.slice(0, 120)}${text.length > 120 ? "..." : ""}" — ${reference}`,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-96x96.png",
          tag: "daily-verse",
          data: { url: "/" },
        } as NotificationOptions);
        new Notification("📖 Versículo do Dia — PregAI", {
          body: `"${text.slice(0, 120)}${text.length > 120 ? "..." : ""}" — ${reference}`,
          icon: "/icons/icon-192x192.png",
          tag: "daily-verse",
        });
      }
    },
    [permission]
  );

  // Schedule check: when app opens, check if it's past 8AM and notification hasn't been shown
  const checkAndNotify = useCallback(
    async (text: string, reference: string) => {
      if (!enabled || permission !== "granted") return;

      const now = new Date();
      const hour = now.getHours();
      if (hour >= 8) {
        await showVerseNotification(text, reference);
      }
    },
    [enabled, permission, showVerseNotification]
  );

  return {
    permission,
    enabled,
    requestPermission,
    disableNotifications,
    checkAndNotify,
    showVerseNotification,
  };
}
