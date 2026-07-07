export const runtime = "nodejs";
export const preferredRegion = "sin1";
import { apiError, apiSuccess } from "@/lib/api-response";
import { registerUser } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await registerUser({
      user_name: String(body.user_name || ""),
      email: String(body.email || ""),
      password: String(body.password || ""),
    });

    if (!result.success) {
      return apiError(result.message ?? "เกิดข้อผิดพลาด", 400);
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