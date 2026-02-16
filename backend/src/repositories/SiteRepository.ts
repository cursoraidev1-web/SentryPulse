import { query, queryOne, insert, execute } from '../config/database';
import { Site } from '../models/types';
import { now } from '../utils/helpers';
import { v4 as uuidv4 } from 'uuid';

export class SiteRepository {
  
  // Find a single site by ID
  async findById(id: number): Promise<Site | null> {
    return queryOne<Site>('SELECT * FROM sites WHERE id = ?', [id]);
  }

  // Find all sites for a specific team
  async findByTeam(teamId: number): Promise<Site[]> {
    return query<Site>(
      'SELECT * FROM sites WHERE team_id = ? ORDER BY created_at DESC', 
      [teamId]
    );
  }

  // Create a new website to track
  async create(data: Partial<Site>): Promise<Site> {
    // Generate a unique tracking code (e.g., SP-A1B2C3D4)
    const trackingCode = `SP-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    const id = await insert(
      `INSERT INTO sites 
      (team_id, name, domain, tracking_code, is_enabled, timezone, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.team_id,
        data.name,
        data.domain,
        trackingCode,
        true, // is_enabled defaults to true
        data.timezone || 'UTC',
        now(),
        now()
      ]
    );

    return this.findById(id) as Promise<Site>;
  }

  // Delete a site
  async delete(id: number): Promise<void> {
    await execute('DELETE FROM sites WHERE id = ?', [id]);
  }
}