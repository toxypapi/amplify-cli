"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudform_types_1 = require("cloudform-types");
const graphql_mapping_template_1 = require("graphql-mapping-template");
const graphql_transformer_common_1 = require("graphql-transformer-common");
const graphQlApi_1 = require("./graphQlApi");
const constants_1 = require("./constants");
function replaceIfUsername(identityClaim) {
    return (identityClaim === 'username') ? 'cognito:username' : identityClaim;
}
function isUsername(identityClaim) {
    return identityClaim === 'username';
}
class ResourceFactory {
    makeParams() {
        return {
            [graphql_transformer_common_1.ResourceConstants.PARAMETERS.AppSyncApiName]: new cloudform_types_1.StringParameter({
                Description: 'The name of the AppSync API',
                Default: 'AppSyncSimpleTransform'
            }),
            [graphql_transformer_common_1.ResourceConstants.PARAMETERS.APIKeyExpirationEpoch]: new cloudform_types_1.NumberParameter({
                Description: 'The epoch time in seconds when the API Key should expire.' +
                    ' Setting this to 0 will default to 180 days from the deployment date.' +
                    ' Setting this to -1 will not create an API Key.',
                Default: 0,
                MinValue: -1
            }),
            [graphql_transformer_common_1.ResourceConstants.PARAMETERS.CreateAPIKey]: new cloudform_types_1.NumberParameter({
                Description: 'The boolean value to control if an API Key will be created or not.' +
                    ' The value of the property is automatically set by the CLI.' +
                    ' If the value is set to 0 no API Key will be created.',
                Default: 0,
                MinValue: 0,
                MaxValue: 1
            }),
            [graphql_transformer_common_1.ResourceConstants.PARAMETERS.AuthCognitoUserPoolId]: new cloudform_types_1.StringParameter({
                Description: 'The id of an existing User Pool to connect. If this is changed, a user pool will not be created for you.',
                Default: graphql_transformer_common_1.ResourceConstants.NONE
            })
        };
    }
    /**
     * Creates the barebones template for an application.
     */
    initTemplate(apiKeyConfig) {
        return {
            Parameters: this.makeParams(),
            Resources: {
                [graphql_transformer_common_1.ResourceConstants.RESOURCES.APIKeyLogicalID]: this.makeAppSyncApiKey(apiKeyConfig)
            },
            Outputs: {
                [graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIApiKeyOutput]: this.makeApiKeyOutput()
            },
            Conditions: {
                [graphql_transformer_common_1.ResourceConstants.CONDITIONS.ShouldCreateAPIKey]: cloudform_types_1.Fn.Equals(cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.CreateAPIKey), 1),
                [graphql_transformer_common_1.ResourceConstants.CONDITIONS.APIKeyExpirationEpochIsPositive]: cloudform_types_1.Fn.And([
                    cloudform_types_1.Fn.Not(cloudform_types_1.Fn.Equals(cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.APIKeyExpirationEpoch), -1)),
                    cloudform_types_1.Fn.Not(cloudform_types_1.Fn.Equals(cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.APIKeyExpirationEpoch), 0))
                ]),
            }
        };
    }
    makeAppSyncApiKey(apiKeyConfig) {
        let expirationDays = 180;
        if (apiKeyConfig && apiKeyConfig.apiKeyExpirationDays) {
            expirationDays = apiKeyConfig.apiKeyExpirationDays;
        }
        const expirationDateInSeconds = 60 /* s */ * 60 /* m */ * 24 /* h */ * expirationDays; /* d */
        const nowEpochTime = Math.floor(Date.now() / 1000);
        return new cloudform_types_1.AppSync.ApiKey({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            Description: (apiKeyConfig && apiKeyConfig.description) ? apiKeyConfig.description : undefined,
            Expires: cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.APIKeyExpirationEpochIsPositive, cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.APIKeyExpirationEpoch), nowEpochTime + expirationDateInSeconds),
        }).condition(graphql_transformer_common_1.ResourceConstants.CONDITIONS.ShouldCreateAPIKey);
    }
    /**
     * Outputs
     */
    makeApiKeyOutput() {
        return {
            Description: "Your GraphQL API key. Provide via 'x-api-key' header.",
            Value: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.APIKeyLogicalID, 'ApiKey'),
            Export: {
                Name: cloudform_types_1.Fn.Join(':', [cloudform_types_1.Refs.StackName, "GraphQLApiKey"])
            },
            Condition: graphql_transformer_common_1.ResourceConstants.CONDITIONS.ShouldCreateAPIKey
        };
    }
    updateGraphQLAPIWithAuth(apiRecord, authConfig) {
        let properties = Object.assign(Object.assign({}, apiRecord.Properties), { Name: apiRecord.Properties.Name, AuthenticationType: authConfig.defaultAuthentication.authenticationType, UserPoolConfig: undefined, OpenIDConnectConfig: undefined });
        switch (authConfig.defaultAuthentication.authenticationType) {
            case 'AMAZON_COGNITO_USER_POOLS':
                properties.UserPoolConfig = new graphQlApi_1.UserPoolConfig({
                    UserPoolId: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.AuthCognitoUserPoolId),
                    AwsRegion: cloudform_types_1.Refs.Region,
                    DefaultAction: 'ALLOW'
                });
                break;
            case 'OPENID_CONNECT':
                if (!authConfig.defaultAuthentication.openIDConnectConfig) {
                    throw new Error('openIDConnectConfig is not configured for defaultAuthentication');
                }
                properties.OpenIDConnectConfig = this.assignOpenIDConnectConfig(authConfig.defaultAuthentication.openIDConnectConfig);
                break;
        }
        // Configure additional authentication providers
        if (authConfig.additionalAuthenticationProviders && authConfig.additionalAuthenticationProviders.length > 0) {
            const additionalAuthenticationProviders = new Array();
            for (const sourceProvider of authConfig.additionalAuthenticationProviders) {
                let provider;
                switch (sourceProvider.authenticationType) {
                    case 'AMAZON_COGNITO_USER_POOLS':
                        provider = {
                            AuthenticationType: 'AMAZON_COGNITO_USER_POOLS',
                            UserPoolConfig: new graphQlApi_1.UserPoolConfig({
                                UserPoolId: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.AuthCognitoUserPoolId),
                                AwsRegion: cloudform_types_1.Refs.Region
                            })
                        };
                        break;
                    case 'API_KEY':
                        provider = {
                            AuthenticationType: 'API_KEY',
                        };
                        break;
                    case 'AWS_IAM':
                        provider = {
                            AuthenticationType: 'AWS_IAM',
                        };
                        break;
                    case 'OPENID_CONNECT':
                        if (!sourceProvider.openIDConnectConfig) {
                            throw new Error('openIDConnectConfig is not configured for provider');
                        }
                        provider = {
                            AuthenticationType: 'OPENID_CONNECT',
                            OpenIDConnectConfig: this.assignOpenIDConnectConfig(sourceProvider.openIDConnectConfig)
                        };
                        break;
                }
                additionalAuthenticationProviders.push(provider);
            }
            properties.AdditionalAuthenticationProviders = additionalAuthenticationProviders;
        }
        return new graphQlApi_1.default(properties);
    }
    assignOpenIDConnectConfig(config) {
        return new graphQlApi_1.OpenIDConnectConfig({
            Issuer: config.issuerUrl,
            ClientId: config.clientId,
            IatTTL: config.iatTTL,
            AuthTTL: config.authTTL
        });
    }
    blankResolver(type, field) {
        return new cloudform_types_1.AppSync.Resolver({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: 'NONE',
            FieldName: field,
            TypeName: type,
            RequestMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.obj({
                "version": graphql_mapping_template_1.str("2017-02-28"),
                "payload": graphql_mapping_template_1.obj({})
            })),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.ref(`util.toJson($context.source.${field})`))
        });
    }
    noneDataSource() {
        return new cloudform_types_1.AppSync.DataSource({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            Name: 'NONE',
            Type: 'NONE'
        });
    }
    /**
     * Builds a VTL expression that will set the
     * ResourceConstants.SNIPPETS.IsStaticGroupAuthorizedVariable variable to
     * true if the user is static group authorized.
     * @param rules The list of static group authorization rules.
     */
    staticGroupAuthorizationExpression(rules, field) {
        if (!rules || rules.length === 0) {
            return graphql_mapping_template_1.comment(`No Static Group Authorization Rules`);
        }
        const variableToSet = this.getStaticAuthorizationVariable(field);
        let groupAuthorizationExpressions = [];
        for (const rule of rules) {
            const groups = rule.groups;
            const groupClaimAttribute = rule.groupClaim || constants_1.DEFAULT_GROUP_CLAIM;
            if (groups) {
                groupAuthorizationExpressions = groupAuthorizationExpressions.concat(graphql_mapping_template_1.comment(`Authorization rule: { allow: groups, groups: ${JSON.stringify(groups)}, groupClaim: "${groupClaimAttribute}" }`), this.setUserGroups(rule.groupClaim), graphql_mapping_template_1.set(graphql_mapping_template_1.ref('allowedGroups'), graphql_mapping_template_1.list(groups.map(s => graphql_mapping_template_1.str(s)))), graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('userGroup'), graphql_mapping_template_1.ref('userGroups'), [
                    graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$allowedGroups.contains($userGroup)`), graphql_mapping_template_1.compoundExpression([
                        graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), graphql_mapping_template_1.raw('true')),
                        graphql_mapping_template_1.raw('#break')
                    ]))
                ]));
            }
        }
        // tslint:disable-next-line
        return graphql_mapping_template_1.block('Static Group Authorization Checks', [
            // tslint:disable-next-line
            graphql_mapping_template_1.raw(`#set($${staticGroupAuthorizedVariable} = $util.defaultIfNull(
                $${staticGroupAuthorizedVariable}, false))`),
            ...groupAuthorizationExpressions
        ]);
    }
    /**
     * Given a set of dynamic group authorization rules verifies that input
     * value satisfies at least one dynamic group authorization rule.
     * @param rules The list of authorization rules.
     * @param variableToCheck The name of the value containing the input.
     * @param variableToSet The name of the variable to set when auth is satisfied.
     */
    dynamicGroupAuthorizationExpressionForCreateOperations(rules, variableToCheck = 'ctx.args.input', variableToSet = graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsDynamicGroupAuthorizedVariable) {
        if (!rules || rules.length === 0) {
            return graphql_mapping_template_1.comment(`No Dynamic Group Authorization Rules`);
        }
        return graphql_mapping_template_1.block('Dynamic Group Authorization Checks', [
            this.dynamicAuthorizationExpressionForCreate(rules, variableToCheck, variableToSet)
        ]);
    }
    /**
     * Given a set of dynamic group authorization rules verifies that input
     * value satisfies at least one dynamic group authorization rule.
     * @param rules The list of authorization rules.
     * @param variableToCheck The name of the value containing the input.
     * @param variableToSet The name of the variable to set when auth is satisfied.
     */
    dynamicGroupAuthorizationExpressionForCreateOperationsByField(rules, fieldToCheck, variableToCheck = 'ctx.args.input', variableToSet = graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsDynamicGroupAuthorizedVariable) {
        if (!rules || rules.length === 0) {
            return graphql_mapping_template_1.comment(`No dynamic group authorization rules for field "${fieldToCheck}"`);
        }
        let groupAuthorizationExpression = this.dynamicAuthorizationExpressionForCreate(rules, variableToCheck, variableToSet, rule => `Authorization rule on field "${fieldToCheck}": { allow: ${rule.allow}, \
groupsField: "${rule.groupsField || constants_1.DEFAULT_GROUPS_FIELD}", groupClaim: "${rule.groupClaim || constants_1.DEFAULT_GROUP_CLAIM}" }`);
        return graphql_mapping_template_1.block(`Dynamic group authorization rules for field "${fieldToCheck}"`, [
            groupAuthorizationExpression
        ]);
    }
    dynamicAuthorizationExpressionForCreate(rules, variableToCheck = 'ctx.args.input', variableToSet = graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsDynamicGroupAuthorizedVariable, formatComment) {
        let groupAuthorizationExpressions = [];
        for (const rule of rules) {
            // for loop do check of rules here
            const groupsAttribute = rule.groupsField || constants_1.DEFAULT_GROUPS_FIELD;
            const groupClaimAttribute = rule.groupClaim || constants_1.DEFAULT_GROUP_CLAIM;
            groupAuthorizationExpressions = groupAuthorizationExpressions.concat(formatComment ?
                graphql_mapping_template_1.comment(formatComment(rule)) :
                graphql_mapping_template_1.comment(`Authorization rule: { allow: ${rule.allow}, groupsField: "${groupsAttribute}", groupClaim: "${groupClaimAttribute}"`), this.setUserGroups(rule.groupClaim), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), graphql_mapping_template_1.raw(`$util.defaultIfNull($${variableToSet}, false)`)), graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('userGroup'), graphql_mapping_template_1.ref('userGroups'), [
                graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$util.isList($ctx.args.input.${groupsAttribute})`), graphql_mapping_template_1.iff(graphql_mapping_template_1.ref(`${variableToCheck}.${groupsAttribute}.contains($userGroup)`), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), graphql_mapping_template_1.raw('true')))),
                graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$util.isString($ctx.args.input.${groupsAttribute})`), graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$ctx.args.input.${groupsAttribute} == $userGroup`), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), graphql_mapping_template_1.raw('true'))))
            ]));
        }
        return graphql_mapping_template_1.compoundExpression(groupAuthorizationExpressions);
    }
    /**
     * Given a set of owner authorization rules verifies that input
     * value satisfies at least one rule.
     * @param rules The list of authorization rules.
     * @param variableToCheck The name of the value containing the input.
     * @param variableToSet The name of the variable to set when auth is satisfied.
     */
    ownerAuthorizationExpressionForCreateOperations(rules, fieldIsList, variableToCheck = 'ctx.args.input', variableToSet = graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsOwnerAuthorizedVariable) {
        if (!rules || rules.length === 0) {
            return graphql_mapping_template_1.comment(`No Owner Authorization Rules`);
        }
        return graphql_mapping_template_1.block('Owner Authorization Checks', [
            this.ownershipAuthorizationExpressionForCreate(rules, fieldIsList, variableToCheck, variableToSet)
        ]);
    }
    ownerAuthorizationExpressionForSubscriptions(rules, variableToCheck = 'ctx.args', variableToSet = graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsOwnerAuthorizedVariable) {
        if (!rules || rules.length === 0) {
            return graphql_mapping_template_1.comment(`No Owner Authorization Rules`);
        }
        return graphql_mapping_template_1.block('Owner Authorization Checks', [
            this.ownershipAuthorizationExpressionForSubscriptions(rules, variableToCheck, variableToSet)
        ]);
    }
    ownershipAuthorizationExpressionForSubscriptions(rules, variableToCheck = 'ctx.args', variableToSet = graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsOwnerAuthorizedVariable, formatComment) {
        let ownershipAuthorizationExpressions = [];
        let ruleNumber = 0;
        for (const rule of rules) {
            const ownerAttribute = rule.ownerField || constants_1.DEFAULT_OWNER_FIELD;
            const rawUsername = rule.identityField || rule.identityClaim || constants_1.DEFAULT_IDENTITY_FIELD;
            const isUser = isUsername(rawUsername);
            const identityAttribute = replaceIfUsername(rawUsername);
            const allowedOwnersVariable = `allowedOwners${ruleNumber}`;
            ownershipAuthorizationExpressions = ownershipAuthorizationExpressions.concat(formatComment ?
                graphql_mapping_template_1.comment(formatComment(rule)) :
                graphql_mapping_template_1.comment(`Authorization rule: { allow: ${rule.allow}, ownerField: "${ownerAttribute}", identityClaim: "${identityAttribute}" }`), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(allowedOwnersVariable), graphql_mapping_template_1.raw(`$util.defaultIfNull($${variableToCheck}.${ownerAttribute}, null)`)), isUser ?
                // tslint:disable-next-line
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('identityValue'), graphql_mapping_template_1.raw(`$util.defaultIfNull($ctx.identity.claims.get("${rawUsername}"),
                        $util.defaultIfNull($ctx.identity.claims.get("${identityAttribute}"), "${graphql_transformer_common_1.NONE_VALUE}"))`))
                : graphql_mapping_template_1.set(graphql_mapping_template_1.ref('identityValue'), graphql_mapping_template_1.raw(`$util.defaultIfNull($ctx.identity.claims.get("${identityAttribute}"), "${graphql_transformer_common_1.NONE_VALUE}")`)), 
            // If a list of owners check for at least one.
            graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$util.isList($${allowedOwnersVariable})`), graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('allowedOwner'), graphql_mapping_template_1.ref(allowedOwnersVariable), [
                graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$allowedOwner == $identityValue`), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), graphql_mapping_template_1.raw('true'))),
            ])), 
            // If a single owner check for at least one.
            graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$util.isString($${allowedOwnersVariable})`), graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$${allowedOwnersVariable} == $identityValue`), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), graphql_mapping_template_1.raw('true')))));
            ruleNumber++;
        }
        return graphql_mapping_template_1.compoundExpression([
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), graphql_mapping_template_1.raw(`false`)),
            ...ownershipAuthorizationExpressions,
        ]);
    }
    /**
     * Given a set of owner authorization rules verifies that if the input
     * specifies the given input field, the value satisfies at least one rule.
     * @param rules The list of authorization rules.
     * @param variableToCheck The name of the value containing the input.
     * @param variableToSet The name of the variable to set when auth is satisfied.
     */
    ownerAuthorizationExpressionForCreateOperationsByField(rules, fieldToCheck, fieldIsList, variableToCheck = 'ctx.args.input', variableToSet = graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsOwnerAuthorizedVariable) {
        if (!rules || rules.length === 0) {
            return graphql_mapping_template_1.comment(`No Owner Authorization Rules`);
        }
        return graphql_mapping_template_1.block(`Owner authorization rules for field "${fieldToCheck}"`, [
            this.ownershipAuthorizationExpressionForCreate(rules, fieldIsList, variableToCheck, variableToSet, rule => `Authorization rule: { allow: ${rule.allow}, \
ownerField: "${rule.ownerField || constants_1.DEFAULT_OWNER_FIELD}", \
identityClaim: "${rule.identityField || rule.identityClaim || constants_1.DEFAULT_IDENTITY_FIELD}" }`)
        ]);
    }
    ownershipAuthorizationExpressionForCreate(rules, fieldIsList, variableToCheck = 'ctx.args.input', variableToSet = graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsOwnerAuthorizedVariable, formatComment) {
        let ownershipAuthorizationExpressions = [];
        let ruleNumber = 0;
        for (const rule of rules) {
            const ownerAttribute = rule.ownerField || constants_1.DEFAULT_OWNER_FIELD;
            const rawUsername = rule.identityField || rule.identityClaim || constants_1.DEFAULT_IDENTITY_FIELD;
            const isUser = isUsername(rawUsername);
            const identityAttribute = replaceIfUsername(rawUsername);
            const ownerFieldIsList = fieldIsList(ownerAttribute);
            const allowedOwnersVariable = `allowedOwners${ruleNumber}`;
            ownershipAuthorizationExpressions = ownershipAuthorizationExpressions.concat(formatComment ?
                graphql_mapping_template_1.comment(formatComment(rule)) :
                graphql_mapping_template_1.comment(`Authorization rule: { allow: ${rule.allow}, ownerField: "${ownerAttribute}", identityClaim: "${identityAttribute}" }`), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(allowedOwnersVariable), graphql_mapping_template_1.raw(`$util.defaultIfNull($${variableToCheck}.${ownerAttribute}, null)`)), isUser ?
                // tslint:disable-next-line
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('identityValue'), graphql_mapping_template_1.raw(`$util.defaultIfNull($ctx.identity.claims.get("${rawUsername}"), $util.defaultIfNull($ctx.identity.claims.get("${identityAttribute}"), "${graphql_transformer_common_1.NONE_VALUE}"))`)) :
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('identityValue'), graphql_mapping_template_1.raw(`$util.defaultIfNull($ctx.identity.claims.get("${identityAttribute}"), "${graphql_transformer_common_1.NONE_VALUE}")`)), 
            // If a list of owners check for at least one.
            graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$util.isList($${allowedOwnersVariable})`), graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('allowedOwner'), graphql_mapping_template_1.ref(allowedOwnersVariable), [
                graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$allowedOwner == $identityValue`), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), graphql_mapping_template_1.raw('true'))),
            ])), 
            // If a single owner check for at least one.
            graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$util.isString($${allowedOwnersVariable})`), graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$${allowedOwnersVariable} == $identityValue`), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), graphql_mapping_template_1.raw('true')))));
            // If the owner field is not a list and the user does not
            // provide a value for the owner, set the owner automatically.
            if (!ownerFieldIsList) {
                ownershipAuthorizationExpressions.push(
                // If the owner is not provided set it automatically.
                // If the user explicitly provides null this will be false and we leave it null.
                graphql_mapping_template_1.iff(graphql_mapping_template_1.and([
                    graphql_mapping_template_1.raw(`$util.isNull($${allowedOwnersVariable})`),
                    graphql_mapping_template_1.parens(graphql_mapping_template_1.raw(`! $${variableToCheck}.containsKey("${ownerAttribute}")`)),
                ]), graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.qref(`$${variableToCheck}.put("${ownerAttribute}", $identityValue)`),
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), graphql_mapping_template_1.raw('true'))
                ])));
            }
            else {
                // If the owner field is a list and the user does not
                // provide a list of values for the owner, set the list with
                // the owner as the sole member.
                ownershipAuthorizationExpressions.push(
                // If the owner is not provided set it automatically.
                // If the user explicitly provides null this will be false and we leave it null.
                graphql_mapping_template_1.iff(graphql_mapping_template_1.and([
                    graphql_mapping_template_1.raw(`$util.isNull($${allowedOwnersVariable})`),
                    graphql_mapping_template_1.parens(graphql_mapping_template_1.raw(`! $${variableToCheck}.containsKey("${ownerAttribute}")`)),
                ]), graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.qref(`$${variableToCheck}.put("${ownerAttribute}", ["$identityValue"])`),
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), graphql_mapping_template_1.raw('true'))
                ])));
            }
            ruleNumber++;
        }
        return graphql_mapping_template_1.compoundExpression([
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), graphql_mapping_template_1.raw(`false`)),
            ...ownershipAuthorizationExpressions,
        ]);
    }
    /**
     * Given a set of dynamic group authorization rules verifies w/ a conditional
     * expression that the existing object has the correct group expression.
     * @param rules The list of authorization rules.
     * @param variableToCheck The name of the value containing the input.
     * @param variableToSet The name of the variable to set when auth is satisfied.
     */
    dynamicGroupAuthorizationExpressionForUpdateOrDeleteOperations(rules, fieldBeingProtected, variableToCheck = 'ctx.args.input', variableToSet = graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsDynamicGroupAuthorizedVariable) {
        const fieldMention = fieldBeingProtected ? ` for field "${fieldBeingProtected}"` : '';
        if (!rules || rules.length === 0) {
            return graphql_mapping_template_1.comment(`No dynamic group authorization rules${fieldMention}`);
        }
        let groupAuthorizationExpressions = [];
        let ruleNumber = 0;
        for (const rule of rules) {
            const groupsAttribute = rule.groupsField || constants_1.DEFAULT_GROUPS_FIELD;
            const groupsAttributeName = fieldBeingProtected ? `${fieldBeingProtected}_groupsAttribute${ruleNumber}` : `groupsAttribute${ruleNumber}`;
            const groupName = fieldBeingProtected ? `${fieldBeingProtected}_group${ruleNumber}` : `group${ruleNumber}`;
            const groupClaimAttribute = rule.groupClaim || constants_1.DEFAULT_GROUP_CLAIM;
            groupAuthorizationExpressions = groupAuthorizationExpressions.concat(graphql_mapping_template_1.comment(`Authorization rule${fieldMention}: { allow: ${rule.allow}, groupsField: "${groupsAttribute}", groupClaim: "${groupClaimAttribute}"}`), 
            // Add the new auth expression and values
            this.setUserGroups(rule.groupClaim), graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('userGroup'), graphql_mapping_template_1.ref('userGroups'), [
                graphql_mapping_template_1.raw(`$util.qr($groupAuthExpressions.add("contains(#${groupsAttributeName}, :${groupName}$foreach.count)"))`),
                graphql_mapping_template_1.raw(`$util.qr($groupAuthExpressionValues.put(":${groupName}$foreach.count", { "S": $userGroup }))`),
            ]), graphql_mapping_template_1.iff(graphql_mapping_template_1.raw('$userGroups.size() > 0'), graphql_mapping_template_1.raw(`$util.qr($groupAuthExpressionNames.put("#${groupsAttributeName}", "${groupsAttribute}"))`)));
            ruleNumber++;
        }
        // check for groupclaim here
        return graphql_mapping_template_1.block('Dynamic group authorization checks', [
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('groupAuthExpressions'), graphql_mapping_template_1.list([])),
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('groupAuthExpressionValues'), graphql_mapping_template_1.obj({})),
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('groupAuthExpressionNames'), graphql_mapping_template_1.obj({})),
            ...groupAuthorizationExpressions,
        ]);
    }
    /**
     * Given a set of owner authorization rules verifies with a conditional
     * expression that the existing object is owned.
     * @param rules The list of authorization rules.
     * @param variableToCheck The name of the value containing the input.
     * @param variableToSet The name of the variable to set when auth is satisfied.
     */
    ownerAuthorizationExpressionForUpdateOrDeleteOperations(rules, fieldIsList, fieldBeingProtected, variableToCheck = 'ctx.args.input', variableToSet = graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsOwnerAuthorizedVariable) {
        const fieldMention = fieldBeingProtected ? ` for field "${fieldBeingProtected}"` : '';
        if (!rules || rules.length === 0) {
            return graphql_mapping_template_1.comment(`No owner authorization rules${fieldMention}`);
        }
        let ownerAuthorizationExpressions = [];
        let ruleNumber = 0;
        for (const rule of rules) {
            const ownerAttribute = rule.ownerField || constants_1.DEFAULT_OWNER_FIELD;
            const rawUsername = rule.identityField || rule.identityClaim || constants_1.DEFAULT_IDENTITY_FIELD;
            const isUser = isUsername(rawUsername);
            const identityAttribute = replaceIfUsername(rawUsername);
            const ownerFieldIsList = fieldIsList(ownerAttribute);
            const ownerName = fieldBeingProtected ? `${fieldBeingProtected}_owner${ruleNumber}` : `owner${ruleNumber}`;
            const identityName = fieldBeingProtected ? `${fieldBeingProtected}_identity${ruleNumber}` : `identity${ruleNumber}`;
            ownerAuthorizationExpressions.push(
            // tslint:disable:max-line-length
            graphql_mapping_template_1.comment(`Authorization rule${fieldMention}: { allow: ${rule.allow}, ownerField: "${ownerAttribute}", identityClaim: "${identityAttribute}" }`));
            if (ownerFieldIsList) {
                ownerAuthorizationExpressions.push(graphql_mapping_template_1.raw(`$util.qr($ownerAuthExpressions.add("contains(#${ownerName}, :${identityName})"))`));
            }
            else {
                ownerAuthorizationExpressions.push(graphql_mapping_template_1.raw(`$util.qr($ownerAuthExpressions.add("#${ownerName} = :${identityName}"))`));
            }
            ownerAuthorizationExpressions = ownerAuthorizationExpressions.concat(graphql_mapping_template_1.raw(`$util.qr($ownerAuthExpressionNames.put("#${ownerName}", "${ownerAttribute}"))`), 
            // tslint:disable
            isUser ?
                graphql_mapping_template_1.raw(`$util.qr($ownerAuthExpressionValues.put(":${identityName}", $util.dynamodb.toDynamoDB($util.defaultIfNull($ctx.identity.claims.get("${rawUsername}"), $util.defaultIfNull($ctx.identity.claims.get("${identityAttribute}"), "${graphql_transformer_common_1.NONE_VALUE}")))))`) :
                graphql_mapping_template_1.raw(`$util.qr($ownerAuthExpressionValues.put(":${identityName}", $util.dynamodb.toDynamoDB($util.defaultIfNull($ctx.identity.claims.get("${identityAttribute}"), "${graphql_transformer_common_1.NONE_VALUE}"))))`)
            // tslint:enable
            );
            ruleNumber++;
        }
        return graphql_mapping_template_1.block('Owner Authorization Checks', [
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('ownerAuthExpressions'), graphql_mapping_template_1.list([])),
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('ownerAuthExpressionValues'), graphql_mapping_template_1.obj({})),
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('ownerAuthExpressionNames'), graphql_mapping_template_1.obj({})),
            ...ownerAuthorizationExpressions,
        ]);
    }
    /**
     * Given a list of rules return a VTL expression that checks if the given variableToCheck
     * statisies at least one of the auth rules.
     * @param rules The list of dynamic group authorization rules.
     */
    dynamicGroupAuthorizationExpressionForReadOperations(rules, variableToCheck = 'ctx.result', variableToSet = graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsDynamicGroupAuthorizedVariable, defaultValue = graphql_mapping_template_1.raw(`$util.defaultIfNull($${variableToSet}, false)`)) {
        if (!rules || rules.length === 0) {
            return graphql_mapping_template_1.comment(`No Dynamic Group Authorization Rules`);
        }
        let groupAuthorizationExpressions = [];
        for (const rule of rules) {
            const groupsAttribute = rule.groupsField || constants_1.DEFAULT_GROUPS_FIELD;
            const groupClaimAttribute = rule.groupClaim || constants_1.DEFAULT_GROUP_CLAIM;
            groupAuthorizationExpressions = groupAuthorizationExpressions.concat(graphql_mapping_template_1.comment(`Authorization rule: { allow: ${rule.allow}, groupsField: "${groupsAttribute}", groupClaim: "${groupClaimAttribute}" }`), graphql_mapping_template_1.set(graphql_mapping_template_1.ref('allowedGroups'), graphql_mapping_template_1.ref(`util.defaultIfNull($${variableToCheck}.${groupsAttribute}, [])`)), this.setUserGroups(rule.groupClaim), graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('userGroup'), graphql_mapping_template_1.ref('userGroups'), [
                graphql_mapping_template_1.iff(graphql_mapping_template_1.raw('$util.isList($allowedGroups)'), graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$allowedGroups.contains($userGroup)`), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), graphql_mapping_template_1.raw('true')))),
                graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$util.isString($allowedGroups)`), graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$allowedGroups == $userGroup`), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), graphql_mapping_template_1.raw('true'))))
            ]));
        }
        // check for group claim here
        return graphql_mapping_template_1.block('Dynamic Group Authorization Checks', [
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), defaultValue),
            ...groupAuthorizationExpressions,
        ]);
    }
    /**
     * Given a list of rules return a VTL expression that checks if the given variableToCheck
     * statisies at least one of the auth rules.
     * @param rules The list of dynamic group authorization rules.
     */
    ownerAuthorizationExpressionForReadOperations(rules, variableToCheck = 'ctx.result', variableToSet = graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsOwnerAuthorizedVariable, defaultValue = graphql_mapping_template_1.raw(`$util.defaultIfNull($${variableToSet}, false)`)) {
        if (!rules || rules.length === 0) {
            return graphql_mapping_template_1.comment(`No Owner Authorization Rules`);
        }
        let ownerAuthorizationExpressions = [];
        let ruleNumber = 0;
        for (const rule of rules) {
            const ownerAttribute = rule.ownerField || constants_1.DEFAULT_OWNER_FIELD;
            const rawUsername = rule.identityField || rule.identityClaim || constants_1.DEFAULT_IDENTITY_FIELD;
            const isUser = isUsername(rawUsername);
            const identityAttribute = replaceIfUsername(rawUsername);
            const allowedOwnersVariable = `allowedOwners${ruleNumber}`;
            ownerAuthorizationExpressions = ownerAuthorizationExpressions.concat(graphql_mapping_template_1.comment(`Authorization rule: { allow: ${rule.allow}, ownerField: "${ownerAttribute}", identityClaim: "${identityAttribute}" }`), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(allowedOwnersVariable), graphql_mapping_template_1.ref(`${variableToCheck}.${ownerAttribute}`)), isUser ?
                // tslint:disable-next-line
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('identityValue'), graphql_mapping_template_1.raw(`$util.defaultIfNull($ctx.identity.claims.get("${rawUsername}"), $util.defaultIfNull($ctx.identity.claims.get("${identityAttribute}"), "${graphql_transformer_common_1.NONE_VALUE}"))`)) :
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('identityValue'), graphql_mapping_template_1.raw(`$util.defaultIfNull($ctx.identity.claims.get("${identityAttribute}"), "${graphql_transformer_common_1.NONE_VALUE}")`)), graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$util.isList($${allowedOwnersVariable})`), graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('allowedOwner'), graphql_mapping_template_1.ref(allowedOwnersVariable), [
                graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$allowedOwner == $identityValue`), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), graphql_mapping_template_1.raw('true'))),
            ])), graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$util.isString($${allowedOwnersVariable})`), graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$${allowedOwnersVariable} == $identityValue`), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), graphql_mapping_template_1.raw('true')))));
            ruleNumber++;
        }
        return graphql_mapping_template_1.block('Owner Authorization Checks', [
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(variableToSet), defaultValue),
            ...ownerAuthorizationExpressions
        ]);
    }
    throwIfSubscriptionUnauthorized() {
        const ifUnauthThrow = graphql_mapping_template_1.iff(graphql_mapping_template_1.not(graphql_mapping_template_1.parens(graphql_mapping_template_1.or([
            graphql_mapping_template_1.equals(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsStaticGroupAuthorizedVariable), graphql_mapping_template_1.raw('true')),
            graphql_mapping_template_1.equals(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsOwnerAuthorizedVariable), graphql_mapping_template_1.raw('true'))
        ]))), graphql_mapping_template_1.raw('$util.unauthorized()'));
        return graphql_mapping_template_1.block('Throw if unauthorized', [
            ifUnauthThrow,
        ]);
    }
    throwIfUnauthorized(field) {
        const staticGroupAuthorizedVariable = this.getStaticAuthorizationVariable(field);
        const ifUnauthThrow = graphql_mapping_template_1.iff(graphql_mapping_template_1.not(graphql_mapping_template_1.parens(graphql_mapping_template_1.or([
            graphql_mapping_template_1.equals(graphql_mapping_template_1.ref(staticGroupAuthorizedVariable), graphql_mapping_template_1.raw('true')),
            graphql_mapping_template_1.equals(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsDynamicGroupAuthorizedVariable), graphql_mapping_template_1.raw('true')),
            graphql_mapping_template_1.equals(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsOwnerAuthorizedVariable), graphql_mapping_template_1.raw('true'))
        ]))), graphql_mapping_template_1.raw('$util.unauthorized()'));
        return graphql_mapping_template_1.block('Throw if unauthorized', [
            ifUnauthThrow,
        ]);
    }
    // A = IsStaticallyAuthed
    // B = AuthConditionIsNotNull
    // ! (A OR B) == (!A AND !B)
    throwIfNotStaticGroupAuthorizedOrAuthConditionIsEmpty(field) {
        const staticGroupAuthorizedVariable = this.getStaticAuthorizationVariable(field);
        const ifUnauthThrow = graphql_mapping_template_1.iff(graphql_mapping_template_1.not(graphql_mapping_template_1.parens(graphql_mapping_template_1.or([
            graphql_mapping_template_1.equals(graphql_mapping_template_1.ref(staticGroupAuthorizedVariable), graphql_mapping_template_1.raw('true')),
            graphql_mapping_template_1.parens(graphql_mapping_template_1.raw('$totalAuthExpression != ""'))
        ]))), graphql_mapping_template_1.raw('$util.unauthorized()'));
        return graphql_mapping_template_1.block('Throw if unauthorized', [
            ifUnauthThrow,
        ]);
    }
    collectAuthCondition() {
        return graphql_mapping_template_1.block('Collect Auth Condition', [
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthCondition), graphql_mapping_template_1.raw(`$util.defaultIfNull($authCondition, ${graphql_mapping_template_1.print(graphql_mapping_template_1.obj({
                expression: graphql_mapping_template_1.str(""),
                expressionNames: graphql_mapping_template_1.obj({}),
                expressionValues: graphql_mapping_template_1.obj({})
            }))})`)),
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('totalAuthExpression'), graphql_mapping_template_1.str('')),
            graphql_mapping_template_1.comment('Add dynamic group auth conditions if they exist'),
            graphql_mapping_template_1.iff(graphql_mapping_template_1.ref('groupAuthExpressions'), graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('authExpr'), graphql_mapping_template_1.ref('groupAuthExpressions'), [
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('totalAuthExpression'), graphql_mapping_template_1.str(`$totalAuthExpression $authExpr`)),
                graphql_mapping_template_1.iff(graphql_mapping_template_1.ref('foreach.hasNext'), graphql_mapping_template_1.set(graphql_mapping_template_1.ref('totalAuthExpression'), graphql_mapping_template_1.str(`$totalAuthExpression OR`)))
            ])),
            graphql_mapping_template_1.iff(graphql_mapping_template_1.ref('groupAuthExpressionNames'), graphql_mapping_template_1.raw(`$util.qr($${graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthCondition}.expressionNames.putAll($groupAuthExpressionNames))`)),
            graphql_mapping_template_1.iff(graphql_mapping_template_1.ref('groupAuthExpressionValues'), graphql_mapping_template_1.raw(`$util.qr($${graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthCondition}.expressionValues.putAll($groupAuthExpressionValues))`)),
            graphql_mapping_template_1.comment('Add owner auth conditions if they exist'),
            graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$totalAuthExpression != "" && $ownerAuthExpressions && $ownerAuthExpressions.size() > 0`), graphql_mapping_template_1.set(graphql_mapping_template_1.ref('totalAuthExpression'), graphql_mapping_template_1.str(`$totalAuthExpression OR`))),
            graphql_mapping_template_1.iff(graphql_mapping_template_1.ref('ownerAuthExpressions'), graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('authExpr'), graphql_mapping_template_1.ref('ownerAuthExpressions'), [
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('totalAuthExpression'), graphql_mapping_template_1.str(`$totalAuthExpression $authExpr`)),
                graphql_mapping_template_1.iff(graphql_mapping_template_1.ref('foreach.hasNext'), graphql_mapping_template_1.set(graphql_mapping_template_1.ref('totalAuthExpression'), graphql_mapping_template_1.str(`$totalAuthExpression OR`)))
            ])),
            graphql_mapping_template_1.iff(graphql_mapping_template_1.ref('ownerAuthExpressionNames'), graphql_mapping_template_1.raw(`$util.qr($${graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthCondition}.expressionNames.putAll($ownerAuthExpressionNames))`)),
            graphql_mapping_template_1.iff(graphql_mapping_template_1.ref('ownerAuthExpressionValues'), graphql_mapping_template_1.raw(`$util.qr($${graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthCondition}.expressionValues.putAll($ownerAuthExpressionValues))`)),
            graphql_mapping_template_1.comment('Set final expression if it has changed.'),
            graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$totalAuthExpression != ""`), graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw(`$util.isNullOrEmpty($${graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthCondition}.expression)`), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(`${graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthCondition}.expression`), graphql_mapping_template_1.str(`($totalAuthExpression)`)), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(`${graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthCondition}.expression`), graphql_mapping_template_1.str(`$${graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthCondition}.expression AND ($totalAuthExpression)`))))
        ]);
    }
    appendItemIfLocallyAuthorized() {
        return graphql_mapping_template_1.iff(graphql_mapping_template_1.parens(graphql_mapping_template_1.or([
            graphql_mapping_template_1.equals(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsLocalDynamicGroupAuthorizedVariable), graphql_mapping_template_1.raw('true')),
            graphql_mapping_template_1.equals(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsLocalOwnerAuthorizedVariable), graphql_mapping_template_1.raw('true'))
        ])), graphql_mapping_template_1.qref('$items.add($item)'));
    }
    setUserGroups(customGroup) {
        if (customGroup) {
            return graphql_mapping_template_1.compoundExpression([
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('userGroup'), graphql_mapping_template_1.raw(`$util.defaultIfNull($ctx.identity.claims.get("${customGroup}"), [])`)),
                graphql_mapping_template_1.iff(graphql_mapping_template_1.raw('$util.isString($userGroup)'), graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw('$util.isList($util.parseJson($userGroup))'), graphql_mapping_template_1.set(graphql_mapping_template_1.ref('userGroup'), graphql_mapping_template_1.raw('$util.parseJson($userGroup)')), graphql_mapping_template_1.set(graphql_mapping_template_1.ref('userGroup'), graphql_mapping_template_1.raw('[$userGroup]')))),
            ]);
        }
        return graphql_mapping_template_1.set(graphql_mapping_template_1.ref('userGroups'), graphql_mapping_template_1.raw(`$util.defaultIfNull($ctx.identity.claims.get("${constants_1.DEFAULT_GROUP_CLAIM}"), [])`));
    }
    generateSubscriptionResolver(fieldName, subscriptionTypeName = 'Subscription') {
        return new cloudform_types_1.AppSync.Resolver({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: "NONE",
            FieldName: fieldName,
            TypeName: subscriptionTypeName,
            RequestMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.raw(`{
    "version": "2018-05-29",
    "payload": {}
}`)),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.raw(`$util.toJson(null)`))
        });
    }
    operationCheckExpression(operation, field) {
        return graphql_mapping_template_1.block('Checking for allowed operations which can return this field', [
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('operation'), graphql_mapping_template_1.raw('$util.defaultIfNull($context.source.operation, "null")')),
            graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw(`$operation == "${operation}"`), graphql_mapping_template_1.ref('util.toJson(null)'), graphql_mapping_template_1.ref(`util.toJson($context.source.${field})`))
        ]);
    }
    setOperationExpression(operation) {
        return graphql_mapping_template_1.print(graphql_mapping_template_1.block('Setting the operation', [
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('context.result.operation'), graphql_mapping_template_1.str(operation))
        ]));
    }
    getAuthModeCheckWrappedExpression(expectedAuthModes, expression) {
        if (!expectedAuthModes || expectedAuthModes.size === 0) {
            return expression;
        }
        const conditions = [];
        for (const expectedAuthMode of expectedAuthModes) {
            conditions.push(graphql_mapping_template_1.equals(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthMode), graphql_mapping_template_1.str(`${expectedAuthMode}`)));
        }
        return graphql_mapping_template_1.block("Check authMode and execute owner/group checks", [
            graphql_mapping_template_1.iff(conditions.length === 1 ? conditions[0] : graphql_mapping_template_1.or(conditions), expression)
        ]);
    }
    getAuthModeDeterminationExpression(authProviders) {
        if (!authProviders || authProviders.size === 0) {
            return graphql_mapping_template_1.comment(`No authentication mode determination needed`);
        }
        const expressions = [];
        for (const authProvider of authProviders) {
            if (authProvider === 'userPools') {
                const userPoolsExpression = graphql_mapping_template_1.iff(graphql_mapping_template_1.and([
                    graphql_mapping_template_1.raw(`$util.isNullOrEmpty($${graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthMode})`),
                    graphql_mapping_template_1.not(graphql_mapping_template_1.raw(`$util.isNull($ctx.identity)`)),
                    graphql_mapping_template_1.not(graphql_mapping_template_1.raw(`$util.isNull($ctx.identity.sub)`)),
                    graphql_mapping_template_1.not(graphql_mapping_template_1.raw(`$util.isNull($ctx.identity.issuer)`)),
                    graphql_mapping_template_1.not(graphql_mapping_template_1.raw(`$util.isNull($ctx.identity.username)`)),
                    graphql_mapping_template_1.not(graphql_mapping_template_1.raw(`$util.isNull($ctx.identity.claims)`)),
                    graphql_mapping_template_1.not(graphql_mapping_template_1.raw(`$util.isNull($ctx.identity.sourceIp)`)),
                    graphql_mapping_template_1.not(graphql_mapping_template_1.raw(`$util.isNull($ctx.identity.defaultAuthStrategy)`)),
                ]), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthMode), graphql_mapping_template_1.str(`userPools`)));
                expressions.push(userPoolsExpression);
            }
            else if (authProvider === 'oidc') {
                const oidcExpression = graphql_mapping_template_1.iff(graphql_mapping_template_1.and([
                    graphql_mapping_template_1.raw(`$util.isNullOrEmpty($${graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthMode})`),
                    graphql_mapping_template_1.not(graphql_mapping_template_1.raw(`$util.isNull($ctx.identity)`)),
                    graphql_mapping_template_1.not(graphql_mapping_template_1.raw(`$util.isNull($ctx.identity.sub)`)),
                    graphql_mapping_template_1.not(graphql_mapping_template_1.raw(`$util.isNull($ctx.identity.issuer)`)),
                    graphql_mapping_template_1.not(graphql_mapping_template_1.raw(`$util.isNull($ctx.identity.claims)`)),
                    graphql_mapping_template_1.raw(`$util.isNull($ctx.identity.username)`),
                    graphql_mapping_template_1.raw(`$util.isNull($ctx.identity.sourceIp)`),
                    graphql_mapping_template_1.raw(`$util.isNull($ctx.identity.defaultAuthStrategy)`),
                ]), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthMode), graphql_mapping_template_1.str(`oidc`)));
                if (expressions.length > 0) {
                    expressions.push(graphql_mapping_template_1.newline());
                }
                expressions.push(oidcExpression);
            }
        }
        return graphql_mapping_template_1.block("Determine request authentication mode", expressions);
    }
    getStaticAuthorizationVariable(field) {
        return field ? `${field.name.value}_${graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsStaticGroupAuthorizedVariable}` :
            graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsStaticGroupAuthorizedVariable;
    }
    makeIAMPolicyForRole(isAuthPolicy, resources) {
        const authPiece = isAuthPolicy ? "auth" : "unauth";
        const policyResources = [];
        for (const resource of resources) {
            // We always have 2 parts, no need to check
            const resourceParts = resource.split("/");
            if (resourceParts[1] !== "null") {
                policyResources.push(cloudform_types_1.Fn.Sub('arn:aws:appsync:${AWS::Region}:${AWS::AccountId}:apis/${apiId}/types/${typeName}/fields/${fieldName}', {
                    apiId: {
                        "Fn::GetAtt": [
                            "GraphQLAPI",
                            "ApiId"
                        ]
                    },
                    typeName: resourceParts[0],
                    fieldName: resourceParts[1]
                }));
            }
            else {
                policyResources.push(cloudform_types_1.Fn.Sub('arn:aws:appsync:${AWS::Region}:${AWS::AccountId}:apis/${apiId}/types/${typeName}/*', {
                    apiId: {
                        "Fn::GetAtt": [
                            "GraphQLAPI",
                            "ApiId"
                        ]
                    },
                    typeName: resourceParts[0]
                }));
            }
        }
        return new cloudform_types_1.IAM.Policy({
            PolicyName: `appsync-${authPiece}role-policy`,
            Roles: [
                //HACK double casting needed because it cannot except Ref
                { Ref: `${authPiece}RoleName` }
            ],
            PolicyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Action: [
                            'appsync:GraphQL'
                        ],
                        Resource: policyResources,
                    }
                ],
            },
        });
    }
}
exports.ResourceFactory = ResourceFactory;
//# sourceMappingURL=resources_REMOTE_13181.js.map