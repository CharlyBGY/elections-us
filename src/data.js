// ═══════════════════════════════════════════════════════════════════
//  DONNÉES DE L'APPLICATION — c'est le seul fichier à modifier pour
//  mettre à jour les sondages, les courses et les échéances.
//  Chiffres saisis manuellement à partir de moyennes publiques
//  (RealClearPolitics, Cook Political Report, Sabato's Crystal Ball,
//  Politico, 270toWin). Valeur indicative. Contenu affiché : anglais.
// ═══════════════════════════════════════════════════════════════════

export const UPDATED = "July 8, 2026";

export const PARTIES = {
  D: { label: "Democrats", color: "#2B5F9E" },
  R: { label: "Republicans", color: "#B3392E" },
  B: { label: "Battlegrounds", color: "#C9A23F" },
  I: { label: "Independents", color: "#6B7280" },
};

// Nuancier des cotes (cartes et carte des États)
export const RATING_COLORS = {
  "Solid D": "#1F4E8C",
  "Likely D": "#5B84BE",
  "Lean D": "#A9C1DE",
  "Toss-up": "#D8BE72",
  "Lean R": "#E3B1A8",
  "Likely R": "#C4695C",
  "Solid R": "#9E332A",
  "No race": "#ECECEC",
};

// ─ Élection de mi-mandat : mardi 3 novembre 2026 ─
export const MIDTERMS_DATE = "2026-11-03";

// ─ Popularité du président ─
export const APPROVAL = {
  president: "Donald Trump",
  approve: 39,
  disapprove: 57,
  source: "Average of national surveys (Silver Bulletin), July 8, 2026",
};

export const APPROVAL_TREND = [
  { wave: "Jan 26", Approve: 44, Disapprove: 52 },
  { wave: "Feb 26", Approve: 43, Disapprove: 53 },
  { wave: "Mar 26", Approve: 43, Disapprove: 53 },
  { wave: "Apr 26", Approve: 42, Disapprove: 54 },
  { wave: "May 26", Approve: 42, Disapprove: 54 },
  { wave: "Jun 26", Approve: 41, Disapprove: 55 },
  { wave: "Jul 26", Approve: 39, Disapprove: 57 },
];

// ─ Bulletin générique du Congrès ─
export const GENERIC = {
  D: 46,
  R: 42,
  source: "Average of generic-ballot surveys (Morning Consult tracker), July 2026",
};

export const GENERIC_TREND = [
  { wave: "Jan 26", D: 45, R: 43 },
  { wave: "Feb 26", D: 45, R: 42 },
  { wave: "Mar 26", D: 46, R: 42 },
  { wave: "Apr 26", D: 46, R: 41 },
  { wave: "May 26", D: 47, R: 42 },
  { wave: "Jun 26", D: 47, R: 41 },
  { wave: "Jul 26", D: 46, R: 42 },
];

export const POLLS_NOTE = "National polling averages as of July 8, 2026, entered by hand for reference only. Typical margin of error: 2 to 4 points.";

// ─ Probabilités de contrôle du Congrès (marchés prédictifs, saisies à la main) ─
export const CONTROL_ODDS = {
  house: { D: 84, R: 16 },
  senate: { D: 45, R: 55 },
  source: "Polymarket, July 7, 2026",
};

// ═══ 2026 MIDTERMS ═══
// rating : "Toss-up" | "Lean D" | "Lean R" | "Likely D" | "Likely R" | "Solid D" | "Solid R"
// holder : parti qui détient actuellement le siège (bord gauche des cartes, carte des États)
// safeD / safeR : sièges également en jeu en 2026 mais considérés sûrs (pour colorer la carte)
// poll (facultatif) : dernier duel mesuré — entries [{name, party: "D"|"R"|"I", pct}], pollster, date

export const SENATE = {
  composition: { R: 53, D: 47 },
  seatsUp: 35,
  outlook: "35 of 100 seats are on the ballot (Class 2 plus two special elections). Democrats need a net gain of 4 seats for a majority — a narrow path, with most of the seats up in Republican-leaning states.",
  safeD: ["CO", "DE", "MA", "NJ", "NM", "OR", "RI", "VA"],
  safeR: ["AL", "AR", "ID", "KS", "LA", "MS", "MT", "OK", "SC", "SD", "TN", "WV", "WY"],
  races: [
    { state: "Georgia", code: "GA", holder: "D", type: "Incumbent", rating: "Toss-up", matchup: "Jon Ossoff (D) vs. Mike Collins (R)", note: "The only Democratic incumbent in a state Trump carried in 2024. Rep. Mike Collins won the Republican nomination — and the first general-election poll handed Ossoff a double-digit lead.",
      poll: { entries: [{ name: "Ossoff", party: "D", pct: 56 }, { name: "Collins", party: "R", pct: 43 }], pollster: "Fox News", date: "late June 2026" } },
    { state: "Maine", code: "ME", holder: "R", type: "Incumbent", rating: "Toss-up", matchup: "Susan Collins (R) vs. Graham Platner (D)", note: "Oyster farmer and political outsider Graham Platner won the Democratic primary in a landslide after Gov. Janet Mills suspended her campaign. Polls give Democrats the edge in the state Harris carried — but Platner's personal controversies make the race volatile." },
    { state: "Ohio", code: "OH", holder: "R", type: "Special", rating: "Toss-up", matchup: "Jon Husted (R) vs. Sherrod Brown (D)", note: "Special election for the seat J.D. Vance vacated. Former Sen. Sherrod Brown attempts a comeback in a state that has moved sharply right. The most expensive race of the cycle.",
      poll: { entries: [{ name: "Husted", party: "R", pct: 47 }, { name: "Brown", party: "D", pct: 45 }], pollster: "Bowling Green State", date: "June 2026" } },
    { state: "North Carolina", code: "NC", holder: "R", type: "Open seat", rating: "Lean D", matchup: "Roy Cooper (D) vs. Michael Whatley (R)", note: "Thom Tillis is retiring. Popular former Gov. Roy Cooper starts as the favorite against Michael Whatley, former RNC chairman. Democrats' best pickup opportunity.",
      poll: { entries: [{ name: "Cooper", party: "D", pct: 49 }, { name: "Whatley", party: "R", pct: 43 }], pollster: "Meredith College", date: "June 2026" } },
    { state: "Michigan", code: "MI", holder: "D", type: "Open seat", rating: "Lean D", matchup: "Democratic primary (Stevens, McMorrow, El-Sayed) vs. Mike Rogers (R)", note: "Gary Peters is retiring. An open Democratic primary on Aug. 4; Mike Rogers, narrowly defeated in 2024, is running again for Republicans.",
      poll: { entries: [{ name: "Stevens", party: "D", pct: 45 }, { name: "Rogers", party: "R", pct: 43 }], pollster: "EPIC-MRA", date: "June 2026" } },
    { state: "New Hampshire", code: "NH", holder: "D", type: "Open seat", rating: "Lean D", matchup: "Chris Pappas (D) vs. Scott Brown (R)", note: "Jeanne Shaheen is retiring. Rep. Chris Pappas is favored in a state that leans Democratic federally.",
      poll: { entries: [{ name: "Pappas", party: "D", pct: 48 }, { name: "Brown", party: "R", pct: 42 }], pollster: "UNH Survey Center", date: "May 2026" } },
    { state: "Minnesota", code: "MN", holder: "D", type: "Open seat", rating: "Likely D", matchup: "Peggy Flanagan (D) vs. Republican primary winner", note: "Tina Smith is retiring. Minnesota has not elected a Republican senator since 2002." },
    { state: "Texas", code: "TX", holder: "R", type: "Open seat", rating: "Lean R", matchup: "Ken Paxton (R) vs. James Talarico (D)", note: "Ken Paxton, backed by Trump, crushed Sen. John Cornyn 64–36 in the May 26 runoff; Rep. James Talarico won the Democratic nomination over Jasmine Crockett. Cook and Sabato both downgraded the seat to Lean R — the first post-runoff poll even gave Talarico the edge.",
      poll: { entries: [{ name: "Talarico", party: "D", pct: 47 }, { name: "Paxton", party: "R", pct: 44 }], pollster: "First post-runoff survey", date: "June 2026" } },
    { state: "Iowa", code: "IA", holder: "R", type: "Open seat", rating: "Likely R", matchup: "Open field after Joni Ernst's retirement", note: "Joni Ernst is not seeking reelection. Democrats hope for a surprise, but the state has trended right since 2016." },
    { state: "Nebraska", code: "NE", holder: "R", type: "Incumbent", rating: "Likely R", matchup: "Pete Ricketts (R) vs. Dan Osborn (independent)", note: "Independent labor leader Dan Osborn tries again after his unexpectedly strong 2024 run." },
    { state: "Alaska", code: "AK", holder: "R", type: "Incumbent", rating: "Toss-up", matchup: "Dan Sullivan (R) vs. Mary Peltola (D)", note: "Former Rep. Mary Peltola, who won statewide in 2022, jumped into the race — Cook moved the seat to Toss-up on July 1. Ranked-choice voting adds another layer of unpredictability; the latest NYT poll still had Sullivan ahead." },
    { state: "Florida", code: "FL", holder: "R", type: "Special", rating: "Likely R", matchup: "Ashley Moody (R) vs. Democratic challenger", note: "Special election for the seat Marco Rubio vacated. Florida is no longer a swing state." },
    { state: "Kentucky", code: "KY", holder: "R", type: "Open seat", rating: "Solid R", matchup: "The race to succeed Mitch McConnell", note: "After seven terms, Mitch McConnell is retiring. The Republican primary is the real contest." },
    { state: "Illinois", code: "IL", holder: "D", type: "Open seat", rating: "Solid D", matchup: "The race to succeed Dick Durbin", note: "A hard-fought Democratic primary (Stratton, Krishnamoorthi, Kelly) for a safely blue seat." },
  ],
};

export const GOVERNORS = {
  seatsUp: 36,
  outlook: "36 of 50 governorships are on the ballot, including about a dozen open seats created by term limits. Control of the states is at stake ahead of redistricting and the 2028 presidential race.",
  safeD: ["CT", "HI", "IL", "MD", "MA", "NM", "OR", "RI"],
  safeR: ["AK", "AR", "ID", "IA", "NE", "NH", "OK", "SC", "SD", "TN", "VT", "WY"],
  races: [
    { state: "Georgia", code: "GA", holder: "R", type: "Open seat", rating: "Toss-up", matchup: "Rick Jackson (R) vs. Keisha Lance Bottoms (D)", note: "Brian Kemp is term-limited. Businessman Rick Jackson beat Trump-endorsed Lt. Gov. Burt Jones in the June 16 runoff; he faces former Atlanta mayor Keisha Lance Bottoms in the South's premier battleground." },
    { state: "Michigan", code: "MI", holder: "D", type: "Open seat", rating: "Toss-up", matchup: "Jocelyn Benson (D) vs. John James (R) vs. Mike Duggan (ind.)", note: "Gretchen Whitmer is term-limited. Detroit Mayor Mike Duggan's independent bid makes this three-way race unpredictable.",
      poll: { entries: [{ name: "Benson", party: "D", pct: 40 }, { name: "James", party: "R", pct: 35 }, { name: "Duggan", party: "I", pct: 17 }], pollster: "EPIC-MRA", date: "June 2026" } },
    { state: "Arizona", code: "AZ", holder: "D", type: "Incumbent", rating: "Toss-up", matchup: "Katie Hobbs (D) vs. GOP primary (Robson, Biggs)", note: "Katie Hobbs, narrowly elected in 2022, defends her seat in a state Trump carried by 5 points in 2024.",
      poll: { entries: [{ name: "Hobbs", party: "D", pct: 44 }, { name: "Robson", party: "R", pct: 44 }], pollster: "Noble Predictive Insights", date: "June 2026" } },
    { state: "Wisconsin", code: "WI", holder: "D", type: "Open seat", rating: "Toss-up", matchup: "Democratic primary (Rodriguez…) vs. Republican primary", note: "Tony Evers is not seeking a third term. The closest state in the nation in 2024 (0.9 points).",
      poll: { entries: [{ name: "Rodriguez", party: "D", pct: 45 }, { name: "Schoemann", party: "R", pct: 43 }], pollster: "Marquette Law School", date: "June 2026" } },
    { state: "Nevada", code: "NV", holder: "R", type: "Incumbent", rating: "Toss-up", matchup: "Joe Lombardo (R) vs. Aaron Ford (D)", note: "Republican Joe Lombardo, elected in 2022, is the most endangered incumbent governor in the country.",
      poll: { entries: [{ name: "Lombardo", party: "R", pct: 45 }, { name: "Ford", party: "D", pct: 44 }], pollster: "The Nevada Independent", date: "May 2026" } },
    { state: "Kansas", code: "KS", holder: "D", type: "Open seat", rating: "Lean R", matchup: "The race to succeed Laura Kelly (term-limited)", note: "Democrats have held the office since 2018 in a deeply Republican state: a tough hold." },
    { state: "Maine", code: "ME", holder: "D", type: "Open seat", rating: "Lean D", matchup: "The race to succeed Janet Mills (running for Senate)", note: "Janet Mills, term-limited, is running for Senate. Democrats start as favorites." },
    { state: "Ohio", code: "OH", holder: "R", type: "Open seat", rating: "Likely R", matchup: "Vivek Ramaswamy (R) vs. Amy Acton (D)", note: "Mike DeWine is term-limited. Vivek Ramaswamy, endorsed by Trump, dominates the Republican primary." },
    { state: "Florida", code: "FL", holder: "R", type: "Open seat", rating: "Likely R", matchup: "Byron Donalds (R) vs. David Jolly (D)", note: "Ron DeSantis is term-limited. Byron Donalds, endorsed early by Trump, is the favorite." },
    { state: "New York", code: "NY", holder: "D", type: "Incumbent", rating: "Likely D", matchup: "Kathy Hochul (D) vs. Elise Stefanik (R)", note: "Elise Stefanik carries the Republican banner in a state her party last won in 2002.",
      poll: { entries: [{ name: "Hochul", party: "D", pct: 52 }, { name: "Stefanik", party: "R", pct: 41 }], pollster: "Siena College", date: "June 2026" } },
    { state: "Pennsylvania", code: "PA", holder: "D", type: "Incumbent", rating: "Likely D", matchup: "Josh Shapiro (D) vs. Stacy Garrity (R)", note: "Josh Shapiro, highly popular, would enter 2028 conversations with a decisive reelection.",
      poll: { entries: [{ name: "Shapiro", party: "D", pct: 55 }, { name: "Garrity", party: "R", pct: 38 }], pollster: "Franklin & Marshall", date: "May 2026" } },
    { state: "Minnesota", code: "MN", holder: "D", type: "Incumbent", rating: "Likely D", matchup: "Tim Walz (D) vs. Republican primary winner", note: "Kamala Harris's former running mate seeks a third term." },
    { state: "California", code: "CA", holder: "D", type: "Open seat", rating: "Solid D", matchup: "Democratic primary (Porter, Becerra, Villaraigosa…)", note: "Gavin Newsom is term-limited. The June 2 primary narrowed the field; the office will stay Democratic." },
    { state: "Colorado", code: "CO", holder: "D", type: "Open seat", rating: "Solid D", matchup: "Michael Bennet (D) vs. Republican primary winner", note: "Jared Polis is term-limited; Sen. Michael Bennet wants to succeed him." },
    { state: "Texas", code: "TX", holder: "R", type: "Incumbent", rating: "Solid R", matchup: "Greg Abbott (R) vs. Democratic primary winner", note: "Greg Abbott seeks a fourth term, unprecedented since Rick Perry." },
    { state: "Alabama", code: "AL", holder: "R", type: "Open seat", rating: "Solid R", matchup: "Tommy Tuberville (R) vs. Democratic challenger", note: "Sen. Tommy Tuberville is leaving Washington to run for the seat Kay Ivey, term-limited, is vacating." },
  ],
};

export const HOUSE = {
  composition: { R: 219, D: 213, vacant: 3 },
  majority: 218,
  rating: "Lean D",
  note: "All 435 seats are on the ballot. Democrats need a net gain of 3 seats to retake the majority. Only about thirty districts are genuinely competitive after the redistricting fights in Texas, California and elsewhere. History favors the opposition: since 1946, the president's party has almost always lost House seats at the midterms.",
};

// ─ Journal des changements de cote (du plus récent au plus ancien) ─
// contest : "senate" | "governor" | "house"
export const RATING_CHANGES = [
  { date: "Jul 1, 2026", contest: "senate", race: "Alaska Senate", from: "Likely R", to: "Toss-up", note: "Cook Political Report moves Alaska after former Rep. Mary Peltola, who won statewide in 2022, enters the race against Dan Sullivan." },
  { date: "Jun 11, 2026", contest: "senate", race: "North Carolina Senate", from: "Toss-up", to: "Lean D", note: "Sabato's Crystal Ball rewards Roy Cooper's consistent polling leads over Michael Whatley." },
  { date: "Jun 11, 2026", contest: "senate", race: "Ohio Senate", from: "Lean R", to: "Toss-up", note: "Sabato's Crystal Ball: Sherrod Brown's comeback bid pulls even with Jon Husted in the special election." },
  { date: "Late May 2026", contest: "senate", race: "Texas Senate", from: "Likely R", to: "Lean R", note: "Cook and Sabato both downgrade Republicans' hold after Ken Paxton's runoff win over John Cornyn." },
];

// ═══ ROAD TO THE WHITE HOUSE 2028 ═══
// Classement indicatif fondé sur les résultats 2024.
// rating par État : "Safe D" | "Likely D" | "Toss-up" | "Likely R" | "Safe R"
// 538 grands électeurs au total — 270 pour l'emporter.

export const ROAD_270 = {
  year: 2028,
  total: 538,
  majority: 270,
  categories: [
    {
      key: "D", label: "Democrats", ev: 226,
      states: [
        { code: "CA", name: "California", ev: 54, rating: "Safe D" },
        { code: "NY", name: "New York", ev: 28, rating: "Safe D" },
        { code: "IL", name: "Illinois", ev: 19, rating: "Safe D" },
        { code: "NJ", name: "New Jersey", ev: 14, rating: "Safe D" },
        { code: "VA", name: "Virginia", ev: 13, rating: "Likely D" },
        { code: "WA", name: "Washington", ev: 12, rating: "Safe D" },
        { code: "MA", name: "Massachusetts", ev: 11, rating: "Safe D" },
        { code: "MD", name: "Maryland", ev: 10, rating: "Safe D" },
        { code: "MN", name: "Minnesota", ev: 10, rating: "Likely D" },
        { code: "CO", name: "Colorado", ev: 10, rating: "Safe D" },
        { code: "OR", name: "Oregon", ev: 8, rating: "Safe D" },
        { code: "CT", name: "Connecticut", ev: 7, rating: "Safe D" },
        { code: "NM", name: "New Mexico", ev: 5, rating: "Likely D" },
        { code: "HI", name: "Hawaii", ev: 4, rating: "Safe D" },
        { code: "NH", name: "New Hampshire", ev: 4, rating: "Likely D" },
        { code: "RI", name: "Rhode Island", ev: 4, rating: "Safe D" },
        { code: "ME", name: "Maine", ev: 4, rating: "Likely D" },
        { code: "DE", name: "Delaware", ev: 3, rating: "Safe D" },
        { code: "VT", name: "Vermont", ev: 3, rating: "Safe D" },
        { code: "DC", name: "District of Columbia", ev: 3, rating: "Safe D" },
      ],
    },
    {
      key: "B", label: "Battlegrounds", ev: 93,
      states: [
        { code: "PA", name: "Pennsylvania", ev: 19, rating: "Toss-up" },
        { code: "GA", name: "Georgia", ev: 16, rating: "Toss-up" },
        { code: "NC", name: "North Carolina", ev: 16, rating: "Toss-up" },
        { code: "MI", name: "Michigan", ev: 15, rating: "Toss-up" },
        { code: "AZ", name: "Arizona", ev: 11, rating: "Toss-up" },
        { code: "WI", name: "Wisconsin", ev: 10, rating: "Toss-up" },
        { code: "NV", name: "Nevada", ev: 6, rating: "Toss-up" },
      ],
    },
    {
      key: "R", label: "Republicans", ev: 219,
      states: [
        { code: "TX", name: "Texas", ev: 40, rating: "Likely R" },
        { code: "FL", name: "Florida", ev: 30, rating: "Likely R" },
        { code: "OH", name: "Ohio", ev: 17, rating: "Likely R" },
        { code: "TN", name: "Tennessee", ev: 11, rating: "Safe R" },
        { code: "IN", name: "Indiana", ev: 11, rating: "Safe R" },
        { code: "MO", name: "Missouri", ev: 10, rating: "Safe R" },
        { code: "AL", name: "Alabama", ev: 9, rating: "Safe R" },
        { code: "SC", name: "South Carolina", ev: 9, rating: "Safe R" },
        { code: "KY", name: "Kentucky", ev: 8, rating: "Safe R" },
        { code: "LA", name: "Louisiana", ev: 8, rating: "Safe R" },
        { code: "OK", name: "Oklahoma", ev: 7, rating: "Safe R" },
        { code: "UT", name: "Utah", ev: 6, rating: "Safe R" },
        { code: "MS", name: "Mississippi", ev: 6, rating: "Safe R" },
        { code: "AR", name: "Arkansas", ev: 6, rating: "Safe R" },
        { code: "IA", name: "Iowa", ev: 6, rating: "Likely R" },
        { code: "KS", name: "Kansas", ev: 6, rating: "Safe R" },
        { code: "NE", name: "Nebraska", ev: 5, rating: "Safe R" },
        { code: "WV", name: "West Virginia", ev: 4, rating: "Safe R" },
        { code: "ID", name: "Idaho", ev: 4, rating: "Safe R" },
        { code: "MT", name: "Montana", ev: 4, rating: "Safe R" },
        { code: "ND", name: "North Dakota", ev: 3, rating: "Safe R" },
        { code: "SD", name: "South Dakota", ev: 3, rating: "Safe R" },
        { code: "WY", name: "Wyoming", ev: 3, rating: "Safe R" },
        { code: "AK", name: "Alaska", ev: 3, rating: "Safe R" },
      ],
    },
  ],
  note: "Maine and Nebraska award some electors by congressional district; they are counted as blocs here for simplicity. Ratings will be refined as 2028 polling arrives.",
};

// Détail des États pivots (résultats 2024 et enjeux)
export const BATTLEGROUNDS = [
  { code: "PA", state: "Pennsylvania", ev: 19, result2024: "Trump +1.7", note: "The decisive state of the last three cycles: whoever wins Pennsylvania almost always wins the White House." },
  { code: "GA", state: "Georgia", ev: 16, result2024: "Trump +2.2", note: "Biden +0.2 in 2020, Trump +2.2 in 2024: the former Southern stronghold is now the testing ground for the Atlanta suburbs' vote." },
  { code: "NC", state: "North Carolina", ev: 16, result2024: "Trump +3.2", note: "The battleground Democrats haven't won since Obama in 2008 — but keep targeting every cycle." },
  { code: "MI", state: "Michigan", ev: 15, result2024: "Trump +1.4", note: "Heart of the Blue Wall that fell in 2016 and 2024. Union households and Arab-American voters decide it." },
  { code: "AZ", state: "Arizona", ev: 11, result2024: "Trump +5.5", note: "The widest margin among the seven battlegrounds in 2024. Immigration and Maricopa County shape the race." },
  { code: "WI", state: "Wisconsin", ev: 10, result2024: "Trump +0.9", note: "The narrowest margin in the country in 2024. Four of the last six presidential races were decided here by under a point." },
  { code: "NV", state: "Nevada", ev: 6, result2024: "Trump +3.1", note: "First Republican win since 2004, powered by Latino and working-class voters in Las Vegas." },
];

// ─ Primaires 2028 : hypothèses testées à plus de deux ans du scrutin ─
export const PRIMARIES_2028 = {
  note: "National primary polling, spring 2026. At this stage it mostly measures name recognition.",
  D: [
    { name: "Gavin Newsom", detail: "Governor of California", score: 22 },
    { name: "Pete Buttigieg", detail: "Former Transportation secretary", score: 13 },
    { name: "Kamala Harris", detail: "Former vice president", score: 12 },
    { name: "Alexandria Ocasio-Cortez", detail: "Representative from New York", score: 11 },
    { name: "Gretchen Whitmer", detail: "Governor of Michigan", score: 6 },
    { name: "Josh Shapiro", detail: "Governor of Pennsylvania", score: 5 },
    { name: "JB Pritzker", detail: "Governor of Illinois", score: 4 },
    { name: "Cory Booker", detail: "Senator from New Jersey", score: 3 },
  ],
  R: [
    { name: "J.D. Vance", detail: "Vice president", score: 44 },
    { name: "Marco Rubio", detail: "Secretary of State", score: 11 },
    { name: "Ron DeSantis", detail: "Governor of Florida", score: 8 },
    { name: "Donald Trump Jr.", detail: "Businessman", score: 7 },
    { name: "Nikki Haley", detail: "Former U.N. ambassador", score: 5 },
    { name: "Ted Cruz", detail: "Senator from Texas", score: 3 },
  ],
};

// ─ L'essentiel de la semaine : 4 à 5 brèves maximum, factuel. ─
export const BRIEFING = {
  week: "July 2 – 8, 2026",
  items: [
    { title: "Ossoff opens a 13-point lead in Georgia", text: "A Fox News poll gives the Democratic incumbent a 56–43 lead over Republican nominee Mike Collins — a stunning margin in a state Trump carried in 2024." },
    { title: "Alaska becomes a toss-up", text: "Former Rep. Mary Peltola's entry against Sen. Dan Sullivan prompted Cook Political Report to move the seat to Toss-up on July 1." },
    { title: "Texas is officially competitive", text: "After Ken Paxton's runoff rout of John Cornyn, Cook and Sabato downgraded the seat to Lean R — and the first post-runoff poll put Democrat James Talarico ahead, 47–44." },
    { title: "Maine's wild card", text: "Outsider Graham Platner, the surprise Democratic nominee after Janet Mills suspended her campaign, leads in early polls while his personal controversies dominate coverage." },
    { title: "Markets move toward Democrats", text: "Polymarket now gives Democrats an 84 percent chance of taking the House; Republicans remain favored to hold the Senate, 55–45." },
  ],
};

// iso (facultatif) : date exacte pour le compte à rebours "Next up"
export const CALENDAR = [
  { date: "Aug 4, 2026", iso: "2026-08-04", event: "Primaries in Arizona, Michigan, Kansas, Missouri and Washington" },
  { date: "Aug 18, 2026", iso: "2026-08-18", event: "Primaries in Florida and Wyoming" },
  { date: "Sep 8, 2026", iso: "2026-09-08", event: "New Hampshire primaries, the last of the cycle" },
  { date: "Nov 3, 2026", iso: "2026-11-03", event: "Midterm elections: the full House, 35 Senate seats, 36 governorships and thousands of local races" },
  { date: "Jan 3, 2027", iso: "2027-01-03", event: "The 120th Congress convenes" },
  { date: "Nov 2, 2027", iso: "2027-11-02", event: "Off-year elections: governors of Kentucky, Louisiana and Mississippi" },
  { date: "Early 2028", event: "Presidential primaries begin: Iowa caucuses, New Hampshire, then Super Tuesday" },
  { date: "Summer 2028", event: "Democratic and Republican national conventions" },
  { date: "Nov 7, 2028", iso: "2028-11-07", event: "Presidential election, the full House, one third of the Senate and 11 governorships" },
];

export const MIDTERM_NOTE = "Since 1946, the president's party has lost an average of 26 House seats at the midterms. It has gained seats only twice: in 1998 and 2002.";
