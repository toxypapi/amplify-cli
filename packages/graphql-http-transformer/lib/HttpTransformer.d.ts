import { Transformer, TransformerContext } from 'graphql-transformer-core';
import { DirectiveNode, ObjectTypeDefinitionNode, FieldDefinitionNode, InterfaceTypeDefinitionNode } from 'graphql';
import { ResourceFactory } from './resources';
export interface HttpHeader {
    key: String;
    value: String;
}
/**
 * The @http transform.
 *
 * This transform attaches http resolvers to any fields with the @http directive.
 * Works with GET, POST, PUT, DELETE requests.
 */
export declare class HttpTransformer extends Transformer {
    resources: ResourceFactory;
    static urlRegex: RegExp;
    constructor();
    before: (ctx: TransformerContext) => void;
    /**
     * Create and configure the HTTP resolver for this field
     */
    field: (parent: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode, field: FieldDefinitionNode, directive: DirectiveNode, ctx: TransformerContext) => void;
}
