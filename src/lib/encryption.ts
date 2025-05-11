
"use client";

// Uses Web Crypto API for AES-GCM encryption.
// IMPORTANT: This is a simplified example for DEMO purposes.
// Robust key management (generation, storage, derivation from password) is crucial for production.

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12; // bytes for AES-GCM

// Function to derive a key from a passphrase (e.g., user's password or a generated key string)
// This is a crucial step for security. Using a proper KDF like PBKDF2 is essential.
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // Iteration count should be high
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Generates a new random salt
function generateSalt(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(16));
}


// Encrypts a Data URI string
export async function encryptDataUri(dataUri: string, keyString: string): Promise<string | null> {
  try {
    const salt = generateSalt(); // Generate a new salt for each encryption
    const key = await deriveKey(keyString, salt);
    
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataUri);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: ALGORITHM, iv: iv },
      key,
      dataBuffer
    );

    // Combine salt, iv, and ciphertext. Prepend salt and IV to the ciphertext.
    const saltAndIvAndCiphertext = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
    saltAndIvAndCiphertext.set(salt);
    saltAndIvAndCiphertext.set(iv, salt.length);
    saltAndIvAndCiphertext.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);
    
    // Return as a Base64 string (or another suitable format)
    // This base64 string is what you'd store or transmit.
    return btoa(String.fromCharCode(...saltAndIvAndCiphertext));

  } catch (error) {
    console.error("Encryption failed:", error);
    return null;
  }
}

// Decrypts a Base64 encoded encrypted string back to a Data URI
export async function decryptDataUri(encryptedBase64: string, keyString: string): Promise<string | null> {
  try {
    const saltAndIvAndCiphertext = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

    const salt = saltAndIvAndCiphertext.slice(0, 16);
    const iv = saltAndIvAndCiphertext.slice(16, 16 + IV_LENGTH);
    const ciphertext = saltAndIvAndCiphertext.slice(16 + IV_LENGTH);
    
    const key = await deriveKey(keyString, salt);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: ALGORITHM, iv: iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}

// Helper to convert ArrayBuffer to Base64 String
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert Base64 String to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}
