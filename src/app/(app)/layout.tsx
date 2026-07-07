export const runtime = "nodejs";
export const preferredRegion = "sin1";

import {requireUser} from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return <>{children}</>;
}