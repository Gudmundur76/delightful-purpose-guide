const API = "https://grow.contact/api/public/v1/analyze";

function tone(n) {
  if (n >= 85) return "good";
  if (n >= 60) return "mid";
  return "bad";
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function getInstallId() {
  const { install_id } = await chrome.storage.local.get("install_id");
  if (install_id) return install_id;
  const id = crypto.randomUUID();
  await chrome.storage.local.set({ install_id: id });
  return id;
}

async function rateLimitOk() {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const { scan_log = [] } = await chrome.storage.local.get("scan_log");
  const recent = scan_log.filter((t) => t > hourAgo);
  if (recent.length >= 60) return false;
  recent.push(now);
  await chrome.storage.local.set({ scan_log: recent });
  return true;
}

function render(html) {
  document.getElementById("main").innerHTML = html;
}

function renderResult(url, r) {
  const overall = r.overall ?? r.score ?? 0;
  const sub = {
    Semantic: r.semantic ?? r.scores?.semantic,
    "JSON-LD": r.jsonld ?? r.scores?.jsonld,
    "llms.txt": r.llms ?? r.scores?.llms,
    Citability: r.citability ?? r.scores?.citability,
    Speed: r.speed ?? r.scores?.speed,
  };
  const fixes = (r.fixes || r.recommendations || []).slice(0, 3);
  const reportUrl = `https://grow.contact/check?url=${encodeURIComponent(url)}&auto=true`;
  const leaderboardUrl = `https://grow.contact/leaderboard?submit=${encodeURIComponent(new URL(url).hostname)}`;

  render(`
    <div class="score-wrap">
      <div class="score ${tone(overall)}">${overall}</div>
      <div class="of">/ 100</div>
    </div>
    <div class="subs">
      ${Object.entries(sub)
        .filter(([, v]) => typeof v === "number")
        .map(([k, v]) => `<div class="k">${k}</div><div class="v">${v}</div>`)
        .join("")}
    </div>
    ${
      fixes.length
        ? `<div class="fixes"><h2>Top fixes</h2><ul>${fixes
            .map((f) => `<li>${escapeHtml(typeof f === "string" ? f : f.title || f.message || "")}</li>`)
            .join("")}</ul></div>`
        : ""
    }
    <a class="cta" href="${reportUrl}" target="_blank" rel="noopener">Open full report</a>
    <a class="cta secondary" href="${leaderboardUrl}" target="_blank" rel="noopener">Add to leaderboard</a>
  `);
}

async function run() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab?.url;
    if (!url || !/^https?:/i.test(url)) {
      render(`<div class="err">This extension only scans http(s) pages.</div>`);
      return;
    }
    document.getElementById("url").textContent = new URL(url).hostname;

    if (!(await rateLimitOk())) {
      render(`<div class="err">Rate limit reached (60 scans/hour). Try again later.</div>`);
      return;
    }

    const installId = await getInstallId();
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Source": "chrome-extension",
        "X-Install-Id": installId,
      },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    renderResult(url, data);
  } catch (e) {
    render(`<div class="err">Scan failed: ${escapeHtml(e.message)}</div>`);
  }
}

run();
