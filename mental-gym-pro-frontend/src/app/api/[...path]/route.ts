// src/app/api/[...path]/route.ts
import type { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:5000';

function buildTarget(segments: string[], search: string) {
  const joined = segments.join('/');
  return `${BACKEND_URL}/api/${joined}${search || ''}`;
}

// ⚠️ Usa `any` para evitar el error de tipos
async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  const target = buildTarget(params.path, req.nextUrl.search);

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('content-length');

  const init: RequestInit = {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.arrayBuffer(),
    redirect: 'manual',
  };

  const upstream = await fetch(target, init);

  const outHeaders = new Headers(upstream.headers);
  outHeaders.delete('access-control-allow-origin');
  outHeaders.delete('access-control-allow-credentials');
  outHeaders.delete('content-length');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  });
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE, handler as OPTIONS };
