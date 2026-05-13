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
const PX = 12;
const GAP = 3;
const ALIEN_W = 11 * PX + 10 * GAP;
const SHIP_W  =  9 * PX +  8 * GAP;
const SHIP_H  =  4 * PX +  3 * GAP;

function randomColor() {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

function AlienPixels({ color }: { color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
      {ALIEN_GRID.map((row, r) => (
        <div key={r} style={{ display: "flex", gap: GAP }}>
          {row.map((cell, c) => {
            if (!cell) return <div key={c} style={{ width: PX, height: PX }} />;
            const cls = cell === 2
              ? (c < 5 ? "antler" : "antler-r")
              : cell === 3
              ? (c < 5 ? "limb" : "limb-r")
              : "";
            return <div key={c} className={cls} style={{ width: PX, height: PX, backgroundColor: color }} />;
          })}
        </div>
      ))}
    </div>
  );
}

function ShipPixels() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
      {SHIP_GRID.map((row, r) => (
        <div key={r} style={{ display: "flex", gap: GAP }}>
          {row.map((cell, c) => (
            <div key={c} style={{ width: PX, height: PX, backgroundColor: cell ? "#4ade80" : "transparent" }} />
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
  const [alienColor, setAlienColor] = useState(PALETTE[0]);

  const tRef       = useRef(0);
  const alienXRef  = useRef(0);
  const shipXRef   = useRef(0);

  // Init window size
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    setWinW(w);
    setWinH(h);
    alienXRef.current = w - ALIEN_W - 32;
    setAlienX(alienXRef.current);
    shipXRef.current = w / 2 - SHIP_W / 2;
    setShipX(shipXRef.current);
  }, []);

  // Alien oscillates side to side
  useEffect(() => {
    if (!winW) return;
    const id = setInterval(() => {
      tRef.current += 0.025;
      const range = winW - ALIEN_W - 64;
      const x = 32 + ((Math.sin(tRef.current) + 1) / 2) * range;
      alienXRef.current = x;
      setAlienX(x);
    }, 16);
    return () => clearInterval(id);
  }, [winW]);

  // Ship chases alien with lag — always behind
  useEffect(() => {
    if (!winW) return;
    const id = setInterval(() => {
      setShipX(prev => {
        const target = alienXRef.current + ALIEN_W / 2 - SHIP_W / 2;
        const diff = target - prev;
        const next = Math.max(0, Math.min(winW - SHIP_W, prev + diff * 0.045));
        shipXRef.current = next;
        return next;
      });
    }, 16);
    return () => clearInterval(id);
  }, [winW]);

  // Spawn bullets from ship cannon
  useEffect(() => {
    if (!winH) return;
    const id = setInterval(() => {
      setBullets(prev => [
        ...prev.slice(-10),
        { id: Date.now(), x: shipXRef.current + SHIP_W / 2, y: winH - 32 - SHIP_H },
      ]);
    }, 700);
    return () => clearInterval(id);
  }, [winH]);

  // Move bullets up, vanish before reaching alien
  useEffect(() => {
    const id = setInterval(() => {
      setBullets(prev =>
        prev.map(b => ({ ...b, y: b.y - 7 })).filter(b => b.y > 130)
      );
    }, 16);
    return () => clearInterval(id);
  }, []);

  // Alien color flash
  useEffect(() => {
    const id = setInterval(() => setAlienColor(randomColor()), 400);
    return () => clearInterval(id);
  }, []);

  if (!winW) return <div className="h-screen bg-black" />;

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
        <AlienPixels color={alienColor} />
      </div>

      {/* Spaceship */}
      <div style={{ position: "absolute", bottom: 32, left: shipX }}>
        <ShipPixels />
      </div>

      {/* Bullets */}
      {bullets.map(b => (
        <div
          key={b.id}
          style={{
            position: "absolute",
            left: b.x - 2,
            top: b.y,
            width: 4,
            height: 12,
            backgroundColor: "#facc15",
            borderRadius: 2,
          }}
        />
      ))}

      <h1 className="text-6xl font-bold tracking-tight text-lime-400">Carlos Orozco</h1>
    </div>
  );
}
