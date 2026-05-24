import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const existingUser = await prisma.user.findUnique({ where: { email: 'admin@productivity.com' }});
  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        name: 'Boss',
        email: 'admin@productivity.com',
        password: 'admin123'
      }
    });
    console.log('Created user:', user.email);
  } else {
    console.log('User already exists');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
