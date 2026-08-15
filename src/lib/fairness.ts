// Provably-fair engine: HMAC-SHA256(serverSeed, "clientSeed:nonce:cursor") -> uniform floats in [0, 1).
// The server seed's SHA-256 hash is shown before any bets are placed (commitment).
// Rotating the seed reveals the previous server seed so every past round can be re-verified.

function bytesToHex(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function randomHex(byteLength = 32): string {
  const arr = new Uint8Array(byteLength);
  crypto.getRandomValues(arr);
  return bytesToHex(arr);
}

export async function sha256Hex(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(digest);
}

export async function hmacSha256Hex(keyHex: string, message: string): Promise<string> {
  const keyBytes = new TextEncoder().encode(keyHex);
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  return bytesToHex(signature);
}

/** Derive `count` independent floats in [0, 1) for a given bet round. */
export async function fairFloats(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  count: number
): Promise<number[]> {
  const floats: number[] = [];
  let cursor = 0;
  while (floats.length < count) {
    const hex = await hmacSha256Hex(serverSeed, `${clientSeed}:${nonce}:${cursor}`);
    // consume the 256-bit hash in 4-byte (8 hex char) chunks
    for (let i = 0; i + 8 <= hex.length && floats.length < count; i += 8) {
      const chunk = parseInt(hex.slice(i, i + 8), 16);
      floats.push(chunk / 0x100000000);
    }
    cursor += 1;
  }
  return floats;
}

export async function fairFloat(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<number> {
  const [f] = await fairFloats(serverSeed, clientSeed, nonce, 1);
  return f;
}

/** Fisher-Yates shuffle of [0, n) driven by provably-fair floats (used by Mines). */
export async function fairShuffledIndices(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  n: number
): Promise<number[]> {
  const floats = await fairFloats(serverSeed, clientSeed, nonce, n);
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(floats[i] * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
