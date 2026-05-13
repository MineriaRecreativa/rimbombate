"use client";
import { useEffect, useRef, useState } from "react";

// 0=empty, 1=body, 2=antler, 3=extremity
const ALIEN_GRID = [
  [0,0,2,0,0,0,0,0,2,0,0],
  [0,0,0,2,0,0,0,2,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,1,1,0,1,1,1,0,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1],
  [1,0,1,1,1,1,1,1,1,0,1],
  [3,0,1,0,0,0,0,0,1,0,3],
  [0,0,0,3,3,0,3,3,0,0,0],
];

const SHIP_GRID = [
  [0,0,0,0,1,0,0,0,0],
  [0,0,0,1,1,1,0,0,0],
  [0,1,1,1,1,1,1,1,0],
  [1,1,0,1,1,1,0,1,1],
];

const PALETTE = ["#f472b6","#a78bfa","#34d399","#fb923c","#60a5fa","#f87171","#facc15","#e879f9"];

function randomColor() {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

function getPixelSize(w: number) {
  if (w < 480) return { px: 5, gap: 2 };
  if (w < 768) return { px: 7, gap: 2 };
  return { px: 12, gap: 3 };
}

function alienW(px: number, gap: number) { return 11 * px + 10 * gap; }
function shipW(px: number, gap: number)  { return  9 * px +  8 * gap; }
function shipH(px: number, gap: number)  { return  4 * px +  3 * gap; }

function AlienPixels({ color, px, gap }: { color: string; px: number; gap: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {ALIEN_GRID.map((row, r) => (
        <div key={r} style={{ display: "flex", gap }}>
          {row.map((cell, c) => {
            if (!cell) return <div key={c} style={{ width: px, height: px }} />;
            const cls = cell === 2
              ? (c < 5 ? "antler" : "antler-r")
              : cell === 3
              ? (c < 5 ? "limb" : "limb-r")
              : "";
            return <div key={c} className={cls} style={{ width: px, height: px, backgroundColor: color }} />;
          })}
        </div>
      ))}
    </div>
  );
}

function ShipPixels({ px, gap }: { px: number; gap: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {SHIP_GRID.map((row, r) => (
        <div key={r} style={{ display: "flex", gap }}>
          {row.map((cell, c) => (
            <div key={c} style={{ width: px, height: px, backgroundColor: cell ? "#4ade80" : "transparent" }} />
          ))}
        </div>
      ))}
    </div>
  );
}

type Bullet = { id: number; x: number; y: number };

export default function Home() {
  const [winW, setWinW] = useState(0);
  const [winH, setWinH] = useState(0);
  const [alienX, setAlienX] = useState(0);
  const [shipX, setShipX] = useState(0);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const alienColor = "#84cc16";
  const [pixelCfg, setPixelCfg] = useState({ px: 12, gap: 3 });

  const tRef      = useRef(0);
  const alienXRef = useRef(0);
  const shipXRef  = useRef(0);
  const cfgRef    = useRef({ px: 12, gap: 3 });

  // Init window size + pixel scale
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cfg = getPixelSize(w);
    cfgRef.current = cfg;
    setPixelCfg(cfg);
    setWinW(w);
    setWinH(h);
    const aW = alienW(cfg.px, cfg.gap);
    const sW = shipW(cfg.px, cfg.gap);
    alienXRef.current = w - aW - 32;
    setAlienX(alienXRef.current);
    shipXRef.current = w / 2 - sW / 2;
    setShipX(shipXRef.current);
  }, []);

  // Alien oscillates side to side
  useEffect(() => {
    if (!winW) return;
    const { px, gap } = cfgRef.current;
    const aW = alienW(px, gap);
    const id = setInterval(() => {
      tRef.current += 0.025;
      const range = winW - aW - 64;
      const x = 32 + ((Math.sin(tRef.current) + 1) / 2) * range;
      alienXRef.current = x;
      setAlienX(x);
    }, 16);
    return () => clearInterval(id);
  }, [winW]);

  // Ship chases alien with lag
  useEffect(() => {
    if (!winW) return;
    const { px, gap } = cfgRef.current;
    const aW = alienW(px, gap);
    const sW = shipW(px, gap);
    const id = setInterval(() => {
      setShipX(prev => {
        const target = alienXRef.current + aW / 2 - sW / 2;
        const next = Math.max(0, Math.min(winW - sW, prev + (target - prev) * 0.045));
        shipXRef.current = next;
        return next;
      });
    }, 16);
    return () => clearInterval(id);
  }, [winW]);

  // Spawn bullets
  useEffect(() => {
    if (!winH) return;
    const { px, gap } = cfgRef.current;
    const sW = shipW(px, gap);
    const sH = shipH(px, gap);
    const id = setInterval(() => {
      setBullets(prev => [
        ...prev.slice(-10),
        { id: Date.now(), x: shipXRef.current + sW / 2, y: winH - 32 - sH },
      ]);
    }, 700);
    return () => clearInterval(id);
  }, [winH]);

  // Move bullets upward, vanish before reaching alien
  useEffect(() => {
    const id = setInterval(() => {
      setBullets(prev =>
        prev.map(b => ({ ...b, y: b.y - 7 })).filter(b => b.y > 130)
      );
    }, 16);
    return () => clearInterval(id);
  }, []);


  if (!winW) return <div className="h-screen bg-black" />;

  const { px, gap } = pixelCfg;

  return (
    <div className="relative flex h-screen items-center justify-center bg-black overflow-hidden">
      <style>{`
        @keyframes antler-bob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }
        @keyframes limb-kick {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(4px); }
        }
        .antler   { animation: antler-bob 0.5s ease-in-out infinite; }
        .antler-r { animation: antler-bob 0.5s ease-in-out infinite; animation-delay: 0.15s; }
        .limb     { animation: limb-kick 0.4s ease-in-out infinite; }
        .limb-r   { animation: limb-kick 0.4s ease-in-out infinite; animation-delay: 0.2s; }
      `}</style>

      {/* Alien */}
      <div style={{ position: "absolute", top: 32, left: alienX }}>
        <AlienPixels color={alienColor} px={px} gap={gap} />
      </div>

      {/* Spaceship */}
      <div style={{ position: "absolute", bottom: 32, left: shipX }}>
        <ShipPixels px={px} gap={gap} />
      </div>

      {/* Bullets */}
      {bullets.map(b => (
        <div
          key={b.id}
          style={{
            position: "absolute",
            left: b.x - 2,
            top: b.y,
            width: px < 8 ? 2 : 4,
            height: px < 8 ? 8 : 12,
            backgroundColor: "#facc15",
            borderRadius: 2,
          }}
        />
      ))}

      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-lime-400">Carlos Orozco</h1>
    </div>
  );
}
