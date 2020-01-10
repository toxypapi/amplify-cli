import { AmplifyAppSyncSimulator } from 'amplify-appsync-simulator';
export declare function launchDDBLocal(): Promise<{
    emulator: any;
    dbPath: any;
    client: any;
}>;
export declare function deploy(transformerOutput: any, client?: any): Promise<{
    simulator: AmplifyAppSyncSimulator;
    config: any;
}>;
export declare function terminateDDB(emulator: any, dbPath: any): Promise<void>;
export declare function runAppSyncSimulator(config: any, port?: number, wsPort?: number): Promise<AmplifyAppSyncSimulator>;
export declare function logDebug(...msgs: any[]): void;
