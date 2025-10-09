const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Password hashing using bcrypt
function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

async function main() {
  // Create super admin user (global)
  const superAdminPassword = hashPassword('password');
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@demo.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@demo.com',
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
      status: 'active',
    },
  });

  console.log('Created super admin user:', superAdmin);

  // Create a default tenant
  const tenant = await prisma.tenant.upsert({
    where: { email: 'demo@company.com' },
    update: {},
    create: {
      name: 'Demo Company',
      email: 'demo@company.com',
      phone: '+1234567890',
      address: '123 Demo Street',
      status: 'active',
    },
  });

  console.log('Created tenant:', tenant);

  // Create admin user
  const adminPassword = hashPassword('password');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Admin User',
      email: 'admin@demo.com',
      password: adminPassword,
      role: 'ADMIN',
      status: 'active',
    },
  });

  console.log('Created admin user:', admin);

  // Create employee user
  const employeePassword = hashPassword('password');
  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@demo.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'John Doe',
      email: 'employee@demo.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      status: 'active',
    },
  });

  console.log('Created employee user:', employeeUser);

  // Create department
  const department = await prisma.department.upsert({
    where: { id: 'dept-1' },
    update: {},
    create: {
      id: 'dept-1',
      tenantId: tenant.id,
      name: 'Engineering',
      status: 'active',
    },
  });

  // Create designation
  const designation = await prisma.designation.upsert({
    where: { id: 'desig-1' },
    update: {},
    create: {
      id: 'desig-1',
      tenantId: tenant.id,
      departmentId: department.id,
      title: 'Software Engineer',
      status: 'active',
    },
  });

  // Create employee record
  const employee = await prisma.employee.upsert({
    where: { empCode: 'EMP001' },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: employeeUser.id,
      empCode: 'EMP001',
      fullName: 'John Doe',
      email: 'employee@demo.com',
      phone: '+1987654321',
      gender: 'Male',
      joinDate: new Date(),
      departmentId: department.id,
      designationId: designation.id,
      salary: 50000,
      status: 'active',
      address: '456 Employee Ave',
    },
  });

  console.log('Created employee record:', employee);

  // Create another tenant
  const tenant2 = await prisma.tenant.upsert({
    where: { email: 'company2@demo.com' },
    update: {},
    create: {
      name: 'Company Two',
      email: 'company2@demo.com',
      phone: '+19876543210',
      address: '456 Company St',
      status: 'active',
    },
  });

  console.log('Created tenant2:', tenant2);

  // Create HR user for tenant2
  const hrPassword = hashPassword('password');
  const hrUser = await prisma.user.upsert({
    where: { email: 'hr@company2.com' },
    update: {},
    create: {
      tenantId: tenant2.id,
      name: 'HR Manager',
      email: 'hr@company2.com',
      password: hrPassword,
      role: 'HR',
      status: 'active',
    },
  });

  console.log('Created HR user:', hrUser);

  // Create department for tenant2
  const department2 = await prisma.department.upsert({
    where: { id: 'dept-2' },
    update: {},
    create: {
      id: 'dept-2',
      tenantId: tenant2.id,
      name: 'IT',
      status: 'active',
    },
  });

  // Create designation for tenant2
  const designation2 = await prisma.designation.upsert({
    where: { id: 'desig-2' },
    update: {},
    create: {
      id: 'desig-2',
      tenantId: tenant2.id,
      departmentId: department2.id,
      title: 'Developer',
      status: 'active',
    },
  });

  // Create employee for tenant2
  const employee2 = await prisma.employee.upsert({
    where: { empCode: 'EMP002' },
    update: {},
    create: {
      tenantId: tenant2.id,
      userId: hrUser.id,
      empCode: 'EMP002',
      fullName: 'Jane Smith',
      email: 'hr@company2.com',
      phone: '+11234567890',
      gender: 'Female',
      joinDate: new Date(),
      departmentId: department2.id,
      designationId: designation2.id,
      salary: 60000,
      status: 'active',
      address: '789 Employee Ave',
    },
  });

  console.log('Created employee2:', employee2);

  // Add some sample attendance
  const attendance = await prisma.attendance.upsert({
    where: { id: 'att-1' },
    update: {},
    create: {
      id: 'att-1',
      tenantId: tenant.id,
      employeeId: employee.id,
      date: new Date(),
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours later
      status: 'present',
      workHours: 8,
    },
  });

  console.log('Created attendance:', attendance);

  // Add sample leave
  const leave = await prisma.leave.upsert({
    where: { id: 'leave-1' },
    update: {},
    create: {
      id: 'leave-1',
      tenantId: tenant.id,
      employeeId: employee.id,
      type: 'Sick Leave',
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      days: 1,
      reason: 'Medical',
      status: 'approved',
    },
  });

  console.log('Created leave:', leave);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });