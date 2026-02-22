import APISportsFetcher from './apiSportsFetcher.js';
import { db } from '../db/db.js';
import { matches, commentary } from '../db/schema.js';
import { eq, and, or } from 'drizzle-orm';

class RealDataSync {
  constructor(appLocals = {}) {
    this.fetcher = new APISportsFetcher();
    this.appLocals = appLocals;
  }

  async syncMatchesWithDatabase() {
    try {
      console.log('🔄 Syncing real sports data with database...');

      // Fetch real data
      const realMatches = await this.fetcher.fetchAllSportsData();

      if (realMatches.length === 0) {
        console.log('⚠️ No live matches found from official sources');
        return;
      }

      // Insert or Update real matches (Upsert)
      const insertedMatches = [];
      const updatedMatches = [];

      for (const match of realMatches) {
        try {
          const existing = await db.select().from(matches).where(
            and(
              eq(matches.homeTeam, match.homeTeam),
              eq(matches.awayTeam, match.awayTeam),
              eq(matches.sport, match.sport)
            )
          ).limit(1);

          if (existing.length > 0) {
            const e = existing[0];
            const hasScoreChanged = e.homeScore !== match.homeScore || e.awayScore !== match.awayScore;

            await db.update(matches).set({
              matchType: match.matchType,
              league: match.league,
              status: match.status,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              endTime: match.endTime
            }).where(eq(matches.id, e.id));

            if (hasScoreChanged) {
              console.log(`⬆️ Score updated: ${match.homeTeam} vs ${match.awayTeam}: ${match.homeScore}-${match.awayScore}`);
              if (this.appLocals.broadcastScoreUpdate) {
                this.appLocals.broadcastScoreUpdate(e.id, {
                  homeScore: match.homeScore,
                  awayScore: match.awayScore
                });
              }

              // Generate commentary for the score change if it's lively
              if (match.status === 'live') {
                const commentaryTemplates = this.getCommentaryTemplates(match.sport);
                const template = commentaryTemplates[Math.floor(Math.random() * commentaryTemplates.length)];
                const commentaryText = this.interpolateTemplate(template, match) + ` Score is now ${match.homeScore}-${match.awayScore}.`;

                const [newCommentary] = await db.insert(commentary).values({
                  matchId: e.id,
                  minute: Math.floor(Math.random() * 90) + 1,
                  sequence: Math.floor(Math.random() * 100),
                  period: this.getPeriod(match.sport),
                  eventType: 'score_update',
                  actor: this.getRandomTeam(match),
                  team: this.getRandomTeam(match),
                  message: commentaryText,
                  metadata: { source: 'real_data_sync' },
                  tags: ['live', 'real'],
                }).returning();

                if (this.appLocals.broadcastCommentary) {
                  this.appLocals.broadcastCommentary(e.id, newCommentary);
                }
              }

            }
            updatedMatches.push(e);
          } else {
            const [inserted] = await db.insert(matches).values({
              sport: match.sport,
              matchType: match.matchType,
              league: match.league,
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              status: match.status,
              startTime: match.startTime,
              endTime: match.endTime,
              homeScore: match.homeScore,
              awayScore: match.awayScore
            }).returning();

            insertedMatches.push(inserted);
            console.log(`✅ Added: ${match.homeTeam} vs ${match.awayTeam} (${match.sport}) - ${match.homeScore}-${match.awayScore}`);
          }
        } catch (error) {
          console.error(`❌ Failed to process match: ${match.homeTeam} vs ${match.awayTeam}`, error.message);
        }
      }

      console.log(`🎉 Sync summary: ${insertedMatches.length} new matches, ${updatedMatches.length} updated matches!`);

      return insertedMatches.concat(updatedMatches);
    } catch (error) {
      console.error('❌ Error syncing data:', error);
      throw error;
    }
  }

  async generateCommentaryForLiveMatches(matches) {
    const liveMatches = matches.filter(m => m.status === 'live');

    for (const match of liveMatches) {
      const commentaryTemplates = this.getCommentaryTemplates(match.sport);
      const numCommentary = Math.floor(Math.random() * 5) + 3; // 3-7 commentary items

      for (let i = 0; i < numCommentary; i++) {
        const template = commentaryTemplates[Math.floor(Math.random() * commentaryTemplates.length)];
        const commentaryText = this.interpolateTemplate(template, match);

        try {
          await db.insert(commentary).values({
            matchId: match.id,
            minute: Math.floor(Math.random() * 90) + 1,
            sequence: i + 1,
            period: this.getPeriod(match.sport),
            eventType: 'score_update',
            actor: this.getRandomTeam(match),
            team: this.getRandomTeam(match),
            message: commentaryText,
            metadata: { source: 'real_data_sync' },
            tags: ['live', 'real'],
            createdAt: new Date(Date.now() - (i * 60000)) // Stagger timestamps
          });
        } catch (error) {
          console.error('Error inserting commentary:', error.message);
        }
      }
    }

    console.log(`📝 Generated commentary for ${liveMatches.length} live matches`);
  }

  getCommentaryTemplates(sport) {
    const templates = [
      "{{actor}} hits a boundary! Excellent shot finding the gap.",
      "WICKET! {{actor}} is out. Big breakthrough for the bowling side.",
      "{{actor}} plays a defensive shot, well judged.",
      "FOUR! {{actor}} finds the rope with a beautiful cover drive.",
      "SIX! {{actor}} sends it over the ropes for maximum.",
      "Excellent over from {{actor}}, just 3 runs from it.",
      "{{actor}} is batting with confidence, building a solid partnership."
    ];

    return templates;
  }

  interpolateTemplate(template, match) {
    const team = Math.random() > 0.5 ? match.homeTeam : match.awayTeam;
    return template.replace(/{{actor}}/g, team);
  }

  getPeriod(sport) {
    return 'innings';
  }

  getRandomTeam(match) {
    return Math.random() > 0.5 ? match.homeTeam : match.awayTeam;
  }

  startRealTimeSync(intervalMinutes = 5) {
    console.log(`🚀 Starting real-time sports data sync every ${intervalMinutes} minutes`);

    // Sync immediately
    this.syncMatchesWithDatabase();

    // Schedule regular sync
    setInterval(async () => {
      try {
        await this.syncMatchesWithDatabase();
      } catch (error) {
        console.error('Scheduled sync failed:', error.message);
      }
    }, intervalMinutes * 60 * 1000);
  }
}

export default RealDataSync;
