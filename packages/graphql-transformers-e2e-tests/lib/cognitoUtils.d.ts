import { CreateGroupResponse, CreateUserPoolResponse, CreateUserPoolClientResponse } from 'aws-sdk/clients/cognitoidentityserviceprovider';
import * as CognitoClient from 'aws-sdk/clients/cognitoidentityserviceprovider';
import DeploymentResources from 'graphql-transformer-core/lib/DeploymentResources';
interface E2Econfiguration {
    STACK_NAME?: string;
    AUTH_ROLE_NAME?: string;
    UNAUTH_ROLE_NAME?: string;
    IDENTITY_POOL_NAME?: string;
    USER_POOL_CLIENTWEB_NAME?: string;
    USER_POOL_CLIENT_NAME?: string;
    USER_POOL_ID?: string;
}
export declare function configureAmplify(userPoolId: string, userPoolClientId: string, identityPoolId?: string): void;
export declare function signupUser(userPoolId: string, name: string, pw: string): Promise<unknown>;
export declare function authenticateUser(user: any, details: any, realPw: string): Promise<unknown>;
export declare function signupAndAuthenticateUser(userPoolId: string, username: string, tmpPw: string, realPw: string): Promise<any>;
export declare function deleteUser(accessToken: string): Promise<{}>;
export declare function createGroup(userPoolId: string, name: string): Promise<CreateGroupResponse>;
export declare function addUserToGroup(groupName: string, username: string, userPoolId: string): Promise<unknown>;
export declare function createUserPool(client: CognitoClient, userPoolName: string): Promise<CreateUserPoolResponse>;
export declare function deleteUserPool(client: CognitoClient, userPoolId: string): Promise<{}>;
export declare function createUserPoolClient(client: CognitoClient, userPoolId: string, clientName: string): Promise<CreateUserPoolClientResponse>;
export declare function addIAMRolesToCFNStack(out: DeploymentResources, e2eConfig: E2Econfiguration): DeploymentResources;
export {};
