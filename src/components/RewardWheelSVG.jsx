import React, { useMemo } from "react";

const sliceColors = [
  "#16a34a",
  "#0284c7",
  "#0f766e",
  "#ea580c",
  "#ca8a04",
  "#db2777",
  "#7c3aed",
];

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const pointOnCircle = (cx, cy, radius, angleDeg) => {
  const angle = toRadians(angleDeg - 90);
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
};

const createSlicePath = (cx, cy, radius, startAngle, endAngle) => {
  const start = pointOnCircle(cx, cy, radius, startAngle);
  const end = pointOnCircle(cx, cy, radius, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
};

const RewardWheelSVG = ({ rewards = [], rotation = 0, onSpinEnd }) => {
  const safeRewards = Array.isArray(rewards) && rewards.length > 0 ? rewards : [];
  const size = 304;
  const center = size / 2;
  const radius = 142;
  const textRadius = 95;
  const anglePerSlice = safeRewards.length > 0 ? 360 / safeRewards.length : 360;

  const slices = useMemo(
    () =>
      safeRewards.map((reward, index) => {
        const startAngle = index * anglePerSlice;
        const endAngle = startAngle + anglePerSlice;
        const midAngle = startAngle + anglePerSlice / 2;
        const labelPoint = pointOnCircle(center, center, textRadius, midAngle);
        return {
          id: reward?.id || `reward-${index}`,
          label: reward?.displayName || reward?.name || "Reward",
          path: createSlicePath(center, center, radius, startAngle, endAngle),
          fill: sliceColors[index % sliceColors.length],
          labelPoint,
        };
      }),
    [safeRewards, anglePerSlice]
  );

  return (
    <div
      className="ag-wheel-rotate-layer"
      style={{ transform: `rotate(${rotation}deg)` }}
      onTransitionEnd={onSpinEnd}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="ag-wheel-svg"
        role="img"
        aria-label="Spin and win rewards wheel"
      >
        <defs>
          <filter id="agWheelShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="6" floodOpacity="0.26" />
          </filter>
          <radialGradient id="agWheelGloss" cx="35%" cy="28%" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <g filter="url(#agWheelShadow)">
          {slices.map((slice) => (
            <path
              key={slice.id}
              d={slice.path}
              fill={slice.fill}
              stroke="rgba(255,255,255,0.95)"
              strokeWidth="1.6"
            />
          ))}
        </g>

        {slices.map((slice) => (
          <text
            key={`${slice.id}-label`}
            x={slice.labelPoint.x}
            y={slice.labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="ag-wheel-label"
          >
            {slice.label}
          </text>
        ))}

        <circle cx={center} cy={center} r={radius} fill="url(#agWheelGloss)" />
        <circle
          cx={center}
          cy={center}
          r={radius + 0.5}
          fill="none"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};

export default RewardWheelSVG;
