import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto w-full max-w-[1400px] p-4 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-blue-600">Life Hub</p>
          <h1 className="mt-2 text-3xl font-bold">
            Welcome, {user.user_name} 👋
          </h1>
          <p className="mt-2 text-slate-500">
            เข้าระบบสำเร็จแล้ว เดี๋ยวค่อยเอา Dashboard module grid มาใส่ตรงนี้
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Tasks</h2>
              <Link
                href="/jobs" prefetch={false}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Go to App
              </Link>
            </div>

            <p className="text-sm text-slate-500">
              โมดูล To-do list จะต่อ DB จริงตรงนี้
            </p>

            <Link
              href="/jobs/new" prefetch={false}
              className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              + Add Task
            </Link>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800">Drink Log</h2>
            <p className="mt-2 text-sm text-slate-500">Coming soon</p>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800">Habits</h2>
            <p className="mt-2 text-sm text-slate-500">Coming soon</p>
          </section>
        </div>
      </div>
    </div>
  );
}