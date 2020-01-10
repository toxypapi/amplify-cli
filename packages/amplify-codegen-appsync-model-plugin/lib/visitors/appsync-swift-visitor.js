"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const visitor_plugin_common_1 = require("@graphql-codegen/visitor-plugin-common");
const change_case_1 = require("change-case");
const swift_declaration_block_1 = require("../languages/swift-declaration-block");
const appsync_visitor_1 = require("./appsync-visitor");
const process_connections_1 = require("../utils/process-connections");
const swift_config_1 = require("../configs/swift-config");
class AppSyncSwiftVisitor extends appsync_visitor_1.AppSyncModelVisitor {
    constructor() {
        super(...arguments);
        this.modelExtensionImports = ['import Amplify', 'import Foundation'];
        this.imports = ['import Amplify', 'import Foundation'];
    }
    generate() {
        this.processDirectives();
        const code = [`// swiftlint:disable all`];
        if (this._parsedConfig.generate === appsync_visitor_1.CodeGenGenerateEnum.metadata) {
            code.push(this.generateSchema());
        }
        else if (this._parsedConfig.generate === appsync_visitor_1.CodeGenGenerateEnum.loader) {
            code.push(this.generateClassLoader());
        }
        else if (this.selectedTypeIsEnum()) {
            code.push(this.generateEnums());
        }
        else {
            code.push(this.generateStruct());
        }
        return code.join('\n');
    }
    generateStruct() {
        let result = [...this.imports, ''];
        Object.entries(this.getSelectedModels()).forEach(([name, obj]) => {
            const structBlock = new swift_declaration_block_1.SwiftDeclarationBlock()
                .withName(this.getModelName(obj))
                .access('public')
                .withProtocols(['Model']);
            Object.entries(obj.fields).forEach(([fieldName, field]) => {
                const fieldType = this.getNativeType(field);
                const isVariable = field.name !== 'id';
                structBlock.addProperty(this.getFieldName(field), fieldType, undefined, 'public', {
                    optional: !this.isFieldRequired(field),
                    isList: field.isList,
                    variable: isVariable,
                    isEnum: this.isEnumType(field),
                });
            });
            const initImpl = this.getInitBody(obj.fields);
            structBlock.addClassMethod('init', null, initImpl, obj.fields.map(field => ({
                name: this.getFieldName(field),
                type: this.getNativeType(field),
                value: field.name === 'id' ? 'UUID().uuidString' : undefined,
                flags: { optional: field.isNullable, isList: field.isList },
            })), 'public', {});
            result.push(structBlock.string);
        });
        return result.join('\n');
    }
    generateEnums() {
        const result = [...this.imports, ''];
        Object.entries(this.getSelectedEnums()).forEach(([name, enumValue]) => {
            const enumDeclaration = new swift_declaration_block_1.SwiftDeclarationBlock()
                .asKind('enum')
                .access('public')
                .withProtocols(['String'])
                .withName(this.getEnumName(enumValue));
            Object.entries(enumValue.values).forEach(([name, value]) => {
                enumDeclaration.addEnumValue(name, value);
            });
            result.push(enumDeclaration.string);
        });
        return result.join('\n');
    }
    generateSchema() {
        let result = [...this.modelExtensionImports, ''];
        Object.values(this.getSelectedModels())
            .filter(m => m.type === 'model')
            .forEach(model => {
            const schemaDeclarations = new swift_declaration_block_1.SwiftDeclarationBlock().asKind('extension').withName(this.getModelName(model));
            this.generateCodingKeys(this.getModelName(model), model, schemaDeclarations),
                this.generateModelSchema(this.getModelName(model), model, schemaDeclarations);
            result.push(schemaDeclarations.string);
        });
        return result.join('\n');
    }
    generateCodingKeys(name, model, extensionDeclaration) {
        const codingKeyEnum = new swift_declaration_block_1.SwiftDeclarationBlock()
            .asKind('enum')
            .access('public')
            .withName('CodingKeys')
            .withProtocols(['String', 'ModelKey'])
            .withComment('MARK: - CodingKeys');
        // AddEnums.name
        model.fields.forEach(field => codingKeyEnum.addEnumValue(this.getFieldName(field), field.name));
        extensionDeclaration.appendBlock(codingKeyEnum.string);
        // expose keys
        extensionDeclaration.addProperty('keys', '', 'CodingKeys.self', 'public', {
            static: true,
            variable: false,
        });
    }
    generateModelSchema(name, model, extensionDeclaration) {
        const keysName = change_case_1.lowerCaseFirst(model.name);
        const fields = model.fields.map(field => {
            return this.generateFieldSchema(field, keysName);
        });
        const closure = [
            '{ model in',
            `let ${keysName} = ${this.getModelName(model)}.keys`,
            '',
            `model.pluralName = "${this.pluralizeModelName(model)}"`,
            '',
            'model.fields(',
            visitor_plugin_common_1.indentMultiline(fields.join(',\n')),
            ')',
            '}',
        ].join('\n');
        extensionDeclaration.addProperty('schema', '', `defineSchema ${visitor_plugin_common_1.indentMultiline(closure).trim()}`, 'public', { static: true, variable: false }, ' MARK: - ModelSchema');
    }
    generateClassLoader() {
        const structList = Object.values(this.typeMap).map(typeObj => {
            return `${this.getModelName(typeObj)}.self`;
        });
        const result = [...this.modelExtensionImports, ''];
        const classDeclaration = new swift_declaration_block_1.SwiftDeclarationBlock()
            .access('public')
            .withName('AmplifyModels')
            .asKind('class')
            .withProtocols(['AmplifyModelRegistration'])
            .final()
            .withComment('Contains the set of classes that conforms to the `Model` protocol.');
        classDeclaration.addProperty('version', 'String', `"${this.computeVersion()}"`, 'public', {});
        const body = structList.map(modelClass => `ModelRegistry.register(modelType: ${modelClass})`).join('\n');
        classDeclaration.addClassMethod('registerModels', null, body, [{ type: 'ModelRegistry.Type', name: 'registry', flags: {}, value: undefined }], 'public', {});
        result.push(classDeclaration.string);
        return result.join('\n');
    }
    getInitBody(fields) {
        let result = fields.map(field => {
            const fieldName = this.getFieldName(field);
            return visitor_plugin_common_1.indent(`self.${fieldName} = ${fieldName}`);
        });
        return result.join('\n');
    }
    getListType(typeStr, field) {
        return `${typeStr}`;
    }
    generateFieldSchema(field, modelKeysName) {
        if (field.type === 'ID' && field.name === 'id') {
            return `.id()`;
        }
        let ofType;
        const isEnumType = this.isEnumType(field);
        const isModelType = this.isModelType(field);
        const name = `${modelKeysName}.${this.getFieldName(field)}`;
        const typeName = this.getSwiftModelTypeName(field);
        const { connectionInfo } = field;
        const isRequired = this.isFieldRequired(field) ? '.required' : '.optional';
        // connected field
        if (connectionInfo) {
            if (connectionInfo.kind === process_connections_1.CodeGenConnectionType.HAS_MANY) {
                return `.hasMany(${name}, is: ${isRequired}, ofType: ${typeName}, associatedWith: ${this.getModelName(connectionInfo.connectedModel)}.keys.${this.getFieldName(connectionInfo.associatedWith)})`;
            }
            if (connectionInfo.kind === process_connections_1.CodeGenConnectionType.HAS_ONE) {
                return `.hasOne(${name}, is: ${isRequired}, ofType: ${typeName}, associatedWith: ${this.getModelName(connectionInfo.connectedModel)}.keys.${this.getFieldName(connectionInfo.associatedWith)})`;
            }
            if (connectionInfo.kind === process_connections_1.CodeGenConnectionType.BELONGS_TO) {
                return `.belongsTo(${name}, is: ${isRequired}, ofType: ${typeName}, targetName: "${connectionInfo.targetName}")`;
            }
        }
        if (field.isList) {
            ofType = `.collection(of: ${this.getSwiftModelTypeName(field)})`;
        }
        else {
            if (isEnumType) {
                ofType = `.enum(${typeName})`;
            }
            else if (isModelType) {
                ofType = `.model(${typeName})`;
            }
            else {
                ofType = typeName;
            }
        }
        const args = [`${name}`, `is: ${isRequired}`, `ofType: ${ofType}`].filter(arg => arg).join(', ');
        return `.field(${args})`;
    }
    getSwiftModelTypeName(field) {
        if (this.isEnumType(field)) {
            return `${this.getEnumName(field.type)}.self`;
        }
        if (this.isModelType(field)) {
            return `${this.getModelName(this.typeMap[field.type])}.self`;
        }
        if (field.type in swift_config_1.schemaTypeMap) {
            return swift_config_1.schemaTypeMap[field.type];
        }
        // TODO: investigate if returning string is acceptable or should throw an exception
        return '.string';
    }
    getEnumValue(value) {
        return change_case_1.camelCase(value);
    }
    /**
     * checks if a field is required or optional field
     * There is a special case for fields which have hasMany connection
     * Swift needs to unwrap the object and when its possible that a hasMany field may not
     * be in the graphql selection set which means its null/undefined. To handle this
     * the struct needs the field to be optional even when the field is required in GraphQL schema
     * @param field field
     */
    isFieldRequired(field) {
        if (field.connectionInfo && field.connectionInfo.kind === process_connections_1.CodeGenConnectionType.HAS_MANY) {
            return false;
        }
        return !field.isNullable;
    }
}
exports.AppSyncSwiftVisitor = AppSyncSwiftVisitor;
//# sourceMappingURL=appsync-swift-visitor.js.map