import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, useVelocity, type MotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { profile, projects } from "./data";
import { ease, pad, useMediaQuery } from "./lib";
import { GithubIcon, Label, Magnetic, RollText, SplitText } from "./ui";
import { lockScroll } from "./lib";

function ProjectCard({ p, i, trackX, desktop, onOpen }: { p: (typeof projects)[number]; i: number; trackX: MotionValue<number>; desktop: boolean; onOpen: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const geo = useRef({ left: 0, width: 400 });
  useEffect(() => {
    const m = () => {
      if (ref.current) geo.current = { left: ref.current.offsetLeft, width: ref.current.offsetWidth };
    };
    m();
    window.addEventListener("resize", m);
    const t = window.setTimeout(m, 600);
    return () => { window.removeEventListener("resize", m); window.clearTimeout(t); };
  }, []);
  // -1 (left of centre) .. 0 (centre) .. 1 (right of centre)
  const offset = useTransform(trackX, (x) => {
    if (!desktop) return 0;
    const c = geo.current.left + geo.current.width / 2 + x - window.innerWidth / 2;
    return Math.max(-1.4, Math.min(1.4, c / (window.innerWidth / 2)));
  });
  const rotateY = useTransform(offset, [-1.4, 0, 1.4], [38, 0, -38]);
  const z = useTransform(offset, (o) => -Math.abs(o) * 160);
  const cardY = useTransform(offset, (o) => Math.abs(o) * 30);

  return (
    <motion.div ref={ref} className="shrink-0 snap-center" style={{ rotateY, z, y: cardY, transformPerspective: 1300 }}>
    <motion.article
      initial={{ opacity: 0, y: 80, rotate: 3 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "0px -5% 0px 0px" }}
      transition={{ duration: 1, ease, delay: 0.05 }}
      className="group relative flex h-[min(74svh,640px)] w-[80vw] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-panel sm:w-[420px] lg:h-[min(70vh,620px)] lg:w-[min(30vw,460px)]"
    >
      <div className="pointer-events-none absolute left-1/2 top-[42%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/0 blur-3xl transition-colors duration-700 group-hover:bg-accent/35" />
      <span className="pointer-events-none absolute -left-3 top-10 font-display text-[11rem] font-extrabold leading-none text-stroke opacity-10 transition-opacity duration-700 group-hover:opacity-25">
        {pad(i + 1)}
      </span>

      <div className="relative flex items-center justify-between p-6">
        <span className="font-mono text-xs text-mute">{pad(i + 1)} / {pad(projects.length)}</span>
        <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-bone/80">{p.cat}</span>
      </div>

      <button type="button" onClick={() => onOpen(i)} data-cursor="View" className="relative flex flex-1 items-center justify-center px-6" aria-label={`Open ${p.title} project details`}>
        <div className="relative aspect-[9/14] h-full max-h-[340px] rounded-[1.8rem] border-[5px] border-[#262624] bg-black shadow-[0_30px_80px_-20px_rgba(0,0,0,.9)] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-3 group-hover:-rotate-3 group-hover:scale-105">
          <span className="absolute left-1/2 top-1.5 z-10 h-1.5 w-12 -translate-x-1/2 rounded-full bg-[#262624]" />
          <img
            src={p.img}
            alt={`${p.title} screenshot`}
            loading="lazy"
            className="img-mono h-full w-full rounded-[1.4rem] object-cover object-top transition-[object-position] duration-[2.2s] ease-in-out group-hover:object-bottom"
          />
        </div>
      </button>

      <div className="relative p-6">
        <h3 className="font-display text-2xl font-bold leading-tight md:text-[1.7rem]">{p.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-mute">{p.desc}</p>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={() => onOpen(i)} className="group/btn flex flex-1 items-center justify-between rounded-full bg-bone px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-accent">
            <span className="flex items-center gap-2"><RollText>View project</RollText></span>
            <ArrowUpRight size={15} className="transition-transform duration-500 group-hover/btn:rotate-45" />
          </button>
          <a href={p.code} target="_blank" rel="noreferrer" aria-label={`${p.title} source code`} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 transition-colors hover:border-accent hover:text-accent">
            <GithubIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.article>
    </motion.div>
  );
}


/* ================= PROJECT VIEWER ================= */
function ProjectViewer({ index, onClose, onNext }: { index: number | null; onClose: () => void; onNext: (dir: number) => void }) {
  const open = index !== null;
  const p = index !== null ? projects[index] : null;
  useEffect(() => {
    lockScroll(open);
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext(1);
      if (e.key === "ArrowLeft") onNext(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onNext]);

  return (
    <AnimatePresence>
      {open && p && index !== null && (
        <motion.div
          className="fixed inset-0 z-[190] overflow-y-auto bg-black/80 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="flex min-h-full items-center justify-center px-4 py-16 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 60, rotateX: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.6, ease }}
              style={{ transformPerspective: 1400 }}
              className="relative grid w-full max-w-5xl gap-0 overflow-hidden rounded-[2rem] border border-white/15 bg-[#0b0b0a] lg:grid-cols-[0.9fr_1.1fr]"
              role="dialog"
              aria-modal="true"
              aria-label={`${p.title} project`}
            >
              <button onClick={onClose} aria-label="Close project" className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/50 backdrop-blur transition-colors hover:bg-bone hover:text-ink">
                <X size={17} />
              </button>

              {/* preview */}
              <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_50%_40%,#1d1d1b,#080808_70%)] p-8 lg:min-h-[540px] lg:border-b-0 lg:border-r">
                <div className="dot-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
                <motion.div
                  key={p.title}
                  initial={{ rotateY: 12, y: 24, opacity: 0 }}
                  animate={{ rotateY: 0, y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease }}
                  className="relative aspect-[9/14] h-[300px] rounded-[1.7rem] border-[5px] border-[#2a2a28] bg-black shadow-[0_40px_100px_-20px_rgba(0,0,0,.95)] sm:h-[380px] lg:h-[430px]"
                  style={{ transformPerspective: 1200 }}
                >
                  <span className="absolute left-1/2 top-1.5 z-10 h-1.5 w-12 -translate-x-1/2 rounded-full bg-[#2a2a28]" />
                  <img src={p.img} alt={`${p.title} screenshot`} className="img-mono h-full w-full rounded-[1.3rem] object-cover object-top hover:!grayscale-0" />
                </motion.div>
                <span className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-[0.24em] text-bone/40">Live preview / {p.cat}</span>
              </div>

              {/* details */}
              <div className="relative flex flex-col justify-between gap-8 p-7 md:p-10">
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
                    <span>{pad(index + 1)} / {pad(projects.length)}</span>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-bone/70">{p.cat}</span>
                  </div>
                  <ScrambleViewerTitle title={p.title} />
                  <p className="mt-4 max-w-md leading-relaxed text-bone/65">{p.desc}</p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {[
                      ["Year", "2024 — 2026"],
                      ["Role", "Design & code"],
                      ["Stack", "HTML · CSS · JS"],
                      ["Status", "Live"],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
                        <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-mute">{k}</p>
                        <p className="mt-1 text-sm text-bone/90">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex gap-2">
                    <a href={p.live} target="_blank" rel="noreferrer" className="group flex flex-1 items-center justify-between rounded-full bg-bone px-5 py-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-accent">
                      <RollText>Live demo</RollText>
                      <ArrowUpRight size={15} className="transition-transform duration-500 group-hover:rotate-45" />
                    </a>
                    <a href={p.code} target="_blank" rel="noreferrer" aria-label={`${p.title} source`} className="grid h-12 w-12 place-items-center rounded-full border border-white/20 transition-colors hover:bg-white/10">
                      <GithubIcon className="h-4 w-4" />
                    </a>
                  </div>
                  <div className="mt-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
                    <button onClick={() => onNext(-1)} className="group flex items-center gap-2 transition-colors hover:text-bone">
                      <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> Prev
                    </button>
                    <span className="text-mute/60">← → to browse · esc to close</span>
                    <button onClick={() => onNext(1)} className="group flex items-center gap-2 transition-colors hover:text-bone">
                      Next <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ScrambleViewerTitle({ title }: { title: string }) {
  return (
    <motion.h3
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease, delay: 0.1 }}
      className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.92] tracking-tight md:text-6xl"
    >
      {title}
    </motion.h3>
  );
}

export function Work() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const target = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const distRef = useRef(0);
  const [dist, setDist] = useState(0);
  const [current, setCurrent] = useState(1);
  const [viewer, setViewer] = useState<number | null>(null);
  const step = (dir: number) => setViewer((v) => (v === null ? v : (v + dir + projects.length) % projects.length));

  useEffect(() => {
    const measure = () => {
      if (!track.current) return;
      const d = Math.max(0, track.current.scrollWidth - window.innerWidth);
      distRef.current = d;
      setDist(d);
    };
    measure();
    const t = window.setTimeout(measure, 500);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [isDesktop]);

  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (v) => -v * distRef.current);
  const zero = useMotionValue(0);
  const vel = useVelocity(scrollYProgress);
  const skewX = useSpring(useTransform(vel, [-1, 0, 1], [6, 0, -6]), { stiffness: 200, damping: 30 });
  useMotionValueEvent(scrollYProgress, "change", (v) => setCurrent(Math.min(projects.length, Math.max(1, Math.round(v * (projects.length - 1)) + 1))));

  return (
    <section id="portfolio" ref={target} className="relative" style={{ height: isDesktop ? `calc(100vh + ${dist}px)` : "auto" }}>
      <div className={isDesktop ? "sticky top-0 flex h-screen flex-col justify-center overflow-hidden" : "py-24"}>
        <motion.div
          ref={track}
          style={{ x: isDesktop ? x : 0, skewX: isDesktop ? skewX : 0 }}
          className="no-scrollbar flex items-stretch gap-5 px-5 max-lg:snap-x max-lg:snap-mandatory max-lg:scroll-px-5 max-lg:overflow-x-auto md:px-10 md:max-lg:scroll-px-10 lg:w-max lg:gap-6 lg:pt-16"
        >
          {/* intro panel */}
          <div className="flex w-[80vw] shrink-0 snap-start flex-col justify-between py-2 sm:w-[420px] lg:w-[42vw] lg:pr-10">
            <div>
              <Label index="08">My Portfolio</Label>
              <div className="mt-6 flex items-center gap-4 border-t border-white/15 pt-3">
                <span className="font-display text-5xl font-extrabold leading-none text-bone/15">08</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-mute">Selected archive</span>
              </div>
              <h2 className="mt-8 font-display text-[8.5vw] font-extrabold uppercase leading-[0.85] tracking-tight sm:text-[46px] lg:text-[4.4vw]">
                <SplitText text="Selected" />
                <br />
                <span className="font-serif font-normal normal-case italic text-accent">
                  <SplitText text="Work" delay={0.2} />
                </span>
                <sup className="ml-2 align-top font-mono text-base text-mute md:text-xl">({pad(projects.length)})</sup>
              </h2>
            </div>
            <div className="mt-10 space-y-6">
              <p className="max-w-sm text-bone/60">
                Websites, interactive experiments and community platforms — designed and coded by me, from the first pixel to the final deploy.
              </p>
              <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mute">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15">
                  <ArrowRight size={16} className="animate-pulse" />
                </span>
                {isDesktop ? "Keep scrolling" : "Swipe to explore"}
              </p>
            </div>
          </div>

          {projects.map((p, i) => (
            <ProjectCard key={p.title} p={p} i={i} trackX={isDesktop ? x : zero} desktop={isDesktop} onOpen={setViewer} />
          ))}

          {/* outro panel */}
          <div className="flex w-[80vw] shrink-0 snap-center flex-col items-center justify-center gap-8 text-center sm:w-[420px] lg:w-[30vw]">
            <p className="font-display text-4xl font-bold leading-tight md:text-5xl">
              Want to see
              <br />
              <span className="font-serif font-normal italic text-accent">more code?</span>
            </p>
            <Magnetic strength={0.5}>
              <a href={profile.github} target="_blank" rel="noreferrer" className="grid h-40 w-40 place-items-center rounded-full bg-accent text-ink transition-transform duration-500 hover:scale-110">
                <span className="flex flex-col items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">
                  <GithubIcon className="h-8 w-8" />
                  GitHub
                </span>
              </a>
            </Magnetic>
          </div>
        </motion.div>

        {isDesktop && (
          <div className="mx-10 mt-8 flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.2em] text-mute">
            <span className="tabular-nums text-bone">{pad(current)}</span>
            <div className="relative h-px flex-1 bg-white/10">
              <motion.div className="absolute inset-y-0 left-0 w-full origin-left bg-accent" style={{ scaleX: scrollYProgress }} />
            </div>
            <span className="tabular-nums">{pad(projects.length)}</span>
          </div>
        )}
      </div>
      <ProjectViewer index={viewer} onClose={() => setViewer(null)} onNext={step} />
    </section>
  );
}
