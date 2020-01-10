import { JavaDeclarationBlock } from '../languages/java-declaration-block';
import { AppSyncModelVisitor, CodeGenField, CodeGenModel, ParsedAppSyncModelConfig, RawAppSyncModelConfig } from './appsync-visitor';
export declare class AppSyncModelJavaVisitor<TRawConfig extends RawAppSyncModelConfig = RawAppSyncModelConfig, TPluginConfig extends ParsedAppSyncModelConfig = ParsedAppSyncModelConfig> extends AppSyncModelVisitor<TRawConfig, TPluginConfig> {
    protected additionalPackages: Set<string>;
    generate(): string;
    generateClassLoader(): string;
    generateEnums(): string;
    generateClasses(): string;
    generatePackageName(): string;
    generateClass(model: CodeGenModel): string;
    protected generatePackageHeader(): string;
    /**
     * generate import statements.
     * @param packages
     *
     * @returns string
     */
    protected generateImportStatements(packages: string[]): string;
    /**
     * Add query field used for construction of conditions by SyncEngine
     */
    protected generateQueryFields(field: CodeGenField, classDeclarationBlock: JavaDeclarationBlock): void;
    /**
     * Add fields as members of the class
     * @param field
     * @param classDeclarationBlock
     */
    protected generateField(field: CodeGenField, value: string, classDeclarationBlock: JavaDeclarationBlock): void;
    /**
     * Generate step builder interfaces for each non-null field in the model
     *
     */
    protected generateStepBuilderInterfaces(model: CodeGenModel): JavaDeclarationBlock[];
    /**
     * Generate the Builder class
     * @param model
     * @returns JavaDeclarationBlock
     */
    protected generateBuilderClass(model: CodeGenModel, classDeclaration: JavaDeclarationBlock): void;
    /**
     * * Generate a CopyOfBuilder class that will be used to create copy of the current model.
     * This is needed to mutate the object as all the generated models are immuteable and can
     * be update only by creating a new instance using copyOfBuilder
     * @param model
     * @param classDeclaration
     */
    protected generateCopyOfBuilderClass(model: CodeGenModel, classDeclaration: JavaDeclarationBlock): void;
    /**
     * adds a copyOfBuilder method to the Model class. This method is used to create a copy of the model to mutate it
     */
    protected generateCopyOfBuilderMethod(model: CodeGenModel, classDeclaration: JavaDeclarationBlock): void;
    /**
     * Generate getters for all the fields declared in the model. All the getter methods are added
     * to the declaration block passed
     * @param model
     * @param declarationsBlock
     */
    protected generateGetters(model: CodeGenModel, declarationsBlock: JavaDeclarationBlock): void;
    /**
     * Generate Java field getter name
     * @param field codegen field
     */
    protected getFieldGetterName(field: CodeGenField): string;
    /**
     * generates the method name used in step builder
     * @param field
     */
    protected getStepFunctionName(field: CodeGenField): string;
    /**
     * generates Step function argument
     * @param field
     */
    protected getStepFunctionArgumentName(field: CodeGenField): string;
    /**
     * Generate constructor for the class
     * @param model CodeGenModel
     * @param declarationsBlock Class Declaration block to which constructor will be added
     */
    protected generateConstructor(model: CodeGenModel, declarationsBlock: JavaDeclarationBlock): void;
    protected getNativeType(field: CodeGenField): string;
    /**
     * Generate code for equals method
     * @param model
     * @param declarationBlock
     */
    protected generateEqualsMethod(model: CodeGenModel, declarationBlock: JavaDeclarationBlock): void;
    protected generateHashCodeMethod(model: CodeGenModel, declarationBlock: JavaDeclarationBlock): void;
    /**
     * Generate the builder method to get an instance of Builder class
     * @param model
     * @param classDeclaration
     */
    protected generateBuilderMethod(model: CodeGenModel, classDeclaration: JavaDeclarationBlock): void;
    /**
     * Generate the name of the step builder interface
     * @param nextFieldName: string
     * @returns string
     */
    private getStepInterfaceName;
    protected generateModelAnnotations(model: CodeGenModel): string[];
    protected generateFieldAnnotations(field: CodeGenField): string[];
    protected generateModelFieldAnnotation(field: CodeGenField): string;
    protected generateConnectionAnnotation(field: CodeGenField): string;
    protected generateJustIdMethod(model: CodeGenModel, classDeclaration: JavaDeclarationBlock): void;
    /**
     * Get the list of fields that can be are writeable. These fields should exclude the following
     * fields that are connected and are either HAS_ONE or HAS_MANY
     * @param model
     */
    protected getNonConnectedField(model: CodeGenModel): CodeGenField[];
}
//# sourceMappingURL=appsync-java-visitor.d.ts.map