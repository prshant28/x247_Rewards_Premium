import OpenAI from "openai";

const baseURL =
  process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL ||
  "https://openrouter.ai/api/v1";

const apiKey =
  process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY ||
  process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error(
    "No OpenRouter API key found. Set OPENROUTER_API_KEY in your .env file. " +
    "Get a free key at https://openrouter.ai"
  );
}

export const openrouter = new OpenAI({
  baseURL,
  apiKey,
});
