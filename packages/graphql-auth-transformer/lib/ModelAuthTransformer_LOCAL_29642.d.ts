import { Transformer, TransformerContext } from 'graphql-transformer-core';
import { ResourceFactory } from './resources';
import { AuthRule, AuthProvider } from './AuthRule';
import { ObjectTypeDefinitionNode, DirectiveNode, FieldDefinitionNode, InterfaceTypeDefinitionNode } from 'graphql';
/**
 * Implements the ModelAuthTransformer.
 *
 * Owner Auth Usage:
 *
 * type Post @auth(allow: owner) {
 *   id: ID!
 *   title: String
 *   createdAt: String
 *   updatedAt: String
 * }
 *
 * Impact:
 *
 * getPost - In the response mapping template we check the "owner" field === $ctx.identity.username.
 * listPost - In the response mapping template we return only items where "owner" === $ctx.identity.username
 * createPost - We automatically insert an "owner" field to attribute values where "owner" === $ctx.identity.username.
 * updatePost - Expose "owner" field in input/output and would set conditional update expression to look for owner.
 * deletePost - Conditional expression checking that the owner === $ctx.identity.username
 *
 * Note: The name of the "owner" field may be configured via "ownerField" parameter within the @auth directive.
 *
 * type Post @auth(allow: groups, groups: ["Admin", "Dev"]) {
 *   id: ID!
 *   title: String
 *   createdAt: String
 *   updatedAt: String
 * }
 *
 * Impact:
 *
 * getPost - Update req template to look for the groups in the identity.
 * listPost - Update req template to look for the groups in the identity.
 * createPost - Update req template to look for the groups in the identity.
 * updatePost - Update req template to look for the groups in the identity.
 * deletePost - Update req template to look for the groups in the identity.
 *
 * TODO: Document support for dynamic group authorization against
 * attributes of the records using conditional expressions. This will likely
 * be via a new argument such as "groupsField".
 */
export declare type AppSyncAuthMode = 'API_KEY' | 'AMAZON_COGNITO_USER_POOLS' | 'AWS_IAM' | 'OPENID_CONNECT';
export declare type AppSyncAuthConfiguration = {
    defaultAuthentication: AppSyncAuthConfigurationEntry;
    additionalAuthenticationProviders: Array<AppSyncAuthConfigurationEntry>;
};
export declare type AppSyncAuthConfigurationEntry = {
    authenticationType: AppSyncAuthMode;
    apiKeyConfig?: ApiKeyConfig;
    userPoolConfig?: UserPoolConfig;
    openIDConnectConfig?: OpenIDConnectConfig;
};
export declare type ApiKeyConfig = {
    description?: string;
    apiKeyExpirationDays: number;
};
export declare type UserPoolConfig = {
    userPoolId: string;
};
export declare type OpenIDConnectConfig = {
    name: string;
    issuerUrl: string;
    clientId?: string;
    iatTTL?: number;
    authTTL?: number;
};
export declare type ModelAuthTransformerConfig = {
    authConfig?: AppSyncAuthConfiguration;
};
export declare type ConfiguredAuthProviders = {
    default: AuthProvider;
    onlyDefaultAuthProviderConfigured: boolean;
    hasApiKey: boolean;
    hasUserPools: boolean;
    hasOIDC: boolean;
    hasIAM: boolean;
};
export declare class ModelAuthTransformer extends Transformer {
    resources: ResourceFactory;
    config: ModelAuthTransformerConfig;
    configuredAuthProviders: ConfiguredAuthProviders;
    generateIAMPolicyforUnauthRole: boolean;
    generateIAMPolicyforAuthRole: boolean;
    authPolicyResources: Set<string>;
    unauthPolicyResources: Set<string>;
    constructor(config?: ModelAuthTransformerConfig);
    /**
     * Updates the GraphQL API record with configured authentication providers
     */
    private updateAPIAuthentication;
    before: (ctx: TransformerContext) => void;
    after: (ctx: TransformerContext) => void;
    private getApiKeyConfig;
    /**
     * Implement the transform for an object type. Depending on which operations are to be protected
     */
    object: (def: ObjectTypeDefinitionNode, directive: DirectiveNode, ctx: TransformerContext) => void;
    field: (parent: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode, definition: FieldDefinitionNode, directive: DirectiveNode, ctx: TransformerContext) => void;
    private protectField;
    private protectReadForField;
    private protectUpdateForField;
    private protectDeleteForField;
    /**
     * Protects a create mutation based on an @auth rule specified on a @model field.
     * @param ctx The context.
     * @param typeName The parent type name.
     * @param fieldName The name of the field with the @auth directive.
     * @param rules The set of rules that should be applied to create operations.
     */
    private protectCreateForField;
    /**
     * Takes a flat list of rules, each containing their own list of operations (or queries/mutations if an old API).
     * This method splits those rules into buckets keyed by operation and implements some logic for backwards compatibility.
     * @param rules The list of auth rules
     */
    private splitRules;
    private validateRules;
    private validateFieldRules;
    private commonRuleValidation;
    /**
     * Protect get queries.
     * If static group:
     *  If statically authorized then allow the operation. Stop.
     * If owner and/or dynamic group:
     *  If the result item satisfies the owner/group authorization condition
     *  then allow it.
     * @param ctx The transformer context.
     * @param resolverResourceId The logical id of the get resolver.
     * @param rules The auth rules to apply.
     */
    private protectGetQuery;
    private authorizationExpressionOnSingleObject;
    /**
     * Protect list queries.
     * If static group:
     *  If the user is statically authorized then return items and stop.
     * If dynamic group and/or owner:
     *  Loop through all items and find items that satisfy any of the group or
     *  owner conditions.
     * @param ctx The transformer context.
     * @param resolverResourceId The logical id of the resolver to be updated in the CF template.
     * @param rules The set of rules that apply to the operation.
     */
    private protectListQuery;
    /**
     * Returns a VTL expression that will authorize a list of results based on a set of auth rules.
     * @param rules The auth rules.
     *
     * If an itemList is specifed in @param itemList it will use this ref to filter out items in this list that are not authorized
     */
    private authorizationExpressionForListResult;
    /**
     * Inject auth rules for create mutations.
     * If owner auth:
     *  If the owner field exists in the input, validate that it against the identity.
     *  If the owner field dne in the input, insert the identity.
     * If group:
     *  If the user is static group authorized allow operation no matter what.
     *  If dynamic group and the input defines a group(s) validate it against the identity.
     * @param ctx
     * @param resolverResourceId
     * @param rules
     */
    private protectCreateMutation;
    /**
     * Protect update and delete mutations.
     * If Owner:
     *  Update the conditional expression such that the update only works if
     *  the user is the owner.
     * If dynamic group:
     *  Update the conditional expression such that it succeeds if the user is
     *  dynamic group authorized. If the operation is also owner authorized this
     *  should be joined with an OR expression.
     * If static group:
     *  If the user is statically authorized then allow no matter what. This can
     *  be done by removing the conditional expression as long as static group
     *  auth is always checked last.
     * @param ctx The transformer context.
     * @param resolverResourceId The logical id of the resolver in the template.
     * @param rules The list of rules to apply.
     */
    private protectUpdateOrDeleteMutation;
    /**
     * If we are protecting the mutation for a field level @auth directive, include
     * the necessary if condition.
     * @param ctx The transformer context
     * @param resolverResourceId The resolver resource id
     * @param rules The delete rules
     * @param parent The parent object
     * @param field The optional field
     */
    private protectUpdateMutation;
    /**
     * If we are protecting the mutation for a field level @auth directive, include
     * the necessary if condition.
     * @param ctx The transformer context
     * @param resolverResourceId The resolver resource id
     * @param rules The delete rules
     * @param parent The parent object
     * @param field The optional field
     */
    private protectDeleteMutation;
    /**
     * When read operations are protected via @auth, all @connection resolvers will be protected.
     * Find the directives & update their resolvers with auth logic
     */
    private protectConnections;
    /**
     * When read operations are protected via @auth, all secondary @key query resolvers will be protected.
     * Find the directives & update their resolvers with auth logic
     */
    private protectQueries;
    private protectSearchQuery;
    protectSyncQuery(ctx: TransformerContext, def: ObjectTypeDefinitionNode, resolverResourceID: string, rules: AuthRule[]): void;
    private protectOnCreateSubscription;
    private protectOnUpdateSubscription;
    private protectOnDeleteSubscription;
    private addSubscriptionResolvers;
    private addSubscriptionOwnerArgument;
    private addOwner;
    private getOwnerRules;
    private getStaticGroupRules;
    private getDynamicGroupRules;
    hasProviderAuthRules(rules: AuthRule[]): Boolean;
    private extendTypeWithDirectives;
    private addDirectivesToOperation;
    private addDirectivesToField;
    private getDirectivesForRules;
    private ensureDefaultAuthProviderAssigned;
    private validateRuleAuthStrategy;
    private getConfiguredAuthProviders;
    private setAuthPolicyFlag;
    private setUnauthPolicyFlag;
    private getAuthRulesFromDirective;
    private isTypeNeedsDefaultProviderAccess;
    private isTypeHasRulesForOperation;
    private addTypeToResourceReferences;
    private addFieldToResourceReferences;
    private isOperationExpressionSet;
    private updateMutationConditionInput;
    private typeExist;
    private isSyncEnabled;
}
