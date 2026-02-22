import 'dotenv/config';
import { db } from './src/db/db.js';
import { matches, commentary } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function clearAndReseed() {
  try {
    console.log('Clearing old matches and commentary...');
    
    // Delete all commentary first (foreign key constraint)
    await db.delete(commentary);
    console.log('✓ Cleared commentary');
    
    // Delete all matches
    await db.delete(matches);
    console.log('✓ Cleared matches');
    
    // Create fresh current matches with today's date
    const currentMatches = [
      {
        sport: 'football',
        homeTeam: 'Manchester United',
        awayTeam: 'Liverpool',
        status: 'live',
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        homeScore: 1,
        awayScore: 1
      },
      {
        sport: 'cricket',
        homeTeam: 'India',
        awayTeam: 'Australia',
        status: 'live',
        startTime: new Date(),
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        homeScore: 156,
        awayScore: 89
      },
      {
        sport: 'basketball',
        homeTeam: 'LA Lakers',
        awayTeam: 'Golden State Warriors',
        status: 'live',
        startTime: new Date(),
        endTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000), // 2.5 hours from now
        homeScore: 78,
        awayScore: 82
      },
      {
        sport: 'football',
        homeTeam: 'Real Madrid',
        awayTeam: 'Barcelona',
        status: 'live',
        startTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 mins ago
        endTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000), // 1.5 hours from now
        homeScore: 2,
        awayScore: 1
      },
      {
        sport: 'tennis',
        homeTeam: 'Novak Djokovic',
        awayTeam: 'Carlos Alcaraz',
        status: 'live',
        startTime: new Date(Date.now() - 45 * 60 * 1000), // Started 45 mins ago
        endTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
        homeScore: 1,
        awayScore: 0
      }
    ];
    
    console.log('Creating fresh matches...');
    const insertedMatches = await db.insert(matches).values(currentMatches).returning();
    console.log(`✓ Created ${insertedMatches.length} fresh matches`);
    
    console.log('\n🎉 Fresh data created successfully!');
    console.log('Matches are now current and live:');
    insertedMatches.forEach(match => {
      console.log(`- ${match.homeTeam} vs ${match.awayTeam} (${match.sport})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

clearAndReseed();
