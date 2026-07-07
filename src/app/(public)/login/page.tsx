import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/(public)/actions";
import { getCurrentUser } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const errorMessage = getErrorMessage(params?.error);

  return (
    <main className="flex min-h-screen bg-white">
      <section className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 to-blue-500 p-12 text-white lg:flex">
        <div className="absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-blue-700/20 blur-3xl" />

        <div className="z-10 max-w-md text-center">
          <div className="mb-6 text-6xl">🪐</div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight">Life Hub</h1>
          <p className="text-lg leading-relaxed text-blue-100">
            Your Personal Command Center.
            <br />
            Organize your life, clear your mind, and achieve your goals.
          </p>
        </div>
      </section>

      <section className="relative flex flex-1 items-center justify-center bg-white p-6 sm:p-12">
        <div className="absolute left-8 top-8 flex items-center gap-2 text-xl font-bold text-blue-600 lg:hidden">
          <span className="text-3xl">🪐</span>
          Life Hub
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">
              Welcome back
            </h2>
            <p className="mt-2 text-slate-500">
              Please enter your details to access your hub.
            </p>
          </div>

          {errorMessage ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {errorMessage}
            </div>
          ) : null}

          <form action={loginAction} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  name="email"
                  type="email"
                  required
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-500/30 transition-all hover:bg-blue-700 active:scale-[0.98]"
            >
              Sign in →
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Register
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function getErrorMessage(error?: string) {
  if (!error) return null;

  const messages: Record<string, string> = {
    missing: "กรอกอีเมลและรหัสผ่านก่อน",
    invalid: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  };

  return messages[error] || "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง";
}