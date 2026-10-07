const BACKEND_URL = process.env.RENDER_BACKEND_URL || 'https://creatorlens-hydg.onrender.com/api';

export const dynamic = 'force-dynamic';

async function handler(req, { params }) {
  try {
    const pathSegments = params?.path || [];
    const subPath = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    const targetUrl = `${BACKEND_URL}/${subPath}${queryString ? `?${queryString}` : ''}`;

    const headers = new Headers();
    req.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!['host', 'connection', 'content-length', 'transfer-encoding'].includes(lower)) {
        headers.set(key, value);
      }
    });

    let body = null;
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      try {
        const contentType = req.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          body = JSON.stringify(await req.json());
        } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
          body = await req.arrayBuffer();
        } else {
          body = await req.text();
        }
      } catch (e) {
        body = null;
      }
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: 'no-store'
    });

    const responseData = await response.arrayBuffer();
    const resHeaders = new Headers();
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(lower)) {
        resHeaders.set(key, value);
      }
    });

    return new Response(responseData, {
      status: response.status,
      headers: resHeaders
    });
  } catch (error) {
    console.error('[API Gateway Error]:', error);
    return new Response(JSON.stringify({ error: 'Backend server connection error: ' + error.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = () => new Response(null, { status: 204 });
