import { useState, useEffect } from "react";
import { motion, AnimatePresence, type MotionProps } from "motion/react";
import { SimulatorCanvas } from "@/simulator/engine/SimulatorCanvas";
import {
  useSimulatorStore,
  formatTimeOfDay,
  type SimulatorId,
} from "@/simulator/state/simulatorStore";

type Screen = "main" | "settings" | "simulator-select" | "loading" | "hud" | "pause";
type SimType = SimulatorId;

interface SimData {
  id: SimType;
  title: string;
  subtitle: string;
  desc: string;
  img: string;
  accentColor: string;
}

const SIMS: SimData[] = [
  {
    id: "coconut",
    title: "Coconut Simulator",
    subtitle: "Tropical Coast — Latitude 8.5°N",
    desc: "The tide does not ask your permission.",
    img: "https://images.unsplash.com/photo-1587944301497-9b2b7c4358fd?w=1920&h=1080&fit=crop&auto=format",
    accentColor: "#c47a35",
  },
  {
    id: "bench",
    title: "Bench Simulator",
    subtitle: "Meridian Park — Autumn, Year Four",
    desc: "Seasons change. You endure.",
    img: "https://images.unsplash.com/photo-1561745673-b1d2a1cdf765?w=1920&h=1080&fit=crop&auto=format",
    accentColor: "#4a7c45",
  },
  {
    id: "idol",
    title: "Jungle Idol Simulator",
    subtitle: "The Forgotten Temple — Estimated Age: 2,400 Years",
    desc: "The jungle does not remember your name.",
    img: "https://images.unsplash.com/photo-1698063261670-72d63ee5c1a3?w=1920&h=1080&fit=crop&auto=format",
    accentColor: "#8a5c2a",
  },
];

const TIPS = [
  "Remaining still requires no additional input.",
  "Your objectives will not change. This is a feature.",
  "You are not losing. You are enduring.",
  "Environmental events may occur around you. This is expected.",
  "No action is required. No action is possible.",
  "The world continues to move. You are not required to respond.",
];

const HERO_IMG =
  "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=1920&h=1080&fit=crop&auto=format";

const FADE: MotionProps = {
  initial: { opacity: 0, scale: 1.025 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.975 },
  transition: { duration: 0.85, ease: [0.25, 0.1, 0.25, 1] },
};

// ─── Shared atmosphere layers ─────────────────────────────────────────────────

function Vignette() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, transparent 15%, rgba(8,7,6,0.45) 55%, rgba(8,7,6,0.88) 100%)",
      }}
    />
  );
}

function GradientBottom() {
  return (
    <div
      className="absolute inset-x-0 bottom-0 h-80 pointer-events-none"
      style={{ background: "linear-gradient(to top, rgba(8,7,6,0.97) 0%, transparent 100%)" }}
    />
  );
}

function GradientTop() {
  return (
    <div
      className="absolute inset-x-0 top-0 h-36 pointer-events-none"
      style={{ background: "linear-gradient(to bottom, rgba(8,7,6,0.85) 0%, transparent 100%)" }}
    />
  );
}

// ─── Main Menu ────────────────────────────────────────────────────────────────

function MainMenu({ onPlay, onSettings }: { onPlay: () => void; onSettings: () => void }) {
  return (
    <motion.div {...FADE} className="absolute inset-0">
      <div className="absolute inset-0 overflow-hidden bg-[#080706]">
        <img
          src={HERO_IMG}
          alt="Cinematic landscape"
          className="w-full h-full object-cover"
          style={{
            animation: "driftPan 50s ease-in-out infinite",
            transformOrigin: "center center",
          }}
        />
      </div>
      <Vignette />
      <GradientBottom />
      <GradientTop />

      <div className="absolute inset-0 flex flex-col justify-between px-20 py-16 md:px-28">
        <div />

        <div className="flex flex-col gap-14">
          <div className="flex flex-col gap-4">
            <p
              className="text-[#5a4e42] text-[10px] tracking-[0.55em] uppercase"
              style={{ fontFamily: "'Raleway', sans-serif" }}
            >
              A First Party Studio Production
            </p>
            <h1
              className="text-[#ede8df] leading-[0.95] font-normal"
              style={{
                fontFamily: "'Libre Caslon Display', serif",
                fontSize: "clamp(3.5rem, 7.5vw, 7.5rem)",
                letterSpacing: "0.04em",
                textShadow: "0 4px 60px rgba(8,7,6,0.9), 0 1px 0 rgba(237,232,223,0.08)",
              }}
            >
              Simulator
              <br />
              Collection
            </h1>
          </div>

          <nav className="flex flex-col gap-7">
            {[
              { label: "Play", action: onPlay },
              { label: "Settings", action: onSettings },
              { label: "Quit", action: () => {} },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                className="menu-item text-[#7a6e62] text-xs w-fit text-left"
                style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 400 }}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1.5">
            <p
              className="text-[#3a3028] text-[9px] tracking-[0.55em] uppercase"
              style={{ fontFamily: "'Raleway', sans-serif" }}
            >
              Published by
            </p>
            <p
              className="text-[#4a3e32] text-[10px] tracking-[0.3em]"
              style={{ fontFamily: "'Raleway', sans-serif" }}
            >
              Null Object Interactive
            </p>
          </div>
          <p
            className="text-[#2a2018] text-[9px] tracking-[0.35em] uppercase"
            style={{ fontFamily: "'Raleway', sans-serif" }}
          >
            © 2024 — All Rights Reserved
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Settings Menu ────────────────────────────────────────────────────────────

function SettingRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-7 border-b border-[rgba(196,122,53,0.1)]">
      <p
        className="text-[#6a5e52] text-[10px] tracking-[0.5em] uppercase"
        style={{ fontFamily: "'Raleway', sans-serif" }}
      >
        {label}
      </p>
      <div className="flex border border-[rgba(196,122,53,0.18)]">
        {options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className="text-[10px] tracking-[0.3em] uppercase px-7 py-2.5 transition-all duration-500"
            style={{
              fontFamily: "'Raleway', sans-serif",
              background: value === opt ? "rgba(196,122,53,0.12)" : "transparent",
              color: value === opt ? "#c47a35" : "#4a3e32",
              borderRight:
                i < options.length - 1 ? "1px solid rgba(196,122,53,0.15)" : "none",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SettingsMenu({
  graphics,
  mode,
  onGraphics,
  onMode,
  onBack,
  overSimulator = false,
}: {
  graphics: "Low" | "High";
  mode: "Realistic" | "Arcade";
  onGraphics: (v: "Low" | "High") => void;
  onMode: (v: "Realistic" | "Arcade") => void;
  onBack: () => void;
  overSimulator?: boolean;
}) {
  return (
    <motion.div {...FADE} className="absolute inset-0">
      {/* Over the live simulator, blur the frozen 3D frame instead of a photo */}
      {!overSimulator && (
        <div className="absolute inset-0 overflow-hidden bg-[#080706]">
          <img
            src={HERO_IMG}
            alt="Background"
            className="w-full h-full object-cover"
            style={{ filter: "blur(14px) brightness(0.5)", transform: "scale(1.06)" }}
          />
        </div>
      )}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(8,7,6,0.6)",
          backdropFilter: overSimulator ? "blur(14px)" : undefined,
        }}
      />
      <Vignette />

      <div className="absolute inset-0 flex flex-col justify-center px-20 md:px-28">
        <div className="mb-16">
          <p
            className="text-[#4a3e32] text-[10px] tracking-[0.55em] uppercase mb-4"
            style={{ fontFamily: "'Raleway', sans-serif" }}
          >
            System Configuration
          </p>
          <h2
            className="text-[#ede8df] font-normal"
            style={{
              fontFamily: "'Libre Caslon Display', serif",
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              letterSpacing: "0.04em",
            }}
          >
            Settings
          </h2>
          <div className="w-10 h-px mt-5" style={{ background: "rgba(196,122,53,0.5)" }} />
        </div>

        <div className="flex flex-col max-w-lg">
          <SettingRow
            label="Graphics"
            options={["Low", "High"]}
            value={graphics}
            onChange={(v) => onGraphics(v as "Low" | "High")}
          />
          <SettingRow
            label="Mode"
            options={["Realistic", "Arcade"]}
            value={mode}
            onChange={(v) => onMode(v as "Realistic" | "Arcade")}
          />
        </div>

        <button
          onClick={onBack}
          className="menu-item mt-20 text-[#4a3e32] text-[10px] w-fit text-left"
          style={{ fontFamily: "'Raleway', sans-serif" }}
        >
          ← Return
        </button>
      </div>
    </motion.div>
  );
}

// ─── Simulator Selection ──────────────────────────────────────────────────────

function SimulatorSelect({
  onSelect,
  onBack,
}: {
  onSelect: (s: SimType) => void;
  onBack: () => void;
}) {
  const [hovered, setHovered] = useState<SimType | null>(null);

  return (
    <motion.div {...FADE} className="absolute inset-0 bg-[#080706]">
      {/* Header overlay */}
      <div
        className="absolute inset-x-0 top-0 h-44 z-10 flex items-end px-20 pb-9 md:px-28"
        style={{ background: "linear-gradient(to bottom, rgba(8,7,6,0.97) 0%, transparent 100%)" }}
      >
        <div className="flex items-end justify-between w-full">
          <div>
            <p
              className="text-[#4a3e32] text-[10px] tracking-[0.55em] uppercase mb-3"
              style={{ fontFamily: "'Raleway', sans-serif" }}
            >
              Select Experience
            </p>
            <h2
              className="text-[#ede8df] font-normal"
              style={{
                fontFamily: "'Libre Caslon Display', serif",
                fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)",
                letterSpacing: "0.04em",
              }}
            >
              Choose Your Simulator
            </h2>
          </div>
          <button
            onClick={onBack}
            className="menu-item text-[#4a3e32] text-[10px] self-end"
            style={{ fontFamily: "'Raleway', sans-serif" }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Cards row */}
      <div className="absolute inset-0 flex">
        {SIMS.map((sim, i) => (
          <div
            key={sim.id}
            className="sim-card relative overflow-hidden"
            style={{
              flex: hovered === sim.id ? 1.35 : 1,
              transition: "flex 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
            onMouseEnter={() => setHovered(sim.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(sim.id)}
          >
            <img
              src={sim.img}
              alt={sim.title}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                filter:
                  hovered === sim.id
                    ? "brightness(0.6) saturate(0.85)"
                    : "brightness(0.35) saturate(0.55)",
                transition: "filter 0.7s ease",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(8,7,6,0.92) 0%, rgba(8,7,6,0.2) 55%, rgba(8,7,6,0.55) 100%)",
              }}
            />
            {i < SIMS.length - 1 && (
              <div
                className="absolute right-0 inset-y-0 w-px z-10"
                style={{ background: "rgba(196,122,53,0.12)" }}
              />
            )}

            <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-14">
              <div className="flex flex-col gap-4">
                <div
                  className="h-px"
                  style={{
                    background: sim.accentColor,
                    width: hovered === sim.id ? "3rem" : "1.5rem",
                    transition: "width 0.6s ease",
                    opacity: 0.8,
                  }}
                />
                <h3
                  className="text-[#ede8df] leading-tight font-normal"
                  style={{
                    fontFamily: "'Libre Caslon Display', serif",
                    fontSize: "clamp(1.2rem, 2vw, 1.9rem)",
                    letterSpacing: "0.03em",
                  }}
                >
                  {sim.title}
                </h3>
                <p
                  className="text-[#5a4e42] text-[10px] tracking-[0.35em] uppercase"
                  style={{ fontFamily: "'Raleway', sans-serif" }}
                >
                  {sim.subtitle}
                </p>
                <p
                  className="text-[#8a7d6e] text-sm leading-relaxed"
                  style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 300 }}
                >
                  {sim.desc}
                </p>
                <div
                  className="select-prompt mt-1"
                  style={{
                    opacity: hovered === sim.id ? 1 : 0,
                    transform: hovered === sim.id ? "translateY(0)" : "translateY(6px)",
                    transition: "opacity 0.45s ease 0.1s, transform 0.45s ease 0.1s",
                  }}
                >
                  <span
                    className="text-[10px] tracking-[0.45em] uppercase"
                    style={{ fontFamily: "'Raleway', sans-serif", color: sim.accentColor }}
                  >
                    Select →
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen({
  sim,
  progress,
  tip,
}: {
  sim: SimData;
  progress: number;
  tip: string;
}) {
  return (
    <motion.div {...FADE} className="absolute inset-0 bg-[#080706]">
      <img
        src={sim.img}
        alt={sim.title}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: "blur(22px) brightness(0.25) saturate(0.4)",
          transform: "scale(1.06)",
        }}
      />
      <Vignette />
      <GradientBottom />

      <div className="absolute inset-0 flex flex-col justify-end pb-20 px-20 md:px-28">
        <div className="mb-10">
          <p
            className="text-[#3a3028] text-[10px] tracking-[0.5em] uppercase mb-4"
            style={{ fontFamily: "'Raleway', sans-serif" }}
          >
            Loading Environment
          </p>
          <p
            className="text-[#6a5e52] text-sm max-w-lg leading-relaxed"
            style={{
              fontFamily: "'Raleway', sans-serif",
              fontWeight: 300,
              letterSpacing: "0.02em",
            }}
          >
            {tip}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="w-full h-px bg-[rgba(255,255,255,0.05)]">
            <div
              className="h-full transition-all duration-150"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(to right, ${sim.accentColor}55, ${sim.accentColor}cc)`,
              }}
            />
          </div>
          <div className="flex justify-between">
            <p
              className="text-[#3a2e22] text-[10px] tracking-[0.3em] uppercase"
              style={{ fontFamily: "'DM Mono', monospace", fontWeight: 300 }}
            >
              {sim.title}
            </p>
            <p
              className="text-[#3a2e22] text-[10px] tracking-[0.2em]"
              style={{ fontFamily: "'DM Mono', monospace", fontWeight: 300 }}
            >
              {Math.round(progress)}%
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── HUD Screen ───────────────────────────────────────────────────────────────

function HUDScreen({
  sim,
  onPause,
}: {
  sim: SimData;
  onPause: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = String(Math.floor(elapsed / 3600)).padStart(2, "0");
  const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  // Live values from the simulator engine (re-renders only when the
  // formatted string / weather actually change, not every frame).
  const simTime = useSimulatorStore((s) => formatTimeOfDay(s.timeOfDay));
  const weather = useSimulatorStore((s) => s.weather);

  // Escape pauses, like any serious game.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onPause();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPause]);

  return (
    // Transparent overlay — the live SimulatorCanvas renders beneath it.
    <motion.div {...FADE} className="absolute inset-0">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(8,7,6,0.35) 100%)",
        }}
      />

      {/* Top-right: pause + live time/weather from the engine */}
      <div className="absolute top-10 right-10 z-10 flex flex-col items-end gap-3">
        <button
          onClick={onPause}
          className="menu-item text-[#4a3e32] text-[10px]"
          style={{ fontFamily: "'Raleway', sans-serif" }}
        >
          Pause
        </button>
        <div className="w-5 h-px" style={{ background: `${sim.accentColor}40` }} />
        <p
          className="text-[13px] tracking-[0.2em]"
          style={{
            fontFamily: "'DM Mono', monospace",
            color: "rgba(237,232,223,0.5)",
            fontWeight: 300,
            textShadow: "0 1px 12px rgba(8,7,6,0.6)",
          }}
        >
          {simTime}
        </p>
        <p
          className="text-[9px] tracking-[0.4em] uppercase"
          style={{
            fontFamily: "'DM Mono', monospace",
            color: "rgba(237,232,223,0.32)",
            fontWeight: 300,
            textShadow: "0 1px 12px rgba(8,7,6,0.6)",
          }}
        >
          {weather.charAt(0).toUpperCase() + weather.slice(1)}
        </p>
      </div>

      {/* HUD bottom-left */}
      <div className="absolute bottom-12 left-12 flex flex-col gap-2.5">
        <div
          className="w-5 h-px mb-1"
          style={{ background: `${sim.accentColor}55` }}
        />
        {[
          ["Status", "Existing"],
          ["Movement", "Unavailable"],
          ["Objective", "Continue Existing"],
        ].map(([label, val]) => (
          <div key={label} className="flex items-baseline gap-5">
            <span
              className="text-[9px] tracking-[0.35em] uppercase w-20"
              style={{
                fontFamily: "'DM Mono', monospace",
                color: "rgba(90,78,66,0.7)",
                fontWeight: 300,
              }}
            >
              {label}
            </span>
            <span
              className="text-[11px] tracking-[0.12em]"
              style={{
                fontFamily: "'DM Mono', monospace",
                color: "rgba(237,232,223,0.38)",
                fontWeight: 300,
              }}
            >
              {val}
            </span>
          </div>
        ))}
        <div
          className="w-5 h-px mt-1"
          style={{ background: `${sim.accentColor}28` }}
        />
        <p
          className="text-[9px] tracking-[0.3em]"
          style={{
            fontFamily: "'DM Mono', monospace",
            color: "rgba(58,46,34,0.6)",
            fontWeight: 300,
          }}
        >
          {hh}:{mm}:{ss}
        </p>
      </div>

      {/* Simulator name top-left */}
      <div className="absolute top-10 left-12">
        <p
          className="text-[#2a2018] text-[9px] tracking-[0.5em] uppercase"
          style={{ fontFamily: "'Raleway', sans-serif" }}
        >
          {sim.title}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Pause Menu ───────────────────────────────────────────────────────────────

function PauseMenu({
  onResume,
  onSettings,
  onQuit,
}: {
  onResume: () => void;
  onSettings: () => void;
  onQuit: () => void;
}) {
  return (
    <motion.div {...FADE} className="absolute inset-0">
      {/* The simulator frameloop is frozen beneath; dim and blur that frame */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(8,7,6,0.55)", backdropFilter: "blur(10px)" }}
      />
      <Vignette />

      <div className="absolute inset-0 flex flex-col justify-center px-20 md:px-28">
        <div className="mb-14">
          <p
            className="text-[#4a3e32] text-[10px] tracking-[0.55em] uppercase mb-4"
            style={{ fontFamily: "'Raleway', sans-serif" }}
          >
            Paused
          </p>
          <h2
            className="text-[#ede8df] font-normal"
            style={{
              fontFamily: "'Libre Caslon Display', serif",
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              letterSpacing: "0.04em",
            }}
          >
            Take Your Time
          </h2>
          <div
            className="w-10 h-px mt-5"
            style={{ background: "rgba(196,122,53,0.35)" }}
          />
        </div>

        <nav className="flex flex-col gap-7">
          {[
            { label: "Resume", action: onResume },
            { label: "Settings", action: onSettings },
            { label: "Quit to Menu", action: onQuit },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              className="menu-item text-[#7a6e62] text-xs w-fit text-left"
              style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 400 }}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </motion.div>
  );
}

// ─── Arcade Mode Warning Modal ────────────────────────────────────────────────

function ArcadeWarning({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="absolute inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(8,7,6,0.88)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.97 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative w-full max-w-xl mx-8 border border-[rgba(196,122,53,0.2)]"
        style={{
          background: "rgba(10,8,6,0.97)",
          backdropFilter: "blur(20px)",
          padding: "clamp(2.5rem, 5vw, 4rem)",
        }}
      >
        {/* Amber top rule */}
        <div
          className="w-8 h-px mb-10"
          style={{ background: "#c47a35", opacity: 0.7 }}
        />

        <p
          className="text-[#4a3e32] text-[10px] tracking-[0.55em] uppercase mb-5"
          style={{ fontFamily: "'Raleway', sans-serif" }}
        >
          System Notice — Mode Adjustment
        </p>

        <h3
          className="text-[#ede8df] leading-tight font-normal mb-7"
          style={{
            fontFamily: "'Libre Caslon Display', serif",
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            letterSpacing: "0.03em",
          }}
        >
          You Remain an Inanimate Object
        </h3>

        <p
          className="text-[#6a5e52] text-sm leading-relaxed mb-3"
          style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 300 }}
        >
          Regardless of the selected mode, your physical nature — that of a stationary,
          non-sentient object — is a fixed property of this simulation and cannot be
          altered through software configuration.
        </p>

        <p
          className="text-[#4a3e32] text-sm leading-relaxed mb-12"
          style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 300 }}
        >
          Mode has been reverted to Realistic.
        </p>

        {/* Divider */}
        <div
          className="w-full h-px mb-10"
          style={{ background: "rgba(196,122,53,0.1)" }}
        />

        <button
          onClick={onClose}
          className="text-[10px] tracking-[0.4em] uppercase border border-[rgba(196,122,53,0.28)] px-9 py-3 transition-all duration-500"
          style={{
            fontFamily: "'Raleway', sans-serif",
            color: "#c47a35",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(196,122,53,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          Acknowledged
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Screen Navigator ─────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("main");
  const [settingsReturn, setSettingsReturn] = useState<Screen>("main");
  const [selectedSim, setSelectedSim] = useState<SimType>("coconut");
  const [showArcadeWarning, setShowArcadeWarning] = useState(false);
  const [mode, setMode] = useState<"Realistic" | "Arcade">("Realistic");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Graphics lives in the simulator store so the engine can react to it.
  const graphics = useSimulatorStore((s) => s.graphics);
  const setGraphics = useSimulatorStore((s) => s.setGraphics);

  useEffect(() => {
    if (screen === "loading") {
      setLoadingProgress(0);
      setTipIndex(Math.floor(Math.random() * TIPS.length));
      const interval = setInterval(() => {
        setLoadingProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => setScreen("hud"), 700);
            return 100;
          }
          return Math.min(p + Math.random() * 3.5 + 0.5, 100);
        });
      }, 90);
      return () => clearInterval(interval);
    }
  }, [screen]);

  const goSettings = (from: Screen) => {
    setSettingsReturn(from);
    setScreen("settings");
  };

  const handleModeToggle = (v: "Realistic" | "Arcade") => {
    if (v === "Arcade") {
      setShowArcadeWarning(true);
    } else {
      setMode("Realistic");
    }
  };

  const handleSelectSim = (sim: SimType) => {
    setSelectedSim(sim);
    // Boot the engine now: the scene loads and warms up behind the
    // (opaque) loading screen overlay.
    useSimulatorStore.getState().startSimulator(sim);
    setScreen("loading");
  };

  const handlePause = () => {
    useSimulatorStore.getState().setPaused(true); // freezes the frameloop
    setScreen("pause");
  };

  const handleResume = () => {
    useSimulatorStore.getState().setPaused(false);
    setScreen("hud");
  };

  const handleQuitToMenu = () => {
    useSimulatorStore.getState().stopSimulator();
    setScreen("main");
  };

  const currentSim = SIMS.find((s) => s.id === selectedSim) ?? SIMS[0];

  // The 3D canvas stays mounted across loading/HUD/pause/settings-from-pause
  // so the WebGL context and loaded scene survive menu navigation.
  const simulatorActive =
    screen === "loading" ||
    screen === "hud" ||
    screen === "pause" ||
    (screen === "settings" && settingsReturn === "pause");

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#080706]">
      <style>{`
        @keyframes driftPan {
          0%   { transform: scale(1.09) translate(0px, 0px); }
          20%  { transform: scale(1.09) translate(-18px, -10px); }
          45%  { transform: scale(1.09) translate(-8px, 14px); }
          70%  { transform: scale(1.09) translate(14px, -6px); }
          100% { transform: scale(1.09) translate(0px, 0px); }
        }
        .menu-item {
          position: relative;
          cursor: pointer;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          font-size: 0.7rem;
          transition: color 0.45s ease;
        }
        .menu-item::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 0;
          height: 1px;
          background: #c47a35;
          transition: width 0.55s cubic-bezier(0.25, 0.1, 0.25, 1);
        }
        .menu-item:hover { color: #ede8df !important; }
        .menu-item:hover::after { width: 100%; }
        * { scrollbar-width: none; }
        *::-webkit-scrollbar { display: none; }
      `}</style>

      {/* 3D simulator layer — sits beneath all UI overlays */}
      {simulatorActive && (
        <div className="absolute inset-0">
          <SimulatorCanvas simulatorId={selectedSim} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {screen === "main" && (
          <MainMenu
            key="main"
            onPlay={() => setScreen("simulator-select")}
            onSettings={() => goSettings("main")}
          />
        )}
        {screen === "settings" && (
          <SettingsMenu
            key="settings"
            graphics={graphics}
            mode={mode}
            onGraphics={setGraphics}
            onMode={handleModeToggle}
            onBack={() => setScreen(settingsReturn)}
            overSimulator={settingsReturn === "pause"}
          />
        )}
        {screen === "simulator-select" && (
          <SimulatorSelect
            key="sim-select"
            onSelect={handleSelectSim}
            onBack={() => setScreen("main")}
          />
        )}
        {screen === "loading" && (
          <LoadingScreen
            key="loading"
            sim={currentSim}
            progress={Math.min(loadingProgress, 100)}
            tip={TIPS[tipIndex]}
          />
        )}
        {screen === "hud" && (
          <HUDScreen key="hud" sim={currentSim} onPause={handlePause} />
        )}
        {screen === "pause" && (
          <PauseMenu
            key="pause"
            onResume={handleResume}
            onSettings={() => goSettings("pause")}
            onQuit={handleQuitToMenu}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showArcadeWarning && (
          <ArcadeWarning
            key="arcade-warning"
            onClose={() => {
              setShowArcadeWarning(false);
              setMode("Realistic");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
