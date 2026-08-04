export const runtime = "nodejs";
export const preferredRegion = "sin1";

import { apiError, apiSuccess } from "@/lib/api-response";
import { loginUser } from "@/services/auth.service";

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login with email and password
 *     description: Authenticates a user and sets the HttpOnly lifehub_session JWE cookie. The JWE payload contains session_id, user_id, and user_uuid only.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: captain@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *           examples:
 *             login:
 *               summary: Login request
 *               value:
 *                 email: captain@example.com
 *                 password: password123
 *     responses:
 *       200:
 *         description: Login successful. The lifehub_session cookie is set by the response.
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
 *                       $ref: '#/components/schemas/AuthLoginUser'
 *             examples:
 *               success:
 *                 summary: Successful login response
 *                 value:
 *                   success: true
 *                   data:
 *                     user:
 *                       user_id: 1
 *                       user_uuid: 6f1f01b4-3a8b-49a1-b8e0-5d68001f6ef1
 *                       user_name: Captain
 *                       email: captain@example.com
 *                       role_id: 1
 *       400:
 *         description: Invalid JSON body or missing email/password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               invalidJson:
 *                 summary: Invalid JSON
 *                 value:
 *                   success: false
 *                   message: รูปแบบ JSON ไม่ถูกต้อง
 *               missingCredentials:
 *                 summary: Missing credentials
 *                 value:
 *                   success: false
 *                   message: กรอกอีเมลและรหัสผ่าน
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               invalidCredentials:
 *                 summary: Invalid credentials response
 *                 value:
 *                   success: false
 *                   message: อีเมลหรือรหัสผ่านไม่ถูกต้อง
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
 *                   message: เข้าสู่ระบบไม่สำเร็จ
 */
export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);

    if (!body) {
      return apiError("รูปแบบ JSON ไม่ถูกต้อง", 400);
    }

    const result = await loginUser({
      email: getString(body, "email"),
      password: getString(body, "password"),
    });

    if (!result.success) {
      return apiError(result.message, result.status);
    }

    return apiSuccess({
      user: result.user,
    });
  } catch (error) {
    console.error("LOGIN_ERROR", error);
    return apiError("เข้าสู่ระบบไม่สำเร็จ", 500);
  }
}

async function readJsonObject(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return null;
    }

    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getString(body: Record<string, unknown>, key: string) {
  const value = body[key];

  return typeof value === "string" ? value : "";
}
