"use strict";
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
var graphql_connection_transformer_1 = require("graphql-connection-transformer");
var graphql_key_transformer_1 = require("graphql-key-transformer");
var graphql_auth_transformer_1 = require("graphql-auth-transformer");
var CloudFormationClient_1 = require("../CloudFormationClient");
var GraphQLClient_1 = require("../GraphQLClient");
var deployNestedStacks_1 = require("../deployNestedStacks");
var emptyBucket_1 = require("../emptyBucket");
var S3Client_1 = require("../S3Client");
var S3 = require("aws-sdk/clients/s3");
var moment = require("moment");
jest.setTimeout(2000000);
var cf = new CloudFormationClient_1.CloudFormationClient('us-west-2');
var customS3Client = new S3Client_1.S3Client('us-west-2');
var awsS3Client = new S3({ region: 'us-west-2' });
var BUILD_TIMESTAMP = moment().format('YYYYMMDDHHmmss');
var STACK_NAME = "ModelConnectionKeyTransformerTest-" + BUILD_TIMESTAMP;
var BUCKET_NAME = "appsync-connection-key-transformer-test-" + BUILD_TIMESTAMP;
var LOCAL_FS_BUILD_DIR = '/tmp/model_connection_key_transform_tests/';
var S3_ROOT_DIR_KEY = 'deployments';
var GRAPHQL_CLIENT = undefined;
function outputValueSelector(key) {
    return function (outputs) {
        var output = outputs.find(function (o) { return o.OutputKey === key; });
        return output ? output.OutputValue : null;
    };
}
beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var validSchema, transformer, out, e_1, finishedStack, getApiEndpoint, getApiKey, endpoint, apiKey, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                validSchema = "\n    type AProject\n    @model(subscriptions: null)\n    @key(fields: [\"projectId\"])\n    {\n        projectId: String!\n        name: String\n        team: ATeam @connection\n    }\n\n    type ATeam\n    @model(subscriptions: null)\n    @key(fields: [\"teamId\"])\n    {\n        teamId: String!\n        name: String\n    }\n\n    type BProject\n    @model(subscriptions: null)\n    @key(fields: [\"projectId\"])\n    {\n        projectId: String!\n        name: String\n        teams: [BTeam] @connection\n    }\n\n    type BTeam\n    @model(subscriptions: null)\n    @key(fields: [\"teamId\"])\n    {\n        teamId: String!\n        name: String\n    }\n\n    type CProject\n    @model(subscriptions: null)\n    @key(fields: [\"projectId\"])\n    {\n        projectId: ID!\n        name: String\n        team: CTeam @connection(name: \"CProjectCTeam\")\n    }\n\n    type CTeam\n    @model(subscriptions: null)\n    @key(fields: [\"teamId\"])\n    {\n        teamId: ID!\n        name: String\n        project: CProject @connection(name: \"CProjectCTeam\")\n    }\n\n    type DProject\n    @model(subscriptions: null)\n    @key(fields: [\"projectId\"])\n    {\n        projectId: ID!\n        name: String\n        teams: [DTeam] @connection(name: \"DProjectDTeam\")\n    }\n\n    type DTeam\n    @model(subscriptions: null)\n    @key(fields: [\"teamId\"])\n    {\n        teamId: ID!\n        name: String\n        project: DProject @connection(name: \"DProjectDTeam\")\n    }\n\n    type Model1 @model(subscriptions: null) @key(fields: [\"id\", \"sort\" ])\n    {\n        id: ID!\n        sort: Int!\n        name: String!\n    }\n    type Model2 @model(subscriptions: null)\n    {\n        id: ID!\n        connection: Model1 @connection(sortField: \"modelOneSort\")\n        modelOneSort: Int!\n    }\n    ";
                transformer = new graphql_transformer_core_1.GraphQLTransform({
                    transformers: [
                        new graphql_dynamodb_transformer_1.DynamoDBModelTransformer(),
                        new graphql_connection_transformer_1.ModelConnectionTransformer(),
                        new graphql_key_transformer_1.KeyTransformer(),
                        new graphql_auth_transformer_1.ModelAuthTransformer({
                            authConfig: {
                                defaultAuthentication: {
                                    authenticationType: 'API_KEY',
                                },
                                additionalAuthenticationProviders: [],
                            },
                        }),
                    ],
                });
                out = transformer.transform(validSchema);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, awsS3Client
                        .createBucket({
                        Bucket: BUCKET_NAME,
                    })
                        .promise()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.error("Failed to create S3 bucket: " + e_1);
                return [3 /*break*/, 4];
            case 4:
                _a.trys.push([4, 7, , 8]);
                console.log('Creating Stack ' + STACK_NAME);
                return [4 /*yield*/, deployNestedStacks_1.deploy(customS3Client, cf, STACK_NAME, out, { CreateAPIKey: '1' }, LOCAL_FS_BUILD_DIR, BUCKET_NAME, S3_ROOT_DIR_KEY, BUILD_TIMESTAMP)];
            case 5:
                finishedStack = _a.sent();
                // Arbitrary wait to make sure everything is ready.
                return [4 /*yield*/, cf.wait(5, function () { return Promise.resolve(); })];
            case 6:
                // Arbitrary wait to make sure everything is ready.
                _a.sent();
                console.log('Successfully created stack ' + STACK_NAME);
                expect(finishedStack).toBeDefined();
                console.log(JSON.stringify(finishedStack, null, 4));
                getApiEndpoint = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIEndpointOutput);
                getApiKey = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIApiKeyOutput);
                endpoint = getApiEndpoint(finishedStack.Outputs);
                apiKey = getApiKey(finishedStack.Outputs);
                expect(apiKey).toBeDefined();
                expect(endpoint).toBeDefined();
                GRAPHQL_CLIENT = new GraphQLClient_1.GraphQLClient(endpoint, { 'x-api-key': apiKey });
                return [3 /*break*/, 8];
            case 7:
                e_2 = _a.sent();
                console.error(e_2);
                expect(true).toEqual(false);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_3, e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                console.log('Deleting stack ' + STACK_NAME);
                return [4 /*yield*/, cf.deleteStack(STACK_NAME)];
            case 1:
                _a.sent();
                return [4 /*yield*/, cf.waitForStack(STACK_NAME)];
            case 2:
                _a.sent();
                console.log('Successfully deleted stack ' + STACK_NAME);
                return [3 /*break*/, 4];
            case 3:
                e_3 = _a.sent();
                if (e_3.code === 'ValidationError' && e_3.message === "Stack with id " + STACK_NAME + " does not exist") {
                    // The stack was deleted. This is good.
                    expect(true).toEqual(true);
                    console.log('Successfully deleted stack ' + STACK_NAME);
                }
                else {
                    console.error(e_3);
                    expect(true).toEqual(false);
                }
                return [3 /*break*/, 4];
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, emptyBucket_1.default(BUCKET_NAME)];
            case 5:
                _a.sent();
                return [3 /*break*/, 7];
            case 6:
                e_4 = _a.sent();
                console.error("Failed to empty S3 bucket: " + e_4);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
/**
 * Test queries below
 */
test('Unnamed connection 1 way navigation, with primary @key directive 1:1', function () { return __awaiter(void 0, void 0, void 0, function () {
    var queryResponse, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    mutation CreateATeam {\n        createATeam(input: {teamId: \"T1\", name: \"Team 1\"}) {\n            teamId\n            name\n        }\n    }\n    ", {})];
            case 1:
                _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    mutation CreateAProject {\n        createAProject(input: {projectId: \"P1\", name: \"P1\", aProjectTeamId: \"T1\"}) {\n            projectId\n            name\n        }\n    }\n    ", {})];
            case 2:
                _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    query ListAProjects {\n        listAProjects {\n            items {\n                projectId\n                name\n                team {\n                    teamId\n                    name\n                }\n            }\n        }\n    }\n    ", {})];
            case 3:
                queryResponse = _a.sent();
                expect(queryResponse.data.listAProjects).toBeDefined();
                items = queryResponse.data.listAProjects.items;
                expect(items.length).toEqual(1);
                expect(items[0].projectId).toEqual('P1');
                expect(items[0].team).toBeDefined();
                expect(items[0].team.teamId).toEqual('T1');
                return [2 /*return*/];
        }
    });
}); });
test('Unnamed connection 1 way navigation, with primary @key directive 1:M', function () { return __awaiter(void 0, void 0, void 0, function () {
    var queryResponse, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    mutation CreateBProject {\n        createBProject(input: {projectId: \"P1\", name: \"P1\"}) {\n            projectId\n            name\n        }\n    }\n    ", {})];
            case 1:
                _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    mutation CreateBTeam {\n        createBTeam(input: {teamId: \"T1\", name: \"Team 1\", bProjectTeamsId: \"P1\"}) {\n            teamId\n            name\n        }\n    }\n    ", {})];
            case 2:
                _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    mutation CreateBTeam {\n        createBTeam(input: {teamId: \"T2\", name: \"Team 2\", bProjectTeamsId: \"P1\"}) {\n            teamId\n            name\n        }\n    }\n    ", {})];
            case 3:
                _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    query ListBProjects {\n        listBProjects {\n            items {\n                projectId\n                name\n                teams {\n                    items {\n                        teamId\n                        name\n                    }\n                }\n            }\n        }\n    }\n    ", {})];
            case 4:
                queryResponse = _a.sent();
                expect(queryResponse.data.listBProjects).toBeDefined();
                items = queryResponse.data.listBProjects.items;
                expect(items.length).toEqual(1);
                expect(items[0].projectId).toEqual('P1');
                expect(items[0].teams).toBeDefined();
                expect(items[0].teams.items).toBeDefined();
                expect(items[0].teams.items.length).toEqual(2);
                expect(items[0].teams.items[0].teamId).toEqual('T1');
                expect(items[0].teams.items[1].teamId).toEqual('T2');
                return [2 /*return*/];
        }
    });
}); });
test('Named connection 2 way navigation, with with custom @key fields 1:1', function () { return __awaiter(void 0, void 0, void 0, function () {
    var queryResponse, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    mutation CreateCTeam {\n        createCTeam(input: {teamId: \"T1\", name: \"Team 1\", cTeamProjectId: \"P1\"}) {\n            teamId\n            name\n        }\n    }\n    ", {})];
            case 1:
                _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    mutation CreateCProject {\n        createCProject(input: {projectId: \"P1\", name: \"P1\", cProjectTeamId: \"T1\"}) {\n            projectId\n            name\n        }\n    }\n    ", {})];
            case 2:
                _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    query ListCProjects {\n        listCProjects {\n            items {\n                projectId\n                name\n                team {\n                    teamId\n                    name\n                    project {\n                        projectId\n                        name\n                    }\n                }\n            }\n        }\n    }\n    ", {})];
            case 3:
                queryResponse = _a.sent();
                expect(queryResponse.data.listCProjects).toBeDefined();
                items = queryResponse.data.listCProjects.items;
                expect(items.length).toEqual(1);
                expect(items[0].projectId).toEqual('P1');
                expect(items[0].team).toBeDefined();
                expect(items[0].team.teamId).toEqual('T1');
                expect(items[0].team.project).toBeDefined();
                expect(items[0].team.project.projectId).toEqual('P1');
                return [2 /*return*/];
        }
    });
}); });
test('Named connection 2 way navigation, with with custom @key fields 1:M', function () { return __awaiter(void 0, void 0, void 0, function () {
    var queryResponse, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    mutation CreateDProject {\n        createDProject(input: {projectId: \"P1\", name: \"P1\"}) {\n            projectId\n            name\n        }\n    }\n    ", {})];
            case 1:
                _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    mutation CreateDTeam {\n        createDTeam(input: {teamId: \"T1\", name: \"Team 1\", dTeamProjectId: \"P1\"}) {\n            teamId\n            name\n        }\n    }\n    ", {})];
            case 2:
                _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    mutation CreateDTeam {\n        createDTeam(input: {teamId: \"T2\", name: \"Team 2\", dTeamProjectId: \"P1\"}) {\n            teamId\n            name\n        }\n    }\n    ", {})];
            case 3:
                _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    query ListDProjects {\n        listDProjects {\n            items {\n                projectId\n                name\n                teams {\n                    items {\n                        teamId\n                        name\n                        project {\n                            projectId\n                            name\n                        }\n                    }\n                }\n            }\n        }\n    }\n    ", {})];
            case 4:
                queryResponse = _a.sent();
                expect(queryResponse.data.listDProjects).toBeDefined();
                items = queryResponse.data.listDProjects.items;
                expect(items.length).toEqual(1);
                expect(items[0].projectId).toEqual('P1');
                expect(items[0].teams).toBeDefined();
                expect(items[0].teams.items).toBeDefined();
                expect(items[0].teams.items.length).toEqual(2);
                expect(items[0].teams.items[0].teamId).toEqual('T1');
                expect(items[0].teams.items[0].project).toBeDefined();
                expect(items[0].teams.items[0].project.projectId).toEqual('P1');
                expect(items[0].teams.items[1].teamId).toEqual('T2');
                expect(items[0].teams.items[1].project).toBeDefined();
                expect(items[0].teams.items[1].project.projectId).toEqual('P1');
                return [2 /*return*/];
        }
    });
}); });
test('Unnamed connection with sortField parameter only #2100', function () { return __awaiter(void 0, void 0, void 0, function () {
    var queryResponse, item;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    mutation M11 {\n        createModel1(input: {id: \"M11\", sort: 10, name: \"M1-1\"}) {\n            id\n            name\n            sort\n        }\n    }\n    ", {})];
            case 1:
                _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    mutation M12 {\n        createModel1(input: {id: \"M12\", sort: 10, name: \"M1-2\"}) {\n            id\n            name\n            sort\n        }\n    }\n    ", {})];
            case 2:
                _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    mutation M21 {\n        createModel2(input: {id: \"M21\", modelOneSort: 10, model2ConnectionId: \"M11\"}) {\n            id\n            modelOneSort\n        }\n    }\n    ", {})];
            case 3:
                _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    query Query {\n        getModel2(id: \"M21\") {\n            id\n            connection {\n                id\n                sort\n                name\n            }\n        }\n    }\n    ", {})];
            case 4:
                queryResponse = _a.sent();
                expect(queryResponse.data.getModel2).toBeDefined();
                item = queryResponse.data.getModel2;
                expect(item.id).toEqual('M21');
                expect(item.connection).toBeDefined();
                expect(item.connection.id).toEqual('M11');
                expect(item.connection.sort).toEqual(10);
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=ModelConnectionWithKeyTransformer.e2e.test.js.map