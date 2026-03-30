#!/usr/bin/env ts-node
/**
 * script-generator.ts
 * Generates 3 video script variants + scene breakdown + ElevenLabs settings.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... ts-node script-generator.ts --angle="inventario"
 *   ANTHROPIC_API_KEY=sk-... ts-node script-generator.ts --angle="agente IA" --persona="cuentapropista"
 *
 * Angles: inventario | agente-ia | dashboard | migracion | trade-in | general
 * Personas: cuentapropista | tienda-chica | distribuidor (optional, defaults to general)
 */
import { ask, brandContext, writeOutput, today, arg } from "./utils/claude";

const angle   = arg("angle",   "general");
const persona = arg("persona", "general");
const outDir  = `videos/scripts/${today()}_${angle.replace(/\s+/g, "-")}`;

const SYSTEM = `
You are Oragon's senior video scriptwriter. You write punchy, high-converting
Spanish-language scripts for 45-60 second marketing videos targeting Apple
resellers in Argentina.

${brandContext()}

## Script Rules
- Language: Argentine Spanish with voseo ("Empezá", "Vendés", "Dormís")
- Pacing: Each sentence is a new beat. Short. Punchy. No filler.
- Structure: Hook (5s) → Problem (10s) → Solution demo (25s) → Proof (10s) → CTA (5s)
- Voice-over only: no on-screen text instructions, just the spoken words
- Total duration: 45-60 seconds when read at normal pace
- End every script with the same CTA: "Oragon. Empezá hoy en panel.oragon.com.ar"

## Output format for EACH variant:
### Script VN — [Hook title]
[Full voiceover text, one sentence per line]

**Duration estimate:** Xs
**Tone:** [e.g. Urgente / Emocional / Técnico / Aspiracional]
**Best for:** [platform/format]
`;

const BREAKDOWN_SYSTEM = `
You are a Remotion video director for Oragon. Given a voiceover script,
produce a scene-by-scene breakdown mapping the script to the 7 available scenes.

Available Remotion scenes:
- BrandReveal (6s) — Logo spring-in
- InventoryScene (15s) — WhatsApp AI chat at 4am
- ScreenshotsScene (4s) — App screenshot flash
- HomeScene (10s) — Inventory search widget
- ProductScene (10s) — Product detail card with price count-up
- DashboardScene (12s) — KPI cards + revenue chart
- OutroScene (7s) — Logo + CTA

Output a markdown table: | Time | Scene | Voiceover lines shown |
Then list which scenes to INCLUDE vs SKIP for this particular script.
`;

async function main() {
  console.log(`\n🎬  Generating scripts for angle: "${angle}", persona: "${persona}"\n`);

  // Generate 3 script variants
  const scripts = await ask(
    SYSTEM,
    `Generate 3 distinct script variants for the angle: "${angle}".
${persona !== "general" ? `Target persona: "${persona}" (use their specific pain points from the personas doc).` : ""}

Make each variant meaningfully different:
- V1: Emotional hook (lead with a relatable pain moment)
- V2: Proof-led hook (lead with a specific stat or result)
- V3: Curiosity hook (lead with a provocative question or claim)

Write all 3 complete scripts now.`
  );

  writeOutput(`${outDir}/scripts.md`, `# Video Scripts — ${angle}\n*Generated ${today()} · Persona: ${persona}*\n\n${scripts}`);

  // Generate scene breakdown for V1
  const breakdown = await ask(
    BREAKDOWN_SYSTEM,
    `Given this collection of scripts, produce scene breakdowns for each variant:\n\n${scripts}`
  );

  writeOutput(`${outDir}/scene-breakdown.md`, `# Scene Breakdown — ${angle}\n*Generated ${today()}*\n\n${breakdown}`);

  // Generate ElevenLabs settings recommendations
  const voiceSettings = await ask(
    `You are an ElevenLabs voice settings expert for Oragon marketing videos.
Oragon uses voice: Charlie (ID: IKne3meq5aSn9XLyUdCD), model: eleven_multilingual_v2.
Recommend stability + similarity_boost + style settings tuned to the tone of each script variant.
Output as JSON with keys: v1, v2, v3, each containing: stability, similarity_boost, style, speed, rationale.`,
    `Scripts:\n${scripts}`
  );

  writeOutput(`${outDir}/voiceover-settings.json`, voiceSettings);

  console.log(`\n✅  Done! Output in: output/${outDir}/\n`);
  console.log(`   scripts.md         — 3 voiceover script variants`);
  console.log(`   scene-breakdown.md — Remotion scene mapping`);
  console.log(`   voiceover-settings.json — ElevenLabs tuning\n`);
  console.log(`Next: paste a script into remotion/scripts/generate-voiceover.ts and render.\n`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
