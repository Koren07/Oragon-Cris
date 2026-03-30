#!/usr/bin/env ts-node
/**
 * compliance-checker.ts
 * Validates any piece of copy against Oragon brand voice guidelines.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... ts-node compliance-checker.ts --file=../output/email/sequence.md
 */
import * as fs from "fs";
import * as path from "path";
import { ask, brandContext, arg } from "./utils/claude";

const SYSTEM = `
You are Oragon's brand compliance officer. Your job is to evaluate marketing copy
strictly against the brand guidelines provided below.

${brandContext()}

## Your evaluation criteria (check every single one):

1. **Language** — Uses Argentine Spanish correctly? Uses "vos/voseo" forms (e.g., "Empezá", "Tenés", "Vendés") — NOT tuteo ("Empieza", "Tienes").
2. **Tone** — Confident, direct, energetic. NOT corporate, formal, or passive.
3. **Sentence length** — Short sentences. Long, complex sentences are a fail.
4. **Fluff** — No filler phrases ("En el mundo actual...", "En este día y era...", "Como todos sabemos..."). Gets straight to value.
5. **Pain-point alignment** — References real reseller pains (stock chaos, manual pricing, missing sales while sleeping).
6. **CTA strength** — Has a clear, action-oriented call to action.
7. **Brand voice keywords** — Uses any of: "dormís", "vendés", "mientras dormís", "en tiempo real", "sin levantar un dedo", "tu agente de IA", or equivalent brand-voice language.
8. **No forbidden patterns** — Does NOT use: tuteo, overly generic claims, competitor mentions, or claims that can't be verified.

## Output format (always use exactly this structure):

### Compliance Report

**Overall:** PASS ✅ | FAIL ❌ | NEEDS WORK ⚠️
**Tone Score:** X/10

#### Checklist
| # | Rule | Status | Note |
|---|------|--------|------|
| 1 | Language (voseo) | ✅/❌ | ... |
| 2 | Tone | ✅/❌ | ... |
| 3 | Sentence length | ✅/❌ | ... |
| 4 | No fluff | ✅/❌ | ... |
| 5 | Pain-point alignment | ✅/❌ | ... |
| 6 | CTA strength | ✅/❌ | ... |
| 7 | Brand voice keywords | ✅/❌ | ... |
| 8 | No forbidden patterns | ✅/❌ | ... |

#### Issues Found
(List each problem with a specific quote from the text and a suggested fix)

#### Suggested Improvements
(Rewrite any failing sections in the correct brand voice)
`;

async function main() {
  const filePath = arg("file");
  if (!filePath) {
    console.error("Usage: ts-node compliance-checker.ts --file=path/to/copy.md");
    process.exit(1);
  }

  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(absPath, "utf8");
  console.log(`\n🔍  Checking: ${absPath}\n`);

  const report = await ask(SYSTEM, `Please evaluate this marketing copy:\n\n---\n${content}\n---`);

  // Print to console
  console.log(report);

  // Save next to the input file
  const reportPath = absPath.replace(/\.[^.]+$/, "-compliance-report.md");
  fs.writeFileSync(reportPath, `# Compliance Report\n*Generated ${new Date().toISOString()}*\n*File: ${filePath}*\n\n${report}`, "utf8");
  console.log(`\n📄  Report saved: ${reportPath}\n`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
