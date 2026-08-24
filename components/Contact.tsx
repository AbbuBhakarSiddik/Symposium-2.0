import { CLUB_NAME, COLLEGE_NAME } from "@/lib/eventsConfig";

export default function Contact() {
  return (
    <section id="contact" className="border-t border-ink-line bg-ink-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <p className="eyebrow mb-2">Reach us</p>
        <h2 className="section-heading mb-8">Contact</h2>

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">Organized by</p>
            <p className="mt-2 font-display text-lg text-paper">{CLUB_NAME}</p>
            <p className="font-mono text-sm text-muted">{COLLEGE_NAME}</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">Email</p>
            <p className="mt-2 font-mono text-sm text-signal">symposium@example.edu</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">Phone</p>
            <p className="mt-2 font-mono text-sm text-signal">+91 90000 00000</p>
          </div>
        </div>
      </div>

      <footer className="border-t border-ink-line px-5 py-6 sm:px-8">
        <p className="mx-auto max-w-6xl font-mono text-xs text-muted">
          © {new Date().getFullYear()} {CLUB_NAME}, {COLLEGE_NAME}.
        </p>
      </footer>
    </section>
  );
}
