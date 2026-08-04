export const runtime = "nodejs";
export const preferredRegion = "sin1";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: List tasks
 *     description: Requires an active HttpOnly lifehub_session cookie. Returns jobs owned by the current user, optionally filtered by status and search text.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Case-insensitive job status name filter.
 *         example: pending
 *       - in: query
 *         name: q
 *         required: false
 *         schema:
 *           type: string
 *         description: Search text matched against job_name or description.
 *         example: weekly
 *     responses:
 *       200:
 *         description: Jobs returned
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
 *                     - jobs
 *                   properties:
 *                     jobs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/JobListItem'
 *             examples:
 *               success:
 *                 summary: Job list response
 *                 value:
 *                   success: true
 *                   data:
 *                     jobs:
 *                       - job_id: 1
 *                         job_uuid: 0a18e4ef-6ad2-4c41-bb3a-922c8265b576
 *                         job_name: Plan weekly tasks
 *                         description: Review priorities and schedule work.
 *                         due_date: 2026-08-05T10:00:00.000Z
 *                         notify_at: null
 *                         completed_at: null
 *                         created_at: 2026-08-04T03:00:00.000Z
 *                         job_status:
 *                           status_name: pending
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
 *                   message: ดึงรายการงานไม่สำเร็จ
 */
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
      select: {
        job_id: true,
        job_uuid: true,
        job_name: true,
        description: true,
        due_date: true,
        notify_at: true,
        completed_at: true,
        created_at: true,
        job_status: {
          select: {
            status_name: true,
          },
        },
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

/**
 * @openapi
 * /api/jobs:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create a tasks
 *     description: Requires an active HttpOnly lifehub_session cookie. Creates a job for the current user with the pending status.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - job_name
 *             properties:
 *               job_name:
 *                 type: string
 *                 example: Plan weekly tasks
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: Review priorities and schedule work.
 *               detail:
 *                 type: string
 *                 nullable: true
 *                 example: Break work into focused blocks.
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
 *           examples:
 *             createJob:
 *               summary: Create job request
 *               value:
 *                 job_name: Plan weekly tasks
 *                 description: Review priorities and schedule work.
 *                 detail: Break work into focused blocks.
 *                 due_date: 2026-08-05T10:00:00.000Z
 *                 notify_at: null
 *     responses:
 *       201:
 *         description: Job created
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
 *                 summary: Created job response
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
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               missingName:
 *                 summary: Missing job name response
 *                 value:
 *                   success: false
 *                   message: กรอกชื่องานก่อน
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
 *                   message: สร้างงานไม่สำเร็จ
 */
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
