import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type JobDetailPageProps = {
  params: Promise<{
    job_uuid: string;
  }>;
};

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const user = await requireUser();
  const { job_uuid } = await params;

  const job = await prisma.jobs.findFirst({
    where: {
      job_uuid,
      user_id: user.user_id,
      deleted_at: null,
    },
    include: {
      job_status: true,
    },
  });

  if (!job) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] p-4 lg:p-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500">
          <Link
            href="/jobs"
            className="flex items-center gap-1 transition-colors hover:text-slate-900"
          >
            ← To-Do List
          </Link>
          <span>/</span>
          <span className="text-blue-600">Job Detail</span>
        </div>

        <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:p-10">
          <div className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-8 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Job Detail
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                {job.job_name}
              </h1>
              <p className="mt-2 text-slate-500">
                {job.description || "ไม่มีรายละเอียดสั้น"}
              </p>
            </div>

            <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
              {job.job_status.status_name}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoCard label="Start Date" value={formatDate(job.start_date)} />
            <InfoCard label="Due Date" value={formatDate(job.due_date)} />
            <InfoCard label="Notify At" value={formatDate(job.notify_at)} />
            <InfoCard
              label="Completed At"
              value={formatDate(job.completed_at)}
            />
          </div>

          <section className="mt-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
              Detail
            </h2>

            <div className="min-h-32 rounded-2xl bg-slate-50 p-5 leading-relaxed text-slate-700">
              {job.detail || "ยังไม่มีรายละเอียดเพิ่มเติม"}
            </div>
          </section>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700">
              Mark Completed
            </button>

            <button className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200">
              Cancel Job
            </button>

            <button className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100">
              Delete
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function formatDate(date: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(date);
}