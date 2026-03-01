import { useEffect, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const NOTIFICATION_KEY = "pregai_notification_enabled";
const PUSH_SUBSCRIBED_KEY = "pregai_push_subscribed";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return "default";
    return Notification.permission;
  });
  const [enabled, setEnabled] = useState(() => {
    // Only consider enabled if localStorage says so AND permission is granted
    const stored = localStorage.getItem(NOTIFICATION_KEY) === "true";
    if (stored && typeof window !== "undefined" && "Notification" in window) {
      // Sync: if browser permission was revoked externally, update localStorage
      if (Notification.permission !== "granted") {
        localStorage.setItem(NOTIFICATION_KEY, "false");
        return false;
      }
      return true;
    }
    return false;
  });

  useEffect(() => {
    if ("Notification" in window) {
      const current = Notification.permission;
      setPermission(current);
      // If permission was revoked, sync enabled state
      if (current !== "granted" && enabled) {
        localStorage.setItem(NOTIFICATION_KEY, "false");
        setEnabled(false);
      }
    }
  }, []);

  // Register push subscription when enabled
  useEffect(() => {
    if (!enabled) return;
    if (localStorage.getItem(PUSH_SUBSCRIBED_KEY) === "true") return;

    const subscribeToPush = async () => {
      try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

        // Register push service worker
        let registration = await navigator.serviceWorker.getRegistration("/sw-push.js");
        if (!registration) {
          registration = await navigator.serviceWorker.register("/sw-push.js", { scope: "/" });
          await new Promise<void>((resolve) => {
            if (registration!.active) { resolve(); return; }
            const sw = registration!.installing || registration!.waiting;
            if (sw) {
              sw.addEventListener("statechange", () => {
                if (sw.state === "activated") resolve();
              });
            } else {
              resolve();
            }
          });
        }

        // Fetch VAPID public key from edge function
        const { data: vapidData, error: vapidError } = await supabase.functions.invoke("get-vapid-key", { body: {} });
        if (vapidError || !vapidData?.publicKey) {
          console.warn("Could not get VAPID key");
          return;
        }

        const reg = registration as any;
        let subscription = await reg.pushManager.getSubscription();
        if (!subscription) {
          subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidData.publicKey),
          });
        }

        const email = localStorage.getItem("pregai_user_email") || "";
        await supabase.functions.invoke("subscribe-push", {
          body: {
            subscription: subscription.toJSON(),
            email,
          },
        });

        localStorage.setItem(PUSH_SUBSCRIBED_KEY, "true");
        console.log("[Palavraai] Push subscription registered");
      } catch (e) {
        console.error("[Palavraai] Push subscription failed:", e);
      }
    };

    subscribeToPush();
  }, [enabled]);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "unsupported" as const;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        localStorage.setItem(NOTIFICATION_KEY, "true");
        localStorage.removeItem(PUSH_SUBSCRIBED_KEY); // Force re-subscribe
        setEnabled(true);
      }
      return result;
    } catch {
      return "denied" as const;
    }
  }, []);

  const disableNotifications = useCallback(() => {
    localStorage.setItem(NOTIFICATION_KEY, "false");
    localStorage.removeItem(PUSH_SUBSCRIBED_KEY);
    setEnabled(false);
  }, []);

  return {
    permission,
    enabled,
    requestPermission,
    disableNotifications,
  };
}
