import { Lambda } from 'aws-sdk';
export declare class LambdaHelper {
    client: Lambda;
    constructor(region?: string);
    createFunction(name: string, roleArn: string, filePrefix: string): Promise<import("aws-sdk/lib/request").PromiseResult<Lambda.FunctionConfiguration, import("aws-sdk").AWSError>>;
    deleteFunction(name: string): Promise<{
        $response: import("aws-sdk").Response<{}, import("aws-sdk").AWSError>;
    }>;
}
