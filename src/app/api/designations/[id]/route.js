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

export async function PUT(request, { params }) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { title, departmentId } = await request.json();

    if (!title || !departmentId) {
      return Response.json({ error: 'Title and department are required' }, { status: 400 });
    }

    // Verify designation belongs to user's tenant and update it
    const designation = await prisma.designation.updateMany({
      where: {
        id,
        tenantId: user.tenantId
      },
      data: {
        title,
        departmentId
      }
    });

    if (designation.count === 0) {
      return Response.json({ error: 'Designation not found' }, { status: 404 });
    }

    // Fetch updated designation
    const updatedDesignation = await prisma.designation.findUnique({
      where: { id },
      include: {
        department: true,
        _count: {
          select: { employees: true }
        }
      }
    });

    return Response.json({ designation: updatedDesignation });
  } catch (error) {
    console.error('Error updating designation:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Delete designation (only if it belongs to user's tenant)
    const designation = await prisma.designation.deleteMany({
      where: {
        id,
        tenantId: user.tenantId
      }
    });

    if (designation.count === 0) {
      return Response.json({ error: 'Designation not found' }, { status: 404 });
    }

    return Response.json({ message: 'Designation deleted successfully' });
  } catch (error) {
    console.error('Error deleting designation:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}