import Header from "@/components/Header";
import Hero from "@/components/Hero";
import EventBoard from "@/components/EventBoard";
import Gallery from "@/components/Gallery";
import Achievements from "@/components/Achievements";
import CoordinatorsSection from "@/components/CoordinatorsSection";
import Contact from "@/components/Contact";
import CollegeBanner from "@/components/CollegeBanner";
import HypeCountdownModal from "@/components/HypeCountdownModal";
import { listGalleryItems, listEvents, getSiteSettings } from "@/lib/db";
import { REGISTER_FORM_URL, DEFAULT_RULEBOOK_URL } from "@/lib/eventsConfig";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [galleryItems, events, settings] = await Promise.all([
    listGalleryItems().catch(() => []),
    listEvents().catch(() => []),
    getSiteSettings().catch(() => null),
  ]);

  const registerFormUrl = settings?.registerFormUrl || REGISTER_FORM_URL;
  const rulebookUrl = settings?.rulebookUrl || DEFAULT_RULEBOOK_URL;

  return (
    <main className="w-full max-w-full overflow-x-hidden">
      {/* ── HIGH-ENERGY HYPE POPUP & LIVE COUNTDOWN TIMER ── */}
      <HypeCountdownModal registerFormUrl={registerFormUrl} />

      <CollegeBanner />
      <Header
        runningAnnouncement={settings?.runningAnnouncement}
        runningAnnouncementActive={settings?.runningAnnouncementActive !== "false"}
      />
      <Hero registerFormUrl={registerFormUrl} />
      <EventBoard registerFormUrl={registerFormUrl} rulebookUrl={rulebookUrl} />
      <Achievements />
      <Gallery items={galleryItems} />
      <CoordinatorsSection events={events} />
      <Contact />
    </main>
  );
}

