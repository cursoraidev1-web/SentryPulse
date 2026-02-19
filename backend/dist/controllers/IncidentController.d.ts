import { Request, Response } from 'express';
export declare class IncidentController {
    private repo;
    index: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    show: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    store: (req: Request, res: Response) => Promise<void>;
    update: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    resolve: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=IncidentController.d.ts.map