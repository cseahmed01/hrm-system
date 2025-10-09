import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/attendances - Get today's attendances for the tenant
export async function GET(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]; // Default to today

    if (!tenantId) {
      return Response.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const attendances = await prisma.attendance.findMany({
      where: {
        tenantId: tenantId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        employee: {
          select: { id: true, empCode: true, fullName: true, department: { select: { name: true } }, designation: { select: { title: true } } }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return Response.json({ attendances, date });

  } catch (error) {
    console.error('Get attendances error:', error);
    return Response.json({ error: 'Failed to fetch attendances' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/attendances - Record check-in or check-out for an employee
export async function POST(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return Response.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const { employeeId, action, date, time } = await request.json(); // action: 'checkin' or 'checkout'
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0); // Start of day

    if (!employeeId || !action) {
      return Response.json({ error: 'Employee ID and action are required' }, { status: 400 });
    }

    if (!['checkin', 'checkout'].includes(action)) {
      return Response.json({ error: 'Action must be checkin or checkout' }, { status: 400 });
    }

    // Check if attendance already exists for this employee on this date
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        tenantId: tenantId,
        employeeId: employeeId,
        date: attendanceDate,
      }
    });

    const now = time ? new Date(time) : new Date();

    if (existingAttendance) {
      // Update existing
      let updateData = {};
      if (action === 'checkin') {
        updateData.checkIn = now;
        updateData.status = 'present';
      } else if (action === 'checkout') {
        updateData.checkOut = now;
        // Calculate work hours if checkIn exists
        if (existingAttendance.checkIn) {
          const workHours = (now - new Date(existingAttendance.checkIn)) / (1000 * 60 * 60); // hours
          updateData.workHours = Math.max(0, workHours);
        }
      }

      const updatedAttendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: updateData,
        include: {
          employee: {
            select: { id: true, empCode: true, fullName: true, department: { select: { name: true } }, designation: { select: { title: true } } }
          }
        }
      });
      return Response.json({
        message: `${action === 'checkin' ? 'Check-in' : 'Check-out'} recorded successfully`,
        attendance: updatedAttendance
      });
    } else {
      // Create new only for check-in
      if (action === 'checkin') {
        const newAttendance = await prisma.attendance.create({
          data: {
            tenantId: tenantId,
            employeeId: employeeId,
            date: attendanceDate,
            checkIn: now,
            status: 'present',
          },
          include: {
            employee: {
              select: { id: true, empCode: true, fullName: true, department: { select: { name: true } }, designation: { select: { title: true } } }
            }
          }
        });
        return Response.json({
          message: 'Check-in recorded successfully',
          attendance: newAttendance
        }, { status: 201 });
      } else {
        return Response.json({ error: 'Cannot check-out without check-in first' }, { status: 400 });
      }
    }

  } catch (error) {
    console.error('Record attendance error:', error);
    return Response.json({ error: 'Failed to record attendance' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}