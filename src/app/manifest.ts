import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Job Command",
    short_name: "Job Command",
    description:
      "Field operations desk — dispatch jobs, call the site, and close work from the phone.",
    start_url: "/command",
    display: "standalone",
    background_color: "#12141a",
    theme_color: "#e8b84a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
