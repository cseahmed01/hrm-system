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

export async function GET(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const designations = await prisma.designation.findMany({
      where: { tenantId: user.tenantId },
      include: {
        department: true,
        _count: {
          select: { employees: true }
        }
      },
      orderBy: { title: 'asc' }
    });

    return Response.json({ designations });
  } catch (error) {
    console.error('Error fetching designations:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, departmentId } = await request.json();

    if (!title || !departmentId) {
      return Response.json({ error: 'Title and department are required' }, { status: 400 });
    }

    // Verify department belongs to user's tenant
    const department = await prisma.department.findFirst({
      where: {
        id: departmentId,
        tenantId: user.tenantId
      }
    });

    if (!department) {
      return Response.json({ error: 'Department not found' }, { status: 404 });
    }

    const designation = await prisma.designation.create({
      data: {
        title,
        departmentId,
        tenantId: user.tenantId
      },
      include: {
        department: true
      }
    });

    return Response.json({ designation }, { status: 201 });
  } catch (error) {
    console.error('Error creating designation:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}