import { Transformer, TransformerContext } from 'graphql-transformer-core';
import { DirectiveNode, ObjectTypeDefinitionNode } from 'graphql';
import { ResourceFactory } from './resources';
/**
 * Handles the @searchable directive on OBJECT types.
 */
export declare class SearchableModelTransformer extends Transformer {
    resources: ResourceFactory;
    constructor();
    before: (ctx: TransformerContext) => void;
    /**
     * Given the initial input and context manipulate the context to handle this object directive.
     * @param initial The input passed to the transform.
     * @param ctx The accumulated context for the transform.
     */
    object: (def: ObjectTypeDefinitionNode, directive: DirectiveNode, ctx: TransformerContext) => void;
    private generateSearchableXConnectionType;
    private typeExist;
    private generateSearchableInputs;
    private getPrimaryKey;
}
