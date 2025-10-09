import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT /api/payrolls/[id] - Update payroll status
export async function PUT(request, { params }) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { id } = params;

    if (!tenantId) {
      return Response.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const { status } = await request.json();

    if (!status || !['generated', 'approved', 'paid'].includes(status)) {
      return Response.json({ error: 'Valid status (generated, approved, or paid) is required' }, { status: 400 });
    }

    // Update payroll
    const payroll = await prisma.payroll.update({
      where: {
        id: id,
        tenantId: tenantId,
      },
      data: {
        status: status,
      },
      include: {
        employee: {
          select: { id: true, empCode: true, fullName: true, department: { select: { name: true } }, designation: { select: { title: true } } }
        }
      }
    });

    // If status is paid, create payslip
    if (status === 'paid') {
      const existingPayslip = await prisma.payslip.findUnique({
        where: { payrollId: id }
      });

      if (!existingPayslip) {
        // For now, just create a placeholder payslip
        await prisma.payslip.create({
          data: {
            tenantId: tenantId,
            payrollId: id,
            fileUrl: `/payslips/${id}.pdf`, // Placeholder
          }
        });
      }
    }

    return Response.json({
      message: `Payroll ${status} successfully`,
      payroll
    });

  } catch (error) {
    console.error('Update payroll error:', error);
    if (error.code === 'P2025') {
      return Response.json({ error: 'Payroll not found' }, { status: 404 });
    }
    return Response.json({ error: 'Failed to update payroll' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}