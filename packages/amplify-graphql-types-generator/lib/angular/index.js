"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const prettier = require("prettier");
const CodeGenerator_1 = require("../utilities/CodeGenerator");
const codeGeneration_1 = require("../typescript/codeGeneration");
const types_1 = require("../typescript/types");
const language_1 = require("../typescript/language");
function generateSource(context) {
    const generator = new CodeGenerator_1.CodeGenerator(context);
    generator.printOnNewline('/* tslint:disable */');
    generator.printOnNewline('//  This file was automatically generated and should not be edited.');
    generator.printOnNewline(`import { Injectable } from '@angular/core';`);
    generator.printOnNewline(`import API, { graphqlOperation } from '@aws-amplify/api';`);
    generator.printOnNewline(`import { GraphQLResult } from "@aws-amplify/api/lib/types";`);
    generator.printOnNewline(`import * as Observable from 'zen-observable';`);
    generator.printNewline();
    generateTypes(generator, context);
    generator.printNewline();
    generateAngularService(generator, context);
    return prettier.format(generator.output, { parser: 'typescript' });
}
exports.generateSource = generateSource;
function generateTypes(generator, context) {
    context.typesUsed.forEach(type => codeGeneration_1.typeDeclarationForGraphQLType(generator, type));
    Object.values(context.operations).forEach(operation => {
        interfaceDeclarationForOperation(generator, operation);
    });
    Object.values(context.fragments).forEach(operation => codeGeneration_1.interfaceDeclarationForFragment(generator, operation));
}
function interfaceDeclarationForOperation(generator, { operationName, operationType, fields }) {
    const interfaceName = codeGeneration_1.interfaceNameFromOperation({ operationName, operationType });
    fields = fields.map(field => codeGeneration_1.updateTypeNameField(field));
    if (fields[0].fields) {
        const properties = codeGeneration_1.propertiesFromFields(generator.context, fields[0].fields);
        language_1.interfaceDeclaration(generator, {
            interfaceName,
        }, () => {
            codeGeneration_1.propertyDeclarations(generator, properties);
        });
    }
}
function getOperationResultField(operation) {
    if (operation.fields.length && operation.fields[0].fields) {
        return operation.fields[0];
    }
}
function getReturnTypeName(generator, op) {
    const { operationName, operationType } = op;
    if (graphql_1.isScalarType(op.fields[0].type)) {
        return types_1.typeNameFromGraphQLType(generator.context, op.fields[0].type);
    }
    else {
        return codeGeneration_1.interfaceNameFromOperation({ operationName, operationType });
    }
}
function generateAngularService(generator, context) {
    const operations = context.operations;
    generator.printOnNewline(`@Injectable({
    providedIn: 'root'
  })`);
    generator.printOnNewline(`export class APIService {`);
    generator.withIndent(() => {
        Object.values(operations).forEach((op) => {
            if (op.operationType === 'subscription') {
                return generateSubscriptionOperation(generator, op);
            }
            if (op.operationType === 'query' || op.operationType === 'mutation') {
                return generateQueryOrMutationOperation(generator, op);
            }
        });
        generator.printOnNewline('}');
    });
}
function generateSubscriptionOperation(generator, op) {
    const statement = formatTemplateString(generator, op.source);
    const { operationName } = op;
    const returnType = getReturnTypeName(generator, op);
    generator.printNewline();
    const subscriptionName = `${operationName}Listener`;
    generator.print(`${subscriptionName}: Observable<${returnType}> = API.graphql(graphqlOperation(\n\`${statement}\`)) as Observable<${returnType}>`);
    generator.printNewline();
}
function generateQueryOrMutationOperation(generator, op) {
    const statement = formatTemplateString(generator, op.source);
    const vars = variablesFromField(generator.context, op.variables);
    const returnType = getReturnTypeName(generator, op);
    const resultField = getOperationResultField(op);
    const resultProp = resultField ? `.${resultField.responseName}` : '';
    generator.printNewline();
    generator.print(`async ${op.operationName}(`);
    variableDeclaration(generator, vars);
    generator.print(`) : Promise<${returnType}> {`);
    generator.withIndent(() => {
        generator.printNewlineIfNeeded();
        generator.print(`const statement = \`${statement}\``);
        const params = ['statement'];
        if (op.variables.length) {
            variableAssignmentToInput(generator, vars);
            params.push('gqlAPIServiceArguments');
        }
        generator.printOnNewline(`const response = await API.graphql(graphqlOperation(${params.join(', ')})) as any;`);
        generator.printOnNewline(`return (<${returnType}>response.data${resultProp})`);
    });
    generator.printOnNewline('}');
}
function variablesFromField(context, fields) {
    return fields.map(field => propertyFromVar(context, field));
}
exports.variablesFromField = variablesFromField;
function propertyFromVar(context, field) {
    let { name: fieldName, type: fieldType } = field;
    fieldName = fieldName || field.responseName;
    const propertyName = fieldName;
    let property = { fieldName, fieldType, propertyName };
    let isNullable = true;
    if (fieldType instanceof graphql_1.GraphQLNonNull) {
        isNullable = false;
    }
    const typeName = types_1.typeNameFromGraphQLType(context, fieldType, null, false);
    return Object.assign(Object.assign({}, property), { typeName, isComposite: false, fieldType, isNullable });
}
exports.propertyFromVar = propertyFromVar;
function variableDeclaration(generator, properties) {
    properties
        .sort((a, b) => {
        if (!a.isNullable && b.isNullable) {
            return -1;
        }
        if (!b.isNullable && a.isNullable) {
            return 1;
        }
        return 0;
    })
        .forEach(property => {
        const { fieldName, typeName, isArray, isNullable } = property;
        generator.print(fieldName);
        if (isNullable) {
            generator.print('?');
        }
        generator.print(':');
        if (isArray) {
            generator.print(' Array<');
        }
        generator.print(`${typeName}`);
        if (isArray) {
            generator.print('>');
        }
        generator.print(', ');
    });
}
function variableAssignmentToInput(generator, vars) {
    if (vars.length > 0) {
        generator.printOnNewline('const gqlAPIServiceArguments : any = ');
        generator.withinBlock(() => {
            vars
                .filter(v => !v.isNullable)
                .forEach(v => {
                generator.printOnNewline(`${v.fieldName},`);
            });
        }, '{', '}');
        vars
            .filter(v => v.isNullable)
            .forEach(v => {
            generator.printOnNewline(`if (${v.fieldName}) `);
            generator.withinBlock(() => {
                generator.printOnNewline(`gqlAPIServiceArguments.${v.fieldName} = ${v.fieldName}`);
            }, '{', '}');
        });
    }
}
function formatTemplateString(generator, str) {
    const indentation = ' '.repeat(generator.currentFile.indentWidth * (generator.currentFile.indentLevel + 2));
    return str
        .split('\n')
        .map((line, idx) => (idx > 0 ? indentation + line : line))
        .join('\n');
}
//# sourceMappingURL=index.js.map