export const runtime = "nodejs";
export const preferredRegion = "sin1";

import { apiError, apiSuccess } from "@/lib/api-response";
import { registerUser } from "@/services/auth.service";

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Creates a user, assigns the default user role, creates a session, and sets the HttpOnly lifehub_session JWE cookie. The JWE payload contains session_id, user_id, and user_uuid only.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_name
 *               - email
 *               - password
 *             properties:
 *               user_name:
 *                 type: string
 *                 example: Captain
 *               email:
 *                 type: string
 *                 format: email
 *                 example: captain@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: password123
 *           examples:
 *             register:
 *               summary: Register request
 *               value:
 *                 user_name: Captain
 *                 email: captain@example.com
 *                 password: password123
 *     responses:
 *       201:
 *         description: Registration successful. The lifehub_session cookie is set by the response.
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
 *                       $ref: '#/components/schemas/AuthRegisterUser'
 *             examples:
 *               success:
 *                 summary: Successful registration response
 *                 value:
 *                   success: true
 *                   data:
 *                     user:
 *                       user_id: 1
 *                       user_uuid: 6f1f01b4-3a8b-49a1-b8e0-5d68001f6ef1
 *                       user_name: Captain
 *                       email: captain@example.com
 *                       role_id: 1
 *                       created_at: 2026-08-04T03:00:00.000Z
 *       400:
 *         description: Invalid JSON body or validation error
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
 *               missing:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   message: กรอกข้อมูลให้ครบ
 *               passwordShort:
 *                 summary: Password too short
 *                 value:
 *                   success: false
 *                   message: รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               emailUsed:
 *                 summary: Duplicate email response
 *                 value:
 *                   success: false
 *                   message: อีเมลนี้ถูกใช้งานแล้ว
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
 *                   message: สมัครสมาชิกไม่สำเร็จ
 */
export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);

    if (!body) {
      return apiError("รูปแบบ JSON ไม่ถูกต้อง", 400);
    }

    const result = await registerUser({
      user_name: getString(body, "user_name"),
      email: getString(body, "email"),
      password: getString(body, "password"),
    });

    if (!result.success) {
      return apiError(result.message, result.status);
    }

    return apiSuccess(
      {
        user: result.user,
      },
      201
    );
  } catch (error) {
    console.error("REGISTER_ERROR", error);
    return apiError("สมัครสมาชิกไม่สำเร็จ", 500);
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
