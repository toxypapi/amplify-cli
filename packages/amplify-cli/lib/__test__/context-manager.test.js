"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const input_1 = require("../domain/input");
const plugin_platform_1 = require("../domain/plugin-platform");
const context_manager_1 = require("../context-manager");
test('constructContext', () => {
    const mockProcessArgv = [
        '/Users/userName/.nvm/versions/node/v8.11.4/bin/node',
        '/Users/userName/.nvm/versions/node/v8.11.4/bin/amplify',
        'status',
    ];
    const mockPluginPlatform = new plugin_platform_1.PluginPlatform();
    const mockInput = new input_1.Input(mockProcessArgv);
    const context = context_manager_1.constructContext(mockPluginPlatform, mockInput);
    expect(context).toBeDefined();
    expect(context.amplify).toBeDefined();
    expect(context.pluginPlatform).toEqual(mockPluginPlatform);
    expect(context.input).toEqual(mockInput);
});
//# sourceMappingURL=../../src/lib/__test__/context-manager.test.js.map