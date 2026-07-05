import React, { useState, useMemo, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import USMap from "./USMap.jsx";
import {
  UPDATED, PARTIES, RATING_COLORS, MIDTERMS_DATE, APPROVAL, APPROVAL_TREND,
  GENERIC, GENERIC_TREND, POLLS_NOTE, CONTROL_ODDS, SENATE, GOVERNORS, HOUSE,
  RATING_CHANGES, ROAD_270, BATTLEGROUNDS, PRIMARIES_2028, BRIEFING, CALENDAR, MIDTERM_NOTE,
} from "./data.js";

// ─ Palette sobre, inspirée de la charte éditoriale de Politico ─
const INK = "#1B1B1B";
const MUTED = "#6E6E73";
const MUTED2 = "#9A9AA1";
const BORDER = "#E6E6E6";
const PAGE_BG = "#F4F4F4";
const CARD_BG = "#FFFFFF";
const SOFT_BG = "#F7F7F7";
const ACCENT = "#DC0228"; // rouge Politico, utilisé avec parcimonie

const SERIF = "'Source Serif 4', Georgia, 'Times New Roman', serif";
const SANS = "'Inter', -apple-system, 'Segoe UI', sans-serif";

const RATING_BADGE = {
  "Solid D": { bg: "#1F4E8C", fg: "#FFFFFF" },
  "Safe D": { bg: "#1F4E8C", fg: "#FFFFFF" },
  "Likely D": { bg: "#DCE6F2", fg: "#1F4E8C" },
  "Lean D": { bg: "#EDF2F9", fg: "#2B5F9E" },
  "Toss-up": { bg: "#F5EDD8", fg: "#8A6A14" },
  "Lean R": { bg: "#F9EEEC", fg: "#B3392E" },
  "Likely R": { bg: "#F3DAD6", fg: "#9E332A" },
  "Solid R": { bg: "#9E332A", fg: "#FFFFFF" },
  "Safe R": { bg: "#9E332A", fg: "#FFFFFF" },
};

// Couleurs de la carte présidentielle (mode Explore)
const PRES_RATING_COLOR = {
  "Safe D": RATING_COLORS["Solid D"],
  "Likely D": RATING_COLORS["Likely D"],
  "Toss-up": RATING_COLORS["Toss-up"],
  "Likely R": RATING_COLORS["Likely R"],
  "Safe R": RATING_COLORS["Solid R"],
};

// ─ Tables dérivées des données (calculées une fois au chargement) ─
const PRES_STATE = {}; // code -> { name, ev, rating }
const EV_BY_RATING = { "Safe D": 0, "Likely D": 0, "Toss-up": 0, "Likely R": 0, "Safe R": 0 };
const PRES_BASE = {}; // affectation de départ du simulateur : D | R | T
ROAD_270.categories.forEach(c => c.states.forEach(s => {
  PRES_STATE[s.code] = s;
  EV_BY_RATING[s.rating] += s.ev;
  PRES_BASE[s.code] = c.key === "B" ? "T" : c.key;
}));

const SEN_BASE = {}; // affectation de départ des 35 sièges en jeu
SENATE.races.forEach(r => { SEN_BASE[r.code] = r.rating === "Toss-up" ? "T" : r.rating.endsWith("D") ? "D" : "R"; });
SENATE.safeD.forEach(c => { SEN_BASE[c] = "D"; });
SENATE.safeR.forEach(c => { SEN_BASE[c] = "R"; });

// Sièges non renouvelés en 2026, par parti
const SEN_NOT_UP = {
  D: SENATE.composition.D - (SENATE.races.filter(r => r.holder === "D").length + SENATE.safeD.length),
  R: SENATE.composition.R - (SENATE.races.filter(r => r.holder === "R").length + SENATE.safeR.length),
};

const CYCLE = { D: "R", R: "T", T: "D" };

function loadSim(key, base) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(key));
    if (!stored) return { ...base };
    const merged = { ...base };
    Object.keys(base).forEach(k => { if (["D", "R", "T"].includes(stored[k])) merged[k] = stored[k]; });
    return merged;
  } catch { return { ...base }; }
}

function saveSim(key, sim) {
  try { window.localStorage.setItem(key, JSON.stringify(sim)); } catch { /* stockage indisponible */ }
}

const SEUIL_MAJ = 90; // px de tirage (amorti) pour déclencher le rafraîchissement
const ZONE_MORTE = 24;
const AMORTI = 0.35;
const TIRAGE_MAX = 110;

// Drapeau américain simplifié (13 bandes, canton étoilé suggéré)
function USFlag({ height = 19 }) {
  const stripes = [];
  for (let i = 0; i < 13; i++) {
    stripes.push(<rect key={i} y={(i * 100) / 13} width="190" height={100 / 13 + 0.3} fill={i % 2 === 0 ? "#B22234" : "#FFFFFF"} />);
  }
  const stars = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      stars.push(<circle key={`${r}-${c}`} cx={9.5 + c * 14.25} cy={7.5 + r * 13.2} r="2.8" fill="#FFFFFF" />);
    }
  }
  return (
    <svg viewBox="0 0 190 100" height={height} role="img" aria-label="Flag of the United States"
      style={{ display: "block", borderRadius: 2, boxShadow: `0 0 0 1px ${BORDER}` }}>
      {stripes}
      <rect width="76" height={(7 * 100) / 13} fill="#3C3B6E" />
      {stars}
    </svg>
  );
}

function Rating({ rating }) {
  const s = RATING_BADGE[rating] || RATING_BADGE["Toss-up"];
  return (
    <span style={{ background: s.bg, color: s.fg, fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 3, whiteSpace: "nowrap" }}>
      {rating}
    </span>
  );
}

function SectionTitle({ children }) {
  return <h2 style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, margin: "0 0 8px", color: INK }}>{children}</h2>;
}

function Kicker({ children, color = ACCENT }) {
  return <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color, fontWeight: 700 }}>{children}</div>;
}

function ModeToggle({ mode, onChange }) {
  return (
    <div style={{ display: "inline-flex", border: `1px solid ${BORDER}`, borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
      {[["explore", "Explore"], ["simulate", "Simulate"]].map(([id, label]) => (
        <button key={id} onClick={() => onChange(id)}
          style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", padding: "5px 9px", border: "none", cursor: "pointer", background: mode === id ? INK : CARD_BG, color: mode === id ? "#FFFFFF" : MUTED }}>
          {label}
        </button>
      ))}
    </div>
  );
}

function MapLegend({ items }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 12px", marginTop: 10 }}>
      {items.map(it => (
        <span key={it.label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, color: MUTED }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: it.color, flexShrink: 0 }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

// Dernier sondage d'une course (barres candidat contre candidat)
function PollBlock({ poll }) {
  const sorted = [...poll.entries].sort((a, b) => b.pct - a.pct);
  const lead = sorted[0].pct - sorted[1].pct;
  const max = Math.max(55, sorted[0].pct);
  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BORDER}` }}>
      <div style={{ fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED2, fontWeight: 700, marginBottom: 7 }}>Latest poll</div>
      {poll.entries.map(e => (
        <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span style={{ width: 82, fontSize: 12, fontWeight: 600, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
          <div style={{ flex: 1, height: 8, background: SOFT_BG, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${(e.pct / max) * 100}%`, height: "100%", background: PARTIES[e.party].color }} />
          </div>
          <span style={{ width: 36, textAlign: "right", fontSize: 12, fontWeight: 800 }}>{e.pct}%</span>
        </div>
      ))}
      <div style={{ fontSize: 10.5, color: MUTED2, marginTop: 5 }}>
        {lead === 0 ? "Tied" : `${sorted[0].name} +${lead}`} · {poll.pollster}, {poll.date}
      </div>
    </div>
  );
}

// Journal des changements de cote pour un scrutin donné
function RatingChangesCard({ contest }) {
  const items = RATING_CHANGES.filter(c => c.contest === contest);
  if (items.length === 0) return null;
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "14px 16px", marginTop: 16 }}>
      <Kicker color={MUTED2}>Recent rating changes</Kicker>
      {items.map((c, i) => (
        <div key={i} style={{ marginTop: 11, paddingTop: 11, borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{c.race}</span>
            <span style={{ fontSize: 10.5, color: MUTED2, flexShrink: 0 }}>{c.date}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6 }}>
            <Rating rating={c.from} />
            <span style={{ color: MUTED2, fontSize: 12 }}>→</span>
            <Rating rating={c.to} />
          </div>
          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 6 }}>{c.note}</div>
        </div>
      ))}
    </div>
  );
}

// Renvoie ce qu'on sait d'un État pour un scrutin donné (Sénat ou gouverneurs)
function raceInfoFor(contest, code) {
  const race = contest.races.find(r => r.code === code);
  if (race) return { kind: "race", race };
  if (contest.safeD.includes(code)) return { kind: "safe", party: "D" };
  if (contest.safeR.includes(code)) return { kind: "safe", party: "R" };
  return { kind: "none" };
}

function ratingFillFor(contest) {
  return code => {
    const info = raceInfoFor(contest, code);
    if (info.kind === "race") return RATING_COLORS[info.race.rating];
    if (info.kind === "safe") return RATING_COLORS[info.party === "D" ? "Solid D" : "Solid R"];
    return RATING_COLORS["No race"];
  };
}

function simFillFor(sim) {
  return code => {
    const v = sim[code];
    if (!v) return RATING_COLORS["No race"];
    return v === "T" ? PARTIES.B.color : PARTIES[v].color;
  };
}

export default function ElectionsUS() {
  const [tab, setTab] = useState("polls");
  const [pane, setPane] = useState("senate");
  const [open, setOpen] = useState(null);
  const [openBg, setOpenBg] = useState(null);
  const [mapSel, setMapSel] = useState(null);
  const [raceFilter, setRaceFilter] = useState("all");
  const [presMode, setPresMode] = useState("explore");
  const [senMode, setSenMode] = useState("explore");
  const [presSim, setPresSim] = useState(() => loadSim("uselections-sim-pres", PRES_BASE));
  const [senSim, setSenSim] = useState(() => loadSim("uselections-sim-senate", SEN_BASE));
  const [pull, setPull] = useState(0);
  const [reloading, setReloading] = useState(false);
  const startY = useRef(null);
  const startX = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => { saveSim("uselections-sim-pres", presSim); }, [presSim]);
  useEffect(() => { saveSim("uselections-sim-senate", senSim); }, [senSim]);

  const days = useMemo(() => Math.max(0, Math.ceil((new Date(MIDTERMS_DATE) - Date.now()) / 86400000)), []);

  // Prochain événement du calendrier (compte à rebours "Next up")
  const nextEvent = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const e of CALENDAR) {
      if (e.iso && new Date(e.iso) >= today) {
        return { ...e, days: Math.round((new Date(e.iso) - today) / 86400000) };
      }
    }
    return null;
  }, []);

  // Totaux du simulateur présidentiel
  const presTotals = useMemo(() => {
    const t = { D: 0, R: 0, T: 0 };
    Object.entries(presSim).forEach(([code, v]) => { t[v] += PRES_STATE[code].ev; });
    return t;
  }, [presSim]);

  // Totaux du simulateur Sénat
  const senTotals = useMemo(() => {
    const t = { D: SEN_NOT_UP.D, R: SEN_NOT_UP.R, T: 0 };
    Object.values(senSim).forEach(v => { t[v] += 1; });
    return t;
  }, [senSim]);

  function goTab(id) { setTab(id); setOpen(null); setMapSel(null); }
  function goPane(id) { setPane(id); setOpen(null); setMapSel(null); setRaceFilter("all"); }

  function cyclePres(code) { setPresSim(prev => prev[code] ? { ...prev, [code]: CYCLE[prev[code]] } : prev); }
  function cycleSen(code) { setSenSim(prev => prev[code] ? { ...prev, [code]: CYCLE[prev[code]] } : prev); }

  function filterRaces(list) {
    if (raceFilter === "tossup") return list.filter(r => r.rating === "Toss-up");
    if (raceFilter === "competitive") return list.filter(r => ["Toss-up", "Lean D", "Lean R"].includes(r.rating));
    return list;
  }

  // ─ Tirer depuis le haut de la liste pour recharger l'app ─
  function onTouchStart(e) {
    if (mainRef.current && mainRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      startX.current = e.touches[0].clientX;
    } else {
      startY.current = null;
    }
  }

  function onTouchMove(e) {
    if (startY.current === null || reloading) return;
    const dy = e.touches[0].clientY - startY.current;
    const dx = e.touches[0].clientX - startX.current;
    if (Math.abs(dx) > Math.abs(dy)) {
      startY.current = null;
      if (pull !== 0) setPull(0);
      return;
    }
    const useful = dy - ZONE_MORTE;
    if (useful > 0 && mainRef.current && mainRef.current.scrollTop <= 0) {
      setPull(Math.min(useful * AMORTI, TIRAGE_MAX));
    } else if (pull !== 0) {
      setPull(0);
    }
  }

  function onTouchEnd() {
    startY.current = null;
    if (pull >= SEUIL_MAJ && !reloading) {
      setReloading(true);
      window.location.reload();
    } else {
      setPull(0);
    }
  }

  function RaceCard({ r }) {
    const key = `${r.code}-${r.type}`;
    return (
      <div className="carte" onClick={() => setOpen(open === key ? null : key)}
        style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${PARTIES[r.holder].color}`, borderRadius: 4, padding: "12px 14px", marginBottom: 8, cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>{r.state}</div>
            <div style={{ fontSize: 11.5, color: MUTED, marginTop: 1 }}>{r.type} · {r.holder === "D" ? "Democratic" : "Republican"}-held</div>
          </div>
          <Rating rating={r.rating} />
        </div>
        <div style={{ fontSize: 12.5, color: "#3C3C43", marginTop: 6 }}>{r.matchup}</div>
        {open === key && (
          <div onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: 12.5, color: "#3C3C43", lineHeight: 1.55, margin: "10px 0 0", paddingTop: 10, borderTop: `1px solid ${BORDER}` }}>{r.note}</p>
            {r.poll && <PollBlock poll={r.poll} />}
          </div>
        )}
      </div>
    );
  }

  function FilterChips() {
    const options = [["all", "All races"], ["competitive", "Competitive"], ["tossup", "Toss-ups"]];
    return (
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {options.map(([id, label]) => (
          <button key={id} onClick={() => { setRaceFilter(id); setOpen(null); }}
            style={{ fontSize: 11, fontWeight: 700, padding: "5px 11px", borderRadius: 99, border: `1px solid ${raceFilter === id ? INK : BORDER}`, background: raceFilter === id ? INK : CARD_BG, color: raceFilter === id ? "#FFFFFF" : MUTED, cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>
    );
  }

  function BalanceBar({ left, right, vacant = 0, total, threshold, thresholdLabel }) {
    const pct = (threshold / total) * 100;
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 700, marginBottom: 5 }}>
          <span style={{ color: PARTIES.D.color }}>{left} Dem</span>
          {vacant > 0 && <span style={{ color: MUTED2, fontWeight: 500, fontSize: 11.5 }}>{vacant} vacant</span>}
          <span style={{ color: PARTIES.R.color }}>{right} GOP</span>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", height: 12, borderRadius: 2, overflow: "hidden", background: BORDER }}>
            <div style={{ flex: left, background: PARTIES.D.color }} />
            {vacant > 0 && <div style={{ flex: vacant, background: "transparent" }} />}
            <div style={{ flex: right, background: PARTIES.R.color }} />
          </div>
          <div style={{ position: "absolute", left: `${pct}%`, top: -3, bottom: -3, width: 2, background: INK }} />
        </div>
        <div style={{ fontSize: 10.5, color: MUTED2, marginTop: 5, textAlign: "center" }}>Majority: {thresholdLabel}</div>
      </div>
    );
  }

  function PrimaryBars({ list, color, max }) {
    return list.map(p => (
      <div key={p.name} style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
          <span style={{ fontWeight: 600 }}>{p.name} <span style={{ color: MUTED2, fontWeight: 400, fontSize: 11.5 }}>{p.detail}</span></span>
          <span style={{ fontWeight: 800 }}>{p.score}%</span>
        </div>
        <div style={{ height: 7, background: SOFT_BG, borderRadius: 2, overflow: "hidden" }}>
          <div className="barre" style={{ height: "100%", width: `${(p.score / max) * 100}%`, background: color, transition: "width .6s ease" }} />
        </div>
      </div>
    ));
  }

  const RATING_LEGEND = [
    { label: "Solid D", color: RATING_COLORS["Solid D"] },
    { label: "Likely D", color: RATING_COLORS["Likely D"] },
    { label: "Lean D", color: RATING_COLORS["Lean D"] },
    { label: "Toss-up", color: RATING_COLORS["Toss-up"] },
    { label: "Lean R", color: RATING_COLORS["Lean R"] },
    { label: "Likely R", color: RATING_COLORS["Likely R"] },
    { label: "Solid R", color: RATING_COLORS["Solid R"] },
    { label: "No race", color: RATING_COLORS["No race"] },
  ];

  const SIM_LEGEND = [
    { label: "Democrats", color: PARTIES.D.color },
    { label: "Toss-up", color: PARTIES.B.color },
    { label: "Republicans", color: PARTIES.R.color },
  ];

  // Encart sous la carte : détail de l'État touché, pour un scrutin Sénat/gouverneurs
  function MapStateInfo({ contest, contestLabel }) {
    if (!mapSel) return <div style={{ fontSize: 11.5, color: MUTED2, marginTop: 10 }}>Tap a state for details.</div>;
    const info = raceInfoFor(contest, mapSel);
    const name = PRES_STATE[mapSel] ? PRES_STATE[mapSel].name : mapSel;
    return (
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BORDER}` }}>
        {info.kind === "race" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 13.5 }}>{info.race.state} <span style={{ color: MUTED, fontWeight: 400, fontSize: 11.5 }}>{info.race.type}</span></span>
              <Rating rating={info.race.rating} />
            </div>
            <div style={{ fontSize: 12, color: "#3C3C43", marginTop: 4 }}>{info.race.matchup}</div>
          </div>
        )}
        {info.kind === "safe" && (
          <div style={{ fontSize: 12.5 }}>
            <strong>{name}</strong> — rated safe for {info.party === "D" ? "Democrats" : "Republicans"}; not among the featured races.
          </div>
        )}
        {info.kind === "none" && (
          <div style={{ fontSize: 12.5 }}><strong>{name}</strong> — no {contestLabel} race in 2026.</div>
        )}
      </div>
    );
  }

  // Bandeau de verdict d'un scénario
  function SimBanner({ text, tone }) {
    const styles = {
      D: { bg: "#EDF2F9", fg: RATING_COLORS["Solid D"] },
      R: { bg: "#F9EEEC", fg: RATING_COLORS["Solid R"] },
      N: { bg: SOFT_BG, fg: MUTED },
    }[tone];
    return (
      <div style={{ background: styles.bg, color: styles.fg, borderRadius: 3, padding: "8px 11px", fontSize: 12, fontWeight: 700, marginTop: 10 }}>
        {text}
      </div>
    );
  }

  const netApproval = APPROVAL.approve - APPROVAL.disapprove;
  const presExploreFill = code => PRES_STATE[code] ? PRES_RATING_COLOR[PRES_STATE[code].rating] : RATING_COLORS["No race"];

  const presBanner = presTotals.D >= 270
    ? { text: `Democrats win the White House with ${presTotals.D} electoral votes.`, tone: "D" }
    : presTotals.R >= 270
      ? { text: `Republicans win the White House with ${presTotals.R} electoral votes.`, tone: "R" }
      : { text: `No majority yet — ${presTotals.T} electoral votes still undecided.`, tone: "N" };

  const senBanner = senTotals.D >= 51
    ? { text: `Democrats take the Senate, ${senTotals.D}–${senTotals.R}.`, tone: "D" }
    : senTotals.R >= 50
      ? { text: `Republicans keep the Senate, ${senTotals.R}–${senTotals.D} (50 is enough with the vice president's tie-breaking vote).`, tone: "R" }
      : { text: `Senate control undecided — ${senTotals.T} seat${senTotals.T > 1 ? "s" : ""} still toss-ups.`, tone: "N" };

  // Compteur D / Toss / R d'un simulateur
  function SimCounter({ totals, unit }) {
    return (
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        {[["D", "Dem", PARTIES.D.color], ["T", "Toss-up", "#8A6A14"], ["R", "GOP", PARTIES.R.color]].map(([k, label, color]) => (
          <div key={k} style={{ flex: 1, background: SOFT_BG, borderRadius: 3, padding: "7px 0", textAlign: "center" }}>
            <div style={{ fontSize: 19, fontWeight: 800, color, lineHeight: 1 }}>{totals[k]}</div>
            <div style={{ fontSize: 9.5, color: MUTED2, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>{label} {unit}</div>
          </div>
        ))}
      </div>
    );
  }

  function ResetButton({ onReset }) {
    return (
      <button onClick={onReset}
        style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", padding: "5px 9px", borderRadius: 3, border: `1px solid ${BORDER}`, background: CARD_BG, color: MUTED, cursor: "pointer", flexShrink: 0 }}>
        Reset
      </button>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, display: "flex", justifyContent: "center", fontFamily: SANS, color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Source+Serif+4:wght@600;700&display=swap');
        * { box-sizing: border-box; }
        button { font-family: inherit; }
        .carte { transition: transform .12s ease; }
        .carte:active { transform: scale(.985); }
        @keyframes tourner { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .carte { transition: none; } .barre { transition: none !important; } }
        /* Sur mobile, l'app occupe toute la largeur ; sur grand écran, carte centrée de 420 px */
        .app-conteneur { width: 100%; max-width: 420px; min-height: 100dvh; }
        .app-nav { position: fixed; bottom: 0; width: 100%; max-width: 420px; }
        @media (max-width: 767px) {
          .app-conteneur, .app-nav { max-width: none; }
        }
      `}</style>

      <div className="app-conteneur" style={{ background: CARD_BG, display: "flex", flexDirection: "column", boxShadow: "0 0 32px rgba(0,0,0,.08)" }}>

        {/* En-tête */}
        <header style={{ background: CARD_BG, borderTop: `4px solid ${ACCENT}`, borderBottom: `1px solid ${BORDER}`, padding: "16px 18px 14px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <USFlag height={13} />
                <Kicker>2026 Midterms · 2028 Presidential</Kicker>
              </div>
              <h1 style={{ margin: "4px 0 0", fontFamily: SERIF, fontSize: 27, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1 }}>U.S. Elections</h1>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 23, fontWeight: 800, lineHeight: 1 }}>{days}<span style={{ fontSize: 12, fontWeight: 600, color: MUTED }}> days</span></div>
              <div style={{ fontSize: 10.5, color: MUTED, marginTop: 3 }}>to the midterms · Nov 3, 2026</div>
            </div>
          </div>
        </header>

        {/* Bandeau de fraîcheur des données */}
        <div style={{ textAlign: "center", fontSize: 10.5, fontWeight: 600, color: MUTED2, padding: "6px 0", borderBottom: `1px solid ${BORDER}`, background: CARD_BG }}>
          Data updated {UPDATED}
        </div>

        {/* Indicateur de rafraîchissement */}
        <div aria-hidden={pull === 0 && !reloading} style={{ position: "relative", height: 0, overflow: "visible", zIndex: 5 }}>
          <div style={{
            position: "absolute", left: "50%", top: 6,
            transform: `translateX(-50%) translateY(${pull - 40}px) rotate(${pull * 3}deg)`,
            opacity: reloading ? 1 : Math.min(pull / SEUIL_MAJ, 1),
            width: 32, height: 32, borderRadius: 99, background: CARD_BG,
            border: `1px solid ${BORDER}`, boxShadow: "0 2px 8px rgba(0,0,0,.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: startY.current === null ? "transform .2s ease, opacity .2s ease" : "none",
            animation: reloading ? "tourner .8s linear infinite" : "none",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={pull >= SEUIL_MAJ || reloading ? ACCENT : MUTED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <polyline points="21 3 21 9 15 9" />
            </svg>
          </div>
        </div>

        {/* Contenu */}
        <main
          ref={mainRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ flex: 1, overflowY: "auto", padding: "16px 14px 90px", transform: pull ? `translateY(${pull}px)` : "none", transition: startY.current === null ? "transform .2s ease" : "none" }}
        >

          {tab === "polls" && (
            <div>
              {/* L'essentiel de la semaine */}
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderTop: `3px solid ${ACCENT}`, borderRadius: 4, padding: "14px 16px", marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <Kicker>The week in brief</Kicker>
                  <div style={{ fontSize: 10.5, color: MUTED2, flexShrink: 0 }}>{BRIEFING.week}</div>
                </div>
                {BRIEFING.items.map((b, i) => (
                  <div key={i} style={{ marginTop: 11, paddingTop: 11, borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{b.title}</div>
                    <div style={{ fontSize: 12, color: "#3C3C43", lineHeight: 1.5, marginTop: 2 }}>{b.text}</div>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: 11.5, color: MUTED, margin: "0 0 14px", lineHeight: 1.5 }}>{POLLS_NOTE}</p>

              {/* Popularité du président */}
              <SectionTitle>Presidential approval</SectionTitle>
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "14px 14px 8px", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: PARTIES.D.color }}>{APPROVAL.approve}%</div>
                    <div style={{ fontSize: 11, color: MUTED }}>approve</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: PARTIES.R.color }}>{APPROVAL.disapprove}%</div>
                    <div style={{ fontSize: 11, color: MUTED }}>disapprove</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: MUTED }}>{netApproval > 0 ? "+" : ""}{netApproval}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>net</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={APPROVAL_TREND} margin={{ top: 5, right: 12, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECECEC" />
                    <XAxis dataKey="wave" tick={{ fontSize: 10, fill: MUTED2 }} />
                    <YAxis tick={{ fontSize: 10, fill: MUTED2 }} domain={[35, 60]} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${BORDER}`, background: CARD_BG, color: INK }} />
                    <Line type="monotone" dataKey="Approve" stroke={PARTIES.D.color} strokeWidth={2.5} dot={{ r: 2.5 }} />
                    <Line type="monotone" dataKey="Disapprove" stroke={PARTIES.R.color} strokeWidth={2.5} dot={{ r: 2.5 }} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ fontSize: 10.5, color: MUTED2, padding: "6px 2px" }}>{APPROVAL.president} · {APPROVAL.source}</div>
              </div>

              {/* Bulletin générique */}
              <SectionTitle>Generic congressional ballot</SectionTitle>
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "14px 14px 8px", marginBottom: 16 }}>
                {[["D", GENERIC.D], ["R", GENERIC.R]].map(([p, score]) => (
                  <div key={p} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{PARTIES[p].label}</span>
                      <span style={{ fontWeight: 800 }}>{score}%</span>
                    </div>
                    <div style={{ height: 8, background: SOFT_BG, borderRadius: 2, overflow: "hidden" }}>
                      <div className="barre" style={{ height: "100%", width: `${(score / 55) * 100}%`, background: PARTIES[p].color, transition: "width .6s ease" }} />
                    </div>
                  </div>
                ))}
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={GENERIC_TREND} margin={{ top: 5, right: 12, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECECEC" />
                    <XAxis dataKey="wave" tick={{ fontSize: 10, fill: MUTED2 }} />
                    <YAxis tick={{ fontSize: 10, fill: MUTED2 }} domain={[35, 55]} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${BORDER}`, background: CARD_BG, color: INK }} />
                    <Line type="monotone" dataKey="D" name="Democrats" stroke={PARTIES.D.color} strokeWidth={2.5} dot={{ r: 2.5 }} />
                    <Line type="monotone" dataKey="R" name="Republicans" stroke={PARTIES.R.color} strokeWidth={2.5} dot={{ r: 2.5 }} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ fontSize: 10.5, color: MUTED2, padding: "6px 2px" }}>{GENERIC.source}</div>
              </div>

              {/* Probabilités de contrôle */}
              <SectionTitle>Control odds</SectionTitle>
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "14px 16px", marginBottom: 16 }}>
                {[["House", CONTROL_ODDS.house], ["Senate", CONTROL_ODDS.senate]].map(([chamber, odds], i) => (
                  <div key={chamber} style={{ marginTop: i === 0 ? 0 : 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>{chamber}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: odds.D >= odds.R ? PARTIES.D.color : PARTIES.R.color }}>
                        {odds.D >= odds.R ? "Democrats" : "Republicans"} favored
                      </span>
                    </div>
                    <div style={{ display: "flex", height: 14, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ flex: odds.D, background: PARTIES.D.color }} />
                      <div style={{ flex: odds.R, background: PARTIES.R.color }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginTop: 4 }}>
                      <span style={{ color: PARTIES.D.color }}>D {odds.D}%</span>
                      <span style={{ color: PARTIES.R.color }}>R {odds.R}%</span>
                    </div>
                  </div>
                ))}
                <div style={{ fontSize: 10.5, color: MUTED2, marginTop: 10 }}>{CONTROL_ODDS.source}</div>
              </div>

              {/* Rapport de force au Congrès */}
              <SectionTitle>Balance of power</SectionTitle>
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Senate</div>
                <BalanceBar left={SENATE.composition.D} right={SENATE.composition.R} total={100} threshold={50} thresholdLabel="50 seats (plus the vice president's vote)" />
                <div style={{ fontSize: 12, fontWeight: 700, margin: "14px 0 6px" }}>House of Representatives</div>
                <BalanceBar left={HOUSE.composition.D} right={HOUSE.composition.R} vacant={HOUSE.composition.vacant} total={435} threshold={HOUSE.majority} thresholdLabel={`${HOUSE.majority} seats`} />
              </div>
            </div>
          )}

          {tab === "midterms" && (
            <div>
              {/* Sélecteur Sénat / Gouverneurs / Chambre */}
              <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, marginBottom: 14 }}>
                {[["senate", "Senate"], ["governors", "Governors"], ["house", "House"]].map(([id, label]) => (
                  <button key={id} onClick={() => goPane(id)}
                    style={{ flex: 1, fontSize: 12.5, fontWeight: 700, padding: "9px 0", border: "none", cursor: "pointer", background: "none", color: pane === id ? INK : MUTED2, borderBottom: pane === id ? `2px solid ${ACCENT}` : "2px solid transparent", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {label}
                  </button>
                ))}
              </div>

              {pane === "senate" && (
                <div>
                  <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "12px 12px 10px", marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <Kicker color={MUTED}>{senMode === "explore" ? "Senate race ratings, 2026" : "Build your Senate"}</Kicker>
                      <div style={{ display: "flex", gap: 6 }}>
                        {senMode === "simulate" && <ResetButton onReset={() => setSenSim({ ...SEN_BASE })} />}
                        <ModeToggle mode={senMode} onChange={m => { setSenMode(m); setMapSel(null); }} />
                      </div>
                    </div>
                    {senMode === "simulate" && (
                      <>
                        <SimCounter totals={senTotals} unit="seats" />
                        <SimBanner text={senBanner.text} tone={senBanner.tone} />
                      </>
                    )}
                    <div style={{ marginTop: 10 }}>
                      <USMap
                        fillFor={senMode === "explore" ? ratingFillFor(SENATE) : simFillFor(senSim)}
                        selected={senMode === "explore" ? mapSel : null}
                        onSelect={senMode === "explore" ? setMapSel : cycleSen}
                      />
                    </div>
                    <MapLegend items={senMode === "explore" ? RATING_LEGEND : SIM_LEGEND} />
                    {senMode === "explore"
                      ? <MapStateInfo contest={SENATE} contestLabel="Senate" />
                      : <div style={{ fontSize: 11.5, color: MUTED2, marginTop: 10 }}>Tap a state with a 2026 race to flip it (D → R → toss-up). {SENATE.composition.D - SEN_NOT_UP.D + SENATE.composition.R - SEN_NOT_UP.R} seats are in play; the rest of the chamber is fixed until 2028.</div>}
                  </div>
                  <p style={{ fontSize: 12, color: MUTED, margin: "0 0 14px", lineHeight: 1.55 }}>{SENATE.outlook}</p>
                  <FilterChips />
                  {filterRaces(SENATE.races).map(r => <RaceCard key={r.code + r.type} r={r} />)}
                  <p style={{ fontSize: 11, color: MUTED2, lineHeight: 1.5, marginTop: 10 }}>
                    The other {SENATE.seatsUp - SENATE.races.length} seats on the ballot are rated safe for the incumbent party. Tap a card for details.
                  </p>
                  <RatingChangesCard contest="senate" />
                </div>
              )}

              {pane === "governors" && (
                <div>
                  <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "12px 12px 10px", marginBottom: 14 }}>
                    <Kicker color={MUTED}>Governor race ratings, 2026</Kicker>
                    <div style={{ marginTop: 10 }}>
                      <USMap fillFor={ratingFillFor(GOVERNORS)} selected={mapSel} onSelect={setMapSel} />
                    </div>
                    <MapLegend items={RATING_LEGEND} />
                    <MapStateInfo contest={GOVERNORS} contestLabel="governor's" />
                  </div>
                  <p style={{ fontSize: 12, color: MUTED, margin: "0 0 14px", lineHeight: 1.55 }}>{GOVERNORS.outlook}</p>
                  <FilterChips />
                  {filterRaces(GOVERNORS.races).map(r => <RaceCard key={r.code + r.type} r={r} />)}
                  <p style={{ fontSize: 11, color: MUTED2, lineHeight: 1.5, marginTop: 10 }}>
                    The other {GOVERNORS.seatsUp - GOVERNORS.races.length} races are rated safe for the incumbent party. Tap a card for details.
                  </p>
                  <RatingChangesCard contest="governor" />
                </div>
              )}

              {pane === "house" && (
                <div>
                  <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "14px 16px", marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <Kicker color={MUTED}>All 435 seats on the ballot</Kicker>
                      <Rating rating={HOUSE.rating} />
                    </div>
                    <BalanceBar left={HOUSE.composition.D} right={HOUSE.composition.R} vacant={HOUSE.composition.vacant} total={435} threshold={HOUSE.majority} thresholdLabel={`${HOUSE.majority} seats`} />
                  </div>
                  <p style={{ fontSize: 12.5, color: "#3C3C43", lineHeight: 1.6, margin: "0 0 14px" }}>{HOUSE.note}</p>
                  <div style={{ background: SOFT_BG, borderLeft: `3px solid ${ACCENT}`, borderRadius: 2, padding: "12px 14px" }}>
                    <div style={{ fontSize: 12.5, color: "#3C3C43", lineHeight: 1.55 }}>{MIDTERM_NOTE}</div>
                  </div>
                  <RatingChangesCard contest="house" />
                </div>
              )}
            </div>
          )}

          {tab === "road270" && (
            <div>
              <SectionTitle>Road to 270</SectionTitle>
              <p style={{ fontSize: 12, color: MUTED, margin: "0 0 14px", lineHeight: 1.5 }}>
                The Nov. 7, 2028 presidential election — {ROAD_270.total} electoral votes, {ROAD_270.majority} to win.
              </p>

              {/* Carte présidentielle : Explore (cotes) / Simulate (construire sa carte) */}
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "12px 12px 10px", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <Kicker color={MUTED}>{presMode === "explore" ? "2028 starting map" : "Build your map"}</Kicker>
                  <div style={{ display: "flex", gap: 6 }}>
                    {presMode === "simulate" && <ResetButton onReset={() => setPresSim({ ...PRES_BASE })} />}
                    <ModeToggle mode={presMode} onChange={m => { setPresMode(m); setMapSel(null); }} />
                  </div>
                </div>
                {presMode === "simulate" && (
                  <>
                    <SimCounter totals={presTotals} unit="EV" />
                    <SimBanner text={presBanner.text} tone={presBanner.tone} />
                    {/* Barre du scénario avec le seuil de 270 */}
                    <div style={{ position: "relative", marginTop: 22, marginBottom: 4 }}>
                      <div style={{ display: "flex", height: 14, borderRadius: 2, overflow: "hidden" }}>
                        {presTotals.D > 0 && <div style={{ flex: presTotals.D, background: PARTIES.D.color }} />}
                        {presTotals.T > 0 && <div style={{ flex: presTotals.T, background: PARTIES.B.color }} />}
                        {presTotals.R > 0 && <div style={{ flex: presTotals.R, background: PARTIES.R.color }} />}
                      </div>
                      <div style={{ position: "absolute", left: "50.19%", top: -4, bottom: -4, width: 2, background: INK }} />
                      <div style={{ position: "absolute", left: "50.19%", top: -18, transform: "translateX(-50%)", fontSize: 10, fontWeight: 800, color: INK }}>270</div>
                    </div>
                  </>
                )}
                <div style={{ marginTop: 10 }}>
                  <USMap
                    fillFor={presMode === "explore" ? presExploreFill : simFillFor(presSim)}
                    selected={presMode === "explore" ? mapSel : null}
                    onSelect={presMode === "explore" ? setMapSel : cyclePres}
                  />
                </div>
                <MapLegend items={presMode === "explore"
                  ? Object.entries(EV_BY_RATING).map(([r, ev]) => ({ label: `${r} ${ev}`, color: PRES_RATING_COLOR[r] }))
                  : SIM_LEGEND.map(it => ({ ...it, label: `${it.label} ${presTotals[it.label === "Democrats" ? "D" : it.label === "Republicans" ? "R" : "T"]}` }))} />
                {presMode === "explore" ? (
                  mapSel && PRES_STATE[mapSel] ? (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BORDER}`, fontSize: 12.5 }}>
                      <strong>{PRES_STATE[mapSel].name}</strong> — {PRES_STATE[mapSel].ev} electoral votes · rated {PRES_STATE[mapSel].rating}
                      {BATTLEGROUNDS.find(b => b.code === mapSel) && <span style={{ color: MUTED }}> · {BATTLEGROUNDS.find(b => b.code === mapSel).result2024} in 2024</span>}
                    </div>
                  ) : <div style={{ fontSize: 11.5, color: MUTED2, marginTop: 10 }}>Tap a state for details.</div>
                ) : (
                  <div style={{ fontSize: 11.5, color: MUTED2, marginTop: 10 }}>Tap any state to flip it (D → R → toss-up). Your scenario is saved on this device.</div>
                )}
              </div>

              {/* Barre des grands électeurs par cote, seuil de 270 */}
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "14px 14px 10px", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 800 }}>
                  <span style={{ color: PARTIES.D.color }}>{EV_BY_RATING["Safe D"] + EV_BY_RATING["Likely D"]}</span>
                  <span style={{ color: "#8A6A14" }}>{EV_BY_RATING["Toss-up"]} in play</span>
                  <span style={{ color: PARTIES.R.color }}>{EV_BY_RATING["Safe R"] + EV_BY_RATING["Likely R"]}</span>
                </div>
                <div style={{ position: "relative", marginTop: 24 }}>
                  <div style={{ display: "flex", height: 20, borderRadius: 2, overflow: "hidden" }}>
                    {Object.entries(EV_BY_RATING).map(([r, ev]) => (
                      <div key={r} style={{ flex: ev, background: PRES_RATING_COLOR[r] }} />
                    ))}
                  </div>
                  <div style={{ position: "absolute", left: `${(ROAD_270.majority / ROAD_270.total) * 100}%`, top: -5, bottom: -5, width: 2, background: INK }} />
                  <div style={{ position: "absolute", left: `${(ROAD_270.majority / ROAD_270.total) * 100}%`, top: -20, transform: "translateX(-50%)", fontSize: 10.5, fontWeight: 800, color: INK }}>270</div>
                </div>
                <div style={{ display: "flex", marginTop: 5 }}>
                  {Object.entries(EV_BY_RATING).map(([r, ev]) => (
                    <div key={r} style={{ flex: ev, textAlign: "center", fontSize: 9.5, fontWeight: 700, color: MUTED, overflow: "hidden", whiteSpace: "nowrap" }}>{ev}</div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: MUTED2, marginTop: 6 }}>
                  <span>← Democrats</span>
                  <span>Republicans →</span>
                </div>
              </div>

              {/* Trois colonnes : D à gauche, pivots au milieu, R à droite */}
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                {ROAD_270.categories.map(cat => (
                  <div key={cat.key} style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ textAlign: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 800, color: cat.key === "B" ? "#8A6A14" : PARTIES[cat.key].color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{cat.label}</div>
                      <div style={{ fontSize: 17, fontWeight: 800 }}>{cat.ev}</div>
                    </div>
                    {cat.states.map(s => (
                      <div key={s.code} title={`${s.name} — ${s.rating}`}
                        style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          background: cat.key === "B" ? PARTIES.B.color : `${PARTIES[cat.key].color}14`,
                          color: cat.key === "B" ? "#fff" : INK,
                          border: cat.key === "B" ? "none" : `1px solid ${PARTIES[cat.key].color}3A`,
                          borderRadius: 3, padding: "4px 8px", marginBottom: 4, fontSize: 11.5,
                        }}>
                        <span style={{ fontWeight: 700 }}>{s.code}{s.rating.startsWith("Likely") ? "*" : ""}</span>
                        <span style={{ fontWeight: 600, opacity: .85 }}>{s.ev}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: MUTED2, lineHeight: 1.5, margin: "0 0 20px" }}>* Rated “likely” rather than safe. {ROAD_270.note}</p>

              {/* Les sept États pivots en détail */}
              <SectionTitle>The seven battlegrounds</SectionTitle>
              {BATTLEGROUNDS.map(b => (
                <div key={b.code} className="carte" onClick={() => setOpenBg(openBg === b.code ? null : b.code)}
                  style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${PARTIES.B.color}`, borderRadius: 4, padding: "11px 14px", marginBottom: 8, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{b.state}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 11.5, color: b.result2024.startsWith("Trump") ? PARTIES.R.color : PARTIES.D.color, fontWeight: 700 }}>{b.result2024} in 2024</span>
                      <span style={{ background: SOFT_BG, borderRadius: 3, fontSize: 11, fontWeight: 800, padding: "3px 7px" }}>{b.ev} EV</span>
                    </div>
                  </div>
                  {openBg === b.code && (
                    <p style={{ fontSize: 12.5, color: "#3C3C43", lineHeight: 1.55, margin: "9px 0 0", paddingTop: 9, borderTop: `1px solid ${BORDER}` }}>{b.note}</p>
                  )}
                </div>
              ))}

              {/* Primaires 2028 */}
              <div style={{ marginTop: 20 }}>
                <SectionTitle>Early 2028 primary polling</SectionTitle>
              </div>
              <p style={{ fontSize: 11.5, color: MUTED, margin: "0 0 10px", lineHeight: 1.5 }}>{PRIMARIES_2028.note}</p>
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "14px 14px 6px", marginBottom: 12 }}>
                <div style={{ marginBottom: 10 }}><Kicker color={PARTIES.D.color}>Democratic primary</Kicker></div>
                <PrimaryBars list={PRIMARIES_2028.D} color={PARTIES.D.color} max={50} />
              </div>
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "14px 14px 6px" }}>
                <div style={{ marginBottom: 10 }}><Kicker color={PARTIES.R.color}>Republican primary</Kicker></div>
                <PrimaryBars list={PRIMARIES_2028.R} color={PARTIES.R.color} max={50} />
              </div>
            </div>
          )}

          {tab === "calendar" && (
            <div>
              {nextEvent && (
                <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderTop: `3px solid ${ACCENT}`, borderRadius: 4, padding: "14px 16px", marginBottom: 14 }}>
                  <Kicker>Next up</Kicker>
                  <div style={{ fontSize: 21, fontWeight: 800, margin: "6px 0 2px" }}>
                    {nextEvent.days === 0 ? "Today" : nextEvent.days === 1 ? "Tomorrow" : `In ${nextEvent.days} days`}
                    <span style={{ fontSize: 12, fontWeight: 600, color: MUTED }}> · {nextEvent.date}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#3C3C43", lineHeight: 1.5 }}>{nextEvent.event}</div>
                </div>
              )}
              {CALENDAR.map((a, i) => (
                <div key={i} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "12px 15px", marginBottom: 8 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{a.date}</div>
                  <div style={{ fontSize: 13.5, color: "#3C3C43", marginTop: 4, lineHeight: 1.5 }}>{a.event}</div>
                </div>
              ))}
              <div style={{ background: SOFT_BG, borderLeft: `3px solid ${ACCENT}`, borderRadius: 2, padding: "12px 14px", marginTop: 6 }}>
                <div style={{ fontSize: 12.5, color: "#3C3C43", lineHeight: 1.55 }}>{MIDTERM_NOTE}</div>
              </div>
            </div>
          )}

          {tab === "about" && (
            <div>
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "16px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <USFlag height={15} />
                  <h2 style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, margin: 0 }}>U.S. Elections</h2>
                </div>
                <p style={{ fontSize: 12.5, color: "#3C3C43", lineHeight: 1.6, margin: 0 }}>
                  An independent tracker of American elections: the 2026 midterms (the full House, one third of the Senate, 36 governorships), the road to the 2028 presidential race, and national polling — plus a scenario builder to map your own path to 270. It aggregates public data, cites its sources and endorses no party.
                </p>
              </div>

              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "16px 16px", marginBottom: 10 }}>
                <div style={{ marginBottom: 6 }}><Kicker color={MUTED2}>Data</Kicker></div>
                <p style={{ fontSize: 12.5, color: "#3C3C43", lineHeight: 1.6, margin: 0 }}>
                  Updated <strong>{UPDATED}</strong>. Sources: public polling averages (RealClearPolitics, Silver Bulletin), race ratings (Cook Political Report, Sabato's Crystal Ball), control odds (Polymarket, Kalshi), Politico, 270toWin. Figures are entered by hand and provided for reference, with a typical margin of error of 2 to 4 points.
                </p>
              </div>

              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "16px 16px", marginBottom: 10 }}>
                <div style={{ marginBottom: 6 }}><Kicker color={MUTED2}>Built by</Kicker></div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>Sébastien Baguerey</div>
                <a href="https://www.linkedin.com/in/sbrey84/" target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 10, background: "#0A66C2", color: "#fff", fontSize: 12.5, fontWeight: 700, padding: "8px 14px", borderRadius: 4, textDecoration: "none" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
                  </svg>
                  Find me on LinkedIn
                </a>
              </div>

              <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "16px 16px" }}>
                <div style={{ marginBottom: 6 }}><Kicker color={MUTED2}>The electoral system in brief</Kicker></div>
                <p style={{ fontSize: 12.5, color: "#3C3C43", lineHeight: 1.6, margin: 0 }}>
                  Presidential years (2024, 2028…): the presidency, the full House, one third of the Senate and about a dozen governorships. Midterm years (2026, 2030…): the full House, one third of the Senate, 36 governorships and many local races. The president is chosen by 538 electors allocated among the states: 270 are needed to win.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Navigation basse */}
        <nav className="app-nav" style={{ background: CARD_BG, borderTop: `1px solid ${BORDER}`, display: "flex", padding: "0 4px calc(4px + env(safe-area-inset-bottom))" }}>
          {[
            { id: "polls", label: "Polls" },
            { id: "midterms", label: "Midterms" },
            { id: "road270", label: "2028" },
            { id: "calendar", label: "Calendar" },
            { id: "about", label: "About" },
          ].map(t => (
            <button key={t.id} onClick={() => goTab(t.id)}
              style={{ flex: 1, background: "none", border: "none", cursor: "pointer", padding: "12px 0 10px", color: tab === t.id ? INK : MUTED2, borderTop: tab === t.id ? `3px solid ${ACCENT}` : "3px solid transparent", marginTop: -1 }}>
              <div style={{ fontSize: 11, fontWeight: tab === t.id ? 800 : 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t.label}</div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
