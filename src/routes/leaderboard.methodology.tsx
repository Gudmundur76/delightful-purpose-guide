import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/leaderboard/methodology")({
  beforeLoad: () => {
    throw redirect({
      to: "/report/methodology",
      statusCode: 301,
    });
  },
});
