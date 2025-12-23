import React from "react";

/* 1. Extra-Long Grain Rice Icon */
export const RiceIcon = ({ size = 24, color = "#BF6543" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="65" cy="25" rx="12" ry="4" transform="rotate(15 65 25)" fill={color} />
    <ellipse cx="80" cy="45" rx="12" ry="4" transform="rotate(-10 80 45)" fill={color} />
    <ellipse cx="78" cy="65" rx="12" ry="4" transform="rotate(5 78 65)" fill={color} />
    <ellipse cx="40" cy="55" rx="12" ry="4" transform="rotate(-45 40 55)" fill={color} />

    <ellipse cx="35" cy="20" rx="12" ry="4" transform="rotate(-15 35 20)"
      fill="none" stroke={color} strokeWidth="2" />
    <ellipse cx="50" cy="35" rx="12" ry="4" transform="rotate(75 50 35)"
      fill="none" stroke={color} strokeWidth="2" />
    <ellipse cx="35" cy="68" rx="12" ry="4" transform="rotate(20 35 68)"
      fill="none" stroke={color} strokeWidth="2" />
  </svg>
);

/* 2. Perfectly Aged (Clock) Icon */
export const ClockIcon = ({ size = 24, color = "#BF6543" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50" r="40" stroke={color} strokeWidth="5" />
    <line x1="50" y1="50" x2="50" y2="25"
      stroke={color} strokeWidth="5" strokeLinecap="round" />
    <line x1="50" y1="50" x2="65" y2="35"
      stroke={color} strokeWidth="5" strokeLinecap="round" />
  </svg>
);

/* 3. Rich Aroma & Flavor (Steam) Icon - Three wavy vertical lines */
export const SteamIcon = ({ size = 24, color = "#BF6543" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left wavy line */}
    <path
      d="M30 85 Q15 65 30 45 Q45 25 30 15"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    {/* Center wavy line */}
    <path
      d="M50 85 Q35 65 50 45 Q65 25 50 15"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    {/* Right wavy line */}
    <path
      d="M70 85 Q55 65 70 45 Q85 25 70 15"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

/* 4. ISO Certified Seal Icon */
export const IsoIcon = ({ size = 48 }) => {
  const primary = "#004639";
  const secondary = "#FFFFFF";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 150 150"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="75" cy="75" r="70" fill={secondary} stroke={primary} strokeWidth="2" />
      <circle cx="75" cy="75" r="55" fill={primary} />

      <defs>
        <path id="isoCurve" d="M35,35 A60,60 0 0,1 115,35" />
      </defs>

      <text fontSize="10" fill={primary} letterSpacing="3">
        <textPath href="#isoCurve" startOffset="50%" textAnchor="middle">
          CERTIFIED
        </textPath>
      </text>

      <text x="75" y="70" fontSize="35" fontWeight="bold"
        fill={secondary} textAnchor="middle">ISO</text>

      <text x="75" y="90" fontSize="8"
        fill={secondary} textAnchor="middle">9001:2015</text>

      <text x="75" y="100" fontSize="8"
        fill={secondary} textAnchor="middle">22000:2018</text>

      <ellipse cx="75" cy="60" rx="25" ry="12"
        fill="none" stroke={secondary} strokeWidth="1" opacity="0.5" />
      <ellipse cx="75" cy="60" rx="12" ry="25"
        fill="none" stroke={secondary} strokeWidth="1" opacity="0.5" />
    </svg>
  );
};

/* Chilli Powder Icons */

/* 1. Pure & Natural (Leaf) Icon */
export const LeafIcon = ({ size = 24, color = "#BF6543" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Leaf outline */}
    <path
      d="M50 15 Q30 25 30 50 Q30 75 50 85 Q70 75 70 50 Q70 25 50 15 Z"
      stroke={color}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Prominent central vein */}
    <line x1="50" y1="15" x2="50" y2="85" stroke={color} strokeWidth="4" strokeLinecap="round" />
    {/* Smaller veins - left side */}
    <path
      d="M50 30 Q40 28 35 35"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M50 45 Q38 42 32 50"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M50 60 Q40 58 35 65"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    {/* Smaller veins - right side */}
    <path
      d="M50 30 Q60 28 65 35"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M50 45 Q62 42 68 50"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M50 60 Q60 58 65 65"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

/* 2. Advanced Tech (Lightbulb) Icon */
export const LightbulbIcon = ({ size = 24, color = "#BF6543" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bulb outline */}
    <circle cx="50" cy="35" r="20" stroke={color} strokeWidth="4" fill="none" />
    {/* Visible filament inside */}
    <path
      d="M40 30 Q45 28 50 30 Q55 28 60 30"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M42 35 Q50 33 58 35"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M40 40 Q45 42 50 40 Q55 42 60 40"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    {/* Base/connector */}
    <path
      d="M50 55 L50 75"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
    />
    <rect x="40" y="75" width="20" height="8" rx="2" fill={color} />
    {/* Base threads */}
    <line x1="42" y1="75" x2="42" y2="83" stroke={color} strokeWidth="1.5" />
    <line x1="50" y1="75" x2="50" y2="83" stroke={color} strokeWidth="1.5" />
    <line x1="58" y1="75" x2="58" y2="83" stroke={color} strokeWidth="1.5" />
  </svg>
);

/* 3. Rich Aroma & Color (Steam) - Reuse SteamIcon */

/* 4. Triple-Layer Protection Icon - Three stacked, slightly offset squares */
export const TripleLayerIcon = ({ size = 24, color = "#BF6543" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bottom layer - largest, most offset */}
    <rect x="15" y="50" width="50" height="35" rx="3" 
      fill="none" stroke={color} strokeWidth="3" />
    {/* Middle layer - medium, slightly offset */}
    <rect x="20" y="40" width="50" height="35" rx="3" 
      fill="none" stroke={color} strokeWidth="3" />
    {/* Top layer - smallest, least offset */}
    <rect x="25" y="30" width="50" height="35" rx="3" 
      fill="none" stroke={color} strokeWidth="3" />
  </svg>
);


