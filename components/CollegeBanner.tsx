import Image from "next/image";
import { COLLEGE_NAME } from "@/lib/eventsConfig";

export default function CollegeBanner() {
  return (
    <div className="w-full max-w-full overflow-hidden bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-center">
        <Image
          src="/logos/college-banner.jpg"
          alt={`${COLLEGE_NAME} — accreditation and affiliation banner`}
          width={1200}
          height={140}
          priority
          className="w-full h-auto max-h-[55px] sm:max-h-[80px] md:max-h-[105px] object-contain select-none"
        />
      </div>
    </div>
  );
}
