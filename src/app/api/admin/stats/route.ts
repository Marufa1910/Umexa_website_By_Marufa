import { guardApi } from "@/lib/auth/session";
import { getDashboardStats } from "@/lib/data/admin";

export async function GET(request: Request) {
  const { denied } = await guardApi(request, "dashboard.view");
  if (denied) return denied;

  return Response.json(await getDashboardStats());
}
