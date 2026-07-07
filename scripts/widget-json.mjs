// Génère public/widget.json à partir de src/data.js — le résumé léger que
// consomment les widgets natifs (iOS WidgetKit / Android) et les notifications.
// Lancé automatiquement avant chaque build (voir package.json).
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { UPDATED, MIDTERMS_DATE, APPROVAL, GENERIC, CONTROL_ODDS, SENATE, GOVERNORS, BRIEFING, CALENDAR } from "../src/data.js";

const racine = dirname(dirname(fileURLToPath(import.meta.url)));

const prochainEvenement = CALENDAR.find(e => e.iso && new Date(e.iso) >= new Date(new Date().toDateString()));

const widget = {
  generatedAt: new Date().toISOString(),
  updated: UPDATED,
  midterms: { date: MIDTERMS_DATE },
  approval: { president: APPROVAL.president, approve: APPROVAL.approve, disapprove: APPROVAL.disapprove },
  genericBallot: { D: GENERIC.D, R: GENERIC.R },
  controlOdds: { house: CONTROL_ODDS.house, senate: CONTROL_ODDS.senate },
  senate: {
    composition: SENATE.composition,
    tossups: SENATE.races.filter(r => r.rating === "Toss-up").map(r => r.code),
  },
  governors: {
    tossups: GOVERNORS.races.filter(r => r.rating === "Toss-up").map(r => r.code),
  },
  headline: BRIEFING.items[0] ? BRIEFING.items[0].title : null,
  nextEvent: prochainEvenement ? { date: prochainEvenement.date, iso: prochainEvenement.iso, event: prochainEvenement.event } : null,
};

writeFileSync(join(racine, "public", "widget.json"), JSON.stringify(widget, null, 2) + "\n");
console.log("public/widget.json généré —", UPDATED);
