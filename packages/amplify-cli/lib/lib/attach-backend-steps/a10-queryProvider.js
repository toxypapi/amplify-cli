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
const { getProviderPlugins } = require('../../extensions/amplify-helpers/get-provider-plugins');
const { normalizeProviderName } = require('../input-params-manager');
function run(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const providerPlugins = getProviderPlugins(context);
        const provider = yield getProvider(context, providerPlugins);
        context.exeInfo.projectConfig.providers = [provider];
        const providerModule = require(providerPlugins[provider]);
        yield providerModule.attachBackend(context);
        return context;
    });
}
function getProvider(context, providerPlugins) {
    return __awaiter(this, void 0, void 0, function* () {
        let result;
        const providers = [];
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
                result = providerPluginList[0]; // eslint-disable-line
            }
            else {
                const selectProvider = {
                    type: 'list',
                    name: 'selectedProvider',
                    message: 'Select the backend provider.',
                    choices: providerPluginList,
                    default: providerPluginList[0],
                };
                const answer = yield inquirer.prompt(selectProvider);
                result = answer.selectedProvider;
            }
        }
        else if (providers.length === 1) {
            result = providers[0]; // eslint-disable-line
        }
        else {
            const selectProvider = {
                type: 'list',
                name: 'selectedProvider',
                message: 'Select the backend provider.',
                choices: providers,
                default: providers[0],
            };
            const answer = yield inquirer.prompt(selectProvider);
            result = answer.selectedProvider;
        }
        return result;
    });
}
module.exports = {
    run,
};
//# sourceMappingURL=../../../src/lib/lib/attach-backend-steps/a10-queryProvider.js.map