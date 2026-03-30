#!/usr/bin/env ts-node
/**
 * content-calendar.ts
 * Generates a weekly or monthly content plan linking to existing output assets.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... ts-node content-calendar.ts --period=week
 *   ANTHROPIC_API_KEY=sk-... ts-node content-calendar.ts --period=month --focus="agente-ia"
 */
import * as fs from "fs";
import * as path from "path";
import { ask, brandContext, writeOutput, today, arg } from "./utils/claude";

const period = arg("period", "week");
const focus  = arg("focus",  "general");
const outDir = `calendar`;

function scanOutputDir(): string {
  const outputPath = path.join(__dirname, "../output");
  if (!fs.existsSync(outputPath)) return "(no output assets generated yet)";

  const lines: string[] = ["Available assets in output/:"];
  const scan = (dir: string, depth = 0) => {
    if (depth > 3) return;
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const full = path.join(dir, item);
        const rel  = path.relative(outputPath, full);
        if (fs.statSync(full).isDirectory()) {
          lines.push(`${"  ".repeat(depth)}📁 ${rel}/`);
          scan(full, depth + 1);
        } else {
          lines.push(`${"  ".repeat(depth + 1)}📄 ${rel}`);
        }
      }
    } catch {}
  };
  scan(outputPath);
  return lines.join("\n");
}

const SYSTEM = `
You are Oragon's content strategist. You create actionable weekly and monthly
content calendars for a B2B Apple reseller SaaS brand in Argentina.

${brandContext()}

## Content Mix Guidelines (per week)
- 2-3 Instagram posts (feed + story)
- 1-2 LinkedIn posts
- 1 email send (to warm list or cold sequence step)
- 1 WhatsApp broadcast (if newsworthy trigger)
- 1 short video post (Reels or TikTok, from existing video assets)

## Content Pillars (rotate across week)
1. **Education** — Teach resellers something useful (stock management tip, pricing trick)
2. **Proof** — Show results, testimonials, before/after
3. **Product Demo** — Feature spotlight, how-to
4. **Culture/Brand** — Behind the scenes, team, Argentina market context
5. **Engagement** — Question, poll, conversation starter

## Posting Times (Argentina, optimal)
- Instagram: Tue/Thu/Sat 12:00-13:00 or 20:00-21:00
- LinkedIn: Mon/Wed/Fri 09:00-10:00
- Email: Tue/Thu 09:30 (open rates peak)
- WhatsApp broadcast: Morning 09:00-10:00 or evening 19:00-20:00
`;

async function main() {
  console.log(`\n📅  Generating ${period} content calendar${focus !== "general" ? ` (focus: ${focus})` : ""}\n`);

  const assetInventory = scanOutputDir();

  const calendar = await ask(
    SYSTEM,
    `Create a ${period === "month" ? "4-week" : "7-day"} content calendar for Oragon.
${focus !== "general" ? `This period's focus/campaign angle: "${focus}"` : "Mix all 3 growth marketing angles evenly."}

## Available Assets
${assetInventory}

## Output Format
For each day/slot, provide:

**[Day, Date] — [Platform]**
- **Pillar:** [Education/Proof/Demo/Culture/Engagement]
- **Format:** [Post/Story/Reel/Email/WhatsApp/LinkedIn]
- **Hook/Headline:** [First line or subject]
- **Content summary:** [2-3 sentences of what the post says]
- **Asset needed:** [Reference existing output file OR mark as 🔴 NEEDS CREATION]
- **CTA:** [What you want the audience to do]

## End with:
### 🔴 Assets Still Needed
List all items marked as NEEDS CREATION with suggested agent command to generate them.

### 📊 Week KPIs to Track
Metrics to measure for this period.
`);

  const filename = `${today()}-${period}${focus !== "general" ? `-${focus}` : ""}.md`;
  writeOutput(`${outDir}/${filename}`, `# Content Calendar — ${period} · ${focus}\n*Generated ${today()}*\n\n${calendar}`);

  console.log(`\n✅  Done! output/${outDir}/${filename}\n`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
