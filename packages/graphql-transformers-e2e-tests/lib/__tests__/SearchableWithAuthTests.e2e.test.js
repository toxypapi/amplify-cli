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
var graphql_connection_transformer_1 = require("graphql-connection-transformer");
var graphql_elasticsearch_transformer_1 = require("graphql-elasticsearch-transformer");
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
var cognitoUtils_1 = require("../cognitoUtils");
require("isomorphic-fetch");
// To overcome of the way of how AmplifyJS picks up currentUserCredentials
var anyAWS = core_1.AWS;
if (anyAWS && anyAWS.config && anyAWS.config.credentials) {
    delete anyAWS.config.credentials;
}
// to deal with bug in cognito-identity-js
global.fetch = require('node-fetch');
jest.setTimeout(9700000);
var AWS_REGION = 'us-west-2';
var cf = new CloudFormationClient_1.CloudFormationClient(AWS_REGION);
var BUILD_TIMESTAMP = moment().format('YYYYMMDDHHmmss');
var STACK_NAME = "SearchableAuthTests-" + BUILD_TIMESTAMP;
var BUCKET_NAME = "searchable-auth-tests-bucket-" + BUILD_TIMESTAMP;
var LOCAL_BUILD_ROOT = '/tmp/searchable_auth_tests/';
var DEPLOYMENT_ROOT_KEY = 'deployments';
var AUTH_ROLE_NAME = STACK_NAME + "-authRole";
var UNAUTH_ROLE_NAME = STACK_NAME + "-unauthRole";
var IDENTITY_POOL_NAME = "SearchableAuthModelAuthTransformerTest_" + BUILD_TIMESTAMP + "_identity_pool";
var USER_POOL_CLIENTWEB_NAME = "search_auth_" + BUILD_TIMESTAMP + "_clientweb";
var USER_POOL_CLIENT_NAME = "search_auth_" + BUILD_TIMESTAMP + "_client";
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
var WRITER_GROUP_NAME = 'writer';
var ADMIN_GROUP_NAME = 'admin';
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
beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var validSchema, transformer, userPoolResponse, userPoolClientResponse, userPoolClientId, out, params, finishedStack, getApiEndpoint, getApiKey, apiKey, getIdentityPoolId, identityPoolId, authResAfterGroup, idToken, authRes2AfterGroup, idToken2, authRes3, idToken3, authCredentials, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Create a stack for the post model with auth enabled.
                if (!fs.existsSync(LOCAL_BUILD_ROOT)) {
                    fs.mkdirSync(LOCAL_BUILD_ROOT);
                }
                return [4 /*yield*/, createBucket(BUCKET_NAME)];
            case 1:
                _a.sent();
                validSchema = "\n    # Owners and Users in writer group\n    # can execute crud operations their owned records.\n    type Comment @model\n    @searchable\n    @auth(rules: [\n        { allow: owner }\n        { allow: groups, groups: [\"writer\"]}\n    ]) {\n        id: ID!\n        content: String\n    }\n    # only users in the admin group are authorized to view entries in DynamicContent\n    type Todo @model\n        @searchable\n        @auth(rules: [\n            { allow: groups, groupsField: \"groups\"}\n        ]) {\n            id: ID!\n            groups: String\n            content: String\n        }\n    # users with apikey perform crud operations on Post except for secret\n    # only users with auth role (iam) can view the secret\n    type Post @model\n        @searchable\n        @auth(rules: [\n            { allow: public, provider: apiKey }\n            { allow: private, provider: iam }\n        ]) {\n        id: ID!\n        content: String\n        secret: String @auth(rules: [{ allow: private, provider: iam }])\n    }";
                transformer = new graphql_transformer_core_1.GraphQLTransform({
                    transformers: [
                        new graphql_dynamodb_transformer_1.DynamoDBModelTransformer(),
                        new graphql_connection_transformer_1.ModelConnectionTransformer(),
                        new graphql_elasticsearch_transformer_1.SearchableModelTransformer(),
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
                userPoolResponse = _a.sent();
                USER_POOL_ID = userPoolResponse.UserPool.Id;
                return [4 /*yield*/, cognitoUtils_1.createUserPoolClient(cognitoClient, USER_POOL_ID, "UserPool" + STACK_NAME)];
            case 3:
                userPoolClientResponse = _a.sent();
                userPoolClientId = userPoolClientResponse.UserPoolClient.ClientId;
                _a.label = 4;
            case 4:
                _a.trys.push([4, 20, , 21]);
                out = transformer.transform(validSchema);
                out = cognitoUtils_1.addIAMRolesToCFNStack(out, {
                    AUTH_ROLE_NAME: AUTH_ROLE_NAME,
                    UNAUTH_ROLE_NAME: UNAUTH_ROLE_NAME,
                    IDENTITY_POOL_NAME: IDENTITY_POOL_NAME,
                    USER_POOL_CLIENTWEB_NAME: USER_POOL_CLIENTWEB_NAME,
                    USER_POOL_CLIENT_NAME: USER_POOL_CLIENT_NAME,
                    USER_POOL_ID: USER_POOL_ID,
                });
                params = {
                    CreateAPIKey: '1',
                    AuthCognitoUserPoolId: USER_POOL_ID,
                };
                return [4 /*yield*/, deployNestedStacks_1.deploy(customS3Client, cf, STACK_NAME, out, params, LOCAL_BUILD_ROOT, BUCKET_NAME, DEPLOYMENT_ROOT_KEY, BUILD_TIMESTAMP)];
            case 5:
                finishedStack = _a.sent();
                // Wait for any propagation to avoid random errors
                return [4 /*yield*/, cf.wait(120, function () { return Promise.resolve(); })];
            case 6:
                // Wait for any propagation to avoid random errors
                _a.sent();
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
            case 7:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME2, TMP_PASSWORD, REAL_PASSWORD)];
            case 8:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME3, TMP_PASSWORD, REAL_PASSWORD)];
            case 9:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.createGroup(USER_POOL_ID, WRITER_GROUP_NAME)];
            case 10:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.createGroup(USER_POOL_ID, ADMIN_GROUP_NAME)];
            case 11:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(WRITER_GROUP_NAME, USERNAME2, USER_POOL_ID)];
            case 12:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(ADMIN_GROUP_NAME, USERNAME2, USER_POOL_ID)];
            case 13:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME1, TMP_PASSWORD, REAL_PASSWORD)];
            case 14:
                authResAfterGroup = _a.sent();
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
            case 15:
                authRes2AfterGroup = _a.sent();
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
            case 16:
                authRes3 = _a.sent();
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
            case 17:
                _a.sent();
                return [4 /*yield*/, aws_amplify_1.Auth.currentUserCredentials()];
            case 18:
                authCredentials = _a.sent();
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
                // create records for post, comment, and todo
                return [4 /*yield*/, createRecords()];
            case 19:
                // create records for post, comment, and todo
                _a.sent();
                return [3 /*break*/, 21];
            case 20:
                e_1 = _a.sent();
                console.error(e_1);
                expect(true).toEqual(false);
                return [3 /*break*/, 21];
            case 21: return [2 /*return*/];
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
// cognito owner check
test('test Comments as owner', function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownerResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query({
                    query: graphql_tag_1.default(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      query SearchComments {\n        searchComments {\n          items {\n            id\n            content\n            owner\n          }\n          nextToken\n        }\n      }\n    "], ["\n      query SearchComments {\n        searchComments {\n          items {\n            id\n            content\n            owner\n          }\n          nextToken\n        }\n      }\n    "]))),
                })];
            case 1:
                ownerResponse = _a.sent();
                expect(ownerResponse.data.searchComments).toBeDefined();
                expect(ownerResponse.data.searchComments.items.length).toEqual(1);
                expect(ownerResponse.data.searchComments.items[0].content).toEqual('ownerContent');
                return [2 /*return*/];
        }
    });
}); });
// cognito static group check
test('test Comments as user in writer group', function () { return __awaiter(void 0, void 0, void 0, function () {
    var writerResponse, writerItems;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_2.query({
                    query: graphql_tag_1.default(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      query SearchComments {\n        searchComments {\n          items {\n            id\n            content\n            owner\n          }\n          nextToken\n        }\n      }\n    "], ["\n      query SearchComments {\n        searchComments {\n          items {\n            id\n            content\n            owner\n          }\n          nextToken\n        }\n      }\n    "]))),
                })];
            case 1:
                writerResponse = _a.sent();
                expect(writerResponse.data.searchComments).toBeDefined();
                expect(writerResponse.data.searchComments.items.length).toEqual(4);
                writerItems = writerResponse.data.searchComments.items;
                writerItems.forEach(function (writerItem) {
                    expect(['ownerContent', 'content1', 'content2', 'content3']).toContain(writerItem.content);
                    if (writerItem.content === 'ownerContent') {
                        expect(writerItem.owner).toEqual(USERNAME1);
                    }
                    else {
                        expect(writerItem.owner).toEqual(USERNAME2);
                    }
                });
                return [2 /*return*/];
        }
    });
}); });
// cognito test as unauthorized user
test('test Comments as user that is not an owner nor is in writer group', function () { return __awaiter(void 0, void 0, void 0, function () {
    var user3Response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_3.query({
                    query: graphql_tag_1.default(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n      query SearchComments {\n        searchComments {\n          items {\n            id\n            content\n            owner\n          }\n          nextToken\n        }\n      }\n    "], ["\n      query SearchComments {\n        searchComments {\n          items {\n            id\n            content\n            owner\n          }\n          nextToken\n        }\n      }\n    "]))),
                })];
            case 1:
                user3Response = _a.sent();
                expect(user3Response.data.searchComments).toBeDefined();
                expect(user3Response.data.searchComments.items.length).toEqual(0);
                expect(user3Response.data.searchComments.nextToken).toBeNull();
                return [2 /*return*/];
        }
    });
}); });
// cognito dynamic group check
test('test Todo as user in the dynamic group admin', function () { return __awaiter(void 0, void 0, void 0, function () {
    var adminResponse, adminItems;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_2.query({
                    query: graphql_tag_1.default(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n      query SearchTodos {\n        searchTodos {\n          items {\n            id\n            groups\n            content\n          }\n          nextToken\n        }\n      }\n    "], ["\n      query SearchTodos {\n        searchTodos {\n          items {\n            id\n            groups\n            content\n          }\n          nextToken\n        }\n      }\n    "]))),
                })];
            case 1:
                adminResponse = _a.sent();
                expect(adminResponse.data.searchTodos).toBeDefined();
                expect(adminResponse.data.searchTodos.items.length).toEqual(3);
                adminItems = adminResponse.data.searchTodos.items;
                adminItems.forEach(function (adminItem) {
                    expect(['adminContent1', 'adminContent2', 'adminContent3']).toContain(adminItem.content);
                    expect(adminItem.groups).toEqual('admin');
                });
                return [2 /*return*/];
        }
    });
}); });
// iam test
test('test Post as authorized user', function () { return __awaiter(void 0, void 0, void 0, function () {
    var authUser, authUserItems;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_IAM_AUTH_CLIENT.query({
                    query: graphql_tag_1.default(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n      query SearchPosts {\n        searchPosts {\n          items {\n            id\n            content\n            secret\n          }\n          nextToken\n        }\n      }\n    "], ["\n      query SearchPosts {\n        searchPosts {\n          items {\n            id\n            content\n            secret\n          }\n          nextToken\n        }\n      }\n    "]))),
                })];
            case 1:
                authUser = _a.sent();
                expect(authUser.data.searchPosts).toBeDefined();
                expect(authUser.data.searchPosts.items.length).toEqual(4);
                authUserItems = authUser.data.searchPosts.items;
                authUserItems.forEach(function (authUserItem) {
                    expect(['publicPost', 'post1', 'post2', 'post3']).toContain(authUserItem.content);
                    expect(['notViewableToPublic', 'post1secret', 'post2secret', 'post3secret']).toContain(authUserItem.secret);
                });
                return [2 /*return*/];
        }
    });
}); });
// test apikey 2nd scenario
test('test searchPosts with apikey and secret removed', function () { return __awaiter(void 0, void 0, void 0, function () {
    var apiKeyResponse, apiKeyResponseItems;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_APIKEY_CLIENT.query({
                    query: graphql_tag_1.default(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n      query SearchPosts {\n        searchPosts {\n          items {\n            id\n            content\n          }\n          nextToken\n        }\n      }\n    "], ["\n      query SearchPosts {\n        searchPosts {\n          items {\n            id\n            content\n          }\n          nextToken\n        }\n      }\n    "]))),
                })];
            case 1:
                apiKeyResponse = _a.sent();
                expect(apiKeyResponse.data.searchPosts).toBeDefined();
                apiKeyResponseItems = apiKeyResponse.data.searchPosts.items;
                apiKeyResponseItems.forEach(function (item) {
                    expect(item.id).toBeDefined();
                    if (item.content) {
                        expect(['publicPost', 'post1', 'post2', 'post3']).toContain(item.content);
                    }
                });
                return [2 /*return*/];
        }
    });
}); });
// test iam/apiKey schema with unauth user
test('test post as an cognito user that is not allowed in this schema', function () { return __awaiter(void 0, void 0, void 0, function () {
    var err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, GRAPHQL_CLIENT_3.query({
                        query: graphql_tag_1.default(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n        query SearchPosts {\n          searchPosts {\n            items {\n              id\n              content\n              secret\n            }\n            nextToken\n          }\n        }\n      "], ["\n        query SearchPosts {\n          searchPosts {\n            items {\n              id\n              content\n              secret\n            }\n            nextToken\n          }\n        }\n      "]))),
                    })];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                console.log(err_1);
                expect(err_1.graphQLErrors[0].errorType).toEqual('Unauthorized');
                expect(err_1.graphQLErrors[0].message).toEqual('Not Authorized to access searchPosts on type Query');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// mutations
function createComment(client, input) {
    return __awaiter(this, void 0, void 0, function () {
        var create;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    create = graphql_tag_1.default(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n    mutation CreateComment($input: CreateCommentInput!) {\n      createComment(input: $input) {\n        id\n        content\n        owner\n      }\n    }\n  "], ["\n    mutation CreateComment($input: CreateCommentInput!) {\n      createComment(input: $input) {\n        id\n        content\n        owner\n      }\n    }\n  "])));
                    return [4 /*yield*/, client.mutate({ mutation: create, variables: { input: input } })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function createTodo(client, input) {
    return __awaiter(this, void 0, void 0, function () {
        var create;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    create = graphql_tag_1.default(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\n    mutation CreateTodo($input: CreateTodoInput!) {\n      createTodo(input: $input) {\n        id\n        groups\n        content\n      }\n    }\n  "], ["\n    mutation CreateTodo($input: CreateTodoInput!) {\n      createTodo(input: $input) {\n        id\n        groups\n        content\n      }\n    }\n  "])));
                    return [4 /*yield*/, client.mutate({ mutation: create, variables: { input: input } })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function createPost(client, input) {
    return __awaiter(this, void 0, void 0, function () {
        var create;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    create = graphql_tag_1.default(templateObject_10 || (templateObject_10 = __makeTemplateObject(["\n    mutation CreatePost($input: CreatePostInput!) {\n      createPost(input: $input) {\n        id\n        content\n      }\n    }\n  "], ["\n    mutation CreatePost($input: CreatePostInput!) {\n      createPost(input: $input) {\n        id\n        content\n      }\n    }\n  "])));
                    return [4 /*yield*/, client.mutate({ mutation: create, variables: { input: input } })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function createRecords() {
    return __awaiter(this, void 0, void 0, function () {
        var ownerCreate, createCommentList, createTodoList, apiKeyResponse, createPostList, err_2;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('create records');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, createComment(GRAPHQL_CLIENT_1, {
                            content: 'ownerContent',
                        })];
                case 2:
                    ownerCreate = _a.sent();
                    console.log(ownerCreate);
                    createCommentList = [{ content: 'content1' }, { content: 'content2' }, { content: 'content3' }];
                    createCommentList.forEach(function (commentInput) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, createComment(GRAPHQL_CLIENT_2, commentInput)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    createTodoList = [
                        { groups: 'admin', content: 'adminContent1' },
                        { groups: 'admin', content: 'adminContent2' },
                        { groups: 'admin', content: 'adminContent3' },
                    ];
                    createTodoList.forEach(function (todoInput) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, createTodo(GRAPHQL_CLIENT_2, todoInput)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, createPost(GRAPHQL_APIKEY_CLIENT, {
                            content: 'publicPost',
                            secret: 'notViewableToPublic',
                        })];
                case 3:
                    apiKeyResponse = _a.sent();
                    console.log(apiKeyResponse);
                    createPostList = [
                        { content: 'post1', secret: 'post1secret' },
                        { content: 'post2', secret: 'post2secret' },
                        { content: 'post3', secret: 'post3secret' },
                    ];
                    createPostList.forEach(function (postInput) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, createPost(GRAPHQL_IAM_AUTH_CLIENT, postInput)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    // Waiting for the ES Cluster + Streaming Lambda infra to be setup
                    console.log('Waiting for the ES Cluster + Streaming Lambda infra to be setup');
                    return [4 /*yield*/, cf.wait(120, function () { return Promise.resolve(); })];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    err_2 = _a.sent();
                    console.log(err_2);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10;
//# sourceMappingURL=SearchableWithAuthTests.e2e.test.js.map