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
        const { providers: currentProviders } = context.exeInfo.projectConfig;
        const selectedProviders = yield configureProviders(context, providerPlugins, currentProviders);
        const configTasks = [];
        const initializationTasks = [];
        const onInitSuccessfulTasks = [];
        selectedProviders.forEach(provider => {
            const providerModule = require(providerPlugins[provider]);
            if (currentProviders.includes(provider)) {
                configTasks.push(() => providerModule.configure(context));
            }
            else {
                initializationTasks.push(() => providerModule.init(context));
                onInitSuccessfulTasks.push(() => providerModule.onInitSuccessful(context));
            }
        });
        yield sequential(configTasks);
        yield sequential(initializationTasks);
        yield sequential(onInitSuccessfulTasks);
        return context;
    });
}
function configureProviders(context, providerPlugins, currentProviders) {
    return __awaiter(this, void 0, void 0, function* () {
        let providers = [];
        const providerPluginList = Object.keys(providerPlugins);
        const { inputParams } = context.exeInfo;
        if (inputParams.amplify.providers) {
            inputParams.amplify.providers.forEach(provider => {
                provider = normalizeProviderName(provider, providerPluginList);
                if (provider) {
                    providers.push(provider);
                }
            });
        }
        if (providers.length === 0) {
            if (inputParams.yes || providerPluginList.length === 1) {
                context.print.info(`Using default provider  ${providerPluginList[0]}`);
                providers.push(providerPluginList[0]);
            }
            else {
                const selectProviders = {
                    type: 'checkbox',
                    name: 'selectedProviders',
                    message: 'Select the backend providers.',
                    choices: providerPluginList,
                    default: currentProviders,
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
//# sourceMappingURL=../../../src/lib/lib/config-steps/c2-configProviders.js.map