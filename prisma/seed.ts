import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@example.com'

    let user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user) {
        user = await prisma.user.create({
            data: {
                email,
                name: 'Admin User',
            },
        })
        console.log(`Created user with id: ${user.id}`)
    } else {
        console.log(`User already exists with id: ${user.id}`)
    }

    console.log(`\n=== ADD THIS TO .env ===\nSINGLE_USER_ID="${user.id}"\n========================`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
