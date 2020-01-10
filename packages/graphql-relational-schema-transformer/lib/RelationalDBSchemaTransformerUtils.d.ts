import { ObjectTypeDefinitionNode, NonNullTypeNode, DirectiveNode, NameNode, OperationTypeNode, FieldDefinitionNode, NamedTypeNode, InputValueDefinitionNode, ValueNode, OperationTypeDefinitionNode, ArgumentNode, ListValueNode, StringValueNode, InputObjectTypeDefinitionNode } from 'graphql';
/**
 * Creates a non-null type, which is a node wrapped around another type that simply defines it is non-nullable.
 *
 * @param typeNode the type to be marked as non-nullable.
 * @returns a non-null wrapper around the provided type.
 */
export declare function getNonNullType(typeNode: NamedTypeNode): NonNullTypeNode;
/**
 * Creates a named type for the schema.
 *
 * @param name the name of the type.
 * @returns a named type with the provided name.
 */
export declare function getNamedType(name: string): NamedTypeNode;
/**
 * Creates an input value definition for the schema.
 *
 * @param typeNode the type of the input node.
 * @param name the name of the input.
 * @returns an input value definition node with the provided type and name.
 */
export declare function getInputValueDefinition(typeNode: NamedTypeNode | NonNullTypeNode, name: string): InputValueDefinitionNode;
/**
 * Creates an operation field definition for the schema.
 *
 * @param name the name of the operation.
 * @param args the arguments for the operation.
 * @param type the type of the operation.
 * @param directives the directives (if any) applied to this field. In this context, only subscriptions will have this.
 * @returns an operation field definition with the provided name, args, type, and optionally directives.
 */
export declare function getOperationFieldDefinition(name: string, args: InputValueDefinitionNode[], type: NamedTypeNode, directives: ReadonlyArray<DirectiveNode>): FieldDefinitionNode;
/**
 * Creates a field definition node for the schema.
 *
 * @param fieldName the name of the field to be created.
 * @param type the type of the field to be created.
 * @returns a field definition node with the provided name and type.
 */
export declare function getFieldDefinition(fieldName: string, type: NonNullTypeNode | NamedTypeNode): FieldDefinitionNode;
/**
 * Creates a type definition node for the schema.
 *
 * @param fields the field set to be included in the type.
 * @param typeName the name of the type.
 * @returns a type definition node defined by the provided fields and name.
 */
export declare function getTypeDefinition(fields: ReadonlyArray<FieldDefinitionNode>, typeName: string): ObjectTypeDefinitionNode;
/**
 * Creates an input type definition node for the schema.
 *
 * @param fields the fields in the input type.
 * @param typeName the name of the input type
 * @returns an input type definition node defined by the provided fields and
 */
export declare function getInputTypeDefinition(fields: ReadonlyArray<InputValueDefinitionNode>, typeName: string): InputObjectTypeDefinitionNode;
/**
 * Creates a name node for the schema.
 *
 * @param name the name of the name node.
 * @returns the name node defined by the provided name.
 */
export declare function getNameNode(name: string): NameNode;
/**
 * Creates a list value node for the schema.
 *
 * @param values the list of values to be in the list node.
 * @returns a list value node containing the provided values.
 */
export declare function getListValueNode(values: ReadonlyArray<ValueNode>): ListValueNode;
/**
 * Creates a simple string value node for the schema.
 *
 * @param value the value to be set in the string value node.
 * @returns a fleshed-out string value node.
 */
export declare function getStringValueNode(value: string): StringValueNode;
/**
 * Creates a directive node for a subscription in the schema.
 *
 * @param mutationName the name of the mutation the subscription directive is for.
 * @returns a directive node defining the subscription.
 */
export declare function getDirectiveNode(mutationName: string): DirectiveNode;
/**
 * Creates an operation type definition (subscription, query, mutation) for the schema.
 *
 * @param operationType the type node defining the operation type.
 * @param operation  the named type node defining the operation type.
 */
export declare function getOperationTypeDefinition(operationType: OperationTypeNode, operation: NamedTypeNode): OperationTypeDefinitionNode;
/**
 * Creates an argument node for a subscription directive within the schema.
 *
 * @param argument the argument string.
 * @returns the argument node.
 */
export declare function getArgumentNode(argument: string): ArgumentNode;
/**
 * Given the DB type for a column, make a best effort to select the appropriate GraphQL type for
 * the corresponding field.
 *
 * @param dbType the SQL column type.
 * @returns the GraphQL field type.
 */
export declare function getGraphQLTypeFromMySQLType(dbType: string): string;
