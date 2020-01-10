"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const visitor_plugin_common_1 = require("@graphql-codegen/visitor-plugin-common");
const change_case_1 = require("change-case");
const ts_dedent_1 = __importDefault(require("ts-dedent"));
const java_config_1 = require("../configs/java-config");
const java_declaration_block_1 = require("../languages/java-declaration-block");
const appsync_visitor_1 = require("./appsync-visitor");
const process_connections_1 = require("../utils/process-connections");
class AppSyncModelJavaVisitor extends appsync_visitor_1.AppSyncModelVisitor {
    constructor() {
        super(...arguments);
        this.additionalPackages = new Set();
    }
    generate() {
        this.processDirectives();
        if (this._parsedConfig.generate === 'loader') {
            return this.generateClassLoader();
        }
        if (this.selectedTypeIsEnum()) {
            return this.generateEnums();
        }
        return this.generateClasses();
    }
    generateClassLoader() {
        const AMPLIFY_MODEL_VERSION = 'AMPLIFY_MODEL_VERSION';
        const result = [this.generatePackageName(), '', this.generateImportStatements(java_config_1.LOADER_IMPORT_PACKAGES)];
        result.push(visitor_plugin_common_1.transformComment(ts_dedent_1.default ` Contains the set of model classes that implement {@link Model}
    interface.`));
        const loaderClassDeclaration = new java_declaration_block_1.JavaDeclarationBlock()
            .withName(java_config_1.LOADER_CLASS_NAME)
            .access('public')
            .final()
            .asKind('class')
            .implements(['ModelProvider']);
        // Schema version
        // private static final String AMPLIFY_MODELS_VERSION = "hash-code";
        loaderClassDeclaration.addClassMember(AMPLIFY_MODEL_VERSION, 'String', `"${this.computeVersion()}"`, [], 'private', {
            final: true,
            static: true,
        });
        // singleton instance
        // private static AmplifyCliGeneratedModelProvider amplifyCliGeneratedModelStoreInstance;
        loaderClassDeclaration.addClassMember('amplifyGeneratedModelInstance', java_config_1.LOADER_CLASS_NAME, '', [], 'private', { static: true });
        // private constructor for singleton
        loaderClassDeclaration.addClassMethod(java_config_1.LOADER_CLASS_NAME, null, '', [], [], 'private');
        // getInstance
        const getInstanceBody = ts_dedent_1.default `
    if (amplifyGeneratedModelInstance == null) {
      amplifyGeneratedModelInstance = new ${java_config_1.LOADER_CLASS_NAME}();
    }
    return amplifyGeneratedModelInstance;`;
        loaderClassDeclaration.addClassMethod('getInstance', java_config_1.LOADER_CLASS_NAME, getInstanceBody, [], [], 'public', {
            static: true,
            synchronized: true,
        });
        // models method
        const modelsMethodDocString = ts_dedent_1.default `
    Get a set of the model classes.

    @return a set of the model classes.`;
        const classList = Object.values(this.typeMap)
            .map(model => `${this.getModelName(model)}.class`)
            .join(', ');
        const modelsMethodImplementation = `final Set<Class<? extends Model>> modifiableSet = new HashSet<>(
      Arrays.<Class<? extends Model>>asList(${classList})
    );

    return Immutable.of(modifiableSet);
    `;
        loaderClassDeclaration.addClassMethod('models', 'Set<Class<? extends Model>>', modelsMethodImplementation, [], [], 'public', {}, ['Override'], undefined, modelsMethodDocString);
        // version method
        const versionMethodDocString = ts_dedent_1.default `
    Get the version of the models.

    @return the version string of the models.
    `;
        loaderClassDeclaration.addClassMethod('version', 'String', `return ${AMPLIFY_MODEL_VERSION};`, [], [], 'public', {}, ['Override'], undefined, versionMethodDocString);
        result.push(loaderClassDeclaration.string);
        return result.join('\n');
    }
    generateEnums() {
        const result = [this.generatePackageName()];
        Object.entries(this.getSelectedEnums()).forEach(([name, enumValue]) => {
            const enumDeclaration = new java_declaration_block_1.JavaDeclarationBlock()
                .asKind('enum')
                .access('public')
                .withName(this.getEnumName(enumValue))
                .annotate(['SuppressWarnings("all")'])
                .withComment('Auto generated enum from GraphQL schema.');
            const body = Object.values(enumValue.values);
            enumDeclaration.withBlock(visitor_plugin_common_1.indentMultiline(body.join(',\n')));
            result.push(enumDeclaration.string);
        });
        return result.join('\n');
    }
    generateClasses() {
        const result = [];
        Object.entries(this.getSelectedModels()).forEach(([name, model]) => {
            const modelDeclaration = this.generateClass(model);
            result.push(...[modelDeclaration]);
        });
        const packageDeclaration = this.generatePackageHeader();
        return [packageDeclaration, ...result].join('\n');
    }
    generatePackageName() {
        return `package ${java_config_1.GENERATED_PACKAGE_NAME};`;
    }
    generateClass(model) {
        const classDeclarationBlock = new java_declaration_block_1.JavaDeclarationBlock()
            .asKind('class')
            .access('public')
            .withName(this.getModelName(model))
            .implements(['Model'])
            .withComment(`This is an auto generated class representing the ${model.name} type in your schema.`)
            .final();
        const annotations = this.generateModelAnnotations(model);
        classDeclarationBlock.annotate(annotations);
        const nonConnectedFields = this.getNonConnectedField(model);
        nonConnectedFields.forEach(field => this.generateQueryFields(field, classDeclarationBlock));
        model.fields.forEach(field => {
            const value = nonConnectedFields.includes(field) ? '' : 'null';
            this.generateField(field, value, classDeclarationBlock);
        });
        // step interface declarations
        this.generateStepBuilderInterfaces(model).forEach((builderInterface) => {
            classDeclarationBlock.nestedClass(builderInterface);
        });
        // builder
        this.generateBuilderClass(model, classDeclarationBlock);
        // copyOfBuilder for used for updating existing instance
        this.generateCopyOfBuilderClass(model, classDeclarationBlock);
        // getters
        this.generateGetters(model, classDeclarationBlock);
        // constructor
        this.generateConstructor(model, classDeclarationBlock);
        // equals
        this.generateEqualsMethod(model, classDeclarationBlock);
        // hash code
        this.generateHashCodeMethod(model, classDeclarationBlock);
        // builder
        this.generateBuilderMethod(model, classDeclarationBlock);
        // justId method
        this.generateJustIdMethod(model, classDeclarationBlock);
        // copyBuilder method
        this.generateCopyOfBuilderMethod(model, classDeclarationBlock);
        return classDeclarationBlock.string;
    }
    generatePackageHeader() {
        const imports = this.generateImportStatements([...Array.from(this.additionalPackages), '', ...java_config_1.CLASS_IMPORT_PACKAGES]);
        return [this.generatePackageName(), '', imports].join('\n');
    }
    /**
     * generate import statements.
     * @param packages
     *
     * @returns string
     */
    generateImportStatements(packages) {
        return packages.map(pkg => (pkg ? `import ${pkg};` : '')).join('\n');
    }
    /**
     * Add query field used for construction of conditions by SyncEngine
     */
    generateQueryFields(field, classDeclarationBlock) {
        const queryFieldName = change_case_1.constantCase(field.name);
        // belongsTo field is computed field. the value needed to query the field is in targetName
        const fieldName = field.connectionInfo && field.connectionInfo.kind === process_connections_1.CodeGenConnectionType.BELONGS_TO
            ? field.connectionInfo.targetName
            : this.getFieldName(field);
        classDeclarationBlock.addClassMember(queryFieldName, 'QueryField', `field("${fieldName}")`, [], 'public', {
            final: true,
            static: true,
        });
    }
    /**
     * Add fields as members of the class
     * @param field
     * @param classDeclarationBlock
     */
    generateField(field, value, classDeclarationBlock) {
        const annotations = this.generateFieldAnnotations(field);
        const fieldType = this.getNativeType(field);
        const fieldName = this.getFieldName(field);
        classDeclarationBlock.addClassMember(fieldName, fieldType, value, annotations, 'private', {
            final: true,
        });
    }
    /**
     * Generate step builder interfaces for each non-null field in the model
     *
     */
    generateStepBuilderInterfaces(model) {
        const nonNullableFields = this.getNonConnectedField(model).filter(field => !field.isNullable);
        const nullableFields = this.getNonConnectedField(model).filter(field => field.isNullable);
        const requiredInterfaces = nonNullableFields.filter((field) => !this.READ_ONLY_FIELDS.includes(field.name));
        const interfaces = requiredInterfaces.map((field, idx) => {
            const isLastField = requiredInterfaces.length - 1 === idx ? true : false;
            const returnType = isLastField ? 'Build' : requiredInterfaces[idx + 1].name;
            const interfaceName = this.getStepInterfaceName(field.name);
            const methodName = this.getStepFunctionName(field);
            const argumentType = this.getNativeType(field);
            const argumentName = this.getStepFunctionArgumentName(field);
            const interfaceDeclaration = new java_declaration_block_1.JavaDeclarationBlock()
                .asKind('interface')
                .withName(interfaceName)
                .access('public');
            interfaceDeclaration.withBlock(visitor_plugin_common_1.indent(`${this.getStepInterfaceName(returnType)} ${methodName}(${argumentType} ${argumentName});`));
            return interfaceDeclaration;
        });
        // Builder
        const builder = new java_declaration_block_1.JavaDeclarationBlock()
            .asKind('interface')
            .withName(this.getStepInterfaceName('Build'))
            .access('public');
        const builderBody = [];
        // build method
        builderBody.push(`${this.getModelName(model)} build();`);
        // id method. Special case as this can throw exception
        builderBody.push(`${this.getStepInterfaceName('Build')} id(String id) throws IllegalArgumentException;`);
        nullableFields.forEach(field => {
            const fieldName = this.getFieldName(field);
            builderBody.push(`${this.getStepInterfaceName('Build')} ${fieldName}(${this.getNativeType(field)} ${fieldName});`);
        });
        builder.withBlock(visitor_plugin_common_1.indentMultiline(builderBody.join('\n')));
        return [...interfaces, builder];
    }
    /**
     * Generate the Builder class
     * @param model
     * @returns JavaDeclarationBlock
     */
    generateBuilderClass(model, classDeclaration) {
        const nonNullableFields = this.getNonConnectedField(model).filter(field => !field.isNullable);
        const nullableFields = this.getNonConnectedField(model).filter(field => field.isNullable);
        const stepFields = nonNullableFields.filter((field) => !this.READ_ONLY_FIELDS.includes(field.name));
        const stepInterfaces = stepFields.map((field) => {
            return this.getStepInterfaceName(field.name);
        });
        const builderClassDeclaration = new java_declaration_block_1.JavaDeclarationBlock()
            .access('public')
            .static()
            .asKind('class')
            .withName('Builder')
            .implements([...stepInterfaces, this.getStepInterfaceName('Build')]);
        // Add private instance fields
        [...nonNullableFields, ...nullableFields].forEach((field) => {
            const fieldName = this.getFieldName(field);
            builderClassDeclaration.addClassMember(fieldName, this.getNativeType(field), '', undefined, 'private');
        });
        // methods
        // build();
        const buildImplementation = [`String id = this.id != null ? this.id : UUID.randomUUID().toString();`, ''];
        const buildParams = this.getNonConnectedField(model)
            .map(field => this.getFieldName(field))
            .join(',\n');
        buildImplementation.push(`return new ${this.getModelName(model)}(\n${visitor_plugin_common_1.indentMultiline(buildParams)});`);
        builderClassDeclaration.addClassMethod('build', this.getModelName(model), visitor_plugin_common_1.indentMultiline(buildImplementation.join('\n')), undefined, [], 'public', {}, ['Override']);
        // non-nullable fields
        stepFields.forEach((field, idx, fields) => {
            const isLastStep = idx === fields.length - 1;
            const fieldName = this.getFieldName(field);
            const methodName = this.getStepFunctionName(field);
            const returnType = isLastStep ? this.getStepInterfaceName('Build') : this.getStepInterfaceName(fields[idx + 1].name);
            const argumentType = this.getNativeType(field);
            const argumentName = this.getStepFunctionArgumentName(field);
            const body = [`Objects.requireNonNull(${argumentName});`, `this.${fieldName} = ${argumentName};`, `return this;`].join('\n');
            builderClassDeclaration.addClassMethod(methodName, returnType, visitor_plugin_common_1.indentMultiline(body), [{ name: argumentName, type: argumentType }], [], 'public', {}, ['Override']);
        });
        // nullable fields
        nullableFields.forEach((field) => {
            const fieldName = this.getFieldName(field);
            const methodName = this.getStepFunctionName(field);
            const returnType = this.getStepInterfaceName('Build');
            const argumentType = this.getNativeType(field);
            const argumentName = this.getStepFunctionArgumentName(field);
            const body = [`this.${fieldName} = ${argumentName};`, `return this;`].join('\n');
            builderClassDeclaration.addClassMethod(methodName, returnType, visitor_plugin_common_1.indentMultiline(body), [{ name: argumentName, type: argumentType }], [], 'public', {}, ['Override']);
        });
        // Add id builder
        const idBuildStepBody = ts_dedent_1.default `this.id = id;

    try {
        UUID.fromString(id); // Check that ID is in the UUID format - if not an exception is thrown
    } catch (Exception exception) {
      throw new IllegalArgumentException("Model IDs must be unique in the format of UUID.",
                exception);
    }

    return this;`;
        const idComment = ts_dedent_1.default `WARNING: Do not set ID when creating a new object. Leave this blank and one will be auto generated for you.
    This should only be set when referring to an already existing object.
    @param id id
    @return Current Builder instance, for fluent method chaining
    @throws IllegalArgumentException Checks that ID is in the proper format`;
        builderClassDeclaration.addClassMethod('id', this.getStepInterfaceName('Build'), visitor_plugin_common_1.indentMultiline(idBuildStepBody), [{ name: 'id', type: 'String' }], [], 'public', {}, [], ['IllegalArgumentException'], idComment);
        classDeclaration.nestedClass(builderClassDeclaration);
    }
    /**
     * * Generate a CopyOfBuilder class that will be used to create copy of the current model.
     * This is needed to mutate the object as all the generated models are immuteable and can
     * be update only by creating a new instance using copyOfBuilder
     * @param model
     * @param classDeclaration
     */
    generateCopyOfBuilderClass(model, classDeclaration) {
        const builderName = 'CopyOfBuilder';
        const copyOfBuilderClassDeclaration = new java_declaration_block_1.JavaDeclarationBlock()
            .access('public')
            .final()
            .asKind('class')
            .withName(builderName)
            .extends(['Builder']);
        const nonNullableFields = this.getNonConnectedField(model)
            .filter(field => !field.isNullable)
            .filter(f => f.name !== 'id');
        const nullableFields = this.getNonConnectedField(model).filter(field => field.isNullable);
        // constructor
        const constructorArguments = this.getNonConnectedField(model).map(field => {
            return { name: this.getStepFunctionArgumentName(field), type: this.getNativeType(field) };
        });
        const stepBuilderInvocation = [...nonNullableFields, ...nullableFields].map(field => {
            const methodName = this.getStepFunctionName(field);
            const argumentName = this.getStepFunctionArgumentName(field);
            return `.${methodName}(${argumentName})`;
        });
        const invocations = ['super', visitor_plugin_common_1.indentMultiline(stepBuilderInvocation.join('\n')).trim(), ';'].join('');
        const body = ['super.id(id);', invocations].join('\n');
        copyOfBuilderClassDeclaration.addClassMethod(builderName, null, body, constructorArguments, [], 'private');
        // Non-nullable field setters need to be added to NewClass as this is not a step builder
        [...nonNullableFields, ...nullableFields].forEach(field => {
            const methodName = this.getStepFunctionName(field);
            const argumentName = this.getStepFunctionArgumentName(field);
            const argumentType = this.getNativeType(field);
            const implementation = `return (${builderName}) super.${methodName}(${argumentName});`;
            copyOfBuilderClassDeclaration.addClassMethod(methodName, builderName, implementation, [
                {
                    name: argumentName,
                    type: argumentType,
                },
            ], [], 'public', {}, ['Override']);
        });
        classDeclaration.nestedClass(copyOfBuilderClassDeclaration);
    }
    /**
     * adds a copyOfBuilder method to the Model class. This method is used to create a copy of the model to mutate it
     */
    generateCopyOfBuilderMethod(model, classDeclaration) {
        const args = visitor_plugin_common_1.indentMultiline(this.getNonConnectedField(model)
            .map(field => this.getFieldName(field))
            .join(',\n')).trim();
        const methodBody = `return new CopyOfBuilder(${args});`;
        classDeclaration.addClassMethod('copyOfBuilder', 'CopyOfBuilder', methodBody, [], [], 'public');
    }
    /**
     * Generate getters for all the fields declared in the model. All the getter methods are added
     * to the declaration block passed
     * @param model
     * @param declarationsBlock
     */
    generateGetters(model, declarationsBlock) {
        model.fields.forEach((field) => {
            const fieldName = this.getFieldName(field);
            const returnType = this.getNativeType(field);
            const methodName = this.getFieldGetterName(field);
            const body = visitor_plugin_common_1.indent(`return ${fieldName};`);
            declarationsBlock.addClassMethod(methodName, returnType, body, undefined, undefined, 'public');
        });
    }
    /**
     * Generate Java field getter name
     * @param field codegen field
     */
    getFieldGetterName(field) {
        return `get${change_case_1.pascalCase(field.name)}`;
    }
    /**
     * generates the method name used in step builder
     * @param field
     */
    getStepFunctionName(field) {
        return change_case_1.camelCase(field.name);
    }
    /**
     * generates Step function argument
     * @param field
     */
    getStepFunctionArgumentName(field) {
        return change_case_1.camelCase(field.name);
    }
    /**
     * Generate constructor for the class
     * @param model CodeGenModel
     * @param declarationsBlock Class Declaration block to which constructor will be added
     */
    generateConstructor(model, declarationsBlock) {
        const name = this.getModelName(model);
        const body = this.getNonConnectedField(model)
            .map((field) => {
            const fieldName = this.getFieldName(field);
            return `this.${fieldName} = ${fieldName};`;
        })
            .join('\n');
        const constructorArguments = this.getNonConnectedField(model).map(field => {
            return { name: this.getFieldName(field), type: this.getNativeType(field) };
        });
        declarationsBlock.addClassMethod(name, null, body, constructorArguments, undefined, 'private');
    }
    getNativeType(field) {
        const nativeType = super.getNativeType(field);
        if (nativeType.includes('.')) {
            const classSplit = nativeType.split('.');
            this.additionalPackages.add(nativeType);
            return classSplit[classSplit.length - 1];
        }
        return nativeType;
    }
    /**
     * Generate code for equals method
     * @param model
     * @param declarationBlock
     */
    generateEqualsMethod(model, declarationBlock) {
        const paramName = 'obj';
        const className = this.getModelName(model);
        const instanceName = change_case_1.camelCase(model.name);
        const body = [
            `if (this == ${paramName}) {`,
            '  return true;',
            `} else if(${paramName} == null || getClass() != ${paramName}.getClass()) {`,
            '  return false;',
            '} else {',
        ];
        body.push(`${className} ${instanceName} = (${className}) ${paramName};`);
        const propCheck = visitor_plugin_common_1.indentMultiline(this.getNonConnectedField(model)
            .map(field => {
            const getterName = this.getFieldGetterName(field);
            return `ObjectsCompat.equals(${getterName}(), ${instanceName}.${getterName}())`;
        })
            .join(' &&\n'), 4).trim();
        body.push(`return ${propCheck};`);
        body.push('}');
        declarationBlock.addClassMethod('equals', 'boolean', visitor_plugin_common_1.indentMultiline(body.join('\n')), [{ name: paramName, type: 'Object' }], [], 'public', {}, ['Override']);
    }
    generateHashCodeMethod(model, declarationBlock) {
        const body = [
            'return new StringBuilder()',
            ...this.getNonConnectedField(model).map(field => `.append(${this.getFieldGetterName(field)}())`),
            '.toString()',
            '.hashCode();',
        ].join('\n');
        declarationBlock.addClassMethod('hashCode', 'int', visitor_plugin_common_1.indentMultiline(body).trimLeft(), [], [], 'public', {}, ['Override']);
    }
    /**
     * Generate the builder method to get an instance of Builder class
     * @param model
     * @param classDeclaration
     */
    generateBuilderMethod(model, classDeclaration) {
        const requiredFields = this.getNonConnectedField(model).filter(field => !field.isNullable && !this.READ_ONLY_FIELDS.includes(field.name));
        const returnType = requiredFields.length ? this.getStepInterfaceName(requiredFields[0].name) : this.getStepInterfaceName('Build');
        classDeclaration.addClassMethod('builder', returnType, visitor_plugin_common_1.indentMultiline(`return new Builder();`), [], [], 'public', { static: true }, []);
    }
    /**
     * Generate the name of the step builder interface
     * @param nextFieldName: string
     * @returns string
     */
    getStepInterfaceName(nextFieldName) {
        return `${change_case_1.pascalCase(nextFieldName)}Step`;
    }
    generateModelAnnotations(model) {
        const annotations = model.directives.map(directive => {
            switch (directive.name) {
                case 'model':
                    return `ModelConfig(pluralName = "${this.pluralizeModelName(model)}")`;
                    break;
                case 'key':
                    const args = [];
                    args.push(`name = "${directive.arguments.name}"`);
                    args.push(`fields = {${directive.arguments.fields.map((f) => `"${f}"`).join(',')}}`);
                    return `Index(${args.join(', ')})`;
                default:
                    break;
            }
            return '';
        });
        return ['SuppressWarnings("all")', ...annotations].filter(annotation => annotation);
    }
    generateFieldAnnotations(field) {
        const annotations = [];
        annotations.push(this.generateModelFieldAnnotation(field));
        annotations.push(this.generateConnectionAnnotation(field));
        return annotations.filter(annotation => annotation);
    }
    generateModelFieldAnnotation(field) {
        const annotationArgs = [`targetType="${field.type}"`, !field.isNullable ? 'isRequired = true' : ''].filter(arg => arg);
        return `ModelField(${annotationArgs.join(', ')})`;
    }
    generateConnectionAnnotation(field) {
        if (!field.connectionInfo)
            return '';
        const { connectionInfo } = field;
        // Add annotation to import
        this.additionalPackages.add(java_config_1.CONNECTION_RELATIONSHIP_IMPORTS[connectionInfo.kind]);
        let connectionDirectiveName = '';
        const connectionArguments = [];
        switch (connectionInfo.kind) {
            case process_connections_1.CodeGenConnectionType.HAS_ONE:
                connectionDirectiveName = 'HasOne';
                connectionArguments.push(`associatedWith = "${this.getFieldName(connectionInfo.associatedWith)}"`);
                break;
            case process_connections_1.CodeGenConnectionType.HAS_MANY:
                connectionDirectiveName = 'HasMany';
                connectionArguments.push(`associatedWith = "${this.getFieldName(connectionInfo.associatedWith)}"`);
                break;
            case process_connections_1.CodeGenConnectionType.BELONGS_TO:
                connectionDirectiveName = 'BelongsTo';
                connectionArguments.push(`targetName = "${connectionInfo.targetName}"`);
                break;
        }
        connectionArguments.push(`type = ${this.getModelName(connectionInfo.connectedModel)}.class`);
        return `${connectionDirectiveName}${connectionArguments.length ? `(${connectionArguments.join(', ')})` : ''}`;
    }
    generateJustIdMethod(model, classDeclaration) {
        const returnType = this.getModelName(model);
        const comment = ts_dedent_1.default `WARNING: This method should not be used to build an instance of this object for a CREATE mutation.
        This is a convenience method to return an instance of the object with only its ID populated
        to be used in the context of a parameter in a delete mutation or referencing a foreign key
        in a relationship.
        @param id the id of the existing item this instance will represent
        @return an instance of this model with only ID populated
        @throws IllegalArgumentException Checks that ID is in the proper format`;
        const exceptionBlock = ts_dedent_1.default `
    try {
      UUID.fromString(id); // Check that ID is in the UUID format - if not an exception is thrown
    } catch (Exception exception) {
      throw new IllegalArgumentException(
              "Model IDs must be unique in the format of UUID. This method is for creating instances " +
              "of an existing object with only its ID field for sending as a mutation parameter. When " +
              "creating a new object, use the standard builder method and leave the ID field blank."
      );
    }`;
        const initArgs = visitor_plugin_common_1.indentMultiline(['id', ...new Array(this.getNonConnectedField(model).length - 1).fill('null')].join(',\n'));
        const initBlock = `return new ${returnType}(\n${initArgs}\n);`;
        classDeclaration.addClassMethod('justId', returnType, [exceptionBlock, initBlock].join('\n'), [{ name: 'id', type: 'String' }], [], 'public', { static: true }, [], [], comment);
    }
    /**
     * Get the list of fields that can be are writeable. These fields should exclude the following
     * fields that are connected and are either HAS_ONE or HAS_MANY
     * @param model
     */
    getNonConnectedField(model) {
        return model.fields.filter(f => {
            if (!f.connectionInfo)
                return true;
            if (f.connectionInfo.kind == process_connections_1.CodeGenConnectionType.BELONGS_TO) {
                return true;
            }
        });
    }
}
exports.AppSyncModelJavaVisitor = AppSyncModelJavaVisitor;
//# sourceMappingURL=appsync-java-visitor.js.map