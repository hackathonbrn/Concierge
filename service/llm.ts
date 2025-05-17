import {
  evaluateEntry,
  evaluateSystem,
  planEntry,
  planSystem,
} from "./prompts";

type LLMResponse = {
  choices: [{ message: { content: string } }];
  message?: { content: string };
};

export type LLMHistory = {
  role: string;
  content: string;
}[];

export async function generateSecurityPlan(prompt: string) {
  const response = await fetch(process.env.LLM_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPEN_ROUTER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.REASONING_MODEL,
      stream: false,
      messages: [
        { role: "system", content: planSystem() },
        { role: "user", content: planEntry(prompt) },
      ],
      temperature: 0.1,
    }),
  });

  const data = (await response.json()) as LLMResponse;
  if (!data?.choices && !data?.message) {
    console.error(data);
    throw new Error("Invalid response");
  }
  return (data.choices?.[0].message.content ?? data.message?.content).replace(
    /^[\s\S]*<\/think>\s*/,
    ""
  );
}

export async function generateAgentResponse(history: LLMHistory) {
  const response = await fetch(process.env.LLM_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPEN_ROUTER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.CONVERSATIONAL_MODEL,
      messages: history,
      temperature: 0.7,
      stream: false,
      max_tokens: 1024,
    }),
  });

  const data = (await response.json()) as LLMResponse;
  if (!data?.choices && !data?.message) {
    console.error(data);
    throw new Error("Invalid response");
  }

  if (!(data.choices?.[0].message.content ?? data.message?.content).trim()) {
    console.dir(data, { depth: 8 });
  }

  console.log(data.message?.content);
  return (data.choices?.[0].message.content ?? data.message?.content)?.replace(
    /^[\s\S]*<\/think>\s*/,
    ""
  );
}

export async function evaluateAccess(
  prompt: string,
  plan: string,
  history: LLMHistory
) {
  const response = await fetch(process.env.LLM_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPEN_ROUTER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.REASONING_MODEL,
      stream: false,
      messages: [
        { role: "system", content: evaluateSystem(prompt, plan) },
        { role: "user", content: evaluateEntry(history) },
      ],
    }),
  });

  const data = (await response.json()) as LLMResponse;
  try {
    const result = JSON.parse(
      (data.choices?.[0].message.content ?? data.message?.content)
        .replace(/^[\s\S]*<\/think>\s*/, "")
        .trim()
    );
    return result as { access: boolean; reason: string };
  } catch (error) {
    console.error(data, { depth: 8 });
    throw new Error("Invalid response");
  }
}
