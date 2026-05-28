// Web Bot Auth — HTTP Message Signatures Key Directory
// https://datatracker.ietf.org/wg/webbotauth/about/
// https://developers.cloudflare.com/bots/reference/bot-verification/web-bot-auth/
//
// Published as a JWKS so receiving sites can verify signed requests originating
// from grow.contact. The directory is intentionally empty today — grow.contact
// does not currently sign outbound bot requests. Keys (Ed25519, kty:OKP) will
// be appended here when outbound signing is enabled.
import { createFileRoute } from "@tanstack/react-router";

const directory = { keys: [] as const };

export const Route = createFileRoute(
  "/.well-known/http-message-signatures-directory",
)({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify(directory), {
          status: 200,
          headers: {
            "Content-Type": "application/http-message-signatures-directory",
            "Cache-Control": "public, max-age=300, s-maxage=3600",
            "Access-Control-Allow-Origin": "*",
          },
        }),
    },
  },
});
