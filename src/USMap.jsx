import React from "react";
import usa from "@svg-maps/usa";

// Carte choroplèthe des États-Unis. fillFor(code) -> couleur ; onSelect(code|null) au toucher.
// L'État sélectionné est dessiné en dernier pour que son contour reste visible.
export default function USMap({ fillFor, selected, onSelect }) {
  const locations = selected
    ? [...usa.locations.filter(l => l.id.toUpperCase() !== selected), ...usa.locations.filter(l => l.id.toUpperCase() === selected)]
    : usa.locations;

  return (
    <svg viewBox={usa.viewBox} role="img" aria-label="Map of the United States"
      style={{ width: "100%", height: "auto", display: "block" }}>
      {locations.map(loc => {
        const code = loc.id.toUpperCase();
        const isSelected = selected === code;
        return (
          <path
            key={loc.id}
            d={loc.path}
            fill={fillFor(code)}
            stroke={isSelected ? "#1B1B1B" : "#FFFFFF"}
            strokeWidth={isSelected ? 2 : 0.75}
            strokeLinejoin="round"
            style={{ cursor: onSelect ? "pointer" : "default" }}
            onClick={onSelect ? () => onSelect(isSelected ? null : code) : undefined}
          >
            <title>{loc.name}</title>
          </path>
        );
      })}
    </svg>
  );
}
