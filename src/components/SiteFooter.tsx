import { Link } from "@tanstack/react-router";
import { openCookieSettings } from "@/components/CookieConsent";
import { SourceSyncIndicator } from "@/components/SourceSyncIndicator";


export function SiteFooter() {
  return (
    <footer className="border-t border-border py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">// Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/check" className="hover:text-foreground transition-colors">Free Scanner</Link></li>
              <li><Link to="/playground" className="hover:text-foreground transition-colors">Playground</Link></li>
              <li><Link to="/tools/robots-checker" className="hover:text-foreground transition-colors">robots.txt Checker</Link></li>
              <li><Link to="/extension" className="hover:text-foreground transition-colors">Browser Extension</Link></li>
              <li><Link to="/cli" className="hover:text-foreground transition-colors">CLI</Link></li>
              <li><Link to="/mcp-server" className="hover:text-foreground transition-colors">MCP Server</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">// Standard & Docs</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/standard" className="hover:text-foreground transition-colors">The Standard</Link></li>
              <li><Link to="/playbooks" className="hover:text-foreground transition-colors">Playbooks</Link></li>
              <li><Link to="/glossary" className="hover:text-foreground transition-colors">Glossary</Link></li>
              <li><Link to="/crawlers" className="hover:text-foreground transition-colors">AI Crawlers</Link></li>
              <li><Link to="/compare" className="hover:text-foreground transition-colors">Compare Engines</Link></li>
              <li><Link to="/v-score" className="hover:text-foreground transition-colors">V-Score Method</Link></li>
              <li><Link to="/api-docs" className="hover:text-foreground transition-colors">API Docs</Link></li>
              <li><a href="/llms.txt" className="hover:text-foreground transition-colors">llms.txt</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">// Data</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link></li>
              <li><Link to="/stats" className="hover:text-foreground transition-colors">State of the Web</Link></li>
              <li><Link to="/report/q2-2026" className="hover:text-foreground transition-colors">Q2 2026 Report</Link></li>
              <li><Link to="/data-drops" className="hover:text-foreground transition-colors">Data Drops</Link></li>
              <li><Link to="/blog" className="hover:text-foreground transition-colors">Journal</Link></li>
              <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link to="/status" className="hover:text-foreground transition-colors">Status</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">// Readiness</h3>
            <pre className="font-mono text-[11px] leading-relaxed bg-card border border-border rounded-md p-3 text-emerald-400 overflow-x-auto">
<span className="text-muted-foreground">user@grow:~$</span> curl /api/readiness
{`{"status":"agent-ready","score":100}`}<span className="inline-block w-2 h-3 bg-emerald-400 ml-1 align-middle animate-[blink_1s_steps(2,start)_infinite]" />
            </pre>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Free. Open. No account required.
            </p>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          <button
            type="button"
            onClick={openCookieSettings}
            className="hover:text-foreground transition-colors uppercase tracking-widest"
          >
            Cookie settings
          </button>
        </div>
        <div className="mt-6 pt-6 border-t border-border flex flex-col md:flex-row gap-4 md:items-center md:justify-between font-mono text-[10px] text-muted-foreground uppercase">
          <span>&copy; 2026 grow.contact — free & open infrastructure</span>
          <div className="flex flex-wrap gap-2 items-center">
            <SourceSyncIndicator />
          </div>
          <span>Every tool on this site is free forever</span>
        </div>

      </div>
    </footer>
  );
}
