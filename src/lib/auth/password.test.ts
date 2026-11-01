import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("stores a salted scrypt hash, never the password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash.startsWith("scrypt$16384$8$1$")).toBe(true);
    expect(hash).not.toContain("correct horse battery staple");
    expect(hash.split("$")).toHaveLength(6);
  });

  it("uses a fresh salt for every hash", async () => {
    const first = await hashPassword("same password");
    const second = await hashPassword("same password");
    expect(first).not.toBe(second);
    await expect(verifyPassword("same password", first)).resolves.toBe(true);
    await expect(verifyPassword("same password", second)).resolves.toBe(true);
  });

  it("accepts the right password and rejects the wrong one", async () => {
    const hash = await hashPassword("lifehub-demo-2026");
    await expect(verifyPassword("lifehub-demo-2026", hash)).resolves.toBe(true);
    await expect(verifyPassword("lifehub-demo-2027", hash)).resolves.toBe(false);
    await expect(verifyPassword("", hash)).resolves.toBe(false);
  });

  it("normalises unicode before hashing", async () => {
    const hash = await hashPassword("café");
    // The decomposed form should verify against the composed hash.
    await expect(verifyPassword("cafe\u0301", hash)).resolves.toBe(true);
  });

  it("rejects malformed stored values instead of throwing", async () => {
    await expect(verifyPassword("anything", "")).resolves.toBe(false);
    await expect(verifyPassword("anything", "plain-text")).resolves.toBe(false);
    await expect(verifyPassword("anything", "bcrypt$1$2$3$4$5")).resolves.toBe(false);
    await expect(verifyPassword("anything", "scrypt$x$8$1$salt$hash")).resolves.toBe(
      false,
    );
  });
});
