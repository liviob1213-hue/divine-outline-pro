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

// ─── HMAC-SHA256 ───────────────────────────────────
async function hmacSha256(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, data));
}

// ─── HKDF ──────────────────────────────────────────
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const prk = await hmacSha256(salt.length ? salt : new Uint8Array(32), ikm);
  const infoAndOne = concatBuffers(info, new Uint8Array([1]));
  const okm = await hmacSha256(prk, infoAndOne);
  return okm.slice(0, length);
}

// ─── Create info for HKDF ──────────────────────────
function createInfo(type: string, clientPub: Uint8Array, serverPub: Uint8Array): Uint8Array {
  const encoder = new TextEncoder();
  return concatBuffers(
    encoder.encode("Content-Encoding: "),
    encoder.encode(type),
    new Uint8Array([0]),
    encoder.encode("P-256"),
    new Uint8Array([0]),
    new Uint8Array([(clientPub.length >> 8) & 0xff, clientPub.length & 0xff]),
    clientPub,
    new Uint8Array([(serverPub.length >> 8) & 0xff, serverPub.length & 0xff]),
    serverPub,
  );
}

// ─── VAPID JWT ─────────────────────────────────────
async function createVapidJwt(audience: string, vapidPrivateKeyB64: string, vapidPublicKeyB64: string): Promise<string> {
  const rawPrivateKey = base64UrlDecode(vapidPrivateKeyB64);
  const rawPublicKey = base64UrlDecode(vapidPublicKeyB64);
  
  
  
  // Public key is 65 bytes: 0x04 || x (32) || y (32)
  const x = base64UrlEncode(rawPublicKey.slice(1, 33));
  const y = base64UrlEncode(rawPublicKey.slice(33, 65));
  const d = base64UrlEncode(rawPrivateKey);

  const jwk = { kty: "EC", crv: "P-256", x, y, d, ext: true };
  

  const privateKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
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

  // Deno returns raw r||s (64 bytes), not DER — use directly if 64 bytes
  const rawSig = signature.length === 64 ? signature : derToRaw(signature);
  return `${unsignedToken}.${base64UrlEncode(rawSig)}`;
}

function derToRaw(der: Uint8Array): Uint8Array {
  const raw = new Uint8Array(64);
  // DER: 0x30 [len] 0x02 [rLen] [r...] 0x02 [sLen] [s...]
  let pos = 2; // skip 0x30 + total length
  
  // R
  pos++; // skip 0x02
  const rLen = der[pos++];
  const rBytes = der.slice(pos, pos + rLen);
  pos += rLen;
  // Remove leading zero if present, right-pad to 32
  const rTrimmed = rBytes[0] === 0 && rLen > 32 ? rBytes.slice(1) : rBytes;
  raw.set(rTrimmed, 32 - rTrimmed.length);

  // S
  pos++; // skip 0x02
  const sLen = der[pos++];
  const sBytes = der.slice(pos, pos + sLen);
  const sTrimmed = sBytes[0] === 0 && sLen > 32 ? sBytes.slice(1) : sBytes;
  raw.set(sTrimmed, 64 - sTrimmed.length);

  return raw;
}

// ─── Encrypt push payload (aesgcm) ────────────────
async function encryptPushPayload(
  payloadText: string,
  p256dhB64: string,
  authB64: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  const payloadBytes = new TextEncoder().encode(payloadText);
  const authBytes = base64UrlDecode(authB64);
  const subPubBytes = base64UrlDecode(p256dhB64);

  // Import subscriber's public key
  const subPubKey = await crypto.subtle.importKey(
    "raw", subPubBytes, { name: "ECDH", namedCurve: "P-256" }, false, []
  );

  // Generate ephemeral key pair for this message
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]
  );

  // ECDH shared secret
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits(
    { name: "ECDH", public: subPubKey }, localKeyPair.privateKey, 256
  ));

  const localPubBytes = new Uint8Array(await crypto.subtle.exportKey("raw", localKeyPair.publicKey));

  // IKM = HKDF(auth, sharedSecret, "Content-Encoding: auth\0", 32)
  const authInfo = new TextEncoder().encode("Content-Encoding: auth\0");
  const ikm = await hkdf(authBytes, sharedSecret, authInfo, 32);

  // Generate 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // CEK = HKDF(salt, ikm, cekInfo, 16)
  const cekInfo = createInfo("aesgcm", subPubBytes, localPubBytes);
  const cek = await hkdf(salt, ikm, cekInfo, 16);

  // Nonce = HKDF(salt, ikm, nonceInfo, 12)
  const nonceInfo = createInfo("nonce", subPubBytes, localPubBytes);
  const nonce = await hkdf(salt, ikm, nonceInfo, 12);

  // Pad payload (2-byte BE padding length + padding + payload)
  const paddingLen = 0;
  const padded = concatBuffers(
    new Uint8Array([(paddingLen >> 8) & 0xff, paddingLen & 0xff]),
    payloadBytes
  );

  // AES-128-GCM encrypt
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce }, key, padded
  ));

  return { ciphertext: encrypted, salt, localPublicKey: localPubBytes };
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
  const { ciphertext, salt, localPublicKey } = await encryptPushPayload(payload, sub.p256dh, sub.auth);

  const resp = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aesgcm",
      "Encryption": `salt=${base64UrlEncode(salt)}`,
      "Crypto-Key": `dh=${base64UrlEncode(localPublicKey)};p256ecdsa=${vapidPublicKey}`,
      "Authorization": `vapid t=${jwt}, k=${vapidPublicKey}`,
      "TTL": "86400",
      "Urgency": "normal",
    },
    body: ciphertext,
  });

  const body = await resp.text();
  return { status: resp.status, body };
}

// ─── Main handler ──────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Save notification to in_app_notifications (deduplicate per day)
    const { data: existingNotif } = await supabase
      .from("in_app_notifications")
      .select("id")
      .eq("type", "daily-verse")
      .gte("created_at", `${dateStr}T00:00:00Z`)
      .limit(1);

    if (!existingNotif?.length) {
      await supabase.from("in_app_notifications").insert({
        title: "📖 Versículo do Dia",
        body: `"${verseText.slice(0, 150)}${verseText.length > 150 ? "..." : ""}" — ${verseRef}`,
        type: "daily-verse",
        data: { url: "/", verse: verseRef },
      });
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
        const result = await sendPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          notificationPayload,
          vapidPublicKey,
          vapidPrivateKey
        );

        console.log(`Push to ${sub.endpoint.slice(0, 60)}...: ${result.status} ${result.body.slice(0, 200)}`);

        if (result.status === 201 || result.status === 200) {
          sent++;
        } else if (result.status === 404 || result.status === 410) {
          staleEndpoints.push(sub.endpoint);
          failed++;
        } else {
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

    return new Response(
      JSON.stringify({ success: true, date: dateStr, verse: verseRef, sent, failed, total: subscriptions?.length || 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-daily-verse error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
