import { adminPromptGet, adminPromptSet } from "./admin";
import { chatComplete, chatHistoryGet, chatMessagePost } from "./chat";
import { cors } from "./cors";
import { db } from "./db";

const CONFIG = {
  port: 3000,
  openRouterKey: process.env.OPEN_ROUTER_KEY!,
  adminToken: process.env.ADMIN_TOKEN!,
  reasoningModel: "qwen/qwen3-235b-a22b:free",
  conversationalModel: "qwen/qwen3-30b-a3b:free",
};

Bun.serve({
  port: CONFIG.port,
  idleTimeout: 255,
  async fetch(req) {
    if (req.method === "OPTIONS") {
      return cors(new Response(null));
    }

    const url = new URL(req.url);
    const ip =
      req.headers.get("TG-ID") ??
      this.requestIP(req)?.address.toString() ??
      "unknown";

    if (
      url.pathname.startsWith("/admin") &&
      req.headers.get("Authorization") !== `Bearer ${CONFIG.adminToken}`
    ) {
      return cors(new Response("Unauthorized", { status: 401 }));
    }

    const { access = 0 } = (db
      .query("SELECT access FROM access WHERE ip = ?")
      .get(ip) ?? {}) as {
      access?: number;
    };

    if (access === 3) {
      return cors(new Response("Access denied", { status: 403 }));
    }

    if (url.pathname === "/admin/prompt" && req.method === "GET") {
      return cors(adminPromptGet());
    }

    if (url.pathname === "/admin/prompt" && req.method === "POST") {
      const { criteria, topic, personality } = (await req.json()) as {
        criteria: string;
        topic?: string;
        personality?: string;
      };
      return cors(await adminPromptSet(criteria, topic, personality));
    }

    if (url.pathname === "/chat" && req.method === "POST") {
      const { message } = (await req.json()) as { message: string };
      return cors(await chatMessagePost(ip, message));
    }

    if (url.pathname === "/history" && req.method === "GET") {
      return cors(await chatHistoryGet(ip));
    }

    if (url.pathname === "/evaluate" && req.method === "GET") {
      if (access !== 1) {
        return cors(
          new Response("Too early to make decision", { status: 403 })
        );
      }

      return cors(await chatComplete(ip));
    }

    return cors(new Response("Not found", { status: 404 }));
  },
});

console.log(`Running server at http://localhost:${CONFIG.port}`);
