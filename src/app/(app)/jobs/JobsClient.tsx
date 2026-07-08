"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type JobItem = {
  job_id: number;
  job_uuid: string;
  job_name: string;
  description: string | null;
  due_date: string | null;
  notify_at: string | null;
  completed_at: string | null;
  job_status: {
    status_name: string;
  };
};

export default function JobsClient() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/jobs", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "โหลดงานไม่สำเร็จ");
        }

        if (!cancelled) {
          setJobs(result.data.jobs || []);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "โหลดงานไม่สำเร็จ"
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  const today = getTodayRange();

  const pendingCount = jobs.filter(
    (job) => job.job_status.status_name.toLowerCase() === "pending"
  ).length;

  const dueTodayCount = jobs.filter((job) => {
    if (!job.due_date) return false;

    const dueDate = new Date(job.due_date);
    return dueDate >= today.start && dueDate < today.end;
  }).length;

  const completedCount = jobs.filter((job) => job.completed_at !== null).length;

  const total = pendingCount + completedCount;
  const dailyGoal =
    total === 0 ? 0 : Math.round((completedCount / total) * 100);

  return (
    <div className="mx-auto w-full max-w-[1400px] p-4 lg:p-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
              To-Do List 📝
            </h1>
            <p className="mt-2 text-slate-500">
              Manage your daily tasks and priorities.
            </p>
          </div>

          <Link
            href="/jobs/new"
            prefetch={false}
            className="hidden items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm shadow-blue-500/30 transition-colors hover:bg-blue-700 lg:flex"
          >
            + New Task
          </Link>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          <SummaryCard
            title="Pending"
            value={pendingCount}
            icon="⏳"
            tone="orange"
          />
          <SummaryCard
            title="Due Today"
            value={dueTodayCount}
            icon="📅"
            tone="blue"
          />
          <SummaryCard
            title="Completed"
            value={completedCount}
            icon="✅"
            tone="emerald"
          />

          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-slate-900 p-5 text-white shadow-md lg:p-6">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
            <div>
              <span className="text-sm font-medium text-slate-300">
                Daily Goal
              </span>
              <div className="mt-1 text-3xl font-bold">{dailyGoal}%</div>
            </div>

            <div className="mt-4">
              <div className="h-2 w-full rounded-full bg-slate-700">
                <div
                  className="h-2 rounded-full bg-blue-400"
                  style={{ width: `${dailyGoal}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-600">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <JobsSkeleton />
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-lg font-bold text-slate-800">ยังไม่มีงาน</p>
            <p className="mt-2 text-sm text-slate-500">
              เริ่มจากสร้าง task แรกก่อน
            </p>

            <Link
              href="/jobs/new"
              prefetch={false}
              className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              + New Task
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <section className="space-y-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  🔥 Today's Focus
                </h2>
              </div>

              <div className="space-y-3">
                {jobs.map((job) => (
                  <Link
                    key={job.job_id}
                    href={`/jobs/${job.job_uuid}`}
                    prefetch={false}
                    className="group flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-blue-300 lg:p-5"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 flex-shrink-0 cursor-pointer rounded border-2 border-slate-300 text-blue-600 transition-all focus:ring-blue-500"
                      defaultChecked={job.completed_at !== null}
                      readOnly
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
                        {job.job_name}
                      </p>

                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {job.description || "ไม่มีรายละเอียดสั้น"}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                          {job.job_status.status_name}
                        </span>

                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          🕒 {formatDate(job.due_date)}
                        </span>

                        {job.notify_at ? (
                          <span className="rounded-md bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-600">
                            🔔 {formatDate(job.notify_at)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <aside className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Filters</h2>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <ul className="space-y-2">
                  <li>
                    <button className="flex w-full items-center justify-between rounded-lg bg-blue-50 p-2 font-medium text-blue-700">
                      <span>☀ My Day</span>
                      <span>{dueTodayCount}</span>
                    </button>
                  </li>
                  <li>
                    <button className="flex w-full items-center justify-between rounded-lg p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                      <span>⭐ Important</span>
                      <span>0</span>
                    </button>
                  </li>
                  <li>
                    <button className="flex w-full items-center justify-between rounded-lg p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                      <span>📅 Planned</span>
                      <span>{jobs.length}</span>
                    </button>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: number;
  icon: string;
  tone: "orange" | "blue" | "emerald";
}) {
  const toneClass = {
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
  }[tone];

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md lg:p-6">
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-transform group-hover:scale-110 ${toneClass}`}
      >
        {icon}
      </div>
      <span className="text-sm font-medium text-slate-500">{title}</span>
      <div className="mt-1 text-3xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function JobsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

function formatDate(value: string | null) {
  if (!value) return "No due date";

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}