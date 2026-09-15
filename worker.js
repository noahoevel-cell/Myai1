const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct";

function headers(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {"Content-Type": "application/json; charset=utf-8", ...headers(origin)}
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "*";

    if (request.method === "OPTIONS") {
      return new Response(null, {headers: headers(origin)});
    }

    if (url.pathname === "/api/health") {
      return json({ok: true, aiBinding: Boolean(env.AI)}, 200, origin);
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      if (!env.AI) {
        return json({error: "Workers AI binding fehlt. Bitte die AI-Bindung aktivieren."}, 500, origin);
      }

      try {
        const body = await request.json();
        const messages = Array.isArray(body.messages) ? body.messages : [];
        const model = typeof body.model === "string" && body.model ? body.model : DEFAULT_MODEL;

        const safeMessages = messages.slice(-20).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content || "").slice(0, 12000)
        }));

        const result = await env.AI.run(model, {
          messages: [
            {
              role: "system",
              content: "Du bist MyAI, ein hilfreicher und freundlicher KI-Assistent. Antworte auf Deutsch, wenn der Nutzer Deutsch schreibt."
            },
            ...safeMessages
          ]
        });

        return json({
          ok: true,
          model,
          response: result?.response ?? result?.result?.response ?? result
        }, 200, origin);
      } catch (error) {
        return json({error: error?.message || "AI-Anfrage fehlgeschlagen."}, 500, origin);
      }
    }

    return env.ASSETS.fetch(request);
  }
};