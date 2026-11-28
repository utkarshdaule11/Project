"use client";

import React from "react";
import { VehicleType } from "@/hooks/useVehicleChoice";

interface VehicleGraphicProps {
  type: VehicleType;
  className?: string;
  driving?: boolean;
}

/**
 * Playful custom road-trip vehicle silhouettes inspired by Indian highway classics:
 * - sedan: Classic rounded Heritage Ambassador-style Grand Trunk tourer
 * - cruiser: Himalayan twin-exhaust adventure motorcycle
 * - suv: Rugged Overland 4x4 expedition rig with roof rack
 */
export function VehicleGraphic({
  type,
  className = "w-14 h-8",
  driving = false,
}: VehicleGraphicProps) {
  if (type === "cruiser") {
    return (
      <svg
        viewBox="0 0 80 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} ${driving ? "animate-bounce" : ""}`}
        style={driving ? { animationDuration: "0.75s" } : undefined}
        aria-hidden="true"
      >
        {/* Rear & Front Tires */}
        <circle cx="18" cy="32" r="8.5" fill="#102A33" stroke="#F29F3D" strokeWidth="2" />
        <circle cx="18" cy="32" r="3.2" fill="#FBF7EE" />
        <circle cx="62" cy="32" r="8.5" fill="#102A33" stroke="#F29F3D" strokeWidth="2" />
        <circle cx="62" cy="32" r="3.2" fill="#FBF7EE" />
        {/* Frame & Exhaust */}
        <path d="M12 29 L32 29 L44 21" stroke="#5D7279" strokeWidth="3" strokeLinecap="round" />
        <path d="M22 30 L34 19 L50 18 L59 30" stroke="#D95338" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Fuel Tank & Seat */}
        <path d="M23 20 Q30 17 36 19 L34 23 L21 23 Z" fill="#102A33" />
        <path d="M36 18 Q44 11 52 16 L48 22 L36 21 Z" fill="#F29F3D" />
        {/* Handlebar & Windscreen */}
        <path d="M51 16 L49 9 L55 7" stroke="#102A33" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M54 9 Q59 12 58 17" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" />
        {/* Headlight glow */}
        <circle cx="59" cy="18" r="2.8" fill="#FACC15" />
      </svg>
    );
  }

  if (type === "sedan") {
    return (
      <svg
        viewBox="0 0 88 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} ${driving ? "animate-bounce" : ""}`}
        style={driving ? { animationDuration: "0.95s" } : undefined}
        aria-hidden="true"
      >
        {/* Classic Rounded Cabin & Trunk */}
        <path
          d="M10 26 C10 21, 15 19, 22 19 L30 10 C34 7, 50 7, 56 11 L65 19 C73 19, 78 22, 78 27 L78 31 L10 31 Z"
          fill="#FBF7EE"
          stroke="#102A33"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Roof Rack Luggage */}
        <rect x="34" y="6" width="16" height="3.5" rx="1.5" fill="#D95338" />
        {/* Windows */}
        <path d="M26 19 L32 11.5 L43 11.5 L43 19 Z" fill="#1C6E5A" fillOpacity="0.85" />
        <path d="M46 11.5 L53 11.5 L60 19 L46 19 Z" fill="#1C6E5A" fillOpacity="0.85" />
        {/* Heritage Chrome Trim & Headlight */}
        <line x1="12" y1="25" x2="76" y2="25" stroke="#F29F3D" strokeWidth="2" />
        <circle cx="76" cy="23" r="2.5" fill="#FACC15" />
        <rect x="9" y="22" width="3" height="4" rx="1" fill="#D95338" />
        {/* Wheels */}
        <circle cx="24" cy="32" r="7.5" fill="#102A33" stroke="#F29F3D" strokeWidth="2" />
        <circle cx="24" cy="32" r="3" fill="#FBF7EE" />
        <circle cx="64" cy="32" r="7.5" fill="#102A33" stroke="#F29F3D" strokeWidth="2" />
        <circle cx="64" cy="32" r="3" fill="#FBF7EE" />
      </svg>
    );
  }

  // Default: Overland 4x4 Explorer
  return (
    <svg
      viewBox="0 0 90 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${driving ? "animate-bounce" : ""}`}
      style={driving ? { animationDuration: "0.85s" } : undefined}
      aria-hidden="true"
    >
      {/* Spare Tire on Back */}
      <rect x="6" y="17" width="5" height="12" rx="2" fill="#102A33" stroke="#F29F3D" strokeWidth="1.2" />
      {/* Roof Rack & Expedition Gear */}
      <rect x="20" y="6" width="32" height="4" rx="1.5" fill="#F29F3D" stroke="#102A33" strokeWidth="1.5" />
      <line x1="25" y1="10" x2="25" y2="12" stroke="#102A33" strokeWidth="2" />
      <line x1="47" y1="10" x2="47" y2="12" stroke="#102A33" strokeWidth="2" />
      {/* Rugged Body */}
      <path
        d="M11 32 L11 16 C11 13, 14 12, 17 12 L52 12 C56 12, 58 15, 62 19 L77 21 C80 21.5, 82 24, 82 27 L82 32 Z"
        fill="#1C6E5A"
        stroke="#102A33"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Windows */}
      <rect x="16" y="15" width="12" height="7.5" rx="1.5" fill="#E0F2FE" />
      <rect x="31" y="15" width="12" height="7.5" rx="1.5" fill="#E0F2FE" />
      <path d="M46 15 L53 15 L58 22.5 L46 22.5 Z" fill="#E0F2FE" />
      {/* Racing Stripe & Headlight */}
      <line x1="12" y1="26.5" x2="80" y2="26.5" stroke="#FACC15" strokeWidth="2.2" />
      <circle cx="80" cy="24.5" r="2.5" fill="#FACC15" />
      {/* All-Terrain Wheels */}
      <circle cx="25" cy="34" r="8" fill="#102A33" stroke="#F29F3D" strokeWidth="2.2" />
      <circle cx="25" cy="34" r="3" fill="#FBF7EE" />
      <circle cx="67" cy="34" r="8" fill="#102A33" stroke="#F29F3D" strokeWidth="2.2" />
      <circle cx="67" cy="34" r="3" fill="#FBF7EE" />
    </svg>
  );
}
