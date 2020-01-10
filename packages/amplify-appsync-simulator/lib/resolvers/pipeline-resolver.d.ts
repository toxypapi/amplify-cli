import { AmplifyAppSyncSimulator } from '..';
import { AppSyncSimulatorPipelineResolverConfig } from '../type-definition';
export declare class AppSyncPipelineResolver {
    private simulatorContext;
    private config;
    constructor(config: AppSyncSimulatorPipelineResolverConfig, simulatorContext: AmplifyAppSyncSimulator);
    resolve(source: any, args: any, context: any, info: any): Promise<{}>;
}
