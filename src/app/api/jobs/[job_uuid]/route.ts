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

/**
 * @openapi
 * /api/jobs/{job_uuid}:
 *   get:
 *     tags:
 *       - Jobs
 *     summary: Get job detail
 *     description: Requires an active HttpOnly lifehub_session cookie. Returns one non-deleted job owned by the current user.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: job_uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Public UUID of the job.
 *         example: 0a18e4ef-6ad2-4c41-bb3a-922c8265b576
 *     responses:
 *       200:
 *         description: Job returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - data
 *               properties:
 *                 success:
 *                   type: boolean
 *                   enum: [true]
 *                 data:
 *                   type: object
 *                   required:
 *                     - job
 *                   properties:
 *                     job:
 *                       $ref: '#/components/schemas/JobFull'
 *             examples:
 *               success:
 *                 summary: Job detail response
 *                 value:
 *                   success: true
 *                   data:
 *                     job:
 *                       job_id: 1
 *                       job_uuid: 0a18e4ef-6ad2-4c41-bb3a-922c8265b576
 *                       job_name: Plan weekly tasks
 *                       description: Review priorities and schedule work.
 *                       detail: Break work into focused blocks.
 *                       user_id: 1
 *                       status_id: 1
 *                       start_date: null
 *                       due_date: 2026-08-05T10:00:00.000Z
 *                       notify_at: null
 *                       completed_at: null
 *                       created_by: 1
 *                       updated_by: 1
 *                       deleted_by: null
 *                       created_at: 2026-08-04T03:00:00.000Z
 *                       updated_at: 2026-08-04T03:00:00.000Z
 *                       deleted_at: null
 *                       job_status:
 *                         status_id: 1
 *                         status_name: pending
 *                         created_by: null
 *                         updated_by: null
 *                         deleted_by: null
 *                         created_at: 2026-08-04T03:00:00.000Z
 *                         updated_at: 2026-08-04T03:00:00.000Z
 *                         deleted_at: null
 *       401:
 *         description: Missing, invalid, expired, or revoked session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               unauthenticated:
 *                 summary: Unauthenticated response
 *                 value:
 *                   success: false
 *                   message: ยังไม่ได้เข้าสู่ระบบ
 *       404:
 *         description: Job not found for the current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               notFound:
 *                 summary: Job not found response
 *                 value:
 *                   success: false
 *                   message: ไม่พบงานนี้
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               serverError:
 *                 summary: Internal error response
 *                 value:
 *                   success: false
 *                   message: ดึงข้อมูลงานไม่สำเร็จ
 */
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

/**
 * @openapi
 * /api/jobs/{job_uuid}:
 *   patch:
 *     tags:
 *       - Jobs
 *     summary: Update a job
 *     description: Requires an active HttpOnly lifehub_session cookie. Updates provided fields on one non-deleted job owned by the current user.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: job_uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Public UUID of the job.
 *         example: 0a18e4ef-6ad2-4c41-bb3a-922c8265b576
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               job_name:
 *                 type: string
 *                 example: Plan weekly tasks
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: Updated short description.
 *               detail:
 *                 type: string
 *                 nullable: true
 *                 example: Updated long detail.
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: 2026-08-04T03:00:00.000Z
 *               due_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: 2026-08-05T10:00:00.000Z
 *               notify_at:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: null
 *               status_name:
 *                 type: string
 *                 example: completed
 *           examples:
 *             updateJob:
 *               summary: Update job request
 *               value:
 *                 job_name: Plan weekly tasks
 *                 description: Updated short description.
 *                 detail: Updated long detail.
 *                 start_date: 2026-08-04T03:00:00.000Z
 *                 due_date: 2026-08-05T10:00:00.000Z
 *                 notify_at: null
 *                 status_name: completed
 *     responses:
 *       200:
 *         description: Job updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - data
 *               properties:
 *                 success:
 *                   type: boolean
 *                   enum: [true]
 *                 data:
 *                   type: object
 *                   required:
 *                     - job
 *                   properties:
 *                     job:
 *                       $ref: '#/components/schemas/JobFull'
 *             examples:
 *               success:
 *                 summary: Updated job response
 *                 value:
 *                   success: true
 *                   data:
 *                     job:
 *                       job_id: 1
 *                       job_uuid: 0a18e4ef-6ad2-4c41-bb3a-922c8265b576
 *                       job_name: Plan weekly tasks
 *                       description: Updated short description.
 *                       detail: Updated long detail.
 *                       user_id: 1
 *                       status_id: 2
 *                       start_date: 2026-08-04T03:00:00.000Z
 *                       due_date: 2026-08-05T10:00:00.000Z
 *                       notify_at: null
 *                       completed_at: 2026-08-04T04:00:00.000Z
 *                       created_by: 1
 *                       updated_by: 1
 *                       deleted_by: null
 *                       created_at: 2026-08-04T03:00:00.000Z
 *                       updated_at: 2026-08-04T04:00:00.000Z
 *                       deleted_at: null
 *                       job_status:
 *                         status_id: 2
 *                         status_name: completed
 *                         created_by: null
 *                         updated_by: null
 *                         deleted_by: null
 *                         created_at: 2026-08-04T03:00:00.000Z
 *                         updated_at: 2026-08-04T03:00:00.000Z
 *                         deleted_at: null
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               emptyName:
 *                 summary: Empty job name response
 *                 value:
 *                   success: false
 *                   message: ชื่องานห้ามว่าง
 *               missingStatus:
 *                 summary: Unknown status response
 *                 value:
 *                   success: false
 *                   message: ไม่พบ status นี้
 *       401:
 *         description: Missing, invalid, expired, or revoked session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               unauthenticated:
 *                 summary: Unauthenticated response
 *                 value:
 *                   success: false
 *                   message: ยังไม่ได้เข้าสู่ระบบ
 *       404:
 *         description: Job not found for the current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               notFound:
 *                 summary: Job not found response
 *                 value:
 *                   success: false
 *                   message: ไม่พบงานนี้
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               serverError:
 *                 summary: Internal error response
 *                 value:
 *                   success: false
 *                   message: แก้ไขงานไม่สำเร็จ
 */
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

/**
 * @openapi
 * /api/jobs/{job_uuid}:
 *   delete:
 *     tags:
 *       - Jobs
 *     summary: Delete a job
 *     description: Requires an active HttpOnly lifehub_session cookie. Soft-deletes one non-deleted job owned by the current user.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: job_uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Public UUID of the job.
 *         example: 0a18e4ef-6ad2-4c41-bb3a-922c8265b576
 *     responses:
 *       200:
 *         description: Job deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - data
 *               properties:
 *                 success:
 *                   type: boolean
 *                   enum: [true]
 *                 data:
 *                   type: object
 *                   required:
 *                     - message
 *                   properties:
 *                     message:
 *                       type: string
 *             examples:
 *               success:
 *                 summary: Deleted job response
 *                 value:
 *                   success: true
 *                   data:
 *                     message: ลบงานแล้ว
 *       401:
 *         description: Missing, invalid, expired, or revoked session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               unauthenticated:
 *                 summary: Unauthenticated response
 *                 value:
 *                   success: false
 *                   message: ยังไม่ได้เข้าสู่ระบบ
 *       404:
 *         description: Job not found for the current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               notFound:
 *                 summary: Job not found response
 *                 value:
 *                   success: false
 *                   message: ไม่พบงานนี้
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               serverError:
 *                 summary: Internal error response
 *                 value:
 *                   success: false
 *                   message: ลบงานไม่สำเร็จ
 */
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
