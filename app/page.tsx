"use client";
import { useEffect, useState } from "react";

// 0=empty, 1=body, 2=antler, 3=extremity
const ALIEN = [
  [0,0,2,0,0,0,0,0,2,0,0],
  [0,0,0,2,0,0,0,2,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,1,1,0,1,1,1,0,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1],
  [1,0,1,1,1,1,1,1,1,0,1],
  [3,0,1,0,0,0,0,0,1,0,3],
  [0,0,0,3,3,0,3,3,0,0,0],
];

const PALETTE = [
  "#f472b6", "#a78bfa", "#34d399", "#fb923c",
  "#60a5fa", "#f87171", "#facc15", "#e879f9",
];

function randomColor() {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

function SpaceInvader() {
  const [color, setColor] = useState(PALETTE[0]);

  useEffect(() => {
    const id = setInterval(() => setColor(randomColor()), 400);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{`
        @keyframes side-to-side {
          0%   { transform: translateX(0); }
          50%  { transform: translateX(-80vw); }
          100% { transform: translateX(0); }
        }
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
      <div
        className="absolute top-8 right-8 flex flex-col gap-[3px]"
        style={{ animation: "side-to-side 4s ease-in-out infinite" }}
      >
        {ALIEN.map((row, r) => (
          <div key={r} className="flex gap-[3px]">
            {row.map((cell, c) => {
              if (!cell) return <div key={c} className="w-3 h-3" />;
              const isAntler = cell === 2;
              const isLimb = cell === 3;
              const isLeft = c < 5;
              const cls = isAntler
                ? (isLeft ? "antler" : "antler-r")
                : isLimb
                ? (isLeft ? "limb" : "limb-r")
                : "";
              return (
                <div
                  key={c}
                  className={`w-3 h-3 ${cls}`}
                  style={{ backgroundColor: color }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

export default function Home() {
  return (
    <div className="relative flex h-screen items-center justify-center bg-black">
      <SpaceInvader />
      <h1 className="text-6xl font-bold tracking-tight text-lime-400">Carlos Orozco</h1>
    </div>
  );
}
