import Header from "@/components/Header";
import Hero from "@/components/Hero";
import EventBoard from "@/components/EventBoard";
import Gallery from "@/components/Gallery";
import Achievements from "@/components/Achievements";
import CoordinatorsSection from "@/components/CoordinatorsSection";
import Contact from "@/components/Contact";
import CollegeBanner from "@/components/CollegeBanner";
import { listGalleryItems, listEvents } from "@/lib/db";

export default async function Home() {
  const [galleryItems, events] = await Promise.all([
    listGalleryItems().catch(() => []),
    listEvents().catch(() => []),
  ]);

  return (
    <main>
      <CollegeBanner />
      <Header />
      <Hero />
      <EventBoard />
      <Achievements />
      <Gallery items={galleryItems} />
      <CoordinatorsSection events={events} />
      <Contact />
    </main>
  );
}

