import Table, { KeySchema } from 'cloudform-types/types/dynamoDb/table';
import Resolver from 'cloudform-types/types/appSync/resolver';
import Template from 'cloudform-types/types/template';
import { ObjectTypeDefinitionNode, InterfaceTypeDefinitionNode } from 'graphql';
import { ObjectNode } from 'graphql-mapping-template';
export declare class ResourceFactory {
    makeParams(): {};
    /**
     * Creates the barebones template for an application.
     */
    initTemplate(): Template;
    /**
     * Add a GSI for the connection if one does not already exist.
     * @param table The table to add the GSI to.
     */
    updateTableForConnection(table: Table, connectionName: string, connectionAttributeName: string, sortField?: {
        name: string;
        type: string;
    }): Table;
    /**
     * Create a get item resolver for singular connections.
     * @param type The parent type name.
     * @param field The connection field name.
     * @param relatedType The name of the related type to fetch from.
     * @param connectionAttribute The name of the underlying attribute containing the id.
     * @param idFieldName The name of the field within the type that serve as the id.
     * @param sortFieldInfo The info about the sort field if specified.
     */
    makeGetItemConnectionResolver(type: string, field: string, relatedType: string, connectionAttribute: string, idFieldName: string, sortFieldInfo?: {
        primarySortFieldName: string;
        sortFieldName: string;
        sortFieldIsStringLike: boolean;
    }): Resolver;
    /**
     * Create a resolver that queries an item in DynamoDB.
     * @param type
     */
    makeQueryConnectionResolver(type: string, field: string, relatedType: string, connectionAttribute: string, connectionName: string, idFieldName: string, sortKeyInfo?: {
        fieldName: string;
        attributeType: 'S' | 'B' | 'N';
    }, limit?: number): Resolver;
    /**
     * Create a get item resolver for singular connections.
     * @param type The parent type name.
     * @param field The connection field name.
     * @param relatedType The name of the related type to fetch from.
     * @param connectionAttributes The names of the underlying attributes containing the fields to query by.
     * @param keySchema Key schema of the index or table being queried.
     */
    makeGetItemConnectionWithKeyResolver(type: string, field: string, relatedType: string, connectionAttributes: string[], keySchema: KeySchema[]): Resolver;
    /**
     * Create a resolver that queries an item in DynamoDB.
     * @param type The parent type name.
     * @param field The connection field name.
     * @param relatedType The related type to fetch from.
     * @param connectionAttributes The names of the underlying attributes containing the fields to query by.
     * @param keySchema The keySchema for the table or index being queried.
     * @param indexName The index to run the query on.
     */
    makeQueryConnectionWithKeyResolver(type: string, field: string, relatedType: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode, connectionAttributes: string[], keySchema: KeySchema[], indexName: string): Resolver;
    /**
     * Makes the query expression based on whether there is a sort key to be used for the query
     * or not.
     * @param keySchema The key schema for the table or index being queried.
     * @param connectionAttributes The names of the underlying attributes containing the fields to query by.
     */
    makeExpression(keySchema: KeySchema[], connectionAttributes: string[]): ObjectNode;
    private condenseRangeKey;
    makeCompositeSortKeyName(sortKeyName: string): string;
    private getSortKeyNames;
}
