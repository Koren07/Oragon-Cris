#!/usr/bin/env ts-node
/**
 * email-copywriter.ts
 * Generates complete email sequences ready to import into any send tool.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... ts-node email-copywriter.ts --persona="tienda-chica" --type=cold
 *   ANTHROPIC_API_KEY=sk-... ts-node email-copywriter.ts --persona="distribuidor" --type=nurture
 *
 * Types: cold (5-email outbound) | nurture (3-email lifecycle)
 * Personas: cuentapropista | tienda-chica | distribuidor
 */
import { ask, brandContext, writeOutput, today, arg } from "./utils/claude";

const persona = arg("persona", "tienda-chica");
const type    = arg("type",    "cold");
const outDir  = `email/${today()}_${type}-${persona}`;

const SYSTEM = `
You are Oragon's email copywriter. You write high-converting B2B emails in
Argentine Spanish targeting Apple resellers. Your emails are direct, short,
and always written in voseo.

${brandContext()}

## Email Rules
- Subject lines: Max 7 words. Specific. Curiosity or pain-driven.
- Body: 3-5 short paragraphs. No walls of text. Each paragraph = 1-3 sentences.
- Opener: Never start with "Espero que estés bien" or generic greetings.
- Always personalization placeholder: {{first_name}}, {{company_name}} where natural.
- CTA: One clear link or action per email. No multiple CTAs.
- Signature: Lucas de Oragon | panel.oragon.com.ar
- Language: Voseo. Informal but professional. Like a message from a smart peer, not a salesperson.
`;

const COLD_PROMPT = `
Write a 5-email cold outreach sequence targeting the "${persona}" persona.

Email cadence:
- Email 1 (Day 1): Pain-point hook — no pitch, just demonstrate you understand their problem
- Email 2 (Day 3): Proof email — specific result/stat, soft transition to the product
- Email 3 (Day 6): Demo offer — invite them to see the product in 15 minutes
- Email 4 (Day 10): Objection handler — address their most likely objection head-on
- Email 5 (Day 15): Final breakup — short, last attempt, closes the loop

For each email output:
**Email N — [Internal name]**
**Subject A:** [variant 1]
**Subject B:** [variant 2]
**Subject C:** [variant 3]
**Body:**
[Full email body]
---
`;

const NURTURE_PROMPT = `
Write a 3-email nurture sequence for a lead who signed up for a free trial or
attended a demo. Persona: "${persona}".

Email cadence:
- Email 1 (Day 1 after sign-up): Welcome + quick win — show them 1 thing to do first
- Email 2 (Day 4): Feature spotlight — the one feature most relevant to their persona's pain
- Email 3 (Day 10): Social proof + upgrade nudge — a real reseller story + conversion CTA

Same format as cold sequence.
`;

const CSV_SYSTEM = `
Convert a set of email sequences into a CSV format ready to import into
Smartlead, Apollo, or Instantly.

Output ONLY valid CSV with these columns (no extra text before or after):
sequence_name,step_number,day,subject,body

Escape all commas inside fields with quotes. Use double-quotes for fields containing commas or newlines.
Replace actual newlines inside body with \\n.
`;

async function main() {
  console.log(`\n📧  Generating ${type} email sequence for persona: "${persona}"\n`);

  const prompt = type === "nurture" ? NURTURE_PROMPT : COLD_PROMPT;
  const sequence = await ask(SYSTEM, prompt);

  writeOutput(`${outDir}/sequence.md`, `# Email Sequence — ${type} · ${persona}\n*Generated ${today()}*\n\n${sequence}`);

  // Subject line A/B/C summary
  const subjects = await ask(
    `Extract only the subject line variants from this email sequence.
Output a clean markdown table: | Email | Day | Subject A | Subject B | Subject C |`,
    sequence
  );

  writeOutput(`${outDir}/subject-lines.md`, `# Subject Lines — ${type} · ${persona}\n*Generated ${today()}*\n\n${subjects}`);

  // Strategy notes
  const strategy = await ask(
    `You are a cold email strategist. Given this sequence, write a 1-page strategy note covering:
1. Ideal send times for Argentine B2B contacts
2. When to stop the sequence (no response signals)
3. How to segment: which persona variant to send to whom
4. What reply to sequence transition looks like
5. Key metric targets: open rate %, reply rate %`,
    `Sequence:\n${sequence}`
  );

  writeOutput(`${outDir}/strategy-notes.md`, `# Strategy Notes — ${type} · ${persona}\n*Generated ${today()}*\n\n${strategy}`);

  // CSV export
  const csv = await ask(CSV_SYSTEM, `Convert this sequence to CSV:\n\n${sequence}`);
  writeOutput(`${outDir}/import-ready.csv`, csv);

  console.log(`\n✅  Done! Output in: output/${outDir}/\n`);
  console.log(`   sequence.md       — Full email sequence with body copy`);
  console.log(`   subject-lines.md  — A/B/C subject variants table`);
  console.log(`   strategy-notes.md — Send timing + segmentation guide`);
  console.log(`   import-ready.csv  — Paste directly into Smartlead/Apollo/Instantly\n`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
