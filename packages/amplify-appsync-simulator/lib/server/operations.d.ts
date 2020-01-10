import { AmplifyAppSyncSimulator } from '..';
import { AppSyncSimulatorServerConfig } from '../type-definition';
import { SubscriptionServer } from './subscription';
export declare class OperationServer {
    private config;
    private simulatorContext;
    private subscriptionServer;
    private app;
    private server;
    private connection;
    private port;
    url: string;
    constructor(config: AppSyncSimulatorServerConfig, simulatorContext: AmplifyAppSyncSimulator, subscriptionServer: SubscriptionServer);
    start(): Promise<any>;
    stop(): void;
    private handleAPIInfoRequest;
    private handleRequest;
    private checkAuthorization;
    private getAllowedAuthTypes;
    private isCognitoUserPoolToken;
    private isOidcToken;
}
