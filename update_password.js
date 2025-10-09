const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Password hashing using bcrypt
function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

async function updatePassword() {
  try {
    // Find the employee with empCode 'EMP001'
    const employee = await prisma.employee.findUnique({
      where: { empCode: 'EMP001' },
      include: { user: true },
    });

    if (!employee || !employee.userId) {
      console.log('Employee EMP001 not found or has no associated user.');
      return;
    }

    // Hash the new password
    const newPassword = 'securepass456';
    const hashedPassword = hashPassword(newPassword);

    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { id: employee.userId },
      data: { password: hashedPassword },
    });

    console.log('Password updated for user:', updatedUser.email);

  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();