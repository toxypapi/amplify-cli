import { DirectiveNode, ObjectTypeDefinitionNode } from 'graphql';
import { Transformer, TransformerContext, SyncConfig } from 'graphql-transformer-core';
import { ResourceFactory } from './resources';
export interface DynamoDBModelTransformerOptions {
    EnableDeletionProtection?: boolean;
    SyncConfig?: SyncConfig;
}
export declare const CONDITIONS_MINIMUM_VERSION = 5;
/**
 * The @model transformer.
 *
 * This transform creates a single DynamoDB table for all of your application's
 * data. It uses a standard key structure and nested map to store object values.
 * A relationKey field
 *
 * {
 *  type (HASH),
 *  id (SORT),
 *  value (MAP),
 *  createdAt, (LSI w/ type)
 *  updatedAt (LSI w/ type)
 * }
 */
export declare class DynamoDBModelTransformer extends Transformer {
    resources: ResourceFactory;
    opts: DynamoDBModelTransformerOptions;
    constructor(opts?: DynamoDBModelTransformerOptions);
    before: (ctx: TransformerContext) => void;
    /**
     * Given the initial input and context manipulate the context to handle this object directive.
     * @param initial The input passed to the transform.
     * @param ctx The accumulated context for the transform.
     */
    object: (def: ObjectTypeDefinitionNode, directive: DirectiveNode, ctx: TransformerContext) => void;
    private createMutations;
    private createQueries;
    /**
     * Creates subscriptions for a @model object type. By default creates a subscription for
     * create, update, and delete mutations.
     *
     * Subscriptions are one to many in that a subscription may subscribe to multiple mutations.
     * You may thus provide multiple names of the subscriptions that will be triggered by each
     * mutation.
     *
     * type Post @model(subscriptions: { onCreate: ["onPostCreated", "onFeedUpdated"] }) {
     *      id: ID!
     *      title: String!
     * }
     *
     * will create two subscription fields:
     *
     * type Subscription {
     *      onPostCreated: Post @aws_subscribe(mutations: ["createPost"])
     *      onFeedUpdated: Post @aws_subscribe(mutations: ["createPost"])
     * }
     *  Subscription Levels
     *   subscriptions.level === OFF || subscriptions === null
     *      Will not create subscription operations
     *   subcriptions.level === PUBLIC
     *      Will continue as is creating subscription operations
     *   subscriptions.level === ON || subscriptions === undefined
     *      If auth is enabled it will enabled protection on subscription operations and resolvers
     */
    private createSubscriptions;
    private typeExist;
    private generateModelXConnectionType;
    private generateFilterInputs;
    private generateConditionInputs;
    private getOpts;
    private setSyncConfig;
    private updateMutationConditionInput;
    private supportsConditions;
}
