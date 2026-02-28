import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Web Push crypto utilities for Deno
async function generatePushPayload(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
) {
  // Use the web-push approach with fetch directly
  // For Deno, we'll use the simpler JWT-based VAPID approach
  const audience = new URL(subscription.endpoint).origin;
  
  // Create VAPID JWT
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    aud: audience,
    exp: now + 60 * 60 * 12,
    sub: "mailto:contato@palavraai.site",
  };

  // Import the VAPID private key
  const rawKey = base64UrlDecode(vapidPrivateKey);
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    rawKey,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const encodedHeader = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(claims)));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert DER signature to raw r||s format
  const rawSig = derToRaw(new Uint8Array(signature));
  const encodedSignature = base64UrlEncode(rawSig);
  const jwt = `${unsignedToken}.${encodedSignature}`;

  // Encrypt the payload using the subscription keys
  const encrypted = await encryptPayload(
    payload,
    subscription.p256dh,
    subscription.auth
  );

  return { jwt, vapidPublicKey, encrypted };
}

function derToRaw(der: Uint8Array): Uint8Array {
  // DER signature format: 0x30 [total-length] 0x02 [r-length] [r] 0x02 [s-length] [s]
  const raw = new Uint8Array(64);
  let offset = 2; // skip 0x30 and total length
  
  // Read r
  offset++; // skip 0x02
  let rLen = der[offset++];
  let rStart = offset;
  if (rLen === 33 && der[rStart] === 0) { rStart++; rLen--; }
  raw.set(der.slice(rStart, rStart + Math.min(rLen, 32)), 32 - Math.min(rLen, 32));
  offset = rStart + (der[offset - 1] === 33 ? 32 : rLen);
  if (der[offset - 1] === 0) offset++;
  
  // Read s  
  offset++; // skip 0x02
  let sLen = der[offset++];
  let sStart = offset;
  if (sLen === 33 && der[sStart] === 0) { sStart++; sLen--; }
  raw.set(der.slice(sStart, sStart + Math.min(sLen, 32)), 64 - Math.min(sLen, 32));
  
  return raw;
}

async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<Uint8Array> {
  const payloadBytes = new TextEncoder().encode(payload);

  // Import subscriber's public key
  const subPubKeyBytes = base64UrlDecode(p256dhKey);
  const subPubKey = await crypto.subtle.importKey(
    "raw",
    subPubKeyBytes,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // Generate ephemeral key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: "ECDH", public: subPubKey },
    localKeyPair.privateKey,
    256
  );

  const authBytes = base64UrlDecode(authSecret);
  const localPubKeyBytes = await crypto.subtle.exportKey("raw", localKeyPair.publicKey);

  // PRK
  const ikm = new Uint8Array(sharedSecret);
  const prk = await hmacSha256(new Uint8Array(authBytes), ikm);

  // Derive content encryption key info
  const cekInfo = createInfo("aesgcm", new Uint8Array(subPubKeyBytes), new Uint8Array(localPubKeyBytes));
  const contentEncryptionKey = await hmacSha256(prk, concatBuffers(cekInfo, new Uint8Array([1])));
  const cek = contentEncryptionKey.slice(0, 16);

  // Derive nonce info
  const nonceInfo = createInfo("nonce", new Uint8Array(subPubKeyBytes), new Uint8Array(localPubKeyBytes));
  const nonceBytes = await hmacSha256(prk, concatBuffers(nonceInfo, new Uint8Array([1])));
  const nonce = nonceBytes.slice(0, 12);

  // Add padding
  const padding = new Uint8Array(2);
  const paddedPayload = concatBuffers(padding, payloadBytes);

  // Encrypt
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    key,
    paddedPayload
  );

  // Build the body: salt (16) + rs (4) + idlen (1) + keyid (65) + encrypted
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, paddedPayload.byteLength + 16 + 1);
  const idlen = new Uint8Array([65]);
  const localPubBytes = new Uint8Array(localPubKeyBytes);

  return concatBuffers(salt, rs, idlen, localPubBytes, new Uint8Array(encrypted));
}

function createInfo(type: string, clientPublicKey: Uint8Array, serverPublicKey: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const result = concatBuffers(
    new TextEncoder().encode("Content-Encoding: "),
    typeBytes,
    new Uint8Array([0]),
    new TextEncoder().encode("P-256"),
    new Uint8Array([0]),
    new Uint8Array([0, clientPublicKey.length]),
    clientPublicKey,
    new Uint8Array([0, serverPublicKey.length]),
    serverPublicKey
  );
  return result;
}

async function hmacSha256(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
  return new Uint8Array(sig);
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
      const char = dateStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
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
        const { jwt, encrypted } = await generatePushPayload(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          notificationPayload,
          vapidPublicKey,
          vapidPrivateKey
        );

        const localPubKeyBytes = encrypted.slice(21, 86);
        const encryptedPayload = encrypted;

        const resp = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Encoding": "aesgcm",
            "Crypto-Key": `dh=${base64UrlEncode(localPubKeyBytes)};p256ecdsa=${vapidPublicKey}`,
            Authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
            TTL: "86400",
            Urgency: "normal",
          },
          body: encryptedPayload,
        });

        if (resp.status === 201 || resp.status === 200) {
          sent++;
        } else if (resp.status === 404 || resp.status === 410) {
          staleEndpoints.push(sub.endpoint);
          failed++;
        } else {
          console.error(`Push failed for ${sub.endpoint}: ${resp.status} ${await resp.text()}`);
          failed++;
        }
      } catch (e) {
        console.error(`Push error for ${sub.endpoint}:`, e);
        failed++;
      }
    }

    // Clean up stale subscriptions
    if (staleEndpoints.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", staleEndpoints);
      console.log(`Cleaned ${staleEndpoints.length} stale subscriptions`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: dateStr,
        verse: verseRef,
        sent,
        failed,
        total: subscriptions?.length || 0,
      }),
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
