// app/api/cron/daily/route.js

export async function GET(request) {
  const token = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (token !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  console.log("✅ Cron job triggered at", new Date());

  return new Response(JSON.stringify({ message: "Cron executed" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
