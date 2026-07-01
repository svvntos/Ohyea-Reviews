import React from "react";
import { motion } from "motion/react";

// 24x24 Custom Pixel Art Grid
// . = transparent
// b = black outline (#09090b)
// g = glass reflection (#cbd5e1)
// w = bright white shine (#ffffff)
// r = main cherry red (#ef4444)
// R = lighter highlight red (#f87171)
// d = darker shadow red (#991b1b)
// k = deep cyan handle (#0284c7)
// c = bright cyan handle shine (#38bdf8)
// o = boots slate gray (#e2e8f0)
// y = boots shadow (#94a3b8)

const GRID = [
  ".....gggggggggggg.......",
  "....gwwwwwwwwwwwwg......",
  "....gbbbbbbbbbbbbg......",
  ".....rRrrrrrrrrrd.......",
  "..kkrRrrrrrrrrrrddkk....",
  ".kcckrrrrrrrrrrrrddck...",
  "kcckrrwrrrrrrrrrrRddck..",
  "kckkrrwwrrrrrrrrrrdddk..",
  "kckkrrwrrbbddrbbbddddk..",
  "kckkrrrrrbbddrbbbddddk..",
  ".kckkrrrrrrrrrrrrdddk...",
  "..kkrrrrrbbbbbbbrddkk...",
  "...rrrrrrbbwwbbrddr.....",
  "...rrrrrrrbbbbrddrr.....",
  "....rrrrrrrrrrddrr......",
  ".....rrrrrrrrddrr.......",
  "......rrrrrrddrr........",
  ".......gddddg...........",
  ".......gbbbbg...........",
  "........b..b............",
  ".......b.b.b.b..........",
  "......oo.b.b.oo.........",
  ".....ooo.b.b.ooo........",
  "....bbbb.....bbbb.......",
];

export const KoolAidMascot = ({
  className = "w-12 h-12",
  liquidColor = "#ef4444",
  highlightColor = "#f87171",
  shadowColor = "#991b1b",
  handleColor = "#0284c7",
  handleShineColor = "#38bdf8",
}) => {
  const COLOR_MAP = {
    ".": "transparent",
    b: "#09090b",
    g: "#cbd5e1",
    w: "#ffffff",
    r: liquidColor,
    R: highlightColor,
    d: shadowColor,
    k: handleColor,
    c: handleShineColor,
    o: "#e2e8f0",
    y: "#94a3b8",
  };

  return (
    <motion.div
      className={`${className} inline-block shrink-0 select-none cursor-pointer`}
      animate={{
        y: [0, -3, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.15,
        rotate: [0, -8, 8, -8, 0],
        transition: { duration: 0.4 },
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        shapeRendering="crispEdges"
        className="w-full h-full drop-shadow-[0_4px_6px_rgba(239,68,68,0.15)]"
      >
        {GRID.map((row, y) => {
          return row.split("").map((char, x) => {
            const color = COLOR_MAP[char];
            if (color === "transparent") return null;
            return (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={color}
              />
            );
          });
        })}
      </svg>
    </motion.div>
  );
};
