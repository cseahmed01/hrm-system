import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/audit-logs - List audit logs for the tenant
export async function GET(request) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50; // Default limit

    if (!tenantId) {
      return Response.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: {
        tenantId: tenantId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return Response.json({ auditLogs });

  } catch (error) {
    console.error('Get audit logs error:', error);
    return Response.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}