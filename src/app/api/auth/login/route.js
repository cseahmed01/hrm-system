import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Simple password verification using crypto (use bcrypt in production)
function verifyPassword(password, hashedPassword) {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return hash === verifyHash;
}

// Simple JWT implementation using crypto
function createJWT(payload, secret, expiresIn = '7d') {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const exp = expiresIn === '7d' ? now + (7 * 24 * 60 * 60) : now + (24 * 60 * 60); // 7 days or 1 day

  const jwtPayload = {
    ...payload,
    iat: now,
    exp: exp
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url');

  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url');

  return `${data}.${signature}`;
}

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

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check password securely
    const isValidPassword = verifyPassword(password, user.password);

    if (!isValidPassword) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return Response.json({ error: 'Account is not active' }, { status: 401 });
    }

    // Generate JWT token
    const token = createJWT(
      {
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    // Return user info with token (exclude password)
    const { password: _, ...userWithoutPassword } = user;
    return Response.json({
      message: 'Login successful',
      user: userWithoutPassword,
      tenant: user.tenant,
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}