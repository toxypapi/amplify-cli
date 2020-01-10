import { TemplateContext, TableContext } from './RelationalDBSchemaTransformer';
import { AuroraDataAPIClient } from './AuroraDataAPIClient';
import { IRelationalDBReader } from './IRelationalDBReader';
/**
 * A class to manage interactions with a Aurora Serverless MySQL Relational Databse
 * using the Aurora Data API
 */
export declare class AuroraServerlessMySQLDatabaseReader implements IRelationalDBReader {
    auroraClient: AuroraDataAPIClient;
    dbRegion: string;
    awsSecretStoreArn: string;
    dbClusterOrInstanceArn: string;
    database: string;
    setAuroraClient(auroraClient: AuroraDataAPIClient): void;
    constructor(dbRegion: string, awsSecretStoreArn: string, dbClusterOrInstanceArn: string, database: string, aws: any);
    /**
     * Stores some of the Aurora Serverless MySQL context into the template context,
     * for later consumption.
     *
     * @param contextShell the basic template context, with db source independent fields set.
     * @returns a fully hydrated template context, complete with Aurora Serverless MySQL context.
     */
    hydrateTemplateContext: (contextShell: TemplateContext) => Promise<TemplateContext>;
    /**
     * Gets a list of all the table names in the provided database.
     *
     * @returns a list of tablenames inside the database.
     */
    listTables: () => Promise<string[]>;
    /**
     * Looks up any foreign key constraints that might exist for the provided table.
     * This is done to ensure our generated schema includes nested types, where possible.
     *
     * @param tableName the name of the table to be checked for foreign key constraints.
     * @returns a list of table names that are applicable as having constraints.
     */
    getTableForeignKeyReferences: (tableName: string) => Promise<string[]>;
    /**
     * For the provided table, this will create a table context. That context holds definitions for
     * the base table type, the create input type, and the update input type (e.g. Post, CreatePostInput, and UpdatePostInput, respectively),
     * as well as the table primary key structure for proper operation definition.
     *
     * Create inputs will only differ from the base table type in that any nested types will not be present. Update table
     * inputs will differ in that the only required field will be the primary key/identifier, as all fields don't have to
     * be updated. Instead, it assumes the proper ones were provided on create.
     *
     * @param tableName the name of the table to be translated into a GraphQL type.
     * @returns a promise of a table context structure.
     */
    describeTable: (tableName: string) => Promise<TableContext>;
}
