"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const amplify_toolkit_1 = require("./amplify-toolkit");
class Context {
    constructor(pluginPlatform, input) {
        this.pluginPlatform = pluginPlatform;
        this.input = input;
        this.amplify = new amplify_toolkit_1.AmplifyToolkit();
    }
}
exports.Context = Context;
//# sourceMappingURL=../../src/lib/domain/context.js.map