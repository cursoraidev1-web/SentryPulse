import { Request, Response } from 'express';
export declare class TeamController {
    index(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    store(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    show(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    update(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    destroy(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    addMember(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    removeMember(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=TeamController.d.ts.map