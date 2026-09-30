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
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-5.805 1.528zm6.275-3.882l.402.24c1.554.927 3.337 1.417 5.166 1.418 5.408 0 9.808-4.4 9.81-9.811.002-2.62-1.018-5.084-2.87-6.938-1.853-1.854-4.316-2.875-6.941-2.877-5.411 0-9.81 4.4-9.812 9.811-.001 1.895.534 3.737 1.547 5.323l.265.415-.997 3.642 3.73-1.022zm10.741-7.518c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
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