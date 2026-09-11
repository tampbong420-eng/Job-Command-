import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JOB COMMAND",
    short_name: "JOB COMMAND",
    description:
      "Boss Command (green) and Employee Command (orange) phone apps on a black shop desk.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    orientation: "portrait",
    icons: [
      {
        src: "/job-command-logo.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/job-command-logo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}
