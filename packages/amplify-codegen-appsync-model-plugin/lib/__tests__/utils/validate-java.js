"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const java_ast_1 = require("java-ast");
function validateJava(content) {
    const originalErr = console['error'];
    const collectedErrors = [];
    console['error'] = (errorStr) => {
        collectedErrors.push(errorStr);
    };
    java_ast_1.parse(content);
    console['error'] = originalErr;
    if (collectedErrors.length > 0) {
        const mergedErrors = collectedErrors.join('\n');
        throw new Error(`Invalid Java code:\n${mergedErrors}`);
    }
}
exports.validateJava = validateJava;
//# sourceMappingURL=validate-java.js.map