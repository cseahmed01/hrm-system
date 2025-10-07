import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcryptjs'; // Need to install bcryptjs for secure password hashing

const prisma = new PrismaClient();

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

    // Hash password (using plain text for now - install bcryptjs for production)
    // const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const hashedPassword = adminPassword; // TODO: Hash password securely

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: companyName,
        email: companyEmail,
        phone: companyPhone || null,
        address: companyAddress || null,
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
    console.error('Signup error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}