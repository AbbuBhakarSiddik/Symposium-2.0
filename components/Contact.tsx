import Link from "next/link";
import { CLUB_NAME, COLLEGE_NAME } from "@/lib/eventsConfig";

export default function Contact() {
  return (
    <>
      <section id="contact" className="scroll-mt-24 border-t border-slate-200 bg-gradient-to-br from-white via-green-50/30 to-blue-50/20 py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="text-center mb-12">
            <p className="eyebrow mb-2">Reach Us</p>
            <h2 className="section-heading text-slate-900">Get in Touch</h2>
          </div>

          <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-2">
            <div className="glass rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 hover:border-green-400 hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)] flex flex-col justify-center">
              <p className="font-mono text-xs uppercase tracking-widest text-green-700 font-bold">Organized by</p>
              <p className="mt-2 font-display text-2xl font-semibold text-slate-900">{CLUB_NAME}</p>
              <p className="font-mono text-sm text-slate-600 mt-1">{COLLEGE_NAME}</p>
            </div>

            <div className="glass rounded-2xl p-6 transition-all duration-300 bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200 hover:border-orange-400 hover:shadow-[0_8px_30px_rgba(249,115,22,0.2)] flex flex-col justify-center">
              <p className="font-mono text-xs uppercase tracking-widest text-orange-700 font-bold">Follow Us</p>
              <div className="mt-3 flex gap-3">
                <a
                  href="https://www.instagram.com/creative_codex_club"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-300 bg-orange-50 text-orange-600 transition-all hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:shadow-md"
                  aria-label="Instagram"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@siet-tumkur"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-red-300 bg-red-50 text-red-600 transition-all hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-md"
                  aria-label="YouTube"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/creative-codex-9587903b8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-300 bg-blue-50 text-blue-600 transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-md"
                  aria-label="LinkedIn"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://wa.me/6360860374"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-md"
                  aria-label="WhatsApp"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 448 512">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t px-5 py-6 sm:px-8"
        style={{
          background: 'linear-gradient(135deg, rgba(232,240,254,0.95) 0%, rgba(243,232,255,0.9) 33%, rgba(252,228,236,0.88) 66%, rgba(224,247,250,0.92) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'rgba(138,180,248,0.3)',
          boxShadow: '0 -4px 24px -4px rgba(138,180,248,0.12)'
        }}
      >
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-xs text-slate-500">
            © {new Date().getFullYear()} {CLUB_NAME}, {COLLEGE_NAME}.
          </p>
          <a
            href="#top"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 transition-all hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 hover:shadow-md"
            aria-label="Back to top"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </a>
        </div>
      </footer>
    </>
  );
}