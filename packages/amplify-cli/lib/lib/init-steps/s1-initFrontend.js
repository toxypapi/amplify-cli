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
        if (!context.exeInfo.isNewProject) {
            const currentProjectConfig = context.amplify.getProjectConfig();
            Object.assign(currentProjectConfig, context.exeInfo.projectConfig);
            context.exeInfo.projectConfig = currentProjectConfig;
            return context;
        }
        const frontendPlugins = getFrontendPlugins(context);
        let suitableFrontend;
        let fitToHandleScore = -1;
        Object.keys(frontendPlugins).forEach(key => {
            const { scanProject } = require(frontendPlugins[key]);
            const newScore = scanProject(context.exeInfo.localEnvInfo.projectPath);
            if (newScore > fitToHandleScore) {
                fitToHandleScore = newScore;
                suitableFrontend = key;
            }
        });
        const frontend = yield getFrontendHandler(context, frontendPlugins, suitableFrontend);
        context.exeInfo.projectConfig.frontend = frontend;
        const frontendModule = require(frontendPlugins[frontend]);
        yield frontendModule.init(context);
        return context;
    });
}
function getFrontendHandler(context, frontendPlugins, suitableFrontend) {
    return __awaiter(this, void 0, void 0, function* () {
        let frontend;
        const frontendPluginList = Object.keys(frontendPlugins);
        const { inputParams } = context.exeInfo;
        if (inputParams && inputParams.amplify.frontend) {
            frontend = normalizeFrontendHandlerName(inputParams.amplify.frontend, frontendPluginList);
        }
        if (!frontend && inputParams && inputParams.yes) {
            frontend = 'javascript';
        }
        if (!frontend) {
            const selectFrontendHandler = {
                type: 'list',
                name: 'selectedFrontendHandler',
                message: "Choose the type of app that you're building",
                choices: frontendPluginList,
                default: suitableFrontend,
            };
            const answer = yield inquirer.prompt(selectFrontendHandler);
            frontend = answer.selectedFrontendHandler;
        }
        return frontend;
    });
}
module.exports = {
    run,
};
//# sourceMappingURL=../../../src/lib/lib/init-steps/s1-initFrontend.js.map