import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { cache } from "react";

const SESSION_COOKIE_NAME = "lifehub_session";
const SESSION_DAYS = 30;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function getPasswordHashRounds(hashedPassword: string) {
  return bcrypt.getRounds(hashedPassword);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

function createPlainSessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function hashSessionToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number) {
  const token = createPlainSessionToken();
  const tokenHash = hashSessionToken(token);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  await prisma.sessions.create({
    data: {
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export const getCurrentUser = cache(async () => {
  const totalStart = Date.now();

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    console.log(`[AUTH] no token ${Date.now() - totalStart}ms`);
    return null;
  }

  const tokenHash = hashSessionToken(token);

  const queryStart = Date.now();

  const session = await prisma.sessions.findFirst({
    where: {
      token_hash: tokenHash,
      deleted_at: null,
      expires_at: {
        gt: new Date(),
      },
      users: {
        deleted_at: null,
        is_active: true,
      },
    },
    select: {
      users: {
        select: {
          user_id: true,
          user_uuid: true,
          user_name: true,
          email: true,
          role_id: true,
          is_active: true,
          roles: {
            select: {
              role_name: true,
            },
          },
        },
      },
    },
  });

  console.log(`[AUTH] session query ${Date.now() - queryStart}ms`);
  console.log(`[AUTH] total ${Date.now() - totalStart}ms`);

  if (!session) return null;

  return session.users;
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const tokenHash = hashSessionToken(token);

    await prisma.sessions.updateMany({
      where: {
        token_hash: tokenHash,
        deleted_at: null,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}