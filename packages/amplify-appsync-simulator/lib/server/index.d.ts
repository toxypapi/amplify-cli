import { AmplifyAppSyncSimulator } from '..';
import { AppSyncSimulatorServerConfig } from '../type-definition';
export declare class AppSyncSimulatorServer {
    private operationServer;
    private subscriptionServer;
    constructor(config: AppSyncSimulatorServerConfig, simulatorContext: AmplifyAppSyncSimulator);
    start(): Promise<void>;
    stop(): void;
    readonly url: {
        graphql: string;
        subscription: string;
    };
}
