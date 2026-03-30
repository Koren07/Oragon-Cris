#!/usr/bin/env ts-node
/**
 * image-prompt-generator.ts
 * Generates creative briefs + AI image prompts for social media content.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... ts-node image-prompt-generator.ts --angle="agente-ia" --format=instagram
 *   ANTHROPIC_API_KEY=sk-... ts-node image-prompt-generator.ts --angle="inventario" --format=all
 *
 * Angles: agente-ia | inventario | dashboard | migracion | producto | general
 * Formats: instagram | story | linkedin | banner | all
 */
import { ask, brandContext, writeOutput, today, arg } from "./utils/claude";

const angle  = arg("angle",  "general");
const format = arg("format", "all");
const outDir = `social/${today()}_${angle.replace(/\s+/g, "-")}`;

const FORMATS = {
  instagram: { size: "1080×1080px (1:1)", notes: "Bold center composition. Text max 20% of frame. Strong visual hook." },
  story:     { size: "1080×1920px (9:16)", notes: "Vertical. Large text. Swipe-up CTA at bottom 20%." },
  linkedin:  { size: "1200×627px (1.91:1)", notes: "Professional. Less bold. More whitespace. Subtle." },
  banner:    { size: "1500×500px (3:1)", notes: "Twitter/X or website banner. Left text, right visual." },
};

const SYSTEM = `
You are Oragon's creative director. You produce social media content briefs and
AI image generation prompts for a B2B Apple reseller SaaS brand in Argentina.

${brandContext()}

## Visual Identity Rules
- Background: Always white (#ffffff) or very faint gray (#F5F5F7). NEVER dark backgrounds for social.
- Typography style: Inter, clean, minimalist. Apple-inspired.
- Colors: Space Black (#1d1d1f) for text, Apple Blue (#0066CC) for accents, never heavy gradients.
- Aesthetic: Clean bento-card UI. Premium. Elegant. "Software that feels like a product."
- No stock photo people. Prefer: UI screenshots, abstract data visuals, clean product mockups.
- Iconography: Material Symbols style, monochrome.

## Prompt engineering notes for AI image tools
- Midjourney style suffix: "--style raw --ar [ratio] --v 6.1"
- Ideogram style: add "flat design, minimalist, white background, sans-serif typography"
- DALL-E style: describe what NOT to include (no gradients, no people, no dark backgrounds)
`;

async function generateForFormat(fmt: string, spec: { size: string; notes: string }) {
  const result = await ask(
    SYSTEM,
    `Create a complete social media content package for:
- Angle: "${angle}"
- Format: ${fmt} (${spec.size})
- Format notes: ${spec.notes}

Output exactly:

## Creative Brief
[2-3 sentences describing the visual concept and what emotion/reaction it should trigger]

## Headline
[Main text that would appear on the image — max 6 words, voseo Argentine Spanish]

## Subtext
[Supporting text — max 12 words]

## CTA Text
[Call to action — max 4 words]

## Visual Description
[Detailed description of what's in the image: layout, elements, colors, mood]

## Midjourney Prompt
[Complete ready-to-paste Midjourney prompt]

## Ideogram Prompt
[Complete ready-to-paste Ideogram prompt, optimized for text accuracy]

## DALL-E Prompt
[Complete ready-to-paste DALL-E / GPT Image prompt]

## Design Notes for Human Designer
[If a human designer is creating this instead of AI, what should they know?]
`
  );
  return `## ${fmt.toUpperCase()} — ${spec.size}\n\n${result}`;
}

async function main() {
  console.log(`\n🎨  Generating image content for angle: "${angle}", format: "${format}"\n`);

  const targetFormats = format === "all"
    ? Object.entries(FORMATS)
    : [[format, FORMATS[format as keyof typeof FORMATS]]].filter(([, v]) => v) as [string, typeof FORMATS[keyof typeof FORMATS]][];

  if (targetFormats.length === 0) {
    console.error(`Unknown format: ${format}. Use: instagram | story | linkedin | banner | all`);
    process.exit(1);
  }

  const sections: string[] = [];
  for (const [fmt, spec] of targetFormats) {
    console.log(`  Generating ${fmt}...`);
    sections.push(await generateForFormat(fmt, spec));
  }

  const allPrompts = sections.join("\n\n---\n\n");
  writeOutput(`${outDir}/prompts.md`, `# Image Prompts — ${angle}\n*Generated ${today()}*\n\n${allPrompts}`);

  // Platform specs cheat sheet
  const specs = `# Platform Specs — ${angle}
*Generated ${today()}*

| Platform | Size | Safe Zone | Max Text | Notes |
|----------|------|-----------|----------|-------|
| Instagram Feed | 1080×1080px | 80px all sides | 20% of frame | Square, strong center |
| Instagram Story | 1080×1920px | 250px top/bottom | 30% of frame | Vertical, swipe CTA |
| LinkedIn Post | 1200×627px | 60px all sides | 25% of frame | Professional tone |
| Twitter/X Banner | 1500×500px | 80px left/right | 40% of frame | Left text, right visual |

## Copy for Each Format
${sections.map(s => {
  const lines = s.split("\n");
  const headline = lines.find(l => l.startsWith("## Headline"))?.replace("## Headline", "").trim() || "";
  const subtext  = lines.find(l => l.startsWith("## Subtext"))?.replace("## Subtext", "").trim() || "";
  const cta      = lines.find(l => l.startsWith("## CTA"))?.replace("## CTA Text", "").trim() || "";
  const fmt      = lines[0].replace("## ", "").split("—")[0].trim();
  return `### ${fmt}\n- **Headline:** ${headline}\n- **Subtext:** ${subtext}\n- **CTA:** ${cta}`;
}).join("\n\n")}
`;
  writeOutput(`${outDir}/specs.md`, specs);

  console.log(`\n✅  Done! Output in: output/${outDir}/\n`);
  console.log(`   prompts.md — Creative briefs + AI prompts for each format`);
  console.log(`   specs.md   — Platform specs + copy summary\n`);
  console.log(`Next: paste prompts into Midjourney, Ideogram, or DALL-E.\n`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
