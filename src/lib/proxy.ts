// Proxy utility — kept for potential future use with external services.
// Currently NOT used by any route. All API routes use Prisma directly.

const API_BASE = process.env.PROXY_API_BASE || '';

export async function proxyRequest(
  request: Request,
  endpoint: string
): Promise<Response> {
  if (!API_BASE) {
    return Response.json({ error: 'Proxy not configured. Set PROXY_API_BASE in .env if needed.' }, { status: 503 });
  }

  // Forward query parameters from the original request
  const originalUrl = new URL(request.url);
  const queryString = originalUrl.search || '';
  const url = `${API_BASE}/api${endpoint}${queryString}`;
  const method = request.method;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  let body: string | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    body = await request.text();
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body,
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (error: any) {
    return Response.json({ error: `External service unavailable: ${error.message}` }, { status: 502 });
  }
}
