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
var graphql_auth_transformer_1 = require("graphql-auth-transformer");
var graphql_predictions_transformer_1 = require("graphql-predictions-transformer");
var CloudFormationClient_1 = require("../CloudFormationClient");
var GraphQLClient_1 = require("../GraphQLClient");
var moment = require("moment");
var emptyBucket_1 = require("../emptyBucket");
var deployNestedStacks_1 = require("../deployNestedStacks");
var S3Client_1 = require("../S3Client");
var S3 = require("aws-sdk/clients/s3");
// tslint:disable: no-magic-numbers
jest.setTimeout(2000000);
var AWS_REGION = 'us-east-2';
var cf = new CloudFormationClient_1.CloudFormationClient(AWS_REGION);
var customS3Client = new S3Client_1.S3Client(AWS_REGION);
var awsS3Client = new S3({ region: AWS_REGION });
var BUILD_TIMESTAMP = moment().format('YYYYMMDDHHmmss');
var STACK_NAME = "PredictionsTransformerTests-" + BUILD_TIMESTAMP;
var BUCKET_NAME = "appsync-predictions-transformer-test-bucket-" + BUILD_TIMESTAMP;
var LOCAL_FS_BUILD_DIR = '/tmp/predictions_transformer_tests/';
var S3_ROOT_DIR_KEY = 'deployments';
var GRAPHQL_CLIENT = undefined;
function outputValueSelector(key) {
    return function (outputs) {
        var output = outputs.find(function (o) { return o.OutputKey === key; });
        return output ? output.OutputValue : null;
    };
}
beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var validSchema, e_1, transformer, out, finishedStack, getApiEndpoint, getApiKey, endpoint, apiKey;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                validSchema = "\n    type Query {\n      translateImageText: String @predictions(actions: [ identifyText translateText ])\n      translateThis: String @predictions(actions: [ translateText ])\n      speakTranslatedText: String @predictions(actions: [ translateText convertTextToSpeech])\n    }\n    ";
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, awsS3Client.createBucket({ Bucket: BUCKET_NAME }).promise()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.warn("Could not create bucket: " + e_1);
                return [3 /*break*/, 4];
            case 4:
                transformer = new graphql_transformer_core_1.GraphQLTransform({
                    transformers: [
                        new graphql_dynamodb_transformer_1.DynamoDBModelTransformer(),
                        new graphql_predictions_transformer_1.PredictionsTransformer({ bucketName: BUCKET_NAME }),
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
                getApiEndpoint = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIEndpointOutput);
                getApiKey = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIApiKeyOutput);
                endpoint = getApiEndpoint(finishedStack.Outputs);
                apiKey = getApiKey(finishedStack.Outputs);
                expect(apiKey).toBeDefined();
                expect(endpoint).toBeDefined();
                GRAPHQL_CLIENT = new GraphQLClient_1.GraphQLClient(endpoint, { 'x-api-key': apiKey });
                return [2 /*return*/];
        }
    });
}); });
afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_2, e_3;
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
                e_2 = _a.sent();
                if (e_2.code === 'ValidationError' && e_2.message === "Stack with id " + STACK_NAME + " does not exist") {
                    // The stack was deleted. This is good.
                    expect(true).toEqual(true);
                    console.log('Successfully deleted stack ' + STACK_NAME);
                }
                else {
                    console.error(e_2);
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
                e_3 = _a.sent();
                console.warn("Error during bucket cleanup: " + e_3);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
test('test translate and convert text to speech', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, pollyURL;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("query SpeakTranslatedText($input: SpeakTranslatedTextInput!) {\n      speakTranslatedText(input: $input)\n    }", {
                    input: {
                        translateText: {
                            sourceLanguage: "en",
                            targetLanguage: "es",
                            text: "this is a voice test"
                        },
                        convertTextToSpeech: {
                            voiceID: "Conchita"
                        }
                    }
                })];
            case 1:
                response = _a.sent();
                expect(response).toBeDefined();
                pollyURL = response.data.speakTranslatedText;
                // check that return format is a url
                expect(pollyURL).toMatch(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/);
                return [2 /*return*/];
        }
    });
}); });
test('test translate text individually', function () { return __awaiter(void 0, void 0, void 0, function () {
    var germanTranslation, response, translatedText;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                germanTranslation = 'Dies ist ein Sprachtest';
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query TranslateThis($input: TranslateThisInput!) {\n      translateThis(input: $input)\n    }", {
                        input: {
                            translateText: {
                                sourceLanguage: "en",
                                targetLanguage: "de",
                                text: "this is a voice test"
                            },
                        }
                    })];
            case 1:
                response = _a.sent();
                expect(response).toBeDefined();
                translatedText = response.data.translateThis;
                expect(translatedText).toMatch(germanTranslation);
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=PredictionsTransformerTests.e2e.test.js.map