"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ApiResponse = {
  success?: boolean;
  message?: string;
};

export default function RegisterForm() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    if (password.length < 8) {
      setErrorMessage("รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: userName,
          email,
          password,
        }),
      });

      const apiResponse = await readApiResponse(response);

      if (!response.ok || apiResponse?.success === false) {
        setErrorMessage(
          apiResponse?.message ?? getDefaultErrorMessage(response.status)
        );
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("สมัครสมาชิกไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {errorMessage ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {errorMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              name="user_name"
              type="text"
              required
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
              autoComplete="name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
              placeholder="อย่างน้อย 8 ตัวอักษร"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-500/30 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating account..." : "Create account →"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        มีบัญชีแล้ว?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}

async function readApiResponse(response: Response): Promise<ApiResponse | null> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    const payload: unknown = await response.json();

    if (!payload || typeof payload !== "object") {
      return null;
    }

    const body = payload as {
      success?: unknown;
      message?: unknown;
    };

    return {
      success: typeof body.success === "boolean" ? body.success : undefined,
      message: typeof body.message === "string" ? body.message : undefined,
    };
  } catch {
    return null;
  }
}

function getDefaultErrorMessage(status: number) {
  if (status === 400) {
    return "กรอกข้อมูลให้ครบ";
  }

  if (status === 409) {
    return "อีเมลนี้ถูกใช้งานแล้ว";
  }

  return "สมัครสมาชิกไม่สำเร็จ ลองใหม่อีกครั้ง";
}
