/**
 * AI learning assistant — talks to a real LLM.
 * Provider is chosen with AI_PROVIDER (gemini | openai | anthropic).
 * Uses the global fetch available in Node 18+ (no extra deps).
 */

const SYSTEM_PROMPT = `You are "Skilly", the friendly AI learning assistant for SkillSwap — a community Time Bank where people trade skills using time-credits instead of money (1 credit = 1 hour of teaching/learning).

Your job:
- Help members decide what to learn or teach, and design short, practical learning paths.
- Explain how the Time Bank works: you earn credits by teaching, and spend them to learn. New members get a small signup bonus.
- Suggest what skills a member could offer based on their background, and how to write a good skill listing.
- Encourage a warm, supportive, community-first tone. Be concise and use short paragraphs or bullet points.
- If asked something unrelated to skills, learning, or the platform, gently steer back.
Never invent account balances or user data that isn't given to you in the context.`;

function buildContextBlock(context = {}) {
  const parts = [];
  if (context.userName) parts.push(`Member name: ${context.userName}`);
  if (typeof context.credits === 'number') parts.push(`Current credit balance: ${context.credits}`);
  if (context.mySkills?.length) parts.push(`Skills they teach: ${context.mySkills.join(', ')}`);
  if (context.interests?.length) parts.push(`Their interests: ${context.interests.join(', ')}`);
  if (context.popularSkills?.length)
    parts.push(`Popular skills on the platform right now: ${context.popularSkills.join(', ')}`);
  if (!parts.length) return '';
  return `\n\n[Context about the member you are helping]\n${parts.join('\n')}`;
}

export function getProviderInfo() {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const keyMap = {
    gemini: process.env.GEMINI_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
  };
  return { provider, configured: Boolean(keyMap[provider]) };
}

/**
 * @param {Array<{role:'user'|'assistant',content:string}>} history
 * @param {string} userMessage
 * @param {object} context
 * @returns {Promise<string>} assistant reply
 */
export async function generateReply(history, userMessage, context = {}) {
  const { provider, configured } = getProviderInfo();
  if (!configured) {
    const err = new Error(
      `AI assistant is not configured. Set AI_PROVIDER and the matching API key (e.g. GEMINI_API_KEY) in server/.env`
    );
    err.status = 503;
    throw err;
  }

  const system = SYSTEM_PROMPT + buildContextBlock(context);
  const trimmedHistory = (history || []).slice(-10);

  switch (provider) {
    case 'openai':
      return callOpenAI(system, trimmedHistory, userMessage);
    case 'anthropic':
      return callAnthropic(system, trimmedHistory, userMessage);
    case 'gemini':
    default:
      return callGemini(system, trimmedHistory, userMessage);
  }
}

/* -------------------------------- Gemini -------------------------------- */
async function callGemini(system, history, userMessage) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const contents = [
    ...history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
    }),
  });

  if (!res.ok) throw await providerError('Gemini', res);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  return text.trim() || "I'm not sure how to answer that — could you rephrase?";
}

/* -------------------------------- OpenAI -------------------------------- */
async function callOpenAI(system, history, userMessage) {
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 800,
      messages: [
        { role: 'system', content: system },
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!res.ok) throw await providerError('OpenAI', res);
  const data = await res.json();
  return (data?.choices?.[0]?.message?.content || '').trim();
}

/* ------------------------------ Anthropic ------------------------------ */
async function callAnthropic(system, history, userMessage) {
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 800,
      system,
      messages: [
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!res.ok) throw await providerError('Anthropic', res);
  const data = await res.json();
  return (data?.content?.[0]?.text || '').trim();
}

async function providerError(name, res) {
  let detail = '';
  try {
    detail = JSON.stringify(await res.json());
  } catch {
    detail = await res.text();
  }
  const err = new Error(`${name} API error (${res.status}): ${detail.slice(0, 300)}`);
  err.status = 502;
  return err;
}
