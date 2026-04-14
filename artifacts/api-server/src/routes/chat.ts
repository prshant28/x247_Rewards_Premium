import { Router } from "express";
import { openrouter } from "@workspace/integrations-openrouter-ai";
import { db } from "@workspace/db";
import { partnersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 10;
const MAX_MESSAGE_LENGTH = 500;
const MAX_MESSAGES = 20;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

const SYSTEM_PROMPT = `You are the X247 Rewards AI Assistant — a knowledgeable, friendly, and concise helper for the X247 Rewards giveaway platform.

## About X247 Rewards
X247 Rewards is an ultra-premium gamified giveaway and referral platform. Users register through partner links to earn daily prize draw entries. Each completed registration = one entry into the daily prize draw. More registrations = more entries = higher chances of winning.

## How It Works
1. Visit the Partners page to see all available partner registrations
2. Click on a partner card to view full details
3. Click "Register Now" to go to the partner's registration page
4. Complete the full registration form on the partner's website
5. IMPORTANT: After completing registration, users MUST take a screenshot of their completed registration as proof
6. Each completed registration earns one entry into the daily prize draw
7. The more partners you register with, the more entries you earn

## Important Rules
- Users must be 18+ to participate
- Screenshot proof of registration is REQUIRED — without it, entries may not be counted
- Each partner registration counts as one separate entry
- Some partners are marked as "Required" — these must be completed first
- Some partners have eligibility restrictions (e.g., "Students Only")

## Your Role
- Help users understand the platform and how to earn entries
- Provide details about specific partners when asked
- Guide users to the registration pages
- Answer questions about eligibility, rules, and rewards
- Always remind users about the screenshot requirement when discussing registration
- Be enthusiastic but professional
- Keep responses concise and helpful

## Response Format
When mentioning a partner, include a JSON block that the frontend will render as a card preview. Use this format:
\`\`\`partner-card
{"slug":"partner-slug","name":"Partner Name","tagline":"Tagline","category":"Category","badge":"Badge","badgeSecondary":"Second Badge","accent":"navy"}
\`\`\`

Always include the partner card when discussing a specific partner so users can easily navigate to it.

## Current Partners Data
{PARTNERS_DATA}
`;

async function getPartnersContext(): Promise<string> {
  try {
    const allPartners = await db.select().from(partnersTable).where(eq(partnersTable.isActive, true));
    if (allPartners.length === 0) return "No active partners currently available.";
    return allPartners.map(p => {
      const pts = p.entryPoints ?? 1;
      const benefit = `Benefit: Earn ${pts} prize draw ${pts === 1 ? "entry" : "entries"} after completing registration.`;
      return [
        `- ${p.name} (slug: ${p.slug}):`,
        `  Tagline: ${p.tagline || "No tagline"}.`,
        `  Category: ${p.category}.`,
        p.badge ? `  Badge: ${p.badge}.` : "",
        p.badgeSecondary ? `  Restriction: ${p.badgeSecondary}.` : "",
        p.isRequired ? `  REQUIRED — must be completed first.` : "",
        `  ${benefit}`,
        `  Registration URL: ${p.registrationUrl}`,
      ].filter(Boolean).join("\n");
    }).join("\n\n");
  } catch {
    return "Unable to fetch partner data.";
  }
}

router.post("/chat", async (req, res) => {
  try {
    const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
    if (!checkRateLimit(clientIp)) {
      res.status(429).json({ error: "Too many requests. Please wait a moment." });
      return;
    }

    const { messages, currentPage } = req.body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      currentPage?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Messages array is required" });
      return;
    }

    const validatedMessages = messages
      .slice(-MAX_MESSAGES)
      .filter(m => m.role === "user" || m.role === "assistant")
      .map(m => ({
        role: m.role,
        content: typeof m.content === "string" ? m.content.slice(0, MAX_MESSAGE_LENGTH) : "",
      }))
      .filter(m => m.content.length > 0);

    if (validatedMessages.length === 0) {
      res.status(400).json({ error: "No valid messages provided" });
      return;
    }

    const partnersContext = await getPartnersContext();
    const systemPrompt = SYSTEM_PROMPT.replace("{PARTNERS_DATA}", partnersContext);

    let contextualNote = "";
    if (currentPage) {
      contextualNote = `\n\nThe user is currently viewing: ${currentPage}. Tailor your response accordingly.`;
    }

    const chatMessages = [
      { role: "system" as const, content: systemPrompt + contextualNote },
      ...validatedMessages.slice(-10),
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openrouter.chat.completions.create({
      model: "openai/gpt-4o",
      max_tokens: 4096,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error("Chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to process chat request" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
      res.end();
    }
  }
});

export default router;
