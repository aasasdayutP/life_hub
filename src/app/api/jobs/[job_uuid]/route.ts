export const runtime = "nodejs";
export const preferredRegion = "sin1";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    job_uuid: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return apiError("ยังไม่ได้เข้าสู่ระบบ", 401);
    }

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
      return apiError("ไม่พบงานนี้", 404);
    }

    return apiSuccess({
      job,
    });
  } catch (error) {
    console.error("GET_JOB_DETAIL_ERROR", error);
    return apiError("ดึงข้อมูลงานไม่สำเร็จ", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return apiError("ยังไม่ได้เข้าสู่ระบบ", 401);
    }

    const { job_uuid } = await params;
    const body = await request.json();

    const existingJob = await prisma.jobs.findFirst({
      where: {
        job_uuid,
        user_id: user.user_id,
        deleted_at: null,
      },
    });

    if (!existingJob) {
      return apiError("ไม่พบงานนี้", 404);
    }

    const jobName =
      body.job_name === undefined ? undefined : String(body.job_name).trim();

    if (jobName !== undefined && !jobName) {
      return apiError("ชื่องานห้ามว่าง", 400);
    }

    const statusName =
      body.status_name === undefined
        ? undefined
        : String(body.status_name).trim().toLowerCase();

    let statusId: number | undefined;
    let completedAt: Date | null | undefined;

    if (statusName) {
      const status = await prisma.job_status.findFirst({
        where: {
          status_name: {
            equals: statusName,
            mode: "insensitive",
          },
          deleted_at: null,
        },
      });

      if (!status) {
        return apiError("ไม่พบ status นี้", 400);
      }

      statusId = status.status_id;

      if (statusName === "completed") {
        completedAt = new Date();
      }

      if (statusName === "pending" || statusName === "cancelled") {
        completedAt = null;
      }
    }

    const job = await prisma.jobs.update({
      where: {
        job_id: existingJob.job_id,
      },
      data: {
        ...(jobName !== undefined ? { job_name: jobName } : {}),
        ...(body.description !== undefined
          ? {
              description: String(body.description || "").trim() || null,
            }
          : {}),
        ...(body.detail !== undefined
          ? {
              detail: String(body.detail || "").trim() || null,
            }
          : {}),
        ...(body.start_date !== undefined
          ? {
              start_date: toDateOrNull(String(body.start_date || "")),
            }
          : {}),
        ...(body.due_date !== undefined
          ? {
              due_date: toDateOrNull(String(body.due_date || "")),
            }
          : {}),
        ...(body.notify_at !== undefined
          ? {
              notify_at: toDateOrNull(String(body.notify_at || "")),
            }
          : {}),
        ...(statusId !== undefined ? { status_id: statusId } : {}),
        ...(completedAt !== undefined ? { completed_at: completedAt } : {}),
        updated_by: user.user_id,
        updated_at: new Date(),
      },
      include: {
        job_status: true,
      },
    });

    return apiSuccess({
      job,
    });
  } catch (error) {
    console.error("UPDATE_JOB_ERROR", error);
    return apiError("แก้ไขงานไม่สำเร็จ", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return apiError("ยังไม่ได้เข้าสู่ระบบ", 401);
    }

    const { job_uuid } = await params;

    const existingJob = await prisma.jobs.findFirst({
      where: {
        job_uuid,
        user_id: user.user_id,
        deleted_at: null,
      },
    });

    if (!existingJob) {
      return apiError("ไม่พบงานนี้", 404);
    }

    await prisma.jobs.update({
      where: {
        job_id: existingJob.job_id,
      },
      data: {
        deleted_at: new Date(),
        deleted_by: user.user_id,
        updated_at: new Date(),
      },
    });

    return apiSuccess({
      message: "ลบงานแล้ว",
    });
  } catch (error) {
    console.error("DELETE_JOB_ERROR", error);
    return apiError("ลบงานไม่สำเร็จ", 500);
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