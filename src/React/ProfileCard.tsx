import React, { useEffect, useMemo, useRef, useState } from "react";
import { profile } from "../config/profile";

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const ProfileCard: React.FC = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState<string>("perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)");
  const [glare, setGlare] = useState<{ x: number; y: number; o: number }>({ x: 50, y: 50, o: 0 });
  const [parallax, setParallax] = useState<{ sx: number; sy: number; mx: number; my: number }>({ sx: 0, sy: 0, mx: 0, my: 0 });
  const [tilt, setTilt] = useState<{ rx: number; ry: number; mag: number }>({ rx: 0, ry: 0, mag: 0 });
  const raf = useRef<number | null>(null);

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  const deviceTiltActive = useRef(false);
  const [motionStatus, setMotionStatus] = useState<"idle" | "granted" | "denied" | "unsupported">("idle");

  const pointerMove = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width; // 0..1
    const py = (clientY - rect.top) / rect.height; // 0..1
    const rotY = clamp((px - 0.5) * 22, -22, 22); // left-right
    const rotX = clamp((0.5 - py) * 18, -18, 18); // up-down
    const z = 14;
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      setTransform(`perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${z}px)`);
      setGlare({ x: px * 100, y: py * 100, o: 0.18 });
      const dx = px - 0.5;
      const dy = py - 0.5;
      setParallax({ sx: -dx * 6, sy: -dy * 6, mx: -dx * 10, my: -dy * 10 });
      const mag = Math.min(1, Math.hypot(rotX / 18, rotY / 22));
      setTilt({ rx: rotX, ry: rotY, mag });
    });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (deviceTiltActive.current) return; // ignore while gyro controls
    pointerMove(e.clientX, e.clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (deviceTiltActive.current) return;
    const t = e.touches[0];
    if (t) pointerMove(t.clientX, t.clientY);
  };

  const onLeave = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      setTransform("perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)");
      setGlare((g) => ({ ...g, o: 0 }));
      setParallax({ sx: 0, sy: 0, mx: 0, my: 0 });
      setTilt({ rx: 0, ry: 0, mag: 0 });
    });
  };

  // Device orientation: attach listener when granted
  useEffect(() => {
    if (motionStatus !== "granted") return;
    deviceTiltActive.current = true;
    const handler = (e: DeviceOrientationEvent) => {
      if (!deviceTiltActive.current) return;
      const beta = e.beta ?? 0; // x-axis tilt
      const gamma = e.gamma ?? 0; // y-axis tilt
      const rotX = clamp(-beta / 3, -18, 18);
      const rotY = clamp(gamma / 2, -22, 22);
      const px = clamp((gamma + 90) / 180, 0, 1);
      const py = clamp((beta + 90) / 180, 0, 1);
      const z = 14;
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        setTransform(`perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${z}px)`);
        setGlare({ x: px * 100, y: py * 100, o: 0.22 });
        const dx = px - 0.5;
        const dy = py - 0.5;
        setParallax({ sx: -dx * 6, sy: -dy * 6, mx: -dx * 10, my: -dy * 10 });
        const mag = Math.min(1, Math.hypot(rotX / 18, rotY / 22));
        setTilt({ rx: rotX, ry: rotY, mag });
      });
    };
    window.addEventListener("deviceorientation", handler, true);
    return () => {
      window.removeEventListener("deviceorientation", handler, true);
      deviceTiltActive.current = false;
    };
  }, [motionStatus]);

  const requestMotion = async () => {
    try {
      const anyDOE: any = (window as any).DeviceOrientationEvent;
      if (!anyDOE) {
        setMotionStatus("unsupported");
        return;
      }
      if (typeof anyDOE.requestPermission === "function") {
        const res = await anyDOE.requestPermission();
        if (res === "granted") setMotionStatus("granted");
        else setMotionStatus("denied");
      } else {
        // No explicit permission flow (Android/older iOS)
        setMotionStatus("granted");
      }
    } catch {
      setMotionStatus("denied");
    }
  };

  const githubHandle = useMemo(() => {
    try {
      const u = new URL(profile.github || "");
      const seg = u.pathname.split("/").filter(Boolean);
      return seg[0] ? `@${seg[0]}` : "Online";
    } catch {
      return "Online";
    }
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onTouchMove={onTouchMove}
      onMouseLeave={onLeave}
      className="group w-full max-w-[340px] mx-auto rounded-3xl relative p-[2px]"
      style={{
        transform,
        transition: "transform 200ms cubic-bezier(0.2, 0.65, 0.3, 1)",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {/* Animated gradient border ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[24px]"
        style={{
          padding: "2px",
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(169,255,91,0.55), rgba(74,144,226,0.55), rgba(169,255,91,0.55))",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor" as any,
          maskComposite: "exclude" as any,
          animation: "spin 6s linear infinite",
          opacity: 0.35,
        }}
      />
      {/* Outer glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[28px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(169,255,91,0.25) 0%, rgba(74,144,226,0.18) 35%, rgba(0,0,0,0) 70%)",
          filter: "blur(28px)",
        }}
      />
      {/* Gradient frame */}
      <div aria-hidden className="absolute inset-0 rounded-3xl"
           style={{ background: "linear-gradient(135deg, rgba(30,120,180,0.8), rgba(65,95,180,0.35) 45%, rgba(255,255,255,0.12))",
                    filter: "blur(0.6px)" }} />
      {/* Glare */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(500px 300px at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.o}) 0%, rgba(255,255,255,0) 60%)`,
          pointerEvents: "none",
          mixBlendMode: "overlay",
          transition: "background 120ms linear",
        }}
      />

      {/* Card body with subtle glass and border */}
      {(() => {
        const ox = tilt.ry * 1.2; // horizontal offset follows Y-rotation
        const oy = -tilt.rx * 1.2; // vertical offset opposite X-rotation
        const blur = 30 + 40 * tilt.mag;
        const darkAlpha = 0.45 + 0.25 * tilt.mag;
        const glowGBlur = 24 + 36 * tilt.mag;
        const glowBBlur = 20 + 44 * tilt.mag;
        const shadow = `${ox}px ${oy}px ${blur}px rgba(0,0,0,${darkAlpha})`;
        const glowG = `0 0 ${glowGBlur}px rgba(169,255,91,${0.12 + 0.20 * tilt.mag})`;
        const glowB = `0 0 ${glowBBlur}px rgba(74,144,226,${0.10 + 0.16 * tilt.mag})`;
        const combined = `${glowG}, ${glowB}, ${shadow}`;
        return (
          <div
            className="relative rounded-[22px] border border-[var(--white-icon-tr)] bg-[#0f0f10]/75 backdrop-blur-xl overflow-hidden min-h-[440px] md:min-h-[480px]"
            style={{ transform: "translateZ(6px)", boxShadow: combined }}
          >
            {/* Motion permission prompt (mobile tilt) */}
            {motionStatus !== "granted" && (
              <button
                type="button"
                onClick={requestMotion}
                className="absolute right-3 top-3 z-[3] text-xs px-2 py-1 rounded-md border border-white/20 bg-white/10 text-white/80 hover:bg-white/20"
                aria-label="Enable motion for tilt"
                title={motionStatus === "denied" ? "Motion denied: tap to retry. You may need to enable it in browser settings." : motionStatus === "unsupported" ? "Motion not supported on this device" : "Enable motion tilt"}
                disabled={motionStatus === "unsupported"}
              >
                {motionStatus === "denied" ? "Motion blocked" : motionStatus === "unsupported" ? "No motion" : "Enable Motion"}
              </button>
            )}
            {/* Shine sweep */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-1 rotate-12 opacity-0 group-hover:opacity-100 transition-[opacity,transform] duration-700 ease-out -translate-x-[150%] group-hover:translate-x-[150%]"
              style={{
                background:
                  "linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.22) 50%, transparent 80%)",
              }}
            />
            {/* Background blobs for depth */}
            <div aria-hidden className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(circle at 30% 30%, #2aa9e0, transparent 60%)" }} />
            <div aria-hidden className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-15" style={{ background: "radial-gradient(circle at 70% 70%, #1f2b6d, transparent 60%)" }} />
      
      <div className="pt-6 px-6 text-center" style={{ transform: `translateZ(22px) translate3d(${parallax.sx}px, ${parallax.sy}px, 0)` }}>
        <h3 className="text-2xl md:text-3xl font-semibold text-[var(--white)] drop-shadow-sm">{profile.name}</h3>
        <p className="text-sm md:text-base text-[var(--white-icon)] mt-1">{profile.role}</p>
      </div>
      
      <div className="px-0 pt-3 pb-0 flex flex-col items-center text-center" style={{ transform: `translateZ(25px) translate3d(${parallax.mx}px, ${parallax.my}px, 0)` }}>
        <img
          src={profile.photoUrl || "/favicon.png"}
          onError={(e) => {
            const t = e.currentTarget as HTMLImageElement;
            if (!t.src.endsWith("/favicon.png")) t.src = "/favicon.png";
          }}
          alt={`${profile.name} avatar`}
          className="block w-full h-72 md:h-80 object-cover grayscale contrast-110"
          loading="lazy"
          style={{ boxShadow: "0 12px 30px rgba(0,0,0,0.4)", transform: `translateZ(10px) translate3d(${parallax.mx}px, ${parallax.my}px, 0)` }}
        />
        <div className="sr-only">{profile.name} - {profile.role}</div>
      </div>
      
      <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-[90%] md:w-[84%] z-[2]">
        <div className="transform-gpu" style={{ transform: `translateZ(18px) translate3d(${parallax.sx}px, ${parallax.sy}px, 0)` }}>
          <div className="w-full bg-white/12 border border-white/15 backdrop-blur-2xl backdrop-saturate-0 backdrop-brightness-110 rounded-xl px-3 py-2 grid grid-cols-3 place-items-center gap-2 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
            <a
              href={profile.github}
              target="_blank"
              aria-label="GitHub"
              className="size-9 flex items-center justify-center text-[var(--white-icon)] hover:text-white transition duration-300 ease-in-out border border-white/15 rounded-lg bg-[#1414149c] hover:bg-white/15"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12.001 2C6.47598 2 2.00098 6.475 2.00098 12C2.00098 16.425 4.86348 20.1625 8.83848 21.4875C9.33848 21.575 9.52598 21.275 9.52598 21.0125C9.52598 20.775 9.51348 19.9875 9.51348 19.15C7.00098 19.6125 6.35098 18.5375 6.15098 17.975C6.03848 17.6875 5.55098 16.8 5.12598 16.5625C4.77598 16.375 4.27598 15.9125 5.11348 15.9C5.90098 15.8875 6.46348 16.625 6.65098 16.925C7.55098 18.4375 8.98848 18.0125 9.56348 17.75C9.65098 17.1 9.91348 16.6625 10.201 16.4125C7.97598 16.1625 5.65098 15.3 5.65098 11.475C5.65098 10.3875 6.03848 9.4875 6.67598 8.7875C6.57598 8.5375 6.22598 7.5125 6.77598 6.1375C6.77598 6.1375 7.61348 5.875 9.52598 7.1625C10.326 6.9375 11.176 6.825 12.026 6.825C12.876 6.825 13.726 6.9375 14.526 7.1625C16.4385 5.8625 17.276 6.1375 17.276 6.1375C17.826 7.5125 17.476 8.5375 17.376 8.7875C18.0135 9.4875 18.401 10.375 18.401 11.475C18.401 15.3125 16.0635 16.1625 13.8385 16.4125C14.201 16.725 14.5135 17.325 14.5135 18.2625C14.5135 19.6 14.501 20.675 14.501 21.0125C14.501 21.275 14.6885 21.5875 15.1885 21.4875C19.259 20.1133 21.9999 16.2963 22.001 12C22.001 6.475 17.526 2 12.001 2Z" />
              </svg>
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              aria-label="LinkedIn"
              className="size-9 flex items-center justify-center text-[var(--white-icon)] hover:text-white transition duration-300 ease-in-out border border-white/15 rounded-lg bg-[#1414149c] hover:bg-white/15"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M18.3362 18.339H15.6707V14.1622C15.6707 13.1662 15.6505 11.8845 14.2817 11.8845C12.892 11.8845 12.6797 12.9683 12.6797 14.0887V18.339H10.0142V9.75H12.5747V10.9207H12.6092C12.967 10.2457 13.837 9.53325 15.1367 9.53325C17.8375 9.53325 18.337 11.3108 18.337 13.6245V18.339H18.3362ZM7.00373 8.57475C6.14573 8.57475 5.45648 7.88025 5.45648 7.026C5.45648 6.1725 6.14648 5.47875 7.00373 5.47875C7.85873 5.47875 8.55173 6.1725 8.55173 7.026C8.55173 7.88025 7.85798 8.57475 7.00373 8.57475ZM8.34023 18.339H5.66723V9.75H8.34023V18.339ZM19.6697 3H4.32923C3.59498 3 3.00098 3.5805 3.00098 4.29675V19.7033C3.00098 20.4202 3.59498 21 4.32923 21H19.6675C20.401 21 21.001 20.4202 21.001 19.7033V4.29675C21.001 3.5805 20.401 3 19.6675 3H19.6697Z" />
              </svg>
            </a>
            <a
              href={`mailto:${profile.email}`}
              aria-label="Email"
              className="size-9 flex items-center justify-center text-[var(--white-icon)] hover:text-white transition duration-300 ease-in-out border border-white/15 rounded-lg bg-[#1414149c] hover:bg-white/15"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="m18.73 5.41l-1.28 1L12 10.46L6.55 6.37l-1.28-1A2 2 0 0 0 2 7.05v11.59A1.36 1.36 0 0 0 3.36 20h3.19v-7.72L12 16.37l5.45-4.09V20h3.19A1.36 1.36 0 0 0 22 18.64V7.05a2 2 0 0 0-3.27-1.64"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
          </div>
        );
      })()}
      </div>
  );
};

export default ProfileCard;
