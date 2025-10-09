import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/leaves - List leaves with filters
export async function GET(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!tenantId) {
      return Response.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const where = {
      tenantId: tenantId,
    };

    if (status) where.status = status;
    if (employeeId) where.employeeId = employeeId;
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate);
      if (endDate) where.startDate.lte = new Date(endDate);
    }

    const leaves = await prisma.leave.findMany({
      where,
      include: {
        employee: {
          select: { id: true, empCode: true, fullName: true, department: { select: { name: true } }, designation: { select: { title: true } } }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return Response.json({ leaves });

  } catch (error) {
    console.error('Get leaves error:', error);
    return Response.json({ error: 'Failed to fetch leaves' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/leaves - Create new leave
export async function POST(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return Response.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const {
      employeeId,
      type,
      startDate,
      endDate,
      reason
    } = await request.json();

    // Validate required fields
    if (!employeeId || !type || !startDate || !endDate) {
      return Response.json({ error: 'Employee ID, type, start date, and end date are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // inclusive days

    if (days <= 0) {
      return Response.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    // Create leave
    const leave = await prisma.leave.create({
      data: {
        tenantId: tenantId,
        employeeId: employeeId,
        type: type,
        startDate: start,
        endDate: end,
        days: days,
        reason: reason || null,
      },
      include: {
        employee: {
          select: { id: true, empCode: true, fullName: true, department: { select: { name: true } }, designation: { select: { title: true } } }
        }
      }
    });

    return Response.json({
      message: 'Leave request created successfully',
      leave
    }, { status: 201 });

  } catch (error) {
    console.error('Create leave error:', error);
    return Response.json({ error: 'Failed to create leave' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}