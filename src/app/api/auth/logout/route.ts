export const runtime = "nodejs";
export const preferredRegion = "sin1";

import { apiError, apiSuccess } from "@/lib/api-response";
import { logoutUser } from "@/services/auth.service";

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout current session
 *     description: Requires an active HttpOnly lifehub_session cookie. Revokes the current session when a valid cookie is present and clears the cookie.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout request completed
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
 *                 summary: Successful logout response
 *                 value:
 *                   success: true
 *                   data:
 *                     message: ออกจากระบบแล้ว
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
 *                   message: ออกจากระบบไม่สำเร็จ
 */
export async function POST() {
  try {
    await logoutUser();

    return apiSuccess({
      message: "ออกจากระบบแล้ว",
    });
  } catch (error) {
    console.error("LOGOUT_ERROR", error);
    return apiError("ออกจากระบบไม่สำเร็จ", 500);
  }
}
