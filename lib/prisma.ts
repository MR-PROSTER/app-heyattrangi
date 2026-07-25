import { PrismaClient } from '@prisma/client'
import { ensurePragyaMongoMaintenance } from '@/lib/pragya/mongo-init'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = (): PrismaClient => {
  const databaseUrl = process.env.DATABASE_URL?.trim()

  if (!databaseUrl || databaseUrl === '') {
    console.error('❌ DATABASE_URL is missing or empty!')
    console.error('📝 Please set DATABASE_URL in your .env file')
    console.error('📝 Example: DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/dbname"')
    throw new Error(
      'DATABASE_URL environment variable is not set. Please check your .env file.'
    )
  }

  // Validate DATABASE_URL format
  if (
    !databaseUrl.startsWith('mongodb://') &&
    !databaseUrl.startsWith('mongodb+srv://')
  ) {
    console.error('❌ INVALID DATABASE_URL FORMAT!')
    console.error(`Current value starts with: ${databaseUrl.substring(0, 50)}...`)
    console.error('')
    console.error('📝 Your DATABASE_URL should be a MongoDB connection string:')
    console.error('   mongodb+srv://username:password@cluster.mongodb.net/database')
    console.error('')
    console.error('🔧 Update your .env file with the correct MongoDB URL:')
    console.error('   DATABASE_URL="mongodb+srv://23bcs037:2PNRnxkGdUPdjv4r@cluster0.q5kwrtg.mongodb.net/hey-attrangi?retryWrites=true&w=majority"')
    console.error('')
    throw new Error(
      `DATABASE_URL must be a MongoDB connection string starting with "mongodb://" or "mongodb+srv://". Current value appears to be: ${databaseUrl.substring(0, 30)}...`
    )
  }

  // Prisma v5 doesn't require adapter - just use DATABASE_URL from env
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

if (process.env.NEXT_PHASE !== 'phase-production-build') {
  void ensurePragyaMongoMaintenance().catch((error) => {
    console.error('Failed to run Pragya Mongo maintenance:', error)
  })
}
