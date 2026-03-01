import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Base64URL helpers ─────────────────────────────
function base64UrlEncode(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function concatBuffers(...buffers: Uint8Array[]): Uint8Array {
  const totalLen = buffers.reduce((sum, b) => sum + b.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const buf of buffers) {
    result.set(buf, offset);
    offset += buf.length;
  }
  return result;
}

async function hmacSha256(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, data));
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const prk = await hmacSha256(salt.length ? salt : new Uint8Array(32), ikm);
  const infoAndOne = concatBuffers(info, new Uint8Array([1]));
  const okm = await hmacSha256(prk, infoAndOne);
  return okm.slice(0, length);
}

// ─── RFC 8188 / 8291 info creation (aes128gcm) ────
function createInfoAes128gcm(type: string, context: Uint8Array): Uint8Array {
  const encoder = new TextEncoder();
  return concatBuffers(
    encoder.encode("Content-Encoding: "),
    encoder.encode(type),
    new Uint8Array([0]),
    context,
  );
}

// ─── VAPID JWT ─────────────────────────────────────
async function createVapidJwt(audience: string, vapidPrivateKeyB64: string, vapidPublicKeyB64: string): Promise<string> {
  const rawPrivateKey = base64UrlDecode(vapidPrivateKeyB64);
  const rawPublicKey = base64UrlDecode(vapidPublicKeyB64);

  const x = base64UrlEncode(rawPublicKey.slice(1, 33));
  const y = base64UrlEncode(rawPublicKey.slice(33, 65));
  const d = base64UrlEncode(rawPrivateKey);

  const jwk = { kty: "EC", crv: "P-256", x, y, d, ext: true };

  const privateKey = await crypto.subtle.importKey(
    "jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]
  );

  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 60 * 60 * 12,
    sub: "mailto:contato@palavraai.site",
  };

  const encodedHeader = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signature = new Uint8Array(await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  ));

  const rawSig = signature.length === 64 ? signature : derToRaw(signature);
  return `${unsignedToken}.${base64UrlEncode(rawSig)}`;
}

function derToRaw(der: Uint8Array): Uint8Array {
  const raw = new Uint8Array(64);
  let pos = 2;
  pos++;
  const rLen = der[pos++];
  const rBytes = der.slice(pos, pos + rLen);
  pos += rLen;
  const rTrimmed = rBytes[0] === 0 && rLen > 32 ? rBytes.slice(1) : rBytes;
  raw.set(rTrimmed, 32 - rTrimmed.length);
  pos++;
  const sLen = der[pos++];
  const sBytes = der.slice(pos, pos + sLen);
  const sTrimmed = sBytes[0] === 0 && sLen > 32 ? sBytes.slice(1) : sBytes;
  raw.set(sTrimmed, 64 - sTrimmed.length);
  return raw;
}

// ─── Encrypt push payload (aes128gcm - RFC 8291) ──
async function encryptPushPayload(
  payloadText: string,
  p256dhB64: string,
  authB64: string
): Promise<{ body: Uint8Array; localPublicKey: Uint8Array }> {
  const payloadBytes = new TextEncoder().encode(payloadText);
  const authBytes = base64UrlDecode(authB64);
  const subPubBytes = base64UrlDecode(p256dhB64);

  const subPubKey = await crypto.subtle.importKey(
    "raw", subPubBytes, { name: "ECDH", namedCurve: "P-256" }, false, []
  );

  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]
  );

  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits(
    { name: "ECDH", public: subPubKey }, localKeyPair.privateKey, 256
  ));

  const localPubBytes = new Uint8Array(await crypto.subtle.exportKey("raw", localKeyPair.publicKey));

  // RFC 8291: IKM via auth secret
  const keyInfoAuth = new TextEncoder().encode("WebPush: info\0");
  const ikm_info = concatBuffers(keyInfoAuth, subPubBytes, localPubBytes);
  const ikm = await hkdf(authBytes, sharedSecret, ikm_info, 32);

  // Generate 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // CEK and nonce using aes128gcm content encoding
  const cekInfo = createInfoAes128gcm("aes128gcm", new Uint8Array(0));
  const cek = await hkdf(salt, ikm, cekInfo, 16);

  const nonceInfo = createInfoAes128gcm("nonce", new Uint8Array(0));
  const nonce = await hkdf(salt, ikm, nonceInfo, 12);

  // RFC 8188: payload + delimiter (0x02) for last record
  const padded = concatBuffers(payloadBytes, new Uint8Array([2]));

  // AES-128-GCM encrypt
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce }, key, padded
  ));

  // RFC 8188 header: salt (16) + rs (4) + idlen (1) + keyid (65)
  const rs = new Uint8Array(4);
  const rsView = new DataView(rs.buffer);
  rsView.setUint32(0, 4096);

  const header = concatBuffers(
    salt,
    rs,
    new Uint8Array([65]), // keyid length = 65 bytes (uncompressed P-256)
    localPubBytes,
  );

  return { body: concatBuffers(header, encrypted), localPublicKey: localPubBytes };
}

// ─── Send one push notification ────────────────────
async function sendPush(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ status: number; body: string }> {
  const audience = new URL(sub.endpoint).origin;
  const jwt = await createVapidJwt(audience, vapidPrivateKey, vapidPublicKey);
  const { body: encryptedBody } = await encryptPushPayload(payload, sub.p256dh, sub.auth);

  const resp = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      "Authorization": `vapid t=${jwt}, k=${vapidPublicKey}`,
      "TTL": "86400",
      "Urgency": "normal",
      "Content-Length": String(encryptedBody.length),
    },
    body: encryptedBody,
  });

  const respBody = await resp.text();
  return { status: resp.status, body: respBody };
}

// ─── Main handler ──────────────────────────────────
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("send-daily-verse: Starting...");
    console.log("VAPID public key length:", vapidPublicKey.length);
    console.log("VAPID private key length:", vapidPrivateKey.length);

    // Get daily verse
    const now = new Date();
    const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const dateStr = brt.toISOString().split("T")[0];

    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    let verseText = "";
    let verseRef = "";

    const { count } = await supabase
      .from("biblias")
      .select("id", { count: "exact", head: true })
      .eq("versao", "ARA");

    console.log("Bible verse count:", count);

    if (count && count > 0) {
      const offset = seed % count;
      const { data: verses } = await supabase
        .from("biblias")
        .select("livro_id, capitulo, versiculo, texto")
        .eq("versao", "ARA")
        .order("id", { ascending: true })
        .range(offset, offset);

      if (verses?.length) {
        const v = verses[0];
        const { data: book } = await supabase
          .from("livros_biblia")
          .select("nome")
          .eq("id", v.livro_id)
          .maybeSingle();
        verseText = v.texto;
        verseRef = `${book?.nome || "?"} ${v.capitulo}:${v.versiculo}`;
      }
    }

    if (!verseText) {
      const fallbacks = [
        { text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", ref: "João 3:16" },
        { text: "O Senhor é o meu pastor; nada me faltará.", ref: "Salmos 23:1" },
        { text: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
      ];
      const fb = fallbacks[seed % fallbacks.length];
      verseText = fb.text;
      verseRef = fb.ref;
    }

    console.log("Verse:", verseRef);

    // Save notification to in_app_notifications (deduplicate per day)
    const { data: existingNotif } = await supabase
      .from("in_app_notifications")
      .select("id")
      .eq("type", "daily-verse")
      .gte("created_at", `${dateStr}T00:00:00Z`)
      .limit(1);

    if (!existingNotif?.length) {
      const { error: insertError } = await supabase.from("in_app_notifications").insert({
        title: "📖 Versículo do Dia",
        body: `"${verseText.slice(0, 150)}${verseText.length > 150 ? "..." : ""}" — ${verseRef}`,
        type: "daily-verse",
        data: { url: "/", verse: verseRef },
      });
      if (insertError) console.error("Insert notification error:", insertError);
    } else {
      console.log("In-app notification already exists for today");
    }

    // Get all push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (subError) throw subError;

    console.log(`Sending daily verse to ${subscriptions?.length || 0} subscribers`);

    const notificationPayload = JSON.stringify({
      title: "📖 Versículo do Dia — Palavraai",
      body: `"${verseText.slice(0, 120)}${verseText.length > 120 ? "..." : ""}" — ${verseRef}`,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
      tag: "daily-verse",
      data: { url: "/" },
    });

    let sent = 0;
    let failed = 0;
    const staleEndpoints: string[] = [];

    for (const sub of subscriptions || []) {
      try {
        console.log(`Sending push to: ${sub.endpoint.slice(0, 80)}...`);
        const result = await sendPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          notificationPayload,
          vapidPublicKey,
          vapidPrivateKey
        );

        console.log(`Push result: status=${result.status}, body=${result.body.slice(0, 300)}`);

        if (result.status === 201 || result.status === 200) {
          sent++;
        } else if (result.status === 404 || result.status === 410) {
          staleEndpoints.push(sub.endpoint);
          failed++;
        } else {
          console.error(`Push failed with status ${result.status}: ${result.body}`);
          failed++;
        }
      } catch (e) {
        console.error(`Push error for ${sub.endpoint}:`, e);
        failed++;
      }
    }

    // Clean up stale subscriptions
    if (staleEndpoints.length > 0) {
      await supabase.from("push_subscriptions").delete().in("endpoint", staleEndpoints);
      console.log(`Cleaned ${staleEndpoints.length} stale subscriptions`);
    }

    const response = { success: true, date: dateStr, verse: verseRef, sent, failed, total: subscriptions?.length || 0 };
    console.log("send-daily-verse result:", JSON.stringify(response));

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-daily-verse error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown", stack: e instanceof Error ? e.stack : "" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
