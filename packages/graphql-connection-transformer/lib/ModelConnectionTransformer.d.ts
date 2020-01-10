import { Transformer, TransformerContext } from 'graphql-transformer-core';
import { DirectiveNode, ObjectTypeDefinitionNode, FieldDefinitionNode, InterfaceTypeDefinitionNode } from 'graphql';
import { ResourceFactory } from './resources';
/**
 * The @connection transform.
 *
 * This transform configures the GSIs and resolvers needed to implement
 * relationships at the GraphQL level.
 */
export declare class ModelConnectionTransformer extends Transformer {
    resources: ResourceFactory;
    constructor();
    before: (ctx: TransformerContext) => void;
    /**
     * Create a 1-1, 1-M, or M-1 connection between two model types.
     * Throws an error if the related type is not an object type annotated with @model.
     */
    field: (parent: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode, field: FieldDefinitionNode, directive: DirectiveNode, ctx: TransformerContext) => void;
    /**
     * The @connection parameterization with "fields" can be used to connect objects by running a query on a table.
     * The directive is given an index to query and a list of fields to query by such that it
     * returns a list objects (or in certain cases a single object) that are connected to the
     * object it is called on.
     * This directive is designed to leverage indices configured using @key to create relationships.
     *
     * Directive Definition:
     * @connection(keyName: String, fields: [String!]!) on FIELD_DEFINITION
     * param @keyName The name of the index configured using @key that should be queried to get
     *      connected objects
     * param @fields The names of the fields on the current object to query by.
     */
    connectionWithKey: (parent: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode, field: FieldDefinitionNode, directive: DirectiveNode, ctx: TransformerContext) => void;
    private typeExist;
    private generateModelXConnectionType;
    private generateFilterAndKeyConditionInputs;
    private supportsConditions;
    private extendTypeWithConnection;
    private getPrimaryKeyField;
    private getSortField;
}
