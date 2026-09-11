export async function GET() {
  const ephemeral = !process.env.DATABASE_URL;
  return Response.json({
    ok: true,
    service: "job-command",
    time: new Date().toISOString(),
    database: process.env.DATABASE_URL
      ? "neon"
      : process.env.VERCEL
        ? "pglite-memory"
        : "pglite-file",
    ephemeral,
  });
}
