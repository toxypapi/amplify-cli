import { TemplateContext } from './RelationalDBSchemaTransformer';
import { DocumentNode } from 'graphql';
/**
 * This Class is responsible for Generating the RDS Resolvers based on the
 * GraphQL Schema + Metadata of the RDS Cluster (i.e. Primary Keys for Tables).
 *
 * It will generate the CRUDL+Q (Create, Retrieve, Update, Delete, List + Queries) Resolvers as
 * Cloudform Resources so that they may be added on to the base template that the
 * RelationDBTemplateGenerator creates.
 */
export declare class RelationalDBResolverGenerator {
    document: DocumentNode;
    typePrimaryKeyMap: Map<string, string>;
    stringFieldMap: Map<string, string[]>;
    intFieldMap: Map<string, string[]>;
    resolverFilePath: string;
    typePrimaryKeyTypeMap: Map<string, string>;
    constructor(context: TemplateContext);
    /**
     * Creates the CRUDL+Q Resolvers as a Map of Cloudform Resources. The output can then be
     * merged with an existing Template's map of Resources.
     */
    createRelationalResolvers(resolverFilePath: string): {};
    /**
     * Private Helpers to Generate the CFN Spec for the Resolver Resources
     */
    /**
     * Creates and returns the CFN Spec for the 'Create' Resolver Resource provided
     * a GraphQL Type as the input
     *
     * @param type - the graphql type for which the create resolver will be created
     * @param mutationTypeName - will be 'Mutation'
     */
    private makeCreateRelationalResolver;
    /**
     * Creates and Returns the CFN Spec for the 'Get' Resolver Resource provided
     * a GraphQL type
     *
     * @param type - the graphql type for which the get resolver will be created
     * @param queryTypeName  - will be 'Query'
     */
    private makeGetRelationalResolver;
    /**
     * Creates and Returns the CFN Spec for the 'Update' Resolver Resource provided
     * a GraphQL type
     *
     * @param type - the graphql type for which the update resolver will be created
     * @param mutationTypeName - will be 'Mutation'
     */
    private makeUpdateRelationalResolver;
    /**
     * Creates and Returns the CFN Spec for the 'Delete' Resolver Resource provided
     * a GraphQL type
     *
     * @param type - the graphql type for which the delete resolver will be created
     * @param mutationTypeName - will be 'Mutation'
     */
    private makeDeleteRelationalResolver;
    /**
     * Creates and Returns the CFN Spec for the 'List' Resolver Resource provided
     * a GraphQL type
     *
     * @param type - the graphql type for which the list resolver will be created
     * @param queryTypeName - will be 'Query'
     */
    private makeListRelationalResolver;
}
