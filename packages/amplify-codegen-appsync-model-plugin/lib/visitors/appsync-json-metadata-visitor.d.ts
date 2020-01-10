import { NormalizedScalarsMap } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLSchema } from 'graphql';
import { CodeGenConnectionType } from '../utils/process-connections';
import { AppSyncModelVisitor, ParsedAppSyncModelConfig, RawAppSyncModelConfig } from './appsync-visitor';
import { METADATA_SCALAR_MAP } from '../scalars';
declare type JSONSchema = {
    models: JSONSchemaModels;
    enums: JSONSchemaEnums;
    version: string;
};
declare type JSONSchemaModels = Record<string, JSONSchemaModel>;
declare type JSONSchemaModel = {
    name: string;
    attributes?: JSONModelAttributes;
    fields: JSONModelFields;
    pluralName: String;
    syncable?: boolean;
};
declare type JSONSchemaEnums = Record<string, JSONSchemaEnum>;
declare type JSONSchemaEnum = {
    name: string;
    values: string[];
};
declare type JSONModelAttributes = JSONModelAttribute[];
declare type JSONModelAttribute = {
    type: string;
    properties?: Record<string, any>;
};
declare type JSONModelFields = Record<string, JSONModelField>;
declare type AssociationBaseType = {
    connectionType: CodeGenConnectionType;
};
declare type AssociationHasMany = AssociationBaseType & {
    connectionType: CodeGenConnectionType.HAS_MANY;
    associatedWith: string;
};
declare type AssociationHasOne = AssociationHasMany & {
    connectionType: CodeGenConnectionType.HAS_ONE;
};
declare type AssociationBelongsTo = AssociationBaseType & {
    targetName: string;
};
declare type AssociationType = AssociationHasMany | AssociationHasOne | AssociationBelongsTo;
declare type JSONModelFieldType = keyof typeof METADATA_SCALAR_MAP | {
    model: string;
} | {
    enum: string;
};
declare type JSONModelField = {
    name: string;
    type: JSONModelFieldType;
    isArray: boolean;
    isRequired?: boolean;
    attributes?: JSONModelFieldAttributes;
    association?: AssociationType;
};
declare type JSONModelFieldAttributes = JSONModelFieldAttribute[];
declare type JSONModelFieldAttribute = JSONModelAttribute;
export interface RawAppSyncModelMetadataConfig extends RawAppSyncModelConfig {
    /**
     * @name metadataTarget
     * @type string
     * @description required, the language target for generated code
     *
     * @example
     * ```yml
     * generates:
     * Models:
     * config:
     *    target: 'metadata'
     *    metadataTarget: 'typescript'
     *  plugins:
     *    - amplify-codegen-appsync-model-plugin
     * ```
     * metadataTarget: 'javascript'| 'typescript' | 'typedeclration'
     */
    metadataTarget?: string;
}
export interface ParsedAppSyncModelMetadataConfig extends ParsedAppSyncModelConfig {
    metadataTarget: string;
}
export declare class AppSyncJSONVisitor<TRawConfig extends RawAppSyncModelMetadataConfig = RawAppSyncModelMetadataConfig, TPluginConfig extends ParsedAppSyncModelMetadataConfig = ParsedAppSyncModelMetadataConfig> extends AppSyncModelVisitor<TRawConfig, TPluginConfig> {
    constructor(schema: GraphQLSchema, rawConfig: TRawConfig, additionalConfig: Partial<TPluginConfig>, defaultScalars?: NormalizedScalarsMap);
    generate(): string;
    protected generateTypeScriptMetaData(): string;
    protected generateJavaScriptMetaData(): string;
    protected generateTypeDeclaration(): string;
    protected generateJSONMetaData(): string;
    protected generateMetaData(): JSONSchema;
    private getFieldAssociation;
    private generateModelAttributes;
    private getType;
}
export {};
//# sourceMappingURL=appsync-json-metadata-visitor.d.ts.map