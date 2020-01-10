import { CloudFormationParseContext } from './types';
import { AmplifyAppSyncSimulatorConfig, AmplifyAppSyncAPIConfig } from 'amplify-appsync-simulator';
export declare function dynamoDBResourceHandler(resourceName: any, resource: any, cfnContext: CloudFormationParseContext, transformResult: any): any;
export declare function graphQLDataSource(resourceName: any, resource: any, cfnContext: CloudFormationParseContext, transformResult: any): {
    name: any;
    type: string;
    config: {
        tableName: any;
    };
    LambdaFunctionArn?: undefined;
} | {
    name: any;
    type: string;
    config?: undefined;
    LambdaFunctionArn?: undefined;
} | {
    type: string;
    name: any;
    LambdaFunctionArn: any;
    config?: undefined;
};
export declare function graphQLAPIResourceHandler(resourceName: any, resource: any, cfnContext: CloudFormationParseContext, transformResult: any): AmplifyAppSyncAPIConfig;
export declare function graphQLAPIKeyResourceHandler(resourceName: any, resource: any, cfnContext: CloudFormationParseContext, transformResult: any): {
    type: any;
    value: string;
    ref: string;
};
export declare function graphQLSchemaHandler(resourceName: any, resource: any, cfnContext: CloudFormationParseContext, transformResult: any): {
    content: any;
    path: string;
};
export declare function graphQLResolverHandler(resourceName: any, resource: any, cfnContext: CloudFormationParseContext, transformResult: any): {
    dataSourceName: any;
    typeName: any;
    functions: any;
    fieldName: any;
    requestMappingTemplateLocation: any;
    responseMappingTemplateLocation: any;
    kind: any;
};
export declare function graphqlFunctionHandler(resourceName: any, resource: any, cfnContext: CloudFormationParseContext, transformResult: any): {
    name: any;
    dataSourceName: any;
    requestMappingTemplateLocation: any;
    responseMappingTemplateLocation: any;
};
export declare function processResources(resources: any, transformResult: any, params?: {}): AmplifyAppSyncSimulatorConfig;
