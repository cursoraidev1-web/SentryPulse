"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const SiteRepository_1 = require("../repositories/SiteRepository");
const AnalyticsRepository_1 = require("../repositories/AnalyticsRepository");
class AnalyticsController {
    siteRepo = new SiteRepository_1.SiteRepository();
    analyticsRepo = new AnalyticsRepository_1.AnalyticsRepository();
    // GET /api/analytics/sites?team_id=1
    getSites = async (req, res) => {
        try {
            const teamId = Number(req.query.team_id || req.params.teamId);
            if (!teamId) {
                return res.status(400).json({ message: 'Team ID is required' });
            }
            const sites = await this.siteRepo.findByTeam(teamId);
            res.json({
                success: true,
                data: { sites }
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    // GET /api/analytics/site/:id
    getSite = async (req, res) => {
        try {
            const id = Number(req.params.id);
            const site = await this.siteRepo.findById(id);
            if (!site) {
                return res.status(404).json({ message: 'Site not found' });
            }
            res.json({
                success: true,
                data: site
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    // POST /api/analytics/sites
    createSite = async (req, res) => {
        try {
            const { team_id, name, domain, timezone } = req.body;
            if (!team_id || !name || !domain) {
                return res.status(400).json({ message: 'Team ID, Name, and Domain are required' });
            }
            const site = await this.siteRepo.create({
                team_id,
                name,
                domain,
                timezone
            });
            res.status(201).json({
                success: true,
                data: { site }
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    // POST /api/analytics/collect (Saves data & Returns ID)
    // ✅ 1. COLLECT EVENT (Final Fix)
    collectEvent = async (req, res) => {
        try {
            const { tracking_code, url, referrer, browser, os, device, country } = req.body;
            const site = await this.analyticsRepo.getSiteByTrackingId(tracking_code);
            if (!site)
                return res.json({ success: false });
            // Save to DB (The result IS the ID)
            const insertId = await this.analyticsRepo.recordPageView({
                site_id: site.id,
                url, referrer, browser, os, device, country,
                ip_address: req.ip || req.socket.remoteAddress
            });
            console.log(`[Analytics] New Visit Recorded! ID: ${insertId}`);
            // Return the ID
            if (insertId) {
                res.json({ success: true, id: insertId });
            }
            else {
                res.json({ success: false });
            }
        }
        catch (error) {
            console.error('Collect Error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    };
    // POST /api/analytics/pulse (Updates Time on Site)
    pulse = async (req, res) => {
        try {
            const { id } = req.body; // The Page View ID sent by the script
            if (!id)
                return res.json({ success: false });
            // Add 5 seconds to the duration
            await this.analyticsRepo.updateDuration(id, 5);
            // console.log(`[Analytics] Pulse for ID: ${id}`); // Uncomment to debug pulses
            res.json({ success: true });
        }
        catch (error) {
            // Don't crash on pulse errors, just ignore them safely
            res.json({ success: false });
        }
    };
    // PUT /api/analytics/sites/:id
    updateSite = async (req, res) => {
        try {
            const id = Number(req.params.id);
            const site = await this.siteRepo.findById(id);
            if (!site)
                return res.status(404).json({ message: 'Site not found' });
            const { name, domain, timezone, is_enabled } = req.body;
            await this.siteRepo.update(id, { name, domain, timezone, is_enabled });
            const updated = await this.siteRepo.findById(id);
            res.json({ success: true, data: updated });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    // DELETE /api/analytics/sites/:id
    deleteSite = async (req, res) => {
        try {
            const id = Number(req.params.id);
            const existing = await this.siteRepo.findById(id);
            if (!existing)
                return res.status(404).json({ message: 'Site not found' });
            await this.siteRepo.delete(id);
            res.json({ success: true, message: 'Site deleted' });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    // GET /api/analytics/sites/:id/stats (Reads data for Dashboard)
    getStats = async (req, res) => {
        try {
            const id = Number(req.params.id);
            // Get the stats from repo
            const stats = await this.analyticsRepo.getStats(id);
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
}
exports.AnalyticsController = AnalyticsController;
//# sourceMappingURL=AnalyticsController.js.map