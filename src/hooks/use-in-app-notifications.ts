import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface InAppNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  data: unknown;
  created_at: string;
}

const LAST_SEEN_KEY = "pregai_notif_last_seen";

export function useInAppNotifications() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const lastSeen = localStorage.getItem(LAST_SEEN_KEY) || "2000-01-01T00:00:00Z";

  // Fetch recent notifications
  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("in_app_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data as InAppNotification[]);
        setUnreadCount(data.filter((n: InAppNotification) => n.created_at > lastSeen).length);
      }
    };
    fetch();
  }, [lastSeen]);

  // Subscribe to realtime inserts
  useEffect(() => {
    const channel = supabase
      .channel("in-app-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "in_app_notifications" },
        (payload) => {
          const newNotif = payload.new as InAppNotification;
          setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAllRead = useCallback(() => {
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, markAllRead };
}
