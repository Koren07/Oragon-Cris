#!/usr/bin/env ts-node
/**
 * lead-brief-generator.ts
 * Generates ICP profiles, prospecting guides, and outreach angles.
 * Does NOT scrape anything — produces briefs a human uses to prospect manually.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... ts-node lead-brief-generator.ts --segment="iPhone resellers CABA"
 *   ANTHROPIC_API_KEY=sk-... ts-node lead-brief-generator.ts --segment="accesorios Apple GBA"
 */
import { ask, brandContext, writeOutput, today, arg } from "./utils/claude";

const segment = arg("segment", "resellers Apple Argentina");
const outDir  = `leads/${today()}_${segment.replace(/\s+/g, "-").toLowerCase()}`;

const SYSTEM = `
You are Oragon's growth strategist and market researcher for the Argentine Apple
reseller market. You produce detailed, actionable prospecting guides.

${brandContext()}
`;

async function main() {
  console.log(`\n🎯  Generating lead brief for segment: "${segment}"\n`);

  // ICP profile
  const icp = await ask(SYSTEM, `
Create a detailed Ideal Customer Profile (ICP) for the segment: "${segment}".

Include:
## Firmographics
- Business type, size (employees, locations), revenue range (ARS estimate)
- Channels they sell through (WhatsApp, Instagram, MercadoLibre, physical store, etc.)
- Typical tech stack they use today (Excel, Google Sheets, WhatsApp Business, etc.)

## Psychographics
- What keeps them up at night (top 3 fears/frustrations)
- What success looks like to them
- How they make buying decisions (impulse vs. committee, ROI-driven vs. peer-influenced)

## Readiness Signals (how to spot a hot prospect)
- Signs they're feeling the pain Oragon solves
- Behaviors that indicate they're actively looking for a solution
- LinkedIn/Instagram signals to watch for

## Disqualifiers (who NOT to target)
- Red flags that indicate bad fit
`);

  writeOutput(`${outDir}/icp.md`, `# Ideal Customer Profile — ${segment}\n*Generated ${today()}*\n\n${icp}`);

  // Prospecting guide
  const prospecting = await ask(SYSTEM, `
Create a step-by-step prospecting guide for finding "${segment}" leads in Argentina.
This is for a human to execute manually — no scraping tools, just search instructions.

## LinkedIn
- Exact search filters to use (job title, industry, location, company size)
- Example search URL structure
- What to look for on their profile to qualify

## Instagram
- Specific hashtags to search (in Spanish, Argentina-specific)
- What kind of account to follow/engage with
- How to identify decision-makers vs. employees

## MercadoLibre
- Search terms to find active resellers
- How to identify high-volume sellers (rating, reviews, listing volume)
- How to find their contact info (many link to WhatsApp or website)

## Google Maps
- Search terms + location filters
- What business categories to look for
- How to find contact details from a Maps listing

## WhatsApp Groups / Communities
- Types of groups where Apple resellers hang out in Argentina
- How to find and join them ethically
- How to engage (NOT spam — be helpful first)

## Qualification Script
Short 3-question mental checklist: before reaching out, confirm they are a fit.
`);

  writeOutput(`${outDir}/prospecting-guide.md`, `# Prospecting Guide — ${segment}\n*Generated ${today()}*\n\n${prospecting}`);

  // Outreach angles
  const outreach = await ask(SYSTEM, `
Write 3 hyper-personalized first-message templates for reaching out to "${segment}".
These are for the FIRST touch — could be WhatsApp cold message, LinkedIn DM, or email opener.

For each template:
- **Context:** When to use this one
- **Message:** Full text (under 150 words, voseo, no pitch in first message)
- **Goal:** What you want them to do (reply, click, take a call)
- **Follow-up:** What to say if no reply after 3 days

Make each one genuinely different in approach:
1. The "I noticed something specific about you" approach
2. The "Peer referral / social proof" approach
3. The "Provocative question" approach
`);

  writeOutput(`${outDir}/outreach-angles.md`, `# Outreach Angles — ${segment}\n*Generated ${today()}*\n\n${outreach}`);

  // Qualification questions
  const qualification = await ask(SYSTEM, `
Write a qualification framework for "${segment}" prospects.

## Discovery Questions (ask in first real conversation)
5 questions that reveal if they're a good fit for Oragon. Each question should uncover:
- Pain level (do they feel the problem?)
- Readiness (are they actively looking to solve it?)
- Authority (are they the decision-maker?)
- Budget (can they afford it?)
- Timeline (do they need it now?)

## Scoring Guide
How to score their answers 1-3:
- 1 = Not ready (nurture)
- 2 = Warm (keep in sequence)
- 3 = Hot (push for demo)

## Objection Handling
Top 5 objections from this segment + how to handle each one.
`);

  writeOutput(`${outDir}/qualification.md`, `# Qualification Framework — ${segment}\n*Generated ${today()}*\n\n${qualification}`);

  console.log(`\n✅  Done! Output in: output/${outDir}/\n`);
  console.log(`   icp.md               — Ideal customer profile`);
  console.log(`   prospecting-guide.md — Where + how to find them manually`);
  console.log(`   outreach-angles.md   — 3 first-message templates`);
  console.log(`   qualification.md     — Discovery questions + scoring\n`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
