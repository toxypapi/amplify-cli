"use strict";
function getCategoryPlugins(context) {
    const categoryPlugins = {};
    context.runtime.plugins.forEach(plugin => {
        if (plugin.pluginType === 'category') {
            categoryPlugins[plugin.pluginName] = plugin.directory;
        }
    });
    return categoryPlugins;
}
module.exports = {
    getCategoryPlugins,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-category-plugins.js.map