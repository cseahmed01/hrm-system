import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/payrolls - List payrolls with filters
export async function GET(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    if (!tenantId) {
      return Response.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const where = {
      tenantId: tenantId,
    };

    if (month) where.month = month;
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const payrolls = await prisma.payroll.findMany({
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

    return Response.json({ payrolls });

  } catch (error) {
    console.error('Get payrolls error:', error);
    return Response.json({ error: 'Failed to fetch payrolls' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/payrolls - Generate payroll for an employee
export async function POST(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return Response.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const { employeeId, month, allowance, deduction } = await request.json();

    if (!employeeId || !month) {
      return Response.json({ error: 'Employee ID and month are required' }, { status: 400 });
    }

    // Check if payroll already exists for this employee and month
    const existingPayroll = await prisma.payroll.findFirst({
      where: {
        tenantId: tenantId,
        employeeId: employeeId,
        month: month,
      }
    });

    if (existingPayroll) {
      return Response.json({ error: 'Payroll already exists for this employee and month' }, { status: 400 });
    }

    // Get employee salary
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId, tenantId: tenantId }
    });

    if (!employee || !employee.salary) {
      return Response.json({ error: 'Employee not found or salary not set' }, { status: 400 });
    }

    const basicSalary = employee.salary;
    const allowanceAmount = allowance ? parseFloat(allowance) : 0;
    const deductionAmount = deduction ? parseFloat(deduction) : 0;
    const netSalary = basicSalary + allowanceAmount - deductionAmount;

    // Create payroll
    const payroll = await prisma.payroll.create({
      data: {
        tenantId: tenantId,
        employeeId: employeeId,
        month: month,
        basicSalary: basicSalary,
        allowance: allowanceAmount || null,
        deduction: deductionAmount || null,
        netSalary: netSalary,
      },
      include: {
        employee: {
          select: { id: true, empCode: true, fullName: true, department: { select: { name: true } }, designation: { select: { title: true } } }
        }
      }
    });

    return Response.json({
      message: 'Payroll generated successfully',
      payroll
    }, { status: 201 });

  } catch (error) {
    console.error('Generate payroll error:', error);
    return Response.json({ error: 'Failed to generate payroll' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}