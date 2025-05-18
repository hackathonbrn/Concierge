import { db } from "./db";
import { generateSecurityPlan } from "./llm";
import { defaultPersonality, defaultTopic } from "./prompts";

export function adminPromptGet() {
  console.log("Plan requested!");
  const { criteria, topic, personality, plan } = db
    .query("SELECT criteria, topic, personality, plan FROM guard")
    .get() as {
    personality: string;
    criteria: string;
    topic: string;
    plan: string;
  };

  return Response.json({ criteria, topic, personality, plan });
}

export async function adminPromptSet(
  criteria: string,
  topic = defaultTopic(),
  personality = defaultPersonality()
) {
  console.log("Generating plan for prompt:", criteria);
  const plan = await generateSecurityPlan(criteria, topic, personality);
  console.log("Generated plan:\n", plan);

  db.run(
    "UPDATE guard SET criteria = ?, topic = ?, personality = ?, plan = ? WHERE id = 1",
    [criteria, topic, personality, plan]
  );

  return Response.json({ criteria, topic, personality, plan });
}
