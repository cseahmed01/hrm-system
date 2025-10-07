import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/employees - List all employees for the tenant
export async function GET(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return Response.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const employees = await prisma.employee.findMany({
      where: {
        tenantId: tenantId,
        status: 'active', // Only show active employees
      },
      include: {
        department: {
          select: { id: true, name: true }
        },
        designation: {
          select: { id: true, title: true }
        },
        user: {
          select: { id: true, email: true, role: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return Response.json({ employees });

  } catch (error) {
    console.error('Get employees error:', error);
    return Response.json({ error: 'Failed to fetch employees' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/employees - Create new employee
export async function POST(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return Response.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const {
      empCode,
      fullName,
      email,
      phone,
      gender,
      dob,
      joinDate,
      departmentId,
      designationId,
      salary,
      address,
      imageUrl
    } = await request.json();

    // Validate required fields
    if (!empCode || !fullName || !email || !joinDate) {
      return Response.json({ error: 'Employee code, full name, email, and join date are required' }, { status: 400 });
    }

    // Check if employee code already exists for this tenant
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        tenantId: tenantId,
        empCode: empCode
      }
    });

    if (existingEmployee) {
      return Response.json({ error: 'Employee code already exists' }, { status: 400 });
    }

    // Check if email already exists for this tenant
    const existingEmail = await prisma.employee.findFirst({
      where: {
        tenantId: tenantId,
        email: email
      }
    });

    if (existingEmail) {
      return Response.json({ error: 'Email already exists for this tenant' }, { status: 400 });
    }

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        tenantId: tenantId,
        empCode: empCode,
        fullName: fullName,
        email: email,
        phone: phone || null,
        gender: gender || null,
        dob: dob ? new Date(dob) : null,
        joinDate: new Date(joinDate),
        departmentId: departmentId || null,
        designationId: designationId || null,
        salary: salary ? parseFloat(salary) : null,
        address: address || null,
        imageUrl: imageUrl || null,
      },
      include: {
        department: {
          select: { id: true, name: true }
        },
        designation: {
          select: { id: true, title: true }
        }
      }
    });

    return Response.json({
      message: 'Employee created successfully',
      employee
    }, { status: 201 });

  } catch (error) {
    console.error('Create employee error:', error);
    return Response.json({ error: 'Failed to create employee' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}