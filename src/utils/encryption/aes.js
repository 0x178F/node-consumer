import crypto from 'crypto';

const iv = Buffer.alloc(16);

/**
 * Encrypts plain text using AES-192-CBC encryption.
 *
 * @param {string} plainText - The plain text to encrypt.
 * @param {string} key - The encryption key.
 * @returns {string} The encrypted text.
 */
export const encrpyt = (plainText, key) => {
  const aes = crypto.createCipheriv('aes-192-cbc', key, iv);
  let encrypted = aes.update(plainText, 'utf8', 'base64');
  encrypted += aes.final('base64');
  return encrypted;
};

/**
 * Decrypts cipher text using AES-192-CBC decryption.
 *
 * @param {string} cipherText - The cipher text to decrypt.
 * @param {string} key - The decryption key.
 * @returns {string} The decrypted text.
 */
export const decrypt = (cipherText, key) => {
  const aes = crypto.createDecipheriv('aes-192-cbc', key, iv);
  let decrypted = aes.update(cipherText, 'base64', 'utf8');
  decrypted += aes.final('utf8');
  return decrypted;
};
