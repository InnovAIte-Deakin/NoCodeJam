/// <reference lib="deno.ns" />
/// <reference lib="dom" />

// Store in Supabase project secrets (don't hardcode in real code)
const SECRET = Deno.env.get("VERIFY_SALT");

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hashBuffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

Deno.serve(async (req) => {
  try {
    // Get userId from Authorization header (JWT token contains user info)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Authorization header required'
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Extract userId from JWT token (simplified - in production you'd validate the token properly)
    const token = authHeader.replace('Bearer ', '');
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;

    const { code } = await req.json();

    // Bucket time into hours (same as test_runner.py)
    const now = Math.floor(Date.now() / (1000 * 60 * 60));
    const input = `${userId}-${now}-${SECRET}`;
    const expected = (await sha256Hex(input)).slice(0, 12);

    return new Response(JSON.stringify({
      success: code === expected
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
});
