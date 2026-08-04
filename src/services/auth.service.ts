import { prisma } from "@/lib/prisma";
import {
  createSession,
  getPasswordHashRounds,
  hashPassword,
  logout,
  verifyPassword,
} from "@/lib/auth";

const TARGET_PASSWORD_ROUNDS = 10;

type AuthFailure = {
  success: false;
  message: string;
  status: number;
};

type AuthUser = {
  user_id: number;
  user_uuid: string;
  user_name: string;
  email: string;
  role_id: number;
  created_at?: Date;
};

type AuthResult =
  | AuthFailure
  | {
      success: true;
      user: AuthUser;
    };

function authFailure(message: string, status: number): AuthFailure {
  return {
    success: false,
    message,
    status,
  };
}

export async function registerUser(input: {
  user_name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const userName = input.user_name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!userName || !email || !password) {
    return authFailure("กรอกข้อมูลให้ครบ", 400);
  }

  if (password.length < 8) {
    return authFailure("รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร", 400);
  }

  const existingUser = await prisma.users.findUnique({
    where: {
      email,
    },
    select: {
      user_id: true,
    },
  });

  if (existingUser) {
    return authFailure("อีเมลนี้ถูกใช้งานแล้ว", 409);
  }

  const role = await prisma.roles.upsert({
    where: {
      role_name: "user",
    },
    update: {},
    create: {
      role_name: "user",
    },
    select: {
      role_id: true,
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
    select: {
      user_id: true,
      user_uuid: true,
      user_name: true,
      email: true,
      role_id: true,
      created_at: true,
    },
  });

  await createSession({
    user_id: user.user_id,
    user_uuid: user.user_uuid,
  });

  return {
    success: true,
    user,
  };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    return authFailure("กรอกอีเมลและรหัสผ่าน", 400);
  }

  const user = await prisma.users.findUnique({
    where: {
      email,
    },
    select: {
      user_id: true,
      user_uuid: true,
      user_name: true,
      email: true,
      password: true,
      role_id: true,
      is_active: true,
      deleted_at: true,
    },
  });

  if (!user || user.deleted_at || !user.is_active) {
    return authFailure("อีเมลหรือรหัสผ่านไม่ถูกต้อง", 401);
  }

  const passwordOk = await verifyPassword(password, user.password);

  if (!passwordOk) {
    return authFailure("อีเมลหรือรหัสผ่านไม่ถูกต้อง", 401);
  }

  const currentRounds = getPasswordHashRounds(user.password);
  if (currentRounds < TARGET_PASSWORD_ROUNDS) {
    await prisma.users.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        password: await hashPassword(password),
        updated_at: new Date(),
      },
    });
  }

  await createSession({
    user_id: user.user_id,
    user_uuid: user.user_uuid,
  });

  return {
    success: true,
    user: {
      user_id: user.user_id,
      user_uuid: user.user_uuid,
      user_name: user.user_name,
      email: user.email,
      role_id: user.role_id,
    },
  };
}

export async function logoutUser() {
  await logout();

  return {
    success: true,
  };
}
