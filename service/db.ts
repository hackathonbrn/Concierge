import Database from "bun:sqlite";

const db = new Database("guard.db");
db.run(`CREATE TABLE IF NOT EXISTS guard (
  id INTEGER PRIMARY KEY,
  prompt TEXT NOT NULL,
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
  db.run("INSERT INTO guard (prompt, plan) VALUES (?, ?)", [
    "deny access to unauthorized users",
    "Initial plan not generated",
  ]);
}

export { db };
