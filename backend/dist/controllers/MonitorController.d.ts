import { Request, Response } from 'express';
export declare class MonitorController {
    index(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    show(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    store(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    update(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    destroy(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    checks(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    runCheck(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=MonitorController.d.ts.map