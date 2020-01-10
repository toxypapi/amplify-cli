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
const sequential = require('promise-sequential');
const { initializeEnv } = require('../../lib/initialize-env');
const { getProviderPlugins } = require('../../extensions/amplify-helpers/get-provider-plugins');
const { getEnvInfo } = require('../../extensions/amplify-helpers/get-env-info');
module.exports = {
    name: 'checkout',
    run: (context) => __awaiter(void 0, void 0, void 0, function* () {
        const envName = context.parameters.first;
        // Check if environment exists
        const allEnvs = context.amplify.getEnvDetails();
        if (!envName || !allEnvs[envName]) {
            context.print.error('Please pass in a valid environment name. Run amplify env list to get a list of valid environments');
            return;
        }
        // Set the current env to the environment name provided
        const localEnvFilePath = context.amplify.pathManager.getLocalEnvFilePath();
        const localEnvInfo = getEnvInfo();
        localEnvInfo.envName = envName;
        const jsonString = JSON.stringify(localEnvInfo, null, 4);
        fs.writeFileSync(localEnvFilePath, jsonString, 'utf8');
        // Setup exeinfo
        context.amplify.constructExeInfo(context);
        context.exeInfo.forcePush = false;
        context.exeInfo.isNewEnv = false;
        context.exeInfo.restoreBackend = context.parameters.options.restore;
        // Setup Provider creds/info
        const initializationTasks = [];
        const providerPlugins = getProviderPlugins(context);
        context.exeInfo.projectConfig.providers.forEach(provider => {
            const providerModule = require(providerPlugins[provider]);
            initializationTasks.push(() => providerModule.init(context, allEnvs[envName][provider]));
        });
        yield sequential(initializationTasks);
        const onInitSuccessfulTasks = [];
        context.exeInfo.projectConfig.providers.forEach(provider => {
            const providerModule = require(providerPlugins[provider]);
            onInitSuccessfulTasks.push(() => providerModule.onInitSuccessful(context, allEnvs[envName][provider]));
        });
        yield sequential(onInitSuccessfulTasks);
        // Initialize the environment
        yield initializeEnv(context);
    }),
};
//# sourceMappingURL=../../../src/lib/commands/env/checkout.js.map