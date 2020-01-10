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
const fs = require('fs-extra');
const { getProjectConfig } = require('./get-project-config');
const { showResourceTable } = require('./resource-status');
const { onCategoryOutputsChange } = require('./on-category-outputs-change');
const { initializeEnv } = require('../../lib/initialize-env');
const { getProviderPlugins } = require('./get-provider-plugins');
const { getEnvInfo } = require('./get-env-info');
const { readJsonFile } = require('./read-json-file');
/*
context: Object // Required
category: String // Optional
resourceName: String // Optional
filteredResources: [{category: String, resourceName: String}] // Optional
*/
function pushResources(context, category, resourceName, filteredResources) {
    return __awaiter(this, void 0, void 0, function* () {
        if (context.parameters.options.env) {
            const envName = context.parameters.options.env;
            const allEnvs = context.amplify.getAllEnvs(context);
            if (allEnvs.findIndex(env => env === envName) !== -1) {
                context.exeInfo = {};
                context.exeInfo.forcePush = false;
                const projectConfigFilePath = context.amplify.pathManager.getProjectConfigFilePath();
                if (fs.existsSync(projectConfigFilePath)) {
                    context.exeInfo.projectConfig = readJsonFile(projectConfigFilePath);
                }
                context.exeInfo.localEnvInfo = getEnvInfo();
                if (context.exeInfo.localEnvInfo.envName !== envName) {
                    context.exeInfo.localEnvInfo.envName = envName;
                    const jsonString = JSON.stringify(context.exeInfo.localEnvInfo, null, 4);
                    const localEnvFilePath = context.amplify.pathManager.getLocalEnvFilePath(context.exeInfo.localEnvInfo.projectPath);
                    fs.writeFileSync(localEnvFilePath, jsonString, 'utf8');
                }
                yield initializeEnv(context);
            }
            else {
                context.print.error("Environment doesn't exist. Please use 'amplify init' to create a new environment");
                process.exit(1);
            }
        }
        const hasChanges = yield showResourceTable(category, resourceName, filteredResources);
        // no changes detected
        if (!hasChanges && !context.exeInfo.forcePush) {
            context.print.info('\nNo changes detected');
            return context;
        }
        let continueToPush = context.exeInfo && context.exeInfo.inputParams && context.exeInfo.inputParams.yes;
        if (!continueToPush) {
            continueToPush = yield context.amplify.confirmPrompt.run('Are you sure you want to continue?');
        }
        if (continueToPush) {
            try {
                // Get current-cloud-backend's amplify-meta
                const currentAmplifyMetaFilePath = context.amplify.pathManager.getCurrentAmplifyMetaFilePath();
                const currentAmplifyMeta = readJsonFile(currentAmplifyMetaFilePath);
                yield providersPush(context, category, resourceName, filteredResources);
                yield onCategoryOutputsChange(context, currentAmplifyMeta);
            }
            catch (err) {
                // Handle the errors and print them nicely for the user.
                context.print.error(`\n${err.message}`);
                throw err;
            }
        }
        return continueToPush;
    });
}
function providersPush(context, category, resourceName, filteredResources) {
    return __awaiter(this, void 0, void 0, function* () {
        const { providers } = getProjectConfig();
        const providerPlugins = getProviderPlugins(context);
        const providerPromises = [];
        for (let i = 0; i < providers.length; i += 1) {
            const providerModule = require(providerPlugins[providers[i]]);
            const resourceDefiniton = yield context.amplify.getResourceStatus(category, resourceName, providers[i], filteredResources);
            providerPromises.push(providerModule.pushResources(context, resourceDefiniton));
        }
        yield Promise.all(providerPromises);
    });
}
function storeCurrentCloudBackend(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { providers } = getProjectConfig();
        const providerPlugins = getProviderPlugins(context);
        const providerPromises = [];
        for (let i = 0; i < providers.length; i += 1) {
            const providerModule = require(providerPlugins[providers[i]]);
            providerPromises.push(providerModule.storeCurrentCloudBackend(context));
        }
        yield Promise.all(providerPromises);
    });
}
module.exports = {
    pushResources,
    storeCurrentCloudBackend,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/push-resources.js.map