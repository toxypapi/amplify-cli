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
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_auth_transformer_1 = require("graphql-auth-transformer");
const graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
const graphql_transformer_core_1 = require("graphql-transformer-core");
const index_1 = require("./utils/index");
const aws_appsync_1 = require("aws-appsync");
const cognito_utils_1 = require("./utils/cognito-utils");
const AWS = require("aws-sdk");
const graphql_tag_1 = require("graphql-tag");
require("isomorphic-fetch");
// To overcome of the way of how AmplifyJS picks up currentUserCredentials
const anyAWS = AWS;
if (anyAWS && anyAWS.config && anyAWS.config.credentials) {
    delete anyAWS.config.credentials;
}
// to deal with bug in cognito-identity-js
global.fetch = require('node-fetch');
// to deal with subscriptions in node env
global.WebSocket = require('ws');
// delays
const SUBSCRIPTION_DELAY = 2000;
const PROPAGATAION_DELAY = 5000;
const JEST_TIMEOUT = 2000000;
jest.setTimeout(JEST_TIMEOUT);
let GRAPHQL_ENDPOINT = undefined;
let ddbEmulator = null;
let dbPath = null;
let server;
const AWS_REGION = 'my-local-2';
let GRAPHQL_CLIENT_1 = undefined;
let GRAPHQL_CLIENT_2 = undefined;
let GRAPHQL_CLIENT_3 = undefined;
const USER_POOL_ID = 'fake_user_pool';
const USERNAME1 = 'user1@domain.com';
const USERNAME2 = 'user2@domain.com';
const USERNAME3 = 'user3@domain.com';
const INSTRUCTOR_GROUP_NAME = 'Instructor';
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    const validSchema = `
        type Student @model
            @auth(rules: [
                {allow: owner}
                {allow: groups, groups: ["Instructor"]}
        ]) {
            id: String,
            name: String,
            email: AWSEmail,
            ssn: String @auth(rules: [{allow: owner}])
        }

        type Post @model
            @auth(rules: [
                {allow: owner, ownerField: "postOwner"}
            ])
        {
            id: ID!
            title: String
            postOwner: String
        }
    `;
    const transformer = new graphql_transformer_core_1.GraphQLTransform({
        transformers: [
            new graphql_dynamodb_transformer_1.DynamoDBModelTransformer(),
            new graphql_auth_transformer_1.ModelAuthTransformer({
                authConfig: {
                    defaultAuthentication: {
                        authenticationType: 'AMAZON_COGNITO_USER_POOLS',
                    },
                    additionalAuthenticationProviders: [],
                },
            }),
        ],
    });
    try {
        const out = transformer.transform(validSchema);
        let ddbClient;
        ({ dbPath, emulator: ddbEmulator, client: ddbClient } = yield index_1.launchDDBLocal());
        const result = yield index_1.deploy(out, ddbClient);
        server = result.simulator;
        GRAPHQL_ENDPOINT = server.url + '/graphql';
        // Verify we have all the details
        expect(GRAPHQL_ENDPOINT).toBeTruthy();
        // Configure Amplify, create users, and sign in.
        const idToken1 = cognito_utils_1.signUpAddToGroupAndGetJwtToken(USER_POOL_ID, USERNAME1, USERNAME1, [INSTRUCTOR_GROUP_NAME]);
        GRAPHQL_CLIENT_1 = new aws_appsync_1.default({
            url: GRAPHQL_ENDPOINT,
            region: AWS_REGION,
            disableOffline: true,
            offlineConfig: {
                keyPrefix: 'userPools',
            },
            auth: {
                type: aws_appsync_1.AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
                jwtToken: idToken1,
            },
        });
        const idToken2 = cognito_utils_1.signUpAddToGroupAndGetJwtToken(USER_POOL_ID, USERNAME2, USERNAME2, [INSTRUCTOR_GROUP_NAME]);
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
        const idToken3 = cognito_utils_1.signUpAddToGroupAndGetJwtToken(USER_POOL_ID, USERNAME3, USERNAME3, []);
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
        // Wait for any propagation to avoid random
        // "The security token included in the request is invalid" errors
        yield new Promise(res => setTimeout(() => res(), PROPAGATAION_DELAY));
    }
    catch (e) {
        console.error(e);
        expect(true).toEqual(false);
    }
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (server) {
            yield server.stop();
        }
        yield index_1.terminateDDB(ddbEmulator, dbPath);
    }
    catch (e) {
        console.error(e);
        throw e;
    }
}));
/**
 * Tests
 */
test('Test that only authorized members are allowed to view subscriptions', (done) => __awaiter(void 0, void 0, void 0, function* () {
    // subscribe to create students as user 2
    const observer = GRAPHQL_CLIENT_2.subscribe({
        query: graphql_tag_1.default `
      subscription OnCreateStudent {
        onCreateStudent {
          id
          name
          email
          ssn
          owner
        }
      }
    `,
    });
    console.log(observer);
    let subscription = observer.subscribe((event) => {
        console.log('subscription event: ', event);
        const student = event.data.onCreateStudent;
        subscription.unsubscribe();
        expect(student.name).toEqual('student1');
        expect(student.email).toEqual('student1@domain.com');
        expect(student.ssn).toBeNull();
        done();
    });
    yield new Promise(res => setTimeout(() => res(), SUBSCRIPTION_DELAY));
    createStudent(GRAPHQL_CLIENT_1, {
        name: 'student1',
        email: 'student1@domain.com',
        ssn: 'AAA-01-SSSS',
    });
}));
test('Test that a user not in the group is not allowed to view the subscription', (done) => __awaiter(void 0, void 0, void 0, function* () {
    // suscribe to create students as user 3
    const observer = GRAPHQL_CLIENT_3.subscribe({
        query: graphql_tag_1.default `
      subscription OnCreateStudent {
        onCreateStudent {
          id
          name
          email
          ssn
          owner
        }
      }
    `,
    });
    observer.subscribe({
        error: (err) => {
            console.log(err.graphQLErrors[0]);
            expect(err.graphQLErrors[0].message).toEqual('Unauthorized');
            done();
        },
    });
    yield new Promise(res => setTimeout(() => res(), SUBSCRIPTION_DELAY));
    createStudent(GRAPHQL_CLIENT_1, {
        name: 'student2',
        email: 'student2@domain.com',
        ssn: 'BBB-00-SNSN',
    });
}));
test('Test a subscription on update', (done) => __awaiter(void 0, void 0, void 0, function* () {
    // susbcribe to update students as user 2
    const observer = GRAPHQL_CLIENT_2.subscribe({
        query: graphql_tag_1.default `
      subscription OnUpdateStudent {
        onUpdateStudent {
          id
          name
          email
          ssn
          owner
        }
      }
    `,
    });
    let subscription = observer.subscribe((event) => {
        const student = event.data.onUpdateStudent;
        subscription.unsubscribe();
        expect(student.id).toEqual(student3ID);
        expect(student.name).toEqual('student3');
        expect(student.email).toEqual('emailChanged@domain.com');
        expect(student.ssn).toBeNull();
        done();
    });
    yield new Promise(res => setTimeout(() => res(), SUBSCRIPTION_DELAY));
    const student3 = yield createStudent(GRAPHQL_CLIENT_1, {
        name: 'student3',
        email: 'changeThisEmail@domain.com',
        ssn: 'CCC-01-SNSN',
    });
    expect(student3.data.createStudent).toBeDefined();
    const student3ID = student3.data.createStudent.id;
    expect(student3.data.createStudent.name).toEqual('student3');
    expect(student3.data.createStudent.email).toEqual('changeThisEmail@domain.com');
    expect(student3.data.createStudent.ssn).toBeNull();
    updateStudent(GRAPHQL_CLIENT_1, {
        id: student3ID,
        email: 'emailChanged@domain.com',
    });
}));
test('Test a subscription on delete', (done) => __awaiter(void 0, void 0, void 0, function* () {
    // subscribe to onDelete as user 2
    const observer = GRAPHQL_CLIENT_2.subscribe({
        query: graphql_tag_1.default `
      subscription OnDeleteStudent {
        onDeleteStudent {
          id
          name
          email
          ssn
          owner
        }
      }
    `,
    });
    let subscription = observer.subscribe((event) => {
        const student = event.data.onDeleteStudent;
        subscription.unsubscribe();
        expect(student.id).toEqual(student4ID);
        expect(student.name).toEqual('student4');
        expect(student.email).toEqual('plsDelete@domain.com');
        expect(student.ssn).toBeNull();
        done();
    });
    yield new Promise(res => setTimeout(() => res(), SUBSCRIPTION_DELAY));
    const student4 = yield createStudent(GRAPHQL_CLIENT_1, {
        name: 'student4',
        email: 'plsDelete@domain.com',
        ssn: 'DDD-02-SNSN',
    });
    expect(student4).toBeDefined();
    const student4ID = student4.data.createStudent.id;
    expect(student4.data.createStudent.email).toEqual('plsDelete@domain.com');
    expect(student4.data.createStudent.ssn).toBeNull();
    yield deleteStudent(GRAPHQL_CLIENT_1, { id: student4ID });
}));
// ownerField Tests
test('Test subscription onCreatePost with ownerField', (done) => __awaiter(void 0, void 0, void 0, function* () {
    const observer = GRAPHQL_CLIENT_1.subscribe({
        query: graphql_tag_1.default `
    subscription OnCreatePost {
        onCreatePost(postOwner: "${USERNAME1}") {
            id
            title
            postOwner
        }
    }`,
    });
    let subscription = observer.subscribe((event) => {
        const post = event.data.onCreatePost;
        subscription.unsubscribe();
        expect(post.title).toEqual('someTitle');
        expect(post.postOwner).toEqual(USERNAME1);
        done();
    });
    yield new Promise(res => setTimeout(() => res(), SUBSCRIPTION_DELAY));
    createPost(GRAPHQL_CLIENT_1, {
        title: 'someTitle',
        postOwner: USERNAME1,
    });
}));
// mutations
function createStudent(client, input) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = graphql_tag_1.default `
    mutation CreateStudent($input: CreateStudentInput!) {
      createStudent(input: $input) {
        id
        name
        email
        ssn
        owner
      }
    }
  `;
        return yield client.mutate({ mutation: request, variables: { input } });
    });
}
function updateStudent(client, input) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = graphql_tag_1.default `
    mutation UpdateStudent($input: UpdateStudentInput!) {
      updateStudent(input: $input) {
        id
        name
        email
        ssn
        owner
      }
    }
  `;
        return yield client.mutate({ mutation: request, variables: { input } });
    });
}
function deleteStudent(client, input) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = graphql_tag_1.default `
    mutation DeleteStudent($input: DeleteStudentInput!) {
      deleteStudent(input: $input) {
        id
        name
        email
        ssn
        owner
      }
    }
  `;
        return yield client.mutate({ mutation: request, variables: { input } });
    });
}
function createPost(client, input) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = graphql_tag_1.default `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        title
        postOwner
      }
    }
  `;
        return yield client.mutate({ mutation: request, variables: { input } });
    });
}
//# sourceMappingURL=subscriptions-with-auth.e2e.test.js.map