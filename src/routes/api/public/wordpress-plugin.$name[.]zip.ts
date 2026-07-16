// GET /api/public/wordpress-plugin/{name}.zip
// Freely available WordPress plugin downloads — no token, no auth.
// name = "grow-auto-fix" | "grow-mcp" | "bundle"
import { createFileRoute } from "@tanstack/react-router";
import { zipSync, strToU8 } from "fflate";
import autoFixPhp from "../../../../wp-plugin/grow-auto-fix/grow-auto-fix.php?raw";
import autoFixReadme from "../../../../wp-plugin/grow-auto-fix/readme.txt?raw";
import mcpPhp from "../../../../wp-plugin/grow-mcp/grow-mcp.php?raw";
import mcpReadme from "../../../../wp-plugin/grow-mcp/readme.txt?raw";

export const Route = createFileRoute("/api/public/wordpress-plugin/$name.zip")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = params.name;
        const name = raw.endsWith(".zip") ? raw.slice(0, -4) : raw;
        let files: Record<string, Uint8Array>;
        let filename: string;
        switch (name) {
          case "grow-auto-fix":
            files = {
              "grow-auto-fix/grow-auto-fix.php": strToU8(autoFixPhp),
              "grow-auto-fix/readme.txt": strToU8(autoFixReadme),
            };
            filename = "grow-auto-fix.zip";
            break;
          case "grow-mcp":
            files = {
              "grow-mcp/grow-mcp.php": strToU8(mcpPhp),
              "grow-mcp/readme.txt": strToU8(mcpReadme),
            };
            filename = "grow-mcp.zip";
            break;
          case "bundle":
            files = {
              "grow-auto-fix/grow-auto-fix.php": strToU8(autoFixPhp),
              "grow-auto-fix/readme.txt": strToU8(autoFixReadme),
              "grow-mcp/grow-mcp.php": strToU8(mcpPhp),
              "grow-mcp/readme.txt": strToU8(mcpReadme),
            };
            filename = "grow-contact-wordpress-plugins.zip";
            break;
          default:
            return new Response("Unknown plugin. Use grow-auto-fix, grow-mcp, or bundle.", { status: 404 });
        }
        const zip = zipSync(files, { level: 6 });
        return new Response(zip, {
          status: 200,
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
