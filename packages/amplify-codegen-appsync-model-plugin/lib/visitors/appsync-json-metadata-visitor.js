"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const visitor_plugin_common_1 = require("@graphql-codegen/visitor-plugin-common");
const process_connections_1 = require("../utils/process-connections");
const appsync_visitor_1 = require("./appsync-visitor");
const scalars_1 = require("../scalars");
class AppSyncJSONVisitor extends appsync_visitor_1.AppSyncModelVisitor {
    constructor(schema, rawConfig, additionalConfig, defaultScalars = visitor_plugin_common_1.DEFAULT_SCALARS) {
        super(schema, rawConfig, additionalConfig, defaultScalars);
        this._parsedConfig.metadataTarget = rawConfig.metadataTarget || 'javascript';
    }
    generate() {
        this.processDirectives();
        if (this._parsedConfig.metadataTarget === 'typescript') {
            return this.generateTypeScriptMetaData();
        }
        else if (this._parsedConfig.metadataTarget === 'javascript') {
            return this.generateJavaScriptMetaData();
        }
        else if (this._parsedConfig.metadataTarget === 'typeDeclaration') {
            return this.generateTypeDeclaration();
        }
        throw new Error(`Unsupported metadataTarget ${this._parsedConfig.metadataTarget}. Supported targets are javascript and typescript`);
    }
    generateTypeScriptMetaData() {
        const metadataObj = this.generateMetaData();
        const metaData = [`import { Schema } from "@aws-amplify/datastore";`, ''];
        metaData.push(`export const schema: Schema = ${JSON.stringify(metadataObj, null, 4)};`);
        return metaData.join('\n');
    }
    generateJavaScriptMetaData() {
        const metadataObj = this.generateMetaData();
        const metaData = [];
        metaData.push(`export const schema = ${JSON.stringify(metadataObj, null, 4)};`);
        return metaData.join('\n');
    }
    generateTypeDeclaration() {
        return ["import { Schema } from '@aws-amplify/datastore';", '', 'export declare const schema: Schema;'].join('\n');
    }
    generateJSONMetaData() {
        const metaData = this.generateMetaData();
        return JSON.stringify(metaData, null, 4);
    }
    generateMetaData() {
        const result = {
            models: {},
            enums: {},
            version: this.computeVersion(),
        };
        Object.entries(this.getSelectedModels()).forEach(([name, obj]) => {
            const model = {
                syncable: true,
                name: this.getModelName(obj),
                pluralName: this.pluralizeModelName(obj),
                attributes: this.generateModelAttributes(obj),
                fields: obj.fields.reduce((acc, field) => {
                    const fieldMeta = {
                        name: this.getFieldName(field),
                        isArray: field.isList,
                        type: this.getType(field.type),
                        isRequired: !field.isNullable,
                        attributes: [],
                    };
                    const association = this.getFieldAssociation(field);
                    if (association) {
                        fieldMeta.association = association;
                    }
                    acc[this.getFieldName(field)] = fieldMeta;
                    return acc;
                }, {}),
            };
            result.models[obj.name] = model;
        });
        Object.entries(this.enumMap).forEach(([name, enumObj]) => {
            const enumV = {
                name,
                values: Object.values(enumObj.values),
            };
            result.enums[this.getEnumName(enumObj)] = enumV;
        });
        return result;
    }
    getFieldAssociation(field) {
        if (field.connectionInfo) {
            const { connectionInfo } = field;
            const connectionAttribute = { connectionType: connectionInfo.kind };
            if (connectionInfo.kind === process_connections_1.CodeGenConnectionType.HAS_MANY || connectionInfo.kind === process_connections_1.CodeGenConnectionType.HAS_ONE) {
                connectionAttribute.associatedWith = this.getFieldName(connectionInfo.associatedWith);
            }
            else {
                connectionAttribute.targetName = connectionInfo.targetName;
            }
            return connectionAttribute;
        }
    }
    generateModelAttributes(model) {
        return model.directives.map(d => ({
            type: d.name,
            properties: d.arguments,
        }));
    }
    getType(gqlType) {
        // Todo: Handle unlisted scalars
        if (gqlType in scalars_1.METADATA_SCALAR_MAP) {
            return scalars_1.METADATA_SCALAR_MAP[gqlType];
        }
        if (gqlType in this.enumMap) {
            return { enum: this.enumMap[gqlType].name };
        }
        return { model: gqlType };
    }
}
exports.AppSyncJSONVisitor = AppSyncJSONVisitor;
//# sourceMappingURL=appsync-json-metadata-visitor.js.map