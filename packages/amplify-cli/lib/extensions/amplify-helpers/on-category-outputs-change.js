"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fs = require('fs');
const path = require('path');
const pathManager = require('./path-manager');
const { getResourceOutputs } = require('./get-resource-outputs');
const { readJsonFile } = require('./read-json-file');
const sequential = require('promise-sequential');
function onCategoryOutputsChange(context, cloudAmplifyMeta, localMeta) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!cloudAmplifyMeta) {
            const currentAmplifyMetafilePath = context.amplify.pathManager.getCurrentAmplifyMetaFilePath();
            if (fs.existsSync(currentAmplifyMetafilePath)) {
                cloudAmplifyMeta = readJsonFile(currentAmplifyMetafilePath);
            }
            else {
                cloudAmplifyMeta = {};
            }
        }
        const projectConfigFilePath = pathManager.getProjectConfigFilePath();
        const projectConfig = readJsonFile(projectConfigFilePath);
        if (projectConfig.frontend) {
            const frontendPlugins = context.amplify.getFrontendPlugins(context);
            const frontendHandlerModule = require(frontendPlugins[projectConfig.frontend]);
            yield frontendHandlerModule.createFrontendConfigs(context, getResourceOutputs(localMeta), getResourceOutputs(cloudAmplifyMeta));
        }
        const outputChangedEventTasks = [];
        const categoryPlugins = context.amplify.getCategoryPlugins(context);
        Object.keys(categoryPlugins).forEach(pluginName => {
            const packageLocation = categoryPlugins[pluginName];
            const pluginModule = require(packageLocation);
            if (pluginModule && typeof pluginModule.onAmplifyCategoryOutputChange === 'function') {
                outputChangedEventTasks.push(() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        attachContextExtensions(context, packageLocation);
                        yield pluginModule.onAmplifyCategoryOutputChange(context, cloudAmplifyMeta);
                    }
                    catch (e) {
                        // do nothing
                    }
                }));
            }
        });
        if (outputChangedEventTasks.length > 0) {
            yield sequential(outputChangedEventTasks);
        }
    });
}
function attachContextExtensions(context, packageLocation) {
    const extensionsDirPath = path.normalize(path.join(packageLocation, 'extensions'));
    if (fs.existsSync(extensionsDirPath)) {
        const stats = fs.statSync(extensionsDirPath);
        if (stats.isDirectory()) {
            const itemNames = fs.readdirSync(extensionsDirPath);
            itemNames.forEach(itemName => {
                const itemPath = path.join(extensionsDirPath, itemName);
                let itemModule;
                try {
                    itemModule = require(itemPath);
                    itemModule(context);
                }
                catch (e) {
                    // do nothing
                }
            });
        }
    }
}
module.exports = {
    onCategoryOutputsChange,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/on-category-outputs-change.js.map