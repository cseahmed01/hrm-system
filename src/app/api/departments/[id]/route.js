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

// GET /api/departments/[id] - Get department by ID
export async function GET(request, { params }) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const department = await prisma.department.findFirst({
      where: {
        id: id,
        tenantId: user.tenantId,
      },
      include: {
        designations: {
          where: { status: 'active' },
          select: { id: true, title: true, status: true }
        },
        _count: {
          select: { employees: true }
        }
      }
    });

    if (!department) {
      return Response.json({ error: 'Department not found' }, { status: 404 });
    }

    return Response.json({ department });

  } catch (error) {
    console.error('Get department error:', error);
    return Response.json({ error: 'Failed to fetch department' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/departments/[id] - Update department
export async function PUT(request, { params }) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { name, status } = await request.json();

    // Check if department exists and belongs to tenant
    const existingDepartment = await prisma.department.findFirst({
      where: {
        id: id,
        tenantId: user.tenantId
      }
    });

    if (!existingDepartment) {
      return Response.json({ error: 'Department not found' }, { status: 404 });
    }

    // Check if name is being changed and if it conflicts
    if (name && name !== existingDepartment.name) {
      const nameConflict = await prisma.department.findFirst({
        where: {
          tenantId: user.tenantId,
          name: name,
          status: 'active',
          id: { not: id } // Exclude current department
        }
      });

      if (nameConflict) {
        return Response.json({ error: 'Department name already exists' }, { status: 400 });
      }
    }

    // Update department
    const updatedDepartment = await prisma.department.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
      },
      include: {
        designations: {
          where: { status: 'active' },
          select: { id: true, title: true, status: true }
        },
        _count: {
          select: { employees: true }
        }
      }
    });

    return Response.json({
      message: 'Department updated successfully',
      department: updatedDepartment
    });

  } catch (error) {
    console.error('Update department error:', error);
    return Response.json({ error: 'Failed to update department' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/departments/[id] - Delete department (soft delete)
export async function DELETE(request, { params }) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if department exists and belongs to tenant
    const department = await prisma.department.findFirst({
      where: {
        id: id,
        tenantId: user.tenantId
      }
    });

    if (!department) {
      return Response.json({ error: 'Department not found' }, { status: 404 });
    }

    // Check if department has employees
    const employeeCount = await prisma.employee.count({
      where: {
        departmentId: id,
        status: 'active'
      }
    });

    if (employeeCount > 0) {
      return Response.json({
        error: 'Cannot delete department with active employees. Please reassign employees first.'
      }, { status: 400 });
    }

    // Soft delete department
    await prisma.department.update({
      where: { id: id },
      data: { status: 'inactive' }
    });

    return Response.json({ message: 'Department deleted successfully' });

  } catch (error) {
    console.error('Delete department error:', error);
    return Response.json({ error: 'Failed to delete department' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}