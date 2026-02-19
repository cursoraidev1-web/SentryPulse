import { Request, Response } from 'express';
export declare class AnalyticsController {
    private siteRepo;
    private analyticsRepo;
    getSites: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getSite: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createSite: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    collectEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    pulse: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateSite: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteSite: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getStats: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=AnalyticsController.d.ts.map