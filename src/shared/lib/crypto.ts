const CRYPTO_KEY = import.meta.env.VITE_CRYPTO_KEY

async function getKey(): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(CRYPTO_KEY), c => c.charCodeAt(0))
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function encryptLink(link: string): Promise<string> {
  const key = await getKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(link)
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  const combined = new Uint8Array(iv.byteLength + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.byteLength)
  return btoa(String.fromCharCode(...combined))
}

export async function decryptLink(encryptedBase64: string): Promise<string> {
  const key = await getKey()
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0))
  const iv = combined.slice(0, 12)
  const encrypted = combined.slice(12)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)
  return new TextDecoder().decode(decrypted)
}
