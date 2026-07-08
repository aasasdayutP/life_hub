export const runtime = "nodejs";
export const preferredRegion = "sin1";

import AppShell from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <AppShell
      user={{
        user_name: user.user_name,
        email: user.email,
        role_name: user.roles.role_name,
      }}
    >
      {children}
    </AppShell>
  );
}