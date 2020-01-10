"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const validate_java_1 = require("../utils/validate-java");
const supported_directives_1 = require("../../scalars/supported-directives");
const appsync_java_visitor_1 = require("../../visitors/appsync-java-visitor");
const appsync_visitor_1 = require("../../visitors/appsync-visitor");
const buildSchemaWithDirectives = (schema) => {
    return graphql_1.buildSchema([schema, supported_directives_1.directives, supported_directives_1.scalars].join('\n'));
};
const getVisitor = (schema, selectedType, generate = appsync_visitor_1.CodeGenGenerateEnum.code) => {
    const ast = graphql_1.parse(schema);
    const builtSchema = buildSchemaWithDirectives(schema);
    const visitor = new appsync_java_visitor_1.AppSyncModelJavaVisitor(builtSchema, { directives: supported_directives_1.directives, target: 'android', generate }, { selectedType });
    graphql_1.visit(ast, { leave: visitor });
    return visitor;
};
describe('AppSyncModelVisitor', () => {
    const schema = /* GraphQL */ `
    type Todo @model {
      id: ID!
      title: String!
      done: Boolean!
      description: String
      due_date: String
      version: Int!
      value: Float
      tasks: [task] @connection(name: "TodoTasks")
    }

    enum status {
      pending
      done
    }

    type task @model {
      id: ID
      title: String!
      done: Boolean!
      status: status
      todo: Todo @connection(name: "TodoTasks")
      time: AWSTime
      createdOn: AWSDate
    }

    type authorBook @model @key(name: "byAuthor", fields: ["author_id"]) @key(name: "byBook", fields: ["book_id"]) {
      id: ID!
      author_id: ID!
      book_id: ID!
      author: Author @connection(fields: ["author_id"])
      book: Book @connection(fields: ["book_id"])
    }

    type Book @model {
      id: ID!
      title: String!
      authors: [authorBook] @connection(keyName: "byBook", fields: ["id"])
    }

    type Author @model {
      id: ID!
      first_name: String!
      last_name: String!
      books: [authorBook] @connection(keyName: "byAuthor", fields: ["id"])
    }

    type Foo @model {
      name: String
      bar: String
    }
  `;
    it('Should generate a class for a Model', () => {
        const schema = /* GraphQL */ `
      type SimpleModel @model {
        id: ID!
        name: String
        bar: String
      }
    `;
        const visitor = getVisitor(schema, 'SimpleModel');
        const generatedCode = visitor.generate();
        expect(() => validate_java_1.validateJava(generatedCode)).not.toThrow();
        expect(generatedCode).toMatchSnapshot();
        expect(generatedCode).toMatchSnapshot();
    });
    it('Should generate a class a model with all optional fields', () => {
        const schema = /* GraphQL */ `
      type SimpleModel @model {
        name: String
        bar: String
      }
    `;
        const visitor = getVisitor(schema);
        const generatedCode = visitor.generate();
        expect(() => validate_java_1.validateJava(generatedCode)).not.toThrow();
        expect(generatedCode).toMatchSnapshot();
    });
    it('should generate an enum for enum type', () => {
        const schema = /* GraphQL */ `
      enum status {
        pending
        done
      }
    `;
        const visitor = getVisitor(schema, 'status');
        const generatedCode = visitor.generate();
        expect(() => validate_java_1.validateJava(generatedCode)).not.toThrow();
        expect(generatedCode).toMatchSnapshot();
    });
    it('should generate model with snake case', () => {
        const schema = /* GraphQL */ `
      type snake_case @model {
        id: ID!
        name: String
      }
    `;
        const visitor = getVisitor(schema, 'snake_case');
        const generatedCode = visitor.generate();
        expect(() => validate_java_1.validateJava(generatedCode)).not.toThrow();
        expect(generatedCode).toMatchSnapshot();
    });
    it('should generate model with with snake_case field', () => {
        const schema = /* GraphQL */ `
      type SnakeCaseField @model {
        id: ID!
        first_name: String
      }
    `;
        const visitor = getVisitor(schema, 'SnakeCaseField');
        const generatedCode = visitor.generate();
        expect(() => validate_java_1.validateJava(generatedCode)).not.toThrow();
        expect(generatedCode).toMatchSnapshot();
    });
    it('should generate model with key directive', () => {
        const schema = /* GraphQL */ `
      type authorBook @model @key(name: "byAuthor", fields: ["author_id"]) @key(name: "byBook", fields: ["book_id"]) {
        id: ID!
        author_id: ID!
        book_id: ID!
        author: String
        book: String
      }
    `;
        const visitor = getVisitor(schema, 'authorBook');
        const generatedCode = visitor.generate();
        expect(() => validate_java_1.validateJava(generatedCode)).not.toThrow();
        expect(generatedCode).toMatchSnapshot();
    });
    describe('connection', () => {
        describe('One to Many connection', () => {
            const schema = /* GraphQL */ `
        type Todo @model {
          id: ID!
          title: String!
          done: Boolean!
          description: String
          due_date: String
          version: Int!
          value: Float
          tasks: [task] @connection(name: "TodoTasks")
        }

        type task @model {
          id: ID
          title: String!
          done: Boolean!
          todo: Todo @connection(name: "TodoTasks")
          time: AWSTime
          createdOn: AWSDate
        }
      `;
            it('should generate one side of the connection', () => {
                const visitor = getVisitor(schema, 'Todo');
                const generatedCode = visitor.generate();
                expect(() => validate_java_1.validateJava(generatedCode)).not.toThrow();
                expect(generatedCode).toMatchSnapshot();
            });
            it('should generate many side of the connection', () => {
                const visitor = getVisitor(schema, 'task');
                const generatedCode = visitor.generate();
                expect(() => validate_java_1.validateJava(generatedCode)).not.toThrow();
                expect(generatedCode).toMatchSnapshot();
            });
        });
    });
});
//# sourceMappingURL=appsync-java-visitor.test.js.map