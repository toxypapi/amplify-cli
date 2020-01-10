export declare type CloudFormationParseContext = {
    params: any;
    conditions: object;
    resources: object;
    exports: object;
};
export declare type CloudFormationWalkContext = CloudFormationParseContext & {
    walkFn: Function;
    parent: Object;
    path: string[];
};
export declare type AWSCloudFormationParameterDefinition = {
    Type: string;
    Default?: string;
    Description?: string;
};
export declare type AWSCloudFormationParametersBlock = {
    [key: string]: AWSCloudFormationParameterDefinition;
};
