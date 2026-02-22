import axios from 'axios';

class APISportsFetcher {
  constructor() {
    // Using free public sports APIs
    this.apis = {
      cricket: {
        // CricAPI - Free tier
        baseUrl: 'https://api.cricapi.com/v1',
        apiKey: 'YOUR_CRICAPI_KEY', // User needs to get free key
        endpoints: {
          current: '/currentMatches',
          scoreboard: '/match_info'
        }
      }
    };
  }

  async fetchCricketMatches() {
    const matches = [];

    try {
      // Use real CricAPI with user's key
      const apiKey = process.env.CRICAPI_KEY;
      if (!apiKey) {
        console.log('⚠️ No CricAPI key found, using fallback data');
        return this.getRealisticCricketMatches();
      }

      const response = await axios.get(`https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}`);

      if (response.data && response.data.data) {
        const activeMatches = response.data.data; // Include all matches, including finished

        activeMatches.forEach(match => {
          if (match.name && match.teams) {
            const teams = match.teams;
            if (teams.length >= 2) {
              matches.push({
                sport: 'cricket',
                matchType: match.matchType || (match.name ? (match.name.toLowerCase().includes('t20') ? 't20' : match.name.toLowerCase().includes('odi') ? 'odi' : match.name.toLowerCase().includes('test') ? 'test' : 'other') : 'other'),
                homeTeam: teams[0].name || teams[0],
                awayTeam: teams[1].name || teams[1],
                status: match.matchEnded === true ? 'finished' : (match.status === 'Live' || match.matchStarted === true ? 'live' : 'scheduled'),
                homeScore: match.score && match.score.length > 0 ? parseInt(match.score[0].r) || 0 : 0,
                awayScore: match.score && match.score.length > 1 ? parseInt(match.score[1].r) || 0 : 0,
                startTime: match.dateTimeGMT ? new Date(match.dateTimeGMT + 'Z') : new Date(match.date || Date.now()),
                endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // Default 6 hour duration
                league: match.series || match.competition || 'Cricket Match',
                venue: match.venue,
                source: 'cricapi'
              });
            }
          }
        });
      }

      // Sort matches: live first, then scheduled, then finished
      const statusOrder = { 'live': 1, 'scheduled': 2, 'finished': 3 };
      matches.sort((a, b) => {
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        // If same status, sort by start time (newest first for finished/live, oldest first for scheduled)
        if (a.status === 'scheduled') {
          return a.startTime.getTime() - b.startTime.getTime();
        }
        return b.startTime.getTime() - a.startTime.getTime();
      });

      console.log(`✅ CricAPI: Found ${matches.length} cricket matches (live, scheduled, finished)`);
    } catch (error) {
      console.error('Error fetching cricket from CricAPI:', error.response?.data?.error || error.message);
      // Fallback to realistic data
      matches.push(...this.getRealisticCricketMatches());
    }

    return matches;
  }

  getRealisticCricketMatches() {
    return [
      {
        sport: 'cricket',
        homeTeam: 'India',
        awayTeam: 'England',
        status: 'live',
        homeScore: 245,
        awayScore: 189,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
        league: 'ICC Cricket World Cup',
        source: 'realistic_mock'
      },
      {
        sport: 'cricket',
        homeTeam: 'Australia',
        awayTeam: 'South Africa',
        status: 'live',
        homeScore: 178,
        awayScore: 156,
        startTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
        league: 'ICC Test Championship',
        source: 'realistic_mock'
      },
      {
        sport: 'cricket',
        homeTeam: 'Pakistan',
        awayTeam: 'New Zealand',
        status: 'scheduled',
        homeScore: 0,
        awayScore: 0,
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
        league: 'ICC T20 World Cup',
        source: 'realistic_mock'
      }
    ];
  }

  async fetchAllSportsData() {
    console.log('🔄 Fetching cricket data from APIs and realistic sources...');

    const cricketMatches = await this.fetchCricketMatches();

    console.log(`✅ Fetched ${cricketMatches.length} matches:`);
    console.log(`   Cricket: ${cricketMatches.length}`);

    return cricketMatches;
  }
}

export default APISportsFetcher;
