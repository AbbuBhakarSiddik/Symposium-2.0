// Placeholder event data. Replace names, descriptions, dates, and capacities
// with the real symposium details when ready. The "capacity" here is the
// only number the live-count logic needs per event — everything else is
// content.

export type EventConfig = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  date: string; // e.g. "12 Sep 2026"
  time: string; // e.g. "10:00 AM"
  venue: string;
  capacity: number;
  // Must exactly match the value coordinators/students pick in the
  // Google Form's "Event" dropdown — this is how live registrations
  // get counted per event.
  sheetEventLabel: string;
  schedule: { time: string; item: string }[];
  coordinators: { name: string; role: string; phone?: string; email?: string }[];
};

export const CLUB_NAME = "Placeholder Tech Club";
export const COLLEGE_NAME = "Placeholder College of Engineering";
export const SYMPOSIUM_NAME = "SYMPOSIUM '26";

export const EVENTS: EventConfig[] = [
  {
    id: "event-1",
    name: "Paper Presentation",
    tagline: "Present. Defend. Win.",
    description:
      "Present an original technical paper before a panel of judges. Open to teams of up to 3.",
    date: "12 Sep 2026",
    time: "10:00 AM",
    venue: "Seminar Hall A",
    capacity: 60,
    sheetEventLabel: "Paper Presentation",
    schedule: [
      { time: "10:00 AM", item: "Reporting & abstract submission" },
      { time: "10:30 AM", item: "Presentations begin (Round 1)" },
      { time: "1:00 PM", item: "Lunch break" },
      { time: "2:00 PM", item: "Final round" },
      { time: "4:00 PM", item: "Results" },
    ],
    coordinators: [{ name: "Coordinator Name", role: "Event Lead", phone: "+91 90000 00001" }],
  },
  {
    id: "event-2",
    name: "Hackathon",
    tagline: "24 hours. One idea. Ship it.",
    description:
      "Build a working prototype around this year's theme within the time limit. Teams of 2-4.",
    date: "12-13 Sep 2026",
    time: "9:00 AM",
    venue: "CSE Lab Block",
    capacity: 100,
    sheetEventLabel: "Hackathon",
    schedule: [
      { time: "9:00 AM", item: "Theme reveal & team check-in" },
      { time: "10:00 AM", item: "Hacking begins" },
      { time: "Next day 9:00 AM", item: "Submissions close" },
      { time: "11:00 AM", item: "Demos & judging" },
    ],
    coordinators: [{ name: "Coordinator Name", role: "Event Lead", phone: "+91 90000 00002" }],
  },
  {
    id: "event-3",
    name: "Circuit Debugging",
    tagline: "Find the fault before the clock runs out.",
    description: "Spot-the-bug relay across analog and digital circuit boards. Solo event.",
    date: "12 Sep 2026",
    time: "11:00 AM",
    venue: "ECE Lab 2",
    capacity: 40,
    sheetEventLabel: "Circuit Debugging",
    schedule: [
      { time: "11:00 AM", item: "Rules briefing" },
      { time: "11:15 AM", item: "Round 1" },
      { time: "12:15 PM", item: "Round 2 (finalists)" },
      { time: "1:00 PM", item: "Results" },
    ],
    coordinators: [{ name: "Coordinator Name", role: "Event Lead", phone: "+91 90000 00003" }],
  },
  {
    id: "event-4",
    name: "Tech Quiz",
    tagline: "Buzz in. Back it up.",
    description: "General + core-engineering quiz, prelims followed by a stage final. Teams of 2.",
    date: "13 Sep 2026",
    time: "10:00 AM",
    venue: "Main Auditorium",
    capacity: 80,
    sheetEventLabel: "Tech Quiz",
    schedule: [
      { time: "10:00 AM", item: "Written prelims" },
      { time: "11:00 AM", item: "Prelim results" },
      { time: "11:30 AM", item: "Stage final" },
      { time: "1:00 PM", item: "Prize distribution" },
    ],
    coordinators: [{ name: "Coordinator Name", role: "Event Lead", phone: "+91 90000 00004" }],
  },
];
