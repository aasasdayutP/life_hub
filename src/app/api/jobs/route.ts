export const runtime = "nodejs";
export const preferredRegion = "sin1";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return apiError("ยังไม่ได้เข้าสู่ระบบ", 401);
    }

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const q = searchParams.get("q");

    const jobs = await prisma.jobs.findMany({
      where: {
        user_id: user.user_id,
        deleted_at: null,
        ...(status
          ? {
              job_status: {
                status_name: {
                  equals: status,
                  mode: "insensitive",
                },
              },
            }
          : {}),
        ...(q
          ? {
              OR: [
                {
                  job_name: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        job_status: true,
      },
      orderBy: [
        {
          due_date: "asc",
        },
        {
          created_at: "desc",
        },
      ],
    });

    return apiSuccess({
      jobs,
    });
  } catch (error) {
    console.error("GET_JOBS_ERROR", error);
    return apiError("ดึงรายการงานไม่สำเร็จ", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return apiError("ยังไม่ได้เข้าสู่ระบบ", 401);
    }

    const body = await request.json();

    const jobName = String(body.job_name || "").trim();
    const description = String(body.description || "").trim();
    const detail = String(body.detail || "").trim();
    const dueDate = String(body.due_date || "").trim();
    const notifyAt = String(body.notify_at || "").trim();

    if (!jobName) {
      return apiError("กรอกชื่องานก่อน", 400);
    }

    const pendingStatus = await prisma.job_status.findFirst({
      where: {
        status_name: {
          equals: "pending",
          mode: "insensitive",
        },
        deleted_at: null,
      },
    });

    if (!pendingStatus) {
      return apiError("ไม่พบ status pending ในระบบ", 500);
    }

    const job = await prisma.jobs.create({
      data: {
        job_name: jobName,
        description: description || null,
        detail: detail || null,
        user_id: user.user_id,
        status_id: pendingStatus.status_id,
        due_date: toDateOrNull(dueDate),
        notify_at: toDateOrNull(notifyAt),
        created_by: user.user_id,
        updated_by: user.user_id,
      },
      include: {
        job_status: true,
      },
    });

    return apiSuccess(
      {
        job,
      },
      201
    );
  } catch (error) {
    console.error("CREATE_JOB_ERROR", error);
    return apiError("สร้างงานไม่สำเร็จ", 500);
  }
}

function toDateOrNull(value: string) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}