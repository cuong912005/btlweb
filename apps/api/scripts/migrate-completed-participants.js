import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCompletedParticipants() {
  try {
    console.log('Starting migration of completed participants...');
    
    // Update all APPROVED participants whose events have ended to COMPLETED status
    const result = await prisma.eventParticipant.updateMany({
      where: {
        status: 'APPROVED',
        event: {
          endDate: {
            lt: new Date()
          }
        }
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });
    
    console.log(`Migration completed: ${result.count} participants updated to COMPLETED status`);
    
    // Show summary of current participant status
    const summary = await prisma.eventParticipant.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    console.log('\nCurrent participant status summary:');
    summary.forEach(item => {
      console.log(`${item.status}: ${item._count.status} participants`);
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateCompletedParticipants();
}