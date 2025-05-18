import { evaluateAccess, generateAgentResponse, type LLMHistory } from "./llm";
import { db } from "./db";
import { chatSystem } from "./prompts";
import { addIpToIptables } from "./iptables";

export async function chatMessagePost(ip: string, message: string) {
  const history = db
    .query("SELECT role, content FROM history WHERE ip = ?")
    .all(ip) as LLMHistory;

  if (!history.length) {
    return new Response("Request history first!", { status: 403 });
  }

  history.push({ role: "user", content: message });

  const agentResponse = await generateAgentResponse(history);
  db.run("INSERT INTO history (ip, role, content) VALUES (?, ?, ?)", [
    ip,
    "user",
    message,
  ]);
  db.run("INSERT INTO history (ip, role, content) VALUES (?, ?, ?)", [
    ip,
    "assistant",
    agentResponse.replaceAll(/\[end\]/gi, ""),
  ]);
  history.push({
    role: "assistant",
    content: agentResponse.replaceAll(/\[end\]/gi, ""),
  });
  console.log("AI responded:", agentResponse);

  if (agentResponse.match(/\[end\]/i)) {
    console.log("Stopping the convo.");
    db.run(
      "INSERT INTO access (ip, access) VALUES (?, ?) ON CONFLICT (ip) DO UPDATE SET access = ?",
      [ip, 1, 1]
    );

    return Response.json({
      response: agentResponse.replaceAll(/\[end\]/gi, ""),
      last: true,
    });
  }

  return Response.json({ response: agentResponse, last: false });
}

export async function chatHistoryGet(ip: string) {
  const history = db
    .query("SELECT role, content FROM history WHERE ip = ?")
    .all(ip) as LLMHistory;

  if (!history.length) {
    console.log("Generating history for new user...");

    const { plan, topic, personality } = db
      .query("SELECT plan, topic, personality FROM guard")
      .get() as {
      plan: string;
      topic: string;
      personality: string;
    };

    const systemPrompt = chatSystem(plan, topic, personality);

    db.run("INSERT INTO history (ip, role, content) VALUES (?, ?, ?)", [
      ip,
      "system",
      systemPrompt,
    ]);

    history.push({ role: "system", content: systemPrompt });

    const agentResponse = await generateAgentResponse(history);
    db.run("INSERT INTO history (ip, role, content) VALUES (?, ?, ?)", [
      ip,
      "assistant",
      agentResponse,
    ]);
    history.push({ role: "assistant", content: agentResponse });
  }

  return Response.json({ history: history.filter((h) => h.role !== "system") });
}

export async function chatComplete(ip: string) {
  console.log("Evaluating user...");
  const history = db
    .query("SELECT role, content FROM history WHERE ip = ?")
    .all(ip) as LLMHistory;

  const { criteria, topic, plan } = db
    .query("SELECT criteria, topic, plan FROM guard")
    .get() as {
    criteria: string;
    topic: string;
    plan: string;
  };

  const decision = await evaluateAccess(criteria, topic, plan, history);
  console.log("Decision made:", decision);

  if (decision.access) {
    await addIpToIptables(ip);
  }

  db.run(
    "INSERT INTO access (ip, access) VALUES (?, ?) ON CONFLICT (ip) DO UPDATE SET access = ?",
    [ip, decision.access ? 2 : 3, decision.access ? 2 : 3]
  );

  return Response.json({ decision });
}
