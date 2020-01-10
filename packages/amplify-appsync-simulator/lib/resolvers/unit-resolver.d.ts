import { AmplifyAppSyncSimulator } from '..';
import { AppSyncSimulatorUnitResolverConfig } from '../type-definition';
export declare class AppSyncUnitResolver {
    private simulatorContext;
    private config;
    constructor(config: AppSyncSimulatorUnitResolverConfig, simulatorContext: AmplifyAppSyncSimulator);
    resolve(source: any, args: any, context: any, info: any): Promise<any>;
}
