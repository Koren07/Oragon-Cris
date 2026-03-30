#!/usr/bin/env ts-node
/**
 * whatsapp-copywriter.ts
 * Generates WhatsApp broadcast templates, chatbot flows, and quick replies.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... ts-node whatsapp-copywriter.ts --goal="nuevo-stock"
 *   ANTHROPIC_API_KEY=sk-... ts-node whatsapp-copywriter.ts --goal="chatbot-faq"
 *   ANTHROPIC_API_KEY=sk-... ts-node whatsapp-copywriter.ts --goal="seguimiento-lead"
 *
 * Goals: nuevo-stock | precio-actualizado | chatbot-faq | seguimiento-lead | reserva-confirmada | all
 */
import { ask, brandContext, writeOutput, today, arg } from "./utils/claude";

const goal   = arg("goal",   "all");
const outDir = `whatsapp/${today()}_${goal.replace(/\s+/g, "-")}`;

const SYSTEM = `
You are Oragon's WhatsApp marketing strategist. You write Meta-compliant broadcast
templates and chatbot conversation flows for an Apple reseller SaaS company in Argentina.

${brandContext()}

## WhatsApp Rules
- Broadcast templates must be pre-approved by Meta — keep them non-promotional in first message
- Templates must include: category, header (optional), body, footer (optional), buttons (optional)
- NO spam language: no "GRATIS", no excessive caps, no "URGENTE!!!"
- Body max 1024 characters
- Buttons: max 3 (Quick Reply or Call-to-Action)
- All text in Argentine Spanish with voseo
- Always include opt-out: "Respondé STOP para dejar de recibir mensajes"

## Template Categories (Meta)
- MARKETING: Promotional content (requires higher approval bar)
- UTILITY: Transactional / service updates (easier approval)
- AUTHENTICATION: OTP/verification only
`;

const GOALS = {
  "nuevo-stock": `
Generate a WhatsApp broadcast template for announcing new stock arrival.
Category: UTILITY (frame as a service update, not a promotion).

Include:
1. Template spec (category, header, body, footer, buttons)
2. 3 variants of the body text (different hooks/tones)
3. Compliance notes: what to avoid to get Meta approval
4. Best send time for Argentine resellers
`,
  "precio-actualizado": `
Generate a WhatsApp broadcast template for a price update (USD rate change).
Category: UTILITY.

Include:
1. Template spec
2. 2 body variants (urgent tone vs. informational tone)
3. How to personalize with {{product_name}} and {{new_price}} variables
4. Compliance notes
`,
  "chatbot-faq": `
Generate a complete WhatsApp chatbot conversation flow for Oragon's AI sales agent.
This handles inbound messages from potential buyers.

Include:
1. Welcome message (when unknown number messages first)
2. Intent detection: map common messages to intents
   - Stock inquiry: "¿Tienen iPhone 15?" → stock check response
   - Price inquiry: "¿Cuánto sale el MacBook?" → pricing response
   - Reservation: "Quiero reservar uno" → reservation flow
   - Out of hours: bot covers this 24/7
3. Decision tree (text format): customer says X → bot replies Y → next step Z
4. Fallback: when to escalate to human
5. Closing messages that confirm action taken

Format decision tree as: [INTENT] → [BOT RESPONSE] → [NEXT NODE]
`,
  "seguimiento-lead": `
Generate a 3-message WhatsApp follow-up sequence for a lead who showed interest
but didn't close (e.g., asked about pricing, visited the site).

Message 1 (same day): Soft check-in, not pushy
Message 2 (Day 2): Social proof nudge
Message 3 (Day 5): Final low-pressure attempt

Include timing, tone notes, and when to stop.
`,
  "reserva-confirmada": `
Generate a UTILITY template for confirming a product reservation.
Include: product name variable, pickup/delivery info, payment link placeholder, and a clear next-step CTA.
`,
};

async function generateGoal(g: string, prompt: string) {
  const result = await ask(SYSTEM, prompt);
  return `## ${g.toUpperCase()}\n\n${result}`;
}

async function main() {
  console.log(`\n💬  Generating WhatsApp copy for goal: "${goal}"\n`);

  const targetGoals = goal === "all"
    ? Object.entries(GOALS)
    : [[goal, GOALS[goal as keyof typeof GOALS]]].filter(([, v]) => v) as [string, string][];

  if (targetGoals.length === 0) {
    console.error(`Unknown goal: ${goal}. Use: ${Object.keys(GOALS).join(" | ")} | all`);
    process.exit(1);
  }

  const sections: string[] = [];
  for (const [g, prompt] of targetGoals) {
    console.log(`  Generating ${g}...`);
    sections.push(await generateGoal(g, prompt));
  }

  const allContent = sections.join("\n\n---\n\n");
  writeOutput(`${outDir}/templates.md`, `# WhatsApp Templates — ${goal}\n*Generated ${today()}*\n\n${allContent}`);

  // Compliance checklist
  const compliance = await ask(
    `You are a WhatsApp Business API compliance expert.
Generate a compliance checklist for WhatsApp marketing in Argentina.
Cover: Meta template approval requirements, Argentina Law 25.326 data protection,
opt-in collection best practices, and what will get an account banned.
Format as a markdown checklist with ✅ DO and ❌ DON'T sections.`,
    "Generate the compliance checklist for Oragon's WhatsApp marketing."
  );

  writeOutput(`${outDir}/compliance-notes.md`, `# WhatsApp Compliance Notes\n*Generated ${today()}*\n\n${compliance}`);

  // Quick replies
  const quickReplies = await ask(
    SYSTEM,
    `Generate 20 pre-written quick replies for the most common customer questions
an Apple reseller's AI agent would receive on WhatsApp.
Categorize by: Stock | Pricing | Payment | Warranty | Reservation | Complaints
Format as: **[Category]** "Customer message pattern" → "Bot response"`
  );

  writeOutput(`${outDir}/quick-replies.md`, `# Quick Replies Library\n*Generated ${today()}*\n\n${quickReplies}`);

  console.log(`\n✅  Done! Output in: output/${outDir}/\n`);
  console.log(`   templates.md       — Broadcast templates + chatbot flows`);
  console.log(`   compliance-notes.md — What to do/avoid for Meta approval`);
  console.log(`   quick-replies.md   — 20 pre-written bot responses\n`);
  console.log(`Next: paste templates into WATI, Twilio, or 360dialog for Meta submission.\n`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
