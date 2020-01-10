import { Transformer, TransformerContext } from 'graphql-transformer-core';
import { ObjectTypeDefinitionNode, DirectiveNode } from 'graphql';
export declare class KeyTransformer extends Transformer {
    constructor();
    /**
     * Augment the table key structures based on the @key.
     */
    object: (definition: ObjectTypeDefinitionNode, directive: DirectiveNode, ctx: TransformerContext) => void;
    /**
     * Update the existing @model table's index structures. Includes primary key, GSI, and LSIs.
     * @param definition The object type definition node.
     * @param directive The @key directive
     * @param ctx The transformer context
     */
    private updateIndexStructures;
    /**
     * Update the structural components of the schema that are relevant to the new index structures.
     *
     * Updates:
     * 1. getX with new primary key information.
     * 2. listX with new primary key information.
     *
     * Creates:
     * 1. A query field for each secondary index.
     */
    private updateSchema;
    /**
     * Update the get, list, create, update, and delete resolvers with updated key information.
     */
    private updateResolvers;
    private addKeyConditionInputs;
    /**
     * Updates query fields to include any arguments required by the key structures.
     * @param definition The object type definition node.
     * @param directive The @key directive
     * @param ctx The transformer context
     */
    private updateQueryFields;
    private updateGetField;
    private updateListField;
    private ensureQueryField;
    private generateModelXConnectionType;
    private updateInputObjects;
    private setKeySnippet;
    private validateKeyUpdateArgumentsSnippet;
    /**
     * Validates the directive usage is semantically valid.
     *
     * 1. There may only be 1 @key without a name (specifying the primary key)
     * 2. There may only be 1 @key with a given name.
     * 3. @key must only reference existing scalar fields that map to DynamoDB S, N, or B.
     * 4. A primary key must not include a 'queryField'.
     * 5. If there is no primary sort key, make sure there are no more LSIs.
     * @param definition The object type definition node.
     * @param directive The @key directive
     * @param ctx The transformer context
     */
    private validate;
    /**
     * Returns true if the directive specifies a primary key.
     * @param directive The directive node.
     */
    isPrimaryKey: (directive: DirectiveNode) => boolean;
    /**
     * Replace the primary key schema with one defined by a @key.
     * @param definition The object type definition node.
     * @param directive The @key directive
     * @param ctx The transformer context
     */
    replacePrimaryKey: (definition: ObjectTypeDefinitionNode, directive: DirectiveNode, ctx: TransformerContext) => void;
    /**
     * Add a LSI or GSI to the table as defined by a @key.
     * @param definition The object type definition node.
     * @param directive The @key directive
     * @param ctx The transformer context
     */
    appendSecondaryIndex: (definition: ObjectTypeDefinitionNode, directive: DirectiveNode, ctx: TransformerContext) => void;
    private updateMutationConditionInput;
    private typeExist;
}
