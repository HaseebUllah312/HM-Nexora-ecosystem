
function nxText(el) {
  return (el?.innerText || el?.textContent || "").replace(/\s+/g, " ").trim();
}

function nxCourseCodeFromText(text) {
  const m = String(text || "").toUpperCase().match(/\b[A-Z]{2,5}\d{3}[A-Z]?\b/);
  return m ? m[0] : null;
}

function nxUniqueId(prefix="nx") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
}

function nxToast(message, type="info") {
  let host = document.getElementById("nx-toast-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "nx-toast-host";
    document.documentElement.appendChild(host);
  }
  const el = document.createElement("div");
  el.className = `nx-toast nx-${type}`;
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => el.classList.add("show"), 10);
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 250);
  }, 3200);
}

async function nxGetSettings() {
  const stored = await chrome.storage.local.get({
    theme: "system",
    accent: "#5b4bdb",
    backgroundImage: "",
    backgroundOpacity: 0.12,
    nexoraToken: "",
    aiEndpoint: "",
    apiEndpoint: "https://nexora-api.haseebsaleem312.workers.dev",
    nxSettings: {}
  });
  const nx = stored.nxSettings || {};
  return {
    ...stored,
    ...nx
  };
}

async function nxApi(path, options={}) {
  const s = await nxGetSettings();
  const base = (s.apiEndpoint || NEXORA.apiBase).replace(/\/$/, "");
  if (!base || base.includes("example.com")) {
    throw new Error("Nexora backend endpoint is not configured.");
  }
  const headers = Object.assign({"Content-Type":"application/json"}, options.headers || {});
  if (s.nexoraToken) headers.Authorization = `Bearer ${s.nexoraToken}`;
  const res = await fetch(base + path, {...options, headers});
  if (!res.ok) throw new Error(`API ${res.status}`);
  return await res.json();
}

async function nxCallAI(payload) {
  const s = await nxGetSettings();
  const base = String(s.apiEndpoint || NEXORA.apiBase || "").replace(/\/$/, "");
  let endpoint = String(s.aiEndpoint || "").trim();
  // aiEndpoint is an optional gateway URL, never a provider API key.
  if (endpoint && !/^https?:\/\//i.test(endpoint)) endpoint = "";
  if (!endpoint) endpoint = base ? `${base}/api/v1/ai` : "";
  else if (!/\/api\/v1\/ai(?:\/ask)?$/i.test(endpoint) && !/\/ai$/i.test(endpoint)) endpoint = endpoint.replace(/\/$/, "") + "/api/v1/ai";
  if (!endpoint) throw new Error("HM Nexora AI gateway is not configured.");

  const p = { ...(payload || {}) };
  if (!p.question && p.prompt) p.question = p.prompt;
  if (!Array.isArray(p.options) || p.options.length < 2) {
    p.options = ["Detailed Academic Guidance", "General Discussion"];
  }
  if (!p.mode) p.mode = "mentor";

  let res;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {"Content-Type":"application/json", "Accept":"application/json"},
      body: JSON.stringify(p)
    });
  } catch (e) {
    throw new Error(`Could not reach HM Nexora AI gateway: ${e?.message || "network error"}`);
  }

  const raw = await res.text();
  let data = {};
  try { data = JSON.parse(raw); } catch (_) { data = { raw_text: raw }; }
  if (!res.ok || data?.ok === false) {
    throw new Error(data?.error || data?.detail || `AI gateway returned ${res.status}`);
  }
  return data?.result ?? data;
}
