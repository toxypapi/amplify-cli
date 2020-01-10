"use strict";
function getFrontendPlugins(context) {
    const frontendPlugins = {};
    context.runtime.plugins.forEach(plugin => {
        if (plugin.pluginType === 'frontend') {
            frontendPlugins[plugin.pluginName] = plugin.directory;
        }
    });
    return frontendPlugins;
}
module.exports = {
    getFrontendPlugins,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-frontend-plugins.js.map