import Template from 'cloudform-types/types/template';
import { StringParameter, NumberParameter } from 'cloudform-types';
import { AuthRule, AuthProvider } from './AuthRule';
import { Expression } from 'graphql-mapping-template';
import GraphQLApi from 'cloudform-types/types/appSync/graphQlApi';
import * as Transformer from './ModelAuthTransformer';
import { FieldDefinitionNode } from 'graphql';
import ManagedPolicy from 'cloudform-types/types/iam/managedPolicy';
export declare class ResourceFactory {
    makeParams(): {
        [x: string]: StringParameter | NumberParameter;
    };
    /**
     * Creates the barebones template for an application.
     */
    initTemplate(apiKeyConfig: Transformer.ApiKeyConfig): Template;
    makeAppSyncApiKey(apiKeyConfig: Transformer.ApiKeyConfig): import("cloudform-types/types/appSync/apiKey").default;
    /**
     * Outputs
     */
    makeApiKeyOutput(): any;
    updateGraphQLAPIWithAuth(apiRecord: GraphQLApi, authConfig: Transformer.AppSyncAuthConfiguration): GraphQLApi;
    private assignOpenIDConnectConfig;
    blankResolver(type: string, field: string): import("cloudform-types/types/appSync/resolver").default;
    noneDataSource(): import("cloudform-types/types/appSync/dataSource").default;
    /**
     * Builds a VTL expression that will set the
     * ResourceConstants.SNIPPETS.IsStaticGroupAuthorizedVariable variable to
     * true if the user is static group authorized.
     * @param rules The list of static group authorization rules.
     */
    staticGroupAuthorizationExpression(rules: AuthRule[], field?: FieldDefinitionNode): Expression;
    /**
     * Given a set of dynamic group authorization rules verifies that input
     * value satisfies at least one dynamic group authorization rule.
     * @param rules The list of authorization rules.
     * @param variableToCheck The name of the value containing the input.
     * @param variableToSet The name of the variable to set when auth is satisfied.
     */
    dynamicGroupAuthorizationExpressionForCreateOperations(rules: AuthRule[], variableToCheck?: string, variableToSet?: string): Expression;
    /**
     * Given a set of dynamic group authorization rules verifies that input
     * value satisfies at least one dynamic group authorization rule.
     * @param rules The list of authorization rules.
     * @param variableToCheck The name of the value containing the input.
     * @param variableToSet The name of the variable to set when auth is satisfied.
     */
    dynamicGroupAuthorizationExpressionForCreateOperationsByField(rules: AuthRule[], fieldToCheck: string, variableToCheck?: string, variableToSet?: string): Expression;
    private dynamicAuthorizationExpressionForCreate;
    /**
     * Given a set of owner authorization rules verifies that input
     * value satisfies at least one rule.
     * @param rules The list of authorization rules.
     * @param variableToCheck The name of the value containing the input.
     * @param variableToSet The name of the variable to set when auth is satisfied.
     */
    ownerAuthorizationExpressionForCreateOperations(rules: AuthRule[], fieldIsList: (fieldName: string) => boolean, variableToCheck?: string, variableToSet?: string): Expression;
    ownerAuthorizationExpressionForSubscriptions(rules: AuthRule[], variableToCheck?: string, variableToSet?: string): Expression;
    ownershipAuthorizationExpressionForSubscriptions(rules: AuthRule[], variableToCheck?: string, variableToSet?: string, formatComment?: (rule: AuthRule) => string): import("graphql-mapping-template").CompoundExpressionNode;
    /**
     * Given a set of owner authorization rules verifies that if the input
     * specifies the given input field, the value satisfies at least one rule.
     * @param rules The list of authorization rules.
     * @param variableToCheck The name of the value containing the input.
     * @param variableToSet The name of the variable to set when auth is satisfied.
     */
    ownerAuthorizationExpressionForCreateOperationsByField(rules: AuthRule[], fieldToCheck: string, fieldIsList: (fieldName: string) => boolean, variableToCheck?: string, variableToSet?: string): Expression;
    ownershipAuthorizationExpressionForCreate(rules: AuthRule[], fieldIsList: (fieldName: string) => boolean, variableToCheck?: string, variableToSet?: string, formatComment?: (rule: AuthRule) => string): import("graphql-mapping-template").CompoundExpressionNode;
    /**
     * Given a set of dynamic group authorization rules verifies w/ a conditional
     * expression that the existing object has the correct group expression.
     * @param rules The list of authorization rules.
     * @param variableToCheck The name of the value containing the input.
     * @param variableToSet The name of the variable to set when auth is satisfied.
     */
    dynamicGroupAuthorizationExpressionForUpdateOrDeleteOperations(rules: AuthRule[], fieldBeingProtected?: string, variableToCheck?: string, variableToSet?: string): Expression;
    /**
     * Given a set of owner authorization rules verifies with a conditional
     * expression that the existing object is owned.
     * @param rules The list of authorization rules.
     * @param variableToCheck The name of the value containing the input.
     * @param variableToSet The name of the variable to set when auth is satisfied.
     */
    ownerAuthorizationExpressionForUpdateOrDeleteOperations(rules: AuthRule[], fieldIsList: (fieldName: string) => boolean, fieldBeingProtected?: string, variableToCheck?: string, variableToSet?: string): Expression;
    /**
     * Given a list of rules return a VTL expression that checks if the given variableToCheck
     * statisies at least one of the auth rules.
     * @param rules The list of dynamic group authorization rules.
     */
    dynamicGroupAuthorizationExpressionForReadOperations(rules: AuthRule[], variableToCheck?: string, variableToSet?: string, defaultValue?: Expression): Expression;
    /**
     * Given a list of rules return a VTL expression that checks if the given variableToCheck
     * statisies at least one of the auth rules.
     * @param rules The list of dynamic group authorization rules.
     */
    ownerAuthorizationExpressionForReadOperations(rules: AuthRule[], variableToCheck?: string, variableToSet?: string, defaultValue?: Expression): Expression;
    throwIfSubscriptionUnauthorized(): Expression;
    throwIfUnauthorized(field?: FieldDefinitionNode): Expression;
    throwIfNotStaticGroupAuthorizedOrAuthConditionIsEmpty(field?: FieldDefinitionNode): Expression;
    collectAuthCondition(): Expression;
    appendItemIfLocallyAuthorized(): Expression;
    setUserGroups(customGroup?: string): Expression;
    generateSubscriptionResolver(fieldName: string, subscriptionTypeName?: string): import("cloudform-types/types/appSync/resolver").default;
    operationCheckExpression(operation: string, field: string): import("graphql-mapping-template").CompoundExpressionNode;
    setOperationExpression(operation: string): string;
    getAuthModeCheckWrappedExpression(expectedAuthModes: Set<AuthProvider>, expression: Expression): Expression;
    getAuthModeDeterminationExpression(authProviders: Set<AuthProvider>, isUserPoolTheDefault: boolean): Expression;
    getStaticAuthorizationVariable(field: FieldDefinitionNode): string;
    makeIAMPolicyForRole(isAuthPolicy: Boolean, resources: Set<string>): ManagedPolicy[];
    /**
     * ES EXPRESSIONS
     */
    makeESItemsExpression(): import("graphql-mapping-template").CompoundExpressionNode;
    makeESToGQLExpression(): import("graphql-mapping-template").CompoundExpressionNode;
}
