import { DocumentNode, ExecutionResult } from 'graphql';
import { AmplifyAppSyncSimulator } from '..';
import { AppSyncSimulatorServerConfig } from '../type-definition';
export declare class SubscriptionServer {
    private config;
    private appSyncServerContext;
    private registrations;
    private iteratorTimeout;
    private webSocketServer;
    private mqttServer;
    url: string;
    private port;
    private publishingTopics;
    constructor(config: AppSyncSimulatorServerConfig, appSyncServerContext: AmplifyAppSyncSimulator);
    start(): Promise<any>;
    stop(): void;
    afterClientConnect(client: any): Promise<void>;
    afterSubscription(topic: any, client: any): Promise<void>;
    afterUnsubscribe(topic: any, client: any): void;
    afterDisconnect(client: any): void;
    register(documentAST: any, variables: any, context: any): Promise<{
        errors: any;
        data: import("graphql/execution/execute").ExecutionResultDataDefault;
        extensions?: undefined;
    } | {
        extensions: {
            subscription: {
                mqttConnections: {
                    url: string;
                    topics: any;
                    client: string;
                }[];
                newSubscriptions: {
                    [x: number]: {
                        topic: string;
                        expireTime: number;
                    };
                };
            };
        };
        errors?: undefined;
        data?: undefined;
    }>;
    subscribeToGraphQL(document: DocumentNode, variables: object, context: any): Promise<ExecutionResult<import("graphql/execution/execute").ExecutionResultDataDefault> | AsyncIterableIterator<ExecutionResult<import("graphql/execution/execute").ExecutionResultDataDefault>>>;
    private shouldPublishSubscription;
}
