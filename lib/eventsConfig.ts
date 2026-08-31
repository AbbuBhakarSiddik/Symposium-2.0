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
  coordinators: { name: string; role: string; phone?: string; email?: string; image?: string }[];
};

export const CLUB_NAME = "Creative Codex";
export const COLLEGE_NAME = "Shridevi Institute Of Engineering And Technology,Tumkur";
export const SYMPOSIUM_NAME = "Innovation Ignite Symposium 2.0";

// Replace "#" below with the actual Google Form registration link before going live.
export const REGISTER_FORM_URL = "#";

export const EVENTS: EventConfig[] = [
  {
    id: "event-1",
    name: "The Elevator Pitch",
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
    coordinators: [
      {
        name: "Arjun Sharma",
        role: "Lead Faculty Coordinator",
        phone: "+91 98765 43210",
        email: "arjun@siet.edu.in",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: "event-2",
    name: "Zero to hero",
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
    coordinators: [
      {
        name: "Priya Patel",
        role: "Student Lead Coordinator",
        phone: "+91 98765 43211",
        email: "priya@siet.edu.in",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    id: "event-3",
    name: "Bot or not",
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
    coordinators: [
      {
        name: "Rohan Kumar",
        role: "Technical Operations Lead",
        phone: "+91 98765 43212",
        email: "rohan@siet.edu.in",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
];

