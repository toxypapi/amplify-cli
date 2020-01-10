/**
 * A wrapper around the RDS data service client, forming their responses for
 * easier consumption.
 */
export declare class AuroraDataAPIClient {
    AWS: any;
    RDS: any;
    Params: DataApiParams;
    setRDSClient(rdsClient: any): void;
    constructor(databaseRegion: string, awsSecretStoreArn: string, dbClusterOrInstanceArn: string, database: string, aws: any);
    /**
     * Lists all of the tables in the set database.
     *
     * @return a list of tables in the database.
     */
    listTables: () => Promise<any[]>;
    /**
     * Describes the table given, by breaking it down into individual column descriptions.
     *
     * @param the name of the table to be described.
     * @return a list of column descriptions.
     */
    describeTable: (tableName: string) => Promise<any[]>;
    /**
     * Gets foreign keys for the given table, if any exist.
     *
     * @param tableName the name of the table to be checked.
     * @return a list of tables referencing the provided table, if any exist.
     */
    getTableForeignKeyReferences: (tableName: string) => Promise<any[]>;
}
export declare class DataApiParams {
    database: string;
    secretArn: string;
    resourceArn: string;
    sql: string;
}
export declare class ColumnDescription {
    Field: string;
    Type: string;
    Null: string;
    Key: string;
    Default: string;
    Extra: string;
}
