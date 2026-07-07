"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function NewJobPage() {
  const router = useRouter();

  const [jobName, setJobName] = useState("");
  const [description, setDescription] = useState("");
  const [detail, setDetail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notifyAt, setNotifyAt] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanJobName = jobName.trim();

    if (!cleanJobName) {
      setErrorMessage("กรอกชื่องานก่อน");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_name: cleanJobName,
          description: description.trim() || null,
          detail: detail.trim() || null,
          due_date: toBangkokISOString(dueDate),
          notify_at: toBangkokISOString(notifyAt),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.message || "สร้างงานไม่สำเร็จ");
        return;
      }

      router.push("/jobs");
      router.refresh();
    } catch (error) {
      console.error("CREATE_JOB_CLIENT_ERROR", error);
      setErrorMessage("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 lg:p-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500">
          <Link
            href="/jobs"
            className="flex items-center gap-1 transition-colors hover:text-slate-900"
          >
            ← To-Do List
          </Link>
          <span>/</span>
          <span className="text-blue-600">New Task</span>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:p-10">
          <h1 className="mb-8 text-2xl font-bold text-slate-900">
            Create New Task ✨
          </h1>

          {errorMessage ? (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {errorMessage}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <input
                type="text"
                value={jobName}
                onChange={(event) => setJobName(event.target.value)}
                className="w-full border-0 border-b-2 border-slate-100 bg-transparent px-0 py-3 text-3xl font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-500 focus:ring-0"
                placeholder="What needs to be done?"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className="text-lg text-slate-400">☰</span>
                Description
              </label>

              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                placeholder="Short description..."
              />

              <textarea
                rows={4}
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                placeholder="Add more details, links, or notes here..."
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="text-lg text-slate-400">📅</span>
                  Due Date
                </label>

                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="text-lg text-slate-400">🔔</span>
                  Notify At
                </label>

                <input
                  type="datetime-local"
                  value={notifyAt}
                  onChange={(event) => setNotifyAt(event.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-8">
              <Link
                href="/jobs"
                className="rounded-xl px-6 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-sm shadow-blue-500/30 transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Creating..." : "✓ Create Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function toBangkokISOString(value: string) {
  if (!value) return null;

  return `${value}:00+07:00`;
}