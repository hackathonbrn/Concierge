import { db } from "./db";
import { generateSecurityPlan } from "./llm";

export function adminPromptGet() {
  console.log("Plan requested!");
  const { prompt, plan } = db.query("SELECT prompt, plan FROM guard").get() as {
    prompt: string;
    plan: string;
  };

  return Response.json({ prompt, plan });
}

export async function adminPromptSet(prompt: string) {
  console.log("Generating plan for prompt:", prompt);
  const plan = await generateSecurityPlan(prompt);
  console.log("Generated plan:\n", plan);

  db.run("UPDATE guard SET prompt = ?, plan = ? WHERE id = 1", [prompt, plan]);

  return Response.json({ prompt, plan });
}
