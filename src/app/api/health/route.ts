export async function GET() {
  return Response.json({
    ok: true,
    service: "job-command",
    time: new Date().toISOString(),
  });
}
