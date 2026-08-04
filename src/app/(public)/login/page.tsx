import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

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

          <LoginForm />
        </div>
      </section>
    </main>
  );
}
