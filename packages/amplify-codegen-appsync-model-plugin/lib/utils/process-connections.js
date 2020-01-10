"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const change_case_1 = require("change-case");
var CodeGenConnectionType;
(function (CodeGenConnectionType) {
    CodeGenConnectionType["HAS_ONE"] = "HAS_ONE";
    CodeGenConnectionType["BELONGS_TO"] = "BELONGS_TO";
    CodeGenConnectionType["HAS_MANY"] = "HAS_MANY";
})(CodeGenConnectionType = exports.CodeGenConnectionType || (exports.CodeGenConnectionType = {}));
function getDirective(fieldOrModel) {
    return (directiveName) => {
        return fieldOrModel.directives.find(d => d.name === directiveName);
    };
}
function makeConnectionAttributeName(type, field) {
    // The same logic is used graphql-connection-transformer package to generate association field
    // Make sure the logic gets update in that package
    return field ? change_case_1.camelCase([type, field, 'id'].join('_')) : change_case_1.camelCase([type, 'id'].join('_'));
}
exports.makeConnectionAttributeName = makeConnectionAttributeName;
function getConnectedField(field, model, connectedModel) {
    const connectionInfo = getDirective(field)('connection');
    if (!connectionInfo) {
        throw new Error(`The ${field.name} on model ${model.name} is not connected`);
    }
    const connectionName = connectionInfo.arguments.name;
    const keyName = connectionInfo.arguments.keyName;
    if (keyName) {
        const keyDirective = connectedModel.directives.find(dir => {
            return dir.name === 'key' && dir.arguments.name === keyName;
        });
        if (keyDirective) {
            // when there is a keyName in the connection
            const connectedFieldName = keyDirective.arguments.fields[0];
            // Find a field on the other side which connected by a @connection and has the same fields[0] as keyName field
            const otherSideConnectedField = connectedModel.fields.find(f => {
                return f.directives.find(d => {
                    return d.name === 'connection' && d.arguments.fields && d.arguments.fields[0] === connectedFieldName;
                });
            });
            if (otherSideConnectedField) {
                return otherSideConnectedField;
            }
            // If there are no field with @connection with keyName then try to find a field that has same name as connection name
            const connectedField = connectedModel.fields.find(f => f.name === connectedFieldName);
            if (!connectedField) {
                throw new Error(`Can not find key field ${connectedFieldName} in ${connectedModel}`);
            }
            return connectedField;
        }
    }
    else if (connectionName) {
        // when the connection is named
        const connectedField = connectedModel.fields.find(f => f.directives.find(d => d.name === 'connection' && d.arguments.name === connectionName && f !== field));
        if (!connectedField) {
            throw new Error(`Can not find key field with connection name ${connectionName} in ${connectedModel}`);
        }
        return connectedField;
    }
    // un-named connection. Use an existing field or generate a new field
    const connectedFieldName = makeConnectionAttributeName(model.name, field.name);
    const connectedField = connectedModel.fields.find(f => f.name === connectedFieldName);
    return connectedField
        ? connectedField
        : {
            name: connectedFieldName,
            directives: [],
            type: 'ID',
            isList: false,
            isNullable: true,
        };
}
exports.getConnectedField = getConnectedField;
function processConnections(field, model, modelMap) {
    const connectionDirective = field.directives.find(d => d.name === 'connection');
    if (connectionDirective) {
        const otherSide = modelMap[field.type];
        const connectionFields = connectionDirective.arguments.fields || [];
        const otherSideField = getConnectedField(field, model, otherSide);
        const isNewField = !otherSide.fields.includes(otherSideField);
        if (!isNewField) {
            // 2 way connection
            if (field.isList && !otherSideField.isList) {
                // Many to One
                return {
                    kind: CodeGenConnectionType.HAS_MANY,
                    associatedWith: otherSideField,
                    connectedModel: otherSide,
                };
            }
            else if (!field.isList && otherSideField.isList) {
                //  One to Many
                if (connectionFields.length > 1) {
                    // Todo: Move to a common function and update the error message
                    throw new Error('DataStore only support one key in field');
                }
                return {
                    kind: CodeGenConnectionType.BELONGS_TO,
                    connectedModel: otherSide,
                    targetName: connectionFields[0] || makeConnectionAttributeName(model.name, field.name),
                };
            }
            else if (!field.isList && !otherSideField.isList) {
                // One to One
                //  Data store can only support models where 1:1 connection, one of the connection side should be
                // Non null able to support the foreign key constrain.
                if (!field.isNullable && otherSideField.isNullable) {
                    /*
                    # model
                    type Person { # hasOne
                      license: License;
                    }
                    # otherSide
                    type License { # belongsTo
                      person: Person!
                    }
                    */
                    return {
                        kind: CodeGenConnectionType.BELONGS_TO,
                        connectedModel: otherSide,
                        targetName: connectionFields[0] || makeConnectionAttributeName(model.name, field.name),
                    };
                }
                else if (field.isNullable && !otherSideField.isNullable) {
                    /*
                    # model
                    type License { # belongsTo
                      person: Person!
                    }
                    # otherSide
                    type Person { # hasOne
                      license: License;
                    }
                    */
                    return { kind: CodeGenConnectionType.HAS_ONE, associatedWith: otherSideField, connectedModel: otherSide };
                }
                else {
                    /*
                    # model
                    type License { # belongsTo
                      person: Person!
                    }
                    # otherSide
                    type Person { # hasOne
                      license: License;
                    }
                    */
                    throw new Error('DataStore does not support 1 to 1 connection with both sides of connection as optional field');
                }
            }
        }
        else {
            // one way connection
            if (field.isList) {
                const connectionFieldName = makeConnectionAttributeName(model.name, field.name);
                const existingConnectionField = otherSide.fields.find(f => f.name === connectionFieldName);
                return {
                    kind: CodeGenConnectionType.HAS_MANY,
                    connectedModel: otherSide,
                    associatedWith: existingConnectionField || {
                        name: connectionFieldName,
                        type: 'ID',
                        isList: false,
                        isNullable: true,
                        directives: [],
                    },
                };
            }
            else {
                if (connectionFields.length > 1) {
                    // Todo: Update the message
                    throw new Error('DataStore only support one key in field');
                }
                return {
                    kind: CodeGenConnectionType.BELONGS_TO,
                    connectedModel: otherSide,
                    targetName: connectionFields[0] || makeConnectionAttributeName(model.name, field.name),
                };
            }
        }
    }
}
exports.processConnections = processConnections;
//# sourceMappingURL=process-connections.js.map