export const runtime = "nodejs";
export const preferredRegion = "sin1";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get current authenticated user
 *     description: Requires an active HttpOnly lifehub_session cookie. Returns the current user resolved from the active session.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user returned
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
 *                     - user
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/AuthMeUser'
 *             examples:
 *               success:
 *                 summary: Authenticated user response
 *                 value:
 *                   success: true
 *                   data:
 *                     user:
 *                       user_id: 1
 *                       user_uuid: 6f1f01b4-3a8b-49a1-b8e0-5d68001f6ef1
 *                       user_name: Captain
 *                       email: captain@example.com
 *                       role: user
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
 *                   message: ดึงข้อมูลผู้ใช้ไม่สำเร็จ
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return apiError("ยังไม่ได้เข้าสู่ระบบ", 401);
    }

    return apiSuccess({
      user: {
        user_id: user.user_id,
        user_uuid: user.user_uuid,
        user_name: user.user_name,
        email: user.email,
        role: user.roles.role_name,
      },
    });
  } catch (error) {
    console.error("ME_ERROR", error);
    return apiError("ดึงข้อมูลผู้ใช้ไม่สำเร็จ", 500);
  }
}
