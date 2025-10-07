import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Simple password hashing using crypto (use bcrypt in production)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, hashedPassword) {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return hash === verifyHash;
}

export async function POST(request) {
  try {
    const {
      companyName,
      companyEmail,
      companyPhone,
      companyAddress,
      adminName,
      adminEmail,
      adminPassword,
      plan,
    } = await request.json();

    // Validate required fields
    if (!companyName || !companyEmail || !adminName || !adminEmail || !adminPassword) {
      return Response.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    // Check if tenant email already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { email: companyEmail },
    });

    if (existingTenant) {
      return Response.json({ error: 'Company email already registered' }, { status: 400 });
    }

    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      return Response.json({ error: 'Admin email already registered' }, { status: 400 });
    }

    // Hash password securely
    const hashedPassword = hashPassword(adminPassword);

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: companyName,
        email: companyEmail,
        phone: companyPhone || null,
        address: companyAddress || null,
        subscription: plan,
      },
    });

    // Create admin user
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    // Return success (don't send password back)
    return Response.json({
      message: 'Tenant and admin account created successfully',
      tenantId: tenant.id,
      userId: user.id,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}