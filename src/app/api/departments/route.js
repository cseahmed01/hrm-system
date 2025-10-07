import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

function getUserFromToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET /api/departments - List all departments for the tenant
export async function GET(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const departments = await prisma.department.findMany({
      where: {
        tenantId: user.tenantId,
        status: 'active', // Only show active departments
      },
      include: {
        designations: {
          where: { status: 'active' },
          select: { id: true, title: true, status: true }
        },
        _count: {
          select: { employees: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return Response.json({ departments });

  } catch (error) {
    console.error('Get departments error:', error);
    return Response.json({ error: 'Failed to fetch departments' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/departments - Create new department
export async function POST(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    // Validate required fields
    if (!name) {
      return Response.json({ error: 'Department name is required' }, { status: 400 });
    }

    // Check if department name already exists for this tenant
    const existingDepartment = await prisma.department.findFirst({
      where: {
        tenantId: user.tenantId,
        name: name,
        status: 'active'
      }
    });

    if (existingDepartment) {
      return Response.json({ error: 'Department name already exists' }, { status: 400 });
    }

    // Create department
    const department = await prisma.department.create({
      data: {
        tenantId: user.tenantId,
        name: name,
      },
      include: {
        designations: true,
        _count: {
          select: { employees: true }
        }
      }
    });

    return Response.json({
      message: 'Department created successfully',
      department
    }, { status: 201 });

  } catch (error) {
    console.error('Create department error:', error);
    return Response.json({ error: 'Failed to create department' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}