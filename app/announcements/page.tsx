export const dynamic = "force-dynamic";

import { listAnnouncements, getSiteSettings } from "@/lib/db";
import AnnouncementsClient from "@/components/AnnouncementsClient";

export default async function AnnouncementsPage() {
  const [announcements, settings] = await Promise.all([
    listAnnouncements().catch(() => []),
    getSiteSettings().catch(() => ({
      symposiumName: "Innovation Ignite Symposium 2.0",
      clubName: "Creative Codex",
      collegeName: "Shridevi Institute Of Engineering And Technology,Tumkur",
      registerFormUrl: "#",
    })),
  ]);

  return (
    <AnnouncementsClient
      announcements={announcements}
      symposiumName={settings.symposiumName}
    />
  );
}
