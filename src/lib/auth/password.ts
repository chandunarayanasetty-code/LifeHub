import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";

/**
 * Password hashing with Node's built-in scrypt.
 *
 * scrypt is deliberately slow and memory-hard, which makes offline guessing of
 * a stolen hash expensive. Each password gets its own random salt, so two users
 * with the same password do not share a hash.
 *
 * Stored format: scrypt$N$r$p$saltHex$hashHex
 */

const KEY_LENGTH = 64;
const SCRYPT_PARAMS = { N: 16_384, r: 8, p: 1 } as const;
const MAX_MEMORY = 64 * 1024 * 1024;

function scrypt(
  password: string,
  salt: string,
  keyLength: number,
  params: { N: number; r: number; p: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(
      password.normalize("NFKC"),
      salt,
      keyLength,
      { ...params, maxmem: MAX_MEMORY },
      (error, derivedKey) => {
        if (error) reject(error);
        else resolve(derivedKey);
      },
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, KEY_LENGTH, SCRYPT_PARAMS);
  const { N, r, p } = SCRYPT_PARAMS;
  return `scrypt$${N}$${r}$${p}$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, rawN, rawR, rawP, salt, rawHash] = parts;
  const params = { N: Number(rawN), r: Number(rawR), p: Number(rawP) };

  if (
    !Number.isInteger(params.N) ||
    !Number.isInteger(params.r) ||
    !Number.isInteger(params.p) ||
    !salt ||
    !rawHash
  ) {
    return false;
  }

  let expected: Buffer;
  try {
    expected = Buffer.from(rawHash, "hex");
  } catch {
    return false;
  }
  if (expected.length === 0) return false;

  try {
    const actual = await scrypt(password, salt, expected.length, params);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
