export const runtime = "nodejs";
export const preferredRegion = "sin1";
import { apiError, apiSuccess } from "@/lib/api-response";
import { logoutUser } from "@/services/auth.service";

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