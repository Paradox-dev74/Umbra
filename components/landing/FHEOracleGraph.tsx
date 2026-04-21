/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Animated FHE Oracle Graph (SVG)
   3 connected nodes: Chainlink → FHE Core → Privara
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useEffect, useRef, useState } from "react";

export function FHEOracleGraph() {
  const [animating, setAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setAnimating(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto mt-16">
      <svg viewBox="0 0 800 200" className="w-full h-auto">
        <defs>
          {/* Path from Chainlink to FHE Core */}
          <path
            id="path1"
            d="M 140 100 C 240 100, 280 100, 370 100"
            fill="none"
          />
          {/* Path from FHE Core to Privara */}
          <path
            id="path2"
            d="M 430 100 C 520 100, 560 100, 660 100"
            fill="none"
          />
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection Lines */}
        <path
          d="M 140 100 C 240 100, 280 100, 370 100"
          fill="none"
          stroke="rgba(59,130,246,0.3)"
          strokeWidth="2"
          strokeDasharray={animating ? "0" : "6 6"}
          className="transition-all duration-1000"
        />
        <path
          d="M 430 100 C 520 100, 560 100, 660 100"
          fill="none"
          stroke="rgba(59,130,246,0.3)"
          strokeWidth="2"
          strokeDasharray={animating ? "0" : "6 6"}
          className="transition-all duration-1000"
        />

        {/* Traveling dot on path 1 */}
        {animating && (
          <circle r="4" fill="#3B82F6" filter="url(#nodeGlow)">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              path="M 140 100 C 240 100, 280 100, 370 100"
            />
          </circle>
        )}

        {/* Traveling dot on path 2 */}
        {animating && (
          <circle r="4" fill="#3B82F6" filter="url(#nodeGlow)">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              path="M 430 100 C 520 100, 560 100, 660 100"
              begin="1.25s"
            />
          </circle>
        )}

        {/* NODE 1: Chainlink */}
        <rect
          x="40"
          y="65"
          width="180"
          height="70"
          rx="12"
          fill="#050D1A"
          stroke="rgba(59,130,246,0.4)"
          strokeWidth="1.5"
        />
        <text
          x="130"
          y="95"
          textAnchor="middle"
          fill="#3B82F6"
          fontSize="14"
          fontWeight="600"
        >
          ⬡ Chainlink
        </text>
        <text
          x="130"
          y="118"
          textAnchor="middle"
          fill="#94A3B8"
          fontSize="11"
        >
          Oracle Feed
        </text>

        {/* NODE 2: FHE Core — hexagonal feel, larger, pulsing */}
        <g>
          {/* Pulsing ring */}
          {animating && (
            <circle cx="400" cy="100" r="45" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="2">
              <animate
                attributeName="r"
                values="45;55;45"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0.2;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          )}
          {/* Hexagonal node */}
          <polygon
            points="400,55 440,75 440,125 400,145 360,125 360,75"
            fill="#050D1A"
            stroke="rgba(139,92,246,0.6)"
            strokeWidth="2"
          />
          <text
            x="400"
            y="96"
            textAnchor="middle"
            fill="#8B5CF6"
            fontSize="13"
            fontWeight="700"
          >
            FHE CORE
          </text>
          <text
            x="400"
            y="115"
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="10"
          >
            Umbra
          </text>
        </g>

        {/* NODE 3: Privara */}
        <rect
          x="580"
          y="65"
          width="180"
          height="70"
          rx="12"
          fill="#050D1A"
          stroke="rgba(16,185,129,0.4)"
          strokeWidth="1.5"
        />
        <text
          x="670"
          y="95"
          textAnchor="middle"
          fill="#10B981"
          fontSize="14"
          fontWeight="600"
        >
          ⬡ Privara
        </text>
        <text
          x="670"
          y="118"
          textAnchor="middle"
          fill="#94A3B8"
          fontSize="11"
        >
          Settlement
        </text>

        {/* Path Labels */}
        <text
          x="255"
          y="85"
          textAnchor="middle"
          fill="#94A3B8"
          fontSize="10"
        >
          Public Oracle Data
        </text>
        <text
          x="545"
          y="85"
          textAnchor="middle"
          fill="#94A3B8"
          fontSize="10"
        >
          Encrypted Signal
        </text>
      </svg>
    </div>
  );
}
