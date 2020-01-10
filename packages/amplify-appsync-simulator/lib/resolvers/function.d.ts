import { AmplifyAppSyncSimulator } from '..';
import { AppSyncSimulatorFunctionResolverConfig } from '../type-definition';
export declare class AmplifySimulatorFunction {
    private config;
    private simulatorContext;
    constructor(config: AppSyncSimulatorFunctionResolverConfig, simulatorContext: AmplifyAppSyncSimulator);
    resolve(source: any, args: any, stash: any, prevResult: any, context: any, info: any): Promise<{
        result: any;
        stash: any;
    }>;
}
