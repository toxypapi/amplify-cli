import { ObjectTypeDefinitionNode, SchemaDefinitionNode, InputObjectTypeDefinitionNode, DocumentNode } from 'graphql';
import { IRelationalDBReader } from './IRelationalDBReader';
/**
 * This class is used to transition all of the columns and key metadata from a table for use
 * in generating appropriate GraphQL schema structures. It will track type definitions for
 * the base table, update mutation inputs, create mutation inputs, and primary key metadata.
 */
export declare class TableContext {
    tableTypeDefinition: ObjectTypeDefinitionNode;
    createTypeDefinition: InputObjectTypeDefinitionNode;
    updateTypeDefinition: InputObjectTypeDefinitionNode;
    tableKeyField: string;
    tableKeyFieldType: string;
    stringFieldList: string[];
    intFieldList: string[];
    constructor(typeDefinition: ObjectTypeDefinitionNode, createDefinition: InputObjectTypeDefinitionNode, updateDefinition: InputObjectTypeDefinitionNode, primaryKeyField: string, primaryKeyType: string, stringFieldList: string[], intFieldList: string[]);
}
/**
 * This class is used to transition all of the information needed to generate the
 * CloudFormation template. This is the class that is outputted by the SchemaTransformer and the one that
 * RelationalDBTemplateGenerator takes in for the constructor. It tracks the graphql schema document,
 * map of the primary keys for each of the types. It is also being used to track the CLI inputs needed
 * for DataSource Creation, as data source creation is apart of the cfn template generation.
 */
export declare class TemplateContext {
    schemaDoc: DocumentNode;
    typePrimaryKeyMap: Map<string, string>;
    typePrimaryKeyTypeMap: Map<string, string>;
    stringFieldMap: Map<string, string[]>;
    intFieldMap: Map<string, string[]>;
    secretStoreArn: string;
    rdsClusterIdentifier: string;
    databaseName: string;
    databaseSchema: string;
    region: string;
    constructor(schemaDoc: DocumentNode, typePrimaryKeyMap: Map<string, string>, stringFieldMap: Map<string, string[]>, intFieldMap: Map<string, string[]>, typePrimaryKeyTypeMap?: Map<string, string>);
}
export declare class RelationalDBSchemaTransformer {
    dbReader: IRelationalDBReader;
    database: string;
    constructor(dbReader: IRelationalDBReader, database: string);
    introspectDatabaseSchema: () => Promise<TemplateContext>;
    /**
     * Creates a schema type definition node, including operations for each of query, mutation, and subscriptions.
     *
     * @returns a basic schema definition node.
     */
    getSchemaType(): SchemaDefinitionNode;
    /**
     * Generates the basic mutation operations, given the provided table contexts. This will
     * create a create, delete, and update operation for each table.
     *
     * @param types the table contexts from which the mutations are to be generated.
     * @returns the type definition for mutations, including a create, delete, and update for each table.
     */
    private getMutations;
    /**
     * Generates the basic subscription operations, given the provided table contexts. This will
     * create an onCreate subscription for each table.
     *
     * @param types the table contexts from which the subscriptions are to be generated.
     * @returns the type definition for subscriptions, including an onCreate for each table.
     */
    private getSubscriptions;
    /**
     * Generates the basic query operations, given the provided table contexts. This will
     * create a get and list operation for each table.
     *
     * @param types the table contexts from which the queries are to be generated.
     * @returns the type definition for queries, including a get and list for each table.
     */
    private getQueries;
    /**
     * Creates a GraphQL connection type for a given GraphQL type, corresponding to a SQL table name.
     *
     * @param tableName the name of the SQL table (and GraphQL type).
     * @returns a type definition node defining the connection type for the provided type name.
     */
    getConnectionType(tableName: string): ObjectTypeDefinitionNode;
}
