import { StringParameter, NumberParameter, DeletionPolicy } from 'cloudform-types';
import Output from 'cloudform-types/types/output';
import { SyncConfig } from 'graphql-transformer-core';
import Template from 'cloudform-types/types/template';
declare type MutationResolverInput = {
    type: string;
    syncConfig: SyncConfig;
    nameOverride?: string;
    mutationTypeName?: string;
};
export declare class ResourceFactory {
    makeParams(): {
        [x: string]: StringParameter | NumberParameter;
    };
    /**
     * Creates the barebones template for an application.
     */
    initTemplate(): Template;
    /**
     * Create the AppSync API.
     */
    makeAppSyncAPI(): import("cloudform-types/types/appSync/graphQlApi").default;
    makeAppSyncSchema(schema: string): import("cloudform-types/types/appSync/graphQlSchema").default;
    /**
     * Outputs
     */
    makeAPIIDOutput(): Output;
    makeAPIEndpointOutput(): Output;
    makeTableStreamArnOutput(resourceId: string): Output;
    makeDataSourceOutput(resourceId: string): Output;
    makeTableNameOutput(resourceId: string): Output;
    /**
     * Create a DynamoDB table for a specific type.
     */
    makeModelTable(typeName: string, hashKey?: string, rangeKey?: string, deletionPolicy?: DeletionPolicy, isSyncEnabled?: boolean): import("cloudform-types/types/dynamoDb/table").default;
    private dynamoDBTableName;
    /**
     * Create a single role that has access to all the resources created by the
     * transform.
     * @param name  The name of the IAM role to create.
     */
    makeIAMRole(typeName: string, syncConfig?: SyncConfig): import("cloudform-types/types/iam/role").default;
    /**
     * Given the name of a data source and optional logical id return a CF
     * spec for a data source pointing to the dynamodb table.
     */
    makeDynamoDBDataSource(tableId: string, iamRoleLogicalID: string, typeName: string, isSyncEnabled?: boolean): import("cloudform-types/types/appSync/dataSource").default;
    /**
     * Create a resolver that creates an item in DynamoDB.
     * @param type
     */
    makeCreateResolver({ type, nameOverride, syncConfig, mutationTypeName }: MutationResolverInput): import("cloudform-types/types/appSync/resolver").default;
    makeUpdateResolver({ type, nameOverride, syncConfig, mutationTypeName }: MutationResolverInput): import("cloudform-types/types/appSync/resolver").default;
    /**
     * Create a resolver that creates an item in DynamoDB.
     * @param type
     */
    makeGetResolver(type: string, nameOverride?: string, isSyncEnabled?: boolean, queryTypeName?: string): import("cloudform-types/types/appSync/resolver").default;
    /**
     * Create a resolver that syncs local storage with cloud storage
     * @param type
     */
    makeSyncResolver(type: string, queryTypeName?: string): import("cloudform-types/types/appSync/resolver").default;
    /**
     * Create a resolver that queries an item in DynamoDB.
     * @param type
     */
    makeQueryResolver(type: string, nameOverride?: string, isSyncEnabled?: boolean, queryTypeName?: string): import("cloudform-types/types/appSync/resolver").default;
    /**
     * Create a resolver that lists items in DynamoDB.
     * TODO: actually fill out the right filter expression. This is a placeholder only.
     * @param type
     */
    makeListResolver(type: string, nameOverride?: string, isSyncEnabled?: boolean, queryTypeName?: string): import("cloudform-types/types/appSync/resolver").default;
    /**
     * Create a resolver that deletes an item from DynamoDB.
     * @param type The name of the type to delete an item of.
     * @param nameOverride A user provided override for the field name.
     */
    makeDeleteResolver({ type, nameOverride, syncConfig, mutationTypeName }: MutationResolverInput): import("cloudform-types/types/appSync/resolver").default;
}
export {};
