import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The repo intentionally has no AGENTS.md/CLAUDE.md; don't auto-generate them.
  agentRules: false,
  async headers() {
    return [
      {
        source: "/",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
