import Header from "@/components/Header";
import Hero from "@/components/Hero";
import EventBoard from "@/components/EventBoard";
import Gallery from "@/components/Gallery";
import Achievements from "@/components/Achievements";
import CoordinatorsSection from "@/components/CoordinatorsSection";
import Contact from "@/components/Contact";
import CollegeBanner from "@/components/CollegeBanner";
import { listGalleryItems } from "@/lib/db";

export default async function Home() {
  const galleryItems = await listGalleryItems().catch(() => []);

  return (
    <main>
      <CollegeBanner />
      <Header />
      <Hero />
      <EventBoard />
      <Achievements />
      <Gallery items={galleryItems} />
      <CoordinatorsSection />
      <Contact />
    </main>
  );
}

