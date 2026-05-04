import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initOneSignal } from "./lib/onesignal";
import { supabase } from "./integrations/supabase/client";

// Initialize OneSignal (App ID fetched from edge function)
supabase.functions
  .invoke("get-onesignal-config", { body: {} })
  .then(({ data }) => {
    if (data?.appId) initOneSignal(data.appId);
  })
  .catch((e) => console.warn("[OneSignal] config fetch failed:", e));

createRoot(document.getElementById("root")!).render(<App />);
