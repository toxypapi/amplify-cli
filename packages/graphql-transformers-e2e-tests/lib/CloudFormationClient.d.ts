import { CloudFormation } from 'aws-sdk';
import { StackStatus } from 'aws-sdk/clients/cloudformation';
export declare class CloudFormationClient {
    region: string;
    client: CloudFormation;
    constructor(region: string);
    createStack(template: any, name: string, defParams?: any, addAppSyncApiName?: boolean): Promise<CloudFormation.CreateStackOutput>;
    deleteStack(name: string): Promise<{}>;
    describeStack(name: string): Promise<CloudFormation.Stack>;
    /**
     * Periodically polls a stack waiting for a status change. If the status
     * changes to success then this resolves if it changes to error then it rejects.
     * @param name: The stack name to wait for
     * @param success: The status' that indicate success.
     * @param failure: The status' that indicate failure.
     * @param poll: The status' that indicate to keep polling.
     * @param maxPolls: The max number of times to poll.
     * @param pollInterval: The frequency of polling.
     */
    waitForStack(name: string, success?: StackStatus[], failure?: StackStatus[], poll?: StackStatus[], maxPolls?: number, pollInterval?: number): Promise<CloudFormation.Stack>;
    /**
     * Promise wrapper around setTimeout.
     * @param secs The number of seconds to wait.
     * @param fun The function to call after waiting.
     * @param args The arguments to pass to the function after the wait.
     */
    wait<T>(secs: number, fun: (...args: any[]) => Promise<T>, ...args: any[]): Promise<T>;
}
