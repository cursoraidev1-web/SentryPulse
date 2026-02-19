"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRepository = void 0;
// 👇 CHANGE 1: Import 'query' here so we can fetch lists
const database_1 = require("../config/database");
const helpers_1 = require("../utils/helpers");
class AnalyticsRepository {
    // 1. Verify the tracking code exists and get the Site ID
    async getSiteByTrackingId(trackingCode) {
        return (0, database_1.queryOne)('SELECT id, domain FROM sites WHERE tracking_code = ?', [trackingCode]);
    }
    async updateDuration(pageViewId, seconds) {
        return (0, database_1.query)('UPDATE page_views SET duration = duration + ? WHERE id = ?', [seconds, pageViewId]);
    }
    // 2. Save the Page View
    async recordPageView(data) {
        return (0, database_1.insert)(`INSERT INTO page_views 
      (site_id, url, referrer, browser, os, device, country, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            data.site_id,
            data.url,
            data.referrer || null,
            data.browser || 'Unknown',
            data.os || 'Unknown',
            data.device || 'Desktop',
            data.country || 'Unknown',
            data.ip_address || '0.0.0.0',
            (0, helpers_1.now)()
        ]);
    }
    // 3. Get quick stats AND Chart Data
    // 3. Get quick stats AND Chart Data
    async getStats(siteId) {
        // A. Total Pageviews
        const totalViews = await (0, database_1.queryOne)('SELECT COUNT(*) as count FROM page_views WHERE site_id = ?', [siteId]);
        // B. Unique Visitors
        const uniqueVisitors = await (0, database_1.queryOne)('SELECT COUNT(DISTINCT ip_address) as count FROM page_views WHERE site_id = ?', [siteId]);
        // C. Last 24 Hours trend
        const recentViews = await (0, database_1.queryOne)(`SELECT COUNT(*) as count FROM page_views 
       WHERE site_id = ? AND created_at >= NOW() - INTERVAL 24 HOUR`, [siteId]);
        // D. Chart Data
        const chartData = await (0, database_1.query)(`SELECT 
            DATE_FORMAT(created_at, '%H:00') as time, 
            COUNT(*) as views 
         FROM page_views 
         WHERE site_id = ? AND created_at >= NOW() - INTERVAL 24 HOUR 
         GROUP BY time 
         ORDER BY MIN(created_at) ASC`, [siteId]);
        // ✅ E. NEW: Average Duration (Calculate Average Seconds)
        const avgTime = await (0, database_1.queryOne)('SELECT AVG(duration) as avg_duration FROM page_views WHERE site_id = ?', [siteId]);
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
exports.AnalyticsRepository = AnalyticsRepository;
//# sourceMappingURL=AnalyticsRepository.js.map