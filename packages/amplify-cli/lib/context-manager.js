"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("./domain/context");
const context_extensions_1 = require("./context-extensions");
function constructContext(pluginPlatform, input) {
    const context = new context_1.Context(pluginPlatform, input);
    context_extensions_1.attachExtentions(context);
    return context;
}
exports.constructContext = constructContext;
function persistContext(context) {
    // write to the backend and current backend
    // and get the frontend plugin to write to the config files.
}
exports.persistContext = persistContext;
//# sourceMappingURL=../src/lib/context-manager.js.map