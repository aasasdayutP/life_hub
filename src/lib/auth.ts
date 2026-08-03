import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { encryptSessionToken,decryptSessionToken } from "./session-token";

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

// function createPlainSessionToken() {
//   return crypto.randomBytes(32).toString("base64url");
// }

// function hashSessionToken(token: string) {
//   return crypto.createHash("sha256").update(token).digest("hex");
// }

export async function createSession(user:{
  user_id: number;
  user_uuid: string;
}) {
  // const token = createPlainSessionToken();
  // const tokenHash = hashSessionToken(token);
  
  // ยังเอา crypto ไว้เพราะเอาไว้สุ่มไว้จะได้ไม่ต้องแก้ schema 5555
  const tokenHash = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  
  const session = await prisma.sessions.create({
    data: {
      user_id: user.user_id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    },
    select: {
      session_id: true,
    }
  });
  
  const token = await encryptSessionToken({
      session_id: session.session_id, 
      user_id: user.user_id,
      user_uuid: user.user_uuid,
    }, 
    expiresAt
  );
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

  let payload;
  try {
    payload = await decryptSessionToken(token);
  } catch (error) {
    return null;
  }

  const session = await prisma.sessions.findFirst({
    where: {
      session_id: payload.session_id,
      user_id: payload.user_id,
      deleted_at: null,
      expires_at: {
        gt: new Date(),
      },
      users: {
        user_uuid: payload.user_uuid,
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
  // const tokenHash = hashSessionToken(token);

  // const queryStart = Date.now();

  // const session = await prisma.sessions.findFirst({
  //   where: {
  //     token_hash: tokenHash,
  //     deleted_at: null,
  //     expires_at: {
  //       gt: new Date(),
  //     },
  //     users: {
  //       deleted_at: null,
  //       is_active: true,
  //     },
  //   },
    
  // });


  // console.log(`[AUTH] session query ${Date.now() - queryStart}ms`);
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
    try {
      const payload = await decryptSessionToken(token);

    await prisma.sessions.updateMany({
      where: {
        session_id: payload.session_id,
        user_id: payload.user_id,
        deleted_at: null,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  }catch {
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
  }
}