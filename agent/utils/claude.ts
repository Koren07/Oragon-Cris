/**
 * Shared Claude API client + context loader for all Oragon agents.
 */
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load .env from agents/ directory
dotenv.config({ path: path.join(__dirname, "../.env") });

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CTX = path.join(__dirname, "../../context");

function read(file: string): string {
  const p = path.join(CTX, file);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

/** Full brand context injected into every agent prompt */
export function brandContext(): string {
  return [
    "# Brand Context\n" + read("brand-context.md"),
    "# Brand Voice\n" + read("brand-voice.md"),
    "# Growth Marketing Angles\n" + read("growth-marketing.md"),
    "# Product Offering\n" + read("product-offering.md"),
    "# Buyer Personas\n" + read("personas.md"),
  ].join("\n\n---\n\n");
}

/** Ask Claude and return the full text response */
export async function ask(system: string, user: string, model = "claude-opus-4-6"): Promise<string> {
  const msg = await claude.messages.create({
    model,
    max_tokens: 8096,
    system,
    messages: [{ role: "user", content: user }],
  });
  return (msg.content[0] as { text: string }).text;
}

/** Ensure output directory exists and write a file */
export function writeOutput(relPath: string, content: string): void {
  const abs = path.join(__dirname, "../../output", relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
  console.log(`  ✅  ${relPath}`);
}

/** Today's date as YYYY-MM-DD */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Parse CLI args: --key=value or --key value */
export function arg(name: string, fallback = ""): string {
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === `--${name}` && argv[i + 1]) return argv[i + 1];
    const match = argv[i].match(new RegExp(`^--${name}=(.+)$`));
    if (match) return match[1];
  }
  return fallback;
}
