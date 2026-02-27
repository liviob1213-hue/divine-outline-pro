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

  // Sync permission state on mount
  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "unsupported" as const;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        localStorage.setItem(NOTIFICATION_KEY, "true");
        setEnabled(true);

        // Register for push if service worker available
        if ("serviceWorker" in navigator) {
          try {
            await navigator.serviceWorker.ready;
          } catch {
            // SW not ready yet, that's ok
          }
        }
      }
      return result;
    } catch {
      // Fallback for older browsers
      return "denied" as const;
    }
  }, []);

  const disableNotifications = useCallback(() => {
    localStorage.setItem(NOTIFICATION_KEY, "false");
    setEnabled(false);
  }, []);

  const showVerseNotification = useCallback(
    async (text: string, reference: string) => {
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      const today = new Date().toISOString().split("T")[0];
      const lastDate = localStorage.getItem(LAST_NOTIF_KEY);
      if (lastDate === today) return;

      localStorage.setItem(LAST_NOTIF_KEY, today);

      const body = `"${text.slice(0, 120)}${text.length > 120 ? "..." : ""}" — ${reference}`;
      const options: NotificationOptions = {
        body,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-96x96.png",
        tag: "daily-verse",
      };

      // Try service worker notification first (works in background on Android)
      if ("serviceWorker" in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          await reg.showNotification("📖 Versículo do Dia — PregAI", options);
          return;
        } catch {
          // Fallback to regular notification
        }
      }

      // Regular notification (works on desktop and some mobile)
      try {
        new Notification("📖 Versículo do Dia — PregAI", options);
      } catch {
        // Notification API not available
      }
    },
    []
  );

  const checkAndNotify = useCallback(
    async (text: string, reference: string) => {
      if (!enabled) return;
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      const now = new Date();
      if (now.getHours() >= 8) {
        await showVerseNotification(text, reference);
      }
    },
    [enabled, showVerseNotification]
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
