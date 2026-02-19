import { Request, Response } from 'express';
export declare class StatusPageController {
    private repo;
    index: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    show: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getBySlug: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    store: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    update: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    destroy: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    addMonitor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    removeMonitor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=StatusPageController.d.ts.map