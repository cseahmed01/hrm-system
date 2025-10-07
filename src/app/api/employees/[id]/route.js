import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/employees/[id] - Get employee by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return Response.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const employee = await prisma.employee.findFirst({
      where: {
        id: id,
        tenantId: tenantId, // Ensure employee belongs to tenant
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
        },
        attendances: {
          orderBy: { date: 'desc' },
          take: 10 // Last 10 attendance records
        },
        leaves: {
          orderBy: { createdAt: 'desc' },
          take: 5 // Recent leave requests
        }
      }
    });

    if (!employee) {
      return Response.json({ error: 'Employee not found' }, { status: 404 });
    }

    return Response.json({ employee });

  } catch (error) {
    console.error('Get employee error:', error);
    return Response.json({ error: 'Failed to fetch employee' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/employees/[id] - Update employee
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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
      imageUrl,
      status
    } = await request.json();

    // Check if employee exists and belongs to tenant
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id: id,
        tenantId: tenantId
      }
    });

    if (!existingEmployee) {
      return Response.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Check if empCode is being changed and if it conflicts
    if (empCode && empCode !== existingEmployee.empCode) {
      const codeConflict = await prisma.employee.findFirst({
        where: {
          tenantId: tenantId,
          empCode: empCode,
          id: { not: id } // Exclude current employee
        }
      });

      if (codeConflict) {
        return Response.json({ error: 'Employee code already exists' }, { status: 400 });
      }
    }

    // Check if email is being changed and if it conflicts
    if (email && email !== existingEmployee.email) {
      const emailConflict = await prisma.employee.findFirst({
        where: {
          tenantId: tenantId,
          email: email,
          id: { not: id } // Exclude current employee
        }
      });

      if (emailConflict) {
        return Response.json({ error: 'Email already exists for this tenant' }, { status: 400 });
      }
    }

    // Update employee
    const updatedEmployee = await prisma.employee.update({
      where: { id: id },
      data: {
        ...(empCode && { empCode }),
        ...(fullName && { fullName }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(gender !== undefined && { gender }),
        ...(dob && { dob: new Date(dob) }),
        ...(joinDate && { joinDate: new Date(joinDate) }),
        ...(departmentId !== undefined && { departmentId }),
        ...(designationId !== undefined && { designationId }),
        ...(salary !== undefined && { salary: salary ? parseFloat(salary) : null }),
        ...(address !== undefined && { address }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(status && { status }),
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
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });

  } catch (error) {
    console.error('Update employee error:', error);
    return Response.json({ error: 'Failed to update employee' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/employees/[id] - Delete employee (soft delete by setting status to inactive)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return Response.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    // Check if employee exists and belongs to tenant
    const employee = await prisma.employee.findFirst({
      where: {
        id: id,
        tenantId: tenantId
      }
    });

    if (!employee) {
      return Response.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Soft delete by setting status to inactive
    await prisma.employee.update({
      where: { id: id },
      data: { status: 'inactive' }
    });

    return Response.json({ message: 'Employee deleted successfully' });

  } catch (error) {
    console.error('Delete employee error:', error);
    return Response.json({ error: 'Failed to delete employee' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}