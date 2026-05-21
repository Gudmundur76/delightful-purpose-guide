// Server fn to expose recent scans to client components.
import { createServerFn } from "@tanstack/react-start";
import { fetchRecentScans } from "./scans.server";

export const getRecentScans = createServerFn({ method: "GET" }).handler(
  async () => {
    const rows = await fetchRecentScans(8);
    return { scans: rows };
  },
);
