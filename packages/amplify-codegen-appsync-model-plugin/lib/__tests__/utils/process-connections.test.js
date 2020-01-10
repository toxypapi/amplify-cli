"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process_connections_1 = require("../../utils/process-connections");
describe('process connection', () => {
    describe('Bi-Directional connection (named connection)', () => {
        describe('One:Many', () => {
            let modelMap;
            beforeEach(() => {
                const schema = /* GraphQL */ `
          type Post @model {
            comments: [Comment] @connection(name: "postConnection")
          }

          type Comment @model {
            post: Post @connection(name: "postConnection")
          }
        `;
                modelMap = {
                    Post: {
                        name: 'Post',
                        type: 'model',
                        directives: [],
                        fields: [
                            {
                                type: 'Comment',
                                isNullable: true,
                                isList: true,
                                name: 'comments',
                                directives: [{ name: 'connection', arguments: { name: 'postConnection' } }],
                            },
                        ],
                    },
                    Comment: {
                        name: 'Comment',
                        type: 'model',
                        directives: [],
                        fields: [
                            {
                                type: 'Post',
                                isNullable: true,
                                isList: false,
                                name: 'post',
                                directives: [{ name: 'connection', arguments: { name: 'postConnection' } }],
                            },
                        ],
                    },
                };
            });
            it('should return HAS_MANY for Post.comments field connection info', () => {
                const commentsField = modelMap.Post.fields[0];
                const connectionInfo = process_connections_1.processConnections(commentsField, modelMap.Post, modelMap);
                expect(connectionInfo).toBeDefined();
                expect(connectionInfo.kind).toEqual(process_connections_1.CodeGenConnectionType.HAS_MANY);
                expect(connectionInfo.associatedWith).toEqual(modelMap.Comment.fields[0]);
            });
            it('should return BELONGS_TO for Comment.post field connection info', () => {
                const postField = modelMap.Comment.fields[0];
                const connectionInfo = process_connections_1.processConnections(postField, modelMap.Comment, modelMap);
                expect(connectionInfo).toBeDefined();
                expect(connectionInfo.kind).toEqual(process_connections_1.CodeGenConnectionType.BELONGS_TO);
            });
        });
        describe('One:One connection', () => {
            let modelMap;
            beforeEach(() => {
                const schema = /* GraphQL */ `
          type Person @model {
            license: License @connection(name: "PersonLicense")
          }

          type License @model {
            person: Person! @connection(name: "PersonLicense")
          }
        `;
                modelMap = {
                    Person: {
                        name: 'Person',
                        type: 'model',
                        directives: [],
                        fields: [
                            {
                                type: 'License',
                                isNullable: true,
                                isList: false,
                                name: 'license',
                                directives: [{ name: 'connection', arguments: { name: 'PersonLicense' } }],
                            },
                        ],
                    },
                    License: {
                        name: 'License',
                        type: 'model',
                        directives: [],
                        fields: [
                            {
                                type: 'Person',
                                isNullable: false,
                                isList: false,
                                name: 'person',
                                directives: [{ name: 'connection', arguments: { name: 'PersonLicense' } }],
                            },
                        ],
                    },
                };
            });
            it('should return HAS_ONE Person.license field', () => {
                const licenseField = modelMap.Person.fields[0];
                const connectionInfo = process_connections_1.processConnections(licenseField, modelMap.Person, modelMap);
                expect(connectionInfo).toBeDefined();
                expect(connectionInfo.kind).toEqual(process_connections_1.CodeGenConnectionType.HAS_ONE);
                expect(connectionInfo.associatedWith).toEqual(modelMap.License.fields[0]);
            });
            it('should return BELONGS_TO License.person field', () => {
                const personField = modelMap.License.fields[0];
                const connectionInfo = process_connections_1.processConnections(personField, modelMap.License, modelMap);
                expect(connectionInfo).toBeDefined();
                expect(connectionInfo.kind).toEqual(process_connections_1.CodeGenConnectionType.BELONGS_TO);
            });
            it('should throw error when the One:One connection has optional field on both sides', () => {
                const personField = modelMap.License.fields[0];
                // Make person field optional
                personField.isNullable = true;
                expect(() => {
                    process_connections_1.processConnections(personField, modelMap.License, modelMap);
                }).toThrowError('DataStore does not support 1 to 1 connection with both sides of connection as optional field');
            });
        });
    });
    describe('Uni-directional connection (unnamed connection)', () => {
        let modelMap;
        beforeEach(() => {
            const schema = /* GraphQL */ `
        type Post @model {
          comments: [Comment] @connection
        }

        type Comment @model {
          post: Post @connection
        }
      `;
            modelMap = {
                Post: {
                    name: 'Post',
                    type: 'model',
                    directives: [],
                    fields: [
                        {
                            type: 'Comment',
                            isNullable: true,
                            isList: true,
                            name: 'comments',
                            directives: [{ name: 'connection', arguments: {} }],
                        },
                    ],
                },
                Comment: {
                    name: 'Comment',
                    type: 'model',
                    directives: [],
                    fields: [
                        {
                            type: 'Post',
                            isNullable: true,
                            isList: false,
                            name: 'post',
                            directives: [{ name: 'connection', arguments: {} }],
                        },
                    ],
                },
            };
        });
        it('should return HAS_MANY for Post.comments', () => {
            const commentsField = modelMap.Post.fields[0];
            const connectionInfo = process_connections_1.processConnections(commentsField, modelMap.Post, modelMap);
            expect(connectionInfo).toBeDefined();
            expect(connectionInfo.kind).toEqual(process_connections_1.CodeGenConnectionType.HAS_MANY);
            expect(connectionInfo.associatedWith).toEqual({
                name: 'postCommentsId',
                type: 'ID',
                isList: false,
                directives: [],
                isNullable: true,
            });
        });
        it('should return BELONGS_TO for Comment.post', () => {
            const commentsField = modelMap.Comment.fields[0];
            const connectionInfo = process_connections_1.processConnections(commentsField, modelMap.Comment, modelMap);
            expect(connectionInfo).toBeDefined();
            expect(connectionInfo.kind).toEqual(process_connections_1.CodeGenConnectionType.BELONGS_TO);
            expect(connectionInfo.targetName).toEqual('commentPostId');
        });
    });
    describe('connection v2', () => {
        let modelMap;
        beforeEach(() => {
            const schema = /* GraphQL */ `
        type Post @model {
          comments: [Comment] @connection(keyName: "byPost", fields: ["id"])
        }

        type Comment @model @key(name: "byPost", fields: ["postID", "content"]) {
          postID: ID!
          content: String!
          post: Post @connection(fields:['postID'])
        }
      `;
            modelMap = {
                Post: {
                    name: 'Post',
                    type: 'model',
                    directives: [],
                    fields: [
                        {
                            type: 'Comment',
                            isNullable: true,
                            isList: true,
                            name: 'comments',
                            directives: [{ name: 'connection', arguments: { keyName: 'byPost', fields: ['id'] } }],
                        },
                    ],
                },
                Comment: {
                    name: 'Comment',
                    type: 'model',
                    directives: [{ name: 'key', arguments: { name: 'byPost', fields: ['postID', 'content'] } }],
                    fields: [
                        {
                            type: 'id',
                            isNullable: false,
                            isList: false,
                            name: 'postID',
                            directives: [],
                        },
                        {
                            type: 'String',
                            isNullable: false,
                            isList: false,
                            name: 'content',
                            directives: [],
                        },
                        {
                            type: 'Post',
                            isNullable: false,
                            isList: false,
                            name: 'post',
                            directives: [{ name: 'connection', arguments: { fields: ['postID'] } }],
                        },
                    ],
                },
            };
        });
        it('should support connection with keyName on HAS_MANY side', () => {
            const commentsField = modelMap.Post.fields[0];
            const connectionInfo = process_connections_1.processConnections(commentsField, modelMap.Post, modelMap);
            expect(connectionInfo).toBeDefined();
            expect(connectionInfo.kind).toEqual(process_connections_1.CodeGenConnectionType.HAS_MANY);
            expect(connectionInfo.associatedWith).toEqual(modelMap.Comment.fields[2]);
        });
        it('should support connection with keyName on HAS_MANY side with no corresponding connection on other side ', () => {
            // remove post: Post @connection(fields:['postID']) field
            modelMap.Comment.fields.splice(2);
            const commentsField = modelMap.Post.fields[0];
            const connectionInfo = process_connections_1.processConnections(commentsField, modelMap.Post, modelMap);
            expect(connectionInfo).toBeDefined();
            expect(connectionInfo.kind).toEqual(process_connections_1.CodeGenConnectionType.HAS_MANY);
            expect(connectionInfo.associatedWith).toEqual(modelMap.Comment.fields[0]);
        });
        it('should support connection with @key on BELONGS_TO side', () => {
            const postField = modelMap.Comment.fields[2];
            const connectionInfo = process_connections_1.processConnections(postField, modelMap.Post, modelMap);
            expect(connectionInfo).toBeDefined();
            expect(connectionInfo.kind).toEqual(process_connections_1.CodeGenConnectionType.BELONGS_TO);
            expect(connectionInfo.targetName).toEqual(modelMap.Comment.fields[0].name);
        });
    });
    describe('getConnectedField', () => {
        describe('One to Many', () => {
            let modelMap;
            beforeEach(() => {
                const schema = /* GraphQL */ `
          type Post @model {
            comments: [Comment] @connection(name: "postConnection")
          }

          type Comment @model {
            post: Post @connection(name: "postConnection")
          }
        `;
                modelMap = {
                    Post: {
                        name: 'Post',
                        type: 'model',
                        directives: [],
                        fields: [
                            {
                                type: 'Comment',
                                isNullable: true,
                                isList: true,
                                name: 'comments',
                                directives: [{ name: 'connection', arguments: { name: 'postConnection' } }],
                            },
                        ],
                    },
                    Comment: {
                        name: 'Comment',
                        type: 'model',
                        directives: [],
                        fields: [
                            {
                                type: 'Post',
                                isNullable: true,
                                isList: false,
                                name: 'post',
                                directives: [{ name: 'connection', arguments: { name: 'postConnection' } }],
                            },
                        ],
                    },
                };
            });
            it('should return connected field when connection is Many to one', () => {
                const commentsField = modelMap.Post.fields[0];
                const postField = modelMap.Comment.fields[0];
                const commentModel = modelMap.Comment;
                const postModel = modelMap.Post;
                expect(process_connections_1.getConnectedField(commentsField, postModel, commentModel)).toEqual(postField);
            });
            it('should return connected field when connection is One to Many', () => {
                const commentsField = modelMap.Post.fields[0];
                const postField = modelMap.Comment.fields[0];
                const commentModel = modelMap.Comment;
                const postModel = modelMap.Post;
                expect(process_connections_1.getConnectedField(postField, commentModel, postModel)).toEqual(commentsField);
            });
        });
        describe('One to one', () => {
            let modelMap;
            beforeEach(() => {
                const schema = /* GraphQL */ `
          type Person @model {
            license: License @connection(name: "person-license")
          }

          type License @model {
            holder: Person! @connection(name: "person-license")
          }
        `;
                modelMap = {
                    Person: {
                        name: 'Person',
                        type: 'model',
                        directives: [],
                        fields: [
                            {
                                type: 'License',
                                isNullable: true,
                                isList: false,
                                name: 'license',
                                directives: [{ name: 'connection', arguments: { name: 'person-license' } }],
                            },
                        ],
                    },
                    License: {
                        name: 'License',
                        type: 'model',
                        directives: [],
                        fields: [
                            {
                                type: 'Person',
                                isNullable: false,
                                isList: false,
                                name: 'holder',
                                directives: [{ name: 'connection', arguments: { name: 'person-license' } }],
                            },
                        ],
                    },
                };
            });
            it('should return connected field when connection is One to One', () => {
                const licenseField = modelMap.Person.fields[0];
                const holderField = modelMap.License.fields[0];
                const personModel = modelMap.Person;
                const licenseModel = modelMap.License;
                expect(process_connections_1.getConnectedField(licenseField, personModel, licenseModel)).toEqual(holderField);
                expect(process_connections_1.getConnectedField(holderField, licenseModel, personModel)).toEqual(licenseField);
            });
        });
    });
    describe('self referencing models', () => {
        let modelMap;
        beforeEach(() => {
            const schema = /* GraphQL */ `
        type Employee @model {
          name: String!
          supervisor: Employee @connection(name: "supervisorConnection")
          subordinates: [Employee] @connection(name: "supervisorConnection")
        }
      `;
            modelMap = {
                Employee: {
                    name: 'Employee',
                    type: 'model',
                    directives: [],
                    fields: [
                        {
                            type: 'String',
                            isNullable: false,
                            isList: false,
                            name: 'name',
                            directives: [],
                        },
                        {
                            type: 'Employee',
                            isNullable: true,
                            isList: false,
                            name: 'supervisor',
                            directives: [{ name: 'connection', arguments: { name: 'supervisorConnection' } }],
                        },
                        {
                            type: 'Employee',
                            isNullable: true,
                            isList: true,
                            name: 'subordinates',
                            directives: [{ name: 'connection', arguments: { name: 'supervisorConnection' } }],
                        },
                    ],
                },
            };
        });
        it('should return connected field', () => {
            const supervisorField = modelMap.Employee.fields[1];
            const subordinateField = modelMap.Employee.fields[2];
            const employeeModel = modelMap.Employee;
            expect(process_connections_1.getConnectedField(supervisorField, employeeModel, employeeModel)).toEqual(subordinateField);
            expect(process_connections_1.getConnectedField(subordinateField, employeeModel, employeeModel)).toEqual(supervisorField);
        });
    });
});
//# sourceMappingURL=process-connections.test.js.map