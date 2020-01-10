"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AuthProvider;
(function (AuthProvider) {
    AuthProvider["apiKey"] = "apiKey";
    AuthProvider["iam"] = "iam";
    AuthProvider["oidc"] = "oidc";
    AuthProvider["userPools"] = "userPools";
})(AuthProvider = exports.AuthProvider || (exports.AuthProvider = {}));
var AuthStrategy;
(function (AuthStrategy) {
    AuthStrategy["owner"] = "owner";
    AuthStrategy["groups"] = "groups";
    AuthStrategy["private"] = "private";
    AuthStrategy["public"] = "public";
})(AuthStrategy = exports.AuthStrategy || (exports.AuthStrategy = {}));
var AuthModelOperation;
(function (AuthModelOperation) {
    AuthModelOperation["create"] = "create";
    AuthModelOperation["update"] = "update";
    AuthModelOperation["delete"] = "delete";
    AuthModelOperation["read"] = "read";
})(AuthModelOperation = exports.AuthModelOperation || (exports.AuthModelOperation = {}));
var AuthModelMutation;
(function (AuthModelMutation) {
    AuthModelMutation["create"] = "create";
    AuthModelMutation["update"] = "update";
    AuthModelMutation["delete"] = "delete";
})(AuthModelMutation = exports.AuthModelMutation || (exports.AuthModelMutation = {}));
const DEFAULT_GROUP_CLAIM = 'cognito:groups';
const DEFAULT_IDENTITY_CLAIM = 'username';
const DEFAULT_OPERATIONS = [AuthModelOperation.create, AuthModelOperation.update, AuthModelOperation.delete];
const DEFAULT_AUTH_PROVIDER = AuthProvider.userPools;
const DEFAULT_OWNER_FIELD = 'owner';
function processAuthDirective(directives) {
    const authDirectives = directives.filter(d => d.name === 'auth');
    return authDirectives.map(d => {
        // filter dynamic groups as they are not supported in subscription
        const authRules = d.arguments.rules || [];
        const processedRules = authRules
            .filter((rule) => !(rule.allow === AuthStrategy.groups && rule.groupField))
            .map((rule) => {
            const operations = rule.operations || rule.mutations || DEFAULT_OPERATIONS;
            const identityClaim = rule.identityClaim || rule.identityField || DEFAULT_IDENTITY_CLAIM;
            if (rule.allow === AuthStrategy.owner) {
                return Object.assign(Object.assign({ 
                    // transformer looks for cognito:username when identityClaim is set to username
                    provider: DEFAULT_AUTH_PROVIDER, ownerField: DEFAULT_OWNER_FIELD }, rule), { identityClaim: identityClaim === 'username' ? 'cognito:username' : identityClaim, operations });
            }
            else if (rule.allow === AuthStrategy.groups) {
                return Object.assign(Object.assign({ groupClaim: DEFAULT_GROUP_CLAIM, provider: DEFAULT_AUTH_PROVIDER }, rule), { operations });
            }
            return rule;
        });
        return Object.assign(Object.assign({}, d), { arguments: Object.assign(Object.assign({}, d.arguments), { rules: processedRules }) });
    });
}
exports.processAuthDirective = processAuthDirective;
//# sourceMappingURL=process-auth.js.map