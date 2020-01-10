import { Transformer, TransformerContext } from 'graphql-transformer-core';
import { ObjectTypeDefinitionNode, DirectiveNode } from 'graphql';
export declare class VersionedModelTransformer extends Transformer {
    constructor();
    /**
     * When a type is annotated with @versioned enable conflict resolution for the type.
     *
     * Usage:
     *
     * type Post @model @versioned(versionField: "version", versionInput: "expectedVersion") {
     *   id: ID!
     *   title: String
     *   version: Int!
     * }
     *
     * Enabling conflict resolution automatically manages a "version" attribute in
     * the @model type's DynamoDB table and injects a conditional expression into
     * the types mutations that actually perform the conflict resolutions by
     * checking the "version" attribute in the table with the "expectedVersion" passed
     * by the user.
     */
    object: (def: ObjectTypeDefinitionNode, directive: DirectiveNode, ctx: TransformerContext) => void;
    /**
     * Set the "version"  to 1.
     * @param ctx
     * @param versionField
     * @param versionInput
     */
    private augmentCreateMutation;
    /**
     * Prefix the update operation with a conditional expression that checks
     * the object versions.
     * @param ctx
     * @param versionField
     * @param versionInput
     */
    private augmentDeleteMutation;
    private augmentUpdateMutation;
    private stripCreateInputVersionedField;
    private addVersionedInputToUpdateInput;
    private addVersionedInputToDeleteInput;
    private addVersionedInputToInput;
    private enforceVersionedFieldOnType;
}
