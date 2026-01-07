
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const userId = process.env.SINGLE_USER_ID;
    if (!userId) {
        console.error('SINGLE_USER_ID is missing');
        return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        console.log('User missing after reset. Re-creating...');
        await prisma.user.create({
            data: {
                id: userId,
                name: 'Admin User',
                email: 'admin@example.com',
            },
        });
        console.log('User created.');
    } else {
        console.log('User exists.');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
