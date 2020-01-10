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
const inquirer = require('inquirer');
const sequential = require('promise-sequential');
const { getProviderPlugins } = require('../../extensions/amplify-helpers/get-provider-plugins');
const { normalizeProviderName } = require('../input-params-manager');
function run(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const providerPlugins = getProviderPlugins(context);
        const providers = yield getProviders(context, providerPlugins);
        context.exeInfo.projectConfig.providers = providers;
        const initializationTasks = [];
        providers.forEach(provider => {
            const providerModule = require(providerPlugins[provider]);
            initializationTasks.push(() => providerModule.init(context));
        });
        yield sequential(initializationTasks);
        return context;
    });
}
function getProviders(context, providerPlugins) {
    return __awaiter(this, void 0, void 0, function* () {
        let providers = [];
        const providerPluginList = Object.keys(providerPlugins);
        if (providerPluginList.length === 0) {
            const errorMessage = 'Found no provider plugins';
            context.print.error(errorMessage);
            context.print.info("Run 'amplify plugin scan' to scan your system for provider plugins.");
            throw new Error(errorMessage);
        }
        const { inputParams } = context.exeInfo;
        if (inputParams && inputParams.amplify && inputParams.amplify.providers) {
            inputParams.amplify.providers.forEach(provider => {
                provider = normalizeProviderName(provider, providerPluginList);
                if (provider) {
                    providers.push(provider);
                }
            });
        }
        if (providers.length === 0) {
            if ((inputParams && inputParams.yes) || providerPluginList.length === 1) {
                context.print.info(`Using default provider  ${providerPluginList[0]}`);
                providers.push(providerPluginList[0]);
            }
            else {
                const selectProviders = {
                    type: 'checkbox',
                    name: 'selectedProviders',
                    message: 'Select the backend providers.',
                    choices: providerPluginList,
                    default: providerPluginList[0],
                };
                const answer = yield inquirer.prompt(selectProviders);
                providers = answer.selectedProviders;
            }
        }
        return providers;
    });
}
module.exports = {
    run,
};
//# sourceMappingURL=../../../src/lib/lib/init-steps/s2-initProviders.js.map