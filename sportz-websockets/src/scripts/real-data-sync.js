import 'dotenv/config';
import RealDataSync from '../services/realDataSync.js';

async function runRealDataSync() {
  console.log('🌍 Starting Real Sports Data Sync');
  console.log('=====================================');
  
  const sync = new RealDataSync();
  
  try {
    // Run one-time sync
    await sync.syncMatchesWithDatabase();
    
    console.log('\n✅ Real data sync completed successfully!');
    console.log('📊 Your application now has current sports data from official sources');
    console.log('🔄 The frontend will automatically update with the new data');
    
  } catch (error) {
    console.error('❌ Real data sync failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your internet connection');
    console.log('2. Some sports websites may block scraping - this is normal');
    console.log('3. Try running the script again in a few minutes');
    console.log('4. The fallback is to continue with existing data');
  }
}

// Start continuous sync if requested
if (process.argv.includes('--continuous')) {
  console.log('🔄 Starting continuous real-time sync mode...');
  const sync = new RealDataSync();
  sync.startRealTimeSync(5); // Sync every 5 minutes
} else {
  runRealDataSync().then(() => process.exit(0));
}
