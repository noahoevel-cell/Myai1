import "./style.css";

const state = {
  current: JSON.parse(localStorage.getItem("myai-current") || "[]"),
  model: localStorage.getItem("myai-model") || "@cf/meta/llama-3.1-8b-instruct",
  theme: localStorage.getItem("myai-theme") || "dark"
};

const root = document.querySelector("#root");

function save() {
  localStorage.setItem("myai-current", JSON.stringify(state.current));
  localStorage.setItem("myai-model", state.model);
  localStorage.setItem("myai-theme", state.theme);
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function render() {
  document.documentElement.dataset.theme = state.theme;

  const messages = state.current.length
    ? state.current.map(m => `
      <div class="msg ${m.role}">
        <div class="avatar">${m.role === "assistant" ? "✦" : "Du"}</div>
        <div class="bubble">${esc(m.content).replace(/\n/g, "<br>")}</div>
      </div>`).join("")
    : `
      <div class="welcome">
        <div class="welcome-icon">✦</div>
        <h1>Wie kann ich dir helfen?</h1>
        <p>Deine eigene KI-App auf Cloudflare.</p>
        <div class="cards">
          <button data-prompt="Erkläre mir ein Thema einfach und verständlich.">📚 Lernen</button>
          <button data-prompt="Hilf mir beim Programmieren und erkläre den Code.">💻 Coding</button>
          <button data-prompt="Schreibe einen kreativen Text für mich.">✍️ Schreiben</button>
          <button data-prompt="Fasse ein Thema übersichtlich zusammen.">🧠 Zusammenfassen</button>
        </div>
      </div>`;

  root.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand"><span class="logo">✦</span> MyAI</div>
        <button class="newchat" id="newChat">＋ Neuer Chat</button>
        <nav>
          <button class="nav active">💬 Chat</button>
          <button class="nav">📁 Projekte</button>
          <button class="nav">📄 Dateien</button>
          <button class="nav">🤖 Agents</button>
          <button class="nav">⌘ Coding</button>
          <button class="nav">🧠 Wissen</button>
          <button class="nav">🎨 Bilder</button>
          <button class="nav">🎙 Sprache</button>
        </nav>
        <div class="sidebar-bottom">
          <button class="nav" id="themeBtn">☾ Darstellung</button>
          <button class="nav">⚙ Einstellungen</button>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div class="mobile-brand">✦ MyAI</div>
          <div class="model-wrap">
            <span>Modell</span>
            <select id="model">
              <option value="@cf/meta/llama-3.1-8b-instruct">Llama 3.1 8B</option>
              <option value="@cf/meta/llama-3.2-3b-instruct">Llama 3.2 3B</option>
            </select>
          </div>
        </header>

        <section class="chat">${messages}</section>

        <form class="composer" id="form">
          <textarea id="input" rows="1" placeholder="Nachricht an MyAI …"></textarea>
          <button class="send" type="submit">➤</button>
        </form>
        <div class="hint">MyAI kann Fehler machen. Prüfe wichtige Informationen.</div>
      </main>
    </div>`;

  document.querySelector("#model").value = state.model;
  document.querySelector("#model").onchange = e => { state.model = e.target.value; save(); };
  document.querySelector("#newChat").onclick = () => { state.current = []; save(); render(); };
  document.querySelector("#themeBtn").onclick = () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    save(); render();
  };
  document.querySelectorAll("[data-prompt]").forEach(b => b.onclick = () => {
    document.querySelector("#input").value = b.dataset.prompt;
    document.querySelector("#input").focus();
  });
  document.querySelector("#form").onsubmit = send;
  document.querySelector("#input").onkeydown = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e); }
  };
}

async function send(e) {
  e.preventDefault();
  const input = document.querySelector("#input");
  const text = input.value.trim();
  if (!text) return;

  state.current.push({role:"user", content:text});
  input.value = "";
  state.current.push({role:"assistant", content:"Denke nach …"});
  save();
  render();

  try {
    const res = await fetch("/api/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        messages: state.current.slice(0, -1),
        model: state.model
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unbekannter Fehler");
    state.current[state.current.length - 1].content = String(data.response ?? "Keine Antwort erhalten.");
  } catch (err) {
    state.current[state.current.length - 1].content = "Fehler: " + err.message;
  }
  save();
  render();
}

render();