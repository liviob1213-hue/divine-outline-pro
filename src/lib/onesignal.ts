declare global {
  interface Window {
    OneSignal?: any;
    OneSignalDeferred?: any[];
  }
}

let initPromise: Promise<void> | null = null;

export function initOneSignal(appId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!appId) return Promise.resolve();
  if (initPromise) return initPromise;

  initPromise = new Promise<void>((resolve) => {
    // Inject SDK script once
    if (!document.querySelector('script[data-onesignal-sdk]')) {
      const s = document.createElement("script");
      s.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
      s.defer = true;
      s.setAttribute("data-onesignal-sdk", "true");
      document.head.appendChild(s);
    }

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        await OneSignal.init({
          appId,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: "/OneSignalSDKWorker.js",
          serviceWorkerParam: { scope: "/" },
        });
      } catch (e) {
        console.error("[OneSignal] init error:", e);
      } finally {
        resolve();
      }
    });
  });

  return initPromise;
}

export async function promptPush(): Promise<void> {
  await initPromise;
  const OS = window.OneSignal;
  if (!OS) return;
  try {
    if (OS.Slidedown?.promptPush) {
      await OS.Slidedown.promptPush({ force: true });
    } else if (OS.Notifications?.requestPermission) {
      await OS.Notifications.requestPermission();
    }
  } catch (e) {
    console.error("[OneSignal] prompt error:", e);
  }
}

export function getPermission(): "granted" | "denied" | "default" | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission as any;
}