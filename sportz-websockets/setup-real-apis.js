import 'dotenv/config';
import readline from 'readline';
import axios from 'axios';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function testAPIs() {
  console.log('🌍 Real Sports API Setup');
  console.log('========================\n');
  
  console.log('Get FREE API keys from these sites:');
  console.log('1. CricAPI (Cricket): https://www.cricapi.com/');
  console.log('2. TheSportsDB (Football): https://www.thesportsdb.com/api.php');
  console.log('3. RapidAPI (NBA): https://rapidapi.com/api-sports/api-nba-v1\n');
  
  const cricApiKey = await question('Enter your CricAPI key (or press Enter to skip): ');
  const sportsDbKey = await question('Enter your TheSportsDB key (or press Enter to skip): ');
  const rapidApiKey = await question('Enter your RapidAPI key (or press Enter to skip): ');
  
  console.log('\n🧪 Testing APIs...\n');
  
  // Test CricAPI
  if (cricApiKey) {
    try {
      const response = await axios.get(`https://api.cricapi.com/v1/currentMatches?apikey=${cricApiKey}`);
      console.log('✅ CricAPI working! Found', response.data.data?.length || 0, 'cricket matches');
    } catch (error) {
      console.log('❌ CricAPI failed:', error.response?.data?.error || error.message);
    }
  }
  
  // Test TheSportsDB
  if (sportsDbKey) {
    try {
      const response = await axios.get(`https://www.thesportsdb.com/api/v1/json/${sportsDbKey}/livescore.php`);
      console.log('✅ TheSportsDB working! Found', response.data?.length || 0, 'football matches');
    } catch (error) {
      console.log('❌ TheSportsDB failed:', error.response?.data?.error || error.message);
    }
  }
  
  // Test RapidAPI NBA
  if (rapidApiKey) {
    try {
      const response = await axios.get('https://api-nba-v1.p.rapidapi.com/games', {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com'
        }
      });
      console.log('✅ NBA API working! Found', response.data.response?.length || 0, 'basketball games');
    } catch (error) {
      console.log('❌ NBA API failed:', error.response?.data?.message || error.message);
    }
  }
  
  console.log('\n📝 Updating your .env file with API keys...');
  
  // Update .env file
  const envContent = `
DATABASE_URL=postgresql://anshumansharma@localhost:5432/sportz
PORT=8000
HOST=0.0.0.0
ARCJET_KEY="dummy-key-for-development"
ARCJET_ENV="development"
API_URL="http://localhost:8000"
BROADCAST="1"
DELAY_MS="250"
MATCH_COUNT="0"

# Real Sports API Keys
CRICAPI_KEY="${cricApiKey}"
SPORTSDB_KEY="${sportsDbKey}"
RAPIDAPI_KEY="${rapidApiKey}"
`;
  
  require('fs').writeFileSync('.env', envContent.trim());
  console.log('✅ .env file updated with your API keys!');
  
  console.log('\n🎉 Setup complete!');
  console.log('Now run: npm run real-data-sync');
  
  rl.close();
}

testAPIs().catch(console.error);
