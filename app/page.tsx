import Header from "@/components/Header";
import Hero from "@/components/Hero";
import EventBoard from "@/components/EventBoard";
import Gallery from "@/components/Gallery";
import Achievements from "@/components/Achievements";
import CoordinatorsSection from "@/components/CoordinatorsSection";
import Contact from "@/components/Contact";
import CollegeBanner from "@/components/CollegeBanner";
import { listGalleryItems, listEvents, getSiteSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [galleryItems, events, settings] = await Promise.all([
    listGalleryItems().catch(() => []),
    listEvents().catch(() => []),
    getSiteSettings().catch(() => null),
  ]);

  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <CollegeBanner />
      <Header
        runningAnnouncement={settings?.runningAnnouncement}
        runningAnnouncementActive={settings?.runningAnnouncementActive !== "false"}
      />
      <Hero />
      <EventBoard />
      <Achievements />
      <Gallery items={galleryItems} />
      <CoordinatorsSection events={events} />
      <Contact />
    </main>
  );
}

