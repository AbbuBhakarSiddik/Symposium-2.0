import Image from "next/image";
import { COLLEGE_NAME } from "@/lib/eventsConfig";

export default function CollegeBanner() {
    return (
        <div className="w-full border-b border-ink-line overflow-x-auto">
            <Image
                src="/logos/college-banner.jpg"
                alt={`${COLLEGE_NAME} — accreditation and affiliation banner`}
                width={1040}
                height={132}
                priority
                className="w-full min-w-[800px] h-auto"
            />
        </div>
    );
}