// Drop-in JS loader for the Grow Agent Readability badge.
// Usage on client site:
//   <script src="https://citation.is/api/public/widget/embed.js" async></script>
//   <div data-grow-badge="acme.ai"></div>
//
// The script finds all [data-grow-badge] elements and injects an <img>
// pointing at the SVG endpoint with the host.
import { createFileRoute } from "@tanstack/react-router";

const JS = `(function(){
  var ORIGIN = "https://citation.is";
  function mount(el){
    if (el.dataset.growMounted) return;
    var host = (el.getAttribute("data-grow-badge") || location.hostname).trim();
    if (!host) return;
    el.dataset.growMounted = "1";
    var img = document.createElement("img");
    img.src = ORIGIN + "/api/public/widget/badge.svg?url=" + encodeURIComponent(host);
    img.alt = "Agent Readability Score by Grow";
    img.width = 240; img.height = 72;
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.loading = "lazy";
    img.decoding = "async";
    var a = document.createElement("a");
    a.href = ORIGIN + "/check?u=" + encodeURIComponent(host);
    a.target = "_blank"; a.rel = "noopener";
    a.style.display = "inline-block";
    a.style.lineHeight = "0";
    a.appendChild(img);
    el.innerHTML = "";
    el.appendChild(a);
  }
  function run(){
    var nodes = document.querySelectorAll("[data-grow-badge]");
    for (var i=0;i<nodes.length;i++) mount(nodes[i]);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else { run(); }
})();`;

export const Route = createFileRoute("/api/public/widget/embed.js")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(JS, {
          status: 200,
          headers: {
            "Content-Type": "application/javascript; charset=utf-8",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
