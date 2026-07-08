import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Samyukth@2378', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@Samyukthenterprises@gmail.com' },
    update: {
      password: hashedPassword,
      role: 'admin',
      name: 'Admin',
    },
    create: {
      email: 'admin@Samyukthenterprises@gmail.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    },
  });

  console.log('Admin user seeded:', admin.email, 'Role:', admin.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
