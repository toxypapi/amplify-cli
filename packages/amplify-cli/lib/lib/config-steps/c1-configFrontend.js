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
const { getFrontendPlugins } = require('../../extensions/amplify-helpers/get-frontend-plugins');
const { normalizeFrontendHandlerName } = require('../input-params-manager');
function run(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const frontendPlugins = getFrontendPlugins(context);
        const { frontend } = context.exeInfo.projectConfig;
        const selectedFrontend = yield selectFrontendHandler(context, frontendPlugins, frontend);
        if (selectedFrontend !== frontend) {
            delete context.exeInfo.projectConfig[frontend];
            const frontendModule = require(frontendPlugins[selectedFrontend]);
            yield frontendModule.init(context);
            context.exeInfo.projectConfig.frontend = selectedFrontend;
        }
        else {
            const frontendModule = require(frontendPlugins[selectedFrontend]);
            yield frontendModule.configure(context);
        }
        return context;
    });
}
function selectFrontendHandler(context, frontendPlugins, currentFrontend) {
    return __awaiter(this, void 0, void 0, function* () {
        let frontend;
        const frontendPluginList = Object.keys(frontendPlugins);
        const { inputParams } = context.exeInfo;
        if (inputParams.amplify.frontend) {
            frontend = normalizeFrontendHandlerName(inputParams.amplify.frontend, frontendPluginList);
        }
        if (!frontend && inputParams.yes) {
            frontend = 'javascript';
        }
        if (!frontend) {
            const selectFrontend = {
                type: 'list',
                name: 'selectedFrontend',
                message: "Choose the type of app that you're building",
                choices: Object.keys(frontendPlugins),
                default: currentFrontend,
            };
            const answer = yield inquirer.prompt(selectFrontend);
            frontend = answer.selectedFrontend;
        }
        return frontend;
    });
}
module.exports = {
    run,
};
//# sourceMappingURL=../../../src/lib/lib/config-steps/c1-configFrontend.js.map