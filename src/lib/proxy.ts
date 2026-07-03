const API_BASE = 'http://127.0.0.1:8001';

export async function proxyRequest(
  request: Request,
  endpoint: string
): Promise<Response> {
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
    return Response.json({ error: `Python backend unavailable: ${error.message}` }, { status: 502 });
  }
}
