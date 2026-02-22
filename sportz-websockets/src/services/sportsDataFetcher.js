import axios from 'axios';
import * as cheerio from 'cheerio';
import cron from 'node-cron';

class SportsDataFetcher {
  constructor() {
    this.sources = {
      cricket: [
        {
          name: 'ICC Official',
          url: 'https://www.icc-cricket.com/matches/schedule',
          type: 'scrape'
        },
        {
          name: 'Cricbuzz',
          url: 'https://www.cricbuzz.com/cricket-match-live-scores',
          type: 'scrape'
        }
      ],
      football: [
        {
          name: 'FIFA',
          url: 'https://www.fifa.com/fifaplus/en/matches',
          type: 'scrape'
        },
        {
          name: 'ESPN Soccer',
          url: 'https://www.espn.com/soccer/scores',
          type: 'scrape'
        }
      ],
      basketball: [
        {
          name: 'NBA',
          url: 'https://www.nba.com/games',
          type: 'scrape'
        },
        {
          name: 'ESPN NBA',
          url: 'https://www.espn.com/nba/scores',
          type: 'scrape'
        }
      ]
    };
  }

  async fetchCricketMatches() {
    const matches = [];
    
    try {
      // Try Cricbuzz first (more reliable for live scores)
      const cricbuzzResponse = await axios.get('https://www.cricbuzz.com/cricket-match-live-scores', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(cricbuzzResponse.data);
      
      $('.cb-lv-scrs-well').each((i, element) => {
        const $match = $(element);
        const teamsText = $match.find('.cb-hmscg-tm-nm').text().trim();
        const scoreText = $match.find('.cb-lv-scrs-col').text().trim();
        const statusText = $match.find('.cb-text-live').text().trim() || $match.find('.cb-text-complete').text().trim();
        
        if (teamsText && scoreText) {
          const teams = teamsText.split('vs').map(t => t.trim());
          const scores = scoreText.match(/(\d+)\/(\d+)/g) || scoreText.match(/(\d+)-(\d+)/g);
          
          if (teams.length >= 2) {
            matches.push({
              sport: 'cricket',
              homeTeam: teams[0],
              awayTeam: teams[1],
              status: statusText.includes('Live') ? 'live' : statusText.includes('won') ? 'finished' : 'scheduled',
              homeScore: scores && scores[0] ? parseInt(scores[0].split('/')[0] || scores[0].split('-')[0]) : 0,
              awayScore: scores && scores[1] ? parseInt(scores[1].split('/')[0] || scores[1].split('-')[0]) : 0,
              startTime: new Date(),
              endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
              source: 'cricbuzz'
            });
          }
        }
      });
    } catch (error) {
      console.error('Error fetching cricket data:', error.message);
    }
    
    return matches;
  }

  async fetchFootballMatches() {
    const matches = [];
    
    try {
      const response = await axios.get('https://www.espn.com/soccer/scores', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      $('.Scoreboard').each((i, element) => {
        const $match = $(element);
        const teams = $match.find('.ScoreCell__TeamName').map((i, el) => $(el).text().trim()).get();
        const scores = $match.find('.ScoreCell__Score').map((i, el) => $(el).text().trim()).get();
        const status = $match.find('.ScoreCell__Time').text().trim();
        
        if (teams.length >= 2 && scores.length >= 2) {
          matches.push({
            sport: 'football',
            homeTeam: teams[0],
            awayTeam: teams[1],
            status: status.includes('LIVE') ? 'live' : status.includes('FT') ? 'finished' : 'scheduled',
            homeScore: parseInt(scores[0]) || 0,
            awayScore: parseInt(scores[1]) || 0,
            startTime: new Date(),
            endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
            source: 'espn'
          });
        }
      });
    } catch (error) {
      console.error('Error fetching football data:', error.message);
    }
    
    return matches;
  }

  async fetchBasketballMatches() {
    const matches = [];
    
    try {
      const response = await axios.get('https://www.espn.com/nba/scores', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      $('.Scoreboard').each((i, element) => {
        const $match = $(element);
        const teams = $match.find('.ScoreCell__TeamName').map((i, el) => $(el).text().trim()).get();
        const scores = $match.find('.ScoreCell__Score').map((i, el) => $(el).text().trim()).get();
        const status = $match.find('.ScoreCell__Time').text().trim();
        
        if (teams.length >= 2 && scores.length >= 2) {
          matches.push({
            sport: 'basketball',
            homeTeam: teams[0],
            awayTeam: teams[1],
            status: status.includes('LIVE') ? 'live' : status.includes('Final') ? 'finished' : 'scheduled',
            homeScore: parseInt(scores[0]) || 0,
            awayScore: parseInt(scores[1]) || 0,
            startTime: new Date(),
            endTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000), // 2.5 hours from now
            source: 'espn'
          });
        }
      });
    } catch (error) {
      console.error('Error fetching basketball data:', error.message);
    }
    
    return matches;
  }

  async fetchAllSportsData() {
    console.log('🔄 Fetching live sports data from official sources...');
    
    const [cricketMatches, footballMatches, basketballMatches] = await Promise.all([
      this.fetchCricketMatches(),
      this.fetchFootballMatches(),
      this.fetchBasketballMatches()
    ]);
    
    const allMatches = [...cricketMatches, ...footballMatches, ...basketballMatches];
    
    console.log(`✅ Fetched ${allMatches.length} live matches:`);
    console.log(`   Cricket: ${cricketMatches.length}`);
    console.log(`   Football: ${footballMatches.length}`);
    console.log(`   Basketball: ${basketballMatches.length}`);
    
    return allMatches;
  }

  startAutoFetch(intervalMinutes = 5) {
    console.log(`🚀 Starting auto-fetch every ${intervalMinutes} minutes`);
    
    // Fetch immediately on start
    this.fetchAllSportsData();
    
    // Schedule regular fetching
    cron.schedule(`*/${intervalMinutes} * * * *`, async () => {
      console.log('⏰ Scheduled fetch triggered');
      await this.fetchAllSportsData();
    });
  }
}

export default SportsDataFetcher;
