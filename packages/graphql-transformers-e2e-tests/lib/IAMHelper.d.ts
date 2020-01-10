import { IAM } from 'aws-sdk';
export declare class IAMHelper {
    client: IAM;
    constructor(region?: string);
    createLambdaExecutionRole(name: string): Promise<import("aws-sdk/lib/request").PromiseResult<IAM.CreateRoleResponse, import("aws-sdk").AWSError>>;
    createLambdaExecutionPolicy(name: string): Promise<import("aws-sdk/lib/request").PromiseResult<IAM.CreatePolicyResponse, import("aws-sdk").AWSError>>;
    attachLambdaExecutionPolicy(policyArn: string, roleName: string): Promise<{
        $response: import("aws-sdk").Response<{}, import("aws-sdk").AWSError>;
    }>;
    deletePolicy(policyArn: string): Promise<{
        $response: import("aws-sdk").Response<{}, import("aws-sdk").AWSError>;
    }>;
    deleteRole(roleName: string): Promise<{
        $response: import("aws-sdk").Response<{}, import("aws-sdk").AWSError>;
    }>;
    detachLambdaExecutionPolicy(policyArn: string, roleName: string): Promise<{
        $response: import("aws-sdk").Response<{}, import("aws-sdk").AWSError>;
    }>;
}
