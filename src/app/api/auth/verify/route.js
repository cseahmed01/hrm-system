import crypto from 'crypto';

// Simple JWT verification using crypto
function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    // Verify signature
    const expectedSignature = crypto.createHmac('sha256', secret).update(data).digest('base64url');
    if (signature !== expectedSignature) return null;

    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return Response.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyJWT(token, process.env.JWT_SECRET || 'your-secret-key');

    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    return Response.json({
      valid: true,
      user: {
        id: decoded.userId,
        tenantId: decoded.tenantId,
        email: decoded.email,
        role: decoded.role
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return Response.json({ error: 'Token verification failed' }, { status: 500 });
  }
}