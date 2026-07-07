"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  hashPassword,
  logout,
  verifyPassword,
} from "@/lib/auth";

export async function registerAction(formData: FormData) {
  const userName = String(formData.get("user_name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!userName || !email || !password) {
    redirect("/register?error=missing");
  }

  if (password.length < 6) {
    redirect("/register?error=password_short");
  }

  const existingUser = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    redirect("/register?error=email_used");
  }

  const role = await prisma.roles.upsert({
    where: {
      role_name: "user",
    },
    update: {},
    create: {
      role_name: "user",
    },
  });

  const user = await prisma.users.create({
    data: {
      user_name: userName,
      email,
      password: await hashPassword(password),
      role_id: role.role_id,
      is_active: true,
    },
  });

  await createSession(user.user_id);

  redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect("/login?error=missing");
  }

  const user = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!user || user.deleted_at || !user.is_active) {
    redirect("/login?error=invalid");
  }

  const isValidPassword = await verifyPassword(password, user.password);

  if (!isValidPassword) {
    redirect("/login?error=invalid");
  }

  await createSession(user.user_id);

  redirect("/dashboard");
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}