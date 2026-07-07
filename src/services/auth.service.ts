import { prisma } from "@/lib/prisma";
import { createSession, getPasswordHashRounds,hashPassword, logout, verifyPassword } from "@/lib/auth";

export async function registerUser(input: {
  user_name: string;
  email: string;
  password: string;
}) {
  const userName = input.user_name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!userName || !email || !password) {
    return {
      success: false,
      message: "กรอกข้อมูลให้ครบ",
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      message: "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร",
    };
  }

  const existingUser = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return {
      success: false,
      message: "อีเมลนี้ถูกใช้งานแล้ว",
    };
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
    select: {
      user_id: true,
      user_uuid: true,
      user_name: true,
      email: true,
      role_id: true,
      created_at: true,
    },
  });

  await createSession(user.user_id);

  return {
    success: true,
    user,
  };
}

export async function loginUser(input: {
  email: string;
  password: string;
}) {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    return {
      success: false,
      message: "กรอกอีเมลและรหัสผ่าน",
    };
  }

  const user = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!user || user.deleted_at || !user.is_active) {
    return {
      success: false,
      message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    };
  }

  const passwordOk = await verifyPassword(password, user.password);

  if (!passwordOk) {
    return {
      success: false,
      message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    };
  }

  const currentRounds = getPasswordHashRounds(user.password);
    if (currentRounds > 10) {
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

  await createSession(user.user_id);

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