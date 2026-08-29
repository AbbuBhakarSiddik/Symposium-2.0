export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getLiveCounts } from "@/lib/googleSheets";
import {
  listUsers,
  listAnnouncements,
  listResources,
  listEvents,
  getSiteSettings,
} from "@/lib/db";
import AdminDashboardClient from "@/components/AdminDashboardClient";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    redirect(session ? "/coordinators" : "/login");
  }

  const events = await listEvents().catch(() => []);
  const [{ counts, isLive }, users, announcements, resources, settings] = await Promise.all([
    getLiveCounts(events),
    listUsers().catch(() => []),
    listAnnouncements().catch(() => []),
    listResources().catch(() => []),
    getSiteSettings().catch(() => ({
      symposiumName: "Innovation Ignite Symposium 2.0",
      clubName: "Creative Codex",
      collegeName: "Shridevi Institute Of Engineering And Technology,Tumkur",
      registerFormUrl: "#",
    })),
  ]);

  const currentUser = {
    name: session.user?.name || "Admin",
    username: (session.user as any)?.username || "admin",
    role: (session.user as any)?.role || "admin",
  };

  return (
    <AdminDashboardClient
      counts={counts}
      isLive={isLive}
      users={users}
      announcements={announcements}
      resources={resources}
      events={events}
      settings={settings}
      currentUser={currentUser}
    />
  );
}

