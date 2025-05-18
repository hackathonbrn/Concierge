import Database from "bun:sqlite";
import { defaultTopic, defaultPersonality } from "./prompts";

const db = new Database("guard.db");
db.run(`CREATE TABLE IF NOT EXISTS guard (
  id INTEGER PRIMARY KEY,
  criteria TEXT NOT NULL,
  topic TEXT NOT NULL,
  personality TEXT NOT NULL,
  plan TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS history (
  ip TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS access (
  ip TEXT NOT NULL PRIMARY KEY,
  access INTEGER NOT NULL
)`);

if (!db.query("SELECT 1 FROM guard").get()) {
  db.run(
    "INSERT INTO guard (criteria, topic, personality, plan) VALUES (?, ?, ?, ?)",
    ["пускай всех", defaultTopic(), defaultPersonality(), "план: импровизируй"]
  );
}

export { db };
