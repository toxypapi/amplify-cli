"use strict";
function getProviderPlugins(context) {
    const providers = {};
    context.runtime.plugins.forEach(plugin => {
        if (plugin.pluginType === 'provider') {
            providers[plugin.pluginName] = plugin.directory;
        }
    });
    return providers;
}
module.exports = {
    getProviderPlugins,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-provider-plugins.js.map