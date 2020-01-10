"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_transformer_common_1 = require("graphql-transformer-common");
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
var graphql_auth_transformer_1 = require("graphql-auth-transformer");
var fs = require("fs");
var CloudFormationClient_1 = require("../CloudFormationClient");
var S3 = require("aws-sdk/clients/s3");
var CognitoClient = require("aws-sdk/clients/cognitoidentityserviceprovider");
var aws_appsync_1 = require("aws-appsync");
var core_1 = require("@aws-amplify/core");
var aws_amplify_1 = require("aws-amplify");
var graphql_tag_1 = require("graphql-tag");
var S3Client_1 = require("../S3Client");
var deployNestedStacks_1 = require("../deployNestedStacks");
var moment = require("moment");
var emptyBucket_1 = require("../emptyBucket");
var cloudform_types_1 = require("cloudform-types");
var cognitoUtils_1 = require("../cognitoUtils");
require("isomorphic-fetch");
// tslint:disable: no-use-before-declare
// To overcome of the way of how AmplifyJS picks up currentUserCredentials
var anyAWS = core_1.AWS;
if (anyAWS && anyAWS.config && anyAWS.config.credentials) {
    delete anyAWS.config.credentials;
}
// to deal with bug in cognito-identity-js
global.fetch = require('node-fetch');
// to deal with subscriptions in node env
global.WebSocket = require('ws');
// delay times
var SUBSCRIPTION_DELAY = 2000;
var PROPAGATION_DELAY = 5000;
var JEST_TIMEOUT = 2000000;
jest.setTimeout(JEST_TIMEOUT);
var AWS_REGION = 'us-west-2';
var cf = new CloudFormationClient_1.CloudFormationClient(AWS_REGION);
var BUILD_TIMESTAMP = moment().format('YYYYMMDDHHmmss');
var STACK_NAME = "SubscriptionAuthTests-" + BUILD_TIMESTAMP;
var BUCKET_NAME = "subscription-auth-tests-bucket-" + BUILD_TIMESTAMP;
var LOCAL_BUILD_ROOT = '/tmp/subscription_auth_tests/';
var DEPLOYMENT_ROOT_KEY = 'deployments';
var AUTH_ROLE_NAME = STACK_NAME + "-authRole";
var UNAUTH_ROLE_NAME = STACK_NAME + "-unauthRole";
var IDENTITY_POOL_NAME = "SubscriptionAuthModelAuthTransformerTest_" + BUILD_TIMESTAMP + "_identity_pool";
var USER_POOL_CLIENTWEB_NAME = "subs_auth_" + BUILD_TIMESTAMP + "_clientweb";
var USER_POOL_CLIENT_NAME = "subs_auth_" + BUILD_TIMESTAMP + "_client";
var GRAPHQL_ENDPOINT = undefined;
/**
 * Client 1 is logged in and is a member of the Admin group.
 */
var GRAPHQL_CLIENT_1 = undefined;
/**
 * Client 2 is logged in and is a member of the Devs group.
 */
var GRAPHQL_CLIENT_2 = undefined;
/**
 * Client 3 is logged in and has no group memberships.
 */
var GRAPHQL_CLIENT_3 = undefined;
/**
 * Auth IAM Client
 */
var GRAPHQL_IAM_AUTH_CLIENT = undefined;
/**
 * API Key Client
 */
var GRAPHQL_APIKEY_CLIENT = undefined;
var USER_POOL_ID = undefined;
var USERNAME1 = 'user1@test.com';
var USERNAME2 = 'user2@test.com';
var USERNAME3 = 'user3@test.com';
var TMP_PASSWORD = 'Password123!';
var REAL_PASSWORD = 'Password1234!';
var INSTRUCTOR_GROUP_NAME = 'Instructor';
var cognitoClient = new CognitoClient({ apiVersion: '2016-04-19', region: AWS_REGION });
var customS3Client = new S3Client_1.S3Client(AWS_REGION);
var awsS3Client = new S3({ region: AWS_REGION });
function outputValueSelector(key) {
    return function (outputs) {
        var output = outputs.find(function (o) { return o.OutputKey === key; });
        return output ? output.OutputValue : null;
    };
}
function createBucket(name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    var params = {
                        Bucket: name,
                    };
                    awsS3Client.createBucket(params, function (err, data) { return (err ? rej(err) : res(data)); });
                })];
        });
    });
}
function deleteBucket(name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    var params = {
                        Bucket: name,
                    };
                    awsS3Client.deleteBucket(params, function (err, data) { return (err ? rej(err) : res(data)); });
                })];
        });
    });
}
beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var validSchema, transformer, userPoolResponse, userPoolClientResponse, userPoolClientId, out, authRole, unauthRole, identityPool, identityPoolRoleMap, userPoolClientWeb, userPoolClient, maxPolicyCount, i, paddedIndex, authResourceName, unauthResourceName, _i, _a, key, _b, _c, stackKey, stack, _d, _e, key, params, finishedStack, getApiEndpoint, getApiKey, apiKey, getIdentityPoolId, identityPoolId, authResAfterGroup, idToken, authRes2AfterGroup, idToken2, authRes3, idToken3, authCredentials, e_1;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                // Create a stack for the post model with auth enabled.
                if (!fs.existsSync(LOCAL_BUILD_ROOT)) {
                    fs.mkdirSync(LOCAL_BUILD_ROOT);
                }
                return [4 /*yield*/, createBucket(BUCKET_NAME)];
            case 1:
                _f.sent();
                validSchema = "\n    # Owners may update their owned records.\n    # Instructors may create Student records.\n    # Any authenticated user may view Student names & emails.\n    # Only Owners can see the ssn\n\n    type Student @model\n    @auth(rules: [\n        {allow: owner}\n        {allow: groups, groups: [\"Instructor\"]}\n    ]) {\n        id: String,\n        name: String,\n        email: AWSEmail,\n        ssn: String @auth(rules: [{allow: owner}])\n    }\n\n    type Post @model\n        @auth(rules: [\n            {allow: owner, ownerField: \"postOwner\"}\n        ])\n    {\n        id: ID!\n        title: String\n        postOwner: String\n    }\n\n    type Todo @model @auth(rules: [\n        { allow: public }\n    ]){\n        id: ID!\n        name: String @auth(rules: [\n            { allow: private, provider: iam }\n        ])\n        description: String\n    }";
                transformer = new graphql_transformer_core_1.GraphQLTransform({
                    transformers: [
                        new graphql_dynamodb_transformer_1.DynamoDBModelTransformer(),
                        new graphql_auth_transformer_1.ModelAuthTransformer({
                            authConfig: {
                                defaultAuthentication: {
                                    authenticationType: 'AMAZON_COGNITO_USER_POOLS',
                                },
                                additionalAuthenticationProviders: [
                                    {
                                        authenticationType: 'API_KEY',
                                        apiKeyConfig: {
                                            description: 'E2E Test API Key',
                                            apiKeyExpirationDays: 300,
                                        },
                                    },
                                    {
                                        authenticationType: 'AWS_IAM',
                                    },
                                ],
                            },
                        }),
                    ],
                });
                return [4 /*yield*/, cognitoUtils_1.createUserPool(cognitoClient, "UserPool" + STACK_NAME)];
            case 2:
                userPoolResponse = _f.sent();
                USER_POOL_ID = userPoolResponse.UserPool.Id;
                return [4 /*yield*/, cognitoUtils_1.createUserPoolClient(cognitoClient, USER_POOL_ID, "UserPool" + STACK_NAME)];
            case 3:
                userPoolClientResponse = _f.sent();
                userPoolClientId = userPoolClientResponse.UserPoolClient.ClientId;
                _f.label = 4;
            case 4:
                _f.trys.push([4, 17, , 18]);
                out = transformer.transform(validSchema);
                authRole = new cloudform_types_1.IAM.Role({
                    RoleName: AUTH_ROLE_NAME,
                    AssumeRolePolicyDocument: {
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Sid: '',
                                Effect: 'Allow',
                                Principal: {
                                    Federated: 'cognito-identity.amazonaws.com',
                                },
                                Action: 'sts:AssumeRoleWithWebIdentity',
                                Condition: {
                                    'ForAnyValue:StringLike': {
                                        'cognito-identity.amazonaws.com:amr': 'authenticated',
                                    },
                                },
                            },
                        ],
                    },
                });
                unauthRole = new cloudform_types_1.IAM.Role({
                    RoleName: UNAUTH_ROLE_NAME,
                    AssumeRolePolicyDocument: {
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Sid: '',
                                Effect: 'Allow',
                                Principal: {
                                    Federated: 'cognito-identity.amazonaws.com',
                                },
                                Action: 'sts:AssumeRoleWithWebIdentity',
                                Condition: {
                                    'ForAnyValue:StringLike': {
                                        'cognito-identity.amazonaws.com:amr': 'unauthenticated',
                                    },
                                },
                            },
                        ],
                    },
                    Policies: [
                        new cloudform_types_1.IAM.Role.Policy({
                            PolicyName: 'appsync-unauthrole-policy',
                            PolicyDocument: {
                                Version: '2012-10-17',
                                Statement: [
                                    {
                                        Effect: 'Allow',
                                        Action: ['appsync:GraphQL'],
                                        Resource: [
                                            {
                                                'Fn::Join': [
                                                    '',
                                                    [
                                                        'arn:aws:appsync:',
                                                        { Ref: 'AWS::Region' },
                                                        ':',
                                                        { Ref: 'AWS::AccountId' },
                                                        ':apis/',
                                                        {
                                                            'Fn::GetAtt': ['GraphQLAPI', 'ApiId'],
                                                        },
                                                        '/*',
                                                    ],
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        }),
                    ],
                });
                identityPool = new cloudform_types_1.Cognito.IdentityPool({
                    IdentityPoolName: IDENTITY_POOL_NAME,
                    CognitoIdentityProviders: [
                        {
                            ClientId: {
                                Ref: 'UserPoolClient',
                            },
                            ProviderName: {
                                'Fn::Sub': [
                                    'cognito-idp.${region}.amazonaws.com/${client}',
                                    {
                                        region: {
                                            Ref: 'AWS::Region',
                                        },
                                        client: USER_POOL_ID,
                                    },
                                ],
                            },
                        },
                        {
                            ClientId: {
                                Ref: 'UserPoolClientWeb',
                            },
                            ProviderName: {
                                'Fn::Sub': [
                                    'cognito-idp.${region}.amazonaws.com/${client}',
                                    {
                                        region: {
                                            Ref: 'AWS::Region',
                                        },
                                        client: USER_POOL_ID,
                                    },
                                ],
                            },
                        },
                    ],
                    AllowUnauthenticatedIdentities: true,
                });
                identityPoolRoleMap = new cloudform_types_1.Cognito.IdentityPoolRoleAttachment({
                    IdentityPoolId: { Ref: 'IdentityPool' },
                    Roles: {
                        unauthenticated: { 'Fn::GetAtt': ['UnauthRole', 'Arn'] },
                        authenticated: { 'Fn::GetAtt': ['AuthRole', 'Arn'] },
                    },
                });
                userPoolClientWeb = new cloudform_types_1.Cognito.UserPoolClient({
                    ClientName: USER_POOL_CLIENTWEB_NAME,
                    RefreshTokenValidity: 30,
                    UserPoolId: USER_POOL_ID,
                });
                userPoolClient = new cloudform_types_1.Cognito.UserPoolClient({
                    ClientName: USER_POOL_CLIENT_NAME,
                    GenerateSecret: true,
                    RefreshTokenValidity: 30,
                    UserPoolId: USER_POOL_ID,
                });
                out.rootStack.Resources.IdentityPool = identityPool;
                out.rootStack.Resources.IdentityPoolRoleMap = identityPoolRoleMap;
                out.rootStack.Resources.UserPoolClientWeb = userPoolClientWeb;
                out.rootStack.Resources.UserPoolClient = userPoolClient;
                out.rootStack.Outputs.IdentityPoolId = { Value: { Ref: 'IdentityPool' } };
                out.rootStack.Outputs.IdentityPoolName = { Value: { 'Fn::GetAtt': ['IdentityPool', 'Name'] } };
                out.rootStack.Resources.AuthRole = authRole;
                out.rootStack.Outputs.AuthRoleArn = { Value: { 'Fn::GetAtt': ['AuthRole', 'Arn'] } };
                out.rootStack.Resources.UnauthRole = unauthRole;
                out.rootStack.Outputs.UnauthRoleArn = { Value: { 'Fn::GetAtt': ['UnauthRole', 'Arn'] } };
                maxPolicyCount = 10;
                for (i = 0; i < maxPolicyCount; i++) {
                    paddedIndex = ("" + (i + 1)).padStart(2, '0');
                    authResourceName = "" + graphql_transformer_common_1.ResourceConstants.RESOURCES.AuthRolePolicy + paddedIndex;
                    unauthResourceName = "" + graphql_transformer_common_1.ResourceConstants.RESOURCES.UnauthRolePolicy + paddedIndex;
                    if (out.rootStack.Resources[authResourceName]) {
                        delete out.rootStack.Resources[authResourceName];
                    }
                    if (out.rootStack.Resources[unauthResourceName]) {
                        delete out.rootStack.Resources[unauthResourceName];
                    }
                }
                delete out.rootStack.Parameters.authRoleName;
                delete out.rootStack.Parameters.unauthRoleName;
                for (_i = 0, _a = Object.keys(out.rootStack.Resources); _i < _a.length; _i++) {
                    key = _a[_i];
                    if (out.rootStack.Resources[key].Properties &&
                        out.rootStack.Resources[key].Properties.Parameters &&
                        out.rootStack.Resources[key].Properties.Parameters.unauthRoleName) {
                        delete out.rootStack.Resources[key].Properties.Parameters.unauthRoleName;
                    }
                    if (out.rootStack.Resources[key].Properties &&
                        out.rootStack.Resources[key].Properties.Parameters &&
                        out.rootStack.Resources[key].Properties.Parameters.authRoleName) {
                        delete out.rootStack.Resources[key].Properties.Parameters.authRoleName;
                    }
                }
                for (_b = 0, _c = Object.keys(out.stacks); _b < _c.length; _b++) {
                    stackKey = _c[_b];
                    stack = out.stacks[stackKey];
                    for (_d = 0, _e = Object.keys(stack.Resources); _d < _e.length; _d++) {
                        key = _e[_d];
                        if (stack.Parameters && stack.Parameters.unauthRoleName) {
                            delete stack.Parameters.unauthRoleName;
                        }
                        if (stack.Parameters && stack.Parameters.authRoleName) {
                            delete stack.Parameters.authRoleName;
                        }
                        if (stack.Resources[key].Properties &&
                            stack.Resources[key].Properties.Parameters &&
                            stack.Resources[key].Properties.Parameters.unauthRoleName) {
                            delete stack.Resources[key].Properties.Parameters.unauthRoleName;
                        }
                        if (stack.Resources[key].Properties &&
                            stack.Resources[key].Properties.Parameters &&
                            stack.Resources[key].Properties.Parameters.authRoleName) {
                            delete stack.Resources[key].Properties.Parameters.authRoleName;
                        }
                    }
                }
                params = {
                    CreateAPIKey: '1',
                    AuthCognitoUserPoolId: USER_POOL_ID,
                };
                return [4 /*yield*/, deployNestedStacks_1.deploy(customS3Client, cf, STACK_NAME, out, params, LOCAL_BUILD_ROOT, BUCKET_NAME, DEPLOYMENT_ROOT_KEY, BUILD_TIMESTAMP)];
            case 5:
                finishedStack = _f.sent();
                expect(finishedStack).toBeDefined();
                getApiEndpoint = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIEndpointOutput);
                getApiKey = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIApiKeyOutput);
                GRAPHQL_ENDPOINT = getApiEndpoint(finishedStack.Outputs);
                console.log("Using graphql url: " + GRAPHQL_ENDPOINT);
                apiKey = getApiKey(finishedStack.Outputs);
                console.log("API KEY: " + apiKey);
                expect(apiKey).toBeTruthy();
                getIdentityPoolId = outputValueSelector('IdentityPoolId');
                identityPoolId = getIdentityPoolId(finishedStack.Outputs);
                expect(identityPoolId).toBeTruthy();
                console.log("Identity Pool Id: " + identityPoolId);
                console.log("User pool Id: " + USER_POOL_ID);
                console.log("User pool ClientId: " + userPoolClientId);
                // Verify we have all the details
                expect(GRAPHQL_ENDPOINT).toBeTruthy();
                expect(USER_POOL_ID).toBeTruthy();
                expect(userPoolClientId).toBeTruthy();
                // Configure Amplify, create users, and sign in.
                cognitoUtils_1.configureAmplify(USER_POOL_ID, userPoolClientId, identityPoolId);
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME1, TMP_PASSWORD, REAL_PASSWORD)];
            case 6:
                _f.sent();
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME2, TMP_PASSWORD, REAL_PASSWORD)];
            case 7:
                _f.sent();
                return [4 /*yield*/, cognitoUtils_1.createGroup(USER_POOL_ID, INSTRUCTOR_GROUP_NAME)];
            case 8:
                _f.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(INSTRUCTOR_GROUP_NAME, USERNAME1, USER_POOL_ID)];
            case 9:
                _f.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(INSTRUCTOR_GROUP_NAME, USERNAME2, USER_POOL_ID)];
            case 10:
                _f.sent();
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME1, TMP_PASSWORD, REAL_PASSWORD)];
            case 11:
                authResAfterGroup = _f.sent();
                idToken = authResAfterGroup.getIdToken().getJwtToken();
                GRAPHQL_CLIENT_1 = new aws_appsync_1.default({
                    url: GRAPHQL_ENDPOINT,
                    region: AWS_REGION,
                    disableOffline: true,
                    offlineConfig: {
                        keyPrefix: 'userPools',
                    },
                    auth: {
                        type: aws_appsync_1.AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
                        jwtToken: idToken,
                    },
                });
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME2, TMP_PASSWORD, REAL_PASSWORD)];
            case 12:
                authRes2AfterGroup = _f.sent();
                idToken2 = authRes2AfterGroup.getIdToken().getJwtToken();
                GRAPHQL_CLIENT_2 = new aws_appsync_1.default({
                    url: GRAPHQL_ENDPOINT,
                    region: AWS_REGION,
                    disableOffline: true,
                    offlineConfig: {
                        keyPrefix: 'userPools',
                    },
                    auth: {
                        type: aws_appsync_1.AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
                        jwtToken: idToken2,
                    },
                });
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME3, TMP_PASSWORD, REAL_PASSWORD)];
            case 13:
                authRes3 = _f.sent();
                idToken3 = authRes3.getIdToken().getJwtToken();
                GRAPHQL_CLIENT_3 = new aws_appsync_1.default({
                    url: GRAPHQL_ENDPOINT,
                    region: AWS_REGION,
                    disableOffline: true,
                    offlineConfig: {
                        keyPrefix: 'userPools',
                    },
                    auth: {
                        type: aws_appsync_1.AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
                        jwtToken: idToken3,
                    },
                });
                return [4 /*yield*/, aws_amplify_1.Auth.signIn(USERNAME1, REAL_PASSWORD)];
            case 14:
                _f.sent();
                return [4 /*yield*/, aws_amplify_1.Auth.currentUserCredentials()];
            case 15:
                authCredentials = _f.sent();
                GRAPHQL_IAM_AUTH_CLIENT = new aws_appsync_1.default({
                    url: GRAPHQL_ENDPOINT,
                    region: AWS_REGION,
                    disableOffline: true,
                    offlineConfig: {
                        keyPrefix: 'iam',
                    },
                    auth: {
                        type: aws_appsync_1.AUTH_TYPE.AWS_IAM,
                        credentials: aws_amplify_1.Auth.essentialCredentials(authCredentials),
                    },
                });
                GRAPHQL_APIKEY_CLIENT = new aws_appsync_1.default({
                    url: GRAPHQL_ENDPOINT,
                    region: AWS_REGION,
                    disableOffline: true,
                    offlineConfig: {
                        keyPrefix: 'apikey',
                    },
                    auth: {
                        type: aws_appsync_1.AUTH_TYPE.API_KEY,
                        apiKey: apiKey,
                    },
                });
                // Wait for any propagation to avoid random
                // "The security token included in the request is invalid" errors
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return res(); }, PROPAGATION_DELAY); })];
            case 16:
                // Wait for any propagation to avoid random
                // "The security token included in the request is invalid" errors
                _f.sent();
                return [3 /*break*/, 18];
            case 17:
                e_1 = _f.sent();
                console.error(e_1);
                expect(true).toEqual(false);
                return [3 /*break*/, 18];
            case 18: return [2 /*return*/];
        }
    });
}); });
afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_2, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                console.log('Deleting stack ' + STACK_NAME);
                return [4 /*yield*/, cf.deleteStack(STACK_NAME)];
            case 1:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.deleteUserPool(cognitoClient, USER_POOL_ID)];
            case 2:
                _a.sent();
                return [4 /*yield*/, cf.waitForStack(STACK_NAME)];
            case 3:
                _a.sent();
                console.log('Successfully deleted stack ' + STACK_NAME);
                return [3 /*break*/, 5];
            case 4:
                e_2 = _a.sent();
                if (e_2.code === 'ValidationError' && e_2.message === "Stack with id " + STACK_NAME + " does not exist") {
                    // The stack was deleted. This is good.
                    expect(true).toEqual(true);
                    console.log('Successfully deleted stack ' + STACK_NAME);
                }
                else {
                    console.error(e_2);
                    throw e_2;
                }
                return [3 /*break*/, 5];
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, emptyBucket_1.default(BUCKET_NAME)];
            case 6:
                _a.sent();
                return [3 /*break*/, 8];
            case 7:
                e_3 = _a.sent();
                console.error("Failed to empty S3 bucket: " + e_3);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
/**
 * Tests
 */
// tests using cognito
test('Test that only authorized members are allowed to view subscriptions', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var observer, subscription;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                observer = GRAPHQL_CLIENT_2.subscribe({
                    query: graphql_tag_1.default(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      subscription OnCreateStudent {\n        onCreateStudent {\n          id\n          name\n          email\n          ssn\n          owner\n        }\n      }\n    "], ["\n      subscription OnCreateStudent {\n        onCreateStudent {\n          id\n          name\n          email\n          ssn\n          owner\n        }\n      }\n    "]))),
                });
                subscription = observer.subscribe(function (event) {
                    console.log('subscription event: ', event);
                    var student = event.data.onCreateStudent;
                    subscription.unsubscribe();
                    expect(student.name).toEqual('student1');
                    expect(student.email).toEqual('student1@domain.com');
                    expect(student.ssn).toBeNull();
                    done();
                });
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return res(); }, SUBSCRIPTION_DELAY); })];
            case 1:
                _a.sent();
                createStudent(GRAPHQL_CLIENT_1, {
                    name: 'student1',
                    email: 'student1@domain.com',
                    ssn: 'AAA-01-SSSS',
                });
                return [2 /*return*/];
        }
    });
}); });
test('Test that an user not in the group is not allowed to view the subscription', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var observer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                observer = GRAPHQL_CLIENT_3.subscribe({
                    query: graphql_tag_1.default(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      subscription OnCreateStudent {\n        onCreateStudent {\n          id\n          name\n          email\n          ssn\n          owner\n        }\n      }\n    "], ["\n      subscription OnCreateStudent {\n        onCreateStudent {\n          id\n          name\n          email\n          ssn\n          owner\n        }\n      }\n    "]))),
                });
                observer.subscribe({
                    error: function (err) {
                        console.log(err.graphQLErrors[0]);
                        expect(err.graphQLErrors[0].message).toEqual('Not Authorized to access onCreateStudent on type Subscription');
                        expect(err.graphQLErrors[0].errorType).toEqual('Unauthorized');
                        done();
                    },
                });
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return res(); }, SUBSCRIPTION_DELAY); })];
            case 1:
                _a.sent();
                createStudent(GRAPHQL_CLIENT_1, {
                    name: 'student2',
                    email: 'student2@domain.com',
                    ssn: 'BBB-00-SNSN',
                });
                return [2 /*return*/];
        }
    });
}); });
test('Test a subscription on update', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var observer, subscription, student3, student3ID;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                observer = GRAPHQL_CLIENT_2.subscribe({
                    query: graphql_tag_1.default(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n      subscription OnUpdateStudent {\n        onUpdateStudent {\n          id\n          name\n          email\n          ssn\n          owner\n        }\n      }\n    "], ["\n      subscription OnUpdateStudent {\n        onUpdateStudent {\n          id\n          name\n          email\n          ssn\n          owner\n        }\n      }\n    "]))),
                });
                subscription = observer.subscribe(function (event) {
                    var student = event.data.onUpdateStudent;
                    subscription.unsubscribe();
                    expect(student.id).toEqual(student3ID);
                    expect(student.name).toEqual('student3');
                    expect(student.email).toEqual('emailChanged@domain.com');
                    expect(student.ssn).toBeNull();
                    done();
                });
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return res(); }, SUBSCRIPTION_DELAY); })];
            case 1:
                _a.sent();
                return [4 /*yield*/, createStudent(GRAPHQL_CLIENT_1, {
                        name: 'student3',
                        email: 'changeThisEmail@domain.com',
                        ssn: 'CCC-01-SNSN',
                    })];
            case 2:
                student3 = _a.sent();
                expect(student3.data.createStudent).toBeDefined();
                student3ID = student3.data.createStudent.id;
                expect(student3.data.createStudent.name).toEqual('student3');
                expect(student3.data.createStudent.email).toEqual('changeThisEmail@domain.com');
                expect(student3.data.createStudent.ssn).toBeNull();
                updateStudent(GRAPHQL_CLIENT_1, {
                    id: student3ID,
                    email: 'emailChanged@domain.com',
                });
                return [2 /*return*/];
        }
    });
}); });
test('Test a subscription on delete', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var observer, subscription, student4, student4ID;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                observer = GRAPHQL_CLIENT_2.subscribe({
                    query: graphql_tag_1.default(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n      subscription OnDeleteStudent {\n        onDeleteStudent {\n          id\n          name\n          email\n          ssn\n          owner\n        }\n      }\n    "], ["\n      subscription OnDeleteStudent {\n        onDeleteStudent {\n          id\n          name\n          email\n          ssn\n          owner\n        }\n      }\n    "]))),
                });
                subscription = observer.subscribe(function (event) {
                    var student = event.data.onDeleteStudent;
                    subscription.unsubscribe();
                    expect(student.id).toEqual(student4ID);
                    expect(student.name).toEqual('student4');
                    expect(student.email).toEqual('plsDelete@domain.com');
                    expect(student.ssn).toBeNull();
                    done();
                });
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return res(); }, SUBSCRIPTION_DELAY); })];
            case 1:
                _a.sent();
                return [4 /*yield*/, createStudent(GRAPHQL_CLIENT_1, {
                        name: 'student4',
                        email: 'plsDelete@domain.com',
                        ssn: 'DDD-02-SNSN',
                    })];
            case 2:
                student4 = _a.sent();
                expect(student4).toBeDefined();
                student4ID = student4.data.createStudent.id;
                expect(student4.data.createStudent.email).toEqual('plsDelete@domain.com');
                expect(student4.data.createStudent.ssn).toBeNull();
                return [4 /*yield*/, deleteStudent(GRAPHQL_CLIENT_1, { id: student4ID })];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// ownerField Tests
test('Test subscription onCreatePost with ownerField', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var observer, subscription;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                observer = GRAPHQL_CLIENT_1.subscribe({
                    query: graphql_tag_1.default(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n    subscription OnCreatePost {\n        onCreatePost(postOwner: \"", "\") {\n            id\n            title\n            postOwner\n        }\n    }"], ["\n    subscription OnCreatePost {\n        onCreatePost(postOwner: \"", "\") {\n            id\n            title\n            postOwner\n        }\n    }"])), USERNAME1),
                });
                subscription = observer.subscribe(function (event) {
                    var post = event.data.onCreatePost;
                    subscription.unsubscribe();
                    expect(post.title).toEqual('someTitle');
                    expect(post.postOwner).toEqual(USERNAME1);
                    done();
                });
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return res(); }, SUBSCRIPTION_DELAY); })];
            case 1:
                _a.sent();
                createPost(GRAPHQL_CLIENT_1, {
                    title: 'someTitle',
                    postOwner: USERNAME1,
                });
                return [2 /*return*/];
        }
    });
}); });
// iam tests
test('test that subcsription with apiKey', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var observer, subscription;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                observer = GRAPHQL_APIKEY_CLIENT.subscribe({
                    query: graphql_tag_1.default(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n      subscription OnCreateTodo {\n        onCreateTodo {\n          id\n          description\n          name\n        }\n      }\n    "], ["\n      subscription OnCreateTodo {\n        onCreateTodo {\n          id\n          description\n          name\n        }\n      }\n    "]))),
                });
                subscription = observer.subscribe(function (event) {
                    var post = event.data.onCreateTodo;
                    subscription.unsubscribe();
                    expect(post.description).toEqual('someDescription');
                    expect(post.name).toBeNull();
                    done();
                });
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return res(); }, SUBSCRIPTION_DELAY); })];
            case 1:
                _a.sent();
                createTodo(GRAPHQL_IAM_AUTH_CLIENT, {
                    description: 'someDescription',
                    name: 'todo1',
                });
                return [2 /*return*/];
        }
    });
}); });
test('test that subscription with apiKey onUpdate', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var observer, subscription, todo2, todo2ID;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                observer = GRAPHQL_APIKEY_CLIENT.subscribe({
                    query: graphql_tag_1.default(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n      subscription OnUpdateTodo {\n        onUpdateTodo {\n          id\n          description\n          name\n        }\n      }\n    "], ["\n      subscription OnUpdateTodo {\n        onUpdateTodo {\n          id\n          description\n          name\n        }\n      }\n    "]))),
                });
                subscription = observer.subscribe(function (event) {
                    var todo = event.data.onUpdateTodo;
                    subscription.unsubscribe();
                    expect(todo.id).toEqual(todo2ID);
                    expect(todo.description).toEqual('todo2newDesc');
                    expect(todo.name).toBeNull();
                    done();
                });
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return res(); }, SUBSCRIPTION_DELAY); })];
            case 1:
                _a.sent();
                return [4 /*yield*/, createTodo(GRAPHQL_IAM_AUTH_CLIENT, {
                        description: 'updateTodoDesc',
                        name: 'todo2',
                    })];
            case 2:
                todo2 = _a.sent();
                expect(todo2.data.createTodo.id).toBeDefined();
                todo2ID = todo2.data.createTodo.id;
                expect(todo2.data.createTodo.description).toEqual('updateTodoDesc');
                expect(todo2.data.createTodo.name).toBeNull();
                // update the description on todo
                updateTodo(GRAPHQL_IAM_AUTH_CLIENT, {
                    id: todo2ID,
                    description: 'todo2newDesc',
                });
                return [2 /*return*/];
        }
    });
}); });
test('test that subscription with apiKey onDelete', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var observer, subscription, todo3, todo3ID;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                observer = GRAPHQL_APIKEY_CLIENT.subscribe({
                    query: graphql_tag_1.default(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n      subscription OnDeleteTodo {\n        onDeleteTodo {\n          id\n          description\n          name\n        }\n      }\n    "], ["\n      subscription OnDeleteTodo {\n        onDeleteTodo {\n          id\n          description\n          name\n        }\n      }\n    "]))),
                });
                subscription = observer.subscribe(function (event) {
                    var todo = event.data.onDeleteTodo;
                    subscription.unsubscribe();
                    expect(todo.id).toEqual(todo3ID);
                    expect(todo.description).toEqual('deleteTodoDesc');
                    expect(todo.name).toBeNull();
                    done();
                });
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return res(); }, SUBSCRIPTION_DELAY); })];
            case 1:
                _a.sent();
                return [4 /*yield*/, createTodo(GRAPHQL_IAM_AUTH_CLIENT, {
                        description: 'deleteTodoDesc',
                        name: 'todo3',
                    })];
            case 2:
                todo3 = _a.sent();
                expect(todo3.data.createTodo.id).toBeDefined();
                todo3ID = todo3.data.createTodo.id;
                expect(todo3.data.createTodo.description).toEqual('deleteTodoDesc');
                expect(todo3.data.createTodo.name).toBeNull();
                // delete todo3
                deleteTodo(GRAPHQL_IAM_AUTH_CLIENT, {
                    id: todo3ID,
                });
                return [2 /*return*/];
        }
    });
}); });
// mutations
function createStudent(client, input) {
    return __awaiter(this, void 0, void 0, function () {
        var request;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = graphql_tag_1.default(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\n    mutation CreateStudent($input: CreateStudentInput!) {\n      createStudent(input: $input) {\n        id\n        name\n        email\n        ssn\n        owner\n      }\n    }\n  "], ["\n    mutation CreateStudent($input: CreateStudentInput!) {\n      createStudent(input: $input) {\n        id\n        name\n        email\n        ssn\n        owner\n      }\n    }\n  "])));
                    return [4 /*yield*/, client.mutate({ mutation: request, variables: { input: input } })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function updateStudent(client, input) {
    return __awaiter(this, void 0, void 0, function () {
        var request;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = graphql_tag_1.default(templateObject_10 || (templateObject_10 = __makeTemplateObject(["\n    mutation UpdateStudent($input: UpdateStudentInput!) {\n      updateStudent(input: $input) {\n        id\n        name\n        email\n        ssn\n        owner\n      }\n    }\n  "], ["\n    mutation UpdateStudent($input: UpdateStudentInput!) {\n      updateStudent(input: $input) {\n        id\n        name\n        email\n        ssn\n        owner\n      }\n    }\n  "])));
                    return [4 /*yield*/, client.mutate({ mutation: request, variables: { input: input } })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function deleteStudent(client, input) {
    return __awaiter(this, void 0, void 0, function () {
        var request;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = graphql_tag_1.default(templateObject_11 || (templateObject_11 = __makeTemplateObject(["\n    mutation DeleteStudent($input: DeleteStudentInput!) {\n      deleteStudent(input: $input) {\n        id\n        name\n        email\n        ssn\n        owner\n      }\n    }\n  "], ["\n    mutation DeleteStudent($input: DeleteStudentInput!) {\n      deleteStudent(input: $input) {\n        id\n        name\n        email\n        ssn\n        owner\n      }\n    }\n  "])));
                    return [4 /*yield*/, client.mutate({ mutation: request, variables: { input: input } })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function createPost(client, input) {
    return __awaiter(this, void 0, void 0, function () {
        var request;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = graphql_tag_1.default(templateObject_12 || (templateObject_12 = __makeTemplateObject(["\n    mutation CreatePost($input: CreatePostInput!) {\n      createPost(input: $input) {\n        id\n        title\n        postOwner\n      }\n    }\n  "], ["\n    mutation CreatePost($input: CreatePostInput!) {\n      createPost(input: $input) {\n        id\n        title\n        postOwner\n      }\n    }\n  "])));
                    return [4 /*yield*/, client.mutate({ mutation: request, variables: { input: input } })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function createTodo(client, input) {
    return __awaiter(this, void 0, void 0, function () {
        var request;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = graphql_tag_1.default(templateObject_13 || (templateObject_13 = __makeTemplateObject(["\n    mutation CreateTodo($input: CreateTodoInput!) {\n      createTodo(input: $input) {\n        id\n        description\n        name\n      }\n    }\n  "], ["\n    mutation CreateTodo($input: CreateTodoInput!) {\n      createTodo(input: $input) {\n        id\n        description\n        name\n      }\n    }\n  "])));
                    return [4 /*yield*/, client.mutate({ mutation: request, variables: { input: input } })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function updateTodo(client, input) {
    return __awaiter(this, void 0, void 0, function () {
        var request;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = graphql_tag_1.default(templateObject_14 || (templateObject_14 = __makeTemplateObject(["\n    mutation UpdateTodo($input: UpdateTodoInput!) {\n      updateTodo(input: $input) {\n        id\n        description\n        name\n      }\n    }\n  "], ["\n    mutation UpdateTodo($input: UpdateTodoInput!) {\n      updateTodo(input: $input) {\n        id\n        description\n        name\n      }\n    }\n  "])));
                    return [4 /*yield*/, client.mutate({ mutation: request, variables: { input: input } })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function deleteTodo(client, input) {
    return __awaiter(this, void 0, void 0, function () {
        var request;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = graphql_tag_1.default(templateObject_15 || (templateObject_15 = __makeTemplateObject(["\n    mutation DeleteTodo($input: DeleteTodoInput!) {\n      deleteTodo(input: $input) {\n        id\n        description\n        name\n      }\n    }\n  "], ["\n    mutation DeleteTodo($input: DeleteTodoInput!) {\n      deleteTodo(input: $input) {\n        id\n        description\n        name\n      }\n    }\n  "])));
                    return [4 /*yield*/, client.mutate({ mutation: request, variables: { input: input } })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15;
//# sourceMappingURL=SubscriptionsWithAuthTest.e2e.test.js.map