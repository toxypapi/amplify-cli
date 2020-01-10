import { SwiftDeclarationBlock } from '../languages/swift-declaration-block';
import { AppSyncModelVisitor, CodeGenField, CodeGenModel } from './appsync-visitor';
export declare class AppSyncSwiftVisitor extends AppSyncModelVisitor {
    protected modelExtensionImports: string[];
    protected imports: string[];
    generate(): string;
    generateStruct(): string;
    generateEnums(): string;
    generateSchema(): string;
    generateCodingKeys(name: string, model: CodeGenModel, extensionDeclaration: SwiftDeclarationBlock): void;
    generateModelSchema(name: string, model: CodeGenModel, extensionDeclaration: SwiftDeclarationBlock): void;
    protected generateClassLoader(): string;
    private getInitBody;
    protected getListType(typeStr: string, field: CodeGenField): string;
    private generateFieldSchema;
    private getSwiftModelTypeName;
    protected getEnumValue(value: string): string;
    /**
     * checks if a field is required or optional field
     * There is a special case for fields which have hasMany connection
     * Swift needs to unwrap the object and when its possible that a hasMany field may not
     * be in the graphql selection set which means its null/undefined. To handle this
     * the struct needs the field to be optional even when the field is required in GraphQL schema
     * @param field field
     */
    protected isFieldRequired(field: CodeGenField): boolean;
}
//# sourceMappingURL=appsync-swift-visitor.d.ts.map