// 👇 CHANGE 1: Import 'query' here so we can fetch lists
import { insert, queryOne, query } from '../config/database';
import { now } from '../utils/helpers';

export class AnalyticsRepository {
  
  // 1. Verify the tracking code exists and get the Site ID
  async getSiteByTrackingId(trackingCode: string) {
    return queryOne('SELECT id, domain FROM sites WHERE tracking_code = ?', [trackingCode]);
  }
  async updateDuration(pageViewId: number, seconds: number) {
    return query(
      'UPDATE page_views SET duration = duration + ? WHERE id = ?',
      [seconds, pageViewId]
    );
  }

  // 2. Save the Page View
  async recordPageView(data: any) {
    return insert(
      `INSERT INTO page_views 
      (site_id, url, referrer, browser, os, device, country, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.site_id,
        data.url,
        data.referrer || null,
        data.browser || 'Unknown',
        data.os || 'Unknown',
        data.device || 'Desktop',
        data.country || 'Unknown',
        data.ip_address || '0.0.0.0', 
        now()
      ]
    );
  }

  // 3. Get quick stats AND Chart Data
  // 3. Get quick stats AND Chart Data
  async getStats(siteId: number) {
    // A. Total Pageviews
    const totalViews: any = await queryOne(
      'SELECT COUNT(*) as count FROM page_views WHERE site_id = ?', 
      [siteId]
    );

    // B. Unique Visitors
    const uniqueVisitors: any = await queryOne(
      'SELECT COUNT(DISTINCT ip_address) as count FROM page_views WHERE site_id = ?', 
      [siteId]
    );

    // C. Last 24 Hours trend
    const recentViews: any = await queryOne(
      `SELECT COUNT(*) as count FROM page_views 
       WHERE site_id = ? AND created_at >= NOW() - INTERVAL 24 HOUR`,
      [siteId]
    );

    // D. Chart Data
    const chartData = await query(
        `SELECT 
            DATE_FORMAT(created_at, '%H:00') as time, 
            COUNT(*) as views 
         FROM page_views 
         WHERE site_id = ? AND created_at >= NOW() - INTERVAL 24 HOUR 
         GROUP BY time 
         ORDER BY MIN(created_at) ASC`,
         [siteId]
    );

    // ✅ E. NEW: Average Duration (Calculate Average Seconds)
    const avgTime: any = await queryOne(
      'SELECT AVG(duration) as avg_duration FROM page_views WHERE site_id = ?',
      [siteId]
    );

    return {
      pageviews: totalViews?.count || 0,
      visitors: uniqueVisitors?.count || 0,
      recent: recentViews?.count || 0,
      chart: chartData || [],
      // Send the average (convert from string/null to number)
      avg_duration: Math.round(Number(avgTime?.avg_duration || 0)) 
    };
  }
}
