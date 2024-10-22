import { Request, Response } from 'express';
import { ApiGatewayService } from './api-gateway.service';
export declare class ApiGatewayController {
    private readonly apiGatewayService;
    constructor(apiGatewayService: ApiGatewayService);
    handleRequest(req: Request, res: Response): Promise<void>;
    private getServiceName;
    private handleProxyError;
}
