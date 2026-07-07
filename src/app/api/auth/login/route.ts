import { apiError, apiSuccess } from "@/lib/api-response";
import { loginUser } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await loginUser({
      email: String(body.email || ""),
      password: String(body.password || ""),
    });

    if (!result.success) {
      return apiError(result.message ?? "เกิดข้อผิดพลาด", 401);
    }

    return apiSuccess({
      user: result.user,
    });
  } catch (error) {
    console.error("LOGIN_ERROR", error);
    return apiError("เข้าสู่ระบบไม่สำเร็จ", 500);
  }
}