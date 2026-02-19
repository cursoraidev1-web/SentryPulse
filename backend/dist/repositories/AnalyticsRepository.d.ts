export declare class AnalyticsRepository {
    getSiteByTrackingId(trackingCode: string): Promise<any>;
    updateDuration(pageViewId: number, seconds: number): Promise<any[]>;
    recordPageView(data: any): Promise<number>;
    getStats(siteId: number): Promise<{
        pageviews: any;
        visitors: any;
        recent: any;
        chart: any[];
        avg_duration: number;
    }>;
}
//# sourceMappingURL=AnalyticsRepository.d.ts.map