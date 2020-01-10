import { Transformer, TransformerContext } from 'graphql-transformer-core';
import { ObjectTypeDefinitionNode, FieldDefinitionNode, DirectiveNode } from 'graphql';
export declare class FunctionTransformer extends Transformer {
    constructor();
    /**
     * Add the required resources to invoke a lambda function for this field.
     */
    field: (parent: ObjectTypeDefinitionNode, definition: FieldDefinitionNode, directive: DirectiveNode, ctx: TransformerContext) => void;
    /**
     * Create a role that allows our AppSync API to talk to our Lambda function.
     */
    role: (name: string, region: string) => any;
    /**
     * Creates a lambda data source that registers the lambda function and associated role.
     */
    datasource: (name: string, region: string) => any;
    /**
     * Create a new pipeline function that calls out to the lambda function and returns the value.
     */
    function: (name: string, region: string) => any;
    /**
     * Create a resolver of one that calls the "function" function.
     */
    resolver: (type: string, field: string, name: string, region?: string) => any;
    appendFunctionToResolver(resolver: any, functionId: string): any;
}
