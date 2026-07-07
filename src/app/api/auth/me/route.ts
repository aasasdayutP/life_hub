import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";

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