import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT /api/leaves/[id] - Update leave status
export async function PUT(request, { params }) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { id } = params;

    if (!tenantId) {
      return Response.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const { status, approvedBy } = await request.json();

    if (!status || !['approved', 'rejected'].includes(status)) {
      return Response.json({ error: 'Valid status (approved or rejected) is required' }, { status: 400 });
    }

    // Update leave
    const leave = await prisma.leave.update({
      where: {
        id: id,
        tenantId: tenantId, // Ensure tenant isolation
      },
      data: {
        status: status,
        approvedBy: approvedBy || null,
      },
      include: {
        employee: {
          select: { id: true, empCode: true, fullName: true, department: { select: { name: true } }, designation: { select: { title: true } } }
        }
      }
    });

    return Response.json({
      message: `Leave ${status} successfully`,
      leave
    });

  } catch (error) {
    console.error('Update leave error:', error);
    if (error.code === 'P2025') {
      return Response.json({ error: 'Leave not found' }, { status: 404 });
    }
    return Response.json({ error: 'Failed to update leave' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/leaves/[id] - Delete leave (optional)
export async function DELETE(request, { params }) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { id } = params;

    if (!tenantId) {
      return Response.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    await prisma.leave.delete({
      where: {
        id: id,
        tenantId: tenantId,
      }
    });

    return Response.json({ message: 'Leave deleted successfully' });

  } catch (error) {
    console.error('Delete leave error:', error);
    if (error.code === 'P2025') {
      return Response.json({ error: 'Leave not found' }, { status: 404 });
    }
    return Response.json({ error: 'Failed to delete leave' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}